import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Zap } from "lucide-react";

const plans = [
  {
    name: "الخطة المجانية",
    price: "مجاناً",
    period: "للأبد",
    features: [
      "وصول محدود لبعض الاختبارات",
      "عدد محدود من الأسئلة يومياً",
      "تحليل أداء أساسي",
    ],
    cta: "ابدأ مجاناً",
    isFeatured: false,
    tag: "تجربة أساسية"
  },
  {
    name: "الخطة الشهرية",
    price: "5,000 ل.س",
    period: "/ شهر",
    features: [
      "وصول كامل لجميع الاختبارات",
      "عدد غير محدود من الأسئلة",
      "تحليل أداء متقدم بالذكاء الاصطناعي",
      "دعم فني عبر المجتمع",
    ],
    cta: "اشترك الآن",
    isFeatured: false,
    tag: "مرونة شهرية"
  },
  {
    name: "الخطة الفصلية",
    price: "12,000 ل.س",
    period: "/ 3 أشهر",
    features: [
      "جميع مزايا الخطة الشهرية",
      "خصم على السعر الإجمالي",
      "أولوية في الوصول للميزات الجديدة",
      "شارة 'طالب متميز' في الملف الشخصي",
    ],
    cta: "اختر الخطة",
    isFeatured: true,
    tag: "الأكثر شيوعاً"
  },
  {
    name: "الخطة السنوية",
    price: "40,000 ل.س",
    period: "/ سنة",
    features: [
      "جميع مزايا الخطة الفصلية",
      "أكبر توفير على السعر",
      "جلسة استشارية واحدة مع معلم (حسب التوفر)",
      "محتوى حصري إضافي",
    ],
    cta: "اختر الخطة",
    isFeatured: false,
    tag: "أفضل قيمة"
  },
];

export default function SubscribePage() {
  return (
    <div className="space-y-12">
      <header className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">خطط اشتراك مرنة تناسبك</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          اختر الخطة التي تلبي احتياجاتك التعليمية وتساعدك على تحقيق أفضل النتائج في Atmetny.
        </p>
        <p className="text-sm text-muted-foreground">
          *جميع الأسعار بالليرة السورية (ل.س).
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.isFeatured ? 'border-2 border-primary shadow-2xl relative overflow-hidden' : 'hover:shadow-xl transition-shadow'}`}>
            {plan.isFeatured && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                <Star className="inline-block me-1 h-3 w-3" /> {plan.tag}
              </div>
            )}
             <CardHeader className="text-center pb-4">
              {!plan.isFeatured && plan.tag && <p className="text-xs text-muted-foreground mb-1">{plan.tag}</p>}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period !== "للأبد" && <span className="text-muted-foreground">{plan.period}</span>}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className={`h-5 w-5 mt-0.5 shrink-0 ${plan.isFeatured ? 'text-primary' : 'text-green-500'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className={`w-full text-lg py-3 ${plan.isFeatured ? '' : 'variant="outline"'}`}>
                {plan.cta}
                {plan.isFeatured && <Zap className="ms-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="bg-accent/20 text-center">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-2 text-accent-foreground">فترة تجريبية مجانية!</h3>
          <p className="text-muted-foreground mb-4">
            جرب ميزاتنا الأساسية مجانًا لمدة أسبوع واحد. لا حاجة لبطاقة ائتمان.
          </p>
          <Button variant="outline" size="lg">ابدأ تجربتك المجانية</Button>
        </CardContent>
      </Card>
    </div>
  );
}
