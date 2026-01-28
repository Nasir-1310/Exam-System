#!/bin/bash

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Seed data if SEED_DATA environment variable is set to true
if [ "$SEED_DATA" = "true" ]; then
    echo "Seeding data..."
    python seed.py
fi

# Start the FastAPI application
echo "Starting FastAPI application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
