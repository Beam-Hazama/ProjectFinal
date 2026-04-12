<script setup>
import QrcodeVue from 'qrcode.vue'
import { ref, nextTick, onMounted, computed } from 'vue'
import AdminLayout from './Admin.vue'
import { useQRCodeStore } from '@/stores/qrcode'

const qrStore = useQRCodeStore()

const baseUrl = 'https://192.168.1.45:5173'

const rooms = computed(() => qrStore.rooms)

onMounted(() => {
  qrStore.fetchRooms()
})

const isModalOpen = ref(false)
const isEditing = ref(false)
const currentRoomId = ref(null)
const roomForm = ref({ roomNumber: '', floor: '', building: '' })

const openAddModal = () => {
  isEditing.value = false
  roomForm.value = { roomNumber: '', floor: '', building: '' }
  isModalOpen.value = true
}



const formatDate = (date) => {
  if (!date) return 'กำลังโหลด...'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const saveRoom = async () => {

  if (!roomForm.value.roomNumber || !roomForm.value.building || !roomForm.value.floor) {
    alert('กรุณากรอกข้อมูล ตึก ชั้น และเลขห้อง ให้ครบถ้วนเพื่อให้ระบบแสดงผลได้ถูกต้อง')
    return
  }

  try {
    if (isEditing.value) {
      await qrStore.updateRoom(currentRoomId.value, { ...roomForm.value })
    } else {
      await qrStore.addRoom({ ...roomForm.value })
    }
    isModalOpen.value = false
  } catch (error) {
    console.error("Save error:", error)
  }
}

const deleteRoom = async (roomId) => {
  if (confirm('ยืนยันการลบข้อมูลห้องนี้หรือไม่?')) {
    try {
      await qrStore.deleteRoom(roomId)
    } catch (error) {
      console.error("Delete error:", error)
    }
  }
}

const selectedRoom = ref(null)
const printSpecificQR = async (room) => {
  selectedRoom.value = room
  await nextTick()
  window.print()
}
</script>

<template>
  <AdminLayout>
    <div class="p-6">
      <div class="no-print">
        <div class="flex justify-between items-start mb-6">
          <div class="text-3xl font-bold text-slate-700">QR Code</div>
          <button @click="openAddModal"
            class="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-md shadow-emerald-200 rounded-lg gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
              stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Room
          </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead class="bg-slate-50 text-slate-500 font-bold text-xs">
                <tr>
                  <th class="py-4 pl-6">ROOM NUMBER</th>
                  <th>FLOOR</th>
                  <th>BUILDING</th>
                  <th>CREATED AT</th>
                  <th>QR CODE</th>
                  <th class="text-center">ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in rooms" :key="room.id" class="hover:bg-slate-50 border-none">
                  <td class="pl-6">{{ room.roomNumber }}</td>
                  <td>{{ room.floor }}</td>
                  <td>{{ room.building }}</td>
                  <td>{{ formatDate(room.createdAt) }}</td>
                  <td class="border-none">
                    <button @click="printSpecificQR(room)"
                      class="btn btn-sm btn-info btn-outline hover:text-white transition-colors">Print QR</button>
                  </td>
                  <td class="text-center border-none">

                    <button @click="deleteRoom(room.id)" class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50">
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

        <dialog :open="isModalOpen" class="modal bg-black/50">
          <div class="modal-box shadow-2xl">
            <h3 class="font-bold text-lg mb-4">{{ isEditing ? 'แก้ไขรายละเอียดห้อง' : 'เพิ่มห้องใหม่' }}</h3>
            <div class="space-y-4">

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <div class="form-control">
                    <label class="label"><span class="label-text">เลขห้อง</span></label>
                    <input v-model="roomForm.roomNumber" type="text" class="input input-bordered w-full"
                      placeholder="ตัวอย่าง: 301" />
                  </div>
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">ชั้น</span></label>
                  <input v-model="roomForm.floor" type="text" class="input input-bordered w-full"
                    placeholder="ตัวอย่าง: 3" />
                </div>
                <div class="form-control">
                  <label class="label"><span class="label-text">ตึก</span></label>
                  <input v-model="roomForm.building" type="text" class="input input-bordered w-full"
                    placeholder="ตัวอย่าง: A" />
                </div>
              </div>
            </div>
            <div class="modal-action flex mt-8">
              <button @click="isModalOpen = false" class="btn btn-ghost btn-sm">ยกเลิก</button>
              <button @click="saveRoom" class="btn btn-primary btn-sm px-6">บันทึกข้อมูล</button>
            </div>
          </div>
        </dialog>
      </div>

      <div v-if="selectedRoom" class="print-container">
        <div class="qr-print-card">
          <div class="qr-border">
            <qrcode-vue
              :value="`${baseUrl}/user/${selectedRoom.building}/${selectedRoom.floor}/${selectedRoom.roomNumber}`"
              :size="420" level="H" render-as="svg" />
          </div>
          <h1 class="room-title">ห้อง {{ selectedRoom.roomNumber }}</h1>
          <p class="room-sub">ชั้น {{ selectedRoom.floor }} ตึก {{ selectedRoom.building }}</p>
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