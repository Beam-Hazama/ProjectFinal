<script setup>
import { ref, onMounted, watch } from 'vue';
import draggable from 'vuedraggable';
import { useRoute } from 'vue-router';
import { usePosterStore } from '@/stores/posterStore';
import LayoutRestaurant from '@/page/Restaurant/restaurant.vue';

const route = useRoute();
const posterStore = usePosterStore();

const newPosterUrl = ref('');
const isSubmittingPoster = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const editingPosterId = ref(null);

const hasSchedule = ref(false);
const startTime = ref('');
const endTime = ref('');
const displayDuration = ref(5);

const restaurantName = decodeURIComponent(route.params.restaurantName || '');

onMounted(() => {
    if (restaurantName) {
        posterStore.loadPosters(restaurantName);
    }
});

const localPosters = ref([]);

watch(() => posterStore.list, (newList) => {
    localPosters.value = [...newList];
}, { deep: true, immediate: true });

const onDragEnd = async () => {
    const orderedIds = localPosters.value.map(p => p.id);
    await posterStore.updatePosterOrder(orderedIds);
};

const openEditModal = (poster) => {
    isEditing.value = true;
    editingPosterId.value = poster.id;
    newPosterUrl.value = poster.ImageUrl;
    displayDuration.value = poster.displayDuration || 5;
    hasSchedule.value = !!poster.hasSchedule;
    startTime.value = poster.startTime || '';
    endTime.value = poster.endTime || '';
    showModal.value = true;
};

const handleSubmitPoster = async () => {
    if (!newPosterUrl.value.trim()) {
        alert('Please enter an image URL');
        return;
    }

    if (hasSchedule.value && (!startTime.value || !endTime.value)) {
        alert('Please select both start and end times for the schedule.');
        return;
    }

    try {
        isSubmittingPoster.value = true;
        const posterData = {
            ImageUrl: newPosterUrl.value.trim(),
            RestaurantName: restaurantName,
            hasSchedule: hasSchedule.value,
            displayDuration: displayDuration.value || 5
        };

        if (hasSchedule.value) {
            posterData.startTime = startTime.value;
            posterData.endTime = endTime.value;
        } else {
            // Clear schedule data if unchecked
            posterData.startTime = null;
            posterData.endTime = null;
        }

        if (isEditing.value && editingPosterId.value) {
            await posterStore.updatePoster(editingPosterId.value, {
                ...posterData,
                updatedAt: new Date()
            });
        } else {
            await posterStore.addPoster(posterData);
        }

        closeModal();
    } catch (error) {
        alert('Error saving poster: ' + error.message);
    } finally {
        isSubmittingPoster.value = false;
    }
};

const closeModal = () => {
    showModal.value = false;
    isEditing.value = false;
    editingPosterId.value = null;
    newPosterUrl.value = '';
    hasSchedule.value = false;
    startTime.value = '';
    endTime.value = '';
    displayDuration.value = 5;
};

const togglePosterStatus = async (poster) => {
    try {
        await posterStore.toggleActive(poster.id, poster.isActive);
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
};

const deletePoster = async (posterId) => {
    if (confirm('Are you sure you want to delete this poster? This cannot be undone.')) {
        try {
            await posterStore.deletePoster(posterId);
        } catch (error) {
            alert('Error deleting poster: ' + error.message);
        }
    }
};

const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleString('th-TH');
    }
    return new Date(timestamp).toLocaleString('th-TH');
};

const formatScheduleDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
</script>

