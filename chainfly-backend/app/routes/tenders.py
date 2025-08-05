# tenders.py - Tender-related endpoints will be defined here.

from fastapi import APIRouter

router = APIRouter()

@router.get("/search")
async def search_tenders():
    return {"message": "Tenders search working!"}
