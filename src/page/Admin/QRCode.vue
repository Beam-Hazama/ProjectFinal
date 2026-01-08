<script setup>
import QrcodeVue from 'qrcode.vue'
import { ref, nextTick, onMounted, computed } from 'vue'
import AdminLayout from './Admin.vue'
import { useQRCodeStore } from '@/stores/qrcode'

const qrStore = useQRCodeStore()

const baseUrl = 'http://192.168.1.40:5173'

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

const openEditModal = (room) => {
  isEditing.value = true
  currentRoomId.value = room.id
  roomForm.value = { roomNumber: room.roomNumber, floor: room.floor, building: room.building }
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

const deleteRoom = async () => {
  if (confirm('ยืนยันการลบข้อมูลห้องนี้หรือไม่?')) {
    try {
      await qrStore.deleteRoom(currentRoomId.value)
      isModalOpen.value = false
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
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-slate-800">QR Code</h1>
          <button @click="openAddModal" class="btn btn-primary shadow-md">+ เพิ่มห้อง</button>
        </div>

        <div class="overflow-x-auto bg-white rounded-xl shadow border-none">
          <table class="table w-full text-center">
            <thead>
              <tr class="bg-slate-50 text-slate-600">
                <th>Room Number</th>
                <th>Floor</th>
                <th>Building</th>
                <th>Created At</th>
                <th>QR Code</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in rooms" :key="room.id" class="hover:bg-slate-50 border-none">
                <td>{{ room.roomNumber }}</td>
                <td>{{ room.floor }}</td>
                <td>{{ room.building }}</td>
                <td>{{ formatDate(room.createdAt) }}</td>
                <td class="border-none">
                  <button @click="printSpecificQR(room)" class="btn btn-sm btn-info btn-outline">Print QR</button>
                </td>
                <td class="border-none">
                  <button @click="openEditModal(room)"
                    class="btn btn-sm btn-ghost text-blue-600 font-bold">Edit</button>
                  <button @click="deleteRoom" class="btn btn-sm btn-ghost text-red-500 hover:bg-red-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-9.123a1.125 1.125 0 0 0-1.125-1.125h-2.25a1.125 1.125 0 0 0-1.125 1.125V5.123m9.902 0a48.674 48.674 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165" />
                    </svg>

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

      <div v-if="selectedRoom" class="print-container">
        <div class="qr-print-card">
          <div class="qr-border">
            <qrcode-vue
              :value="`${baseUrl}/User/${selectedRoom.building}-${selectedRoom.floor}-${selectedRoom.roomNumber}`"
              :size="420" level="H" />
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