import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAccountStore } from '@/stores/auth/accountStore';

export const useProfileStore = defineStore('restaurantProfile', () => {
    const accountStore = useAccountStore();
    
    const loading = ref(true);
    const docId = ref(null);
    const imagePreview = ref('');
    const selectedFile = ref(null);
    const isEditing = ref(false);
    const isSubmitting = ref(false);

    const RestaurantData = reactive({
        Name: '',
        Phone: '',
        Distance: '',
        Address: '',
        ImageUrl: '',
        OpenTime: '',
        CloseTime: '',
        OpenDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        Status: 'auto',
        CreatedAt: null,
        UpdatedAt: null
    });

    const daysOfWeek = [
        { label: 'อา.', value: 'Sunday' },
        { label: 'จ.', value: 'Monday' },
        { label: 'อ.', value: 'Tuesday' },
        { label: 'พ.', value: 'Wednesday' },
        { label: 'พฤ.', value: 'Thursday' },
        { label: 'ศ.', value: 'Friday' },
        { label: 'ส.', value: 'Saturday' }
    ];

    const fetchRestaurantByName = async () => {
        if (!accountStore.isLoggedIn) {
            await accountStore.checkAuthState();
        }

        const nameFromUser = accountStore.user?.Restaurant;
        if (!nameFromUser) {
            console.warn("No restaurant found in user account");
            loading.value = false;
            return;
        }

        loading.value = true;
        try {
            const q = query(
                collection(db, "Restaurant"),
                where("Name", "==", nameFromUser)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const restaurantDoc = querySnapshot.docs[0];
                docId.value = restaurantDoc.id;
                const data = restaurantDoc.data();
                Object.assign(RestaurantData, data);
                if (!RestaurantData.Status) RestaurantData.Status = 'auto';

                imagePreview.value = RestaurantData.ImageUrl;
            } else {
                console.warn("Restaurant not found in database");
            }
        } catch (error) {
            console.error("Error fetching restaurant:", error);
        } finally {
            loading.value = false;
        }
    };

    const saveProfile = async () => {
        if (!docId.value) {
            alert("ไม่พบข้อมูลร้านอาหารในระบบ ไม่สามารถบันทึกได้");
            return;
        }
        
        try {
            isSubmitting.value = true;
            let ImageUrl = RestaurantData.ImageUrl;

            if (selectedFile.value) {
                console.log("Uploading new profile image...");
                try {
                    const fileName = `restaurants/${docId.value}_${Date.now()}`;
                    const fileRef = storageRef(storage, fileName);
                    const snapshot = await uploadBytes(fileRef, selectedFile.value);
                    ImageUrl = await getDownloadURL(snapshot.ref);
                    console.log("Upload successful, new URL:", ImageUrl);
                } catch (uploadError) {
                    console.error("Error uploading image:", uploadError);
                    alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: " + uploadError.message);
                    isSubmitting.value = false;
                    return;
                }
            }

            console.log("Updating Firestore document:", docId.value);
            await updateDoc(doc(db, 'Restaurant', docId.value), {
                Name: RestaurantData.Name,
                Phone: RestaurantData.Phone,
                Distance: RestaurantData.Distance,
                Address: RestaurantData.Address,
                ImageUrl: ImageUrl,
                OpenTime: RestaurantData.OpenTime,
                CloseTime: RestaurantData.CloseTime,
                OpenDays: RestaurantData.OpenDays,
                Status: RestaurantData.Status || 'auto',
                UpdatedAt: serverTimestamp()
            });
            
            isEditing.value = false;
            selectedFile.value = null;
            await fetchRestaurantByName();
        } catch (error) {
            console.error("Error saving profile:", error);
            // Error handled by console.error above
        } finally {
            isSubmitting.value = false;
        }
    };

    const cancelEdit = () => {
        if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview.value);
        }
        selectedFile.value = null;
        fetchRestaurantByName();
        isEditing.value = false;
    };

    const onImageSelected = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview.value);
            }
            selectedFile.value = file;
            const previewUrl = URL.createObjectURL(file);
            imagePreview.value = previewUrl;
            console.log("File selected for upload:", file.name);
        }
    };

    return {
        RestaurantData,
        daysOfWeek,
        loading,
        docId,
        imagePreview,
        selectedFile,
        isEditing,
        isSubmitting,
        fetchRestaurantByName,
        saveProfile,
        cancelEdit,
        onImageSelected
    };
});
