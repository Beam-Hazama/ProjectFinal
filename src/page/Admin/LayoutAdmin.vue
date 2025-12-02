<script setup>
import { useRoute } from 'vue-router';

const route = useRoute(); // ใช้สำหรับเช็คว่ากำลังอยู่หน้าไหน

const menus = [
  {
    name: 'Dashboard',
    routeName: 'Admin',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>`
  },
  {
    name: 'Menu List',
    routeName: 'AdminMenusList',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>`
  },
  {
    name: 'Order List',
    routeName: 'AdminOrdersList',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>`
  },
];

const logout = () => {
  // ใส่ Logic logout ที่นี่
  console.log('Logout clicked');
}
</script>

<template>
  <div class="drawer lg:drawer-open font-sans bg-slate-50 min-h-screen">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
    
    <div class="drawer-content flex flex-col relative overflow-hidden">
        
        <div class="w-full lg:hidden p-4 flex items-center bg-white shadow-sm z-30 sticky top-0">
            <label for="my-drawer-2" class="btn btn-square btn-ghost text-slate-500 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
            <span class="font-bold text-lg text-blue-600">Admin Panel</span>
        </div>

        <div class="w-full p-6 md:p-10 z-10 min-h-screen">
            <slot></slot>
        </div>

        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none -translate-x-1/3 translate-y-1/3"></div>
    </div>
    
    <div class="drawer-side z-40">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
      
      <aside class="w-80 min-h-full bg-white shadow-2xl flex flex-col">
        <div class="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 flex items-center justify-center relative overflow-hidden shrink-0">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div class="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
            
            <div class="relative z-10 text-white text-center">
                <h1 class="text-3xl font-extrabold tracking-wide drop-shadow-md">Admin Menu</h1>
                <p class="text-xs text-blue-100 opacity-80 mt-1">Management System</p>
            </div>
        </div>

        <ul class="menu p-4 flex-1 gap-2 mt-2 overflow-y-auto">
            <li v-for="menu in menus" :key="menu.name">
                <router-link 
                    :to="{ name: menu.routeName }" 
                    :class="[
                        'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-bold',
                        route.name === menu.routeName 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                    ]"
                >
                    <span v-html="menu.icon"></span>
                    {{ menu.name }}
                </router-link>
            </li>
        </ul>

        <div class="p-4 border-t border-slate-100 shrink-0">
            <button @click="logout" class="btn btn-ghost w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 gap-3 font-bold rounded-xl h-12">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Logout
            </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>