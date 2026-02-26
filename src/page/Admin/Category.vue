<script setup>
import { ref, onMounted } from 'vue';
import LayoutAdmin from '@/page/Admin/Admin.vue';
import { useCategoryStore } from '@/stores/categoryStore';

const categoryStore = useCategoryStore();

// Form state
const newCategoryName = ref('');
const newCategoryImageUrl = ref('');
const isSubmitting = ref(false);

onMounted(() => {
    categoryStore.loadCategories();
});

const handleAddCategory = async () => {
    if (!newCategoryName.value.trim()) {
        alert('Please enter a category name');
        return;
    }
    if (!newCategoryImageUrl.value.trim()) {
        alert('Please enter an image URL');
        return;
    }

    try {
        isSubmitting.value = true;
        await categoryStore.addCategory({
            name: newCategoryName.value.trim(),
            ImageUrl: newCategoryImageUrl.value.trim()
        });
        newCategoryName.value = ''; // Reset
        newCategoryImageUrl.value = '';
    } catch (error) {
        alert('Error adding category: ' + error.message);
    } finally {
        isSubmitting.value = false;
    }
};

const deleteCategory = async (categoryId, categoryName) => {
    if (confirm(`Are you sure you want to delete category "${categoryName}"? This cannot be undone.`)) {
        try {
            await categoryStore.deleteCategory(categoryId);
        } catch (error) {
            alert('Error deleting category: ' + error.message);
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
                    <h1 class="text-3xl font-bold text-slate-700">Category Management</h1>
                </div>
            </div>

            <!-- Add New Category Block -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
                <h2 class="text-lg font-bold text-slate-800 mb-4">Add New Category</h2>
                <div class="flex flex-col md:flex-row gap-4 items-start">
                    <div class="flex-1 w-full flex flex-col gap-4">
                        <div>
                            <label class="label">
                                <span class="label-text font-medium text-slate-600">Category Name</span>
                            </label>
                            <input type="text" placeholder="e.g. ของหวาน, เครื่องดื่ม" v-model="newCategoryName"
                                class="input input-bordered w-full bg-slate-50 focus:bg-white transition-colors" />
                        </div>
                        <div>
                            <label class="label">
                                <span class="label-text font-medium text-slate-600">Image URL</span>
                            </label>
                            <input type="text" placeholder="https://example.com/image.jpg" v-model="newCategoryImageUrl"
                                class="input input-bordered w-full bg-slate-50 focus:bg-white transition-colors" />
                        </div>
                    </div>

                    <div class="flex flex-col justify-end h-full gap-4 mt-8 md:mt-0 w-full md:w-auto">
                        <button @click="handleAddCategory"
                            :disabled="isSubmitting || !newCategoryName || !newCategoryImageUrl"
                            class="btn bg-blue-600 hover:bg-blue-700 text-white border-none w-full min-w-[120px]">
                            <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                            <span v-else>Add Category</span>
                        </button>
                    </div>
                </div>

                <!-- Image Preview -->
                <div v-if="newCategoryImageUrl"
                    class="mt-6 border border-dashed border-slate-300 p-2 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden relative group max-w-xs h-32">
                    <img :src="newCategoryImageUrl" class="w-full h-full object-cover rounded-lg shadow-sm"
                        @error="() => newCategoryImageUrl = ''" alt="Preview Error" />
                    <div
                        class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <span class="text-white font-medium text-sm">Preview</span>
                    </div>
                </div>
            </div>

            <!-- Category List Table -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
                            <tr>
                                <th class="py-4 pl-6 w-24">Image</th>
                                <th>Category Name</th>
                                <th>Created At</th>
                                <th class="text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody class="text-slate-600">
                            <tr v-if="categoryStore.list.length === 0">
                                <td colspan="4" class="text-center py-10 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-2 opacity-30"
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    No categories found
                                </td>
                            </tr>
                            <tr v-for="category in categoryStore.list" :key="category.id"
                                class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td class="pl-6">
                                    <div
                                        class="h-12 w-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                        <img :src="category.ImageUrl" class="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td class="font-medium text-slate-800">
                                    {{ category.name }}
                                </td>

                                <td class="text-xs">
                                    {{ formatDate(category.createdAt) }}
                                </td>

                                <td class="text-center">
                                    <button @click="deleteCategory(category.id, category.name)"
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
