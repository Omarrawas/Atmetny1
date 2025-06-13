
'use client';

import {
  collection, query, where, getDocs, doc,
  updateDoc, serverTimestamp, Timestamp, writeBatch, getDoc, runTransaction, setDoc, limit
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  ActivationCode,
  SubscriptionDetails,
  UserProfileWriteData,
  BackendCodeDetails,
  BackendCheckResult,
  BackendConfirmationPayload,
  BackendConfirmationResult,
} from './types';
import { saveUserProfile } from './userProfileService';

// --- Helper to construct plan name ---
export const getPlanNameFromType = (
    codeType: string,
    codeSubjectName?: string | null, // Subject name defined in the code itself
    chosenSubjectName?: string | null // Subject name chosen by the user
): string => {
  if (chosenSubjectName) {
    return `اشتراك لمادة ${chosenSubjectName}`;
  }
  if (codeSubjectName) {
    return `اشتراك لمادة ${codeSubjectName}`;
  }

  if (codeType) {
    if (codeType.startsWith("general_")) {
      if (codeType === "general_monthly") return "اشتراك شهري عام";
      if (codeType === "general_quarterly") return "اشتراك ربع سنوي عام";
      if (codeType === "general_yearly") return "اشتراك سنوي عام";
    }
    if (codeType.startsWith("choose_single_subject_")) {
      if (codeType === "choose_single_subject_monthly") return "اشتراك شهري لمادة واحدة";
      if (codeType === "choose_single_subject_quarterly") return "اشتراك ربع سنوي لمادة واحدة";
      if (codeType === "choose_single_subject_yearly") return "اشتراك سنوي لمادة واحدة";
    }
    const parts = codeType.replace(/_/g, ' ').split(' ');
    const capitalizedParts = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
    return capitalizedParts.join(' ') || "اشتراك مخصص";
  }
  return "اشتراك مخصص";
};


// --- New Local Firestore Logic (Replaces Firebase Functions calls) ---

/**
 * Checks an activation code directly against Firestore.
 */
export const checkCodeWithBackend = async (encodedValue: string): Promise<BackendCheckResult> => {
  console.log(`Checking code locally: ${encodedValue}`);
  if (!encodedValue || encodedValue.trim() === "") {
    return { isValid: false, message: "الرجاء إدخال رمز التفعيل.", needsSubjectChoice: false };
  }

  try {
    const codesCollectionRef = collection(db, 'activationCodes');
    const q = query(codesCollectionRef, where('encodedValue', '==', encodedValue.trim()), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { isValid: false, message: "رمز التفعيل غير موجود أو غير صحيح.", needsSubjectChoice: false };
    }

    const codeDoc = querySnapshot.docs[0];
    const codeData = codeDoc.data() as ActivationCode; // Cast to ActivationCode for type safety

    const now = Timestamp.now();

    if (!codeData.isActive) {
      return { isValid: false, message: "رمز التفعيل هذا غير نشط حاليًا (قد يكون استخدم سابقًا أو تم إلغاؤه).", needsSubjectChoice: false };
    }
    if (codeData.isUsed) {
      return { isValid: false, message: "رمز التفعيل هذا تم استخدامه مسبقاً.", needsSubjectChoice: false };
    }
    if (codeData.validFrom && now.seconds < codeData.validFrom.seconds) {
      const validFromDate = codeData.validFrom.toDate().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
      return { isValid: false, message: `رمز التفعيل هذا غير صالح للاستخدام قبل تاريخ ${validFromDate}.`, needsSubjectChoice: false };
    }
    if (now.seconds > codeData.validUntil.seconds) {
      return { isValid: false, message: "صلاحية رمز التفعيل هذا قد انتهت.", needsSubjectChoice: false };
    }

    const codeDetailsForClient: BackendCodeDetails = {
      id: codeDoc.id,
      encodedValue: codeData.encodedValue,
      name: codeData.name,
      type: codeData.type,
      validUntil: codeData.validUntil, // This is a Timestamp
      subjectId: codeData.subjectId || null,
      subjectName: codeData.subjectName || null,
    };

    const needsSubjectChoice = codeData.type?.startsWith('choose_single_subject_') ?? false;

    return {
      isValid: true,
      message: needsSubjectChoice ? "الرمز صالح. يرجى اختيار المادة لتفعيل الاشتراك." : "الرمز صالح للتفعيل.",
      needsSubjectChoice,
      codeDetails: codeDetailsForClient,
    };

  } catch (error: any) {
    console.error("Error checking code locally:", error);
    return { isValid: false, message: error.message || "حدث خطأ أثناء التحقق من الرمز.", needsSubjectChoice: false };
  }
};

/**
 * Confirms activation, updates code status, user profile (with activeSubscription), and logs activation.
 * All operations are done directly via Firestore SDK.
 */
