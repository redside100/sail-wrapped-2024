import time
from typing import Dict, List, Optional
import aiosqlite
from consts import ATTACHMENT_URL_BASE, VIDEO_EXT_LIST
from models import AttachmentInfo, AttachmentSummary, MessageInfo, MessageSummary
from cache import AsyncTTL

conn = None


async def init():
    global conn
    conn = await aiosqlite.connect("wrapped.db")


async def get_random_attachment(video_only: bool = False) -> AttachmentInfo:
    where_clause = f"lower(extension) IN ({', '.join(['?' for _ in VIDEO_EXT_LIST])})"
    if video_only:
        cursor = await conn.execute(
            f"SELECT id, file_name, author_id AS sender_id, author_name AS sender_handle, attachments.timestamp, related_message_id, channel_id, channel_name, content FROM attachments LEFT JOIN messages ON attachments.related_message_id = messages.message_id WHERE id IN (SELECT id FROM attachments WHERE {where_clause} ORDER BY RANDOM() LIMIT 1)",
            VIDEO_EXT_LIST,
        )
    else:
        cursor = await conn.execute(
            f"SELECT id, file_name, author_id AS sender_id, author_name AS sender_handle, attachments.timestamp, related_message_id, channel_id, channel_name, content FROM attachments LEFT JOIN messages ON attachments.related_message_id = messages.message_id WHERE id IN (SELECT id FROM attachments ORDER BY RANDOM() LIMIT 1)"
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
        related_channel_id=str(row[6]),
        related_channel_name=str(row[7]),
        related_message_content=row[8],
    )


async def get_random_message(min_length: int = 1) -> MessageInfo:
    async with conn.execute(
        "SELECT message_id, content, channel_name, author_id, author_name, timestamp, channel_id FROM messages WHERE message_id IN (SELECT message_id FROM messages WHERE content_length >= ? ORDER BY RANDOM() LIMIT 1)",
        (min_length,),
    ) as cursor:
        row = await cursor.fetchone()

    if not row:
        return None

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
        channel_id=str(row[6]),
    )


async def get_message(message_id: int) -> MessageInfo:
    async with conn.execute(
        "SELECT message_id, content, channel_name, author_id, author_name, timestamp, channel_id FROM messages WHERE message_id = ?",
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
        channel_id=str(row[6]),
    )


async def get_attachment(attachment_id: int) -> Optional[AttachmentInfo]:
    async with conn.execute(
        "SELECT id, file_name, author_id AS sender_id, author_name AS sender_handle, attachments.timestamp, related_message_id, channel_id, channel_name, content FROM attachments LEFT JOIN messages ON attachments.related_message_id = messages.message_id WHERE id = ?",
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
        related_channel_id=str(row[6]),
        related_channel_name=str(row[7]),
        related_message_content=row[8],
    )


async def get_likes_for_user(discord_id: str) -> Dict[str, List[str]]:
    async with conn.execute(
        f"SELECT attachment_id, file_name, messages.author_name, messages.content, messages.channel_name FROM likes LEFT JOIN attachments ON likes.attachment_id = attachments.id LEFT JOIN messages ON attachments.related_message_id = messages.message_id WHERE discord_id = {int(discord_id)} ORDER BY likes.timestamp DESC"
    ) as cursor:
        attachment_rows = await cursor.fetchall()

    async with conn.execute(
        f"SELECT messages.message_id, messages.content, messages.author_name, messages.channel_name FROM message_likes LEFT JOIN messages ON message_likes.message_id = messages.message_id WHERE discord_id = {int(discord_id)} ORDER BY message_likes.timestamp DESC"
    ) as cursor:
        message_rows = await cursor.fetchall()
    return {
        "attachments": [
            AttachmentSummary(
                attachment_id=str(row[0]),
                file_name=row[1],
                url=ATTACHMENT_URL_BASE.format(row[0], row[1]),
                sender_handle=row[2],
                related_message_content=row[3],
                related_channel_name=row[4],
            )
            for row in attachment_rows
        ],
        "messages": [
            MessageSummary(
                message_id=str(row[0]),
                content=row[1],
                sender_handle=row[2],
                channel_name=row[3],
            )
            for row in message_rows
        ],
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


async def like(entity_id: int, discord_id: int, is_attachment: bool):
    timestamp = int(time.time())
    query = "INSERT INTO message_likes VALUES (?, ?, ?) ON CONFLICT (message_id, discord_id) DO NOTHING"
    if is_attachment:
        query = "INSERT INTO likes VALUES (?, ?, ?) ON CONFLICT (attachment_id, discord_id) DO NOTHING"
    await conn.execute(query, (entity_id, discord_id, timestamp))
    await conn.commit()


async def unlike(entity_id: int, discord_id: int, is_attachment: bool):
    query = "DELETE FROM message_likes WHERE message_id = ? AND discord_id = ?"
    if is_attachment:
        query = "DELETE FROM likes WHERE attachment_id = ? AND discord_id = ?"
    await conn.execute(query, (entity_id, discord_id))
    await conn.commit()


@AsyncTTL(time_to_live=60, maxsize=None)
async def get_leaderboard():
    attachment_query = """
SELECT
    ROW_NUMBER() OVER (
        ORDER BY
            like_count DESC
    ) AS rank,
    attachment_id,
    file_name,
    messages.author_name AS sender_handle,
    content,
    channel_name,
    like_count
FROM
    (
        SELECT
            attachment_id,
            COUNT(attachment_id) as like_count
        FROM
            likes
        GROUP BY
            attachment_id
    ) al
    LEFT JOIN attachments ON attachments.id = al.attachment_id
    LEFT JOIN messages ON attachments.related_message_id = messages.message_id;
"""

    message_query = """
SELECT
    ROW_NUMBER() OVER (
        ORDER BY
            like_count DESC
    ) rank,
    messages.message_id,
    content,
    author_name AS sender_handle,
    channel_name,
    like_count
FROM
    (
        SELECT
            message_id,
            COUNT(message_id) as like_count
        FROM
            message_likes
        GROUP BY
            message_id
    ) ml
    LEFT JOIN messages ON messages.message_id = ml.message_id
"""

    async with conn.execute(attachment_query) as cursor:
        attachment_rows = await cursor.fetchall()
    
    if not attachment_rows:
        attachment_rows = []
    
    attachment_rows.sort(key=lambda row: row[0])

    async with conn.execute(message_query) as cursor:
        message_rows = await cursor.fetchall()
    
    if not message_rows:
        message_rows = []
    
    message_rows.sort(key=lambda row: row[0])

    return {
        "attachments": [
            AttachmentSummary(
                attachment_id=str(row[1]),
                file_name=row[2],
                url=ATTACHMENT_URL_BASE.format(row[1], row[2]),
                sender_handle=row[3],
                related_message_content=row[4],
                related_channel_name=row[5],
                likes=row[6],
                rank=row[0]
            )
            for row in attachment_rows
        ],
        "messages": [
            MessageSummary(
                message_id=str(row[1]),
                content=row[2],
                sender_handle=row[3],
                channel_name=row[4],
                likes=row[5],
                rank=row[0]
            )
            for row in message_rows
        ],
    }
