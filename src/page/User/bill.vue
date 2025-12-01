<script setup>
import { ref, computed } from 'vue';

// จำลองข้อมูล (Mock Data)
const receipt = ref({
    queue: 'รอคิว',
    table: '12',
    date: '10/07/2563 13:52',
    items: [
        { name: 'สลัดปลาแซลมอน', qty: 1, price: 159.00 },
        { name: 'ผักคะน้า', qty: 1, price: 65.00 },
        { name: 'ผัดไทยกุ้งสด', qty: 1, price: 75.00 },
        { name: 'อกไก่พริกไทยดำ', qty: 1, price: 95.00 },
        { name: 'น้ำพริกกะปิ+ปลาทู ผักต้ม', qty: 1, price: 150.00 },
        { name: 'ชาเย็นนมสด', qty: 1, price: 45.00 },
        { name: 'ข้าวผัดกระเพราหมูสับไข่ดาว', qty: 1, price: 65.00 },
        { name: 'ข้าวผัดไข่ปู', qty: 1, price: 65.00 },
        { name: 'ผัดพริกแกงหมู', qty: 1, price: 65.00 },
        { name: 'ส้มตำ ปูไทย', qty: 1, price: 65.00 },
    ],
    received: 1000.00
});

const discount = ref(50.00);

// --- ส่วนการคำนวณ ---
const subtotal = computed(() => receipt.value.items.reduce((sum, item) => sum + item.price, 0));
const totalQty = computed(() => receipt.value.items.reduce((sum, item) => sum + item.qty, 0));
const grandTotal = computed(() => subtotal.value - discount.value);
const priceExcludingVat = computed(() => grandTotal.value / 1.07);
const vatAmount = computed(() => grandTotal.value - priceExcludingVat.value);

const formatPrice = (value) => {
    return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex justify-center p-4 md:px-8 text-gray-700">
        <div class="bg-white w-full max-w rounded-3xl shadow-xl relative flex flex-col h-fit overflow-hidden">
            <div class="bg-white p-6 pb-2">
                <div class="flex items-center gap-3 mb-6">
                    <div class="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-3xl font-black text-blue-600 tracking-tight">MY BILL</h1>
                        <p class="text-xs text-blue-400 font-medium">ใบเสร็จรับเงิน</p>
                    </div>
                </div>
                <div class="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex justify-between items-center">
                    <div>
                        <div class="text-sm text-blue-400 font-bold uppercase tracking-wider">Room Number</div>
                        <div class="text-3xl md:text-4xl font-bold text-blue-800 mt-1">{{ receipt.table }}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1 mx-2.5">Status</div>
                        <div
                            class="inline-block bg-white text-blue-600 text-sm font-bold px-4 py-1.5 rounded-lg shadow-sm mb-2">
                            {{ receipt.queue }}
                        </div>
                        <div class="text-xs  text-gray-500 mx-">{{ receipt.date }}</div>
                    </div>
                </div>
            </div>
            <div class="px-8 py-3 flex text-sm font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 mt-2">
                <div class="w-16 text-center">Qty</div>
                <div class="flex-1 mx-4">Menu Description</div>
                <div class="text-right min-w-[100px]">Price</div>
            </div>
            <div class="px-8 py-2">
                <div v-for="(item, index) in receipt.items" :key="index"
                    class="flex items-center py-4 border-b border-gray-100 last:border-0 group hover:bg-gray-50 transition-colors rounded-xl px-2 -mx-2">
                    <div class="w-16 text-center">
                        <span class="inline-block text-gray-500 font-bold bg-gray-100 rounded-lg py-1 px-3 text-xs">
                            x{{ item.qty }}
                        </span>
                    </div>
                    <div class="flex-1 min-w-0 mx-4">
                        <div class="font-bold text-gray-800 text-base md:text-lg truncate">{{ item.name }}</div>
                    </div>
                    <div class="text-right min-w-[100px] font-bold text-blue-600 text-base md:text-lg">
                        {{ formatPrice(item.price) }}
                    </div>
                </div>
            </div>
            <div class="bg-white p-8 pb-10 space-y-4 z-10 border-t border-gray-50">
                <div class="flex justify-between text-2xl text- ">
                    <span>รวมเป็นเงิน ({{ totalQty }} รายการ)</span>
                    <span class="font-medium bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">{{
                        formatPrice(subtotal) }}</span>
                </div>
                <div class="flex justify-between items-center bg-red-50 p-3 rounded-xl border border-red-100">
                    <div class="flex items-center gap-2 text-red-500 font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        ส่วนลด
                    </div>
                    <span class="text-red-500 font-bold text-lg">- {{ formatPrice(discount) }}</span>
                </div>
                <div class="pt-2 text-xs text-gray-400 space-y-2 text-right">
                    <div class="flex justify-between">
                        <span>VAT 7%</span>
                        <span>{{ formatPrice(vatAmount) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>ราคาไม่รวมภาษี (Excl. VAT)</span>
                        <span>{{ formatPrice(priceExcludingVat) }}</span>
                    </div>
                </div>
                <div class="border-t border-gray-100 my-4"></div>
                <div class="flex flex-col items-center justify-center py-2 space-y-2">
                    <p class="text-sm font-bold text-gray-500 tracking-wide">SCAN QR CODE</p>
                    <p class="text-sm font-bold text-gray-500 tracking-wide">เพื่อชำระเงิน</p>
                    <div class="p-3 bg-white rounded-2xl shadow-md border border-gray-100">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Example" alt="QR Code"
                            class="w-28 h-28 mix-blend-multiply opacity-90" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>