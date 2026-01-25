//Frontend/app/(frontend)/page.tsx
import CoursesSection from '@/components/home/CoursesSection';
import GallerySection from "@/components/common/GallerySection";

export const metadata = {
  title: 'হোম',
  description: 'বিসিএস, ব্যাংক, প্রাইমারি সহ সকল চাকরির পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি',
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Gallery Section */}
      <GallerySection />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            আপনার স্বপ্নপূরণের প্রভাবে আমাদের কোর্সসমূহ
          </h1>
          <p className="text-lg md:text-xl mb-6 md:mb-8 text-blue-100">
            বিসিএস, ব্যাংক, প্রাইমারি সহ সকল চাকরির পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি
          </p>
        </div>
      </section>

      {/* Courses Section */}
      <CoursesSection />
    </div>
  );
}