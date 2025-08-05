# reminders.py - Reminder-related endpoints will be defined here.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.schemas import Reminder, ReminderCreate, ReminderHistory, ReminderHistoryCreate
from app.services.compliance import get_db
from app.services.generator import send_email
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import json

router = APIRouter()
scheduler = BackgroundScheduler()
scheduler.start()

EMAIL_SUBJECT = "Chainfly Tender Reminder"
EMAIL_BODY_TEMPLATE = "This is a reminder for tender {tender_id} ({reminder_type}). Due date: {due_date}."

# --- Use the old, working scheduling logic ---
def schedule_reminder_email(reminder: Reminder, interval: int, unit: str = 'days'):
    if unit == 'minutes':
        send_time = datetime.datetime.now() + datetime.timedelta(minutes=interval)
    else:
        send_time = reminder.due_date - datetime.timedelta(days=interval)
    if send_time > datetime.datetime.now():
        scheduler.add_job(
            send_email,
            'date',
            run_date=send_time,
            args=[reminder.email, EMAIL_SUBJECT, EMAIL_BODY_TEMPLATE.format(
                tender_id=reminder.tender_id,
                reminder_type=reminder.reminder_type,
                due_date=reminder.due_date.strftime('%Y-%m-%d %H:%M')
            )]
        )

@router.post("/set")
def set_reminder(reminder: ReminderCreate, db: Session = Depends(get_db), test: bool = False):
    db_reminder = Reminder(
        tender_id=reminder.tender_id,
        reminder_type=reminder.reminder_type,
        due_date=reminder.due_date,
        email=reminder.email
    )
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)

    # For testing, use minutes; for production, use days
    if test:
        intervals = [1, 2, 3]  # minutes
        unit = 'minutes'
    else:
        intervals = [15, 6, 1]  # days
        unit = 'days'
    for interval in intervals:
        schedule_reminder_email(db_reminder, interval, unit)

    return {"status": "success", "message": f"Reminder set for {reminder.due_date}", "email": reminder.email, "test_mode": test}

# --- Keep all the new features below (history, list, delete, etc.) ---

@router.get("/list")
def get_all_reminders(db: Session = Depends(get_db)):
    try:
        reminders = db.query(Reminder).order_by(Reminder.due_date.desc()).all()
        reminder_list = []
        for reminder in reminders:
            reminder_list.append({
                "id": str(reminder.id),
                "tender_id": reminder.tender_id,
                "reminder_type": reminder.reminder_type,
                "due_date": reminder.due_date.isoformat(),
                "email": reminder.email,
                "status": "pending",
                "created_at": reminder.due_date.isoformat()
            })
        return {"reminders": reminder_list}
    except Exception as e:
        print(f"Error getting reminders: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/history")
def add_reminder_history(history: ReminderHistoryCreate, db: Session = Depends(get_db)):
    try:
        db_history = ReminderHistory(
            reminder_id=history.reminder_id,
            action=history.action,
            timestamp=history.timestamp,
            details_json=json.dumps(history.details)
        )
        db.add(db_history)
        db.commit()
        db.refresh(db_history)
        return {"status": "success", "message": "Reminder history added"}
    except Exception as e:
        db.rollback()
        print(f"Error adding reminder history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_reminder_history(db: Session = Depends(get_db)):
    try:
        history_records = db.query(ReminderHistory).order_by(ReminderHistory.timestamp.desc()).all()
        history_list = []
        for record in history_records:
            try:
                details = json.loads(record.details_json)
            except json.JSONDecodeError:
                details = {}
            history_list.append({
                "id": str(record.id),
                "reminder_id": record.reminder_id,
                "action": record.action,
                "timestamp": record.timestamp.isoformat(),
                "details": details
            })
        return {"history": history_list}
    except Exception as e:
        print(f"Error getting reminder history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history")
def clear_reminder_history(db: Session = Depends(get_db)):
    try:
        db.query(ReminderHistory).delete()
        db.commit()
        return {"status": "success", "message": "Reminder history cleared"}
    except Exception as e:
        db.rollback()
        print(f"Error clearing reminder history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{reminder_id}")
def delete_reminder(reminder_id: int, db: Session = Depends(get_db)):
    try:
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id).first()
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found")
        db.delete(reminder)
        db.commit()
        return {"status": "success", "message": "Reminder deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting reminder: {e}")
        raise HTTPException(status_code=500, detail=str(e))
