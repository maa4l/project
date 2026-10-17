from pydantic import BaseModel
from datetime import datetime
from .models import AnimalStatus, UserRole, ApplicationStatus 

class AnimalBase(BaseModel):
    name: str
    species: str
    breed: str | None = None
    description: str | None = None

class AnimalCreate(AnimalBase):
    pass # При создании мы передаем только базовые поля

class AnimalResponse(AnimalBase):
    id: int
    status: AnimalStatus
    created_at: datetime

    class Config:
        from_attributes = True

class AnimalUpdate(BaseModel):
    name: str | None = None
    species: str | None = None
    breed: str | None = None
    description: str | None = None
    status: AnimalStatus | None = None

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: UserRole

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ApplicationCreate(BaseModel):
    animal_id: int

class ApplicationResponse(BaseModel):
    id: int
    client_id: int
    animal_id: int
    status: ApplicationStatus
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus