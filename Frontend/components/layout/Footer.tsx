import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4">Alokbortika Edu</h3>
            <p className="text-gray-400 text-sm">
              বিসিএস ও অন্যান্য চাকরি পরীক্ষার জন্য দেশের সেরা অনলাইন প্ল্যাটফর্ম
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/courses" className="hover:text-white">কোর্স সমূহ</Link></li>
              <li><Link href="/books" className="hover:text-white">বুক</Link></li>
              <li><Link href="/about" className="hover:text-white">আমাদের সম্পর্কে</Link></li>
              <li><Link href="/contact" className="hover:text-white">যোগাযোগ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">সাহায্য</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/faq" className="hover:text-white">প্রশ্ন উত্তর</Link></li>
              <li><Link href="/privacy" className="hover:text-white">গোপনীয়তা নীতি</Link></li>
              <li><Link href="/terms" className="hover:text-white">শর্তাবলী</Link></li>
              <li><Link href="/refund" className="hover:text-white">রিফান্ড নীতি</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">সোশ্যাল মিডিয়া</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Linkedin size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Youtube size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 Alokbortika Edu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}