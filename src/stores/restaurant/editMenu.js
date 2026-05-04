import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { useAccountStore } from '@/stores/auth/accountStore';

export const useEditMenuStore = defineStore('editMenu', () => {
    const accountStore = useAccountStore();
    
    const selectedFile = ref(null);
    const imagePreview = ref('');
    const isLoading = ref(false);

    const MenuData = reactive({
        Name: '',
        ImageUrl: '',
        Price: '',
        PromoPrice: null,
        Restaurant: '',
        Description: '',
        Category: '',
        Status: '',
        OptionGroups: [],
    });

    const isFormValid = computed(() => {
        return MenuData.Name.trim() !== '' && 
               MenuData.Price !== '' && 
               Number(MenuData.Price) > 0 &&
               MenuData.Category !== '' && 
               MenuData.Status !== '' &&
               (selectedFile.value !== null || MenuData.ImageUrl !== '');
    });

    const initForm = async (id) => {
        if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview.value);
        }
        await accountStore.checkAuthState();
        const menuSnap = await getDoc(doc(db, 'Menu', id));

        if (menuSnap.exists()) {
            const res = menuSnap.data();
            Object.assign(MenuData, {
                ...res,
                OptionGroups: res.OptionGroups || []
            });
            imagePreview.value = res.ImageUrl || '';
        }
    };

    const validateMenu = () => {
        if (!MenuData.Name.trim()) {
            return false;
        }
        if (!MenuData.Price || Number(MenuData.Price) <= 0) {
            return false;
        }
        if (!MenuData.Category) {
            return false;
        }
        if (!MenuData.Status) {
            return false;
        }
        if (!selectedFile.value && !MenuData.ImageUrl) {
            return false;
        }
        return true;
    };

    const editMenu = async (id, router, route) => {
        if (!validateMenu()) return;
        isLoading.value = true;
        try {
            let ImageUrl = MenuData.ImageUrl;

            if (selectedFile.value) {
                try {
                    const fileName = `${Date.now()}_${selectedFile.value.name}`;
                    const fileRef = storageRef(storage, `menus/${fileName}`);
                    const snapshot = await uploadBytes(fileRef, selectedFile.value);
                    ImageUrl = await getDownloadURL(snapshot.ref);
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    return;
                }
            }

            const cleanOptionGroups = (MenuData.OptionGroups || []).map(group => {
                return {
                    name: group.name.trim(),
                    isRequired: group.isRequired !== false,
                    maxChoices: group.maxChoices ? Number(group.maxChoices) : 1,
                    choices: group.choices
                        .filter(c => c.name.trim() !== '')
                        .map(c => ({ name: c.name.trim(), price: Number(c.price) || 0 }))
                };
            }).filter(group => group.name !== '' && group.choices.length > 0);

            const saveData = {
                Name: MenuData.Name,
                ImageUrl: ImageUrl,
                Price: Number(MenuData.Price),
                Restaurant: MenuData.Restaurant,
                Description: MenuData.Description,
                Category: MenuData.Category,
                Status: MenuData.Status,
                PromoPrice: MenuData.PromoPrice ? Number(MenuData.PromoPrice) : null,
                OptionGroups: cleanOptionGroups,
                UpdatedAt: serverTimestamp()
            };

            await updateDoc(doc(db, 'Menu', id), saveData);

            if (['Restaurant Add Menu', 'Restaurant Edit Menu'].includes(route.name)) {
                router.push({ name: 'Restaurants Menulist' });
            } else {
                router.push({ name: 'Admin Menu List' });
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
        } finally {
            isLoading.value = false;
        }
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
            MenuData.ImageUrl = previewUrl;
        }
    };

    const addOptionGroup = () => {
        if (!MenuData.OptionGroups) MenuData.OptionGroups = [];
        MenuData.OptionGroups.push({
            name: '',
            isRequired: true,
            maxChoices: 1,
            choices: [{ name: '', price: 0 }]
        });
    };

    const removeOptionGroup = (index) => {
        MenuData.OptionGroups.splice(index, 1);
    };

    const addChoice = (groupIndex) => {
        MenuData.OptionGroups[groupIndex].choices.push({ name: '', price: 0 });
    };

    const removeChoice = (groupIndex, choiceIndex) => {
        MenuData.OptionGroups[groupIndex].choices.splice(choiceIndex, 1);
    };

    return {
        MenuData,
        isFormValid,
        selectedFile,
        imagePreview,
        isLoading,
        initForm,
        editMenu,
        onImageSelected,
        addOptionGroup,
        removeOptionGroup,
        addChoice,
        removeChoice
    };
});
