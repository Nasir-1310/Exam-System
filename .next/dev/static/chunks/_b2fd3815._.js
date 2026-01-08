(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/home/CourseFilters.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourseFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
// src/components/home/CourseFilters.tsx
'use client';
;
// Course category buttons data
const categories = [
    {
        id: 'all',
        label: 'সকল কোর্স'
    },
    {
        id: 'free',
        label: 'ফ্রি কোর্স'
    },
    {
        id: 'regular-bcs',
        label: 'রেগুলার বিসিএস কোর্স'
    },
    {
        id: 'subjective-bcs',
        label: 'সাবজেক্টিভ বিসিএস কোর্স'
    },
    {
        id: 'bank',
        label: 'ব্যাংক কোর্স'
    },
    {
        id: 'am-club',
        label: '৬ এএম ক্লাব'
    },
    {
        id: 'medical',
        label: 'মেডিকেল কোর্স'
    },
    {
        id: 'primary',
        label: 'প্রাইমারি ও নন-ক্যাডার'
    }
];
function CourseFilters({ selectedCategory, onCategoryChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-wrap gap-3 justify-center",
            children: categories.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>onCategoryChange(cat.id),
                    className: `px-5 py-2.5 rounded-lg font-medium transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'}`,
                    children: cat.label
                }, cat.id, false, {
                    fileName: "[project]/components/home/CourseFilters.tsx",
                    lineNumber: 28,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/components/home/CourseFilters.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/home/CourseFilters.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_c = CourseFilters;
var _c;
__turbopack_context__.k.register(_c, "CourseFilters");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/courseData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/courseData.ts
// Mock data - Replace with API calls later
__turbopack_context__.s([
    "MOCK_COURSES",
    ()=>MOCK_COURSES,
    "getCourseById",
    ()=>getCourseById,
    "getCoursesByCategory",
    ()=>getCoursesByCategory,
    "getPaginatedCourses",
    ()=>getPaginatedCourses
]);
const MOCK_COURSES = [
    {
        id: "1",
        title: "51 BCS Preli + Written Combo Early Bird Batch",
        titleBangla: "প্রিলিমিনারি কম্বো রিটেন লাইভ ব্যাচ",
        category: "regular-bcs",
        price: 15990,
        thumbnail: "/images/courses/bcs-combo.jpg",
        duration: "৬ মাস",
        lectures: 120,
        students: 5430,
        instructor: "Multiple Instructors",
        features: [
            "প্রিলিমিনারি পরীক্ষার পূর্ণ প্রস্তুতি",
            "রিটেন পরীক্ষার সম্পূর্ণ গাইডলাইন",
            "মডেল টেস্ট ও সমাধান",
            "লাইভ ক্লাস এবং রেকর্ডেড ভিডিও"
        ],
        description: "৫১তম বিসিএস পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি। প্রিলিমিনারি এবং রিটেন উভয় পর্যায়ের জন্য বিশেষজ্ঞ শিক্ষকদের দ্বারা পরিচালিত।",
        syllabus: [
            {
                id: "s1",
                title: "সেশন প্ল্যান",
                topics: [
                    "প্রতি সপ্তাহে ৫টি ক্লাস",
                    "প্রতিটি ক্লাস ২ ঘন্টা"
                ]
            }
        ],
        isFeatured: true,
        isEarlyBird: true
    },
    {
        id: "2",
        title: "51 BCS Preli Early Bird Batch",
        titleBangla: "প্রিলি লাইভ ব্যাচ",
        category: "regular-bcs",
        price: 11990,
        thumbnail: "/images/courses/bcs-preli.jpg",
        duration: "৪ মাস",
        lectures: 80,
        students: 3200,
        instructor: "Expert Faculty",
        features: [
            "প্রিলিমিনারি পরীক্ষার সম্পূর্ণ প্রস্তুতি",
            "সাপ্তাহিক মডেল টেস্ট",
            "পূর্ববর্তী বছরের প্রশ্ন সমাধান"
        ],
        description: "বিসিএস প্রিলিমিনারি পরীক্ষার জন্য বিশেষভাবে ডিজাইন করা কোর্স।",
        syllabus: [],
        isEarlyBird: true
    },
    {
        id: "3",
        title: "51 BCS Written Early Bird Batch",
        titleBangla: "রিটেন আর্লি বার্ড ব্যাচ",
        category: "subjective-bcs",
        price: 5990,
        thumbnail: "/images/courses/bcs-written.jpg",
        duration: "৩ মাস",
        lectures: 60,
        students: 2100,
        instructor: "Senior Educators",
        features: [
            "রিটেন পরীক্ষার কৌশল",
            "উত্তর লেখার টেকনিক",
            "প্রতিটি বিষয়ের বিস্তারিত আলোচনা"
        ],
        description: "বিসিএস রিটেন পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি কোর্স।",
        syllabus: []
    },
    {
        id: "4",
        title: "50 BCS Model Test Batch",
        titleBangla: "মডেল টেস্ট ব্যাচ",
        category: "regular-bcs",
        price: 3990,
        thumbnail: "/images/courses/model-test.jpg",
        duration: "২ মাস",
        lectures: 40,
        students: 4500,
        instructor: "Test Experts",
        features: [
            "৫০টি মডেল টেস্ট",
            "বিস্তারিত সমাধান ও ব্যাখ্যা",
            "পারফরম্যান্স ট্র্যাকিং"
        ],
        description: "বিসিএস পরীক্ষার প্রস্তুতির জন্য বিশেষ মডেল টেস্ট ব্যাচ।",
        syllabus: []
    },
    {
        id: "5",
        title: "Bank Job Preli + Written Course 2024",
        titleBangla: "প্রিলি + রিটেন কোর্স ২০২৪",
        category: "bank",
        price: 8990,
        thumbnail: "/images/courses/bank-job.jpg",
        duration: "৪ মাস",
        lectures: 90,
        students: 3800,
        instructor: "Banking Experts",
        features: [
            "ব্যাংক পরীক্ষার সম্পূর্ণ প্রস্তুতি",
            "ম্যাথ ও ইংরেজিতে বিশেষ ফোকাস",
            "ব্যাংকিং বিষয়ক জ্ঞান"
        ],
        description: "সরকারি ও বেসরকারি ব্যাংকের চাকরির পরীক্ষার জন্য সম্পূর্ণ কোর্স।",
        syllabus: []
    },
    {
        id: "6",
        title: "6 AM Club - Productivity Course",
        titleBangla: "প্রোডাক্টিভিটি কোর্স",
        category: "am-club",
        price: 2990,
        thumbnail: "/images/courses/6am-club.jpg",
        duration: "১ মাস",
        lectures: 20,
        students: 6200,
        instructor: "Life Coach",
        features: [
            "প্রতিদিন সকাল ৬টায় লাইভ সেশন",
            "প্রোডাক্টিভিটি টিপস",
            "স্টাডি রুটিন প্ল্যানিং"
        ],
        description: "পড়াশোনার প্রোডাক্টিভিটি বৃদ্ধির জন্য বিশেষ কোর্স।",
        syllabus: []
    },
    {
        id: "7",
        title: "Medical Admission Course 2024",
        titleBangla: "মেডিকেল ভর্তি কোর্স ২০২৪",
        category: "medical",
        price: 12990,
        thumbnail: "/images/courses/medical.jpg",
        duration: "৬ মাস",
        lectures: 150,
        students: 2800,
        instructor: "Medical Educators",
        features: [
            "পদার্থ, রসায়ন, জীববিজ্ঞান",
            "মডেল টেস্ট ও সমাধান",
            "পূর্ববর্তী বছরের প্রশ্ন"
        ],
        description: "মেডিকেল কলেজে ভর্তির জন্য সম্পূর্ণ প্রস্তুতি কোর্স।",
        syllabus: []
    },
    {
        id: "8",
        title: "Primary Assistant Teacher Course",
        titleBangla: "প্রাইমারি সহকারী শিক্ষক কোর্স",
        category: "primary",
        price: 6990,
        thumbnail: "/images/courses/primary.jpg",
        duration: "৩ মাস",
        lectures: 70,
        students: 4100,
        instructor: "Primary Experts",
        features: [
            "প্রাইমারি পরীক্ষার সিলেবাস",
            "বাংলা ও ইংরেজি ব্যাকরণ",
            "গণিত ও সাধারণ জ্ঞান"
        ],
        description: "প্রাইমারি সহকারী শিক্ষক নিয়োগ পরীক্ষার প্রস্তুতি।",
        syllabus: []
    },
    {
        id: "9",
        title: "Free BCS Preparation Basics",
        titleBangla: "ফ্রি বিসিএস প্রস্তুতি বেসিক",
        category: "free",
        price: 0,
        thumbnail: "/images/courses/free-bcs.jpg",
        duration: "১ মাস",
        lectures: 15,
        students: 12000,
        instructor: "Community Teachers",
        features: [
            "বিসিএস প্রস্তুতির ভূমিকা",
            "সিলেবাস বিশ্লেষণ",
            "স্টাডি প্ল্যান তৈরি"
        ],
        description: "বিসিএস প্রস্তুতি শুরু করার জন্য ফ্রি কোর্স।",
        syllabus: [],
        isFeatured: true
    },
    // Add more courses for pagination testing
    {
        id: "10",
        title: "Advanced English for BCS",
        titleBangla: "এডভান্স ইংরেজি কোর্স",
        category: "regular-bcs",
        price: 4990,
        thumbnail: "/images/courses/english.jpg",
        duration: "২ মাস",
        lectures: 45,
        students: 3500,
        instructor: "English Expert",
        features: [
            "ইংরেজি গ্রামার",
            "ভোকাবুলারি",
            "রিডিং কম্প্রিহেনশন"
        ],
        description: "বিসিএস ইংরেজি পরীক্ষার জন্য উন্নত কোর্স।",
        syllabus: []
    }
];
const getCourseById = (id)=>{
    return MOCK_COURSES.find((course)=>course.id === id);
};
const getCoursesByCategory = (category)=>{
    if (!category) return MOCK_COURSES;
    return MOCK_COURSES.filter((course)=>course.category === category);
};
const getPaginatedCourses = (page = 1, pageSize = 10, category)=>{
    const filtered = category ? getCoursesByCategory(category) : MOCK_COURSES;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const courses = filtered.slice(start, end);
    return {
        courses,
        total,
        totalPages,
        page: currentPage
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/home/CourseCard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CourseCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
// src/components/home/CourseCard.tsx
'use client';
;
;
function CourseCard({ course }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative h-44 bg-gradient-to-br from-purple-600 to-blue-600",
                children: [
                    course.isEarlyBird && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-3 left-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold",
                        children: "Early Bird"
                    }, void 0, false, {
                        fileName: "[project]/components/home/CourseCard.tsx",
                        lineNumber: 19,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 flex items-center justify-center text-white p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm mb-1",
                                    children: "৫১ বিসিএস"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/CourseCard.tsx",
                                    lineNumber: 27,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-bold text-base leading-tight",
                                    children: course.titleBangla
                                }, void 0, false, {
                                    fileName: "[project]/components/home/CourseCard.tsx",
                                    lineNumber: 28,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/home/CourseCard.tsx",
                            lineNumber: 26,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/home/CourseCard.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/home/CourseCard.tsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: "font-semibold text-gray-800 mb-3 h-12 line-clamp-2",
                        children: course.title
                    }, void 0, false, {
                        fileName: "[project]/components/home/CourseCard.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-2xl font-bold text-blue-600",
                                children: course.price === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-green-600",
                                    children: "ফ্রি"
                                }, void 0, false, {
                                    fileName: "[project]/components/home/CourseCard.tsx",
                                    lineNumber: 46,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        "৳",
                                        course.price.toLocaleString()
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/components/home/CourseCard.tsx",
                                lineNumber: 44,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: `/courses/${course.id}`,
                                className: "bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors",
                                children: "বিস্তারিত"
                            }, void 0, false, {
                                fileName: "[project]/components/home/CourseCard.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/home/CourseCard.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/home/CourseCard.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/home/CourseCard.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = CourseCard;
var _c;
__turbopack_context__.k.register(_c, "CourseCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/home/CoursesSection.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CoursesSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$CourseFilters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/home/CourseFilters.tsx [app-client] (ecmascript)");
// import CourseCard from './CourseCard';
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$courseData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/courseData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$CourseCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/home/CourseCard.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
// src/components/home/CoursesSection.tsx
'use client';
;
;
;
;
;
function CoursesSection() {
    _s();
    const [selectedCategory, setSelectedCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    // Filter courses based on selected category
    const filteredCourses = selectedCategory === 'all' ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$courseData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MOCK_COURSES"] : __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$courseData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MOCK_COURSES"].filter((course)=>course.category === selectedCategory);
    // Show only first 8 courses on home page
    const displayedCourses = filteredCourses.slice(0, 8);
    const hasMoreCourses = filteredCourses.length > 8;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "py-12 md:py-16 bg-gray-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "container mx-auto px-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$CourseFilters$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    selectedCategory: selectedCategory,
                    onCategoryChange: setSelectedCategory
                }, void 0, false, {
                    fileName: "[project]/components/home/CoursesSection.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8",
                    children: displayedCourses.map((course)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$home$2f$CourseCard$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            course: course
                        }, course.id, false, {
                            fileName: "[project]/components/home/CoursesSection.tsx",
                            lineNumber: 37,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/home/CoursesSection.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                hasMoreCourses && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: `/courses?category=${selectedCategory}`,
                        className: "inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors",
                        children: [
                            "সকল কোর্স দেখুন (",
                            filteredCourses.length,
                            "টি কোর্স)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/home/CoursesSection.tsx",
                        lineNumber: 44,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/home/CoursesSection.tsx",
                    lineNumber: 43,
                    columnNumber: 11
                }, this),
                filteredCourses.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-12",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 text-lg",
                        children: "এই ক্যাটাগরিতে কোনো কোর্স পাওয়া যায়নি।"
                    }, void 0, false, {
                        fileName: "[project]/components/home/CoursesSection.tsx",
                        lineNumber: 56,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/home/CoursesSection.tsx",
                    lineNumber: 55,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/home/CoursesSection.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/home/CoursesSection.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
_s(CoursesSection, "ka1F1ceqEXioutdx48zEaS3nBME=");
_c = CoursesSection;
var _c;
__turbopack_context__.k.register(_c, "CoursesSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_b2fd3815._.js.map