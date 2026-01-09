#!/bin/bash

source .venv/bin/activate

if [ "$1" == "--init" ]; then
    alembic init alembic
fi

if [ "$1" == "create" ]; then
    alembic revision --autogenerate -m "$2"
fi

if [ "$1" == "run" ]; then
    alembic upgrade head
fi