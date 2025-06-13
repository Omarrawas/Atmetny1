
'use client';

import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, Timestamp, serverTimestamp, updateDoc, collectionGroup, documentId, setDoc, type QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import type { Exam, Question, QuestionOption, AiAnalysisResult, Subject, SubjectSection, Lesson, LessonFile, LessonTeacher, SubjectBranch, UserProfileWriteData } from './types'; 
import { getUserProfile, saveUserProfile } from './userProfileService';

const MAX_IDS_PER_IN_QUERY = 30; // Firestore 'in' query limit

/**
 * Fetches all published exams, with optional filtering by subjectId and teacherId.
 */
export const getPublicExams = async (filters?: { subjectId?: string; teacherId?: string }): Promise<Exam[]> => {
  try {
    const examsCollectionRef = collection(db, 'exams');
    const queryConstraints: QueryConstraint[] = [where('published', '==', true)];
    const appliedQueryParts: string[] = ["published == true"];

    if (filters?.subjectId && filters.subjectId !== 'all' && filters.subjectId !== '') {
      queryConstraints.push(where('subjectId', '==', filters.subjectId));
      appliedQueryParts.push(`subjectId == '${filters.subjectId}'`);
    }
    if (filters?.teacherId && filters.teacherId !== 'all' && filters.teacherId !== '') {
      queryConstraints.push(where('teacherId', '==', filters.teacherId));
      appliedQueryParts.push(`teacherId == '${filters.teacherId}'`);
    }
    queryConstraints.push(orderBy('createdAt', 'desc'));
    appliedQueryParts.push("orderBy createdAt desc");
    
    console.log("Firestore query parts for getPublicExams:", appliedQueryParts.join(", "));


    const q = query(examsCollectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const rawExamsData = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      data: docSnap.data(),
    }));

    const allSubjectIds = new Set<string>();
    rawExamsData.forEach(item => {
      if (item.data.subjectId) {
        allSubjectIds.add(item.data.subjectId);
      }
    });

    const subjectNamesMap = new Map<string, string>();
    if (allSubjectIds.size > 0) {
      const subjectIdChunks: string[][] = [];
      const idsArray = Array.from(allSubjectIds);
      for (let i = 0; i < idsArray.length; i += MAX_IDS_PER_IN_QUERY) {
        subjectIdChunks.push(idsArray.slice(i, i + MAX_IDS_PER_IN_QUERY));
      }

      const subjectsCollectionRef = collection(db, 'subjects');
      for (const chunk of subjectIdChunks) {
        if (chunk.length === 0) continue;
        const subjectQuery = query(subjectsCollectionRef, where(documentId(), 'in', chunk));
        const subjectSnapshot = await getDocs(subjectQuery);
        subjectSnapshot.forEach(subjectDoc => {
          if (subjectDoc.exists() && subjectDoc.data().name) {
            subjectNamesMap.set(subjectDoc.id, subjectDoc.data().name);
          }
        });
      }
    }

    const exams: Exam[] = rawExamsData.map(item => {
      const data = item.data;
      let currentSubjectName = data.subjectName; 

      if (data.subjectId && subjectNamesMap.has(data.subjectId)) {
        const lookedUpName = subjectNamesMap.get(data.subjectId);
        if (lookedUpName && lookedUpName.trim() !== "") {
          currentSubjectName = lookedUpName;
        }
      }
      
      const isPlaceholderOrEmpty = !currentSubjectName ||
                                   currentSubjectName.trim() === "" ||
                                   ["مادة غير معروفة", "unknown"].some(p => currentSubjectName.toLowerCase().includes(p.toLowerCase()));

      if (isPlaceholderOrEmpty) {
        currentSubjectName = "مادة غير معروفة";
      }

      return {
        id: item.id,
        title: data.title || "اختبار بدون عنوان",
        subjectId: data.subjectId || "unknown",
        subjectName: currentSubjectName,
        durationInMinutes: data.durationInMinutes as number | undefined,
        totalQuestions: data.totalQuestions || (data.questionIds && Array.isArray(data.questionIds) ? data.questionIds.length : 0),
        published: data.published || false,
        image: data.image,
        imageHint: data.imageHint,
        description: data.description,
        teacherId: data.teacherId,
        teacherName: data.teacherName,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
        questionIds: data.questionIds as string[] || [],
      };
    });

    return exams;
  } catch (error) {
    console.error("Error fetching public exams: ", error);
    throw error;
  }
};

