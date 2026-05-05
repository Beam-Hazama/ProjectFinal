import { ref, onUnmounted } from 'vue';

/**
 * Composable for handling image file selection and previewing with blob URLs.
 * Automatically cleans up the blob URL when the component is unmounted or when a new image is selected.
 */
export const useImagePreview = () => {
    const previewUrl = ref('');
    const selectedFile = ref(null);

    const handleFileSelect = (eventOrFile) => {
        // Handle both direct file objects or input change events
        const file = eventOrFile?.target?.files?.[0] || eventOrFile;
        
        if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl.value);
        }
        
        selectedFile.value = file;
        if (file instanceof File || file instanceof Blob) {
            previewUrl.value = URL.createObjectURL(file);
        } else {
            previewUrl.value = '';
        }
        
        return file;
    };

    const clearPreview = () => {
        if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl.value);
        }
        previewUrl.value = '';
        selectedFile.value = null;
    };

    onUnmounted(() => {
        clearPreview();
    });

    return {
        previewUrl,
        selectedFile,
        handleFileSelect,
        clearPreview
    };
};
