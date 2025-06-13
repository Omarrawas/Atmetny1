
'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Removed CardFooter
import { BookOpen, Atom, Feather, ArrowRight, FileText, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Subject } from "@/lib/types";
import { getSubjects } from "@/lib/examService";
import Image from "next/image";

export default function StudyPage() {
  const router = useRouter();
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedSubjects = await getSubjects();
        setAllSubjects(fetchedSubjects);
      } catch (e) {
        console.error("Failed to fetch subjects:", e);
        setError("فشل تحميل قائمة المواد الدراسية. يرجى المحاولة مرة أخرى.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const scientificSubjects = allSubjects.filter(subject => subject.branch === 'scientific' || subject.branch === 'common');
  const literarySubjects = allSubjects.filter(subject => subject.branch === 'literary' || subject.branch === 'common');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل المواد الدراسية...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={() => {
          setError(null);
          setIsLoading(true);
          getSubjects().then(setAllSubjects).catch(() => setError("فشل تحميل قائمة المواد الدراسية. يرجى المحاولة مرة أخرى.")).finally(() => setIsLoading(false));
        }}>حاول مرة أخرى</Button>
      </div>
    );
  }

  if (!isLoading && !error && allSubjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-lg text-muted-foreground">لم يتم العثور على مواد دراسية. قد تتم إضافتها قريباً.</p>
         <Button onClick={() => router.push('/')} variant="outline" className="mt-4">
            <ArrowRight className="ms-2 h-4 w-4" />
            الرجوع الى الصفحة الرئيسية
        </Button>
      </div>
    );
  }


  return (
    <div className="max-w-4xl mx-auto text-center space-y-12">
      <header className="space-y-3">
        <BookOpen className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-4xl font-bold">صفحة الدراسة</h1>
        <p className="text-xl text-muted-foreground">
          اختر قسمك الدراسي للوصول إلى المواد والاختبارات المخصصة لك.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg flex flex-col">
          <CardHeader className="items-center">
            <Atom className="h-12 w-12 text-blue-500 mb-3" />
            <CardTitle className="text-2xl">القسم العلمي</CardTitle>
            <CardDescription>مواد علمية متخصصة وتجارب عملية.</CardDescription>
          </CardHeader>
          <CardContent className="text-center flex-grow space-y-6">
            {scientificSubjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scientificSubjects.map((subject) => (
                  <Link href={`/study/${subject.branch}/${subject.id}`} key={subject.id} passHref legacyBehavior>
                    <a className="block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
                      <Card className="flex flex-col h-full w-full bg-card">
                        {subject.image ? (
                          <div className="relative h-40 w-full">
                            <Image 
                              src={subject.image} 
                              alt={subject.name} 
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                              className="object-cover"
                              data-ai-hint={subject.imageHint || subject.name.split(" ")[0].toLowerCase()}
                            />
                          </div>
                        ) : (
                          <div className="relative h-40 w-full bg-muted flex items-center justify-center">
                             <Image 
                              src={`https://placehold.co/300x200.png?text=${encodeURIComponent(subject.name)}`} 
                              alt={subject.name} 
                              width={300}
                              height={200}
                              className="object-contain opacity-50"
                              data-ai-hint={subject.imageHint || subject.name.split(" ")[0].toLowerCase()}
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2 pt-4 flex-grow">
                          <CardTitle className="text-xl text-center">{subject.name}</CardTitle>
                        </CardHeader>
                        {/* CardFooter removed */}
                      </Card>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-4">لا توجد مواد متاحة للقسم العلمي حالياً.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg flex flex-col">
          <CardHeader className="items-center">
            <Feather className="h-12 w-12 text-orange-500 mb-3" />
            <CardTitle className="text-2xl">القسم الأدبي</CardTitle>
            <CardDescription>مواد أدبية تركز على اللغات والعلوم الإنسانية.</CardDescription>
          </CardHeader>
          <CardContent className="text-center flex-grow space-y-6">
            {literarySubjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {literarySubjects.map((subject) => (
                   <Link href={`/study/${subject.branch}/${subject.id}`} key={subject.id} passHref legacyBehavior>
                    <a className="block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group">
                      <Card className="flex flex-col h-full w-full bg-card">
                        {subject.image ? (
                           <div className="relative h-40 w-full">
                            <Image 
                              src={subject.image} 
                              alt={subject.name} 
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                              className="object-cover"
                              data-ai-hint={subject.imageHint || subject.name.split(" ")[0].toLowerCase()}
                            />
                          </div>
                        ) : (
                          <div className="relative h-40 w-full bg-muted flex items-center justify-center">
                            <Image 
                              src={`https://placehold.co/300x200.png?text=${encodeURIComponent(subject.name)}`} 
                              alt={subject.name} 
                              width={300}
                              height={200}
                              className="object-contain opacity-50"
                              data-ai-hint={subject.imageHint || subject.name.split(" ")[0].toLowerCase()}
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2 pt-4 flex-grow">
                          <CardTitle className="text-xl text-center">{subject.name}</CardTitle>
                        </CardHeader>
                        {/* CardFooter removed */}
                      </Card>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
               <p className="text-muted-foreground py-4">لا توجد مواد متاحة للقسم الأدبي حالياً.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-muted-foreground">
        <p>
          بمجرد اختيارك للمادة، ستتمكن من تصفح الموارد التعليمية والاختبارات التدريبية المصممة خصيصًا لها.
        </p>
      </div>

      <div className="mt-12">
        <Button variant="outline" asChild onClick={() => router.push('/')}>
          <Link href="/">
            <ArrowRight className="ms-2 h-4 w-4" />
            الرجوع الى الصفحة الرئيسية
          </Link>
        </Button>
      </div>
    </div>
  );
}
