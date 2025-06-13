
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import Link from "next/link";
import { CheckCircle, BookOpen, RefreshCcw, Sparkles, Award, XCircle } from "lucide-react"; // Added Award, XCircle
import { subjects } from "@/lib/constants"; 
import { useEffect, useState } from "react";

export default function SubjectExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams(); // To get query params
  const subjectId = params.subjectId as string;
  
  const [subjectName, setSubjectName] = useState("المادة المحددة");
  const [score, setScore] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);

  useEffect(() => {
    const currentSubject = subjects.find(s => s.id === subjectId);
    if (currentSubject) {
      setSubjectName(currentSubject.name);
    }

    const scoreParam = searchParams.get('score');
    const correctParam = searchParams.get('correct');
    const totalParam = searchParams.get('total');

    setScore(scoreParam ? parseInt(scoreParam) : 0);
    setCorrectAnswers(correctParam ? parseInt(correctParam) : 0);
    setTotalQuestions(totalParam ? parseInt(totalParam) : 0);

  }, [subjectId, searchParams]);


  if (score === null || correctAnswers === null || totalQuestions === null) {
    return <div className="text-center py-10">جاري تحميل النتائج...</div>;
  }


  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center">
      <Card className="shadow-xl">
        <CardHeader>
          <Award className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">نتيجة اختبار مادة {subjectName}</CardTitle>
          <CardDescription>أداءك في الاختبار.</CardDescription>
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
        <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/study/exam/${subjectId}`}>
              <RefreshCcw className="ms-2 h-4 w-4" />
              إعادة الاختبار
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/study">
              <BookOpen className="ms-2 h-4 w-4" />
              العودة لصفحة الدراسة
            </Link>
          </Button>
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/ai-analysis">
              <Sparkles className="ms-2 h-4 w-4" />
              تحليل الأداء
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