/**
 * Fetches multiple questions by their IDs from the central 'questions' collection.
 * Handles Firestore 'in' query limit by batching if necessary.
 */
export const getQuestionsByIds = async (questionIds: string[]): Promise<Question[]> => {
  if (!questionIds || questionIds.length === 0) {
    return [];
  }

  const allFetchedQuestions: Question[] = [];
  const idChunks: string[][] = [];

  for (let i = 0; i < questionIds.length; i += MAX_IDS_PER_IN_QUERY) {
    idChunks.push(questionIds.slice(i, i + MAX_IDS_PER_IN_QUERY));
  }
  
  if (questionIds.length > MAX_IDS_PER_IN_QUERY) {
    console.warn(`Fetching ${questionIds.length} questions, which exceeds the Firestore 'in' query limit per query. This will be done in ${idChunks.length} batches.`);
  }

  try {
    const questionsCollectionRef = collection(db, 'questions');
    for (const chunk of idChunks) {
        if (chunk.length === 0) continue;
        const q = query(questionsCollectionRef, where(documentId(), 'in', chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
        const qData = docSnap.data();
        const sanitizedOptions = (qData.options as any[] || []).map((opt: any, optIndex: number): QuestionOption => ({
            id: opt.id || `opt-${docSnap.id}-${optIndex}`, 
            text: opt.text || `خيار ${optIndex + 1}`
        }));
        allFetchedQuestions.push({
            id: docSnap.id,
            questionText: qData.questionText || "نص السؤال مفقود",
            options: sanitizedOptions,
            correctOptionId: qData.correctOptionId || null,
            subjectId: qData.subjectId || 'unknown',
            subjectName: qData.subjectName || 'Unknown Subject',
            explanation: qData.explanation || '',
            points: qData.points ?? 1,
            topic: qData.topic || '',
            difficulty: qData.difficulty as Question['difficulty'] || 'medium',
            tags: qData.tags || [],
            createdBy: qData.createdBy || '',
        });
        });
    }
    // Re-order questions to match the original questionIds order if necessary
    const orderedQuestions = questionIds.map(id => allFetchedQuestions.find(q => q.id === id)).filter(q => q !== undefined) as Question[];
    return orderedQuestions;

  } catch (error) {
    console.error(`Error fetching questions by IDs: `, error);
    throw error;
  }
};


/**
 * Fetches a single exam by its ID, and resolves its questions using `questionIds`.
 * It also attempts to dynamically fetch the subjectName if not denormalized.
 */
export const getExamById = async (examId: string): Promise<Exam | null> => {
  try {
    const examDocRef = doc(db, 'exams', examId);
    const examDocSnap = await getDoc(examDocRef);

    if (!examDocSnap.exists()) {
      console.warn(`Exam with ID ${examId} not found.`);
      return null;
    }

    const examData = examDocSnap.data();
    let resolvedQuestions: Question[] = [];

    if (examData.questionIds && Array.isArray(examData.questionIds) && examData.questionIds.length > 0) {
      resolvedQuestions = await getQuestionsByIds(examData.questionIds as string[]);
    }

    let resolvedSubjectName = examData.subjectName; 
    const subjectId = examData.subjectId;

    if (subjectId) {
        const isPlaceholderOrEmpty = !resolvedSubjectName?.trim() ||
                                     resolvedSubjectName.trim() === "" ||
                                     ["مادة غير معروفة", "unknown"].some(p => resolvedSubjectName!.toLowerCase().includes(p.toLowerCase()));
        if (isPlaceholderOrEmpty) {
            console.log(`Subject name for exam ${examId} is '${resolvedSubjectName}'. Attempting dynamic lookup using subjectId: ${subjectId}`);
            const subjectDetails = await getSubjectById(subjectId);
            if (subjectDetails && subjectDetails.name?.trim()) {
                resolvedSubjectName = subjectDetails.name;
                console.log(`Dynamically resolved subject name to: ${resolvedSubjectName}`);
            } else {
                console.warn(`Dynamic lookup for subjectId ${subjectId} failed or subject has no name. Falling back for exam ${examId}.`);
            }
        }
    }
    
    if (!resolvedSubjectName?.trim() || 
        resolvedSubjectName.trim() === "" || 
        ["مادة غير معروفة", "unknown"].some(p => resolvedSubjectName!.toLowerCase().includes(p.toLowerCase()))) {
        resolvedSubjectName = "مادة غير معروفة";
    }


    return {
      id: examDocSnap.id,
      title: examData.title || "اختبار بدون عنوان",
      subjectId: examData.subjectId || "unknown",
      subjectName: resolvedSubjectName,
      durationInMinutes: examData.durationInMinutes as number | undefined,
      totalQuestions: examData.totalQuestions || resolvedQuestions.length || (examData.questionIds ? examData.questionIds.length : 0),
      published: examData.published || false,
      image: examData.image,
      imageHint: examData.imageHint,
      description: examData.description || "",
      teacherId: examData.teacherId,
      teacherName: examData.teacherName,
      createdAt: examData.createdAt as Timestamp,
      updatedAt: examData.updatedAt as Timestamp,
      questionIds: examData.questionIds as string[] || [],
      questions: resolvedQuestions 
    };
  } catch (error) {
    console.error(`Error fetching exam with ID ${examId}: `, error);
    throw error;
  }
};


