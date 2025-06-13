
// This file is for server-side Firestore operations and should NOT include 'use client'.
import { collection, query, orderBy, limit, getDocs, type Timestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import type { NewsItem, Announcement } from './types';

/**
 * Fetches news items from the 'news' collection, ordered by createdAt.
 * This function is intended to be called from Server Components.
 */
export const getNewsItems = async (count: number = 20): Promise<NewsItem[]> => {
  try {
    const newsCollectionRef = collection(db, 'news');
    // Order by 'createdAt' if 'publishedAt' is not consistently used or available
    const q = query(newsCollectionRef, orderBy('createdAt', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);

    const newsItems: NewsItem[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      // Use publishedAt if available, otherwise fallback to createdAt for the NewsItem's publishedAt field
      const displayPublishedAt = (data.publishedAt || data.createdAt) as Timestamp | undefined;

      if (!displayPublishedAt) {
        console.warn(`News item ${docSnap.id} is missing both publishedAt and createdAt timestamps. Skipping.`);
        return;
      }

      newsItems.push({
        id: docSnap.id,
        title: data.title || "خبر بدون عنوان",
        content: data.content || "لا يوجد محتوى",
        imageUrl: data.imageUrl,
        imageHint: data.imageHint,
        publishedAt: displayPublishedAt, 
        source: data.source,
        category: data.category,
        createdAt: data.createdAt as Timestamp, 
        updatedAt: data.updatedAt as Timestamp, 
      });
    });
    return newsItems;
  } catch (error) {
    console.error("Error fetching news items (serverExamService): ", error);
    throw error; 
  }
};


/**
 * Fetches active announcements from the 'announcements' collection.
 */
export const getActiveAnnouncements = async (count: number = 10): Promise<Announcement[]> => {
  try {
    const announcementsCollectionRef = collection(db, 'announcements');
    const q = query(
      announcementsCollectionRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);

    const announcements: Announcement[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      announcements.push({
        id: docSnap.id,
        title: data.title || "إعلان بدون عنوان",
        message: data.message || "لا يوجد محتوى للإعلان.",
        type: (data.type || 'general') as Announcement['type'],
        isActive: data.isActive, // Should always be true due to the query
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
      });
    });
    return announcements;
  } catch (error) {
    console.error("Error fetching active announcements: ", error);
    throw error;
  }
};
