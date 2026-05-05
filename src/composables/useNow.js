import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Composable that provides a reactive current time (now) updated at a set interval.
 * @param {number} intervalMs - Interval in milliseconds (default 60000 / 1 minute)
 * @returns {Object} - { now: Ref<Date> }
 */
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
