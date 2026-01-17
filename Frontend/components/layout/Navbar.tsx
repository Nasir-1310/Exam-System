'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import apiService from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(apiService.isAuthenticated());
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(apiService.isAuthenticated());
    };

    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('nav')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when menu is open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = () => {
    apiService.logout();
    setIsLoggedIn(false);
    router.push('/auth/login');
  };

  const navItems = [
    { label: 'হোম', href: '/' },
    { label: 'কোর্স সমূহ', href: '/courses' },
    { label: 'বিসিএস কোর্স', href: '/bcs-course' },
    { label: 'ব্যাংক জব কোর্স', href: '/bank-course' },
    { label: 'বুক', href: '/books' },
    { label: 'ফ্রি কোর্স', href: '/free-course' },
    { label: 'পরিক্ষা', href: '/exam' },
  ];

  // Loading skeleton
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-sm sm:text-base md:text-lg font-bold text-gray-800 truncate max-w-[150px] sm:max-w-none">
                BCS Preparation
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">
            {/* Logo - Responsive sizing */}
            <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md transform hover:scale-105 transition-transform duration-200">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-sm sm:text-base md:text-lg font-bold text-gray-800 truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none">
                BCS Preparation
              </span>
            </Link>

            {/* Desktop Navigation - Hidden on smaller screens */}
            <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200 whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop Login/Logout Button */}
            <div className="hidden lg:block flex-shrink-0">
              {isLoggedIn ? (
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="whitespace-nowrap text-xs xl:text-sm"
                >
                  লগআউট
                </Button>
              ) : (
                <Button
                  href="/auth/login"
                  variant="primary"
                  size="sm"
                  className="whitespace-nowrap text-xs xl:text-sm"
                >
                  লগইন
                </Button>
              )}
            </div>

            {/* Mobile menu button - Responsive */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-4 sm:w-6 sm:h-5 relative flex flex-col justify-center">
                  <span
                    className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${
                      isOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5 sm:-translate-y-2'
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-full bg-current transition-all duration-300 ease-in-out ${
                      isOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <span
                    className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ease-in-out ${
                      isOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5 sm:translate-y-2'
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed top-16 sm:top-18 md:top-20 left-0 right-0 z-40 lg:hidden transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-200/50 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-4.5rem)] md:max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="px-3 sm:px-4 md:px-6 pt-2 pb-4 space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 active:bg-blue-100/50 rounded-lg transition-all duration-200"
                style={{
                  animation: isOpen ? `slideIn 0.3s ease-out ${index * 0.05}s both` : 'none'
                }}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Login/Logout Button */}
            <div className="pt-3 sm:pt-4">
              {isLoggedIn ? (
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  variant="secondary"
                  size="sm"
                  fullWidth
                  className="text-sm sm:text-base"
                >
                  লগআউট
                </Button>
              ) : (
                <Button
                  href="/auth/login"
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => setIsOpen(false)}
                  className="text-sm sm:text-base"
                >
                  লগইন
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}