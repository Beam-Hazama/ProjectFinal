<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const menus = [
  {
    name: 'Dashboard',
    routeName: 'Dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>`
  },
  {
    name: 'Menu List',
    routeName: 'Menu List',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>`
  },
  {
    name: 'Order List',
    routeName: 'Order List',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>`
  },
  {
    name: 'Restaurant',
    routeName: 'Restaurant',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m19.28 0H17.5m-10.5 0V9.95l-7.1 5.2a.75.75 0 01-1.1-1.02l3.2-2.35a.75.75 0 011.1 1.02l-2.4 1.75V21M3 21h18M12 2.25l-8.4 6.15a.75.75 0 00-.3 1.02l.8 1.1a.75.75 0 001.02.3l6.88-5.04a.75.75 0 01.9 0l6.88 5.04a.75.75 0 001.02-.3l.8-1.1a.75.75 0 00-.3-1.02L12 2.25z" /></svg>`
  },
  {
    name: 'QR Code',
    routeName: 'QR Code',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75zM16.5 19.5h.75v.75h-.75v-.75zM19.5 16.5h.75v.75h-.75v-.75z" /></svg>`
  },
];

const logout = () => {
  // Logic logout
  console.log('Logout clicked');
  // router.push('/login');
}
</script>

<template>
  <div class="drawer lg:drawer-open font-sans bg-center bg-no-repeat animate-bg bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col relative">
      <div class="w-full lg:hidden p-4 flex items-center justify-between bg-white shadow-sm z-30 sticky top-0">
        <div class="flex items-center gap-3">
          <label for="my-drawer-2" class="btn btn-square btn-ghost btn-sm text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              class="inline-block w-6 h-6 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
          <span class="font-bold text-lg text-blue-600 tracking-wide">Admin Panel</span>
        </div>
        <div class="avatar w-8 h-8">
          <div class="rounded-full bg-slate-200">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
          </div>
        </div>
      </div>

      <div class="w-full p-6 md:p-10 z-10 min-h-[calc(100vh-64px)] lg:min-h-screen overflow-y-auto">
        <div class="text-sm breadcrumbs text-slate-400 mb-4 hidden md:block">
          <ul>
            <li>Admin</li>
            <li>{{ route.name || 'Dashboard' }}</li>
          </ul>
        </div>

        <slot></slot>
      </div>

      <div
        class="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none translate-x-1/3 -translate-y-1/3 z-0">
      </div>
      <div
        class="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none -translate-x-1/3 translate-y-1/3 z-0">
      </div>
    </div>

    <div class="drawer-side z-40">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>

      <aside class="w-72 min-h-full bg-white shadow-xl flex flex-col border-r border-slate-100">

        <div class="h-20 flex items-center px-6 border-b border-slate-100 shrink-0">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-extrabold text-slate-800 tracking-tight">Admin<span class="text-blue-600">.</span>
              </h1>
              <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Management</p>
            </div>
          </div>
        </div>

        <div class="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <router-link v-for="menu in menus" :key="menu.name" :to="{ name: menu.routeName }" :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm',
            route.name === menu.routeName
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 translate-x-1'
              : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
          ]">
            <span v-html="menu.icon"
              :class="route.name === menu.routeName ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'"></span>
            {{ menu.name }}

            <span v-if="route.name === menu.routeName" class="ml-auto w-2 h-2 rounded-full bg-white/40"></span>
          </router-link>
        </div>

        <div class="p-4 border-t border-slate-100 bg-slate-50/50">
          <div class="flex items-center gap-3 mb-4 px-2">
            <div class="avatar online">
              <div class="w-10 rounded-full ring ring-blue-600 ring-offset-base-100 ring-offset-2">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser" />
              </div>
            </div>
            <div class="overflow-hidden">
              <p class="text-sm font-bold text-slate-700 truncate">Administrator</p>
              <p class="text-xs text-slate-400 truncate">admin@store.com</p>
            </div>
          </div>

          <button @click="logout" class="btn btn-outline btn-error btn-sm w-full gap-2 rounded-lg font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>

      </aside>
    </div>
  </div>
</template>
