
import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getNewsItems } from "@/lib/serverExamService"; 
import type { NewsItem } from "@/lib/types";
import Image from "next/image";
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { AlertTriangle, CalendarDays, Tag, Building, Newspaper } from "lucide-react";
import type { Timestamp } from "firebase/firestore";

export const metadata: Metadata = {
  title: "آخر الأخبار | Atmetny",
  description: "تابع آخر الأخبار والتحديثات المتعلقة بالمنصة والتعليم.",
};

// Helper to safely format timestamp
const formatDateSafe = (timestamp: Timestamp | undefined): string => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    try {
      return format(timestamp.toDate(), 'd MMMM yyyy, HH:mm', { locale: arSA });
    } catch (e) {
      console.error("Error formatting date:", e, "Timestamp:", timestamp);
      return 'تاريخ غير صالح';
    }
  }
  return 'تاريخ غير محدد';
};


export default async function NewsPage() {
  let newsItems: NewsItem[] = [];
  let fetchError: string | null = null;

  try {
    newsItems = await getNewsItems(20); // Fetch latest 20 news items
  } catch (error) {
    console.error("Failed to fetch news items for page:", error);
    fetchError = "حدث خطأ أثناء تحميل الأخبار. يرجى المحاولة مرة أخرى لاحقًا.";
  }

  return (
    <div className="space-y-8">
      <header className="mb-8 text-center">
        <Newspaper className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight">آخر الأخبار</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
          كن على اطلاع دائم بآخر التطورات والإعلانات الهامة المتعلقة بمنصة Atmetny والعملية التعليمية.
        </p>
      </header>

      {fetchError && (
        <div className="flex flex-col items-center justify-center text-center bg-destructive/10 text-destructive p-6 rounded-lg shadow-md border border-destructive">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">خطأ في تحميل الأخبار</h2>
          <p>{fetchError}</p>
        </div>
      )}

      {!fetchError && newsItems.length === 0 && (
        <div className="text-center py-10 bg-card shadow-md rounded-lg">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">
            لا توجد أخبار متاحة حالياً. يرجى التحقق مرة أخرى لاحقًا.
          </p>
        </div>
      )}

      {!fetchError && newsItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
              {item.imageUrl && item.imageUrl.trim() !== '' ? (
                <div className="relative w-full h-52">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint={item.imageHint || "news article image"}
                  />
                </div>
              ) : (
                 <div className="relative w-full h-52 bg-muted flex items-center justify-center">
                   <Newspaper className="h-16 w-16 text-muted-foreground opacity-50" />
                 </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-xl line-clamp-2">
                  {item.title}
                </CardTitle>
                <div className="text-xs text-muted-foreground space-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      {formatDateSafe(item.publishedAt)}
                    </span>
                  </div>
                  {item.source && (
                    <div className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5" />
                      <span>المصدر: {item.source}</span>
                    </div>
                  )}
                  {item.category && (
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      <span>التصنيف: {item.category}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow pt-0">
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto"> 
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

