"# Exam-System"

EXAM-SYSTEM/
│
├─ Frontend/
│ │
│ ├─ app/
│ │ ├─ (admin)/
│ │ │ ├─ dashboard/
│ │ │ │ └─ page.tsx
│ │ │ ├─ exams/
│ │ │ │ └─ page.tsx
│ │ │ ├─ users/
│ │ │ │ └─ page.tsx
│ │ │ └─ layout.tsx
│ │ │
│ │ ├─ (auth)/
│ │ │ ├─ login/
│ │ │ │ └─ page.tsx
│ │ │ └─ register/
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ (frontend)/
│ │ │ ├─ courses/
│ │ │ │ ├─ [courseId]/
│ │ │ │ │ └─ exams/
│ │ │ │ │ └─ page.tsx
│ │ │ │ └─ page.tsx
│ │ │ │
│ │ │ ├─ exam/
│ │ │ │ └─ page.tsx
│ │ │ │
│ │ │ └─ layout.tsx
│ │ │
│ │ ├─ favicon.ico
│ │ ├─ globals.css
│ │ ├─ layout.tsx
│ │ ├─ loading.tsx
│ │ └─ not-found.tsx
│ │
│ ├─ components/
│ │ ├─ admin/
│ │ │ ├─ AddQuestionModal.tsx
│ │ │ ├─ BulkQuestionUploadModal.tsx
│ │ │ ├─ CreateExamModal.tsx
│ │ │ └─ ExamDetailModal.tsx
│ │ │
│ │ ├─ common/
│ │ │ ├─ CustomModal.tsx
│ │ │ ├─ ErrorBoundary.tsx
│ │ │ └─ GallerySection.tsx
│ │ │
│ │ ├─ courses/
│ │ │ └─ Pagination.tsx
│ │ │
│ │ ├─ editor/
│ │ │ ├─ MathContentRenderer.tsx
│ │ │ └─ RichTextEditor.tsx
│ │ │
│ │ ├─ exam/
│ │ │ ├─ ExamCard.tsx
│ │ │ ├─ ExamHeader.tsx
│ │ │ ├─ QuestionCard.tsx
│ │ │ ├─ QuestionResult.tsx
│ │ │ ├─ ResultSummary.tsx
│ │ │ ├─ Timer.tsx
│ │ │ └─ WrittenQuestionCard.tsx
│ │ │
│ │ ├─ home/
│ │ │ ├─ CourseCard.tsx
│ │ │ ├─ CourseFilters.tsx
│ │ │ └─ CoursesSection.tsx
│ │ │
│ │ ├─ layout/
│ │ │ ├─ Footer.tsx
│ │ │ └─ Navbar.tsx
│ │ │
│ │ ├─ ui/
│ │ │ └─ Button.tsx
│ │ │
│ │ └─ users/
│ │ ├─ LogoutButton.tsx
│ │ └─ Pagination.tsx
│ │
│ ├─ constants/
│ │ └─ courses.ts
│ │
│ ├─ data/
│ │
│ ├─ lib/
│ │ ├─ api.ts
│ │ ├─ courseData.ts
│ │ ├─ googleDriveUtils.ts
│ │ └─ mockWrittenData.ts
│ │
│ └─ types/
│ ├─ user.ts
│ ├─ course.ts
│ ├─ exam.ts
│ └─ result.ts
│
├─ Backend/
│ │
│ ├─ alembic/
│ │ ├─ versions/
│ │ │ ├─ 2026_01_16_1749-_.py
│ │ │ ├─ 2026_01_17_0143-_.py
│ │ │ ├─ 2026_01_17_0234-_.py
│ │ │ └─ 2026_01_21_0124-_.py
│ │ ├─ env.py
│ │ └─ script.py.mako
│ │
│ ├─ app/
│ │ ├─ api/
│ │ │ ├─ auth.py
│ │ │ ├─ course.py
│ │ │ ├─ exam.py
│ │ │ ├─ test.py
│ │ │ ├─ upload.py
│ │ │ └─ user.py
│ │ │
│ │ ├─ lib/
│ │ │ ├─ auth.py
│ │ │ ├─ config.py
│ │ │ └─ db.py
│ │ │
│ │ ├─ models/
│ │ │ ├─ answer.py
│ │ │ ├─ course.py
│ │ │ ├─ enums.py
│ │ │ ├─ exam_schedule.py
│ │ │ ├─ exam_session.py
│ │ │ ├─ exam.py
│ │ │ ├─ payment.py
│ │ │ ├─ question.py
│ │ │ ├─ result_announcement.py
│ │ │ ├─ result.py
│ │ │ ├─ user_course_access.py
│ │ │ ├─ user_course.py
│ │ │ ├─ user_exam_access.py
│ │ │ └─ user.py
│ │ │
│ │ ├─ schemas/
│ │ │ ├─ answer.py
│ │ │ ├─ auth.py
│ │ │ ├─ course.py
│ │ │ ├─ exam.py
│ │ │ ├─ question.py
│ │ │ ├─ result.py
│ │ │ └─ user.py
│ │ │
│ │ ├─ services/
│ │ │ ├─ course_service.py
│ │ │ ├─ exam_service.py
│ │ │ ├─ google_drive_service.py
│ │ │ └─ user_service.py
│ │ │
│ │ ├─ utils/
│ │ │ ├─ google_drive.py
│ │ │ ├─ hashing.py
│ │ │ └─ jwt.py
│ │ │
│ │ └─ main.py
│ │
│ ├─ uploads/
│ │
│ ├─ .env
│ ├─ alembic.ini
│ ├─ requirements.txt
│ ├─ reset_database.py
│ └─ README.md
│
└─ README.md
