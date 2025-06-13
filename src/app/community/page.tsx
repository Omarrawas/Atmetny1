import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Zap } from "lucide-react";
import Image from "next/image";

export default function CommunityPage() {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-8">
      <header className="space-y-3">
        <Users className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-4xl font-bold">مجتمع Atmetny</h1>
        <p className="text-xl text-muted-foreground">
          تواصل، تعلم، وشارك مع زملائك الطلاب والمعلمين في بيئة تفاعلية وآمنة.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>قريباً... منتدى النقاش التفاعلي!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Image src="https://placehold.co/600x350.png" alt="طلاب يتناقشون" width={600} height={350} className="rounded-lg mx-auto shadow-md mb-4" data-ai-hint="students discussion" />
          <p className="text-lg text-muted-foreground">
            نعمل بجد لإطلاق منتدى تفاعلي حيث يمكنك:
          </p>
          <ul className="list-disc list-inside space-y-2 text-start mx-auto max-w-md text-muted-foreground">
            <li>طرح الأسئلة والحصول على إجابات من المعلمين والطلاب.</li>
            <li>مناقشة المواضيع الدراسية المختلفة.</li>
            <li>مشاركة النصائح والمصادر التعليمية.</li>
            <li>تكوين مجموعات دراسية.</li>
          </ul>
          <p className="text-lg font-semibold mt-6">
            ترقبوا التحديثات!
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">في هذه الأثناء...</h3>
        <p className="text-muted-foreground">
            يمكنك متابعتنا على وسائل التواصل الاجتماعي أو التواصل مع فريق الدعم إذا كانت لديك أي استفسارات.
        </p>
        <div className="flex gap-4 justify-center">
            <Button variant="outline">
                <MessageSquare className="ms-2 h-4 w-4" />
                تواصل معنا
            </Button>
             <Button variant="outline">
                <Zap className="ms-2 h-4 w-4" />
                تابعنا على فيسبوك (مثال)
            </Button>
        </div>
      </div>
    </div>
  );
}
