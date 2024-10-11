from contextlib import asynccontextmanager
import aiohttp
from fastapi import FastAPI, HTTPException
from consts import CLIENT_ID, CLIENT_SECRET
from util import exchange_code, get_token_info, verify_token
from models import *
import traceback

token_cache = set()
session = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global session
    session = aiohttp.ClientSession()
    yield
    await session.close()

app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Hello from sail-wrapped-2024!"}


@app.post("/login")
async def login(request: TokenRequestModel):
    try:
        res = await exchange_code(session, request.code)
        access_token = res["access_token"]
        info = await get_token_info(session, access_token)
    except aiohttp.ClientResponseError:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail="Invalid code or info")
    
    print(info)
    # check if in sail
    if not await verify_token(session, access_token):
        raise HTTPException(status_code=403, detail="You are not part of the Sail discord server!")

    token_cache.add(access_token)
    return TokenResponseModel(access_token=access_token)
