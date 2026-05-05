import logging
from apscheduler.schedulers.background import BackgroundScheduler  # type: ignore
from apscheduler.triggers.interval import IntervalTrigger  # type: ignore

logger = logging.getLogger(__name__)
_scheduler = BackgroundScheduler()


def start_scheduler():
    if _scheduler.running:
        return
    _scheduler.add_job(
        _daily_scrape_all_users,
        trigger=IntervalTrigger(hours=24),
        id="daily_job_scrape",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("Scheduler started — daily job scraping active")


def _daily_scrape_all_users():
    """Runs in a background thread: scrapes jobs for every user that has target roles set."""
    import json
    from database import SessionLocal
    from services import scraper_service
    import models

    db = SessionLocal()
    try:
        users = db.query(models.User).filter(models.User.target_roles.isnot(None)).all()
        logger.info(f"Daily scrape: processing {len(users)} users")

        for user in users:
            try:
                target_roles = json.loads(user.target_roles) if user.target_roles else []
                target_locations = json.loads(user.target_locations) if user.target_locations else ["Spain"]

                if not target_roles:
                    continue

                _scrape_and_persist(db, user.id, target_roles, target_locations)

            except Exception as e:
                logger.error(f"Daily scrape error for user {user.id}: {e}")
    finally:
        db.close()


def _scrape_and_persist(db, user_id: int, target_roles: list, target_locations: list):
    """Scrapes jobs and persists new matches for a single user (reusable from router)."""
    from services import scraper_service
    import models

    jobs = scraper_service.scrape_jobs_for_user(target_roles, target_locations)
    new_matches = 0

    for job_data in jobs:
        url = job_data.get("url", "")
        if not url:
            continue

        existing = db.query(models.JobOffer).filter_by(url=url).first()
        if not existing:
            offer = models.JobOffer(
                title=job_data["title"] or "Sin título",
                company=job_data["company"] or "Desconocida",
                location=job_data.get("location"),
                description=job_data.get("description"),
                url=url,
                source=job_data.get("source", "unknown"),
                modality=job_data.get("modality"),
                salary_range=job_data.get("salary_range"),
                posted_at=job_data.get("posted_at"),
            )
            db.add(offer)
            db.flush()
            existing = offer

        already = db.query(models.UserJobMatch).filter_by(
            user_id=user_id,
            job_offer_id=existing.id,
        ).first()

        if not already:
            db.add(models.UserJobMatch(user_id=user_id, job_offer_id=existing.id, status="new"))
            new_matches += 1

    db.commit()
    logger.info(f"Persisted {new_matches} new matches for user {user_id}")
    return new_matches
