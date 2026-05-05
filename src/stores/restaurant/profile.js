import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAccountStore } from '@/stores/auth';
import { uploadImage } from '@/utils/upload';

export const useProfileStore = defineStore('restaurantProfile', () => {
    const accountStore = useAccountStore();
    
    const loading = ref(true);
    const docId = ref(null);
    const imagePreview = ref('');
    const backgroundPreview = ref('');
    const selectedFile = ref(null);
    const selectedBgFile = ref(null);
    const isEditing = ref(false);
    const isSubmitting = ref(false);

    const RestaurantData = reactive({
        Name: '',
        Phone: '',
        Distance: '',
        Address: '',
        ImageUrl: '',
        BgUrl: '',
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
                backgroundPreview.value = RestaurantData.BgUrl || '';
            }
        } catch (error) {
            console.error(error);
        } finally {
            loading.value = false;
        }
    };

    const saveProfile = async () => {
        if (!docId.value) return;
        
        try {
            isSubmitting.value = true;
            let ImageUrl = RestaurantData.ImageUrl;
            let BgUrl = RestaurantData.BgUrl;

            const newUrl = await uploadImage(selectedFile.value, 'restaurants');
            if (newUrl) ImageUrl = newUrl;

            const newBgUrl = await uploadImage(selectedBgFile.value, 'restaurants');
            if (newBgUrl) BgUrl = newBgUrl;

            await updateDoc(doc(db, 'Restaurant', docId.value), {
                Name: RestaurantData.Name,
                Phone: RestaurantData.Phone,
                Distance: RestaurantData.Distance,
                Address: RestaurantData.Address,
                ImageUrl: ImageUrl,
                BgUrl: BgUrl,
                OpenTime: RestaurantData.OpenTime,
                CloseTime: RestaurantData.CloseTime,
                OpenDays: RestaurantData.OpenDays,
                Status: RestaurantData.Status || 'auto',
                UpdatedAt: serverTimestamp()
            });
            
            isEditing.value = false;
            selectedFile.value = null;
            selectedBgFile.value = null;
            await fetchRestaurantByName();
        } catch (error) {
            console.error(error);
        } finally {
            isSubmitting.value = false;
        }
    };

    const cancelEdit = () => {
        if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview.value);
        }
        if (backgroundPreview.value && backgroundPreview.value.startsWith('blob:')) {
            URL.revokeObjectURL(backgroundPreview.value);
        }
        selectedFile.value = null;
        selectedBgFile.value = null;
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
            imagePreview.value = URL.createObjectURL(file);
        }
    };

    const onCoverSelected = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (backgroundPreview.value && backgroundPreview.value.startsWith('blob:')) {
                URL.revokeObjectURL(backgroundPreview.value);
            }
            selectedBgFile.value = file;
            backgroundPreview.value = URL.createObjectURL(file);
        }
    };

    return {
        RestaurantData,
        daysOfWeek,
        loading,
        docId,
        imagePreview,
        backgroundPreview,
        selectedFile,
        selectedBgFile,
        isEditing,
        isSubmitting,
        fetchRestaurantByName,
        saveProfile,
        cancelEdit,
        onImageSelected,
        onCoverSelected
    };
});
