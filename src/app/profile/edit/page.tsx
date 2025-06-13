
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditProfileForm } from "./edit-profile-form";
import { UserCog } from "lucide-react";

export default function EditProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col items-center md:items-start">
            <UserCog className="h-10 w-10 text-primary mb-3" />
            <CardTitle className="text-2xl md:text-3xl font-bold">تعديل الملف الشخصي</CardTitle>
            <CardDescription>قم بتحديث معلومات ملفك الشخصي هنا.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <EditProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
