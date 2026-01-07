<script setup>
//import QrcodeVue from 'qrcode.vue'
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
    second : '2-digit',
  })
}

const saveRoom = async () => {
  if (!roomForm.value.roomNumber) return
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
                <th>เลขห้อง</th>
                <th>ชั้น / ตึก</th>
                <th>วันที่สร้าง</th>
                <th>พิมพ์ QR</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in rooms" :key="room.id" class="hover:bg-slate-50 border-none">
                <td class="font-bold text-blue-600 text-lg border-none">{{ room.roomNumber }}</td>
                <td class="border-none">ชั้น {{ room.floor }} ตึก {{ room.building }}</td>
                <td class="text-sm text-slate-400 border-none">
                  {{ formatDate(room.createdAt) }}
                </td>
                <td class="border-none">
                  <button @click="printSpecificQR(room)" class="btn btn-sm btn-info btn-outline">พิมพ์ QR</button>
                </td>
                <td class="border-none">
                  <button @click="openEditModal(room)" class="btn btn-sm btn-ghost text-info font-bold">แก้ไข</button>
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
            <div class="form-control">
              <label class="label"><span class="label-text">เลขห้อง (เช่น 101, A05)</span></label>
              <input v-model="roomForm.roomNumber" type="text" class="input input-bordered w-full" placeholder="ระบุเลขห้อง" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text">ชั้น</span></label>
                <input v-model="roomForm.floor" type="text" class="input input-bordered w-full" placeholder="ชั้น" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">ตึก</span></label>
                <input v-model="roomForm.building" type="text" class="input input-bordered w-full" placeholder="ตึก" />
              </div>
            </div>
          </div>
          <div class="modal-action flex justify-between mt-8">
            <button v-if="isEditing" @click="deleteRoom" class="btn btn-error btn-outline btn-sm">ลบห้องนี้</button>
            <div class="flex gap-2">
              <button @click="isModalOpen = false" class="btn btn-ghost btn-sm">ยกเลิก</button>
              <button @click="saveRoom" class="btn btn-primary btn-sm px-6">บันทึกข้อมูล</button>
            </div>
          </div>
        </div>
      </dialog>

      <div v-if="selectedRoom" class="print-container">
        <div class="qr-print-card">
          <div class="qr-border">
            <qrcode-vue :value="`${baseUrl}/User/${selectedRoom.roomNumber}`" :size="420" level="H" />
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
.table tr, .table td { border: none !important; }
.print-container { display: none; }

@media print {
  @page { margin: 0; size: auto; }
  
  /* ส่วนที่เพิ่ม: สั่งซ่อน Navbar, Sidebar และปุ่มต่างๆ ของ Admin Layout */
  :deep(.drawer-side), 
  :deep(.lg\:drawer-open),
  :deep(.drawer-toggle),
  :deep(.w-full.lg\:hidden),
  :deep(.breadcrumbs),
  .no-print {
    display: none !important;
  }

  /* ปรับให้เนื้อหาหลัก (QR) แสดงผลเต็มหน้าจอ */
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
    top: 0; left: 0;
    background: white;
    z-index: 9999;
  }
  .qr-print-card { text-align: center; }
  .qr-border { padding: 25px; border: 4px solid #000; border-radius: 30px; display: inline-block; }
  .room-title { font-size: 85px; font-weight: bold; margin-top: 35px; color: black; line-height: 1; }
  .room-sub { font-size: 35px; color: #333; margin-top: 10px; }
  .scan-text { font-size: 24px; color: #666; margin-top: 20px; font-weight: 500; }
}
</style>