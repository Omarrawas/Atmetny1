
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, BarChart2, Award, Sparkles, RotateCcw } from "lucide-react";
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { TelegramIcon } from '@/components/icons/telegram-icon';
import { useEffect, useState } from "react";

export default function ExamResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [score, setScore] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [retakeHref, setRetakeHref] = useState<string>('');


  useEffect(() => {
    const scoreParam = searchParams.get('score');
    const correctParam = searchParams.get('correct');
    const totalParam = searchParams.get('total');

    setScore(scoreParam ? parseInt(scoreParam) : 0);
    setCorrectAnswers(correctParam ? parseInt(correctParam) : 0);
    setTotalQuestions(totalParam ? parseInt(totalParam) : 0);

    // Construct retake href with original parameters
    const newRetakeParams = new URLSearchParams();
    const origNumQ = searchParams.get('orig_numQ');
    const origOrder = searchParams.get('orig_order');
    const origDifficulty = searchParams.get('orig_difficulty');
    const origTimer = searchParams.get('orig_timer');
    const origDurationMins = searchParams.get('orig_durationMins');

    if (origNumQ) newRetakeParams.set('numQ', origNumQ);
    if (origOrder) newRetakeParams.set('order', origOrder);
    if (origDifficulty) newRetakeParams.set('difficulty', origDifficulty);
    if (origTimer) newRetakeParams.set('timer', origTimer);
    if (origDurationMins) newRetakeParams.set('durationMins', origDurationMins);
    
    setRetakeHref(newRetakeParams.toString() ? `/exams/${examId}?${newRetakeParams.toString()}` : `/exams/${examId}/setup`);


  }, [searchParams, examId]);


  const handleShare = (platform: 'whatsapp' | 'telegram') => {
    const message = `لقد حصلت على ${score}% في الاختبار ${examId} على منصة Atmetny!`; // Changed NajahEdu Prep to Atmetny
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    } else {
      url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
    }
    window.open(url, '_blank');
  };

  if (score === null || correctAnswers === null || totalQuestions === null) {
    // You can show a loading spinner here or a placeholder
    return <div className="text-center py-10">جاري تحميل النتائج...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center">
      <Card className="shadow-xl">
        <CardHeader>
          <Award className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">نتيجة الاختبار</CardTitle>
          <CardDescription>أداءك في اختبار "{examId}"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-6xl font-bold text-primary">{score}%</div>
          <div className="grid grid-cols-2 gap-4 text-lg">
            <div className="flex items-center justify-center gap-2 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <span>إجابات صحيحة: {correctAnswers}</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <span>إجابات خاطئة: {totalQuestions - correctAnswers}</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            {score >= 75 ? "أداء رائع! استمر في هذا التقدم." : "عمل جيد! يمكنك التحسن أكثر بالتركيز على نقاط ضعفك."}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
           <Button asChild className="w-full sm:w-auto" disabled={!retakeHref}>
            <Link href={retakeHref || '#'}>
              <RotateCcw className="ms-2 h-4 w-4" />
              إعادة الاختبار
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/exams">
              <BarChart2 className="ms-2 h-4 w-4" />
              العودة للاختبارات
            </Link>
          </Button>
           <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/ai-analysis">
              <Sparkles className="ms-2 h-4 w-4" />
              تحليل الأداء بالذكاء الاصطناعي
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>شارك نتيجتك</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
            <Button onClick={() => handleShare('whatsapp')} variant="outline" size="lg" className="gap-2">
              <WhatsAppIcon className="h-6 w-6" />
              واتساب
            </Button>
            <Button onClick={() => handleShare('telegram')} variant="outline" size="lg" className="gap-2">
              <TelegramIcon className="h-6 w-6" />
              تيليجرام
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
