FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./

# Install dependencies at build time
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV BACKEND_URL=https://alokbortikaedu.com

EXPOSE 8000

CMD ["sh", "entrypoint.sh"]
