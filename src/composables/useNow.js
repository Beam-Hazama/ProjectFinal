import { ref, onMounted, onUnmounted } from 'vue';

export const useNow = (intervalMs = 60000) => {
    const now = ref(new Date());
    let timer = null;
    
    onMounted(() => {
        timer = setInterval(() => {
            now.value = new Date();
        }, intervalMs);
    });
    
    onUnmounted(() => {
        if (timer) {
            clearInterval(timer);
        }
    });
    
    return { now };
};
