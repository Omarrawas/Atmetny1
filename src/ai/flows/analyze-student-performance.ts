'use server';

/**
 * @fileOverview An AI agent that analyzes student performance and provides personalized recommendations.
 *
 * - analyzeStudentPerformance - A function that handles the analysis of student performance and provides recommendations.
 * - AnalyzeStudentPerformanceInput - The input type for the analyzeStudentPerformance function.
 * - AnalyzeStudentPerformanceOutput - The return type for the analyzeStudentPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStudentPerformanceInputSchema = z.object({
  examResults: z
    .string()
    .describe(
      'A string containing the student exam results, including the subject, topic, and score for each exam taken.'
    ),
  studentGoals: z
    .string()
    .optional()
    .describe('Optional: The student goals for this exam, if any.'),
});
export type AnalyzeStudentPerformanceInput = z.infer<typeof AnalyzeStudentPerformanceInputSchema>;

const AnalyzeStudentPerformanceOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'توصيات مخصصة باللغة العربية حول المواد أو المواضيع التي يحتاج الطالب للتركيز عليها لتحسين درجاته.'
    ),
  followUpQuestions: z
    .string()
    .optional()
    .describe('أسئلة توضيحية باللغة العربية لتحديد التوصيات بشكل أفضل.'),
});
export type AnalyzeStudentPerformanceOutput = z.infer<typeof AnalyzeStudentPerformanceOutputSchema>;

export async function analyzeStudentPerformance(
  input: AnalyzeStudentPerformanceInput
): Promise<AnalyzeStudentPerformanceOutput> {
  return analyzeStudentPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeStudentPerformancePrompt',
  input: {schema: AnalyzeStudentPerformanceInputSchema},
  output: {schema: AnalyzeStudentPerformanceOutputSchema},
  prompt: `أنت مساعد تعليمي يعمل بالذكاء الاصطناعي متخصص في تحليل أداء الطلاب في الاختبارات التدريبية.

ستتلقى نتائج اختبارات الطالب، بما في ذلك المادة والموضوع والدرجة لكل اختبار تم إجراؤه. ستتلقى أيضًا أهداف الطالب من هذا الاختبار، إن وجدت.

بناءً على هذه المعلومات، قدم توصيات مخصصة باللغة العربية حول المواد أو المواضيع التي يحتاج الطالب للتركيز عليها لتحسين درجاته. إذا لزم الأمر، اطرح أسئلة توضيحية باللغة العربية لتحديد التوصيات بشكل أفضل.

نتائج الاختبار: {{{examResults}}}
أهداف الطالب: {{{studentGoals}}}

التوصيات:
`,
});

const analyzeStudentPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeStudentPerformanceFlow',
    inputSchema: AnalyzeStudentPerformanceInputSchema,
    outputSchema: AnalyzeStudentPerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
