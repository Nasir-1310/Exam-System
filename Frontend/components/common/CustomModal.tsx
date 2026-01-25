// Frontend/components/common/CustomModal.tsx
'use client';

import React from 'react';

export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface ModalButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  description?: string;
  type?: ModalType;
  icon?: React.ReactNode;
  buttons?: ModalButton[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  backdropBlur?: boolean;
  className?: string;
}

// Icon components for different types
const getTypeIcon = (type: ModalType) => {
  const iconClass = "w-8 h-8 text-white";

  switch (type) {
    case 'success':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    case 'info':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'confirm':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
};

const getTypeStyles = (type: ModalType) => {
  switch (type) {
    case 'success':
      return {
        iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
        titleColor: 'text-green-900',
        buttonPrimary: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      };
    case 'error':
      return {
        iconBg: 'bg-gradient-to-br from-red-500 to-pink-600',
        titleColor: 'text-red-900',
        buttonPrimary: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
      };
    case 'warning':
      return {
        iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-600',
        titleColor: 'text-yellow-900',
        buttonPrimary: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
      };
    case 'info':
      return {
        iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        titleColor: 'text-blue-900',
        buttonPrimary: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
      };
    case 'confirm':
      return {
        iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
        titleColor: 'text-purple-900',
        buttonPrimary: 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700',
      };
    default:
      return {
        iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
        titleColor: 'text-gray-900',
        buttonPrimary: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
      };
  }
};

const getSizeStyles = (size: 'sm' | 'md' | 'lg' | 'xl') => {
  switch (size) {
    case 'sm':
      return 'max-w-sm';
    case 'md':
      return 'max-w-md';
    case 'lg':
      return 'max-w-lg';
    case 'xl':
      return 'max-w-xl';
    default:
      return 'max-w-md';
  }
};

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  description,
  type = 'info',
  icon,
  buttons = [],
  size = 'md',
  showCloseButton = true,
  backdropBlur = true,
  className = '',
}) => {
  if (!isOpen) return null;

  const typeStyles = getTypeStyles(type);
  const sizeClass = getSizeStyles(size);
  const defaultIcon = getTypeIcon(type);

  // Default buttons if none provided
  const defaultButtons: ModalButton[] = [
    {
      label: 'ঠিক আছে',
      onClick: onClose,
      variant: 'primary',
    },
  ];

  const modalButtons = buttons.length > 0 ? buttons : defaultButtons;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        backdropBlur ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/50'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-gray-100 ${sizeClass} w-full mx-auto transform transition-all duration-300 scale-100 ${className}`}
      >
        {/* Header with Icon and Close Button */}
        <div className="flex justify-between items-start p-6 pb-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Icon */}
            <div className={`w-12 h-12 ${typeStyles.iconBg} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
              {icon || defaultIcon}
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h2 className={`text-xl font-bold ${typeStyles.titleColor} break-words`}>
                {title}
              </h2>
            </div>
          </div>

          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 flex-shrink-0 ml-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Main Message */}
          <p className="text-gray-700 text-base leading-relaxed mb-3">
            {message}
          </p>

          {/* Optional Description */}
          {description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            {modalButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                disabled={button.disabled}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  button.variant === 'primary'
                    ? typeStyles.buttonPrimary + ' text-white'
                    : button.variant === 'danger'
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
                    : button.variant === 'secondary'
                    ? 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    : typeStyles.buttonPrimary + ' text-white'
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;