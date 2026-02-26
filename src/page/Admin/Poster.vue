<script setup>
import { ref, onMounted } from 'vue';
import LayoutAdmin from '@/page/Admin/Admin.vue';
import { usePosterStore } from '@/stores/posterStore';

const posterStore = usePosterStore();

// Form state
const newPosterUrl = ref('');
const isSubmitting = ref(false);

onMounted(() => {
    posterStore.loadPosters();
});

const handleAddPoster = async () => {
    if (!newPosterUrl.value.trim()) {
        alert('Please enter an image URL');
        return;
    }

    try {
        isSubmitting.value = true;
        await posterStore.addPoster({
            ImageUrl: newPosterUrl.value.trim()
        });
        newPosterUrl.value = ''; // Reset
    } catch (error) {
        alert('Error adding poster: ' + error.message);
    } finally {
        isSubmitting.value = false;
    }
};

const toggleStatus = async (poster) => {
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
</script>

<template>
    <LayoutAdmin>
        <div class="p-6">
            <div class="flex justify-between items-end mb-6">
                <div>
                    <h1 class="text-3xl font-bold text-slate-700">Poster</h1>
                </div>
            </div>

           
            <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
                <h2 class="text-lg font-bold text-slate-800 mb-4">Add New Poster</h2>
                <div class="flex flex-col md:flex-row gap-4 items-end">
                    <div class="flex-1 w-full">
                        <label class="label">
                            <span class="label-text font-medium text-slate-600">Image URL</span>
                        </label>
                        <input type="text" placeholder="https://example.com/poster.jpg" v-model="newPosterUrl"
                            class="input input-bordered w-full bg-slate-50 focus:bg-white transition-colors" />
                    </div>
                    <button @click="handleAddPoster" :disabled="isSubmitting || !newPosterUrl"
                        class="btn bg-blue-600 hover:bg-blue-700 text-white border-none mb-6 md:mb-0 w-full md:w-auto min-w-[120px]">
                        <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                        <span v-else>Add Poster</span>
                    </button>
                </div>

                
                <div v-if="newPosterUrl"
                    class="mt-4 border border-dashed border-slate-300 p-2 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden relative group max-w-sm h-48">
                    <img :src="newPosterUrl" class="w-full h-full object-cover rounded-lg shadow-sm"
                        @error="() => newPosterUrl = ''" alt="Preview Error" />
                    <div
                        class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <span class="text-white font-medium text-sm">Preview</span>
                    </div>
                </div>
            </div>

           
            <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
                            <tr>
                                <th class="py-4 pl-6">Preview</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th class="text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody class="text-slate-600">
                            <tr v-if="posterStore.list.length === 0">
                                <td colspan="4" class="text-center py-10 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-2 opacity-30"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    No posters found
                                </td>
                            </tr>
                            <tr v-for="poster in posterStore.list" :key="poster.id"
                                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td class="pl-6 w-1/3">
                                    <div
                                        class="h-24 w-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                        <img :src="poster.ImageUrl" class="w-full h-full object-cover" />
                                    </div>
                                </td>

                                <td>
                                    <label class="cursor-pointer relative inline-flex items-center group">
                                        <input type="checkbox" :checked="poster.isActive" @change="toggleStatus(poster)"
                                            class="sr-only peer">
                                        <div
                                            class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                                        </div>
                                        <span class="ml-3 text-sm font-medium"
                                            :class="poster.isActive ? 'text-blue-600' : 'text-slate-400'">
                                            {{ poster.isActive ? 'Active' : 'Hidden' }}
                                        </span>
                                    </label>
                                </td>

                                <td class="text-xs">
                                    {{ formatDate(poster.createdAt) }}
                                </td>

                                <td class="text-center">
                                    <button @click="deletePoster(poster.id)"
                                        class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </LayoutAdmin>
</template>
