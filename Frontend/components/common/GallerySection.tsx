import React from "react";
import Button from "../ui/Button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const GallerySection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Section - Shows on top for mobile */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] sm:h-[500px] lg:h-[600px]">
                <Image
                  src="/FounderTeachingBCS.png"
                  alt="Organization founder and lead instructor teaching BCS preparation course"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Content Section - Shows below image on mobile */}
          <div className="order-2 lg:order-1">
            <div className="space-y-6">
              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                আমাদের সম্পর্কে
              </h2>

              {/* Description */}
              <div className="space-y-4 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>
                  আপনার ক্যারিয়ারের স্বপ্ন পূরণে &apos;Alokbortika&apos; অঙ্গীকারবদ্ধ। বিসিএস, ব্যাংক কিংবা সরকারি চাকরির যেকোনো প্রস্তুতিতে ঘরে বসেই সেরা গাইডলাইন পেতে আমাদের অনলাইন প্ল্যাটফর্মটিই হতে পারে আপনার প্রথম পছন্দ। চলুন, একসাথে আমরা সাফল্যের গল্প লিখি। । ।
                </p>

                <p className="font-semibold">Alokbortika প্ল্যাটফর্ম থেকে চলমান কোর্সসমূহ:</p>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-gray-700">৫১তম বিসিএস প্রিলি কোর্স</div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-gray-700">৫১তম বিসিএস প্রিলি ও রিটেন কম্বো কোর্স</div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-gray-700">২৪ ভিত্তিক ব্যাংক প্রিলি প্লাস রিটেন কোর্স</div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-gray-700">এনএসআই (NSI) প্রি-প্রস্তুতি কোর্স</div>
                  </li>
                </ul>

                <p>
                  এটি একটি সম্পূর্ণ অনলাইন ভিত্তিক সেরা প্ল্যাটফর্ম, যার ফলে আপনি ঘরে বসেই অভিজ্ঞ মেন্টরদের তত্ত্বাবধানে প্রস্তুতির সুযোগ পাবেন।
                </p>

                <div className="mt-2 text-sm space-y-1 text-gray-700">
                  <p>✅ হোয়াটসঅ্যাপ:  <Link className="text-blue-800 hover:text-blue-400 hover:underline" href="https://wa.me/01600268193">01600-268193</Link></p>
                  <p>✅ ফেসবুক পেজ: <Link  className="text-blue-800 hover:text-blue-400 hover:underline" href="https://www.facebook.com/AlokbortikaBCSBank">Alokbortika Bank BCS</Link></p>
                </div>
              </div>

              <Button
                href="/about"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={18} />}
                iconPosition="right"
                className="mt-6"
              >
                আরও জানুন
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
