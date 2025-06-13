
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getExamById } from '@/lib/examService';
import type { Exam, Question as QuestionType, QuestionOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle, CheckCircle, XCircle, Eye, Settings, Info, LayoutList, ListChecks, BarChartHorizontal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ExamBrowseViewProps {
  examId: string;
  initialNumQuestions?: number;
  initialOrder?: 'sequential' | 'random';
  initialDifficulty?: QuestionType['difficulty'] | 'all';
  initialViewMode?: 'single' | 'list';
  hideChangeSettingsButton?: boolean;
}

export default function ExamBrowseView({
  examId,
  initialNumQuestions,
  initialOrder = 'sequential',
  initialDifficulty = 'all',
  initialViewMode = 'single',
  hideChangeSettingsButton = false,
}: ExamBrowseViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [processedQuestions, setProcessedQuestions] = useState<QuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isProcessingSettings, setIsProcessingSettings] = useState(true);
  const [viewMode, setViewMode] = useState<'single' | 'list'>(initialViewMode);

  const numQParamFromProps = initialNumQuestions;
  const orderParamFromProps = initialOrder;
  const difficultyParamFromProps = initialDifficulty;

  const appliedSettingsText = useMemo(() => {
    if (!exam) return "";
    const orderText = orderParamFromProps === 'random' ? 'عشوائي' : 'ترتيبي';
    const difficultyTextMap = {
      'all': 'الكل',
      'easy': 'سهل',
      'medium': 'متوسط',
      'hard': 'صعب'
    };
    const difficultyDesc = difficultyTextMap[difficultyParamFromProps] || difficultyParamFromProps;
    let questionsDesc = `جميع الأسئلة (${processedQuestions.length})`;
    if (numQParamFromProps && numQParamFromProps < (exam.questions?.length || 0)) {
        questionsDesc = `${numQParamFromProps} أسئلة محددة (من ${processedQuestions.length} مطابقة)`;
    } else if (numQParamFromProps) {
        questionsDesc = `${processedQuestions.length} أسئلة (مطلوب ${numQParamFromProps})`;
    }


    return `${orderText} - ${questionsDesc} - صعوبة: ${difficultyDesc}`;
  }, [orderParamFromProps, numQParamFromProps, difficultyParamFromProps, exam, processedQuestions.length]);


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
          console.error("Failed to fetch exam data for browsing:", e);
          setError("فشل تحميل بيانات الاختبار للتصفح. يرجى المحاولة مرة أخرى.");
          setExam(null);
        } finally {
          setIsLoadingExam(false);
        }
      };
      fetchExamData();
    }
  }, [examId]);

  useEffect(() => {
    if (!exam || !exam.questions) {
      setIsProcessingSettings(false);
      return;
    }
    setIsProcessingSettings(true);

    let questionsToProcess = [...exam.questions];

    if (difficultyParamFromProps && difficultyParamFromProps !== 'all') {
      questionsToProcess = questionsToProcess.filter(q => q.difficulty === difficultyParamFromProps);
    }

    if (orderParamFromProps === 'random') {
      questionsToProcess.sort(() => Math.random() - 0.5);
    }

    const numQuestionsToTake = numQParamFromProps ?? questionsToProcess.length;
    questionsToProcess = questionsToProcess.slice(0, Math.min(numQuestionsToTake, questionsToProcess.length));
    
    if (questionsToProcess.length === 0 && exam.questions.length > 0) {
        setError("لم يتم العثور على أسئلة تطابق الإعدادات المختارة للتصفح.");
        setProcessedQuestions([]);
    } else {
        setProcessedQuestions(questionsToProcess);
        setError(null); 
    }
    
    setCurrentQuestionIndex(0);
    setIsProcessingSettings(false);

  }, [exam, numQParamFromProps, orderParamFromProps, difficultyParamFromProps]);


  if (isLoadingExam) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ms-4 text-xl">جاري تحميل الاختبار للتصفح...</p>
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
        <p className="ms-4 text-xl">جاري تجهيز الأسئلة للتصفح...</p>
      </div>
    );
  }
  
  if (error && processedQuestions.length === 0) { 
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">مشكلة في إعداد الأسئلة</h2>
        <p className="text-lg text-muted-foreground mb-6">{error}</p>
        {!hideChangeSettingsButton && (
            <Button onClick={() => router.push(`/exams/${examId}/setup`)}>العودة إلى الإعدادات</Button>
        )}
      </div>
    );
  }

  if (processedQuestions.length === 0) {
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">لا توجد أسئلة للتصفح</h2>
        <p className="text-lg text-muted-foreground mb-6">
          {exam.questions && exam.questions.length > 0 ? "لا توجد أسئلة تطابق الإعدادات الحالية للتصفح. حاول تعديل الإعدادات." : "عذراً، هذا الاختبار لا يحتوي على أسئلة حالياً."}
        </p>
        <Button onClick={() => router.push(exam.questions && exam.questions.length > 0 && !hideChangeSettingsButton ? `/exams/${examId}/setup` : '/exams')}>
            {exam.questions && exam.questions.length > 0 && !hideChangeSettingsButton ? "العودة إلى الإعدادات" : "العودة إلى قائمة الاختبارات"}
        </Button>
      </div>
    );
  }

  const currentQuestion = processedQuestions[currentQuestionIndex];
  const progressPercentage = processedQuestions.length > 0 ? ((currentQuestionIndex + 1) / processedQuestions.length) * 100 : 0;


  const handleNext = () => {
    if (currentQuestionIndex < processedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="space-y-6"> {/* Removed max-w-3xl mx-auto for embedding */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                {!hideChangeSettingsButton && (
                    <div className="flex-1 space-y-1 text-sm">
                        <div className="font-semibold flex items-center gap-1"><BarChartHorizontal className="h-4 w-4 text-muted-foreground"/> الإعدادات المطبقة:</div>
                        <Badge variant="secondary" className="text-xs whitespace-normal text-right leading-relaxed h-auto py-1 px-2 block sm:inline-block">
                            {appliedSettingsText}
                        </Badge>
                        <Button variant="outline" size="xs" onClick={() => router.push(`/exams/${examId}/setup`)} className="mt-1 text-xs">
                            <Settings className="ms-1 h-3 w-3"/>
                            تغيير الإعدادات
                        </Button>
                    </div>
                )}
                <div className={cn("flex-1 space-y-1 text-sm", hideChangeSettingsButton && "w-full")}>
                    <div className="font-semibold flex items-center gap-1"><Eye className="h-4 w-4 text-muted-foreground"/> وضع العرض:</div>
                    <div className="flex gap-2">
                        <Button variant={viewMode === 'single' ? "secondary" : "outline"} size="xs" onClick={() => setViewMode('single')} aria-label="عرض سؤال واحد" className="text-xs flex-1 sm:flex-none">
                            <Eye className="ms-1 h-3 w-3"/>
                            <span className="hidden sm:inline">سؤال واحد</span>
                        </Button>
                        <Button variant={viewMode === 'list' ? "secondary" : "outline"} size="xs" onClick={() => setViewMode('list')} aria-label="عرض كل الأسئلة" className="text-xs flex-1 sm:flex-none">
                            <LayoutList className="ms-1 h-3 w-3"/>
                            <span className="hidden sm:inline">قائمة</span>
                        </Button>
                    </div>
                </div>
            </div>
            
            <Separator/>

            <div className="mt-3">
                <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <ListChecks className="h-6 w-6 text-primary"/>
                    تصفح أسئلة: {exam.title}
                </CardTitle>
                <div className="flex items-center justify-between gap-4 mt-1">
                    <div className="flex-grow">
                        {viewMode === 'single' && (
                            <>
                                <CardDescription className="text-xs">السؤال {currentQuestionIndex + 1} من {processedQuestions.length}</CardDescription>
                                <Progress value={progressPercentage} className="w-full mt-1 h-2" />
                            </>
                        )}
                        {viewMode === 'list' && (
                            <CardDescription  className="text-xs">عرض جميع الأسئلة ({processedQuestions.length} أسئلة)</CardDescription>
                        )}
                    </div>
                </div>
            </div>
        </CardHeader>


        {viewMode === 'single' && currentQuestion && (
          <>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">{currentQuestion.questionText}</h3>
                <p className="text-xs text-muted-foreground mb-4">الموضوع: {currentQuestion.topic || 'غير محدد'} - الصعوبة: {currentQuestion.difficulty || 'غير محدد'}</p>
                
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isCorrect = option.id === currentQuestion.correctOptionId;
                    return (
                      <div 
                        key={option.id} 
                        className={cn(
                          "flex items-center space-x-2 space-x-reverse p-3 rounded-md border",
                          isCorrect ? "bg-green-100 dark:bg-green-900/30 border-green-500" : "bg-card"
                        )}
                      >
                        {isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /> : <XCircle className="h-5 w-5 text-muted-foreground opacity-50" />}
                        <Label htmlFor={`browse-single-${currentQuestion.id}-${option.id}`} className="text-base">{option.text}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {currentQuestion.explanation && (
                <Accordion type="single" collapsible className="w-full mt-6">
                  <AccordionItem value="explanation">
                    <AccordionTrigger className="text-primary hover:text-primary/90 text-sm">
                        <Info className="ms-1 h-4 w-4"/>
                        عرض شرح الإجابة
                    </AccordionTrigger>
                    <AccordionContent className="prose dark:prose-invert prose-sm max-w-none pt-2">
                      {currentQuestion.explanation}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
                <ChevronRight className="ms-2 h-4 w-4" />
                السابق
              </Button>
              <Button onClick={handleNext} disabled={currentQuestionIndex === processedQuestions.length - 1}>
                التالي
                <ChevronLeft className="me-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </>
        )}

        {viewMode === 'list' && (
          <CardContent className="space-y-4 pt-4">
            {processedQuestions.map((q, index) => (
              <Card key={q.id} className="p-3 shadow-sm">
                <h3 className="text-base font-semibold mb-1">{index + 1}. {q.questionText}</h3>
                <p className="text-xs text-muted-foreground mb-2">الموضوع: {q.topic || 'غير محدد'} - الصعوبة: {q.difficulty || 'غير محدد'}</p>
                
                <div className="space-y-1.5 mb-2">
                  {q.options.map((option) => {
                    const isCorrect = option.id === q.correctOptionId;
                    return (
                      <div 
                        key={option.id} 
                        className={cn(
                          "flex items-center space-x-2 space-x-reverse p-1.5 rounded border text-xs",
                          isCorrect ? "bg-green-100 dark:bg-green-900/30 border-green-500" : "bg-muted/50"
                        )}
                      >
                        {isCorrect ? <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> : <XCircle className="h-3.5 w-3.5 text-muted-foreground opacity-40" />}
                        <Label htmlFor={`browse-list-${q.id}-${option.id}`}>{option.text}</Label>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <Accordion type="single" collapsible className="w-full text-xs">
                    <AccordionItem value={`explanation-${q.id}`}>
                      <AccordionTrigger className="text-primary hover:text-primary/90 py-1.5 text-xs">
                          <Info className="ms-1 h-3.5 w-3.5"/>
                          عرض شرح الإجابة
                      </AccordionTrigger>
                      <AccordionContent className="prose dark:prose-invert prose-xs max-w-none pt-1">
                        {q.explanation}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </Card>
            ))}
          </CardContent>
        )}
      </Card>
      { !hideChangeSettingsButton && (
        <div className="text-center">
            <Button onClick={() => router.push(`/exams/${examId}/setup`)} variant="outline">
            العودة إلى إعدادات الاختبار
            </Button>
        </div>
      )}
    </div>
  );
}
