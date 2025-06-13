
'use client';

import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Loader2, Save, XCircle } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseAuthUser } from 'firebase/auth';
import { saveUserProfile, getUserProfile } from '@/lib/userProfileService';
import { Skeleton } from '@/components/ui/skeleton';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يكون الاسم حرفين على الأقل." }).max(50, { message: "يجب ألا يتجاوز الاسم 50 حرفًا." }),
  avatarUrl: z.string().url({ message: "الرجاء إدخال رابط صورة صالح للصورة الرمزية." }).optional().or(z.literal('')),
  avatarHint: z.string().max(100, {message: "تلميح الصورة طويل جدًا"}).optional().or(z.literal('')),
  university: z.string().max(100, { message: "اسم الجامعة طويل جدًا"}).optional().or(z.literal('')),
  major: z.string().max(100, { message: "اسم التخصص طويل جدًا"}).optional().or(z.literal('')),
  studentGoals: z.string().max(500, { message: "الأهداف طويلة جدًا"}).optional().or(z.literal('')),
  branch: z.enum(['scientific', 'literary', 'undetermined']).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function EditProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseAuthUser | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      avatarUrl: '',
      avatarHint: '',
      university: '',
      major: '',
      studentGoals: '',
      branch: 'undetermined',
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            form.reset({
              name: profile.name || '',
              avatarUrl: profile.avatarUrl || '',
              avatarHint: profile.avatarHint || 'person avatar',
              university: profile.university || '',
              major: profile.major || '',
              studentGoals: profile.studentGoals || '',
              branch: profile.branch || 'undetermined',
            });
          }
        } catch (e) {
          console.error("Failed to fetch profile for editing:", e);
          toast({ title: "خطأ", description: "لم نتمكن من تحميل بيانات ملفك الشخصي للتعديل.", variant: "destructive" });
        } finally {
          setIsFetchingProfile(false);
        }
      } else {
        router.push('/auth');
        setIsFetchingProfile(false);
      }
    });
    return () => unsubscribe();
  }, [form, router, toast]);


  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!currentUser || !currentUser.email) {
      toast({ title: "خطأ", description: "يجب أن تكون مسجلاً الدخول لتحديث ملفك الشخصي والبريد الإلكتروني مطلوب.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      // Prepare data for saveUserProfile.
      // Note: saveUserProfile will reset points, level, badges, rewards as per its current spec.
      const profileToSave = {
        uid: currentUser.uid,
        email: currentUser.email, // Email is from auth, not form
        name: data.name,
        avatarUrl: data.avatarUrl || undefined, // Pass undefined if empty to let saveUserProfile handle default
        avatarHint: data.avatarHint || 'person avatar',
        university: data.university,
        major: data.major,
        studentGoals: data.studentGoals,
        branch: data.branch,
        // activeSubscription is not part of this form, so it's not passed.
        // saveUserProfile will set it to null if not provided or handle merge if it exists.
      };

      await saveUserProfile(profileToSave);
      toast({
        title: "تم حفظ التغييرات",
        description: "تم تحديث معلومات ملفك الشخصي بنجاح.",
      });
      router.push('/profile');
      router.refresh();
    } catch (error) {
      console.error("Profile update error:", error);
      toast({ title: "خطأ في الحفظ", description: "حدث خطأ أثناء محاولة حفظ التغييرات.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 flex-auto" />
          <Skeleton className="h-10 flex-auto" />
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input placeholder="الاسم الكامل" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
            <FormLabel>البريد الإلكتروني</FormLabel>
            <FormControl>
            <Input type="email" placeholder="البريد الإلكتروني" value={currentUser?.email || ''} disabled />
            </FormControl>
            <p className="text-xs text-muted-foreground pt-1">
            لا يمكن تغيير البريد الإلكتروني من هنا.
            </p>
        </FormItem>
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رابط الصورة الرمزية</FormLabel>
              <FormControl>
                <Input dir="ltr" placeholder="https://example.com/avatar.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="avatarHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تلميح الصورة الرمزية (اختياري)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: person studying, user icon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="university"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الجامعة (اختياري)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: جامعة دمشق" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="major"
          render={({ field }) => (
            <FormItem>
              <FormLabel>التخصص (اختياري)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: هندسة المعلوماتية" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="studentGoals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الأهداف الدراسية (اختياري)</FormLabel>
              <FormControl>
                <Textarea placeholder="صف أهدافك الدراسية هنا..." {...field} className="min-h-[100px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الفرع الدراسي (اختياري)</FormLabel>
               <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="undetermined">غير محدد</option>
                <option value="scientific">علمي</option>
                <option value="literary">أدبي</option>
              </select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="submit" disabled={isLoading || isFetchingProfile} className="w-full sm:flex-auto">
            {isLoading ? (
              <>
                <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ms-2 h-4 w-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/profile')}
            disabled={isLoading || isFetchingProfile}
            className="w-full sm:flex-auto"
          >
             <XCircle className="ms-2 h-4 w-4" />
            إلغاء
          </Button>
        </div>
      </form>
    </Form>
  );
}
