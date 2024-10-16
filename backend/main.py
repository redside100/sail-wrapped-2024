from contextlib import asynccontextmanager
import time
from typing import Annotated
import aiohttp
from fastapi import FastAPI, HTTPException, Header, Path
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import async_db
from util import (
    check_token,
    exchange_code,
    get_token_info,
    refresh_token,
    revoke_access_token,
    verify_token,
)
from models import *
import traceback
from cachetools import TTLCache

token_cache = TTLCache(ttl=86400 * 7, maxsize=float("inf"))
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello from Sail Wrapped 2024!"}


################## AUTH #################
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
        raise HTTPException(
            status_code=403, detail="You are not part of the Sail discord server!"
        )

    token_cache[access_token] = info["user"]["id"]
    exp = int(time.time() + res["expires_in"])
    return TokenResponseModel(
        access_token=access_token,
        refresh_token=refresh_token,
        user_info=info["user"],
        exp=exp,
    )


@app.post("/refresh")
async def refresh(
    request: RefreshTokenRequestModel, token: Annotated[str | None, Header()] = None
):
    check_token(token_cache, token)
    try:
        res = await refresh_token(session, request.refresh_token)
        new_access_token = res["access_token"]
        info = await get_token_info(session, new_access_token)
        new_refresh_token = res["refresh_token"]

    except aiohttp.ClientResponseError:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail="Invalid refresh token")

    del token_cache[token]
    token_cache[new_access_token] = info["user"]["id"]
    exp = int(time.time() + res["expires_in"])

    return TokenResponseModel(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user_info=info["user"],
        exp=exp,
    )


@app.post("/logout")
async def logout(token: Annotated[str | None, Header()] = None):
    if token in token_cache:
        del token_cache[token]

    try:
        await revoke_access_token(session, token)
    except:
        pass

    return {"message": "Success"}


###################################


@app.get("/info")
async def user_info(token: Annotated[str | None, Header()] = None):
    check_token(token_cache, token)
    try:
        res = await get_token_info(session, token)
        return res["user"]
    except aiohttp.ClientResponseError:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="There was an issue retrieving your user information.",
        )


@app.get("/attachment/random")
async def get_random_attachment(
    video_only: bool = False, token: Annotated[str | None, Header()] = None
):
    check_token(token_cache, token)
    return await async_db.get_random_attachment(video_only)


@app.get("/attachment/view/{attachment_id}")
async def get_attachment(
    attachment_id: Annotated[int, Path(title="The Attachment ID to retrieve")],
    token: Annotated[str | None, Header()] = None,
):

    check_token(token_cache, token)
    attachment = await async_db.get_attachment(attachment_id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return attachment


@app.get("/message/random")
async def get_random_message(
    min_length: int,
    token: Annotated[str | None, Header()] = None,
):
    check_token(token_cache, token)
    if min_length < 1:
        raise HTTPException(
            status_code=400, detail="The minimum length must be at least 1."
        )

    message = await async_db.get_random_message(min_length=min_length)
    if not message:
        raise HTTPException(
            status_code=404, detail="There are no messages with that minimum length."
        )
    return message


@app.get("/message/view/{message_id}")
async def get_message(
    message_id: Annotated[int, Path(title="The Messaged ID to retrieve")],
    token: Annotated[str | None, Header()] = None,
):
    check_token(token_cache, token)
    message = await async_db.get_message(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@app.get("/likes")
async def get_user_likes(token: Annotated[str | None, Header()] = None):
    check_token(token_cache, token)
    return await async_db.get_likes_for_user(token_cache[token])


@app.post("/like")
async def like(
    request: LikeRequestModel, token: Annotated[str | None, Header()] = None
):
    check_token(token_cache, token)
    discord_id = token_cache[token]
    await async_db.like(request.id, discord_id, request.is_attachment)
    return {"message": "Success"}


@app.post("/unlike")
async def like(
    request: LikeRequestModel, token: Annotated[str | None, Header()] = None
):
    check_token(token_cache, token)
    discord_id = token_cache[token]
    await async_db.unlike(request.id, discord_id, request.is_attachment)
    return {"message": "Success"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
