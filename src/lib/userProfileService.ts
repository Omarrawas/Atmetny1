
'use client';

import { doc, setDoc, getDoc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, SubscriptionDetails, UserProfileWriteData, Badge, Reward } from './types';


export const saveUserProfile = async (data: UserProfileWriteData): Promise<void> => {
  if (!data.uid) {
    console.error("UID is missing for saveUserProfile.");
    throw new Error("UID is missing");
  }
  const userRef = doc(db, "users", data.uid);

  let subscriptionDataToSave: SubscriptionDetails | null = null;
  if (Object.prototype.hasOwnProperty.call(data, 'activeSubscription')) {
    if (data.activeSubscription === null) {
      subscriptionDataToSave = null;
    } else if (data.activeSubscription) {
      subscriptionDataToSave = {
        ...data.activeSubscription,
        startDate: data.activeSubscription.startDate instanceof Timestamp ? data.activeSubscription.startDate : Timestamp.fromDate(data.activeSubscription.startDate),
        endDate: data.activeSubscription.endDate instanceof Timestamp ? data.activeSubscription.endDate : Timestamp.fromDate(data.activeSubscription.endDate),
      };
    }
  }


  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      // Update existing document
      const updatePayload: { [key: string]: any } = {
        updatedAt: serverTimestamp() as Timestamp,
      };

      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.email !== undefined) updatePayload.email = data.email; // Email updates might be restricted by Firebase Auth rules / process
      if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl;
      if (data.avatarHint !== undefined) updatePayload.avatarHint = data.avatarHint;
      if (data.points !== undefined) updatePayload.points = data.points;
      if (data.level !== undefined) updatePayload.level = data.level;
      if (data.progressToNextLevel !== undefined) updatePayload.progressToNextLevel = data.progressToNextLevel;
      if (data.badges !== undefined) updatePayload.badges = data.badges;
      if (data.rewards !== undefined) updatePayload.rewards = data.rewards;
      if (data.studentGoals !== undefined) updatePayload.studentGoals = data.studentGoals;
      if (data.branch !== undefined) updatePayload.branch = data.branch;
      if (data.university !== undefined) updatePayload.university = data.university;
      if (data.major !== undefined) updatePayload.major = data.major;
      
      if (Object.prototype.hasOwnProperty.call(data, 'activeSubscription')) {
        updatePayload.activeSubscription = subscriptionDataToSave;
      }

      if (Object.keys(updatePayload).length > 1) { // Check if there's more than just updatedAt
        await updateDoc(userRef, updatePayload);
        console.log(`User profile for UID ${data.uid} updated.`);
      } else {
        // If only updatedAt is present, we might still want to update it.
        await updateDoc(userRef, { updatedAt: serverTimestamp() as Timestamp });
        console.log(`User profile for UID ${data.uid} 'updatedAt' timestamp refreshed.`);
      }

    } else {
      // Create new document
      // Ensure all fields of UserProfile are present, falling back to defaults
      const newProfile: UserProfile = {
        uid: data.uid,
        name: data.name ?? "طالب جديد",
        email: data.email!, // Email should be present for new users from Auth
        avatarUrl: data.avatarUrl || `https://placehold.co/150x150.png?text=${(data.name || data.email || "U").charAt(0).toUpperCase()}`,
        avatarHint: data.avatarHint || 'person avatar',
        points: data.points ?? 0,
        level: data.level ?? 1,
        progressToNextLevel: data.progressToNextLevel ?? 0,
        badges: data.badges ?? [],
        rewards: data.rewards ?? [],
        studentGoals: data.studentGoals ?? '',
        branch: data.branch ?? 'undetermined',
        university: data.university ?? '',
        major: data.major ?? '',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        activeSubscription: subscriptionDataToSave ?? null,
      };
      await setDoc(userRef, newProfile);
      console.log(`User profile for UID ${data.uid} created.`);
    }
  } catch (error) {
    console.error("Error saving user profile: ", error);
    throw error;
  }
};


export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!uid) {
    console.warn("UID is missing for getUserProfile.");
    return null;
  }
  const userRef = doc(db, 'users', uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Construct the UserProfile object, ensuring all fields are present or defaulted
      return {
        uid: data.uid,
        name: data.name || "مستخدم جديد", // Fallback name
        email: data.email || "لا يوجد بريد إلكتروني", // Fallback email
        avatarUrl: data.avatarUrl || `https://placehold.co/150x150.png?text=${(data.name || data.email || 'U').charAt(0).toUpperCase()}`,
        avatarHint: data.avatarHint || 'person avatar',
        points: data.points ?? 0,
        level: data.level ?? 1,
        progressToNextLevel: data.progressToNextLevel ?? 0,
        badges: (data.badges ?? []).map((badge: any): Badge => ({
            id: badge.id || '',
            name: badge.name || '',
            iconName: badge.iconName || 'Award',
            date: badge.date as Timestamp, // Assume date is already a Timestamp
            image: badge.image || 'https://placehold.co/64x64.png',
            imageHint: badge.imageHint || 'badge icon'
        })),
        rewards: (data.rewards ?? []).map((reward: any): Reward => ({
            id: reward.id || '',
            name: reward.name || '',
            iconName: reward.iconName || 'Gift',
            expiry: reward.expiry as Timestamp, // Assume expiry is already a Timestamp
        })),
        studentGoals: data.studentGoals ?? '',
        branch: data.branch ?? 'undetermined',
        university: data.university ?? '',
        major: data.major ?? '',
        createdAt: data.createdAt as Timestamp, // Firestore returns Timestamps
        updatedAt: data.updatedAt as Timestamp, // Firestore returns Timestamps
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
      } as UserProfile;
    } else {
      console.log(`No user profile found for UID: ${uid}.`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    throw error;
  }
};
