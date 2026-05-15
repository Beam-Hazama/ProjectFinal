import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAccountStore } from "@/stores/auth";
import { uploadImage } from "@/utils/upload";
import {
  cleanupBlobUrl,
  handleImageSelect,
} from "@/composables/useImagePreview";

export const useMenuFormStore = defineStore("menuForm", () => {
  const accountStore = useAccountStore();

  const selectedFile = ref(null);
  const imagePreview = ref("");
  const isLoading = ref(false);

  const MenuData = reactive({
    MenuName: "",
    ImageUrl: "",
    Price: "",
    PromoPrice: null,
    RestaurantName: "",
    Description: "",
    Category: "",
    Status: "",
    Cost: "",
    OptionGroups: [],
  });

  const isFormValid = computed(() => {
    return (
      MenuData.MenuName.trim() !== "" &&
      MenuData.Price !== "" &&
      Number(MenuData.Price) > 0 &&
      MenuData.Category !== "" &&
      MenuData.Status !== "" &&
      (selectedFile.value !== null || MenuData.ImageUrl !== "")
    );
  });

  const initForm = async (id = null) => {
    cleanupBlobUrl(imagePreview.value);
    await accountStore.checkAuthState();

    if (id) {
      const menuSnap = await getDoc(doc(db, "Menu", id));
      if (menuSnap.exists()) {
        const res = menuSnap.data();
        Object.assign(MenuData, {
          ...res,
          Cost: res.Cost || "",
          OptionGroups: res.OptionGroups || [],
        });
        imagePreview.value = res.ImageUrl || "";
        selectedFile.value = null;
      }
    } else {
      Object.assign(MenuData, {
        MenuName: "",
        ImageUrl: "",
        Price: "",
        PromoPrice: null,
        RestaurantName:
          accountStore.user?.RestaurantName ||
          accountStore.user?.Restaurant ||
          "",
        Description: "",
        Category: "",
        Status: "",
        Cost: "",
        OptionGroups: [],
      });
      selectedFile.value = null;
      imagePreview.value = "";
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

      const newUrl = await uploadImage(selectedFile.value, "menus");
      if (newUrl) ImageUrl = newUrl;

      const cleanOptionGroups = (MenuData.OptionGroups || [])
        .map((group) => {
          return {
            GroupName: group.GroupName.trim(),
            isRequired: group.isRequired !== false,
            MaxChoices: group.MaxChoices ? Number(group.MaxChoices) : 1,
            choices: group.choices
              .filter((c) => (c.ChoiceName || c.name || "").trim() !== "")
              .map((c) => ({
                ChoiceName: (c.ChoiceName || c.name).trim(),
                ExtraPrice: Number(c.ExtraPrice) || 0,
              })),
          };
        })
        .filter((group) => group.GroupName !== "" && group.choices.length > 0);

      const saveData = {
        MenuName: MenuData.MenuName,
        ImageUrl: ImageUrl,
        Price: Number(MenuData.Price),
        RestaurantName: MenuData.RestaurantName,
        Description: MenuData.Description,
        Category: MenuData.Category,
        Status: MenuData.Status,
        Cost: Number(MenuData.Cost) || 0,
        PromoPrice: MenuData.PromoPrice ? Number(MenuData.PromoPrice) : null,
        OptionGroups: cleanOptionGroups,
        UpdatedAt: serverTimestamp(),
      };

      if (id) {
        await updateDoc(doc(db, "Menu", id), saveData);
      } else {
        saveData.CreatedAt = serverTimestamp();
        await addDoc(collection(db, "Menu"), saveData);
      }

      if (
        ["Restaurant Add Menu", "Restaurant Edit Menu"].includes(route.name)
      ) {
        router.push({ name: "Restaurants Menulist" });
      } else {
        router.push({ name: "Admin Menu List" });
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
      GroupName: "",
      isRequired: true,
      MaxChoices: 1,
      choices: [{ ChoiceName: "", ExtraPrice: 0 }],
    });
  };

  const removeOptionGroup = (index) => {
    MenuData.OptionGroups.splice(index, 1);
  };

  const addChoice = (groupIndex) => {
    MenuData.OptionGroups[groupIndex].choices.push({
      ChoiceName: "",
      ExtraPrice: 0,
    });
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
    removeChoice,
  };
});
