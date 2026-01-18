// Frontend/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Loading Animation */}
          <div className="mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            লোড হচ্ছে...
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600 mb-6">
            অনুগ্রহ করে অপেক্ষা করুন
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>

          {/* Loading Text */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}