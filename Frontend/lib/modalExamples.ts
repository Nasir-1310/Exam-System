// Frontend/lib/modalExamples.ts
// Examples of how to use the CustomModal component throughout the project

import CustomModal from '@/components/common/CustomModal';
import { modalConfigs, createSuccessModal, createErrorModal, createConfirmModal } from '@/lib/modalHelpers';

/*
USAGE EXAMPLES:

1. Using Pre-configured Modal Configurations:
   - Import the modalConfigs from '@/lib/modalHelpers'
   - Use the pre-configured settings for common actions

2. Creating Custom Modals:
   - Use createSuccessModal(), createErrorModal(), createConfirmModal() helpers
   - Or create custom configurations

3. Custom Modal with Full Control:
   - Use CustomModal component directly with all props

EXAMPLES IN COMPONENTS:
*/

// Example 1: Using pre-configured success modal
export const exampleSuccessUsage = `
import { modalConfigs } from '@/lib/modalHelpers';

const [showModal, setShowModal] = useState(false);

const handleSuccess = () => {
  setShowModal(true);
};

return (
  <>
    <button onClick={handleSuccess}>Show Success</button>

    <CustomModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      {...modalConfigs.examCreated}
    />
  </>
);
`;

// Example 2: Using helper functions for dynamic content
export const exampleDynamicUsage = `
import { createSuccessModal } from '@/lib/modalHelpers';

const [showModal, setShowModal] = useState(false);
const [modalConfig, setModalConfig] = useState(null);

const handleAddQuestion = async (questionData) => {
  try {
    await apiService.addQuestion(questionData);
    setModalConfig(createSuccessModal(
      'প্রশ্ন যোগ হয়েছে!',
      \`প্রশ্ন "\${questionData.content}" সফলভাবে যোগ করা হয়েছে।\`,
      'আপনি এখন আরও প্রশ্ন যোগ করতে পারেন।'
    ));
    setShowModal(true);
  } catch (error) {
    setModalConfig(createErrorModal(
      'প্রশ্ন যোগ করা যায়নি!',
      'প্রশ্ন যোগ করতে সমস্যা হয়েছে।',
      error.message
    ));
    setShowModal(true);
  }
};

return (
  <CustomModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    {...modalConfig}
  />
);
`;

// Example 3: Confirmation modal with custom actions
export const exampleConfirmationUsage = `
import { createConfirmModal } from '@/lib/modalHelpers';

const [showModal, setShowModal] = useState(false);
const [modalConfig, setModalConfig] = useState(null);

const handleDeleteClick = () => {
  setModalConfig(createConfirmModal(
    'প্রশ্ন মুছে ফেলবেন?',
    'আপনি কি নিশ্চিত যে এই প্রশ্নটি মুছে ফেলতে চান?',
    'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
    'মুছে ফেলুন',
    () => handleConfirmDelete(),
    'বাতিল করুন',
    () => setShowModal(false)
  ));
  setShowModal(true);
};

const handleConfirmDelete = async () => {
  try {
    await apiService.deleteQuestion(questionId);
    // Show success modal
    setModalConfig(modalConfigs.questionDeleted);
    setShowModal(true);
  } catch (error) {
    setModalConfig(createErrorModal(
      'মুছে ফেলা যায়নি!',
      'প্রশ্ন মুছে ফেলতে সমস্যা হয়েছে।',
      error.message
    ));
    setShowModal(true);
  }
};

return (
  <CustomModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    {...modalConfig}
  />
);
`;

// Example 4: Custom modal with full control
export const exampleCustomUsage = `
const [showModal, setShowModal] = useState(false);

return (
  <CustomModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    title="কাস্টম মডাল"
    message="এটি একটি কাস্টম মডাল উদাহরণ।"
    description="আপনি এখানে বিস্তারিত বর্ণনা যোগ করতে পারেন।"
    type="info"
    size="lg"
    icon={<CustomIcon />}
    buttons={[
      {
        label: 'প্রধান কাজ',
        onClick: () => console.log('Primary action'),
        variant: 'primary',
      },
      {
        label: 'সেকেন্ডারি',
        onClick: () => console.log('Secondary action'),
        variant: 'secondary',
      },
      {
        label: 'বাতিল',
        onClick: () => setShowModal(false),
        variant: 'secondary',
      },
    ]}
  />
);
`;

// Example 5: Using in different components
export const usageInComponents = `
// In AddQuestionModal.tsx
import { modalConfigs } from '@/lib/modalHelpers';

const handleSubmit = async () => {
  try {
    await apiService.addQuestion(formData);
    setModalConfig(modalConfigs.questionAdded);
    setShowModal(true);
  } catch (error) {
    setModalConfig(createErrorModal('Error', error.message));
    setShowModal(true);
  }
};

// In ExamDetailModal.tsx
const handleDeleteQuestion = (questionId) => {
  setModalConfig(createConfirmModal(
    'প্রশ্ন মুছে ফেলবেন?',
    'এই প্রশ্নটি মুছে ফেলা হবে।',
    null,
    'মুছে ফেলুন',
    () => confirmDelete(questionId)
  ));
  setShowModal(true);
};

// In BulkQuestionUploadModal.tsx
const handleSaveAll = async () => {
  try {
    await apiService.bulkAddQuestions(questions);
    setModalConfig(modalConfigs.bulkQuestionsAdded);
    setShowModal(true);
  } catch (error) {
    setModalConfig(createErrorModal(
      'ব্যর্থ হয়েছে',
      'প্রশ্নসমূহ যোগ করা যায়নি',
      error.message
    ));
    setShowModal(true);
  }
};
`;