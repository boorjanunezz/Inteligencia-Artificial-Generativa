import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)


def scrape_jobs_for_user(
    target_roles: list[str],
    target_locations: list[str],
) -> list[dict]:
    """
    Scrapes job offers from multiple sources with full fallback resilience.
    Returns a deduplicated list of normalized job dicts.
    Each source failure is logged but never crashes the function.
    """
    all_jobs: list[dict] = []

    # Limit to first 3 roles and first 2 locations to avoid rate limiting
    roles = target_roles[:3]
    location = target_locations[0] if target_locations else "Spain"

    for role in roles:
        # Try jobspy (covers LinkedIn, Indeed, Glassdoor simultaneously)
        jobs = _try_jobspy(role, location)
        all_jobs.extend(jobs)

        # If jobspy returned nothing, try direct Indeed scraping as fallback
        if not jobs:
            jobs = _try_indeed_direct(role, location)
            all_jobs.extend(jobs)

    # Deduplicate by URL
    seen: set[str] = set()
    unique: list[dict] = []
    for job in all_jobs:
        url = job.get("url", "")
        if url and url not in seen:
            seen.add(url)
            unique.append(job)

    logger.info(f"Scraped {len(unique)} unique offers for roles={roles}, location={location}")
    return unique


def _try_jobspy(role: str, location: str) -> list[dict]:
    """python-jobspy covers LinkedIn + Indeed + Glassdoor. Returns [] on any failure."""
    try:
        from jobspy import scrape_jobs  # type: ignore

        df = scrape_jobs(
            site_name=["linkedin"],
            search_term=role,
            location=location,
            results_wanted=20,
        )

        if df is None or df.empty:
            logger.info(f"jobspy: no results for '{role}' in '{location}'")
            return []

        results = []
        for _, row in df.iterrows():
            url = str(row.get("job_url") or "").strip()
            if not url or url == "nan":
                continue

            description = row.get("description")
            desc_text = str(description)[:2000] if description and str(description) != "nan" else None

            posted = row.get("date_posted")
            posted_at: Optional[datetime] = None
            if posted and str(posted) != "nan":
                try:
                    posted_at = datetime.fromisoformat(str(posted)) if isinstance(posted, str) else posted
                except Exception:
                    pass

            results.append({
                "title": _clean(row.get("title")),
                "company": _clean(row.get("company")),
                "location": _clean(row.get("location")),
                "description": desc_text,
                "url": url,
                "source": _clean(row.get("site")) or "unknown",
                "modality": _normalize_modality(row.get("job_type")),
                "salary_range": _format_salary(row),
                "posted_at": posted_at,
            })

        logger.info(f"jobspy: {len(results)} offers for '{role}'")
        return results

    except ImportError:
        logger.warning("python-jobspy not installed — skipping jobspy scraping")
        return []
    except Exception as e:
        logger.warning(f"jobspy failed for '{role}': {e}")
        return []


def _try_indeed_direct(role: str, location: str) -> list[dict]:
    """
    Lightweight fallback: scrapes Indeed search results with requests + BeautifulSoup.
    Returns [] on any failure so the main flow is never interrupted.
    """
    try:
        import requests
        from bs4 import BeautifulSoup  # type: ignore

        query = role.replace(" ", "+")
        loc = location.replace(" ", "+")
        url = f"https://es.indeed.com/jobs?q={query}&l={loc}&fromage=7"

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "es-ES,es;q=0.9",
        }

        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return []

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("div.job_seen_beacon")[:10]

        results = []
        for card in cards:
            title_el = card.select_one("h2.jobTitle span")
            company_el = card.select_one("[data-testid='company-name']")
            location_el = card.select_one("[data-testid='text-location']")
            link_el = card.select_one("h2.jobTitle a")

            title = title_el.get_text(strip=True) if title_el else None
            company = company_el.get_text(strip=True) if company_el else None
            loc_text = location_el.get_text(strip=True) if location_el else None
            href = link_el.get("href", "") if link_el else ""

            if not title or not href:
                continue

            job_url = f"https://es.indeed.com{href}" if href.startswith("/") else href

            results.append({
                "title": title,
                "company": company or "Desconocida",
                "location": loc_text,
                "description": None,
                "url": job_url,
                "source": "indeed",
                "modality": None,
                "salary_range": None,
                "posted_at": None,
            })

        logger.info(f"indeed_direct: {len(results)} offers for '{role}'")
        return results

    except ImportError:
        logger.warning("beautifulsoup4 not installed — skipping Indeed direct scraping")
        return []
    except Exception as e:
        logger.warning(f"indeed_direct failed for '{role}': {e}")
        return []


# ── Helpers ──────────────────────────────────────────────────────────────────

def _clean(value) -> Optional[str]:
    if value is None:
        return None
    s = str(value).strip()
    return None if s in ("", "nan", "None") else s


def _normalize_modality(job_type) -> Optional[str]:
    if not job_type:
        return None
    jt = str(job_type).lower()
    if any(w in jt for w in ("remote", "remoto", "teletrabajo")):
        return "remote"
    if any(w in jt for w in ("hybrid", "híbrido", "hibrido")):
        return "hybrid"
    if any(w in jt for w in ("onsite", "presencial", "office")):
        return "onsite"
    return None


def _format_salary(row) -> Optional[str]:
    min_s = row.get("min_amount")
    max_s = row.get("max_amount")
    currency = _clean(row.get("currency")) or ""
    try:
        if min_s and max_s and str(min_s) != "nan" and str(max_s) != "nan":
            return f"{int(float(min_s)):,} – {int(float(max_s)):,} {currency}".strip()
        if min_s and str(min_s) != "nan":
            return f"Desde {int(float(min_s)):,} {currency}".strip()
    except (ValueError, TypeError):
        pass
    return None
