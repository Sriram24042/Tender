# schemas.py - Pydantic models will be defined here.

from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
import datetime
import json

Base = declarative_base()

class TenderSearchRequest(BaseModel):
    keyword: Optional[str]
    location: Optional[str]
    capacity_range: Optional[str]
    deadline: Optional[str]
    sector: Optional[str]

class ReminderRequest(BaseModel):
    tender_id: str
    reminder_type: str
    due_date: str

class Reminder(Base):
    __tablename__ = "reminders"
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(String, nullable=False)
    reminder_type = Column(String, nullable=False)
    due_date = Column(DateTime, nullable=False)
    email = Column(String, nullable=False)

class ReminderCreate(BaseModel):
    tender_id: str
    reminder_type: str
    due_date: datetime.datetime
    email: str

class DownloadHistory(Base):
    __tablename__ = "download_history"
    id = Column(Integer, primary_key=True, index=True)
    zip_name = Column(String, nullable=False)
    download_date = Column(DateTime, nullable=False)
    documents_json = Column(Text, nullable=False)  # Store documents as JSON string

class DownloadHistoryCreate(BaseModel):
    zip_name: str
    download_date: datetime.datetime
    documents: List[dict]

class ReminderHistory(Base):
    __tablename__ = "reminder_history"
    id = Column(Integer, primary_key=True, index=True)
    reminder_id = Column(String, nullable=False)
    action = Column(String, nullable=False)  # created, sent, cancelled, updated
    timestamp = Column(DateTime, nullable=False)
    details_json = Column(Text, nullable=False)  # Store details as JSON string

class ReminderHistoryCreate(BaseModel):
    reminder_id: str
    action: str
    timestamp: datetime.datetime
    details: dict