/**
 * Fetches multiple exams by their IDs.
 */
export const getExamsByIds = async (examIds: string[]): Promise<Exam[]> => {
  if (!examIds || examIds.length === 0) {
    return [];
  }
  
  const rawExamsData: { id: string; data: any }[] = [];
  const idChunks: string[][] = [];

  for (let i = 0; i < examIds.length; i += MAX_IDS_PER_IN_QUERY) {
    idChunks.push(examIds.slice(i, i + MAX_IDS_PER_IN_QUERY));
  }

  if (examIds.length > MAX_IDS_PER_IN_QUERY) {
     console.warn(`Fetching ${examIds.length} exams by ID, which may require multiple queries due to Firestore 'in' limit.`);
  }

  try {
    const examsCollectionRef = collection(db, 'exams');
    for (const chunk of idChunks) {
        if (chunk.length === 0) continue;
        const q = query(examsCollectionRef, where(documentId(), 'in', chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
            rawExamsData.push({ id: docSnap.id, data: docSnap.data() });
        });
    }

    const allSubjectIds = new Set<string>();
    rawExamsData.forEach(item => {
      if (item.data.subjectId) {
        allSubjectIds.add(item.data.subjectId);
      }
    });

    const subjectNamesMap = new Map<string, string>();
    if (allSubjectIds.size > 0) {
      const subjectIdChunksForNameLookup: string[][] = [];
      const idsArray = Array.from(allSubjectIds);
      for (let i = 0; i < idsArray.length; i += MAX_IDS_PER_IN_QUERY) {
        subjectIdChunksForNameLookup.push(idsArray.slice(i, i + MAX_IDS_PER_IN_QUERY));
      }

      const subjectsCollectionRef = collection(db, 'subjects');
      for (const chunk of subjectIdChunksForNameLookup) {
        if (chunk.length === 0) continue;
        const subjectQuery = query(subjectsCollectionRef, where(documentId(), 'in', chunk));
        const subjectSnapshot = await getDocs(subjectQuery);
        subjectSnapshot.forEach(subjectDoc => {
          if (subjectDoc.exists() && subjectDoc.data().name) {
            subjectNamesMap.set(subjectDoc.id, subjectDoc.data().name);
          }
        });
      }
    }
    
    const resolvedExams = rawExamsData.map(item => {
        const data = item.data;
        let currentSubjectName = data.subjectName;

        if (data.subjectId && subjectNamesMap.has(data.subjectId)) {
            const lookedUpName = subjectNamesMap.get(data.subjectId);
            if (lookedUpName && lookedUpName.trim() !== "") {
                currentSubjectName = lookedUpName;
            }
        }

        const isPlaceholderOrEmpty = !currentSubjectName ||
                                     currentSubjectName.trim() === "" ||
                                     ["مادة غير معروفة", "unknown"].some(p => currentSubjectName.toLowerCase().includes(p.toLowerCase()));
        if (isPlaceholderOrEmpty) {
            currentSubjectName = "مادة غير معروفة";
        }

        return {
            id: item.id,
            title: data.title || "اختبار بدون عنوان",
            subjectId: data.subjectId || "unknown",
            subjectName: currentSubjectName,
            durationInMinutes: data.durationInMinutes as number | undefined,
            totalQuestions: data.totalQuestions || (data.questionIds && Array.isArray(data.questionIds) ? data.questionIds.length : 0),
            published: data.published || false, 
            image: data.image,
            imageHint: data.imageHint,
            description: data.description || "",
            teacherId: data.teacherId,
            teacherName: data.teacherName,
            createdAt: data.createdAt as Timestamp,
            updatedAt: data.updatedAt as Timestamp,
            questionIds: data.questionIds as string[] || [],
        };
    });

    // Re-order exams to match the original examIds order if necessary
    const orderedExams = examIds.map(id => resolvedExams.find(e => e.id === id)).filter(e => e !== undefined) as Exam[];
    return orderedExams;

  } catch (error) {
    console.error("Error fetching exams by IDs: ", error);
    throw error;
  }
};


