<script setup>
import { formatTimestamp } from '@/utils/format';
import { ref, computed, nextTick, onMounted } from 'vue'
import QrcodeVue from 'qrcode.vue'
import AdminLayout from './Admin.vue'
import { useQrcodeStore } from '@/stores/admin/qrcode'

const qrStore = useQrcodeStore()

onMounted(() => {
  qrStore.loadRooms()
})

</script>

<template>
  <AdminLayout>
    <div class="p-6">
      <div class="no-print">
        <div class="flex justify-between items-start mb-6">
          <div class="text-3xl font-bold text-slate-700">QR Code</div>
          <button @click="qrStore.openAddModal"
            class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
              stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add QR Code
          </button>
        </div>

        
        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead class="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th class="py-4 ">ROOM NUMBER</th>
                  <th class="py-4 text-center">CREATED AT</th>
                  <th class="py-4 text-center">QR CODE</th>
                  <th class="py-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody class="text-slate-600">
                <tr v-for="room in qrStore.rooms" :key="room.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td class="py-4 font-bold text-indigo-600 ">{{ room.Roomnumber }}</td>
                  <td class="py-4 text-center text-sm">{{ formatTimestamp(room.CreatedAt) }}</td>
                  <td class="py-4 text-center">
                    <button @click="qrStore.printRoomQR(room)"
                      class="btn btn-sm btn-ghost text-indigo-500 hover:bg-indigo-50 gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231a1.125 1.125 0 01-1.117-1.227L6.34 18m11.318-4.171a24.235 24.235 0 00-11.318 0m11.318 0c.442.056.882.12 1.32.192a.75.75 0 01.625.74v.425a.75.75 0 01-.625.74a24.52 24.52 0 01-1.32.192m-11.318-1.12a24.234 24.234 0 01-1.32-.192.75.75 0 00-.625-.74v-.425a.75.75 0 00.625-.74a24.23 24.23 0 011.32-.192m11.318 1.121c.442.056.882.12 1.32.192m-11.318-1.121c-.442-.056-.882-.12-1.32-.192m12.638 1.121a24.23 24.23 0 00-12.638 0m12.638 0c.069.009.139.02.208.03m-12.846-0.03c-.069.009-.139.02-.208.03M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                      Print QR
                    </button>
                  </td>
                  <td class="py-4 text-center">
                    <button @click="qrStore.deleteRoom(room.id)" class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50 gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        
        <dialog :open="qrStore.isModalOpen" class="modal bg-black/50">
          <div class="modal-box shadow-2xl">
            <h3 class="font-bold text-lg mb-4 text-slate-700">Add New Room QR Code</h3>
            
              <div class="space-y-4">
                <div class="form-control">
                  <label class="label"><span class="label-text">Room Number</span></label>
                  <input v-model="qrStore.roomForm.Roomnumber" type="text"
                    placeholder="เช่น 101, A5, 204"
                    class="input input-bordered w-full bg-slate-50 focus:bg-white transition-colors text-slate-800" />
                </div>
              </div>

            <div class="modal-action flex mt-8 justify-end gap-3">
              <button @click="qrStore.isModalOpen = false"
                class="btn bg-red-500 hover:bg-red-600 text-white border-none shadow-md shadow-red-200 rounded-xl w-28 transition-all font-bold">
                Cancel
              </button>
              <button @click="qrStore.addRoom" :disabled="!qrStore.roomForm.Roomnumber"
                class="btn bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white border-none shadow-md shadow-emerald-200 rounded-xl w-28 transition-all font-bold">
                Save
              </button>
            </div>
          </div>
        </dialog>
      </div>

      <div v-if="qrStore.selectedRoom" class="print-container">
        <div class="qr-print-card">
          <div class="qr-border">
            <qrcode-vue
              :value="`${qrStore.baseUrl}/user/${qrStore.selectedRoom.Roomnumber}`"
              :size="420" level="H" render-as="svg" />
          </div>
          <h1 class="room-title">ห้อง {{ qrStore.selectedRoom.Roomnumber }}</h1>
          <p class="scan-text">สแกนเพื่อสั่งอาหาร</p>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<style scoped>
.table tr,
.table td {
  border: none !important;
}

.print-container {
  display: none;
}

@media print {
  @page {
    margin: 0;
    size: auto;
  }

  :deep(.drawer-side),
  :deep(.lg\:drawer-open),
  :deep(.drawer-toggle),
  :deep(.w-full.lg\:hidden),
  :deep(.breadcrumbs),
  .no-print {
    display: none !important;
  }

  :deep(.drawer-content) {
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .print-container {
    display: flex !important;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: white;
    z-index: 9999;
  }

  .qr-print-card {
    text-align: center;
  }

  .qr-border {
    padding: 25px;
    border: 4px solid #000;
    border-radius: 30px;
    display: inline-block;
  }

  .room-title {
    font-size: 85px;
    font-weight: bold;
    margin-top: 35px;
    color: black;
    line-height: 1;
  }

  .room-sub {
    font-size: 35px;
    color: #333;
    margin-top: 10px;
  }

  .scan-text {
    font-size: 24px;
    color: #666;
    margin-top: 20px;
    font-weight: 500;
  }
}
</style>
