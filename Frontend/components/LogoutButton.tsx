// // components/LogoutButton.tsx
// 'use client';

// import { useRouter } from 'next/navigation';
// import apiService from '@/lib/api';

// export default function LogoutButton() {
//   const router = useRouter();

//   const handleLogout = () => {
//     apiService.logout();
//     router.push('/auth/login');
//     router.refresh(); // Force refresh to clear middleware cache
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//     >
//       লগআউট
//     </button>
//   );
// }