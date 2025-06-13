
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Ensure useParams is imported
import { getLessonById } from '@/lib/examService';
import type { Lesson, LessonTeacher } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Youtube, FileText, Notebook, Download, Loader2, AlertTriangle, User, BookOpen, SettingsIcon, PlayCircle, ListChecks } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 
import Link from 'next/link';

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string | undefined): string | null => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v');
    }
  } catch (e) {
    console.error("Invalid URL for YouTube video:", e);
    if (url && !url.includes('/') && !url.includes('.')) {
        videoId = url;
    }
  }
  return videoId;
};


export default function LessonPage() {
  const pageParams = useParams(); // Renamed to avoid conflict if 'params' is used elsewhere in scope
  const router = useRouter();
  
  const branch = pageParams.branch as string;
  const subjectId = pageParams.subjectId as string;
  const sectionId = pageParams.sectionId as string;
  const lessonId = pageParams.lessonId as string; // This is the current lesson's ID

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (subjectId && sectionId && lessonId) {
      const fetchLessonData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const lessonData = await getLessonById(subjectId, sectionId, lessonId);
          if (lessonData) {
            setLesson(lessonData);
            // Set initial video
            if (lessonData.teachers && lessonData.teachers.length > 0 && lessonData.teachers[0].youtubeUrl) {
              setSelectedVideoUrl(lessonData.teachers[0].youtubeUrl);
            } else if (lessonData.videoUrl) {
              setSelectedVideoUrl(lessonData.videoUrl);
            } else {
              setSelectedVideoUrl(null);
            }
          } else {
            setError(`لم يتم العثور على الدرس بالمعرف: ${lessonId}`);
          }
        } catch (e) {
          console.error("Failed to fetch lesson data:", e);
          setError("فشل تحميل بيانات الدرس. يرجى المحاولة مرة أخرى.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchLessonData();
    }
  }, [subjectId, sectionId, lessonId]);

  const currentVideoId = getYouTubeVideoId(selectedVideoUrl);

  const handleTeacherChange = (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل الدرس...</p>
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

  const lessonExamsListPath = `/study/${branch}/${subjectId}/${sectionId}/${lessonId}/lesson-exams-list`;
  const lessonNotesPath = `/study/${branch}/${subjectId}/${sectionId}/${lessonId}/notes`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center gap-3 mb-1">
             <BookOpen className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">{lesson.title}</CardTitle>
          </div>
          {(lesson.teachers && lesson.teachers.length > 0) ? (
            <div className="mt-4">
              <Label htmlFor="teacher-select" className="block text-sm font-medium text-foreground mb-1">اختر المدرس:</Label>
              <Select 
                dir="rtl" 
                onValueChange={handleTeacherChange} 
                defaultValue={selectedVideoUrl ?? undefined}
              >
                <SelectTrigger id="teacher-select" className="w-full md:w-[280px]">
                  <SelectValue placeholder="اختر المدرس لعرض الفيديو الخاص به" />
                </SelectTrigger>
                <SelectContent>
                  {lesson.videoUrl && !(lesson.teachers && lesson.teachers.some(t => t.youtubeUrl === lesson.videoUrl)) && ( 
                     <SelectItem value={lesson.videoUrl}>فيديو الدرس العام</SelectItem>
                  )}
                  {lesson.teachers.map((teacher, index) => (
                    teacher.youtubeUrl ? (
                        <SelectItem key={teacher.name + index} value={teacher.youtubeUrl}>
                        {teacher.name}
                        </SelectItem>
                    ) : null
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : lesson.teacherName ? ( 
            <CardDescription className="text-md text-muted-foreground flex items-center gap-1.5 mt-2">
              <User className="h-4 w-4" /> الأستاذ: {lesson.teacherName}
            </CardDescription>
          ) : null}
        </CardHeader>

        {currentVideoId && (
          <CardContent className="pt-6">
            <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden shadow-md">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideoId}`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="border-0"
              ></iframe>
            </div>
          </CardContent>
        )}
        
        {lesson.content && (
            <>
            <Separator className="my-0" />
            <CardContent className="pt-6 space-y-4">
                <h3 className="text-xl font-semibold text-primary">محتوى الدرس:</h3>
                <div dir="rtl" className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {lesson.content}
                  </ReactMarkdown>
                </div>
            </CardContent>
            </>
        )}
        
        {lesson.files && lesson.files.length > 0 && (
            <>
            <Separator className="my-0" />
            <CardContent className="pt-6 space-y-4">
                <h3 className="text-xl font-semibold text-primary">المرفقات:</h3>
                <ul className="space-y-2">
                {lesson.files.map((file, index) => (
                    file.url ? (
                        <li key={index}>
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                        >
                            <Download className="h-4 w-4" />
                            {file.name || `ملف ${index + 1}`} {file.type && `(.${file.type})`}
                        </a>
                        </li>
                    ) : null
                ))}
                </ul>
            </CardContent>
            </>
        )}


        <Separator className="my-0" />
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href={lessonExamsListPath}>
                <ListChecks className="ms-2 h-4 w-4" />
                اختبارات الدرس
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={lessonNotesPath}>
                <Notebook className="ms-2 h-4 w-4" />
                ملاحظات
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Button onClick={() => router.back()} variant="outline">
          <ChevronRight className="ms-2 h-4 w-4" /> 
          العودة إلى قائمة الدروس
        </Button>
      </div>
    </div>
  );
}
    
