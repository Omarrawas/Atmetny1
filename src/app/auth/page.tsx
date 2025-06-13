import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthForm } from "./auth-form";
import { LogIn } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <LogIn className="h-12 w-12 text-primary mx-auto mb-3" />
          <CardTitle className="text-3xl font-bold">مرحباً بك</CardTitle>
          <CardDescription className="text-lg">
            سجل دخولك أو أنشئ حساباً جديداً للمتابعة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  );
}
