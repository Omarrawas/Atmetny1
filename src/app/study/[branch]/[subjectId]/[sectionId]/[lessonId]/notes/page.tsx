
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonById } from '@/lib/examService';
import type { Lesson } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Loader2, AlertTriangle, Notebook, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function LessonNotesPage() {
  const params = useParams();
  const router = useRouter();

  const subjectId = params.subjectId as string;
  const sectionId = params.sectionId as string;
  const lessonId = params.lessonId as string;
  const branch = params.branch as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subjectId && sectionId && lessonId) {
      const fetchLessonData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const lessonData = await getLessonById(subjectId, sectionId, lessonId);
          if (lessonData) {
            setLesson(lessonData);
          } else {
            setError(`لم يتم العثور على الدرس بالمعرف: ${lessonId}`);
          }
        } catch (e) {
          console.error("Failed to fetch lesson data for notes:", e);
          setError("فشل تحميل بيانات الدرس لعرض الملاحظات. يرجى المحاولة مرة أخرى.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchLessonData();
    }
  }, [subjectId, sectionId, lessonId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل الملاحظات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          العودة
        </Button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">لم يتم العثور على بيانات الدرس.</p>
        <Button onClick={() => router.back()} variant="outline" className="mt-4">
          العودة
        </Button>
      </div>
    );
  }

  const lessonPagePath = `/study/${branch}/${subjectId}/${sectionId}/${lessonId}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Notebook className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">ملاحظات درس: {lesson.title}</CardTitle>
          </div>
          <CardDescription>
            ملاحظات إضافية وشروحات متعلقة بالدرس.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lesson.notes && lesson.notes.trim() !== '' ? (
            <div dir="rtl" className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {lesson.notes}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-2" />
              <p className="text-lg">لا توجد ملاحظات متاحة لهذا الدرس حاليًا.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Button onClick={() => router.push(lessonPagePath)} variant="outline">
          <ChevronRight className="ms-2 h-4 w-4" />
          العودة إلى الدرس
        </Button>
      </div>
    </div>
  );
}
