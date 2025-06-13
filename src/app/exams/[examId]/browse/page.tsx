
'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ExamBrowseView from '@/components/exam/exam-browse-view'; // Import the new component
import type { Question as QuestionType } from '@/lib/types';

export default function ExamBrowsePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;

  // Extract browse parameters from URL search params
  const initialNumQuestionsParam = searchParams.get('numQ');
  const initialNumQuestions = initialNumQuestionsParam ? parseInt(initialNumQuestionsParam, 10) : undefined;
  const initialOrder = searchParams.get('order') as 'sequential' | 'random' | undefined;
  const initialDifficulty = searchParams.get('difficulty') as QuestionType['difficulty'] | 'all' | undefined;
  const initialViewMode = searchParams.get('viewMode') as 'single' | 'list' | undefined;

  return (
    <ExamBrowseView
      examId={examId}
      initialNumQuestions={initialNumQuestions}
      initialOrder={initialOrder || 'sequential'} // Default if not provided
      initialDifficulty={initialDifficulty || 'all'}   // Default if not provided
      initialViewMode={initialViewMode || 'single'} // Default if not provided
      hideChangeSettingsButton={false} // Show the button on the standalone page
    />
  );
}
