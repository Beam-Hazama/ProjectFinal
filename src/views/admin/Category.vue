<script setup>
import { formatTimestamp } from '@/utils/format';
import { ref, onMounted, onUnmounted, watch } from 'vue';
import draggable from 'vuedraggable';
import LayoutAdmin from '@/views/admin/AdminLayout.vue';
import { useCategoryStore } from '@/stores/shared/category';

const categoryStore = useCategoryStore();
const localCategories = ref([]);

onMounted(() => {
    categoryStore.loadCategories();
});

onUnmounted(() => {
    categoryStore.clearListener();
});

watch(() => categoryStore.list, (newList) => {
    localCategories.value = [...newList];
}, { deep: true, immediate: true });

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        categoryStore.onImageSelected(file);
    }
};

const onDragEnd = async () => {
    const orderedIds = localCategories.value.map(c => c.id);
    await categoryStore.updateCategoryPosition(orderedIds);
};
</script>

<template>
    <LayoutAdmin>
        <div class="p-6">
            <div class="flex justify-between items-center mb-7">
                <div class="text-3xl font-bold text-slate-700">Category</div>
                <button @click="categoryStore.showModal = true" class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Category
                </button>
            </div>
            <div v-if="categoryStore.showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" @click.stop>
                    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 class="text-lg font-bold text-slate-800">Add New Category</h2>
                    </div>
                    <div class="p-6">
                        <div class="flex flex-col gap-4 mb-6">
                            <div>
                                <label class="label pt-0">
                                    <span class="label-text font-medium text-slate-600">Category Name</span>
                                </label>
                                <input type="text" v-model="categoryStore.newCategoryName" class="input input-bordered w-full bg-slate-50 focus:bg-white transition-colors" />
                            </div>
                            <div class="flex flex-col gap-4">
                                <label class="text-sm font-bold text-slate-700">รูปภาพหมวดหมู่</label>
                                <div class="w-full">
                                    <label class="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 gap-2 normal-case font-medium w-full h-12 rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        คลิกเพื่อเลือกไฟล์รูปภาพ
                                        <input type="file" class="hidden" @change="handleFileUpload" accept="image/*" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div v-if="categoryStore.newCategoryImageUrl" class="mb-6 border border-dashed border-slate-300 p-2 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden relative group w-full h-32">
                            <img :src="categoryStore.newCategoryImageUrl" class="w-full h-full object-cover rounded-lg shadow-sm" alt="Preview" />
                            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                <span class="text-white font-medium text-sm">Preview</span>
                            </div>
                        </div>
                        <div class="flex justify-end gap-3 mt-4">
                            <button @click="categoryStore.closeModal"
                                class="btn bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-200 rounded-xl w-28 transition-all font-bold">Cancel</button>
                            <button @click="categoryStore.addCategory"
                                :disabled="categoryStore.isSubmitting || !categoryStore.newCategoryName || !categoryStore.newCategoryImageUrl"
                                class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-xl w-28 transition-all font-bold">
                                <span v-if="categoryStore.isSubmitting" class="loading loading-spinner loading-sm"></span>
                                <span v-else>Save</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                            <tr>
                                <th class="py-4 pl-6 w-12"></th>
                                <th class="py-4">Image</th>
                                <th class="py-4 text-center">Category Name</th>
                                <th class="py-4 text-center">Created At</th>
                                <th class="py-4 text-center">Action</th>
                            </tr>
                        </thead>                        
                        <draggable v-model="localCategories" item-key="id" tag="tbody" class="text-slate-600" handle=".drag-handle" @end="onDragEnd">
                            <template #item="{ element: category }">
                                <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors bg-white">
                                    <td class="pl-6 align-middle">
                                        <div class="drag-handle cursor-grab hover:text-blue-600 text-slate-400 p-2 opacity-50 hover:opacity-100 transition-opacity flex justify-center items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                                            </svg>
                                        </div>
                                    </td>
                                    <td class="py-4">
                                        <div class="h-20 w-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                            <img :src="category.ImageUrl" class="w-full h-full object-cover pointer-events-none" />
                                        </div>
                                    </td>
                                    <td class="py-4 text-center font-bold text-indigo-600">
                                        {{ category.Name }}
                                    </td>
                                    <td class="py-4 text-center text-sm">
                                        {{ formatTimestamp(category.CreatedAt) }}
                                    </td>
                                    <td class="py-4 text-center">
                                        <button @click="categoryStore.deleteCategory(category.id)" class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50 gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </draggable>
                    </table>
                </div>
            </div>
        </div>
    </LayoutAdmin>
</template>
