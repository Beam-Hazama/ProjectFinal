<script setup>
import LayoutAdmin from '@/page/Restaurant/restaurant.vue';
import { useMenuManagement } from '@/composables/useMenuManagement';
import MenuImageSection from './components/MenuImageSection.vue';
import MenuBasicInfoSection from './components/MenuBasicInfoSection.vue';
import MenuOptionsSection from './components/MenuOptionsSection.vue';

const {
    MenuData,
    mode,
    imagePreview,
    imageInputMethod,
    Restaurant,
    categoryStore,
    checkAddMenu,
    handleFileUpload,
    addOptionGroup,
    removeOptionGroup,
    addChoice,
    removeChoice,
    formatTimestamp,
    goBack
} = useMenuManagement();
</script>

<template>
    <LayoutAdmin>
        <div class="p-6 font-sans">
            <div class="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-700">
                        {{ mode === 'Add Menu' ? 'Add New Menu' : 'Edit Menu' }}
                    </h1>
                </div>

                <div class="flex gap-3">
                    <button @click="goBack" class="btn btn-ghost text-slate-500 hover:bg-slate-200">ยกเลิก</button>
                    <button @click="checkAddMenu(MenuData)"
                        class="btn bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-md shadow-emerald-200 rounded-lg transition-all duration-300 px-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-5 h-5 mr-1">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        บันทึกข้อมูล
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">
                    <MenuImageSection 
                        v-model:imageInputMethod="imageInputMethod" 
                        v-model="MenuData.ImageUrl"
                        :imagePreview="imagePreview"
                        @fileUpload="handleFileUpload"
                    />

                    <div class="p-8 lg:col-span-2 space-y-8">
                        <MenuBasicInfoSection 
                            :mode="mode"
                            :menuData="MenuData"
                            :restaurantList="Restaurant.list"
                            :categoryList="categoryStore.list"
                            :formatTimestamp="formatTimestamp"
                        />

                        <MenuOptionsSection 
                            :optionGroups="MenuData.OptionGroups"
                            @addGroup="addOptionGroup"
                            @removeGroup="removeOptionGroup"
                            @addChoice="addChoice"
                            @removeChoice="removeChoice"
                        />
                    </div>
                </div>
            </div>
        </div>
    </LayoutAdmin>
</template>
