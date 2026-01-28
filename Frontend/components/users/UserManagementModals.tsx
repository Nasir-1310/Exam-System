// Frontend/components/users/UserManagementModals.tsx
'use client';

import React, { useState, useEffect } from 'react';
import CustomModal from '@/components/common/CustomModal';
import type { User, UserCreate, UserUpdate } from '@/types/user';
import type { Course } from '@/types/course';
import { userModalConfigs, createUserModalButtons } from '@/lib/userHelpers';

interface UserManagementModalsProps {
  // Add/Edit User Modal
  showAddUserModal: boolean;
  showEditUserModal: boolean;
  editingUser: User | null;
  courses: Course[];
  onCloseUserModal: () => void;
  onSubmitUser: (data: UserCreate | UserUpdate, isEdit: boolean) => Promise<void>;
  
  // Delete Confirmation Modal
  showDeleteModal: boolean;
  deletingUser: User | null;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => Promise<void>;
  
  // Result Modals
  showResultModal: boolean;
  resultModalConfig: any;
  onCloseResultModal: () => void;
}

const UserManagementModals: React.FC<UserManagementModalsProps> = ({
  showAddUserModal,
  showEditUserModal,
  editingUser,
  courses,
  onCloseUserModal,
  onSubmitUser,
  showDeleteModal,
  deletingUser,
  onCloseDeleteModal,
  onConfirmDelete,
  showResultModal,
  resultModalConfig,
  onCloseResultModal,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    active_mobile: '',
    role: 'USER' as 'USER' | 'MODERATOR',
    course_ids: [] as number[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Initialize form data when editing
  useEffect(() => {
    if (showEditUserModal && editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        password: '', // Don't show password
        active_mobile: editingUser.active_mobile || '',
        role: editingUser.role === 'ADMIN' ? 'MODERATOR' : editingUser.role,
        course_ids: editingUser.courses?.map(c => c.id) || [],
      });
    } else if (showAddUserModal) {
      setFormData({
        name: '',
        email: '',
        password: '',
        active_mobile: '',
        role: 'USER',
        course_ids: [],
      });
    }
  }, [showEditUserModal, showAddUserModal, editingUser]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      active_mobile: '',
      role: 'USER',
      course_ids: [],
    });
    setValidationError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setValidationError('নাম লিখুন');
      return false;
    }
    if (!formData.email.trim()) {
      setValidationError('ইমেইল লিখুন');
      return false;
    }
    if (!showEditUserModal && !formData.password.trim()) {
      setValidationError('পাসওয়ার্ড লিখুন');
      return false;
    }
    if (formData.course_ids.length === 0) {
      setValidationError('অন্তত একটি কোর্স নির্বাচন করুন');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const submitData = showEditUserModal
        ? {
            name: formData.name,
            email: formData.email,
            ...(formData.password && { password: formData.password }),
            active_mobile: formData.active_mobile || undefined,
            role: formData.role,
            course_ids: formData.course_ids,
          }
        : formData;

      await onSubmitUser(submitData, showEditUserModal);
      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onCloseUserModal();
  };

  return (
    <>
      {/* Add/Edit User Modal */}
      {(showAddUserModal || showEditUserModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  showEditUserModal 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                    : formData.role === 'MODERATOR'
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showEditUserModal ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    )}
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {showEditUserModal 
                      ? 'ব্যবহারকারীর তথ্য সম্পাদনা' 
                      : formData.role === 'MODERATOR'
                      ? 'নতুন মডারেটর যোগ করুন'
                      : 'নতুন ব্যবহারকারী যোগ করুন'
                    }
                  </h3>
                  <p className="text-sm text-gray-600">
                    {showEditUserModal ? 'তথ্য আপডেট করুন' : 'প্রয়োজনীয় তথ্য পূরণ করুন'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-5">
              {/* Validation Error */}
              {validationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800">{validationError}</p>
                </div>
              )}

              {/* Role Selection (only for add) */}
              {!showEditUserModal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ভূমিকা <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'USER' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.role === 'USER'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.role === 'USER' ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                          <svg className={`w-6 h-6 ${formData.role === 'USER' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">ব্যবহারকারী</div>
                          <div className="text-xs text-gray-600">সাধারণ ব্যবহারকারী</div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'MODERATOR' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.role === 'MODERATOR'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          formData.role === 'MODERATOR' ? 'bg-purple-500' : 'bg-gray-200'
                        }`}>
                          <svg className={`w-6 h-6 ${formData.role === 'MODERATOR' ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">মডারেটর</div>
                          <div className="text-xs text-gray-600">কোর্স পরিচালক</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="পূর্ণ নাম লিখুন"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ইমেইল <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    পাসওয়ার্ড {!showEditUserModal && <span className="text-red-500">*</span>}
                    {showEditUserModal && <span className="text-sm text-gray-500 font-normal">(ঐচ্ছিক)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={showEditUserModal ? "নতুন পাসওয়ার্ড (ঐচ্ছিক)" : "পাসওয়ার্ড লিখুন"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    মোবাইল নম্বর <span className="text-sm text-gray-500 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.active_mobile}
                    onChange={(e) => setFormData({ ...formData, active_mobile: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>

              {/* Course Selection */}
              {/* <CourseSelector
                courses={courses}
                selectedCourseIds={formData.course_ids}
                onChange={(courseIds) => setFormData({ ...formData, course_ids: courseIds })}
                required
              /> */}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                বাতিল
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    প্রক্রিয়াকরণ...
                  </span>
                ) : (
                  showEditUserModal ? 'আপডেট করুন' : 'যোগ করুন'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUser && (
        <CustomModal
          isOpen={showDeleteModal}
          onClose={onCloseDeleteModal}
          {...userModalConfigs.deleteUserConfirm(deletingUser.name)}
          buttons={createUserModalButtons(
            'মুছে ফেলুন',
            onConfirmDelete,
            onCloseDeleteModal
          )}
        />
      )}

      {/* Result Modal */}
      {showResultModal && resultModalConfig && (
        <CustomModal
          isOpen={showResultModal}
          onClose={onCloseResultModal}
          {...resultModalConfig}
        />
      )}
    </>
  );
};

export default UserManagementModals;