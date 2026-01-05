<script setup>
import QrcodeVue from 'qrcode.vue'
import { ref, nextTick } from 'vue'
import AdminLayout from './Admin.vue' //

const baseUrl = window.location.origin

// รายการข้อมูลห้อง (ข้อมูลเริ่มต้น)
const rooms = ref([
  { id: 1, roomNumber: '101', floor: '1', building: 'A', createdAt: new Date().toISOString() },
  { id: 2, roomNumber: '205', floor: '2', building: 'B', createdAt: new Date().toISOString() },
])

// สถานะ Modal และฟอร์ม
const isModalOpen = ref(false)
const isEditing = ref(false)
const currentRoomId = ref(null)
const roomForm = ref({ roomNumber: '', floor: '', building: '' })

// เปิด Modal เพิ่มข้อมูล
const openAddModal = () => {
  isEditing.value = false
  roomForm.value = { roomNumber: '', floor: '', building: '' }
  isModalOpen.value = true
}

// เปิด Modal แก้ไขข้อมูล
const openEditModal = (room) => {
  isEditing.value = true
  currentRoomId.value = room.id
  roomForm.value = { ...room }
  isModalOpen.value = true
}

// บันทึกข้อมูล
const saveRoom = () => {
  if (!roomForm.value.roomNumber) return
  if (isEditing.value) {
    const index = rooms.value.findIndex(r => r.id === currentRoomId.value)
    if (index !== -1) rooms.value[index] = { ...rooms.value[index], ...roomForm.value }
  } else {
    rooms.value.push({
      id: Date.now(),
      ...roomForm.value,
      createdAt: new Date().toISOString()
    })
  }
  isModalOpen.value = false
}

// ลบข้อมูลห้อง (เรียกจากใน Modal แก้ไข)
const deleteRoom = () => {
  if (confirm('คุณต้องการลบข้อมูลห้องนี้ใช่หรือไม่?')) {
    rooms.value = rooms.value.filter(room => room.id !== currentRoomId.value)
    isModalOpen.value = false
  }
}

// ระบบพิมพ์ QR Code
const selectedRoom = ref(null)
const printSpecificQR = async (room) => {
  selectedRoom.value = room
  await nextTick()
  window.print()
}
</script>

<template>
  <AdminLayout> <div class="p-6">
      <div class="no-print">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-slate-800">จัดการ QR Code</h1>
          <button @click="openAddModal" class="btn btn-primary shadow-md">+ เพิ่ม QR Code</button>
        </div>

        <div class="overflow-x-auto bg-white rounded-xl shadow border-none"> 
          <table class="table w-full text-center border-none">
            <thead>
              <tr class="bg-slate-50 text-slate-600 border-none">
                <th>เลขห้อง</th>
                <th>ชั้น</th>
                <th>ตึก</th>
                <th>วันที่สร้าง</th>
                <th class="text-center">ปริ้น</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody class="border-none">
              <tr v-for="room in rooms" :key="room.id" class="hover:bg-slate-50 border-none">
                <td class="font-bold text-blue-600 border-none text-lg">{{ room.roomNumber }}</td>
                <td class="border-none">{{ room.floor }}</td>
                <td class="border-none">{{ room.building }}</td>
                <td class="text-sm text-slate-400 border-none">
                  {{ new Date(room.createdAt).toLocaleDateString('th-TH') }}
                </td>
                <td class="border-none">
                  <button @click="printSpecificQR(room)" class="btn btn-sm btn-info btn-outline">
                    พิมพ์ QR
                  </button>
                </td>
                <td class="border-none">
                  <button @click="openEditModal(room)" class="btn btn-sm btn-ghost text-info font-bold">
                    แก้ไข
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <dialog :open="isModalOpen" class="modal bg-black/50">
        <div class="modal-box shadow-2xl">
          <div v-if="isEditing" class="mb-6 p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
             <p class="text-xs text-blue-500 uppercase tracking-widest font-bold mb-1">กำลังจัดการข้อมูล</p>
             <h2 class="text-3xl font-black text-blue-700">ห้อง {{ roomForm.roomNumber }}</h2>
          </div>
          
          <h3 class="font-bold text-lg mb-4">{{ isEditing ? 'แก้ไขรายละเอียด' : 'เพิ่มห้องใหม่' }}</h3>
          
          <div class="space-y-4">
            <div class="form-control">
              <label class="label"><span class="label-text">เลขห้อง</span></label>
              <input v-model="roomForm.roomNumber" type="text" class="input input-bordered w-full" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label"><span class="label-text">ชั้น</span></label>
                <input v-model="roomForm.floor" type="text" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label"><span class="label-text">ตึก</span></label>
                <input v-model="roomForm.building" type="text" class="input input-bordered w-full" />
              </div>
            </div>
          </div>

          <div class="modal-action flex justify-between items-center mt-8">
            <div>
              <button v-if="isEditing" @click="deleteRoom" class="btn btn-error btn-outline btn-sm">
                ลบข้อมูลห้องนี้
              </button>
            </div>
            <div class="flex gap-2">
              <button @click="isModalOpen = false" class="btn btn-ghost btn-sm">ยกเลิก</button>
              <button @click="saveRoom" class="btn btn-primary btn-sm px-6">บันทึก</button>
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
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
/* ลบเส้นขีดใต้ในตาราง */
.table tr, .table td, .table th {
  border-bottom: none !important;
  border-top: none !important;
}

.print-container { display: none; }

@media print {
  /* ลบหัวกระดาษ Vite App / เวลา */
  @page { margin: 0; size: auto; }

  /* ซ่อน Navbar, Sidebar และส่วนประกอบ Admin ทั้งหมด */
  .no-print, 
  :deep(.drawer-side), :deep(.navbar), :deep(.drawer-button), 
  :deep(.breadcrumbs), :deep(aside), :deep(header), :deep(.drawer-toggle) {
    display: none !important;
  }

  /* เคลียร์พื้นที่ให้พิมพ์ได้เต็มหน้า */
  :deep(.drawer-content) {
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
  }

  .print-container {
    display: flex !important;
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
  .qr-border { padding: 25px; border: 1px solid #000; border-radius: 24px; display: inline-block; }
  .room-title { font-size: 85px; font-weight: bold; margin-top: 35px; color: black; }
  .room-sub { font-size: 35px; color: #333; margin-top: 10px; }
}
</style>