/**
 * Fetches questions for a specific subject from the centralized 'questions' collection.
 * This is used for "Practice by Subject" feature.
 */
export const getQuestionsBySubject = async (subjectId: string, questionLimit: number = 20): Promise<Question[]> => {
  try {
    const questionsCollectionRef = collection(db, 'questions');
    const q = query(questionsCollectionRef, where('subjectId', '==', subjectId), limit(questionLimit));
    const querySnapshot = await getDocs(q);

    const questions: Question[] = [];
    querySnapshot.forEach((docSnap, index) => {
      const qData = docSnap.data();
      const sanitizedOptions = (qData.options as any[] || []).map((opt: any, optIndex: number): QuestionOption => ({
        id: opt.id || `opt-subj-${docSnap.id}-${optIndex}`, 
        text: opt.text || `خيار ${optIndex + 1}`
      }));
      questions.push({
        id: docSnap.id,
        questionText: qData.questionText || "نص السؤال مفقود",
        options: sanitizedOptions,
        correctOptionId: qData.correctOptionId || null,
        subjectId: qData.subjectId || subjectId,
        subjectName: qData.subjectName || 'مادة غير معروفة', 
        explanation: qData.explanation || '',
        points: qData.points ?? 1,
        topic: qData.topic || '',
        difficulty: qData.difficulty as Question['difficulty'] || 'medium',
        tags: qData.tags || [],
        createdBy: qData.createdBy || '',
      });
    });
    return questions;
  } catch (error) {
    console.error(`Error fetching questions for subject ${subjectId}: `, error);
    throw error;
  }
};

/**
 * Saves an exam attempt and updates user points.
 */
export const saveExamAttempt = async (attemptData: {
  userId: string;
  examId?: string;
  subjectId?: string;
  examType: 'general_exam' | 'subject_practice';
  score: number;
  correctAnswersCount: number;
  totalQuestionsAttempted: number;
  answers: Array<{ questionId: string; selectedOptionId: string; isCorrect: boolean }>;
  startedAt: Date;
  completedAt: Date;
}): Promise<string> => {
  try {
    const attemptsCollectionRef = collection(db, 'userExamAttempts');
    const attemptDocRef = doc(attemptsCollectionRef); 

    await setDoc(attemptDocRef, {
      ...attemptData,
      startedAt: Timestamp.fromDate(attemptData.startedAt),
      completedAt: Timestamp.fromDate(attemptData.completedAt),
      createdAt: serverTimestamp(),
    });

    const userProfileData = await getUserProfile(attemptData.userId);
    if (userProfileData) {
      const pointsPerCorrectAnswer = 10; 
      const pointsEarned = attemptData.correctAnswersCount * pointsPerCorrectAnswer;
      
      const currentPoints = userProfileData.points || 0;
      const newTotalPoints = currentPoints + pointsEarned;
      
      const profileUpdate: Partial<UserProfileWriteData> = {
        uid: attemptData.userId, 
        points: newTotalPoints,
      };
      await saveUserProfile(profileUpdate); 
      console.log(`User ${attemptData.userId} earned ${pointsEarned} points. New total: ${newTotalPoints}`);
    } else {
      console.warn(`User profile not found for UID ${attemptData.userId} while trying to update points.`);
    }

    return attemptDocRef.id;
  } catch (error) {
    console.error("Error saving exam attempt: ", error);
    throw error;
  }
};


