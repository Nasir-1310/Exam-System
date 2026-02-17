"use client";

import { useEffect, useMemo, useState } from "react";
import apiService from "@/lib/api";
import CustomModal from "@/components/common/CustomModal";

interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  early_bird_price?: number;
  early_bird_end_date?: string;
  discount?: number;
  discount_start_date?: string;
  discount_end_date?: string;
  is_free?: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);

const initialForm: Course = {
  id: 0,
  title: "",
  description: "",
  thumbnail: "",
  price: 0,
  early_bird_price: 0,
  early_bird_end_date: today(),
  discount: 0,
  discount_start_date: today(),
  discount_end_date: today(),
  is_free: false,
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Course>(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: "", message: "", description: "" });
  const [studentModalCourse, setStudentModalCourse] = useState<Course | null>(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [courseStudents, setCourseStudents] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllCourses();
      setCourses(Array.isArray(data) ? data : data?.data || []);
    } catch (err: any) {
      setModalMessage({
        title: "লোড ব্যর্থ",
        message: err?.message || "কোর্স লোড করতে ব্যর্থ।",
        description: "দয়া করে আবার চেষ্টা করুন।",
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await apiService.getAllUsers();
      setAvailableUsers(users);
    } catch (err: any) {
      setModalMessage({
        title: "ইউজার লোড ব্যর্থ",
        message: err?.message || "ইউজার তালিকা আনা যায়নি",
        description: "আবার চেষ্টা করুন।",
      });
      setShowErrorModal(true);
    }
  };

  const loadCourseStudents = async (courseId: number) => {
    try {
      setLoadingStudents(true);
      const students = await apiService.getCourseStudents(courseId);
      setCourseStudents(Array.isArray(students) ? students : students?.data || []);
    } catch (err: any) {
      setModalMessage({
        title: "স্টুডেন্ট লোড ব্যর্থ",
        message: err?.message || "স্টুডেন্ট তালিকা আনা যায়নি",
        description: "আবার চেষ্টা করুন।",
      });
      setShowErrorModal(true);
    } finally {
      setLoadingStudents(false);
    }
  };

  const openCreateForm = () => {
    setForm(initialForm);
    setEditingCourseId(null);
    setShowForm(true);
  };

  const normalizeDate = (value?: string) => {
    if (!value) return today();
    return value.slice(0, 10);
  };

  const startEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setForm({
      ...course,
      early_bird_end_date: normalizeDate(course.early_bird_end_date),
      discount_start_date: normalizeDate(course.discount_start_date),
      discount_end_date: normalizeDate(course.discount_end_date),
    });
    setShowForm(true);
  };

  const openStudentsManager = async (course: Course) => {
    setStudentModalCourse(course);
    setShowStudentsModal(true);
    await Promise.all([loadUsers(), loadCourseStudents(course.id)]);
  };

  const handleInput = (key: keyof Course, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveCourse = async () => {
    if (!form.title) {
      setModalMessage({ title: "শিরোনাম দিন", message: "কোর্সের শিরোনাম প্রয়োজন", description: "" });
      setShowErrorModal(true);
      return;
    }

    const payload = {
      title: form.title,
      description: form.description || "",
      thumbnail: form.thumbnail || "https://placehold.co/600x400",
      price: form.is_free ? 0 : Number(form.price || 0),
      early_bird_price: form.is_free ? 0 : Number(form.early_bird_price || 0),
      early_bird_end_date: form.early_bird_end_date || today(),
      discount: Number(form.discount || 0),
      discount_start_date: form.discount_start_date || today(),
      discount_end_date: form.discount_end_date || today(),
      is_free: Boolean(form.is_free),
    };

    try {
      setSaving(true);
      if (editingCourseId) {
        await apiService.updateCourse(editingCourseId, payload);
        setModalMessage({ title: "আপডেট সফল", message: "কোর্স আপডেট হয়েছে", description: "" });
      } else {
        await apiService.createCourse(payload);
        setModalMessage({ title: "সফল", message: "কোর্স তৈরি হয়েছে", description: "" });
      }
      setShowSuccessModal(true);
      setShowForm(false);
      setForm(initialForm);
      setEditingCourseId(null);
      await loadCourses();
    } catch (err: any) {
      setModalMessage({ title: "ব্যর্থ", message: err?.message || "কোর্স সংরক্ষণ হয়নি", description: "" });
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    const ok = window.confirm("কোর্স মুছবেন?");
    if (!ok) return;
    try {
      await apiService.deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err: any) {
      setModalMessage({ title: "মুছতে ব্যর্থ", message: err?.message || "কোর্স মুছতে ব্যর্থ", description: "" });
      setShowErrorModal(true);
    }
  };

  const handleAddStudent = async () => {
    if (!studentModalCourse || !selectedStudentId) return;
    try {
      await apiService.enrollUserInCourse({ user_id: Number(selectedStudentId), course_id: studentModalCourse.id });
      setSelectedStudentId("");
      await loadCourseStudents(studentModalCourse.id);
      setModalMessage({ title: "সফল", message: "স্টুডেন্ট যোগ হয়েছে", description: "" });
      setShowSuccessModal(true);
    } catch (err: any) {
      setModalMessage({ title: "ব্যর্থ", message: err?.message || "স্টুডেন্ট যোগ হয়নি", description: "" });
      setShowErrorModal(true);
    }
  };

  const handleRemoveStudent = async (userId: number) => {
    if (!studentModalCourse) return;
    try {
      await apiService.removeUserFromCourse(studentModalCourse.id, userId);
      await loadCourseStudents(studentModalCourse.id);
    } catch (err: any) {
      setModalMessage({ title: "ব্যর্থ", message: err?.message || "স্টুডেন্ট বাদ দেয়া যায়নি", description: "" });
      setShowErrorModal(true);
    }
  };

  const totalPaid = useMemo(() => courses.filter((c) => !c.is_free).length, [courses]);
  const totalFree = useMemo(() => courses.filter((c) => c.is_free).length, [courses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">কোর্স পরিচালনা</h1>
          <p className="text-gray-600">কোর্স তৈরি, তালিকা ও মুছে ফেলুন</p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          নতুন কোর্স
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard title="মোট কোর্স" value={courses.length} color="indigo" />
        <StatCard title="পেইড কোর্স" value={totalPaid} color="green" />
        <StatCard title="ফ্রি কোর্স" value={totalFree} color="blue" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">সকল কোর্স</h2>
          <button
            onClick={loadCourses}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            রিফ্রেশ
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">শিরোনাম</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মূল্য</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">কাজ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    কোনো কোর্স নেই
                  </td>
                </tr>
              ) : (
                courses.map((course) => {
                  const price = Number(course.price || 0);
                  const earlyBird = Number(course.early_bird_price || 0);
                  return (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-xs text-gray-500 line-clamp-2">{course.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.is_free ? "ফ্রি" : `৳${price}`}
                        {!course.is_free && earlyBird > 0 && (
                          <span className="ml-2 text-xs text-emerald-600">EB: ৳{earlyBird}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          course.is_free ? "bg-green-100 text-green-800" : "bg-indigo-100 text-indigo-800"
                        }`}>
                          {course.is_free ? "ফ্রি" : "পেইড"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => startEditCourse(course)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            সম্পাদনা
                          </button>
                          <button
                            onClick={() => openStudentsManager(course)}
                            className="text-emerald-600 hover:text-emerald-800 font-medium"
                          >
                            স্টুডেন্ট
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            মুছে ফেলুন
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{editingCourseId ? "কোর্স আপডেট" : "নতুন কোর্স"}</h3>
              <button onClick={() => { setShowForm(false); setEditingCourseId(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleInput("title", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                  placeholder="কোর্স শিরোনাম"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বর্ণনা</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleInput("description", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                  rows={3}
                  placeholder="কোর্স সম্পর্কে লিখুন"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">থাম্বনেইল URL</label>
                <input
                  type="text"
                  value={form.thumbnail}
                  onChange={(e) => handleInput("thumbnail", e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মূল্য (৳)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleInput("price", Number(e.target.value))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                    disabled={form.is_free}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">আর্লি বার্ড মূল্য (৳)</label>
                  <input
                    type="number"
                    value={form.early_bird_price}
                    onChange={(e) => handleInput("early_bird_price", Number(e.target.value))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                    disabled={form.is_free}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">আর্লি বার্ড শেষ তারিখ</label>
                  <input
                    type="date"
                    value={form.early_bird_end_date}
                    onChange={(e) => handleInput("early_bird_end_date", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ডিসকাউন্ট (%)</label>
                  <input
                    type="number"
                    value={form.discount}
                    onChange={(e) => handleInput("discount", Number(e.target.value))}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <input
                    id="is_free"
                    type="checkbox"
                    checked={form.is_free}
                    onChange={(e) => handleInput("is_free", e.target.checked)}
                    className="h-4 w-4 text-gray-700 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <label htmlFor="is_free" className="text-sm text-gray-700">ফ্রি কোর্স</label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ডিসকাউন্ট শুরু</label>
                  <input
                    type="date"
                    value={form.discount_start_date}
                    onChange={(e) => handleInput("discount_start_date", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ডিসকাউন্ট শেষ</label>
                  <input
                    type="date"
                    value={form.discount_end_date}
                    onChange={(e) => handleInput("discount_end_date", e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveCourse}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
              >
                {saving ? "সংরক্ষণ হচ্ছে..." : editingCourseId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStudentsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">স্টুডেন্ট ম্যানেজ ({studentModalCourse?.title})</h3>
                <p className="text-sm text-gray-500">কোর্সে স্টুডেন্ট যোগ/সরান</p>
              </div>
              <button onClick={() => { setShowStudentsModal(false); setStudentModalCourse(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : "")}
                  className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                >
                  <option value="">স্টুডেন্ট নির্বাচন করুন</option>
                  {availableUsers.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddStudent}
                  className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  disabled={!selectedStudentId}
                >
                  যোগ করুন
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">ভর্তি হওয়া স্টুডেন্ট</h4>
                  {loadingStudents && <span className="text-sm text-gray-500">লোড হচ্ছে...</span>}
                </div>
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {!loadingStudents && courseStudents.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">কোনো স্টুডেন্ট নেই</div>
                  )}
                  {courseStudents.map((student: any) => (
                    <div key={student.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        সরান
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={modalMessage.title}
        message={modalMessage.message}
        description={modalMessage.description}
        type="success"
        buttons={[{ label: "ঠিক আছে", onClick: () => setShowSuccessModal(false), variant: "primary" }]}
      />

      <CustomModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalMessage.title}
        message={modalMessage.message}
        description={modalMessage.description}
        type="error"
        buttons={[{ label: "ঠিক আছে", onClick: () => setShowErrorModal(false), variant: "primary" }]}
      />
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: "indigo" | "green" | "blue" }) {
  const colors = {
    indigo: "from-indigo-500 to-purple-600",
    green: "from-green-500 to-emerald-600",
    blue: "from-blue-500 to-indigo-500",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <div className={`mt-3 h-1.5 rounded-full bg-gradient-to-r ${colors[color]}`} />
    </div>
  );
}
