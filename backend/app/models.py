import enum
from datetime import datetime

from sqlalchemy import String, Integer, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

class UserRole(str, enum.Enum):
    CLIENT = "client"
    ADMIN = "admin"

class AnimalStatus(str, enum.Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    ADOPTED = "adopted"

class ApplicationStatus(str, enum.Enum):
    NEW = "new"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.CLIENT)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Связь: у одного клиента может быть много заявок
    applications: Mapped[list["AdoptionApplication"]] = relationship(back_populates="client")

class Animal(Base):
    __tablename__ = "animals"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    species: Mapped[str] = mapped_column(String(50)) # кот, собака и т.д.
    breed: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[AnimalStatus] = mapped_column(Enum(AnimalStatus), default=AnimalStatus.AVAILABLE)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Связь: на одно животное может быть много заявок
    applications: Mapped[list["AdoptionApplication"]] = relationship(back_populates="animal")

class AdoptionApplication(Base):
    __tablename__ = "adoption_applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    animal_id: Mapped[int] = mapped_column(ForeignKey("animals.id"))
    status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus), default=ApplicationStatus.NEW)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Связи для удобного доступа
    client: Mapped["User"] = relationship(back_populates="applications")
    animal: Mapped["Animal"] = relationship(back_populates="applications")