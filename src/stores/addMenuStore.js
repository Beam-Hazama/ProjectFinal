import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { useAccountStore } from '@/stores/accountStore';

export const useAddMenuStore = defineStore('addMenu', () => {
    const accountStore = useAccountStore();
    
    const selectedFile = ref(null);
    const imagePreview = ref('');

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
               MenuData.Status !== '';
    });

    const init = async () => {
        await accountStore.checkAuthState();
        MenuData.Restaurant = accountStore.user?.Restaurant || '';
        MenuData.Name = '';
        MenuData.ImageUrl = '';
        MenuData.Price = '';
        MenuData.PromoPrice = null;
        MenuData.Description = '';
        MenuData.Category = '';
        MenuData.Status = '';
        MenuData.OptionGroups = [];
        selectedFile.value = null;
        imagePreview.value = '';
    };

    const validateMenu = () => {
        if (!MenuData.Name.trim()) {
            alert('กรุณากรอกชื่อเมนูอาหาร');
            return false;
        }
        if (!MenuData.Price || Number(MenuData.Price) <= 0) {
            alert('กรุณากรอกราคาที่ถูกต้อง');
            return false;
        }
        if (!MenuData.Category) {
            alert('กรุณาเลือกหมวดหมู่อาหาร');
            return false;
        }
        if (!MenuData.Status) {
            alert('กรุณาเลือกสถานะการขาย');
            return false;
        }
        return true;
    };

    const addMenu = async (router, route) => {
        if (!validateMenu()) return;
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
                    alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
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
                UpdatedAt: serverTimestamp(),
                CreatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'Menu'), saveData);

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
        init,
        addMenu,
        handleFileUpload,
        addOptionGroup,
        removeOptionGroup,
        addChoice,
        removeChoice
    };
});
