
'use client';

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import * as Icons from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { UserProfile, Badge, Reward, LucideIconName } from '@/lib/types';
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseAuthUser } from "firebase/auth";
import { getUserProfile } from "@/lib/userProfileService";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import type { Timestamp } from "firebase/firestore";

// Helper function to get Lucide icon component by name
const getIcon = (iconName?: LucideIconName): React.ElementType => {
  if (!iconName) return Icons.HelpCircle; // Default fallback if no iconName
  const IconComponent = Icons[iconName as keyof typeof Icons];
  return IconComponent || Icons.HelpCircle; // Fallback icon
};

// Helper to format Firestore Timestamp to a readable date string
const formatDate = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return 'غير محدد';
  return timestamp.toDate().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
};


export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          setIsLoading(true);
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Potentially, profile is being created, or this is an error state
            // For now, we'll assume a profile should exist or will be created by upsertUserProfile
            console.log("Profile not found for user, might be new or an issue fetching.");
            // setError("لم يتم العثور على ملفك الشخصي. قد يتم إنشاؤه قريبًا.");
            // To avoid showing error for new users whose profile might be in creation process:
            // We can try to fetch again after a short delay, or rely on upsert to create it.
            // For now, if null, we show limited info or a message.
            // If upsertUserProfile is robust, this path should be rare for logged-in users.
          }
        } catch (e) {
          console.error("Error fetching profile:", e);
          setError("حدث خطأ أثناء تحميل ملفك الشخصي.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setIsLoading(false);
        // Optionally redirect to login or show a message
        // router.push('/auth'); // Example redirect
      }
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Card className="overflow-hidden shadow-lg">
          <Skeleton className="h-32 md:h-40 w-full" />
          <div className="p-6 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-10">
            <Skeleton className="h-32 w-32 rounded-full border-4 border-background shadow-md" />
            <div className="text-center md:text-start flex-grow">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
          <CardContent className="pt-0">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
        {/* Add more skeletons for other sections if desired */}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive-foreground bg-destructive p-4 rounded-md">{error}</div>;
  }
  
  if (!currentUser) {
     return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground mb-4">الرجاء تسجيل الدخول لعرض ملفك الشخصي.</p>
        <Button asChild>
          <Link href="/auth">تسجيل الدخول</Link>
        </Button>
      </div>
    );
  }

  // If userProfile is still null after loading and user is authenticated,
  // it might mean the profile is new and hasn't been created yet by upsertUserProfile.
  // upsertUserProfile should handle this on signup.
  // For a more robust UI, we could show a message or specific state here.
  // For now, we assume userProfile will be populated if getUserProfile returns data.
  // Or, we use currentUser for basic info if profile is thin.
  const displayName = userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0] || "مستخدم";
  const displayEmail = userProfile?.email || currentUser.email || "لا يوجد بريد إلكتروني";
  const displayAvatarUrl = userProfile?.avatarUrl || currentUser.photoURL || `https://placehold.co/150x150.png?text=${displayName.charAt(0).toUpperCase()}`;
  const displayAvatarHint = userProfile?.avatarHint || 'person avatar';
  
  const displayLevel = userProfile?.level ?? 1;
  const displayProgress = userProfile?.progressToNextLevel ?? 0;
  const displayPoints = userProfile?.points ?? 0;
  const displayBadges = userProfile?.badges ?? [];
  const displayRewards = userProfile?.rewards ?? [];


  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg">
        <div className="bg-gradient-to-br from-primary to-secondary h-32 md:h-40" />
        <div className="p-6 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-10">
          <Avatar className="h-32 w-32 border-4 border-background shadow-md">
            <AvatarImage src={displayAvatarUrl} alt={displayName} data-ai-hint={displayAvatarHint}/>
            <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-start flex-grow">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">{displayEmail}</p>
            <UiBadge variant="outline" className="mt-1">المستوى {displayLevel}</UiBadge>
          </div>
          <Button variant="outline" asChild>
            <Link href="/profile/edit">
              <Icons.Edit3 className="ms-2 h-4 w-4" />
              تعديل الملف الشخصي
            </Link>
          </Button>
        </div>
        <CardContent className="pt-0">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>التقدم للمستوى التالي ({displayLevel + 1})</span>
              <span>{displayProgress}%</span>
            </div>
            <Progress value={displayProgress} aria-label={`التقدم للمستوى ${displayLevel + 1}`} />
          </div>
          {userProfile?.createdAt && (
            <p className="text-xs text-muted-foreground">تاريخ الإنشاء: {formatDate(userProfile.createdAt)}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Star className="text-yellow-500" />
              النقاط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-center text-primary">{displayPoints.toLocaleString('ar-SA')}</p>
            <p className="text-sm text-muted-foreground text-center mt-2">استمر في التعلم لجمع المزيد من النقاط!</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Award className="text-orange-500" />
              الشارات المكتسبة
            </CardTitle>
            <CardDescription>عرض الشارات التي حصلت عليها لإنجازاتك.</CardDescription>
          </CardHeader>
          <CardContent>
            {displayBadges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {displayBadges.map(badge => {
                  const BadgeIcon = getIcon(badge.iconName); // Badge icon from its name
                  return (
                    <div key={badge.id} className="flex flex-col items-center text-center p-3 border rounded-lg hover:shadow-md transition-shadow">
                      <Image src={badge.image} alt={badge.name} width={64} height={64} className="mb-2 rounded-full" data-ai-hint={badge.imageHint} />
                      <p className="text-sm font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">مكتسبة في: {new Date(badge.date).toLocaleDateString('ar-SA')}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">لم تحصل على أي شارات بعد. ابدأ بحل الاختبارات!</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Gift className="text-green-500" />
            المكافآت والخصومات
          </CardTitle>
          <CardDescription>تحقق من المكافآت التي يمكنك استخدامها.</CardDescription>
        </CardHeader>
        <CardContent>
          {displayRewards.length > 0 ? (
            <ul className="space-y-3">
              {displayRewards.map(reward => {
                const RewardIcon = getIcon(reward.iconName);
                return (
                  <li key={reward.id} className="flex items-center justify-between p-3 border rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <RewardIcon className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium">{reward.name}</p>
                        <p className="text-xs text-muted-foreground">صالح حتى: {new Date(reward.expiry).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">استخدام</Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">لا توجد مكافآت متاحة حالياً. أكمل التحديات لربح المزيد!</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Icons.Briefcase /> الجامعة والتخصص</CardTitle>
        </CardHeader>
        <CardContent>
            <p><strong>الجامعة:</strong> {userProfile?.university || 'غير محدد'}</p>
            <p><strong>التخصص:</strong> {userProfile?.major || 'غير محدد'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Icons.Target /> أهدافي الدراسية</CardTitle>
          <CardDescription>حدد أهدافك وتتبع تقدمك نحوها.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-6">
            <p>{userProfile?.studentGoals || 'لم يتم تحديد أهداف دراسية بعد.'}</p>
            <Button variant="link" className="mt-2" asChild><Link href="/profile/edit">تعديل الأهداف</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
