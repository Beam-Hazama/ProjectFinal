<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import LayoutRestaurant from '@/page/Restaurant/restaurant.vue';
import { useCategoryStore } from '@/stores/categoryStore';

const route = useRoute();
const categoryStore = useCategoryStore();


const newCategoryName = ref('');
const isSubmitting = ref(false);
const showModal = ref(false);

const restaurantName = decodeURIComponent(route.params.restaurantName || '');

onMounted(() => {
    if (restaurantName) {

        categoryStore.loadCategories(restaurantName);
    }
});

const handleAddCategory = async () => {
    if (!newCategoryName.value.trim()) {
        alert('Please enter a category name');
        return;
    }

    try {
        isSubmitting.value = true;
        await categoryStore.addCategory({
            name: newCategoryName.value.trim(),
            RestaurantName: restaurantName
        });
        newCategoryName.value = '';
        showModal.value = false;
    } catch (error) {
        alert('Error adding category: ' + error.message);
    } finally {
        isSubmitting.value = false;
    }
};

const closeModal = () => {
    showModal.value = false;
    newCategoryName.value = '';
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
    <LayoutRestaurant>
        <div class="p-6">
            <div class="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-700">Category</h1>
                </div>

                <button @click="showModal = true"
                    class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Category
                </button>
            </div>


            <div v-if="showModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" @click.stop>
                    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 class="text-lg font-bold text-slate-800">Add New Category</h2>
                        <button @click="closeModal" class="text-slate-400 hover:text-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div class="p-6">
                        <div class="mb-6">
                            <label class="label pt-0">
                                <span class="label-text font-medium text-slate-600">Category Name</span>
                            </label>
                            <input type="text" placeholder="e.g. ของหวาน, เครื่องดื่ม" v-model="newCategoryName"
                                class="input input-bordered w-full bg-slate-50 focus:bg-white transition-colors" />
                        </div>

                        <div class="flex justify-end gap-3 mt-8">
                            <button @click="closeModal"
                                class="btn btn-ghost text-slate-500 hover:bg-slate-100">Cancel</button>
                            <button @click="handleAddCategory" :disabled="isSubmitting || !newCategoryName"
                                class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none min-w-[120px] rounded-lg shadow-sm">
                                <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                                <span v-else>Save Category</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="table w-full">
                        <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
                            <tr>
                                <th>CATEGORY NAME</th>
                                <th>CREATED AT</th>
                                <th class="text-center">ACTIONS</th>
                            </tr>
                        </thead>

                        <tbody class="text-slate-600">
                            <tr v-if="categoryStore.list.length === 0">
                                <td colspan="3" class="text-center py-10 text-slate-400">
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
                                <td class="font-medium text-slate-800 pl-6">
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
    </LayoutRestaurant>
</template>
