import {
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';

export async function updateAllRestaurantStatuses() {
  try {
    const snapshot = await getDocs(collection(db, 'Restaurant'));
    const now = new Date();

    const currentDay = now.toLocaleDateString('en-US', {
      weekday: 'long',
    });

    const currentTime = now.toTimeString().slice(0, 5);

    for (const document of snapshot.docs) {
      const restaurant = document.data();
      const mode = restaurant.StatusMode || 'auto';

      let newStatus = 'close';

      // บังคับเปิด
      if (mode === 'open') {
        newStatus = 'open';
      }
      // บังคับปิด
      else if (mode === 'close') {
        newStatus = 'close';
      }
      // อัตโนมัติ
      else {
        if (
          restaurant.OpenTime &&
          restaurant.CloseTime &&
          Array.isArray(restaurant.OpenDays) &&
          restaurant.OpenDays.includes(currentDay)
        ) {
          if (restaurant.OpenTime > restaurant.CloseTime) {
            newStatus =
              currentTime >= restaurant.OpenTime ||
              currentTime <= restaurant.CloseTime
                ? 'open'
                : 'close';
          } else {
            newStatus =
              currentTime >= restaurant.OpenTime &&
              currentTime <= restaurant.CloseTime
                ? 'open'
                : 'close';
          }
        }
      }

      // เขียนเฉพาะเมื่อสถานะเปลี่ยน
      if (restaurant.Status !== newStatus) {
        await updateDoc(doc(db, 'Restaurant', document.id), {
          Status: newStatus,
          UpdatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    console.error('Update all restaurant statuses error:', error);
  }
}
