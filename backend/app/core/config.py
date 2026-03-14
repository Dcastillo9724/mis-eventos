from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración general de la aplicación."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_name: str = "Mis Eventos API"
    app_version: str = "0.1.0"
    debug: bool = False

    # Database
    database_url: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30


settings = Settings()