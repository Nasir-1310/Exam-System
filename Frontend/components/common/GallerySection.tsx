import React from "react";
import Button from "../ui/Button";
import { ArrowRight } from "lucide-react";

const GallerySection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Section - Shows on top for mobile */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop"
                  alt="Organization founder and lead instructor teaching BCS preparation course"
                  className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover"
                  loading="lazy"
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
                  আমরা বাংলাদেশের শীর্ষস্থানীয় বিসিএস প্রস্তুতি প্ল্যাটফর্ম।
                  আমাদের অভিজ্ঞ শিক্ষকমণ্ডলী এবং আধুনিক শিক্ষা পদ্ধতি দিয়ে আমরা
                  হাজার হাজার শিক্ষার্থীকে তাদের স্বপ্ন পূরণে সাহায্য করেছি।
                </p>
                <p>
                  ১০+ বছরের অভিজ্ঞতা এবং প্রমাণিত সাফল্যের হার নিয়ে আমরা
                  প্রতিটি শিক্ষার্থীকে ব্যক্তিগত মনোযোগ এবং সর্বোচ্চ মানের
                  শিক্ষা প্রদান করি।
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      অভিজ্ঞ শিক্ষক
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      দক্ষ ও অভিজ্ঞ শিক্ষকমণ্ডলী
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      আপডেট কন্টেন্ট
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      নিয়মিত আপডেট করা কোর্স
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      লাইভ সাপোর্ট
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      ২৪/৭ শিক্ষার্থী সহায়তা
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      সাফল্যের রেকর্ড
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      ৯৫%+ সাফল্যের হার
                    </p>
                  </div>
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
