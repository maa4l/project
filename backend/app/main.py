from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, get_db, SessionLocal
from . import models, auth
from .routers import animals, auth as auth_router, applications

app = FastAPI(title="Animal Shelter API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    
    # Создаем тестового админа, если его еще нет
    db = SessionLocal()
    admin_email = "admin@example.com"
    admin = db.query(models.User).filter(models.User.email == admin_email).first()
    if not admin:
        new_admin = models.User(
            email=admin_email,
            password_hash=auth.get_password_hash("admin123"),
            role=models.UserRole.ADMIN
        )
        db.add(new_admin)
        db.commit()
        print("Тестовый Админ создан: admin@example.com / admin123")
    db.close()

app.include_router(auth_router.router)
app.include_router(animals.router)
app.include_router(applications.router)  

@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "service": "animal-shelter-api"}