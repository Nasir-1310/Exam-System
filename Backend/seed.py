import asyncio
import os
import sys
from datetime import date, datetime, timedelta
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
            },
            {
                "name": "Student Rina",
                "email": "rina@exam.com",
                "password": "password123",
                "role": "USER",
                "active_mobile": "01744444444"
            },
            {
                "name": "Student Arif",
                "email": "arif@exam.com",
                "password": "password123",
                "role": "USER",
                "active_mobile": "01755555555"
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
                "discount_end_date": date.today() + timedelta(days=30),
                "is_free": False
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
                "discount_end_date": date.today() + timedelta(days=20),
                "is_free": False
            },
            {
                "title": "Primary School Essentials",
                "description": "Foundation course for primary school recruitment.",
                "thumbnail": "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
                "price": Decimal("2500.00"),
                "early_bird_price": Decimal("2000.00"),
                "early_bird_end_date": date.today() + timedelta(days=7),
                "discount": Decimal("300.00"),
                "discount_start_date": date.today(),
                "discount_end_date": date.today() + timedelta(days=15),
                "is_free": False
            },
            {
                "title": "Spoken English Starter (Free)",
                "description": "Kick-off your spoken English with free daily practice.",
                "thumbnail": "https://images.unsplash.com/photo-1529070538774-1843cb3265df",
                "price": Decimal("0.00"),
                "early_bird_price": Decimal("0.00"),
                "early_bird_end_date": date.today() + timedelta(days=1),
                "discount": Decimal("0.00"),
                "discount_start_date": date.today(),
                "discount_end_date": date.today(),
                "is_free": True
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
                "start_time": datetime.utcnow() + timedelta(hours=2),
                "end_time": date.today() + timedelta(days=1),
                "duration_minutes": 10,
                "mark": Decimal("10.0"),
                "minus_mark": Decimal("0.25"),
                "course_id": created_courses[0].id,
                "exam_type": "REGULAR",
                "is_free": True,
                "price": Decimal("0.00"),
                "allow_multiple_attempts": True
            },
            {
                "title": "BCS Live Mega Mock",
                "description": "Live mock test with instant leaderboard.",
                "start_time": datetime.utcnow() + timedelta(days=1, hours=3),
                "end_time": date.today() + timedelta(days=2),
                "duration_minutes": 120,
                "mark": Decimal("200.0"),
                "minus_mark": Decimal("0.5"),
                "course_id": created_courses[0].id,
                "exam_type": "LIVE",
                "is_free": False,
                "price": Decimal("500.00"),
                "allow_multiple_attempts": False
            },
            {
                "title": "Bank Math - Profit & Loss",
                "description": "Weekly math assessment.",
                "start_time": datetime.utcnow() + timedelta(hours=1),
                "end_time": date.today() + timedelta(days=2),
                "duration_minutes": 20,
                "mark": Decimal("20.0"),
                "minus_mark": Decimal("0.5"),
                "course_id": created_courses[1].id,
                "exam_type": "REGULAR",
                "is_free": False,
                "price": Decimal("199.00"),
                "allow_multiple_attempts": True
            },
            {
                "title": "Primary School Model Test",
                "description": "Mixed model test for primary recruitment.",
                "start_time": datetime.utcnow() + timedelta(days=2),
                "end_time": date.today() + timedelta(days=4),
                "duration_minutes": 60,
                "mark": Decimal("50.0"),
                "minus_mark": Decimal("0.25"),
                "course_id": created_courses[2].id,
                "exam_type": "REGULAR",
                "is_free": True,
                "price": Decimal("0.00"),
                "allow_multiple_attempts": False
            },
            {
                "title": "Spoken English Fluency Check",
                "description": "Short quiz on basic spoken English cues.",
                "start_time": datetime.utcnow() + timedelta(hours=5),
                "end_time": date.today() + timedelta(days=1),
                "duration_minutes": 15,
                "mark": Decimal("15.0"),
                "minus_mark": Decimal("0.0"),
                "course_id": created_courses[3].id,
                "exam_type": "REGULAR",
                "is_free": True,
                "price": Decimal("0.00"),
                "allow_multiple_attempts": True
            },
            {
                "title": "Standalone Current Affairs (Paid)",
                "description": "Standalone GK exam not tied to any course.",
                "start_time": datetime.utcnow() + timedelta(days=3, hours=2),
                "end_time": date.today() + timedelta(days=5),
                "duration_minutes": 45,
                "mark": Decimal("30.0"),
                "minus_mark": Decimal("0.3"),
                "course_id": None,
                "exam_type": "STANDALONE",
                "is_free": False,
                "price": Decimal("299.00"),
                "allow_multiple_attempts": False
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
                "exam_id": created_exams[2].id
            },
            {
                "content": "What is the formula for simple interest?",
                "q_type": "MCQ",
                "option_a": "P * R * T",
                "option_b": "(P * R * T) / 100",
                "option_c": "(P + R + T) / 100",
                "option_d": "(P * R) / T",
                "answer": "B",
                "exam_id": created_exams[2].id
            },
            {
                "content": "How many Bangla MCQ questions are in BCS preliminary?",
                "q_type": "MCQ",
                "option_a": "20",
                "option_b": "25",
                "option_c": "30",
                "option_d": "35",
                "answer": "C",
                "exam_id": created_exams[1].id
            },
            {
                "content": "What is the total mark of BCS preliminary exam?",
                "q_type": "MCQ",
                "option_a": "150",
                "option_b": "200",
                "option_c": "250",
                "option_d": "300",
                "answer": "B",
                "exam_id": created_exams[1].id
            },
            {
                "content": "Which tense is used for scheduled future events?",
                "q_type": "MCQ",
                "option_a": "Present simple",
                "option_b": "Present continuous",
                "option_c": "Future perfect",
                "option_d": "Past continuous",
                "answer": "A",
                "exam_id": created_exams[3].id
            },
            {
                "content": "Which word is stressed in the phrase 'What are you up to?'",
                "q_type": "MCQ",
                "option_a": "What",
                "option_b": "are",
                "option_c": "up",
                "option_d": "to",
                "answer": "C",
                "exam_id": created_exams[4].id
            },
            {
                "content": "Which country recently launched a Mars mission named 'Hope'?",
                "q_type": "MCQ",
                "option_a": "USA",
                "option_b": "UAE",
                "option_c": "China",
                "option_d": "India",
                "answer": "B",
                "exam_id": created_exams[5].id
            },
            {
                "content": "Bangladesh Liberation War ended in which year?",
                "q_type": "MCQ",
                "option_a": "1971",
                "option_b": "1975",
                "option_c": "1969",
                "option_d": "1980",
                "answer": "A",
                "exam_id": created_exams[5].id
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
            },
            {
                "user_id": created_users["rina@exam.com"].id,
                "course_id": created_courses[1].id,
                "status": "APPROVED",
                "created_at": date.today(),
                "updated_at": date.today()
            },
            {
                "user_id": created_users["arif@exam.com"].id,
                "course_id": created_courses[3].id,
                "status": "APPROVED",
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
