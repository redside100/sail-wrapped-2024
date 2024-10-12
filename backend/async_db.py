from typing import Dict, List, Optional
import aiosqlite
from consts import ATTACHMENT_URL_BASE, VIDEO_EXT_LIST
from models import AttachmentInfo, MessageInfo

conn = None


async def init():
    global conn
    conn = await aiosqlite.connect("wrapped.db")


async def get_random_attachment(video_only: bool = False) -> AttachmentInfo:
    where_clause = f"lower(extension) IN ({', '.join(['?' for _ in VIDEO_EXT_LIST])})"
    if video_only:
        cursor = await conn.execute(
            f"SELECT id, file_name, author_id AS sender_id, author_name AS sender_handle, attachments.timestamp, related_message_id, content FROM attachments LEFT JOIN messages ON attachments.related_message_id = messages.message_id WHERE id IN (SELECT id FROM attachments WHERE {where_clause} ORDER BY RANDOM() LIMIT 1)",
            VIDEO_EXT_LIST,
        )
    else:
        cursor = await conn.execute(
            f"SELECT id, file_name, author_id AS sender_id, author_name AS sender_handle, attachments.timestamp, related_message_id, content FROM attachments LEFT JOIN messages ON attachments.related_message_id = messages.message_id WHERE id IN (SELECT id FROM attachments ORDER BY RANDOM() LIMIT 1)"
        )

    row = await cursor.fetchone()
    attachment_id = int(row[0])
    await cursor.close()

    likes = await get_attachment_likes(attachment_id)

    return AttachmentInfo(
        attachment_id=str(attachment_id),
        file_name=row[1],
        url=ATTACHMENT_URL_BASE.format(attachment_id, row[1]),
        sender_id=str(row[2]),
        sender_handle=row[3],
        likes=likes,
        timestamp=row[4],
        related_message_id=str(row[5]),
        related_message_content=row[6],
    )


async def get_random_message() -> MessageInfo:
    async with conn.execute(
        "SELECT message_id, content, channel_name, author_id, author_name, timestamp FROM messages WHERE message_id IN (SELECT message_id FROM messages WHERE valid_length = TRUE ORDER BY RANDOM() LIMIT 1)"
    ) as cursor:
        row = await cursor.fetchone()

    message_id = int(row[0])
    likes = await get_message_likes(message_id)
    return MessageInfo(
        message_id=str(message_id),
        content=row[1],
        channel_name=row[2],
        sender_id=str(row[3]),
        sender_handle=row[4],
        timestamp=row[5],
        likes=likes,
    )


async def get_message(message_id: int) -> MessageInfo:
    async with conn.execute(
        "SELECT message_id, content, channel_name, author_id, author_name, timestamp FROM messages WHERE message_id = ?",
        (message_id,),
    ) as cursor:
        row = await cursor.fetchone()

    if not row:
        return None

    likes = await get_message_likes(message_id)
    return MessageInfo(
        message_id=str(message_id),
        content=row[1],
        channel_name=row[2],
        sender_id=str(row[3]),
        sender_handle=row[4],
        timestamp=row[5],
        likes=likes,
    )


async def get_attachment(attachment_id: int) -> Optional[AttachmentInfo]:
    async with conn.execute(
        "SELECT id, file_name, author_id AS sender_id, author_name AS sender_handle, timestamp, related_message_id, content FROM attachments LEFT JOIN messages ON attachments.related_message_id = messages.message_id WHERE id = ?",
        (attachment_id,),
    ) as cursor:
        row = await cursor.fetchone()

    if not row:
        return None

    likes = await get_attachment_likes(attachment_id)
    return AttachmentInfo(
        attachment_id=str(row[0]),
        file_name=row[1],
        url=ATTACHMENT_URL_BASE.format(attachment_id, row[1]),
        sender_id=str(row[2]),
        sender_handle=row[3],
        likes=likes,
        timestamp=row[4],
        related_message_id=str(row[5]),
        related_message_content=row[6],
    )


async def get_likes_for_user(discord_id: str) -> Dict[str, List[str]]:
    async with conn.execute(
        f"SELECT attachment_id FROM likes WHERE discord_id = {int(discord_id)}"
    ) as cursor:
        attachment_rows = await cursor.fetchall()

    async with conn.execute(
        f"SELECT message_id FROM message_likes WHERE discord_id = {int(discord_id)}"
    ) as cursor:
        message_rows = await cursor.fetchall()
    return {
        "attachments": [row[0] for row in attachment_rows],
        "messages": [row[0] for row in message_rows],
    }


async def get_attachment_likes(attachment_id: int) -> int:
    async with conn.execute(
        f"SELECT COUNT(attachment_id) FROM likes WHERE attachment_id = {attachment_id}"
    ) as cursor:
        like_row = await cursor.fetchone()
        if like_row:
            return like_row[0]
        return 0


async def get_message_likes(message_id: int) -> int:
    async with conn.execute(
        f"SELECT COUNT(message_id) FROM message_likes WHERE message_id = {message_id}"
    ) as cursor:
        like_row = await cursor.fetchone()
        if like_row:
            return like_row[0]
        return 0