<template>
    <LayoutRestaurant>
        <div class="p-6 font-sans">
            <div class="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-700">Poster</h1>
                </div>
                <button @click="showModal = true"
                    class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Poster
                </button>
            </div>


            <div v-if="showModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col"
                    @click.stop>
                    <div
                        class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                        <h2 class="text-lg font-bold text-slate-800">{{ isEditing ? 'Edit Poster' : 'Add New Poster' }}
                        </h2>
                        <button @click="closeModal" class="text-slate-400 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="p-6 overflow-y-auto w-full">
                        <div class="flex flex-col gap-4">
                            <div class="flex flex-col gap-4">
                                <div class="w-full">
                                    <label class="label pt-0">
                                        <span class="label-text font-medium text-slate-600">URL ของภาพ</span>
                                    </label>
                                    <input type="text" placeholder="https://example.com/poster.jpg"
                                        v-model="newPosterUrl"
                                        class="input input-bordered w-full bg-slate-50 focus:bg-white transition-colors" />
                                </div>
                                <div class="w-full md:w-32">
                                    <label class="label pt-0">
                                        <span class="label-text font-medium text-slate-600">เวลา (วินาที)</span>
                                    </label>
                                    <input type="number" min="1" v-model="displayDuration"
                                        class="input input-bordered w-full bg-slate-50 focus:bg-white transition-colors" />
                                </div>
                            </div>

                            <div class="mt-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                <label class="cursor-pointer flex items-center gap-2 w-fit mb-3">
                                    <input type="checkbox" v-model="hasSchedule"
                                        class="checkbox checkbox-sm checkbox-primary" />
                                    <span class="label-text font-bold text-slate-700">ตั้งเวลาแสดง Poster
                                        (Schedule)</span>
                                </label>

                                <div v-if="hasSchedule" class="flex flex-col md:flex-row gap-4 animate-fade-in">
                                    <div class="flex-1">
                                        <label class="label pt-0">
                                            <span class="label-text font-medium text-slate-600">เริ่มแสดงตั้งแต่</span>
                                        </label>
                                        <input type="datetime-local" v-model="startTime"
                                            class="input input-bordered w-full bg-white transition-colors" />
                                    </div>
                                    <div class="flex-1">
                                        <label class="label pt-0">
                                            <span class="label-text font-medium text-slate-600">สิ้นสุดการแสดง</span>
                                        </label>
                                        <input type="datetime-local" v-model="endTime"
                                            class="input input-bordered w-full bg-white transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div v-if="newPosterUrl"
                                class="mt-2 border border-dashed border-slate-300 p-2 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden relative group w-full h-48">
                                <img :src="newPosterUrl" class="w-full h-full object-cover rounded-lg shadow-sm"
                                    @error="() => newPosterUrl = ''" alt="Preview Error" />
                                <div
                                    class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <span class="text-white font-medium text-sm">ตัวอย่าง</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white shrink-0">
                        <button @click="closeModal"
                            class="btn btn-ghost text-slate-500 hover:bg-slate-100">ยกเลิก</button>
                        <button @click="handleSubmitPoster" :disabled="isSubmittingPoster || !newPosterUrl"
                            class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none min-w-[120px] rounded-lg shadow-sm">
                            <span v-if="isSubmittingPoster" class="loading loading-spinner loading-sm"></span>
                            <span v-else>{{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่ม Poster' }}</span>
                        </button>
                    </div>
                </div>
            </div>


            <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
                            <tr>
                                <th class="w-12 text-center py-4 pl-6"></th>
                                <th>IMAGE</th>
                                <th>STATUS</th>
                                <th>DURATION</th>
                                <th>SCHEDULE</th>
                                <th>CREATED AT</th>
                                <th>UPDATED AT</th>
                                <th class="text-center">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody class="text-slate-600" v-if="localPosters.length === 0">
                            <tr>
                                <td colspan="7" class="text-center py-10 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-2 opacity-30"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    ไม่มีภาพ Poster หรือแบนเนอร์
                                </td>
                            </tr>
                        </tbody>
                        <draggable v-else v-model="localPosters" item-key="id" tag="tbody" class="text-slate-600"
                            handle=".drag-handle" @end="onDragEnd">
                            <template #item="{ element: poster }">
                                <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors bg-white">
                                    <td class="pl-6 w-12 text-center align-middle">
                                        <div
                                            class="drag-handle cursor-grab hover:text-blue-600 text-slate-400 p-2 opacity-50 hover:opacity-100 transition-opacity flex justify-center items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                                viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M4 8h16M4 16h16" />
                                            </svg>
                                        </div>
                                    </td>
                                    <td class="w-1/3">
                                        <div
                                            class="h-24 w-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                            <img :src="poster.ImageUrl" class="w-full h-full object-cover" />
                                        </div>
                                    </td>

                                    <td>
                                        <div class="flex flex-col">
                                            <label class="cursor-pointer relative inline-flex items-center group w-max">
                                                <input type="checkbox" :checked="poster.isActive"
                                                    @change="togglePosterStatus(poster)" class="sr-only peer">
                                                <div
                                                    class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                                                </div>
                                                <span class="ml-3 text-sm font-medium"
                                                    :class="poster.isActive ? 'text-blue-600' : 'text-slate-400'">
                                                    {{ poster.isActive ? 'เปิดใช้งาน' : 'ซ่อน' }}
                                                </span>
                                            </label>
                                        </div>
                                    </td>

                                    <td class="text-xs font-medium text-slate-600">
                                        {{ poster.displayDuration || 5 }} วินาที
                                    </td>

                                    <td>
                                        <div v-if="poster.hasSchedule"
                                            class="p-2 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px] text-slate-600 w-max">
                                            <div class="font-bold text-blue-600 mb-1 flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                ตั้งเวลาแสดง
                                            </div>
                                            <div class="space-y-0.5">
                                                <div><span class="font-medium text-slate-500">เริ่ม:</span> {{
                                                    formatScheduleDate(poster.startTime) }}</div>
                                                <div><span class="font-medium text-slate-500">ถึง:</span> {{
                                                    formatScheduleDate(poster.endTime) }}</div>
                                            </div>
                                        </div>
                                        <div v-else class="text-[11px] text-slate-400 font-medium">
                                            ไม่ได้ตั้งเวลา
                                        </div>
                                    </td>

                                    <td class="text-xs">
                                        {{ formatDate(poster.createdAt) }}
                                    </td>

                                    <td class="text-xs">
                                        {{ formatDate(poster.updatedAt) }}
                                    </td>

                                    <td class="text-center">
                                        <div class="flex justify-center gap-1">
                                            <button @click="openEditModal(poster)"
                                                class="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />

                                                </svg>
                                                Edit
                                            </button>
                                            <button @click="deletePoster(poster.id)"
                                                class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none"
                                                    viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                              Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </draggable>
                    </table>
                </div>
            </div>
        </div>
    </LayoutRestaurant>
</template>
