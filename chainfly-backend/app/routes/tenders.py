# tenders.py - Tender-related endpoints will be defined here.

from fastapi import APIRouter
from app.services.mongodb import get_mongo_db

router = APIRouter()

@router.get("/search")
async def search_tenders():
	return {"message": "Tenders search working!"}

@router.get("/mongo-sample")
async def mongo_sample():
	# Demonstrate a simple list collections call (does not require existing data)
	db = get_mongo_db()
	collections = await db.list_collection_names()
	return {"status": "ok", "collections": collections}
