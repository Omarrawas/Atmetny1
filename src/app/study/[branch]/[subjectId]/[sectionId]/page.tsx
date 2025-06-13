
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSectionById, getSectionLessons } from '@/lib/examService';
import type { SubjectSection, Lesson, UserProfile, Badge, Reward } from '@/lib/types'; // Added Badge, Reward
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, BookText, Loader2, AlertTriangle, ListChecks, PlayCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase'; // Added db
import { onAuthStateChanged, type User as FirebaseAuthUser } from 'firebase/auth';
// Removed: import { getUserProfile } from '@/lib/userProfileService'; // Will use onSnapshot instead
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Timestamp, doc, onSnapshot } from 'firebase/firestore'; // Added doc, onSnapshot

export default function SectionLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const sectionId = params.sectionId as string;
  const branch = params.branch as string;

  const [section, setSection] = useState<SubjectSection | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<FirebaseAuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuthProfile, setIsLoadingAuthProfile] = useState(true); // Combined loading state
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingData(true);
    setError(null);
    if (subjectId && sectionId) {
      const fetchData = async () => {
        try {
          console.log(`Fetching data for sectionId: ${sectionId} in subjectId: ${subjectId}`);
          const [sectionData, lessonsData] = await Promise.all([
            getSectionById(subjectId, sectionId),
            getSectionLessons(subjectId, sectionId),
          ]);

          console.log('Fetched Section Data:', sectionData);
          console.log('Fetched Lessons Data:', lessonsData);

          if (!sectionData) {
            setError(`لم يتم العثور على القسم بالمعرف: ${sectionId}`);
            setSection(null);
            setLessons([]);
          } else {
            setSection(sectionData);
            setLessons(lessonsData);
          }
        } catch (e) {
          console.error("Failed to fetch section lessons data:", e);
          setError("فشل تحميل بيانات دروس القسم. يرجى المحاولة مرة أخرى.");
          setSection(null);
          setLessons([]);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    } else {
      setIsLoadingData(false);
      setError("معرفات المادة أو القسم غير متوفرة.");
    }
  }, [subjectId, sectionId]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Profile will be fetched by the snapshot listener Effect
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setIsLoadingAuthProfile(false); // No user, loading complete
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (currentUser?.uid) {
      setIsLoadingAuthProfile(true);
      const userDocRef = doc(db, "users", currentUser.uid);
      const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const profileData: UserProfile = {
            uid: data.uid,
            name: data.name || "مستخدم جديد",
            email: data.email || "لا يوجد بريد إلكتروني",
            avatarUrl: data.avatarUrl || `https://placehold.co/150x150.png?text=${(data.name || data.email || 'U').charAt(0).toUpperCase()}`,
            avatarHint: data.avatarHint || 'person avatar',
            points: data.points ?? 0,
            level: data.level ?? 1,
            progressToNextLevel: data.progressToNextLevel ?? 0,
            badges: (data.badges ?? []).map((badge: any): Badge => ({
                id: badge.id || crypto.randomUUID(), // Fallback ID
                name: badge.name || 'شارة غير معروفة',
                iconName: badge.iconName || 'Award',
                date: badge.date instanceof Timestamp ? badge.date : Timestamp.now(), // Ensure it's a Timestamp
                image: badge.image || 'https://placehold.co/64x64.png',
                imageHint: badge.imageHint || 'badge icon'
            })),
            rewards: (data.rewards ?? []).map((reward: any): Reward => ({
                id: reward.id || crypto.randomUUID(), // Fallback ID
                name: reward.name || 'مكافأة غير معروفة',
                iconName: reward.iconName || 'Gift',
                expiry: reward.expiry instanceof Timestamp ? reward.expiry : Timestamp.now(), // Ensure it's a Timestamp
            })),
            studentGoals: data.studentGoals ?? '',
            branch: data.branch ?? 'undetermined',
            university: data.university ?? '',
            major: data.major ?? '',
            createdAt: data.createdAt as Timestamp,
            updatedAt: data.updatedAt as Timestamp,
            activeSubscription: data.activeSubscription ? {
              planId: data.activeSubscription.planId,
              planName: data.activeSubscription.planName,
              startDate: data.activeSubscription.startDate as Timestamp,
              endDate: data.activeSubscription.endDate as Timestamp,
              status: data.activeSubscription.status as 'active' | 'expired' | 'cancelled' | 'trial',
              activationCodeId: data.activeSubscription.activationCodeId || null,
              subjectId: data.activeSubscription.subjectId || null,
              subjectName: data.activeSubscription.subjectName || null,
            } : null,
          };
          setUserProfile(profileData);
          console.log("User profile updated via onSnapshot in SectionLessonsPage:", profileData);
        } else {
          setUserProfile(null);
          console.log("User profile document does not exist (onSnapshot in SectionLessonsPage).");
        }
        setIsLoadingAuthProfile(false);
      }, (error) => {
        console.error("Error listening to user profile in SectionLessonsPage:", error);
        setUserProfile(null);
        setIsLoadingAuthProfile(false);
        toast({ title: "خطأ", description: "لم نتمكن من تحميل بيانات المستخدم بشكل حي.", variant: "destructive"});
      });
      return () => unsubscribeProfile();
    } else {
      setUserProfile(null);
      setIsLoadingAuthProfile(false); // No current user, so loading is complete
    }
  }, [currentUser?.uid, toast]);


  const isSubjectActiveForCurrentUser = useMemo(() => {
    if (!currentUser || !userProfile || !userProfile.activeSubscription) {
      console.log("isSubjectActiveForCurrentUser: No user, profile, or activeSubscription object.");
      return false;
    }
    const sub = userProfile.activeSubscription;
    const now = Timestamp.now(); 

    if (sub.status !== 'active' || (sub.endDate && sub.endDate.seconds < now.seconds) ) {
      console.log("isSubjectActiveForCurrentUser: Subscription not active or expired.", {
        status: sub.status,
        endDate: sub.endDate?.toDate().toISOString(),
        now: now.toDate().toISOString(),
        isExpired: sub.endDate && sub.endDate.seconds < now.seconds
      });
      return false;
    }

    const isGeneralSubscription = !sub.subjectId || sub.subjectId.trim() === "";
    const isSpecificSubjectMatch = sub.subjectId === subjectId;

    const isActive = isGeneralSubscription || isSpecificSubjectMatch;

    console.log(`isSubjectActiveForCurrentUser (pageSID: ${subjectId}): Evaluation result: ${isActive}`, {
      subSubjectId: sub.subjectId,
      subStatus: sub.status,
      subEndDate: sub.endDate?.toDate().toISOString(),
      isGeneralSubscription,
      isSpecificSubjectMatch,
    });
    return isActive;
  }, [userProfile, subjectId, currentUser]);


  if (isLoadingData || isLoadingAuthProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          {isLoadingData ? 'جاري تحميل دروس القسم...' : 'جاري تحميل بيانات المستخدم...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={() => router.back()} variant="outline">
          العودة
        </Button>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">لم يتم العثور على القسم.</p>
         <Button onClick={() => router.back()} variant="outline">
          العودة
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <ListChecks className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">{section.title}</CardTitle>
          </div>
          {section.description && (
            <CardDescription className="text-lg">
              {section.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookText className="h-10 w-10 mx-auto mb-2" />
              <p className="text-lg">لا توجد دروس متاحة لهذا القسم حاليًا.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {lessons.map((lesson, index) => {
                const isFirstLesson = index === 0;
                
                const lessonIsLockedByAdminSetting = lesson.isLocked === true || String(lesson.isLocked).toLowerCase() === "true";
                const lessonIsOpenByAdminSetting = lesson.isLocked === false || String(lesson.isLocked).toLowerCase() === "false";

                let effectiveIsLockedByAdmin: boolean;
                if (lessonIsOpenByAdminSetting) {
                  effectiveIsLockedByAdmin = false; 
                } else if (lessonIsLockedByAdminSetting) {
                  effectiveIsLockedByAdmin = true; 
                } else {
                  // lesson.isLocked is undefined or some other value
                  effectiveIsLockedByAdmin = !isFirstLesson; // First lesson free, others locked by default
                }
                
                let displayAsLocked;
                if (effectiveIsLockedByAdmin === false) { 
                  displayAsLocked = false;
                } else { 
                  displayAsLocked = !isSubjectActiveForCurrentUser;
                }
                
                const lessonPath = `/study/${branch}/${subjectId}/${sectionId}/${lesson.id}`;
                const linkHref = displayAsLocked ? '#' : lessonPath;

                const handleLessonClick = (e: React.MouseEvent) => {
                  if (displayAsLocked) {
                    e.preventDefault();
                    if (!currentUser) {
                        toast({
                            title: "تسجيل الدخول مطلوب",
                            description: "يرجى تسجيل الدخول أولاً ثم تفعيل المادة للوصول لهذا الدرس.",
                            variant: "destructive",
                            action: (
                                <Button onClick={() => router.push('/auth')} size="sm">
                                تسجيل الدخول
                                </Button>
                            ),
                        });
                    } else { // User is logged in but subject is not active for them
                        toast({
                        title: "الدرس مقفل",
                        description: "يرجى تفعيل اشتراكك في هذه المادة أو اشتراك عام للوصول لهذا الدرس.",
                        variant: "default", 
                        action: (
                            <Button onClick={() => router.push('/activate-qr')} size="sm">
                            تفعيل الاشتراك الآن
                            </Button>
                        ),
                        });
                    }
                  }
                };
                
                return (
                  <li key={lesson.id}>
                    <Link
                      href={linkHref}
                      onClick={handleLessonClick}
                      passHref
                      aria-disabled={displayAsLocked}
                      className={cn(
                        "block",
                        displayAsLocked && "cursor-default" 
                      )}
                    >
                      <Card className={cn(
                        "transition-shadow group",
                        displayAsLocked ? "bg-muted/60 hover:shadow-none opacity-70" : "hover:shadow-md cursor-pointer"
                      )}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {displayAsLocked ? (
                              <Lock className="h-5 w-5 text-primary" />
                            ) : (
                              <PlayCircle className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                            <h3 className={cn(
                              "text-xl font-semibold transition-colors",
                              !displayAsLocked && "group-hover:text-primary"
                            )}>
                              {lesson.title}
                            </h3>
                          </div>
                          {!displayAsLocked && <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />}
                          {displayAsLocked && <span className="text-xs text-muted-foreground pe-2">(مقفل)</span>}
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
       <div className="text-center mt-8">
        <Button onClick={() => router.back()} variant="outline">
          <ChevronRight className="ms-2 h-4 w-4" /> 
          العودة إلى الأقسام
        </Button>
      </div>
    </div>
  );
}
    

    