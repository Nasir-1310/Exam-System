// Frontend/lib/modalHelpers.ts
import { ModalButton, ModalType } from "@/components/common/CustomModal";
import React from "react";

// Icon components as React elements
const createExamIcon = React.createElement(
  "svg",
  {
    className: "w-8 h-8 text-white",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
  },
  React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  }),
);

const createAddIcon = React.createElement(
  "svg",
  {
    className: "w-8 h-8 text-white",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
  },
  React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 6v6m0 0v6m0-6h6m-6 0H6",
  }),
);

const createEditIcon = React.createElement(
  "svg",
  {
    className: "w-8 h-8 text-white",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
  },
  React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  }),
);

const createDeleteIcon = React.createElement(
  "svg",
  {
    className: "w-8 h-8 text-white",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
  },
  React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  }),
);

const createBulkIcon = React.createElement(
  "svg",
  {
    className: "w-8 h-8 text-white",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
  },
  React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
  }),
);

// Pre-configured modal configurations for common use cases
export const modalConfigs = {
  // Success modals
  examCreated: {
    title: "পরীক্ষা তৈরি হয়েছে!",
    message: "আপনার পরীক্ষা সফলভাবে তৈরি হয়েছে।",
    type: "success" as ModalType,
    icon: createExamIcon,
  },

  questionAdded: {
    title: "প্রশ্ন যোগ হয়েছে!",
    message: "প্রশ্নটি সফলভাবে পরীক্ষায় যোগ করা হয়েছে।",
    type: "success" as ModalType,
    icon: createAddIcon,
  },

  questionUpdated: {
    title: "প্রশ্ন আপডেট হয়েছে!",
    message: "প্রশ্নটি সফলভাবে আপডেট করা হয়েছে।",
    type: "success" as ModalType,
    icon: createEditIcon,
  },

  questionDeleted: {
    title: "প্রশ্ন মুছে ফেলা হয়েছে!",
    message: "প্রশ্নটি সফলভাবে মুছে ফেলা হয়েছে।",
    type: "success" as ModalType,
    icon: createDeleteIcon,
  },

  bulkQuestionsAdded: {
    title: "প্রশ্নসমূহ যোগ হয়েছে!",
    message: "সব প্রশ্ন সফলভাবে পরীক্ষায় যোগ করা হয়েছে।",
    type: "success" as ModalType,
    icon: createBulkIcon,
  },

  // Error modals
  examCreationFailed: {
    title: "পরীক্ষা তৈরি ব্যর্থ!",
    message: "পরীক্ষা তৈরি করতে সমস্যা হয়েছে।",
    description:
      "অনুগ্রহ করে আবার চেষ্টা করুন বা সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।",
    type: "error" as ModalType,
  },

  questionAddFailed: {
    title: "প্রশ্ন যোগ করা যায়নি!",
    message: "প্রশ্নটি যোগ করতে সমস্যা হয়েছে।",
    description: "অনুগ্রহ করে তথ্যগুলো চেক করে আবার চেষ্টা করুন।",
    type: "error" as ModalType,
  },

  // Confirmation modals
  deleteExamConfirm: {
    title: "পরীক্ষা মুছে ফেলবেন?",
    message: "আপনি কি নিশ্চিত যে এই পরীক্ষাটি মুছে ফেলতে চান?",
    description: "এই কাজটি অসম্পূর্ণ এবং এটি পূর্বাবস্থায় ফেরানো যাবে না।",
    type: "confirm" as ModalType,
  },

  deleteQuestionConfirm: {
    title: "প্রশ্ন মুছে ফেলবেন?",
    message: "আপনি কি নিশ্চিত যে এই প্রশ্নটি মুছে ফেলতে চান?",
    description: "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।",
    type: "confirm" as ModalType,
  },

  // Warning modals
  examTimeWarning: {
    title: "সময় শেষ!",
    message: "আপনার পরীক্ষার সময় শেষ হয়ে গেছে।",
    description: "অনুগ্রহ করে আপনার উত্তরসমূহ জমা দিন।",
    type: "warning" as ModalType,
  },

  unsavedChanges: {
    title: "অসম্পূর্ণ পরিবর্তন!",
    message: "আপনার কিছু পরিবর্তন সেভ করা হয়নি।",
    description: "চলে যাওয়ার আগে পরিবর্তনগুলো সেভ করুন।",
    type: "warning" as ModalType,
  },
};

// Helper functions for common modal actions
export const createModalButtons = (
  confirmLabel: string = "ঠিক আছে",
  onConfirm: () => void,
  cancelLabel: string = "বাতিল",
  onCancel?: () => void,
): ModalButton[] => {
  const buttons: ModalButton[] = [
    {
      label: confirmLabel,
      onClick: onConfirm,
      variant: "primary",
    },
  ];

  if (onCancel) {
    buttons.unshift({
      label: cancelLabel,
      onClick: onCancel,
      variant: "secondary",
    });
  }

  return buttons;
};

// Updated return types to match CustomModal props
export const createSuccessModal = (
  title: string,
  subtitle: string,
  description?: string,
) => ({
  title,
  message: subtitle,
  description,
  type: "success" as ModalType,
  icon: "✓",
  iconColor: "bg-green-500",
  subtitle,
});

export const createErrorModal = (
  title: string,
  subtitle: string,
  description?: string,
) => ({
  title,
  message: subtitle,
  description,
  type: "error" as ModalType,
  icon: "✕",
  iconColor: "bg-red-500",
  subtitle,
});

export const createConfirmModal = (
  title: string,
  subtitle: string,
  onConfirm: () => void,
  description?: string,
  confirmLabel: string = "ঠিক আছে",
  cancelLabel: string = "বাতিল",
  onCancel?: () => void,
) => ({
  title,
  message: subtitle,
  description,
  type: "confirm" as ModalType,
  icon: "?",
  iconColor: "bg-yellow-500",
  subtitle,
  buttons: createModalButtons(confirmLabel, onConfirm, cancelLabel, onCancel),
});
