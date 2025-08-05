# Chainfly Backend Project Documentation

## Project Purpose
Chainfly is a backend system for managing tenders, documents, and reminders, with automated email notifications for important deadlines.

---

## Setup Instructions

1. **Clone the repository and navigate to the project directory.**
2. **Create a virtual environment:**
   ```sh
   python -m venv .venv
   ```
3. **Activate the virtual environment:**
   - On Windows (PowerShell):
     ```sh
     .\.venv\Scripts\Activate.ps1
     ```
   - On macOS/Linux:
     ```sh
     source .venv/bin/activate
     ```
4. **Install dependencies:**
   ```sh
   pip install -r chainfly-backend/requirements.txt
   pip install python-dotenv
   ```
5. **Run the app:**
   ```sh
   uvicorn chainfly-backend/app.main:app --reload
   ```

---

## API Endpoints

### Tenders
- `GET /tenders/search` — Search tenders (test endpoint).

### Documents
- `POST /documents/upload` — Upload a document (form-data: tender_id, document_type, file).

### Reminders
- `POST /reminders/set` — Set a reminder (JSON: tender_id, reminder_type, due_date, email). Schedules email notifications at 15, 6, and 1 day before due date. Use `?test=true` for short interval testing.

---

## Email Notifications
- Uses Gmail SMTP to send reminder emails.
- Credentials are currently hardcoded for development; use environment variables for production.

---

## Database
- Uses SQLite for local development.
- Reminders are stored in `reminders.db`.

---

## Testing
- Use Postman or Swagger UI (`/docs`) to test endpoints.
- For quick email tests, set `test=true` in the reminders endpoint.

---

## Future Improvements
- Add authentication and user management.
- Implement CRUD for tenders and documents.
- Improve error handling and logging.
- Move sensitive credentials to environment variables. 