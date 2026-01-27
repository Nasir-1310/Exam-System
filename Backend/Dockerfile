FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./

# Install dependencies at build time
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "run.sh"]
