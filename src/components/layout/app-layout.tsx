
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { mainNavItems } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogOut, Moon, Sun, ArrowRight, UserCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from 'next-themes';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseAuthUser } from 'firebase/auth';
import { getUserProfile } from '@/lib/userProfileService';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { theme, setTheme } = useTheme();

  const [authUser, setAuthUser] = useState<FirebaseAuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoadingUser(true);
      if (user) {
        setAuthUser(user);
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile in layout:", error);
          setUserProfile(null); // Explicitly set to null on error
        }
      } else {
        setAuthUser(null);
        setUserProfile(null);
      }
      setIsLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      // User state will be cleared by onAuthStateChanged listener
      router.push('/auth'); // Redirect to login page after logout
      if (isMobile) {
        setOpenMobile(false);
      }
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally show a toast message for logout error
    }
  };

  const displayName = userProfile?.name || authUser?.displayName || authUser?.email?.split('@')[0] || "مستخدم";
  const displayEmail = userProfile?.email || authUser?.email || "";
  const avatarUrl = userProfile?.avatarUrl || authUser?.photoURL;
  const avatarHint = userProfile?.avatarHint || (authUser?.photoURL ? 'user provided avatar' : 'person letter');
  const avatarFallback = (displayName.length > 1 ? displayName.substring(0, 2) : displayName.charAt(0) || 'U').toUpperCase();


  return (
    <>
      <Sidebar side="right" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2" onClick={handleLinkClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-sidebar-primary">
              <path d="M12 .75a8.25 8.25 0 00-6.065 2.663A8.25 8.25 0 003.75 12c0 3.97 2.807 7.283 6.495 8.015A8.25 8.25 0 0012 21.75a8.25 8.25 0 008.25-8.25c0-4.019-2.863-7.34-6.635-8.092A8.255 8.255 0 0012 .75zM8.25 12a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" />
              <path d="M8.625 9.375a.375.375 0 11-.75 0 .375.375 0 01.75 0zM15.375 9.375a.375.375 0 11-.75 0 .375.375 0 01.75 0zM11.25 12.375a.375.375 0 01.375-.375h.75a.375.375 0 01.375.375V15a.375.375 0 01-.375.375h-.75a.375.375 0 01-.375-.375V12.375z" />
            </svg>
            {state === 'expanded' && <h1 className="text-xl font-semibold text-sidebar-foreground">Atmetny</h1>}
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <ScrollArea className="h-full">
            <SidebarMenu className="p-4">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label, className: "text-xs" }}
                      onClick={handleLinkClick}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          {isLoadingUser ? (
            <div className="flex items-center gap-3 mb-3 p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              {state === 'expanded' && (
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              )}
            </div>
          ) : authUser ? (
            <Link href="/profile" passHref onClick={handleLinkClick}>
              <div className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-sidebar-accent/20 p-2 rounded-md transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl} alt={displayName} data-ai-hint={avatarHint} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                {state === 'expanded' && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</span>
                    <span className="text-xs text-sidebar-foreground/70 truncate">{displayEmail}</span>
                  </div>
                )}
              </div>
            </Link>
          ) : (
             <Link href="/auth" passHref onClick={handleLinkClick}>
                <div className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-sidebar-accent/20 p-2 rounded-md transition-colors">
                    <UserCircle className="h-10 w-10 text-sidebar-foreground/70"/>
                    {state === 'expanded' && (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-sidebar-foreground">تسجيل الدخول</span>
                         <span className="text-xs text-sidebar-foreground/70">للوصول لميزاتك</span>
                    </div>
                    )}
                </div>
            </Link>
          )}
          {authUser && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="ms-2 h-4 w-4" />
              {state === 'expanded' && <span>تسجيل الخروج</span>}
            </Button>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center gap-1">
            {pathname !== '/' && (
              <Button variant="ghost" size="icon" aria-label="الرجوع" onClick={() => router.back()}>
                <ArrowRight />
              </Button>
            )}
            <SidebarTrigger className="md:hidden" />
          </div>
          <div className="flex-1 text-center md:text-start px-2">
            {/* Current Page Title Can Go Here */}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Toggle Theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
               <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
               <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
               <span className="sr-only">Toggle theme</span>
            </Button>
            <SidebarTrigger className="hidden md:flex" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Atmetny. جميع الحقوق محفوظة.
        </footer>
      </SidebarInset>
    </>
  );
}
    
