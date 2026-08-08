"""
Конфигурация приложения через pydantic-settings.
Читает переменные из .env файла.
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    # Токен бота
    BOT_TOKEN: str

    # Список ID администраторов (через запятую в .env)
    ADMIN_IDS: List[int] = []

    # URL базы данных
    DATABASE_URL: str = "sqlite+aiosqlite:///./bot.db"

    # Канал для обязательной подписки
    REQUIRED_CHANNEL: str = "@obunahub"
    CHANNEL_URL: str = "https://t.me/obunahub"

    # Количество товаров на странице в списках
    PRODUCTS_PER_PAGE: int = 5

    # Порог низкого остатка для предупреждения
    LOW_STOCK_THRESHOLD: int = 5

    # Количество последних событий в ленте активности
    ACTIVITY_FEED_SIZE: int = 20

    @field_validator("ADMIN_IDS", mode="before")
    @classmethod
    def parse_admin_ids(cls, v):
        """Парсим ADMIN_IDS из строки '123,456' или одного числа в список int"""
        if isinstance(v, str):
            return [int(x.strip()) for x in v.split(",") if x.strip()]
        if isinstance(v, int):
            return [v]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Единственный экземпляр настроек
settings = Settings()