/**
 * Saves AI analysis results to Firestore.
 */
export const saveAiAnalysis = async (analysisData: Omit<AiAnalysisResult, 'id' | 'analyzedAt'>): Promise<string> => {
  try {
    const aiAnalysesCollectionRef = collection(db, 'aiAnalyses');
    const analysisDocRef = doc(aiAnalysesCollectionRef); 

    const dataToSave = {
      ...analysisData,
      analyzedAt: serverTimestamp() as Timestamp, 
    };

    await setDoc(analysisDocRef, dataToSave);
    console.log(`AI Analysis result saved with ID: ${analysisDocRef.id}`);
    return analysisDocRef.id;
  } catch (error) {
    console.error("Error saving AI analysis result: ", error);
    throw error;
  }
};

/**
 * Fetches all subjects from the 'subjects' collection in Firestore.
 */
export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const subjectsCollectionRef = collection(db, 'subjects');
    const q = query(subjectsCollectionRef, orderBy('name')); 
    const querySnapshot = await getDocs(q);

    const subjectsList: Subject[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      subjectsList.push({
        id: docSnap.id,
        name: data.name || "مادة بدون اسم",
        branch: (data.branch || 'common') as SubjectBranch,
        iconName: data.iconName as Subject['iconName'],
        description: data.description,
        image: data.image,
        imageHint: data.imageHint,
      });
    });
    return subjectsList;
  } catch (error) {
    console.error("Error fetching subjects from Firestore: ", error);
    throw error;
  }
};

/**
 * Fetches a single subject by its ID.
 */
export const getSubjectById = async (subjectId: string): Promise<Subject | null> => {
  try {
    const subjectDocRef = doc(db, 'subjects', subjectId);
    const subjectDocSnap = await getDoc(subjectDocRef);

    if (!subjectDocSnap.exists()) {
      console.warn(`Subject with ID ${subjectId} not found.`);
      return null;
    }

    const data = subjectDocSnap.data();
    return {
      id: subjectDocSnap.id,
      name: data.name || "مادة بدون اسم",
      branch: (data.branch || 'common') as SubjectBranch,
      iconName: data.iconName as Subject['iconName'],
      description: data.description,
      image: data.image,
      imageHint: data.imageHint,
    };
  } catch (error) {
    console.error(`Error fetching subject with ID ${subjectId}: `, error);
    throw error;
  }
};

/**
 * Fetches all sections for a given subject from its 'sections' subcollection.
 */
export const getSubjectSections = async (subjectId: string): Promise<SubjectSection[]> => {
  try {
    const sectionsCollectionRef = collection(db, 'subjects', subjectId, 'sections');
    let q = query(sectionsCollectionRef); 
    q = query(sectionsCollectionRef, orderBy('order', 'asc')); 
    
    const querySnapshot = await getDocs(q);
    console.log('Fetched Sections Snapshot for subject', subjectId, ':', querySnapshot.docs.length, 'documents');


    const sections: SubjectSection[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      sections.push({
        id: docSnap.id,
        title: data.title || "قسم بدون عنوان",
        description: data.description,
        order: data.order,
        type: data.type,
        isUsed: data.isUsed ?? false,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
        usedAt: data.usedAt as Timestamp | null,
        usedByUserId: data.usedByUserId as string | null,
        subjectId: data.subjectId || subjectId, 
      });
    });
    return sections;
  } catch (error) {
    console.error(`Error fetching sections for subject ${subjectId}: `, error);
    throw error;
  }
};

/**
 * Fetches a single section by its ID within a subject.
 */
export const getSectionById = async (subjectId: string, sectionId: string): Promise<SubjectSection | null> => {
  try {
    const sectionDocRef = doc(db, 'subjects', subjectId, 'sections', sectionId);
    const sectionDocSnap = await getDoc(sectionDocRef);

    if (!sectionDocSnap.exists()) {
      console.warn(`Section with ID ${sectionId} in subject ${subjectId} not found.`);
      return null;
    }

    const data = sectionDocSnap.data();
    return {
      id: sectionDocSnap.id,
      title: data.title || "قسم بدون عنوان",
      description: data.description,
      order: data.order,
      type: data.type,
      subjectId: data.subjectId || subjectId,
      isUsed: data.isUsed ?? false,
      createdAt: data.createdAt as Timestamp,
      updatedAt: data.updatedAt as Timestamp,
      usedAt: data.usedAt as Timestamp | null,
      usedByUserId: data.usedByUserId as string | null,
    };
  } catch (error) {
    console.error(`Error fetching section ${sectionId} for subject ${subjectId}: `, error);
    throw error;
  }
};


