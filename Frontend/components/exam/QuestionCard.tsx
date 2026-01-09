// components/exam/QuestionCard.tsx
interface QuestionCardProps {
  questionNumber: number;
  content: string;
  options: string[];
  selectedAnswer?: number;
  onAnswerSelect: (index: number) => void;
}

export default function QuestionCard({
  questionNumber,
  content,
  options,
  selectedAnswer,
  onAnswerSelect,
}: QuestionCardProps) {
return (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Question {questionNumber}
        </span>
      </div>
      <p className="text-lg text-gray-900 font-medium mb-6">{content}</p>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedAnswer === index
                ? "border-blue-500 bg-blue-50 text-gray-900"
                : "border-gray-300 hover:border-gray-400 bg-white text-gray-800"
            }`}
          >
            <span className="font-bold mr-2 text-gray-900">
              {String.fromCharCode(65 + index)}.
            </span>
            <span className="text-gray-900">{option}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);
}