
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev

```

bcs-exam-frontend/
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── hero/
│   │   └── courses/
│   ├── icons/
│   └── favicon.ico
│
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home page
│   ├── globals.css                # Global styles
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── courses/
│   │   ├── page.tsx               # All courses
│   │   ├── [id]/page.tsx          # Course details
│   │   └── layout.tsx
│   ├── bcs-course/page.tsx
│   ├── bank-course/page.tsx
│   ├── books/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── free-course/page.tsx
│   ├── about/page.tsx
│   ├── profile/
│   │   ├── page.tsx
│   │   └── settings/page.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── my-courses/page.tsx
│       └── progress/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileMenu.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   └── Alert.tsx
│   ├── course/
│   │   ├── CourseCard.tsx
│   │   ├── CourseGrid.tsx
│   │   ├── CourseDetails.tsx
│   │   ├── CourseFilter.tsx
│   │   └── CourseProgress.tsx
│   ├── exam/
│   │   ├── ExamCard.tsx
│   │   ├── ExamTimer.tsx
│   │   ├── QuestionCard.tsx
│   │   └── ResultCard.tsx
│   ├── book/
│   │   ├── BookCard.tsx
│   │   └── BookReader.tsx
│   └── common/
│       ├── Hero.tsx
│       ├── SearchBar.tsx
│       ├── Pagination.tsx
│       └── BreadcrumbNav.tsx
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── services/
│   │       ├── authService.ts
│   │       ├── courseService.ts
│   │       ├── examService.ts
│   │       └── userService.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   └── hooks/
│       ├── useAuth.ts
│       ├── useCourses.ts
│       ├── useExam.ts
│       └── useDebounce.ts
│
├── store/
│   ├── index.ts
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── courseSlice.ts
│   │   └── examSlice.ts
│   └── types.ts
│
├── types/
│   ├── index.ts
│   ├── course.ts
│   ├── user.ts
│   ├── exam.ts
│   └── api.ts
│
├── styles/
│   └── themes.ts
│
├── .env.local
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md




Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
