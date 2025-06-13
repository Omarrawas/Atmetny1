
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserCog, Palette, ShieldCheck, Bell } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
        <p className="text-muted-foreground">
          قم بإدارة تفضيلات حسابك وإعدادات التطبيق من هنا.
        </p>
      </header>

      <Card className="shadow-md">
        <CardHeader>
          <UserCog className="h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-xl">إعدادات الحساب</CardTitle>
          <CardDescription>
            تعديل معلومات ملفك الشخصي وتفضيلات الحساب.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/profile/edit">تعديل الملف الشخصي</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <Palette className="h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-xl">إعدادات المظهر</CardTitle>
          <CardDescription>
            تخصيص مظهر التطبيق والوضع الليلي/النهاري.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            يمكنك تغيير الوضع (فاتح/داكن) من الأيقونة الموجودة في الشريط العلوي.
          </p>
          {/* Future theme options can go here */}
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <Bell className="h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-xl">إعدادات الإشعارات (قريباً)</CardTitle>
          <CardDescription>
            تحكم في الإشعارات التي تتلقاها من التطبيق.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            سيتم تفعيل هذه الميزة في التحديثات القادمة.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <ShieldCheck className="h-8 w-8 text-primary mb-2" />
          <CardTitle className="text-xl">الخصوصية والأمان (قريباً)</CardTitle>
          <CardDescription>
            مراجعة سياسات الخصوصية وإدارة إعدادات الأمان الخاصة بك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
             سيتم تفعيل هذه الميزة في التحديثات القادمة.
          </p>
          {/* <Button variant="link" asChild>
            <Link href="/privacy-policy">عرض سياسة الخصوصية</Link>
          </Button> */}
        </CardContent>
      </Card>
    </div>
  );
}
