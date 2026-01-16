import asyncio
import os
import sys
from datetime import date, timedelta
from decimal import Decimal

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

from app.lib.db import AsyncSessionLocal, engine
from app.models import User, Course, Exam, Question, AdmissionRequest
from app.lib.auth import get_password_hash
from sqlalchemy import select

async def seed():
    print("🌱 Starting database seeding...")
    async with AsyncSessionLocal() as session:
        # 1. Create Users
        print("👤 Creating users...")
        users_data = [
            {
                "name": "Admin User",
                "email": "admin@exam.com",
                "password": "password123",
                "role": "ADMIN",
                "active_mobile": "01711111111"
            },
            {
                "name": "Saikat Moderator",
                "email": "saikat@exam.com",
                "password": "password123",
                "role": "MODERATOR",
                "active_mobile": "01722222222"
            },
            {
                "name": "Student Joy",
                "email": "joy@exam.com",
                "password": "password123",
                "role": "USER",
                "active_mobile": "01733333333"
            }
        ]

        created_users = {}
        for u in users_data:
            res = await session.execute(select(User).filter(User.email == u["email"]))
            user = res.scalar_one_or_none()
            if not user:
                user = User(
                    name=u["name"],
                    email=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"],
                    active_mobile=u["active_mobile"]
                )
                session.add(user)
                await session.flush()
                print(f"   Created user: {u['email']}")
            else:
                print(f"   User already exists: {u['email']}")
            created_users[u["email"]] = user

        # 2. Create Programs (Courses)
        print("📚 Creating programs...")
        courses_data = [
            {
                "title": "BCS Preliminary Masterclass",
                "description": "Comprehensive course for BCS seekers covering all subjects.",
                "thumbnail": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
                "price": Decimal("5000.00"),
                "early_bird_price": Decimal("4000.00"),
                "early_bird_end_date": date.today() + timedelta(days=10),
                "discount": Decimal("500.00"),
                "discount_start_date": date.today(),
                "discount_end_date": date.today() + timedelta(days=30)
            },
            {
                "title": "Bank Job Special Batch",
                "description": "Exclusively for bank job aspirants with focus on Math and English.",
                "thumbnail": "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f",
                "price": Decimal("4000.00"),
                "early_bird_price": Decimal("3500.00"),
                "early_bird_end_date": date.today() + timedelta(days=5),
                "discount": Decimal("200.00"),
                "discount_start_date": date.today(),
                "discount_end_date": date.today() + timedelta(days=20)
            }
        ]

        created_courses = []
        for c in courses_data:
            res = await session.execute(select(Course).filter(Course.title == c["title"]))
            course = res.scalar_one_or_none()
            if not course:
                course = Course(**c)
                session.add(course)
                await session.flush()
                print(f"   Created program: {c['title']}")
            else:
                print(f"   Program already exists: {c['title']}")
            created_courses.append(course)

        # 3. Create Exams
        print("📝 Creating exams...")
        exams_data = [
            {
                "title": "BCS Daily Quiz #1",
                "description": "General Knowledge daily test.",
                "start_time": date.today(),
                "end_time": date.today() + timedelta(days=1),
                "duration_minutes": 10,
                "mark": Decimal("10.0"),
                "minus_mark": Decimal("0.25"),
                "course_id": created_courses[0].id
            },
            {
                "title": "Bank Math - Profit & Loss",
                "description": "Weekly math assessment.",
                "start_time": date.today(),
                "end_time": date.today() + timedelta(days=2),
                "duration_minutes": 20,
                "mark": Decimal("20.0"),
                "minus_mark": Decimal("0.5"),
                "course_id": created_courses[1].id
            }
        ]

        created_exams = []
        for e in exams_data:
            res = await session.execute(select(Exam).filter(Exam.title == e["title"]))
            exam = res.scalar_one_or_none()
            if not exam:
                exam = Exam(**e)
                session.add(exam)
                await session.flush()
                print(f"   Created exam: {e['title']}")
            else:
                print(f"   Exam already exists: {e['title']}")
            created_exams.append(exam)

        # 4. Create Questions
        print("❓ Creating questions...")
        questions_list = [
            {
                "content": "Who is the author of 'Unfinished Memoirs'?",
                "q_type": "MCQ",
                "option_a": "Sheikh Mujibur Rahman",
                "option_b": "Tajuddin Ahmad",
                "option_c": "Maulana Bhashani",
                "option_d": "Ziaur Rahman",
                "answer": "A",
                "exam_id": created_exams[0].id
            },
            {
                "content": "What is the capital of France?",
                "q_type": "MCQ",
                "option_a": "London",
                "option_b": "Berlin",
                "option_c": "Paris",
                "option_d": "Madrid",
                "answer": "C",
                "exam_id": created_exams[0].id
            },
            {
                "content": "If a shirt costs 500 and is sold at 20% profit, what is the selling price?",
                "q_type": "MCQ",
                "option_a": "550",
                "option_b": "600",
                "option_c": "650",
                "option_d": "700",
                "answer": "B",
                "exam_id": created_exams[1].id
            }
        ]

        for q in questions_list:
            res = await session.execute(select(Question).filter(Question.content == q["content"]))
            if not res.scalar_one_or_none():
                question = Question(**q)
                session.add(question)
                print(f"   Created question: {q['content'][:30]}...")

        # 5. Create Admission Requests
        print("📥 Creating admission requests...")
        admission_data = [
            {
                "user_id": created_users["joy@exam.com"].id,
                "course_id": created_courses[0].id,
                "status": "PENDING",
                "created_at": date.today(),
                "updated_at": date.today()
            }
        ]

        for ad in admission_data:
            # Check if user and course exist before creating request (they should if seeding didn't fail)
            if created_users.get("joy@exam.com") and created_courses:
                res = await session.execute(
                    select(AdmissionRequest).filter(
                        AdmissionRequest.user_id == ad["user_id"],
                        AdmissionRequest.course_id == ad["course_id"]
                    )
                )
                if not res.scalar_one_or_none():
                    admission = AdmissionRequest(**ad)
                    session.add(admission)
                    print(f"   Created admission request for joy@exam.com")

        await session.commit()
        print("✨ Database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
