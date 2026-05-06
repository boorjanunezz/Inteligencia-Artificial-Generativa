from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_API_KEY: str
    AZURE_OPENAI_GPT4O_DEPLOYMENT: str = "gpt-4o"
    AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT: str = "text-embedding-ada-002"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    class Config:
        env_file = ".env"


settings = Settings()
