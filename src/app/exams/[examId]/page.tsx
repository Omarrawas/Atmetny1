
'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Send, Loader2, AlertTriangle, TimerIcon, AlertCircle } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { getExamById, saveExamAttempt } from "@/lib/examService";
import type { Exam as ExamType, Question as QuestionType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseAuthUser } from "firebase/auth";

const DEFAULT_SECONDS_PER_QUESTION = 90;

// This function is now less critical if durationInMinutes is always present
// but can serve as a fallback if duration needs to be calculated from question count.
function calculateDurationInSeconds(numQuestions?: number, examDurationMinutes?: number): number {
  if (examDurationMinutes && examDurationMinutes > 0) {
    return examDurationMinutes * 60;
  }
  return (numQuestions || 10) * DEFAULT_SECONDS_PER_QUESTION;
}

const formatTime = (totalSeconds: number): string => {
  if (totalSeconds < 0) totalSeconds = 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};


export default function ExamTakingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = params.examId as string;
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseAuthUser | null>(null);
  const [exam, setExam] = useState<ExamType | null>(null);
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [isProcessingSettings, setIsProcessingSettings] = useState(true);
  
  const [processedQuestions, setProcessedQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [timeLeftInSeconds, setTimeLeftInSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [initialDurationInSeconds, setInitialDurationInSeconds] = useState<number>(0);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        toast({ title: "خطأ", description: "يجب تسجيل الدخول لأداء الاختبار.", variant: "destructive" });
        router.push('/auth');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

  useEffect(() => {
    if (examId) {
      const fetchExamData = async () => {
        setIsLoadingExam(true);
        setError(null);
        try {
          const fetchedExam = await getExamById(examId);
          if (fetchedExam) {
            setExam(fetchedExam);
          } else {
            setError("لم يتم العثور على الاختبار المطلوب.");
            setExam(null); 
          }
        } catch (e) {
          console.error("Failed to fetch exam data:", e);
          setError("فشل تحميل بيانات الاختبار. يرجى المحاولة مرة أخرى.");
          setExam(null);
        } finally {
          setIsLoadingExam(false);
        }
      };
      fetchExamData();
    }
  }, [examId]);

  const handleSubmit = useCallback(async () => {
    if (!currentUser) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول لتسليم الإجابات.", variant: "destructive" });
      return;
    }
    if (!startTime) {
      toast({ title: "خطأ", description: "لم يتم تسجيل وقت بدء الاختبار.", variant: "destructive" });
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsTimerRunning(false); 
    try {
      let correctAnswersCount = 0;
      const submittedAnswersData = processedQuestions.map(q => {
        const selectedOptionId = answers[q.id];
        const isCorrect = selectedOptionId === q.correctOptionId;
        if (isCorrect) correctAnswersCount++;
        return { questionId: q.id, selectedOptionId: selectedOptionId || "N/A", isCorrect };
      });

      const score = (correctAnswersCount / processedQuestions.length) * 100;

      await saveExamAttempt({
        userId: currentUser.uid,
        examId: exam!.id, 
        examType: 'general_exam',
        score: parseFloat(score.toFixed(2)),
        correctAnswersCount,
        totalQuestionsAttempted: processedQuestions.length,
        answers: submittedAnswersData,
        startedAt: startTime,
        completedAt: new Date(),
      });

      toast({ title: "تم التسليم", description: "تم تسليم إجاباتك بنجاح." });

      const resultsNavigationParams = new URLSearchParams();
      resultsNavigationParams.set('score', score.toFixed(0));
      resultsNavigationParams.set('correct', correctAnswersCount.toString());
      resultsNavigationParams.set('total', processedQuestions.length.toString());

      // Capture original configuration parameters
      const numQParam = searchParams.get('numQ');
      const orderParam = searchParams.get('order');
      const difficultyParam = searchParams.get('difficulty');
      const timerParam = searchParams.get('timer');
      const durationMinsParam = searchParams.get('durationMins');

      if (numQParam) resultsNavigationParams.set('orig_numQ', numQParam);
      if (orderParam) resultsNavigationParams.set('orig_order', orderParam);
      if (difficultyParam) resultsNavigationParams.set('orig_difficulty', difficultyParam);
      if (timerParam) resultsNavigationParams.set('orig_timer', timerParam);
      if (durationMinsParam) resultsNavigationParams.set('orig_durationMins', durationMinsParam);
      
      router.push(`/exams/${examId}/results?${resultsNavigationParams.toString()}`);

    } catch (e) {
      console.error("Failed to submit exam:", e);
      toast({ title: "خطأ في التسليم", description: "فشل تسليم إجاباتك. يرجى المحاولة مرة أخرى.", variant: "destructive" });
      setIsSubmitting(false); 
    }
  }, [currentUser, startTime, exam, processedQuestions, answers, toast, router, examId, isSubmitting, searchParams]);


  useEffect(() => {
    if (!exam || !exam.questions) {
      setIsProcessingSettings(false);
      return;
    }
    setIsProcessingSettings(true);

    const numQParam = searchParams.get('numQ');
    const orderParam = searchParams.get('order') as 'sequential' | 'random' | null;
    const difficultyParam = searchParams.get('difficulty') as QuestionType['difficulty'] | 'all' | null;
    const timerEnabledParam = searchParams.get('timer') === 'true';
    const customDurationMinsParam = searchParams.get('durationMins');


    let questions = [...exam.questions];

    if (difficultyParam && difficultyParam !== 'all') {
      questions = questions.filter(q => q.difficulty === difficultyParam);
    }

    if (orderParam === 'random') {
      questions.sort(() => Math.random() - 0.5);
    }

    const numQuestionsToTake = numQParam ? parseInt(numQParam, 10) : questions.length;
    questions = questions.slice(0, Math.min(numQuestionsToTake, questions.length));
    
    if (questions.length === 0 && exam.questions.length > 0) {
        setError("لم يتم العثور على أسئلة تطابق الإعدادات المختارة. يرجى تعديل الإعدادات أو اختيار الكل.");
        setProcessedQuestions([]);
    } else {
        setProcessedQuestions(questions);
        setError(null); 
    }
    
    setCurrentQuestionIndex(0);
    setAnswers({});
    if (questions.length > 0) {
      setStartTime(new Date()); 
    } else {
      setStartTime(null);
    }

    setIsTimerEnabled(timerEnabledParam);
    if (timerEnabledParam && questions.length > 0) {
      let durationInSeconds;
      if (customDurationMinsParam) {
        const customMins = parseInt(customDurationMinsParam, 10);
        if (!isNaN(customMins) && customMins > 0) {
            durationInSeconds = customMins * 60;
        } else {
            durationInSeconds = calculateDurationInSeconds(questions.length, exam.durationInMinutes);
        }
      } else {
        durationInSeconds = calculateDurationInSeconds(questions.length, exam.durationInMinutes);
      }
      setInitialDurationInSeconds(durationInSeconds);
      setTimeLeftInSeconds(durationInSeconds);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
      setTimeLeftInSeconds(0);
    }

    setIsProcessingSettings(false);

  }, [exam, searchParams]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeftInSeconds > 0) {
      intervalId = setInterval(() => {
        setTimeLeftInSeconds(prevTime => prevTime - 1);
      }, 1000);
    } else if (isTimerRunning && timeLeftInSeconds <= 0) { 
      setIsTimerRunning(false);
      if (!isSubmitting) {
        toast({
          title: "انتهى الوقت!",
          description: "سيتم تسليم إجاباتك تلقائياً.",
          variant: "destructive",
        });
        handleSubmit(); 
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerRunning, timeLeftInSeconds, handleSubmit, toast, isSubmitting]);


  if (isLoadingExam) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ms-4 text-xl">جاري تحميل الاختبار...</p>
      </div>
    );
  }

  if (error && !exam) { 
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">حدث خطأ</h2>
        <p className="text-lg text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push('/exams')}>العودة إلى قائمة الاختبارات</Button>
      </div>
    );
  }
  
  if (!exam) { 
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">لم يتم العثور على الاختبار</h2>
        <p className="text-lg text-muted-foreground mb-6">قد يكون قد تم حذفه أو أن الرابط غير صحيح.</p>
        <Button onClick={() => router.push('/exams')}>العودة إلى قائمة الاختبارات</Button>
      </div>
    );
  }

  if (isProcessingSettings) {
     return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ms-4 text-xl">جاري تجهيز أسئلة الاختبار...</p>
      </div>
    );
  }
  
  if (error && processedQuestions.length === 0) { 
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">مشكلة في إعداد الأسئلة</h2>
        <p className="text-lg text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push(`/exams/${examId}/setup`)}>العودة إلى الإعدادات</Button>
      </div>
    );
  }


  if (processedQuestions.length === 0) {
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">لا توجد أسئلة</h2>
        <p className="text-lg text-muted-foreground mb-6">
          {exam.questions && exam.questions.length > 0 ? "لا توجد أسئلة تطابق الإعدادات الحالية. حاول تعديل إعدادات الاختبار." : "عذراً، هذا الاختبار لا يحتوي على أسئلة حالياً."}
        </p>
        <Button onClick={() => router.push(exam.questions && exam.questions.length > 0 ? `/exams/${examId}/setup` : '/exams')}>
            {exam.questions && exam.questions.length > 0 ? "العودة إلى الإعدادات" : "العودة إلى قائمة الاختبارات"}
        </Button>
      </div>
    );
  }

  const currentQuestion = processedQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / processedQuestions.length) * 100;

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast({
        title: "تنبيه",
        description: "الرجاء الإجابة على السؤال الحالي قبل الانتقال للسؤال التالي.",
        variant: "default",
      });
      return;
    }
    if (currentQuestionIndex < processedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold">{exam.title} ({exam.subjectName})</CardTitle>
          <div className="flex justify-between items-center mt-1">
            <CardDescription>السؤال {currentQuestionIndex + 1} من {processedQuestions.length}</CardDescription>
            {isTimerEnabled && isTimerRunning && (
              <div className="flex items-center text-lg font-semibold text-primary">
                <TimerIcon className="ms-2 h-5 w-5" />
                <span>{formatTime(timeLeftInSeconds)}</span>
              </div>
            )}
            {isTimerEnabled && !isTimerRunning && timeLeftInSeconds <= 0 && (
                 <div className="flex items-center text-lg font-semibold text-destructive">
                    <TimerIcon className="ms-2 h-5 w-5" />
                    <span>انتهى الوقت</span>
                </div>
            )}
          </div>
          <Progress value={progressPercentage} className="w-full mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h3>
            <RadioGroup
              dir="rtl"
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} />
                  <Label htmlFor={`${currentQuestion.id}-${option.id}`} className="text-lg cursor-pointer">{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isSubmitting} variant="outline">
            <ChevronRight className="ms-2 h-4 w-4" />
            السابق
          </Button>
          {currentQuestionIndex === processedQuestions.length - 1 ? (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting || !answers[currentQuestion.id]}>
              {isSubmitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Send className="me-2 h-4 w-4" />}
              {isSubmitting ? 'جاري التسليم...' : 'تسليم الإجابات'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isSubmitting}>
              التالي
              <ChevronLeft className="me-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
       <div className="text-center">
        <Button onClick={() => router.push(`/exams/${examId}/setup`)} variant="outline">
          العودة إلى إعدادات الاختبار
        </Button>
      </div>
    </div>
  );
}
