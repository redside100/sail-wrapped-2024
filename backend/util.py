import aiohttp
from consts import CLIENT_ID, CLIENT_SECRET, DISCORD_API_ENDPOINT, REDIRECT_URI


async def verify_token(session: aiohttp.ClientSession, token: str):
    guild_ids = {guild["id"] for guild in await get_guilds(session, token)}
    # check if in sail
    if "169611319501258753" not in guild_ids:
        return False
    return True


async def exchange_code(session: aiohttp.ClientSession, code: str):
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    async with session.post(
        f"{DISCORD_API_ENDPOINT}/oauth2/token",
        data=data,
        headers=headers,
        auth=aiohttp.BasicAuth(CLIENT_ID, CLIENT_SECRET)
    ) as r:
        r.raise_for_status()
        return await r.json()


async def get_token_info(session: aiohttp.ClientSession, token: str):
    headers = {"Authorization": f"Bearer {token}"}
    async with session.get(f"{DISCORD_API_ENDPOINT}/oauth2/@me", headers=headers) as r:
        r.raise_for_status()
        return await r.json()


async def get_guilds(session: aiohttp.ClientSession, token: str):
    headers = {"Authorization": f"Bearer {token}"}
    async with session.get(
        f"{DISCORD_API_ENDPOINT}/users/@me/guilds", headers=headers
    ) as r:
        r.raise_for_status()
        return await r.json()


async def revoke_access_token(session: aiohttp.ClientSession, token: str):
    data = {"token": token, "token_type_hint": "access_token"}
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    await session.post(
        f"{DISCORD_API_ENDPOINT}/oauth2/token/revoke",
        data=data,
        headers=headers,
        auth=aiohttp.BasicAuth(CLIENT_ID, CLIENT_SECRET)
    )


async def refresh_token(session: aiohttp.ClientSession, refresh_token: str):
    data = {"grant_type": "refresh_token", "refresh_token": refresh_token}
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    async with session.post(
        f"{DISCORD_API_ENDPOINT}/oauth2/token",
        data=data,
        headers=headers,
        auth=aiohttp.BasicAuth(CLIENT_ID, CLIENT_SECRET)
    ) as r:

        r.raise_for_status()
        return r.json()

def require_token(token_cache: dict):
    pass