from contextlib import asynccontextmanager
import aiohttp
from fastapi import FastAPI, HTTPException
import uvicorn
import async_db
from util import exchange_code, get_token_info, verify_token
from models import *
import traceback

token_cache = {}
session = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global session, db
    session = aiohttp.ClientSession()
    await async_db.init()
    yield
    await session.close()

app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Hello from Sail Wrapped 2024!"}


@app.post("/login")
async def login(request: TokenRequestModel):
    try:
        res = await exchange_code(session, request.code)
        access_token = res["access_token"]
        refresh_token = res["refresh_token"]
        info = await get_token_info(session, access_token)
    except aiohttp.ClientResponseError:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail="Invalid code or info")
    
    if not await verify_token(session, access_token):
        raise HTTPException(status_code=403, detail="You are not part of the Sail discord server!")

    token_cache[access_token] = info["user"]["id"]
    return TokenResponseModel(access_token=access_token, refresh_token=refresh_token, user_info=info["user"])

@app.get("/attachment/random")
async def get_random_attachment(video_only: bool = False):
    return await async_db.get_random_attachment(video_only)


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000)