import os

DISCORD_API_ENDPOINT = "https://discord.com/api/v10"
CLIENT_ID = "1293425051881832520"
REDIRECT_URI = "https://sw.redside.moe/login" if os.environ.get('ENV', 'local') == 'production' else "http://localhost:3000/login"
CLIENT_SECRET = ""

with open("client_secret", "r") as f:
    CLIENT_SECRET = f.read()