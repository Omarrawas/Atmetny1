
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSubjectById, getSubjectSections } from '@/lib/examService';
import type { Subject, SubjectSection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, BookOpen, Loader2, AlertTriangle, List } from 'lucide-react';
import Link from 'next/link';

export default function SubjectSectionsPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  // const branch = params.branch as string; // Available if needed for breadcrumbs or other logic

  const [subject, setSubject] = useState<Subject | null>(null);
  const [sections, setSections] = useState<SubjectSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subjectId) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          console.log(`Fetching data for subjectId: ${subjectId}`);
          const [subjectData, sectionsData] = await Promise.all([
            getSubjectById(subjectId),
            getSubjectSections(subjectId),
          ]);

          console.log('Fetched Subject Data:', subjectData);
          console.log('Fetched Sections Data:', sectionsData);

          if (!subjectData) {
            setError(`لم يتم العثور على المادة بالمعرف: ${subjectId}`);
            setSubject(null);
            setSections([]);
          } else {
            setSubject(subjectData);
            setSections(sectionsData);
          }
        } catch (e) {
          console.error("Failed to fetch subject sections data:", e);
          setError("فشل تحميل بيانات أقسام المادة. يرجى المحاولة مرة أخرى.");
          setSubject(null);
          setSections([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [subjectId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل أقسام المادة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={() => router.push('/study')} variant="outline">
          العودة إلى صفحة الدراسة
        </Button>
      </div>
    );
  }

  if (!subject) {
    // This case should ideally be caught by the error state if subjectData is null
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">لم يتم العثور على المادة.</p>
         <Button onClick={() => router.push('/study')} variant="outline">
          العودة إلى صفحة الدراسة
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">{subject.name}</CardTitle>
          </div>
          <CardDescription className="text-lg">
            أقسام مادة {subject.name}. اختر قسمًا لبدء الدراسة أو الاختبار.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <List className="h-10 w-10 mx-auto mb-2" />
              <p className="text-lg">لا توجد أقسام متاحة لهذه المادة حاليًا.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {sections.map((section) => (
                <li key={section.id}>
                  <Link href={`/study/${subject.branch}/${subject.id}/${section.id}`} passHref>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{section.title}</h3>
                          {section.description && (
                            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                          )}
                        </div>
                        <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
       <div className="text-center mt-8">
        <Button onClick={() => router.back()} variant="outline">
          <ChevronRight className="ms-2 h-4 w-4" /> 
          العودة
        </Button>
      </div>
    </div>
  );
}
