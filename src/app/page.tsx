

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Brain, FileText, Gift, Sparkles, Star, Users, BookOpen, Newspaper, Megaphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="relative rounded-lg overflow-hidden p-8 md:p-12 min-h-[350px] flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary to-secondary shadow-lg">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            مرحباً بك في Atmetny!
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            منصتك المثالية للاستعداد لامتحانات الصف الثالث الثانوي في سوريا. ابدأ رحلتك نحو النجاح اليوم.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/study">
                <BookOpen className="ms-2 h-5 w-5" />
                الدراسة
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/news">
                <Newspaper className="ms-2 h-5 w-5" />
                آخر الأخبار
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/announcements">
                <Megaphone className="ms-2 h-5 w-5" />
                الإعلانات
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <FileText className="h-10 w-10 text-primary mb-2" />
            <CardTitle>الاختبارات التدريبية</CardTitle>
            <CardDescription>اكتشف مجموعة واسعة من الاختبارات المخصصة.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>تدرب على أسئلة متنوعة من إعداد أفضل المدرسين في مختلف المواد الدراسية.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/exams">تصفح الاختبارات</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <Sparkles className="h-10 w-10 text-primary mb-2" />
            <CardTitle>تحليل الأداء الذكي</CardTitle>
            <CardDescription>احصل على رؤى مخصصة لتحسين أدائك.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>استخدم الذكاء الاصطناعي لتحليل نتائج اختباراتك وتحديد نقاط القوة والضعف.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/ai-analysis">ابدأ التحليل الآن</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <Users className="h-10 w-10 text-primary mb-2" />
            <CardTitle>مجتمع تفاعلي</CardTitle>
            <CardDescription>تواصل مع الطلاب والمعلمين.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>شارك في النقاشات، اطرح الأسئلة، وتبادل المعرفة مع زملائك ومعلميك.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/community">انضم إلى المجتمع</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-center">إنجازاتك وجوائزك</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-accent/20">
            <CardContent className="pt-6 flex items-center gap-4">
              <Star className="h-8 w-8 text-accent-foreground" />
              <div>
                <p className="text-lg font-semibold">نقاطك الحالية</p>
                <p className="text-2xl font-bold text-accent-foreground">1250 نقطة</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/20">
            <CardContent className="pt-6 flex items-center gap-4">
              <Award className="h-8 w-8 text-accent-foreground" />
              <div>
                <p className="text-lg font-semibold">أحدث شارة</p>
                <p className="text-xl font-bold text-accent-foreground">محترف الفيزياء</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/20">
            <CardContent className="pt-6 flex items-center gap-4">
              <Gift className="h-8 w-8 text-accent-foreground" />
              <div>
                <p className="text-lg font-semibold">المكافآت</p>
                <p className="text-xl font-bold text-accent-foreground">خصم 10%</p>
              </div>
            </CardContent>
          </Card>
        </div>
         <div className="mt-4 text-center">
            <Button variant="link" asChild>
              <Link href="/profile">عرض كل الإنجازات</Link>
            </Button>
          </div>
      </section>
      
      <section className="text-center">
         <Image src="https://placehold.co/800x400.png" alt="طلاب يدرسون" width={800} height={400} className="rounded-lg mx-auto shadow-md" data-ai-hint="students studying" />
      </section>
    </div>
  );
}
