from pydantic import BaseSettings

class Settings(BaseSettings):
    # Database
    mongodb_url: str
    database_name: str = "food_delivery_multi"

    # JWT
    jwt_secret_key: str
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "https://cordoeats.com", "https://www.cordoeats.com"]

    class Config:
        env_file = ".env"

settings = Settings()
