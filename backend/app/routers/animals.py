from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from ..schemas import AnimalCreate, AnimalResponse, AnimalUpdate
from ..auth import get_current_admin

router = APIRouter(prefix="/animals", tags=["Animals"])

@router.post("/", response_model=AnimalResponse)
def create_animal(animal: AnimalCreate, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    new_animal = models.Animal(**animal.model_dump())
    db.add(new_animal)
    db.commit()
    db.refresh(new_animal)
    return new_animal

@router.get("/", response_model=list[AnimalResponse])
def get_animals(db: Session = Depends(get_db)):
    return db.query(models.Animal).all() # Читать могут все, без токена

@router.put("/{animal_id}", response_model=AnimalResponse)
def update_animal(animal_id: int, animal_data: AnimalUpdate, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    animal = db.query(models.Animal).filter(models.Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Животное не найдено")
    for key, value in animal_data.model_dump(exclude_unset=True).items():
        setattr(animal, key, value)
    db.commit()
    db.refresh(animal)
    return animal

@router.delete("/{animal_id}")
def delete_animal(animal_id: int, db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    animal = db.query(models.Animal).filter(models.Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Животное не найдено")
    db.delete(animal)
    db.commit()
    return {"message": f"Животное с ID {animal_id} успешно удалено"}