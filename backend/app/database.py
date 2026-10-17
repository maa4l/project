import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@db:5432/shelter",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Базовый класс для всех ORM-моделей."""


def get_db():
    """FastAPI-зависимость: выдаёт сессию БД и закрывает её после ответа."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()