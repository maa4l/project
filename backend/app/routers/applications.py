from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user, get_current_admin

router = APIRouter(prefix="/applications", tags=["Applications"])

# 1. CREATE - Клиент подает заявку
@router.post("/", response_model=schemas.ApplicationResponse)
def create_application(
    app_data: schemas.ApplicationCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Проверяем, существует ли животное и доступно ли оно
    animal = db.query(models.Animal).filter(models.Animal.id == app_data.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Животное не найдено")
    if animal.status != models.AnimalStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Это животное уже зарезервировано или усыновлено")

    # Создаем заявку
    new_app = models.AdoptionApplication(
        client_id=current_user.id,
        animal_id=animal.id
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

# 2. READ - Клиент смотрит СВОИ заявки
@router.get("/my", response_model=list[schemas.ApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.AdoptionApplication).filter(
        models.AdoptionApplication.client_id == current_user.id
    ).all()

# 3. READ (Admin) - Админ смотрит ВСЕ заявки
@router.get("/", response_model=list[schemas.ApplicationResponse])
def get_all_applications(
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    return db.query(models.AdoptionApplication).all()

# 4. UPDATE (Client) - Отмена своей заявки
@router.delete("/{app_id}")
def cancel_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    application = db.query(models.AdoptionApplication).filter(models.AdoptionApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    
    # Проверяем, что это заявка именно этого клиента (или админ)
    if application.client_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Вы можете отменять только свои заявки")
        
    db.delete(application)
    db.commit()
    return {"message": "Заявка отменена и удалена"}

# 5. UPDATE (Admin) - Одобрить или отклонить заявку
@router.patch("/{app_id}/status", response_model=schemas.ApplicationResponse)
def update_application_status(
    app_id: int,
    status_data: schemas.ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin)
):
    application = db.query(models.AdoptionApplication).filter(models.AdoptionApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Заявка не найдена")

    application.status = status_data.status

    # Бизнес-логика: если одобряем, то меняем статус животного на RESERVED
    if status_data.status == models.ApplicationStatus.APPROVED:
        animal = db.query(models.Animal).filter(models.Animal.id == application.animal_id).first()
        if animal:
            animal.status = models.AnimalStatus.RESERVED

    db.commit()
    db.refresh(application)
    return application