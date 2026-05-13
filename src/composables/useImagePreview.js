import { ref, onUnmounted } from "vue";

export const cleanupBlobUrl = (url) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

export const handleImageSelect = (event, previewRef, fileRef) => {
  const file = event?.target?.files?.[0];                               // ?. ถ้าบราวเซอร์ทำงานช้า ไม่มี files? ให้ใช้ undefined แทนที่จะ error
  if (file) {                                                           // กับบัคตอนกดCancel
    cleanupBlobUrl(previewRef.value);
    fileRef.value = file;
    previewRef.value = URL.createObjectURL(file);
  }
};

export const useImagePreview = () => {
  const previewUrl = ref("");
  const selectedFile = ref(null);

  const handleFileSelect = (event) => {
    handleImageSelect(event, previewUrl, selectedFile);
  };

  const clearPreview = () => {
    cleanupBlobUrl(previewUrl.value);
    previewUrl.value = "";
    selectedFile.value = null;
  };

  onUnmounted(() => {
    clearPreview();
  });

  return {
    previewUrl,
    selectedFile,
    handleFileSelect,
    clearPreview,
  };
};
