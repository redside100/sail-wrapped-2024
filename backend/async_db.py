from typing import List
import aiosqlite
from consts import ATTACHMENT_URL_BASE, VIDEO_EXT_LIST
from models import AttachmentInfo

conn = None


async def init():
    global conn
    conn = await aiosqlite.connect("wrapped.db")

async def get_random_attachment(video_only: bool = False) -> AttachmentInfo:
    where_clause = f"extension IN ({', '.join(['?' for _ in VIDEO_EXT_LIST])})"
    if video_only:
        cursor = await conn.execute(
            f"SELECT id, file_name, author_id AS sender_id, author_name AS sender_handle FROM attachments LEFT JOIN messages ON attachments.related_message_id = messages.message_id WHERE id IN (SELECT id FROM attachments WHERE {where_clause} ORDER BY RANDOM() LIMIT 1)",
            VIDEO_EXT_LIST,
        )
    else:
        cursor = await conn.execute(
            f"SELECT id, file_name, author_id AS sender_id, author_name AS sender_handle FROM attachments LEFT JOIN messages ON attachments.related_message_id = messages.message_id WHERE id IN (SELECT id FROM attachments ORDER BY RANDOM() LIMIT 1)"
        )

    row = await cursor.fetchone()
    attachment_id = int(row[0])
    await cursor.close()

    async with conn.execute(f"SELECT COUNT(attachment_id) FROM likes WHERE attachment_id = {attachment_id}") as cursor:
        like_row = await cursor.fetchone()

    return AttachmentInfo(
        attachment_id=str(attachment_id),
        file_name=row[1],
        url=ATTACHMENT_URL_BASE.format(attachment_id, row[1]),
        sender_id=str(row[2]),
        sender_handle=row[3],
        likes=like_row[0]
    )


async def get_likes_for_user(discord_id: str) -> List[str]:
    cursor = await conn.execute(f"SELECT attachment_id FROM attachments WHERE discord_id = {int(discord_id)}")
    rows = await cursor.fetchall()
    return [
        row[0] for row in rows
    ]