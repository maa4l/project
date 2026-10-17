# Animal Shelter API

Учебный проект: веб-сервис приюта для животных.
Клиенты просматривают картотеку и подают заявки на адопцию,
администратор ведёт картотеку и обрабатывает заявки.

## Стек
- **Backend:** FastAPI, SQLAlchemy
- **DB:** PostgreSQL 16
- **Frontend:** React (добавим позже)
- **Инфраструктура:** Docker, Docker Compose

## Роли
- `Client` — просмотр животных, подача и управление своими заявками
- `Admin` — CRUD по животным, обработка заявок

## Запуск
Для запуска проекта достаточно выполнить команду в корневой папке:

docker compose up --build

После запуска доступны:
- **API docs (Swagger):** http://localhost:8000/docs
- **Health check:** http://localhost:8000/health