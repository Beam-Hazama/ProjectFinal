import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';

// อัปโหลดไฟล์ขึ้น Firebase Storage แล้วคืน URL
export const uploadImage = async (file, folder) => {
    if (!file) return null;
    const path = `${folder}/${Date.now()}_${file.name}`;
    const snapshot = await uploadBytes(storageRef(storage, path), file);
    return await getDownloadURL(snapshot.ref);
};
