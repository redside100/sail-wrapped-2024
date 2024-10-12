from datetime import datetime
import os
import time
import orjson
import requests
import sqlite3
import pathlib

json_files = os.listdir("export")
file_count = len(json_files)
conn = sqlite3.connect("backend/wrapped.db")

DOWNLOAD_ATTACHMENTS = False

for i, file_name in enumerate(json_files):
    print(f"Processing file {i + 1}/{file_count} - {file_name}")
    with open(f"export/{file_name}", "r", encoding="utf-8") as f:
        start_time = int(time.time())
        logs = orjson.loads(f.read())
        end_time = int(time.time())
        channel_id = int(logs.get("channel", {}).get("id", "0"))
        channel_name = logs.get("channel", {}).get("name")

        print(f"Loaded into memory - {channel_id} - {channel_name}")
        print(f"Took {end_time - start_time} second(s)")

        log_messages = logs.get("messages", [])
        message_count = len(log_messages)
        print(f"Parsing through {message_count} messages")
        for j, message in enumerate(log_messages):
            if j % 500 == 0:
                print(
                    f"Process {j + 1}/{message_count} - {channel_id} - {channel_name}"
                )
                conn.commit()

            if message["author"]["isBot"]:
                continue

            message_id = int(message["id"])
            type = message["type"]

            formatted_timestamp = message["timestamp"]
            if "." not in formatted_timestamp:
                formatted_timestamp = (
                    formatted_timestamp.replace("+00:00", "") + ".0+00:00"
                )

            timestamp = int(
                datetime.strptime(
                    formatted_timestamp, "%Y-%m-%dT%H:%M:%S.%f%z"
                ).timestamp()
            )
            content = message["content"]
            author_id = int(message["author"].get("id", "0"))
            author_name = message["author"].get("name", "")
            author_nickname = message["author"].get("nickname", "")
            author_discriminator = message["author"].get("discriminator", "0000")
            author_avatar_url = message["author"].get("avatarUrl", "")
            attachments = orjson.dumps(message["attachments"])
            embeds = orjson.dumps(message["embeds"])
            stickers = orjson.dumps(message["stickers"])
            reactions = orjson.dumps(message["reactions"])
            mentions = orjson.dumps(message["mentions"])
            total_reactions = sum(
                [reaction["count"] for reaction in message["reactions"]]
            )

            valid_length = len(content) > 8

            t = (
                message_id,
                type,
                timestamp,
                content,
                author_id,
                author_name,
                author_nickname,
                author_discriminator,
                author_avatar_url,
                attachments,
                embeds,
                stickers,
                reactions,
                total_reactions,
                mentions,
                channel_id,
                channel_name,
                valid_length,
            )
            conn.cursor().execute(
                f"INSERT OR REPLACE INTO messages (message_id, type, timestamp, content, author_id, author_name, author_nickname, author_discriminator, author_avatar_url, attachments, embeds, stickers, reactions, total_reactions, mentions, channel_id, channel_name, valid_length) VALUES "
                + f"(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                t,
            )

            # attachments
            for attachment in message["attachments"]:
                if DOWNLOAD_ATTACHMENTS:
                    print(
                        f"Writing attachment {attachment['id']} {attachment['fileName']}"
                    )
                    with open(
                        f"attachments/{attachment['id']}_{attachment['fileName']}",
                        "wb+",
                    ) as attachment_file:
                        res = requests.get(attachment["url"])
                        attachment_file.write(res.content)
                conn.cursor().execute(
                    f"INSERT OR REPLACE INTO attachments (id, related_message_id, file_name, timestamp, extension) VALUES (?, ?, ?, ?, ?)",
                    (
                        int(attachment["id"]),
                        message_id,
                        attachment["fileName"],
                        formatted_timestamp,
                        pathlib.Path(attachment["fileName"]).suffix,
                    ),
                )
        conn.commit()
        print("Done")
