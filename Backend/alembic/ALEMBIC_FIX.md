# Alembic Migration Fix Guide

## Problem: Can't locate revision
The error `Can't locate revision identified by 'XXXX'` means the database's `alembic_version` table is pointing to a migration ID that does not exist in your `alembic/versions/` folder.

### Common Causes:
1. **Branch Switching**: You migrated on one branch, then switched to another where that file doesn't exist.
2. **Manual Deletion**: A migration file was deleted but the database still thinks it has been applied.

## Solution: Stamping the Database
To fix this, we need to "re-sync" the database with the files we actually have.

### Steps taken:
1. **Identify the last valid file**: Looked at the `alembic/versions` folder to find the latest available migration ID (e.g., `9117e4b3bbb2`).
2. **Stamp the database**: Ran the following command:
   ```bash
   alembic stamp --purge <latest_valid_id>
   ```
   - `--purge`: Clears the current (invalid) version history from the database.
   - `<id>`: Sets the database version to match the file we specify.

## Bonus: Handling Existing Data
When adding `NOT NULL` columns to a table that already has data, the migration will fail. 

### Fix:
Modify the generated migration file to include a `server_default`:
```python
# Before
op.add_column('User', sa.Column('active_mobile', sa.String(20), nullable=False))

# After (Fix)
op.add_column('User', sa.Column('active_mobile', sa.String(20), nullable=False, server_default=''))
```
This gives existing rows a default value so the `NOT NULL` constraint isn't violated.