/**
 * Fetches all lessons for a given section within a subject.
 * Orders by 'order' field if it exists.
 */
export const getSectionLessons = async (subjectId: string, sectionId: string): Promise<Lesson[]> => {
  try {
    const lessonsCollectionRef = collection(db, 'subjects', subjectId, 'sections', sectionId, 'lessons');
    let q = query(lessonsCollectionRef, orderBy('order', 'asc')); 
    
    const querySnapshot = await getDocs(q);

    const lessons: Lesson[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const lessonTeachers = (data.teachers as any[] || []).map((teacher: any): LessonTeacher => ({
        name: teacher.name || 'مدرس غير معروف',
        youtubeUrl: teacher.youtubeUrl || ''
      }));

      lessons.push({
        id: docSnap.id,
        title: data.title || "درس بدون عنوان",
        content: data.content,
        notes: data.notes, 
        videoUrl: data.videoUrl,
        teachers: lessonTeachers,
        files: (data.files as any[] || []).map((file: any): LessonFile => ({
          name: file.name || 'ملف غير مسمى',
          url: file.url || '',
          type: file.type
        })),
        order: data.order,
        linkedExamIds: (data.linkedExamIds as string[] || []),
        subjectId: data.subjectId || subjectId,
        sectionId: data.sectionId || sectionId,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
        isLocked: data.isLocked, // Pass true, false, or undefined as is
        isUsed: data.isUsed ?? false,
        usedAt: data.usedAt as Timestamp | null,
        usedByUserId: data.usedByUserId as string | null,
        teacherId: data.teacherId as string | null, 
        teacherName: data.teacherName as string | null,
      });
    });
    return lessons;
  } catch (error) {
    console.error(`Error fetching lessons for section ${sectionId} in subject ${subjectId}: `, error);
    throw error;
  }
};

/**
 * Fetches a single lesson by its ID within a section and subject.
 */
export const getLessonById = async (subjectId: string, sectionId: string, lessonId: string): Promise<Lesson | null> => {
  try {
    const lessonDocRef = doc(db, 'subjects', subjectId, 'sections', sectionId, 'lessons', lessonId);
    const lessonDocSnap = await getDoc(lessonDocRef);

    if (!lessonDocSnap.exists()) {
      console.warn(`Lesson with ID ${lessonId} in section ${sectionId}, subject ${subjectId} not found.`);
      return null;
    }

    const data = lessonDocSnap.data();
    const lessonTeachers = (data.teachers as any[] || []).map((teacher: any): LessonTeacher => ({
      name: teacher.name || 'مدرس غير معروف',
      youtubeUrl: teacher.youtubeUrl || ''
    }));

    return {
      id: lessonDocSnap.id,
      title: data.title || "درس بدون عنوان",
      content: data.content,
      notes: data.notes, 
      videoUrl: data.videoUrl,
      teachers: lessonTeachers,
      files: (data.files as any[] || []).map((file: any): LessonFile => ({
        name: file.name || 'ملف غير مسمى',
        url: file.url || '',
        type: file.type
      })),
      order: data.order,
      linkedExamIds: (data.linkedExamIds as string[] || []),
      subjectId: data.subjectId || subjectId,
      sectionId: data.sectionId || sectionId,
      teacherId: data.teacherId as string | null,
      teacherName: data.teacherName as string | null,
      createdAt: data.createdAt as Timestamp,
      updatedAt: data.updatedAt as Timestamp,
      isLocked: data.isLocked, // Pass true, false, or undefined as is
      isUsed: data.isUsed ?? false,
      usedAt: data.usedAt as Timestamp | null,
      usedByUserId: data.usedByUserId as string | null,
    };
  } catch (error) {
    console.error(`Error fetching lesson ${lessonId} for section ${sectionId}, subject ${subjectId}: `, error);
    throw error;
  }
};
    
