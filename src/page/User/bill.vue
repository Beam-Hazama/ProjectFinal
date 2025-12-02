<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOderlistStore } from '@/stores/OrderList';

const Order = useOderlistStore()

onMounted(async () => {
    await Order.loadOrder()
})

const discount = ref(50.00);



// --- ฟังก์ชันคำนวณราคา (ปรับเป็น Function เพื่อใช้กับแต่ละ Order ใน Loop) ---
const calculateSubtotal = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + (item.price || item.Price) * (item.qty || item.Quantity), 0);
};

const calculateGrandTotal = (subtotal) => {
    return subtotal - discount.value;
};

const calculateVat = (grandTotal) => {
    const priceExcludingVat = grandTotal / 1.07;
    return grandTotal - priceExcludingVat;
};

const calculateExclVat = (grandTotal) => {
    return grandTotal / 1.07;
};
</script>

<template>
    <div class="min-h-screen  bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col gap-3 py-4 md:px-4 text-gray-700">
        <div class="flex items-center gap-3 pl-4 md:pl-0">
            <div class="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white " fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div>
                <h1 class="text-3xl font-black text-blue-600 tracking-tight">MY BILL</h1>
                <p class="text-xs text-blue-400 font-medium">ใบเสร็จรับเงิน</p>
            </div>
        </div>
        <div v-for="order in Order.list" :key="order.id"
            class="bg-white w-full rounded-3xl shadow-xl relative flex flex-col h-fit overflow-hidden ">
            <div class="bg-white p-4 pb-2">
                <div class="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex justify-between items-center">
                    <div>
                        <div class="text-sm text-blue-400 font-bold uppercase tracking-wider">Order Number</div>
                        <div class="text-3xl font-bold text-blue-800 mt-1">#{{ order.OrderNumber || receipt.table }}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1 mx-2.5">Status</div>
                        <div
                            class="inline-block bg-white text-blue-600 text-sm font-bold px-4 py-1.5 rounded-lg shadow-sm mb-2">
                            {{ order.statusOrder || receipt.queue }}
                        </div>
                        <div class="text-xs text-gray-500">
                            {{ order.CreatedAt?.toDate().toLocaleString() }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="py-3 flex text-sm font-bold text-gray-400 uppercase tracking-wider mt-2 ">
                <div class="px-7 w-16 text-center">Qty</div>
                <div class="flex-1 mx-2.5">Menu Description</div>
                <div class="px-7 text-right min-w-[100px]">Price</div>
            </div>

            <div class="px-3 py-2">
                <div v-for="(item, index) in order.Menu" :key="index"
                    class="flex items-center py-4 border-b border-gray-100 last:border-0 group hover:bg-gray-50 transition-colors rounded-xl px-2 -mx-2">
                    <div class="w-16 text-center">
                        <span class="inline-block text-gray-500 font-bold bg-gray-100 rounded-lg py-1 px-3 text-xs">
                            x{{ item.Quantity }} </span>
                    </div>
                    <div class="flex-1 min-w-0 ">
                        <div class="font-bold text-gray-800 text-base md:text-lg truncate">
                            {{ item.Name }}</div>
                    </div>
                    <div class="text-right min-w-[100px] font-bold text-blue-600 text-base mx-4 md:text-lg">
                        {{ item.Price * item.Quantity }}
                        <span class="text-xs text-slate-400 block text-right">บาท</span>
                    </div>
                </div>
            </div>
            <hr class="border-dashed border-gray-300 mx-6" />

            <div class="bg-white p-7 pb-10 space-y-4 z-10 ">
                <div class="flex justify-between text-2xl">
                    <span>รวมเป็นเงิน</span>
                    <span class="font-medium bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                        {{ calculateSubtotal(order.Menu) }} บาท
                    </span>
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
                    <span class="text-red-500 font-bold text-lg">- {{ discount }} บาท</span>
                </div>

                <div class="pt-2 text-xs text-gray-400 space-y-2 text-right">
                    <div class="flex justify-between">
                        <span>VAT 7%</span>
                        <span>{{ calculateVat(calculateGrandTotal(calculateSubtotal(order.Menu))) }} บาท</span>
                    </div>
                    <div class="flex justify-between">
                        <span>ราคาไม่รวมภาษี (Excl. VAT)</span>
                        <span>{{ calculateExclVat(calculateGrandTotal(calculateSubtotal(order.Menu))) }} บาท</span>
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