
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeStudentPerformance, type AnalyzeStudentPerformanceInput, type AnalyzeStudentPerformanceOutput } from '@/ai/flows/analyze-student-performance';
import { Loader2, MessageSquare, Lightbulb } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseAuthUser } from 'firebase/auth';
import { saveAiAnalysis } from '@/lib/examService'; // Import the new service function

const formSchema = z.object({
  examResults: z.string().min(10, { message: "الرجاء إدخال نتائج اختبارات مفصلة." }),
  studentGoals: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AiAnalysisClientForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeStudentPerformanceOutput | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseAuthUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examResults: '',
      studentGoals: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!currentUser) {
      toast({
        title: "مستخدم غير مسجل",
        description: "يجب تسجيل الدخول لحفظ نتائج التحليل.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const input: AnalyzeStudentPerformanceInput = {
        examResults: data.examResults,
        studentGoals: data.studentGoals,
      };
      const result = await analyzeStudentPerformance(input);
      setAnalysisResult(result);

      // Save the analysis result to Firestore
      if (result.recommendations) { // Ensure there are recommendations to save
        await saveAiAnalysis({
          userId: currentUser.uid,
          inputExamResultsText: data.examResults,
          inputStudentGoalsText: data.studentGoals,
          recommendations: result.recommendations,
          followUpQuestions: result.followUpQuestions,
        });
        toast({
          title: "تم التحليل والحفظ بنجاح",
          description: "تم إنشاء توصياتك الشخصية وحفظها.",
        });
      } else {
        toast({
          title: "تم التحليل",
          description: "تم إنشاء توصياتك الشخصية (ولكن لم يتم حفظها لعدم وجود توصيات).",
          variant: "default"
        });
      }
      
    } catch (error) {
      console.error("AI Analysis or Saving Error:", error);
      toast({
        title: "خطأ في التحليل أو الحفظ",
        description: "حدث خطأ أثناء محاولة تحليل أدائك أو حفظ النتائج. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="examResults"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">نتائج الاختبار</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="مثال: الرياضيات - الجبر: 70%، التفاضل: 60%. الفيزياء - الميكانيكا: 80%..."
                    className="min-h-[120px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  أدخل نتائج اختباراتك بالتفصيل، مع ذكر المادة، الموضوع، والدرجة.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">أهدافك (اختياري)</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: أريد التركيز على تحسين درجاتي في الكيمياء العضوية." {...field} />
                </FormControl>
                <FormDescription>
                  شارك أهدافك الدراسية أو المجالات التي ترغب في التركيز عليها.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading || !currentUser} className="w-full text-lg py-6">
            {isLoading ? (
              <>
                <Loader2 className="ms-2 h-5 w-5 animate-spin" />
                جاري التحليل...
              </>
            ) : (
              'احصل على تحليل لأدائك'
            )}
          </Button>
          {!currentUser && <p className="text-sm text-destructive text-center">يجب تسجيل الدخول لاستخدام هذه الميزة.</p>}
        </form>
      </Form>

      {analysisResult && (
        <div className="mt-8 space-y-6">
          <Card className="bg-primary/10 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-primary">
                <Lightbulb className="h-6 w-6" />
                التوصيات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{analysisResult.recommendations}</p>
            </CardContent>
          </Card>
          {analysisResult.followUpQuestions && (
            <Card className="bg-accent/20 border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-accent-foreground">
                  <MessageSquare className="h-6 w-6" />
                  أسئلة متابعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{analysisResult.followUpQuestions}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
