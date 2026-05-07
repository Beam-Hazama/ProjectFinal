import { ref, onUnmounted } from 'vue';

export const cleanupBlobUrl = (url) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};

export const useImagePreview = () => {
    const previewUrl = ref('');
    const selectedFile = ref(null);

    const handleFileSelect = (eventOrFile) => {
        const file = eventOrFile?.target?.files?.[0] || eventOrFile;

        cleanupBlobUrl(previewUrl.value);

        selectedFile.value = file;
        if (file instanceof File || file instanceof Blob) {
            previewUrl.value = URL.createObjectURL(file);
        } else {
            previewUrl.value = '';
        }

        return file;
    };

    const clearPreview = () => {
        cleanupBlobUrl(previewUrl.value);
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