export const confirmActivationWithBackend = async (payload: BackendConfirmationPayload): Promise<BackendConfirmationResult> => {
  const { userId, email, codeId, codeType, codeValidUntil, chosenSubjectId, chosenSubjectName } = payload;

  // Basic payload validation
  if (!userId || !email || !codeId || !codeType) {
    return { success: false, message: "بيانات التفعيل الأساسية غير مكتملة (المستخدم، الرمز)." };
  }
  // This check is fine as codeType is directly from payload
  // This check will be re-verified using codeDataFromTransaction.type inside the transaction
  if (codeType.startsWith("choose_single_subject_") && (!chosenSubjectId || !chosenSubjectName)) {
    // This initial check can stay, but the authoritative check will be inside the transaction
    // return { success: false, message: "لم يتم اختيار المادة للاشتراك الفردي." };
    // Allowing to proceed to transaction to fetch actual code type.
  }

  const codeRef = doc(db, "activationCodes", codeId);
  const userRef = doc(db, "users", userId);
  const logRef = doc(collection(db, 'activationLogs')); // Auto-generate ID for log

  try {
    await runTransaction(db, async (transaction) => {
      const codeSnap = await transaction.get(codeRef); // Fetch code inside transaction

      if (!codeSnap.exists()) {
        throw new Error("رمز التفعيل المحدد غير موجود.");
      }
      const codeDataFromTransaction = codeSnap.data() as ActivationCode; // Use this for all code-related info

      if (!codeDataFromTransaction.isActive) {
        throw new Error("رمز التفعيل هذا غير نشط حاليًا.");
      }
      if (codeDataFromTransaction.isUsed) {
        throw new Error("رمز التفعيل هذا تم استخدامه مسبقاً.");
      }
      const now = Timestamp.now();
      if (now.seconds > codeDataFromTransaction.validUntil.seconds) {
        throw new Error("صلاحية رمز التفعيل هذا قد انتهت.");
      }
      // Authoritative check for subject choice based on actual code type from DB
      if (codeDataFromTransaction.type.startsWith("choose_single_subject_") && (!chosenSubjectId || !chosenSubjectName)) {
          throw new Error("لم يتم اختيار المادة للاشتراك الفردي المحدد بالرمز.");
      }


      // 1. Update Activation Code
      const codeUpdateData: Partial<ActivationCode> = {
        isActive: false,
        isUsed: true,
        usedByUserId: userId,
        usedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };
      if (chosenSubjectId) { // If a subject was chosen (for choose_single_subject_ type codes)
        codeUpdateData.usedForSubjectId = chosenSubjectId;
      } else if (codeDataFromTransaction.subjectId) { // If the code itself defined a subject
         codeUpdateData.usedForSubjectId = codeDataFromTransaction.subjectId;
      }
      transaction.update(codeRef, codeUpdateData);

      // 2. Prepare and Update User Profile (activeSubscription)
      const planName = getPlanNameFromType(
        codeDataFromTransaction.type,
        codeDataFromTransaction.subjectName, // Original subject name from code
        chosenSubjectName // User chosen subject name (if applicable)
      );
      const subscriptionEndDate = codeDataFromTransaction.validUntil; // Use validUntil from fetched code

      if (!subscriptionEndDate) { // Should not happen if code is valid based on earlier checks
        throw new Error("تاريخ انتهاء صلاحية الرمز غير محدد بشكل صحيح في بيانات الرمز.");
      }

      const finalSubjectId = chosenSubjectId || codeDataFromTransaction.subjectId || null;
      const finalSubjectName = chosenSubjectName || codeDataFromTransaction.subjectName || null;

      const newSubscription: SubscriptionDetails = {
        planId: codeDataFromTransaction.type,
        planName: planName,
        startDate: now,
        endDate: subscriptionEndDate,
        status: 'active',
        activationCodeId: codeId, 
        subjectId: finalSubjectId,
        subjectName: finalSubjectName,
      };
      
      transaction.set(userRef, { activeSubscription: newSubscription, updatedAt: serverTimestamp() }, { merge: true });


      // 3. Log Activation
      transaction.set(logRef, {
        userId,
        codeId: codeId, 
        subjectId: finalSubjectId, 
        email: email, 
        codeType: codeDataFromTransaction.type, 
        planName: planName,
        activatedAt: serverTimestamp(), 
      });
    });

    // Construct success message using details from fetched code and chosen subject
    const finalActivatedSubjectNameForMessage = chosenSubjectName || (await getDoc(codeRef)).data()?.subjectName; // Re-fetch for message if needed, or rely on existing
    const codeDataForMessage = (await getDoc(codeRef)).data() as ActivationCode | undefined;


    let successMessage = `تم تفعيل اشتراكك بنجاح!`;
    const subEndDateForMessage = codeDataForMessage?.validUntil; 
    
    if (subEndDateForMessage) {
       successMessage += ` ينتهي في ${subEndDateForMessage.toDate().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    }
    if (finalActivatedSubjectNameForMessage) {
        successMessage = `تم تفعيل اشتراكك في مادة "${finalActivatedSubjectNameForMessage}" بنجاح! ينتهي في ${subEndDateForMessage ? subEndDateForMessage.toDate().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'تاريخ غير محدد'}.`;
    }


    return {
      success: true,
      message: successMessage,
      activatedPlanName: getPlanNameFromType(codeDataForMessage!.type, codeDataForMessage!.subjectName, chosenSubjectName),
      subscriptionEndDate: codeDataForMessage!.validUntil,
    };

  } catch (error: any) {
    console.error("Error confirming activation locally:", error);
    return { success: false, message: error.message || "حدث خطأ أثناء تأكيد التفعيل." };
  }
};
