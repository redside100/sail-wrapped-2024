import os
import time
import orjson
import requests

json_files = os.listdir("export")
file_count = len(json_files)

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
        for message in log_messages:
            for attachment in message["attachments"]:
                print(f"Writing attachment {attachment['id']} {attachment['fileName']}")
                with open(f"attachments/{attachment['id']}_{attachment['fileName']}", "wb+") as attachment_file:
                    res = requests.get(attachment["url"])
                    attachment_file.write(res.content)