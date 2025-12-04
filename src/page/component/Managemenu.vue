<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref } from 'vue';

import { useMenuStore } from '@/stores/menu';
import { useRestaurant } from '@/stores/Restaurant';

import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db, } from '@/firebase';
//import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

import LayoutAdmin from '@/page/Admin/Admin.vue';

const route = useRoute();
const router = useRouter();

const mode = ref('');

const MenuStore = useMenuStore()
const Restaurant = useRestaurant()

const productId = route.params.id
const selectedFile = ref(null);

const MenuData = reactive({
  Name: '',
  ImageUrl: '',
  Price: 0,
  Quantity: 0,
  Remainquantity: 0,
  Restaurant: '',
  Status: '',
});

const checkAddProduct = async (MenuData) => {
  try {
    let MenuId
    let ImageUrl = MenuData.ImageUrl || ''

    if (mode.value === 'Add Product') {
      const docRef = await addDoc(collection(db, 'Menu'), {
        ...MenuData,
        ImageUrl: '',
      })
      MenuId = docRef.id
    } else if (mode.value === 'Update Product') {
      MenuId = route.params.id
    }
    await updateDoc(doc(db, 'Menu', MenuId), {
      ...MenuData,
      ImageUrl,
    })
    router.push({ name: 'Menu List' })
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่ม/อัปเดตสินค้า:', error)
  }
}
const handleFileUpload = (event) => {
  selectedFile.value = event.target.files[0];
  if (selectedFile.value) {
    const previewUrl = URL.createObjectURL(selectedFile.value)
    MenuStore.imageList[productId] = previewUrl
    console.log('Preview URL:', previewUrl);
  }
};

onMounted(async () => {
  if (route.params.id) {
    mode.value = 'Update Product';
    const productSnap = await getDoc(doc(db, 'Menu', route.params.id));
    const Menu = productSnap.data();

    MenuData.Name = Menu.Name;
    MenuData.Price = Menu.Price;
    MenuData.Remainquantity = Menu.Remainquantity;
    MenuData.Quantity = Menu.Quantity;
    MenuData.Status = Menu.Status;
    MenuData.ImageUrl = Menu.ImageUrl;
    MenuData.Restaurant = Menu.Restaurant
    

  } else {
    mode.value = 'Add Product';
  }

  Restaurant.loadRestaurant()
});
</script>

<template>
  <LayoutAdmin>
    <div class="flex justify-around">
      <div class="text text-2xl font-bold my-3">Manage Product</div>
      <button
        class="btn my-3 w-auto btn-success btn-soft"
        @click="checkAddProduct(MenuData)"
      >
        {{ mode }}
      </button>
    </div>
    <div class="text-2xl font-bold">{{ mode }}</div>
    <div class="grid grid-cols-2">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Product Name</legend>
        <input
          type="text"
          class="input"
          placeholder="Product Name"
          v-model="MenuData.Name"
        />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Product Image</legend>
        <div class="avatar">
          <div class="w-24 rounded-full">
            <img :src="MenuData.ImageUrl" />
          </div>
        </div>
        <input type="file" class="btn w-40" @change="handleFileUpload" />
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Product Price</legend>
        <input
          type="number"
          class="input"
          placeholder="Product Price"
          v-model="MenuData.Price"
        />
        <p class="label"></p>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Product Quantity</legend>
        <div class="flex">
          <div>
            <input
              type="number"
              class="input w-30"
              placeholder="remainQuantity"
              v-model="MenuData.Remainquantity"
            />
            <p class="fieldset-label">จำนวนที่เหลือ</p>
          </div>
          <div>
            <input
              type="number"
              class="input w-30"
              placeholder="Product Name"
              v-model="MenuData.Quantity"
            />
            <p class="fieldset-label">จำนวนสูงสุด</p>
          </div>
        </div>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Menu no Restaurant</legend>
        <select class="select select-neutral my-2" v-model="MenuData.Restaurant">
          <option disabled selected>Pick a Store</option>
          <option v-for="RestaurantName in Restaurant.list">{{ RestaurantName.Name }}</option>
        </select>
      </fieldset>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Product Status</legend>
        <select class="select select-neutral my-2" v-model="MenuData.Status">
          <option disabled selected>Pick a Status</option>
          <option>open</option>
          <option>closs</option>
        </select>
      </fieldset>
    </div>
  </LayoutAdmin>
</template>
