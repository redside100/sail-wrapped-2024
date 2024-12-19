FROM python:3.12.8-slim

WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY . .
EXPOSE 5556
ENV ENV=production
CMD [ "python3", "main.py" ]
