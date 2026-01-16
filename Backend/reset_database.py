# reset_database.py
import asyncio
import asyncpg

async def reset_database():
    # Connect to default 'postgres' database
    conn = await asyncpg.connect(
        user='postgres',
        password='password',
        database='postgres',
        host='localhost',
        port=5432
    )
    
    try:
        # Terminate existing connections
        await conn.execute('''
            SELECT pg_terminate_backend(pid) 
            FROM pg_stat_activity 
            WHERE datname = 'exam_system' AND pid <> pg_backend_pid()
        ''')
        
        # Drop database
        await conn.execute('DROP DATABASE IF EXISTS exam_system')
        print("✅ Database 'exam_system' dropped")
        
        # Create database
        await conn.execute('CREATE DATABASE exam_system')
        print("✅ Database 'exam_system' created")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(reset_database())