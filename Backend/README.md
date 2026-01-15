# Exam System Backend

## To run the project
```bash
chmod +x run.sh
./run.sh
```

## Commands for migrations
```bash
chmod +x migration.sh
./migration.sh --init
./migration.sh create "migration message"
./migration.sh run
```

<!-- If you need to make any changes to your models in the future, just run:
bashalembic revision --autogenerate -m "description of changes"
alembic upgrade head
 -->