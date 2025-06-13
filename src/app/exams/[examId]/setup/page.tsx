
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getExamById } from '@/lib/examService';
import type { Exam, Question as QuestionType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, AlertTriangle, Settings, Play, Eye, Hash, TimerIcon, ListChecks, Zap, Clock, BookOpen } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import ExamBrowseView from '@/components/exam/exam-browse-view'; // New Import

const MAX_QUESTIONS_LIMIT_CONFIG = 50; 
const DEFAULT_CUSTOM_DURATION_MINUTES = 30;
const MIN_CUSTOM_DURATION_MINUTES = 5;
const MAX_CUSTOM_DURATION_MINUTES = 180;


export default function ExamSetupPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  
  const [currentMode, setCurrentMode] = useState<'exam' | 'browse'>('exam');
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionOrder, setQuestionOrder] = useState<'sequential' | 'random'>('random'); 
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [customDurationMinutes, setCustomDurationMinutes] = useState<number>(DEFAULT_CUSTOM_DURATION_MINUTES);

  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    if (examId) {
      const fetchExamDetails = async () => {
        setIsLoadingExam(true);
        setPageError(null);
        try {
          const examData = await getExamById(examId);
          if (examData) {
            setExam(examData);
            const totalExamQuestions = examData.questions?.length || examData.totalQuestions || MAX_QUESTIONS_LIMIT_CONFIG;
            setNumQuestions(Math.max(1, Math.min(totalExamQuestions, MAX_QUESTIONS_LIMIT_CONFIG)));
            
            if (examData.durationInMinutes) {
                setCustomDurationMinutes(Math.max(MIN_CUSTOM_DURATION_MINUTES, Math.min(MAX_CUSTOM_DURATION_MINUTES, examData.durationInMinutes)));
            } else {
                setCustomDurationMinutes(DEFAULT_CUSTOM_DURATION_MINUTES);
            }

          } else {
            setPageError(`لم نتمكن من العثور على تفاصيل الاختبار (المعرف: ${examId}).`);
          }
        } catch (error) {
          console.error("Error fetching exam details for setup:", error);
          setPageError("حدث خطأ أثناء تحميل تفاصيل الاختبار. حاول مرة أخرى.");
        } finally {
          setIsLoadingExam(false);
        }
      };
      fetchExamDetails();
    }
  }, [examId]);

  const validateSettings = (isExamMode: boolean) => {
    if (!exam) return false;
    const maxQuestionsAvailable = exam.questions?.length || exam.totalQuestions || MAX_QUESTIONS_LIMIT_CONFIG;
    
    if (numQuestions <= 0 || numQuestions > maxQuestionsAvailable) {
      toast({ title: "خطأ في الإعدادات", description: `يجب أن يكون عدد الأسئلة بين 1 و ${maxQuestionsAvailable}.`, variant: "destructive" });
      return false;
    }
    if (isExamMode && timerEnabled && (customDurationMinutes < MIN_CUSTOM_DURATION_MINUTES || customDurationMinutes > MAX_CUSTOM_DURATION_MINUTES)) {
      toast({ title: "خطأ في مدة المؤقت", description: `يجب أن تكون مدة المؤقت بين ${MIN_CUSTOM_DURATION_MINUTES} و ${MAX_CUSTOM_DURATION_MINUTES} دقيقة.`, variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleStartExam = () => {
    if (!validateSettings(true)) return;

    setIsProcessingAction(true);
    
    const queryParams = new URLSearchParams();
    queryParams.append('numQ', numQuestions.toString());
    queryParams.append('order', questionOrder);
    queryParams.append('timer', timerEnabled.toString());
    if (timerEnabled) {
        queryParams.append('durationMins', customDurationMinutes.toString());
    }
    queryParams.append('difficulty', selectedDifficulty);

    router.push(`/exams/${examId}?${queryParams.toString()}`);
  };


  if (isLoadingExam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل إعدادات الاختبار...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{pageError}</p>
        <Button onClick={() => router.push('/exams')} variant="outline">
          العودة إلى قائمة الاختبارات
        </Button>
      </div>
    );
  }

  if (!exam) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-lg text-muted-foreground">لم يتم العثور على الاختبار.</p>
        <Button onClick={() => router.push('/exams')} variant="outline">
          العودة إلى قائمة الاختبارات
        </Button>
      </div>
    );
  }
  
  const maxQuestionsForInput = exam.questions?.length || exam.totalQuestions || MAX_QUESTIONS_LIMIT_CONFIG;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">اختبار: {exam.title}</CardTitle>
                <CardDescription>
                    مادة: {exam.subjectName} - {exam.description || 'قم بتخصيص إعدادات هذا الاختبار قبل البدء أو التصفح.'}
                </CardDescription>
            </div>
          </div>
        </CardHeader>

        <Tabs value={currentMode} onValueChange={(value) => setCurrentMode(value as 'exam' | 'browse')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-auto mb-0 mt-0 rounded-none sticky top-0 z-10 bg-background border-b">
            <TabsTrigger value="exam" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary pb-2.5">
              <Play className="ms-2 h-5 w-5" />
              وضع الاختبار
            </TabsTrigger>
            <TabsTrigger value="browse" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary pb-2.5">
              <Eye className="ms-2 h-5 w-5" />
              وضع التصفح
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="exam" className="pt-0">
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="num-questions-exam" className="text-lg font-semibold flex items-center gap-2"><Hash /> عدد الأسئلة:</Label>
                <Input
                  id="num-questions-exam"
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, Math.min(maxQuestionsForInput, parseInt(e.target.value) || 1)))}
                  min="1"
                  max={maxQuestionsForInput.toString()}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">الحد الأقصى {maxQuestionsForInput} سؤال.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-order-exam" className="text-lg font-semibold flex items-center gap-2"><ListChecks /> ترتيب الأسئلة:</Label>
                <Select dir="rtl" value={questionOrder} onValueChange={(value) => setQuestionOrder(value as 'sequential' | 'random')}>
                  <SelectTrigger id="question-order-exam" className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">عشوائي</SelectItem>
                    <SelectItem value="sequential">ترتيبي (كما هي في الاختبار الأصلي)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty-exam" className="text-lg font-semibold flex items-center gap-2"><Zap /> مستوى صعوبة الأسئلة:</Label>
                <Select dir="rtl" value={selectedDifficulty} onValueChange={(value) => setSelectedDifficulty(value as any)}>
                  <SelectTrigger id="difficulty-exam" className="max-w-xs">
                    <SelectValue placeholder="فلترة حسب الصعوبة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="easy">سهل فقط</SelectItem>
                    <SelectItem value="medium">متوسط فقط</SelectItem>
                    <SelectItem value="hard">صعب فقط</SelectItem>
                  </SelectContent>
                </Select>
                 <p className="text-xs text-muted-foreground">
                  سيتم اختيار الأسئلة من التي تطابق الصعوبة المحددة.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch id="timer-enabled-exam" checked={timerEnabled} onCheckedChange={setTimerEnabled} />
                    <Label htmlFor="timer-enabled-exam" className="text-lg font-semibold flex items-center gap-2"><TimerIcon /> تفعيل المؤقت</Label>
                </div>
                {timerEnabled && (
                    <div className="space-y-1 ps-8 pt-2">
                        <Label htmlFor="custom-duration-exam" className="text-base font-medium flex items-center gap-2"><Clock /> تحديد المدة (بالدقائق):</Label>
                        <Input
                        id="custom-duration-exam"
                        type="number"
                        value={customDurationMinutes}
                        onChange={(e) => setCustomDurationMinutes(Math.max(MIN_CUSTOM_DURATION_MINUTES, Math.min(MAX_CUSTOM_DURATION_MINUTES, parseInt(e.target.value) || MIN_CUSTOM_DURATION_MINUTES)))}
                        min={MIN_CUSTOM_DURATION_MINUTES.toString()}
                        max={MAX_CUSTOM_DURATION_MINUTES.toString()}
                        className="max-w-[120px]"
                        />
                        <p className="text-xs text-muted-foreground">المدة بين {MIN_CUSTOM_DURATION_MINUTES} و {MAX_CUSTOM_DURATION_MINUTES} دقيقة.</p>
                    </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleStartExam} disabled={isProcessingAction} className="w-full sm:flex-auto text-lg py-3">
                {isProcessingAction && currentMode === 'exam' ? <Loader2 className="ms-2 h-5 w-5 animate-spin" /> : <Play className="ms-2 h-5 w-5" />}
                ابدأ الاختبار بالإعدادات الحالية
                </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent value="browse" className="pt-0">
            <CardContent className="pt-6">
              {exam && (
                <ExamBrowseView 
                  examId={exam.id} 
                  initialOrder="sequential" // Default to all questions sequentially
                  initialDifficulty="all"    // Default to all difficulties
                  initialViewMode="single"   // Default to single question view
                  hideChangeSettingsButton={true} // Hide the "Change Settings" button within the browse view
                />
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
      <div className="text-center">
        <Button onClick={() => router.back()} variant="outline">
            العودة
        </Button>
      </div>
    </div>
  );
}
