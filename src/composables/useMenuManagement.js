import { reactive, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useMenuStore } from '@/stores/menuStore';
import { useRestaurant } from '@/stores/Restaurant';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAccountStore } from '@/stores/accountStore';

export function useMenuManagement() {
    const route = useRoute();
    const router = useRouter();
    const MenuStore = useMenuStore();
    const Restaurant = useRestaurant();
    const categoryStore = useCategoryStore();
    const accountStore = useAccountStore();
    
    const menuId = route.params.id;
    const mode = ref('');
    const selectedFile = ref(null);
    const imagePreview = ref('');
    const imageInputMethod = ref('file');

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

    onMounted(async () => {
        await accountStore.checkAuthState();
        if (route.params.id) {
            mode.value = 'Update Menu';
            const menuSnap = await getDoc(doc(db, 'Menu', route.params.id));

            if (menuSnap.exists()) {
                const res = menuSnap.data();
                Object.assign(MenuData, {
                    ...res,
                    OptionGroups: res.OptionGroups || []
                });

                imagePreview.value = res.ImageUrl || '';
                if (res.ImageUrl && res.ImageUrl.startsWith('http')) {
                    imageInputMethod.value = 'url';
                }
            }
        } else {
            mode.value = 'Add Menu';
            MenuData.Restaurant = accountStore.user?.Restaurant;
        }

        Restaurant.loadListRestaurant();
        categoryStore.loadCategories();
    });

    watch(() => MenuData.ImageUrl, (newVal) => {
        if (imageInputMethod.value === 'url') {
            imagePreview.value = newVal;
        }
    });

    const checkAddMenu = async (data) => {
        try {
            let MenuId;
            const ImageUrl = data.ImageUrl || '';

            const cleanOptionGroups = (data.OptionGroups || []).map(group => {
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
                Name: data.Name,
                ImageUrl: ImageUrl,
                Price: Number(data.Price),
                Restaurant: data.Restaurant,
                Description: data.Description,
                Category: data.Category,
                Status: data.Status,
                PromoPrice: data.PromoPrice ? Number(data.PromoPrice) : null,
                OptionGroups: cleanOptionGroups,
                UpdatedAt: serverTimestamp()
            };

            if (mode.value === 'Add Menu') {
                const docRef = await addDoc(collection(db, 'Menu'), {
                    ...saveData,
                    CreatedAt: serverTimestamp()
                });
                MenuId = docRef.id;
            } else if (mode.value === 'Update Menu') {
                MenuId = route.params.id;
                await updateDoc(doc(db, 'Menu', MenuId), saveData);
            }

            if (['Restaurant Add Menu', 'Restaurant Edit Menu'].includes(route.name)) {
                router.push({ name: 'Restaurants Menulist' });
            } else {
                router.push({ name: 'Admin Menu List' });
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
        }
    };

    const handleFileUpload = (event) => {
        selectedFile.value = event.target.files[0];
        if (selectedFile.value) {
            const previewUrl = URL.createObjectURL(selectedFile.value);
            imagePreview.value = previewUrl;
            MenuData.ImageUrl = previewUrl;
            MenuStore.imageList[menuId] = previewUrl;
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

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleString('th-TH');
        }
        if (timestamp && timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toLocaleString('th-TH');
        }
        return new Date(timestamp).toLocaleString('th-TH');
    };

    const goBack = () => {
        router.go(-1);
    };

    return {
        MenuData,
        mode,
        imagePreview,
        imageInputMethod,
        Restaurant,
        categoryStore,
        checkAddMenu,
        handleFileUpload,
        addOptionGroup,
        removeOptionGroup,
        addChoice,
        removeChoice,
        formatTimestamp,
        goBack
    };
}
