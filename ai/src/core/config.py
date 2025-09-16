"""
Centralized application configuration.
Loads settings from environment variables and .env files using Pydantic.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database Configuration
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str

    # LLM API Keys
    GROQ_API_KEY: str

    @property
    def DATABASE_URL(self) -> str:
        """Constructs the full database URL for SQLAlchemy."""
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    @property
    def PSYCOPG2_DATABASE_URL(self) -> str:
        """Constructs the DSN for psycopg2, used for direct connections."""
        return f"dbname='{self.DB_NAME}' user='{self.DB_USER}' host='{self.DB_HOST}' password='{self.DB_PASSWORD}' port='{self.DB_PORT}'"

settings = Settings()