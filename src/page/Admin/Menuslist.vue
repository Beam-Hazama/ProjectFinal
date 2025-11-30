<script setup>
import { db } from '@/firebase';
import LayoutAdmin from '@/page/Admin/LayoutAdmin.vue';
import { useMenuStore } from '@/stores/menu';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { RouterLink } from 'vue-router';

const MenuStore = useMenuStore();

const switchStatus = async (product) => {
  const thisProduct = doc(db, 'products', product.id);
  if (product.status === 'open') {
    await updateDoc(thisProduct, { status: 'close' });
  } else {
    await updateDoc(thisProduct, { status: 'open' });
  }
};

const reStock = async (product) => {
  const thisProduct = doc(db, 'products', product.id);
  const productRestock = product.remainQuantity + product.reStock;
  if (product.reStock > 0) {
    await updateDoc(thisProduct, { remainQuantity: productRestock });
  } else {
    await updateDoc(thisProduct, { remainQuantity: product.quantity });
  }
};
</script>

<template>
  <LayoutAdmin>
    <div class="text text-3xl font-bold text-center my-3">Product List</div>
    <table class="table">
      <thead>
        <tr>
          <th>Products</th>
          <th>price</th>
          <th>Quantity</th>
          <th>Role</th>
          <th>Status</th>
          <th>Restock</th>
          <th>Last Update</th>
          <th>
            <RouterLink
              to="/adminproductsmanage"
              class="btn btn-soft btn-success"
              >Add Product</RouterLink
            >
          </th>
        </tr>
      </thead>
      <tbody v-for="product in MenuStore.list">
        <tr>
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar">
                <div class="mask mask-squircle h-12 w-12">
                  <img
                    :src="product.ImageUrl"
                    alt="Avatar Tailwind CSS Component"
                  />
                </div>
              </div>
              <div>
                <div class="font-bold">{{ product.Name }}</div>
              </div>
            </div>
          </td>
          <td>{{ product.Price }}</td>
          <td>{{ product.Remainquantity }}/{{ product.Quantity }}</td>
          <td>{{ product.Store }}</td>
          <td>
            <button
              @click="switchStatus(product)"
              class="btn"
              :class="
                product.status === 'open'
                  ? 'btn-success btn-outline'
                  : 'btn-error btn-outline'
              "
            >
              {{ product.status }}
            </button>
          </td>
          <td class="flex">
            <input
              type="number"
              class="input mr-2 w-auto"
              v-model="product.reStock"
              min="0"
              :max="product.quantity - product.remainQuantity"
            />
            <button
              class="btn w-auto btn-info btn-soft"
              @click="reStock(product)"
            >
              Refill
            </button>
          </td>
          <td>{{ product.updatedAt.toDate() }}</td>
          <th>
            <RouterLink
              class="btn btn-ghost btn-xs w-auto h-auto"
              :to="{
                name: 'adminproductsmanageupdate',
                params: { id: product.id },
              }"
              >details</RouterLink
            >
          </th>
        </tr>
      </tbody>
    </table>
  </LayoutAdmin>
</template>
