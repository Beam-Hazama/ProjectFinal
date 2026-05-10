import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAccountStore } from "@/stores/auth";
import { useRestaurant } from "@/stores/shared/restaurant";
import { uploadImage } from "@/utils/upload";
import {
  cleanupBlobUrl,
  handleImageSelect,
} from "@/composables/useImagePreview";
import { DAYS_OF_WEEK } from "@/utils/constants";

export const useProfileStore = defineStore("restaurantProfile", () => {
  const accountStore = useAccountStore();
  const restaurantStore = useRestaurant();

  const loading = ref(true);
  const docId = ref(null);
  const imagePreview = ref("");
  const backgroundPreview = ref("");
  const selectedFile = ref(null);
  const selectedBgFile = ref(null);
  const isEditing = ref(false);
  const isSubmitting = ref(false);

  const RestaurantData = reactive({
    RestaurantName: "",
    Phone: "",
    Distance: "",
    Address: "",
    ImageUrl: "",
    BgUrl: "",
    OpenTime: "",
    CloseTime: "",
    OpenDays: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    Status: "auto",
    CreatedAt: null,
    UpdatedAt: null,
  });

  // Use imported DAYS_OF_WEEK

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
      const result = await restaurantStore.fetchByName(nameFromUser);
      if (result) {
        const { id, ...data } = result;
        docId.value = id;
        Object.assign(RestaurantData, data);
        if (!RestaurantData.Status) RestaurantData.Status = "auto";
        imagePreview.value = RestaurantData.ImageUrl;
        backgroundPreview.value = RestaurantData.BgUrl || "";
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

      const newUrl = await uploadImage(selectedFile.value, "restaurants");
      if (newUrl) ImageUrl = newUrl;

      const newBgUrl = await uploadImage(selectedBgFile.value, "restaurants");
      if (newBgUrl) BgUrl = newBgUrl;

      await updateDoc(doc(db, "Restaurant", docId.value), {
        RestaurantName: RestaurantData.RestaurantName,
        Phone: RestaurantData.Phone,
        Distance: RestaurantData.Distance,
        Address: RestaurantData.Address,
        ImageUrl: ImageUrl,
        BgUrl: BgUrl,
        OpenTime: RestaurantData.OpenTime,
        CloseTime: RestaurantData.CloseTime,
        OpenDays: RestaurantData.OpenDays,
        Status: RestaurantData.Status || "auto",
        UpdatedAt: serverTimestamp(),
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
    cleanupBlobUrl(imagePreview.value);
    cleanupBlobUrl(backgroundPreview.value);
    selectedFile.value = null;
    selectedBgFile.value = null;
    fetchRestaurantByName();
    isEditing.value = false;
  };

  const onImageSelected = (event) =>
    handleImageSelect(event, imagePreview, selectedFile);
  const onCoverSelected = (event) =>
    handleImageSelect(event, backgroundPreview, selectedBgFile);

  return {
    RestaurantData,
    daysOfWeek: DAYS_OF_WEEK,
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
    onCoverSelected,
  };
});
