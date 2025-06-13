
import type { User } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

// To represent names of lucide-react icons as strings
export type LucideIconName = keyof typeof import('lucide-react');

export interface Badge {
  id: string;
  name: string;
  iconName: LucideIconName;
  date: Timestamp; // Keep as Timestamp
  image: string;
  imageHint: string;
}

export interface Reward {
  id:string;
  name: string;
  iconName: LucideIconName;
  expiry: Timestamp; // Keep as Timestamp
}

export interface SubscriptionDetails {
  planId: string; // This would correspond to code.type or a derived plan ID
  planName: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'expired' | 'cancelled' | 'trial';
  activationCodeId?: string;
  subjectId?: string | null;
  subjectName?: string | null;
}

export type SubjectBranch = 'scientific' | 'literary' | 'general' | 'common' | 'undetermined';


export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatarHint?: string;
  points: number;
  level: number;
  progressToNextLevel: number;
  badges: Badge[];
  rewards: Reward[];
  studentGoals?: string;
  branch?: SubjectBranch;
  university?: string;
  major?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  activeSubscription?: SubscriptionDetails | null;
  // unlockedSubjects?: Record<string, { unlockedAt: Timestamp }>; // Alternative if using unlockedSubjects model
}

// Input type for saveUserProfile function
export type UserProfileWriteData = {
  uid: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  avatarHint?: string;
  points?: number;
  level?: number;
  progressToNextLevel?: number;
  badges?: Badge[];
  rewards?: Reward[];
  studentGoals?: string;
  branch?: SubjectBranch;
  university?: string;
  major?: string;
  activeSubscription?: SubscriptionDetails | null;
  // unlockedSubjects?: Record<string, { unlockedAt: Timestamp }>;
};


export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: QuestionOption[];
  correctOptionId?: string | null;
  subjectId: string;
  subjectName: string;
  explanation?: string;
  points?: number;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'all';
  tags?: string[];
  createdBy?: string;
}

export interface Subject {
  id: string;
  name: string;
  branch: SubjectBranch;
  iconName?: LucideIconName;
  description?: string;
  image?: string;
  imageHint?: string;
}

export interface SubjectSection {
  id: string;
  title: string;
  description?: string;
  order?: number;
  type?: string;
  subjectId?: string;
  isUsed?: boolean; // Related to activation code usage, not lesson locking
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  usedAt?: Timestamp | null;
  usedByUserId?: string | null;
}

export interface LessonFile {
  name: string;
  url: string;
  type?: string;
}

export interface LessonTeacher {
  name: string;
  youtubeUrl: string;
}

export interface Lesson {
  id: string;
  title: string;
  content?: string;
  notes?: string;
  videoUrl?: string;
  teachers?: LessonTeacher[];
  files?: LessonFile[];
  order?: number;
  subjectId?: string;
  sectionId?: string;
  teacherId?: string | null;
  teacherName?: string | null;
  linkedExamIds?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  isLocked?: boolean; 
  isUsed?: boolean; 
  usedAt?: Timestamp | null;
  usedByUserId?: string | null;
}


export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  durationInMinutes?: number;
  totalQuestions?: number;
  image?: string;
  imageHint?: string;
  description?: string;
  published: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  questionIds?: string[];
  questions?: Question[];
}

export type FirebaseUser = User;

export interface AiAnalysisResult {
  id?: string;
  userId: string;
  userExamAttemptId?: string;
  inputExamResultsText: string;
  inputStudentGoalsText?: string;
  recommendations: string;
  followUpQuestions?: string;
  analyzedAt: Timestamp;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageHint?: string;
  publishedAt: Timestamp;
  source?: string;
  category?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// This type is for Firestore documents within 'activationCodes' collection
export interface ActivationCode {
  id: string; // Document ID
  createdAt: Timestamp;
  encodedValue: string; // The actual code string students enter
  isActive: boolean;    // Can this code be used?
  isUsed: boolean;      // Has this code been used?
  name: string;         // Descriptive name for the code (e.g., "Yearly Math Promo")
  subjectId: string | null; // For pre-defined subject codes, or null if general/choose
  subjectName: string | null;// For pre-defined subject codes
  type: "general_monthly" | "general_quarterly" | "general_yearly" |
        "trial_weekly" |
        "choose_single_subject_monthly" | "choose_single_subject_quarterly" | "choose_single_subject_yearly" |
        string; // string allows for specific subject types like "subject_yearly_math"
  updatedAt: Timestamp;
  usedAt: Timestamp | null;
  usedByUserId: string | null;
  usedForSubjectId?: string | null;
  validFrom: Timestamp; // Code is valid from this date
  validUntil: Timestamp; // Code expires after this date
}


// Details of the code returned by the checkCode function (local Firestore version)
export interface BackendCodeDetails {
  id: string; // Firestore document ID of the code
  type: string;
  subjectId: string | null;
  subjectName: string | null;
  validUntil: Timestamp | null; // This is a Timestamp
  name?: string;
  encodedValue?: string;
}

// Result from the checkCode function (local Firestore version)
export interface BackendCheckResult {
  isValid: boolean;
  message?: string;
  needsSubjectChoice?: boolean;
  codeDetails?: BackendCodeDetails;
}

// Payload sent to the confirmActivation function (local Firestore version)
export interface BackendConfirmationPayload {
  userId: string;
  email: string; // For user profile consistency
  codeId: string; // Firestore document ID of the code
  codeType: string;
  codeValidUntil: Timestamp; // This is a Timestamp, not an ISO string
  chosenSubjectId?: string;
  chosenSubjectName?: string;
}

// Result from the confirmActivation function (local Firestore version)
export interface BackendConfirmationResult {
  success: boolean;
  message: string;
  activatedPlanName?: string;
  subscriptionEndDate?: Timestamp;
}


export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'general';
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
