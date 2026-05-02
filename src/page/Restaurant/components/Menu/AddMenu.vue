<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LayoutAdmin from '@/page/Restaurant/restaurant.vue';
import { useAddMenuStore } from '@/stores/restaurant/addMenu';
import { useRestaurant } from '@/stores/Restaurant';
import { useCategoryStore } from '@/stores/categoryStore';

const route = useRoute();
const router = useRouter();
const Restaurant = useRestaurant();
const categoryStore = useCategoryStore();

const addStore = useAddMenuStore();

onMounted(() => {
    Restaurant.loadListRestaurant();
    categoryStore.loadCategories();
    addStore.init();
});

const MenuData = computed(() => addStore.MenuData);
const imagePreview = computed(() => addStore.imagePreview);

const checkAddMenu = () => addStore.addMenu(router, route);
const handleFileUpload = (e) => addStore.handleFileUpload(e);
const addOptionGroup = () => addStore.addOptionGroup();
const removeOptionGroup = (i) => addStore.removeOptionGroup(i);
const addChoice = (g) => addStore.addChoice(g);
const removeChoice = (g, c) => addStore.removeChoice(g, c);
const goBack = () => router.go(-1);

const isFormValid = computed(() => addStore.isFormValid);
</script>

<template>
    <LayoutAdmin>
        <div class="p-6 font-sans">
            <div class="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 class="text-3xl font-bold text-slate-700">
                        Add New Menu
                    </h1>
                </div>

                <div class="flex gap-3">
                    <button @click="goBack" class="btn bg-red-500 hover:bg-red-600 border-none text-white w-32 rounded-xl transition-all duration-300 font-bold shadow-md shadow-red-100">Cancel</button>
                    <button @click="checkAddMenu(MenuData)"
                        class="btn border-none w-32 rounded-xl transition-all duration-300 font-bold"
                        :class="isFormValid ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-500'">
                        Save
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-slate-100">
                    <!-- Image Section -->
                    <div class="p-8 lg:col-span-1 bg-slate-50/30 flex flex-col items-center">
                        <h3 class="font-bold text-slate-700 mb-6 w-full flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            รูปภาพ
                        </h3>

                        <div class="flex flex-col items-center gap-5 w-full max-w-xs">
                            <div
                                class="w-64 h-64 rounded-2xl overflow-hidden shadow-md border-4 border-white bg-slate-200 flex items-center justify-center relative group">
                                <img v-if="imagePreview || MenuData.ImageUrl" :src="imagePreview || MenuData.ImageUrl"
                                    class="w-full h-full object-cover" />
                                <div v-else class="text-slate-400 flex flex-col items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2 opacity-50" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span class="text-sm font-medium">ไม่มีรูปภาพ</span>
                                </div>
                            </div>
                            
                            <div class="flex flex-col gap-4 w-full">
                                <div class="w-full">
                                    <label class="btn btn-sm btn-outline border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 gap-2 normal-case font-medium w-full h-12 rounded-xl transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        คลิกเพื่อเลือกไฟล์รูปภาพ
                                        <input type="file" class="hidden" @change="handleFileUpload" accept="image/*" />
                                    </label>
                                    
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-8 lg:col-span-2 space-y-8">
                  
                        <div class="space-y-8">
                            <div>
                                <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">ข้อมูล</h3>
                                <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                                    <div class="form-control md:col-span-2">
                                        <label class="label">
                                            <span class="label-text font-medium text-slate-600">ชื่อเมนูอาหาร <span class="text-red-500">*</span></span>
                                        </label>
                                        <input type="text" class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
                                            v-model="MenuData.Name" />
                                    </div>
                                    <div class="form-control md:col-span-2">
                                        <label class="label">
                                            <span class="label-text font-medium text-slate-600">ราคาปกติ<span class="text-red-500">*</span></span>
                                        </label>
                                        <div class="relative">
                                            <input type="number" class="input input-bordered w-full pr-10 text-right focus:input-primary bg-slate-50 border-slate-200"
                                                v-model="MenuData.Price" />
                                            <span class="absolute right-4 top-3 text-slate-400 text-sm">฿</span>
                                        </div>
                                    </div>
                                    <div class="form-control md:col-span-2">
                                        <label class="label">
                                            <span class="label-text font-medium text-slate-600">ราคาโปรโมชั่น</span>
                                        </label>
                                        <div class="relative">
                                            <input type="number" class="input input-bordered w-full pr-10 text-right focus:input-primary bg-slate-50 border-slate-200 text-slate-700"
                                                v-model="MenuData.PromoPrice" />
                                            <span class="absolute right-4 top-3 text-slate-400 text-sm">฿</span>
                                        </div>
                                    </div>

                                    <div class="form-control md:col-span-6">
                                        <label class="label">
                                            <span class="label-text font-medium text-slate-600">รายละเอียด</span>
                                        </label>
                                        <input type="text" class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
                                            v-model="MenuData.Description" />
                                    </div>

                                    <div class="form-control md:col-span-2">
                                        <label class="label">
                                            <span class="label-text font-medium text-slate-600">ร้านอาหาร</span>
                                        </label>
                                        <select class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                            v-model="MenuData.Restaurant" :disabled="true">
                                            <option disabled value="">เลือกร้านอาหาร</option>
                                            <option v-for="res in Restaurant.list" :key="res.id" :value="res.Name">{{ res.Name }}</option>
                                        </select>
                                    </div>

                                    <div class="form-control md:col-span-2">
                                        <label class="label">
                                            <span class="label-text font-medium text-slate-600">หมวดหมู่อาหาร <span class="text-red-500">*</span></span>
                                        </label>
                                        <select class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200"
                                            v-model="MenuData.Category">
                                            <option disabled value="">เลือกหมวดหมู่</option>
                                            <option v-for="cat in categoryStore.list" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
                                        </select>
                                    </div>

                                    <div class="form-control md:col-span-2">
                                        <label class="label">
                                            <span class="label-text font-medium text-slate-600">สถานะการขาย <span class="text-red-500">*</span></span>
                                        </label>
                                        <select class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200"
                                            v-model="MenuData.Status">
                                            <option disabled value="">เลือกสถานะ</option>
                                            <option value="open">🟢 เปิดขาย (Open)</option>
                                            <option value="close">🔴 ปิดชั่วคราว (Close)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Options Section -->
                        <div class="mt-12">
                            <h3 class="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2 flex justify-between items-center">
                                <span>ตัวเลือกเพิ่มเติม</span>
                                <button @click="addOptionGroup" class="btn btn-sm btn-ghost text-emerald-600 hover:bg-emerald-50 font-medium">
                                    + เพิ่มหมวดหมู่
                                </button>
                            </h3>

                            <div class="space-y-6">
                                <transition-group name="fade" tag="div" class="space-y-6">
                                    <div v-for="(group, gIndex) in MenuData.OptionGroups" :key="'group-' + gIndex"
                                        class="relative pb-6 border-b border-slate-100 last:border-0 last:pb-0 group">

                                        <button @click="removeOptionGroup(gIndex)"
                                            class="absolute top-0 right-0 btn btn-square btn-sm btn-ghost text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors z-10"
                                            title="ลบหมวดหมู่">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                                                class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-4 pr-10 items-end">
                                            <div class="form-control">
                                                <label class="label">
                                                    <span class="label-text font-medium text-slate-600">ชื่อหมวดหมู่ตัวเลือก <span
                                                        class="text-red-500">*</span></span>
                                                </label>
                                                <input type="text" class="input input-bordered w-full focus:input-primary bg-slate-50 border-slate-200"
                                                    v-model="group.name" />
                                            </div>
                                            <div class="form-control">
                                                <label class="label">
                                                    <span class="label-text font-medium text-slate-600">จำนวนที่เลือกได้ <span
                                                        class="text-red-500">*</span></span>
                                                </label>
                                                <div class="relative">
                                                    <input type="number" min="1"
                                                        class="input input-bordered w-full pr-16 focus:input-primary bg-slate-50 border-slate-200"
                                                        v-model="group.maxChoices" />
                                                    <span class="absolute right-4 top-3 text-slate-400 text-sm font-medium">รายการ</span>
                                                </div>
                                            </div>
                                            <div class="form-control">
                                                <label class="label">
                                                    <span class="label-text font-medium text-slate-600">สถานะการเลือก</span>
                                                </label>
                                                <div class="relative">
                                                    <select class="select select-bordered w-full focus:select-primary bg-slate-50 border-slate-200"
                                                        v-model="group.isRequired">
                                                        <option :value="true">บังคับเลือก</option>
                                                        <option :value="false">ไม่บังคับ</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="pl-2 md:pl-4 border-l-2 border-slate-100">
                                            <div class="flex items-center justify-between mb-2">
                                                <label class="label px-0">
                                                    <span class="label-text font-medium text-slate-600">ตัวเลือก</span>
                                                </label>
                                            </div>

                                            <div class="space-y-3 mb-4">
                                                <div v-for="(choice, cIndex) in group.choices" :key="'choice-' + gIndex + '-' + cIndex"
                                                    class="flex items-start gap-4">
                                                    <div class="form-control flex-1">
                                                        <input type="text" class="input input-sm input-bordered w-full focus:input-primary bg-slate-50 border-slate-200 h-10"
                                                            v-model="choice.name" />
                                                    </div>
                                                    <div class="form-control w-32">
                                                        <div class="relative">
                                                            <input type="number" class="input input-sm input-bordered w-full pr-8 text-right focus:input-primary bg-slate-50 border-slate-200 h-10"
                                                                v-model="choice.price" />
                                                            <span class="absolute right-3 top-2.5 text-slate-400 text-sm">฿</span>
                                                        </div>
                                                    </div>
                                                    <button @click="removeChoice(gIndex, cIndex)"
                                                        class="btn btn-square btn-ghost btn-sm h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                                            stroke="currentColor" class="w-4 h-4">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <button @click="addChoice(gIndex)"
                                                class="btn btn-sm btn-outline border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 w-full md:w-auto font-medium font-sans">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                                                    class="w-4 h-4 mr-1">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                เพิ่มรายการใหม่
                                            </button>
                                        </div>
                                    </div>
                                </transition-group>

                                <div v-if="!MenuData.OptionGroups || MenuData.OptionGroups.length === 0"
                                    class="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50">
                                    <div class="text-slate-300 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                            stroke="currentColor" class="w-10 h-10 text-slate-300">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M6 13.5V10.5m0 0V7.5m0 3h3m-3 0h-3m12 3V10.5m0 0V7.5m0 3h3m-3 0h-3M6 19.5v-3m0 3h3m-3 0h-3m12 3v-3m0 3h3m-3 0h-3M12 13.5V10.5m0 0V7.5m0 3h3m-3 0h-3m0 9v-3m0 3h3m-3 0h-3" />
                                        </svg>
                                    </div>
                                    <h4 class="text-lg font-bold text-slate-600 mb-1">ยังไม่มีตัวเลือกเพิ่มเติม</h4>
                                    <p class="text-slate-500 text-sm mb-6 text-center max-w-sm">เพิ่มหมวดหมู่ให้ลูกค้าปรับแต่งเมนู เช่น ท็อปปิ้งเสริม
                                        ระดับความเผ็ด</p>
                                    <button @click="addOptionGroup"
                                        class="btn btn-sm bg-white border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-600 font-medium">
                                        + สร้างหมวดหมู่ตัวเลือก
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </LayoutAdmin>
</template>
