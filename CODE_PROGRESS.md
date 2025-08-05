# Chainfly Backend Code Progress Tracker

## Overview
This file tracks the progress of the backend development, documents key classes, their uses, and the impact of each feature added.

---

## Classes & Key Components

### 1. Reminder (SQLAlchemy Model)
- **Location:** app/models/schemas.py
- **Purpose:** Represents a reminder in the database.
- **Fields:** id, tender_id, reminder_type, due_date, email
- **Impact:** Enables persistent storage and retrieval of reminders for scheduling and email notifications.

### 2. ReminderCreate (Pydantic Schema)
- **Location:** app/models/schemas.py
- **Purpose:** Validates incoming reminder creation requests.
- **Fields:** tender_id, reminder_type, due_date, email
- **Impact:** Ensures data integrity for reminder creation.

### 3. send_email (Utility Function)
- **Location:** app/services/generator.py
- **Purpose:** Sends emails using Gmail SMTP.
- **Impact:** Allows the system to notify users about reminders via email.

### 4. APScheduler Integration
- **Location:** app/routes/reminders.py
- **Purpose:** Schedules email jobs for reminders at specified intervals.
- **Impact:** Automates the process of sending timely reminder emails to users.

### 5. Database Session & Engine
- **Location:** app/services/compliance.py
- **Purpose:** Sets up SQLite database connection and session management.
- **Impact:** Provides persistent storage for reminders and other future data models.

---

## Feature Changelog

### [v1.0.0] Initial Project Setup
- Created FastAPI app structure with routers for tenders, documents, and reminders.
- Added file upload utility and endpoint.

### [v1.1.0] Reminders with Email Scheduling
- Added Reminder model and database integration (SQLite).
- Integrated APScheduler to schedule reminder emails at 15, 6, and 1 day before due date.
- Added Gmail SMTP email sending utility.
- Added test mode for scheduling emails at short intervals (minutes).

---

## Next Steps
- Add authentication and user management.
- Implement CRUD for tenders and documents.
- Add more robust error handling and logging. 