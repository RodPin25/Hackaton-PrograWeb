from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from typing import Any
from sqlalchemy import text
from app.config import settings

# Convertir la URL si contiene +asyncpg para que el engine síncrono use el driver estándar (psycopg2 / psycopg)
db_url = settings.DATABASE_URL2
if "postgresql+asyncpg://" in db_url:
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)

