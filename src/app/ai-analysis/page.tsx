import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import AiAnalysisClientForm from "./ai-analysis-client";

export default function AiAnalysisPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-3" />
          <CardTitle className="text-3xl font-bold">تحليل الأداء بالذكاء الاصطناعي</CardTitle>
          <CardDescription className="text-lg">
            احصل على توصيات مخصصة لتحسين درجاتك بناءً على نتائج اختباراتك وأهدافك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AiAnalysisClientForm />
        </CardContent>
      </Card>
    </div>
  );
}
