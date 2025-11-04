<script setup>
import StoreList from './StoreList.vue';

let pagenow = 'Dashboard'
const menus = [
    {
        name: 'Dashboard',
        routeName: 'admindashboard'
    },
    {
        name: 'Store List',
        routeName: 'adminuserslist'
    },
    {
        name: 'Product',
        routeName: 'adminproductslist'
    },
    {
        name: 'Order',
        routeName: 'adminorderslist'
    },
]
</script>
<template>
    <div class="drawer drawer-open ">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content mx-4">
            <slot></slot>
        </div>
        <div class="drawer-side">
            <label for="my-drawer-2" aria-label="close sidebar" ></label>
            <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                <li><a class="text-2xl font-bold">Admin Menu</a></li>
                <li v-for="menu in menus" class="my-1" :class="active">
                    <div>{{ menu.name }}</div>
                    <!--<router-link :to="{ name: menu.routeName }"
                        :class="menu.routeName === activeMenu ? 'active bg-neutral-500' : ''">{{ menu.name }}</router-link>-->
                </li>
                <li><a @click="logout">Logout</a></li>
            </ul>
        </div>
    </div>
</template>