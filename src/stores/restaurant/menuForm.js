import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { addDoc, collection, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAccountStore } from '@/stores/auth';
import { uploadImage } from '@/utils/upload';
import { cleanupBlobUrl, handleImageSelect } from '@/composables/useImagePreview';

export const useMenuFormStore = defineStore('menuForm', () => {
    const accountStore = useAccountStore();
    
    const selectedFile = ref(null);
    const imagePreview = ref('');
    const isLoading = ref(false);

    const MenuData = reactive({
        MenuName: '',
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
        return MenuData.MenuName.trim() !== '' && 
               MenuData.Price !== '' && 
               Number(MenuData.Price) > 0 &&
               MenuData.Category !== '' && 
               MenuData.Status !== '' &&
               (selectedFile.value !== null || MenuData.ImageUrl !== '');
    });

    const initForm = async (id = null) => {
        cleanupBlobUrl(imagePreview.value);
        await accountStore.checkAuthState();
        
        if (id) {
            const menuSnap = await getDoc(doc(db, 'Menu', id));
            if (menuSnap.exists()) {
                const res = menuSnap.data();
                Object.assign(MenuData, {
                    ...res,
                    OptionGroups: res.OptionGroups || []
                });
                imagePreview.value = res.ImageUrl || '';
                selectedFile.value = null;
            }
        } else {
            Object.assign(MenuData, {
                MenuName: '',
                ImageUrl: '',
                Price: '',
                PromoPrice: null,
                Restaurant: accountStore.user?.RestaurantName || accountStore.user?.Restaurant || '',
                Description: '',
                Category: '',
                Status: '',
                OptionGroups: [],
            });
            selectedFile.value = null;
            imagePreview.value = '';
        }
    };

    const onImageSelected = (event) => {
        handleImageSelect(event, imagePreview, selectedFile);
        MenuData.ImageUrl = imagePreview.value;
    };

    const save = async (id = null, router, route) => {
        isLoading.value = true;
        try {
            let ImageUrl = MenuData.ImageUrl;

            const newUrl = await uploadImage(selectedFile.value, 'menus');
            if (newUrl) ImageUrl = newUrl;

            const cleanOptionGroups = (MenuData.OptionGroups || []).map(group => {
                return {
                    name: group.name.trim(),
                    isRequired: group.isRequired !== false,
                    maxChoices: group.maxChoices ? Number(group.maxChoices) : 1,
                    choices: group.choices
                        .filter(c => (c.ChoiceName || c.name || '').trim() !== '')
                        .map(c => ({ ChoiceName: (c.ChoiceName || c.name).trim(), price: Number(c.price) || 0 }))
                };
            }).filter(group => group.name !== '' && group.choices.length > 0);

            const saveData = {
                MenuName: MenuData.MenuName,
                ImageUrl: ImageUrl,
                Price: Number(MenuData.Price),
                Restaurant: MenuData.Restaurant,
                Description: MenuData.Description,
                Category: MenuData.Category,
                Status: MenuData.Status,
                PromoPrice: MenuData.PromoPrice ? Number(MenuData.PromoPrice) : null,
                OptionGroups: cleanOptionGroups,
                UpdatedAt: serverTimestamp(),
            };

            if (id) {
                await updateDoc(doc(db, 'Menu', id), saveData);
            } else {
                saveData.CreatedAt = serverTimestamp();
                await addDoc(collection(db, 'Menu'), saveData);
            }

            if (['Restaurant Add Menu', 'Restaurant Edit Menu'].includes(route.name)) {
                router.push({ name: 'Restaurants Menulist' });
            } else {
                router.push({ name: 'Admin Menu List' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            isLoading.value = false;
        }
    };

    const addOptionGroup = () => {
        if (!MenuData.OptionGroups) MenuData.OptionGroups = [];
        MenuData.OptionGroups.push({
            name: '',
            isRequired: true,
            maxChoices: 1,
            choices: [{ ChoiceName: '', price: 0 }]
        });
    };

    const removeOptionGroup = (index) => {
        MenuData.OptionGroups.splice(index, 1);
    };

    const addChoice = (groupIndex) => {
        MenuData.OptionGroups[groupIndex].choices.push({ ChoiceName: '', price: 0 });
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
        save,
        onImageSelected,
        addOptionGroup,
        removeOptionGroup,
        addChoice,
        removeChoice
    };
});
