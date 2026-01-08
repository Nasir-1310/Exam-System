// src/constants/courses.ts

import { CourseFilter } from '../lib/types';

export const COURSE_FILTERS: CourseFilter[] = [
  { category: 'all', labelEn: 'All Courses', labelBn: 'সকল কোর্স' },
  { category: 'free', labelEn: 'Free Course', labelBn: 'ফ্রি কোর্স' },
  { category: 'regular-bcs', labelEn: 'Regular BCS Course', labelBn: 'রেগুলার বিসিএস কোর্স' },
  { category: 'subjective-bcs', labelEn: 'Subjective BCS Course', labelBn: 'সাবজেক্টিভ বিসিএস কোর্স' },
  { category: 'bank', labelEn: 'Bank Course', labelBn: 'ব্যাংক কোর্স' },
  { category: 'am-club', labelEn: '6 AM Club', labelBn: '৬ এএম ক্লাব' },
  { category: 'medical', labelEn: 'Medical Courses', labelBn: 'মেডিকেল কোর্স' },
  { category: 'primary', labelEn: 'Primary & Non-cadre', labelBn: 'প্রাইমারি ও নন-ক্যাডার' },
];

export const COURSES_PER_PAGE = 12;
export const HOME_COURSES_LIMIT = 8;