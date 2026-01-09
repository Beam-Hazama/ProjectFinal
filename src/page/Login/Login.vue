<script setup>
import { useRouter } from 'vue-router';
import { useAccountStore } from '@/stores/account';
import { onMounted, ref } from 'vue';
import Gmail from '@/Icon/Gmail.vue';

const accountStore = useAccountStore()
const router = useRouter()

const username = ref('') 
const password = ref('')
const errorMessage = ref('') 

const login = async () => {
  try {
    errorMessage.value = ''
   
    const role = await accountStore.signIn(username.value, password.value);

    if (role === 'admin') {
      router.push({ name: 'Admin' });
    } 
    else if (role === 'restaurant') {
      const restaurantName = accountStore.user?.restaurant || 'unknown';
      router.push({ 
        name: 'Restaurants', 
        params: { restaurantName: restaurantName } 
      });
    } 
    else {
      router.push({ name: 'Home' });
    }

  } catch (error) {
    console.error(error.message);
    errorMessage.value = error.message;
  }
};

onMounted(async() => {
  await accountStore.checkAuthState()
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat animate-bg bg-[url('https://travel.mthai.com/app/uploads/2017/06/first-google-result-image-capital-city-141-593907b7d8916__880.jpg')] relative">
    <div class="absolute inset-0 backdrop-blur-sm bg-black/20"></div>
    <div class="relative flex flex-col m-6 bg-white shadow-2xl rounded-2xl md:flex-row transform transition duration-500 hover:scale-[1.02] hover:shadow-[0px_0px_35px_rgba(59,130,246,0.5)] overflow-hidden">
      
      <div class="flex flex-col justify-center p-8 md:p-10 w-full md:w-[450px]">
        <h1 class="text-5xl font-bold text-blue-600 relative w-fit">
          Login
          <span class="absolute left-0 right-0 h-[4px] rounded-full -bottom-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500"></span>
        </h1>
        <p class="text-gray-400 mb-8 mt-5">Please enter your Username & Password</p>

        <p v-if="errorMessage" class="text-red-500 text-sm mb-4 font-medium animate-pulse">
          ⚠️ {{ errorMessage }}
        </p>

        <div class="py-3">
          <label class="text-blue-500 text-md block mb-1 font-semibold">Username</label>
          <div class="flex items-center gap-2 w-full p-2 border border-blue-300 rounded-md focus-within:border-blue-500 focus-within:shadow-[0_0_8px_#3b82f6] transition duration-200">
            <input type="text" class="w-full outline-none placeholder:text-blue-300" v-model="username" placeholder="Enter your username">
          </div>
        </div>

        <div class="py-3">
          <label class="text-blue-500 text-md block mb-1 font-semibold">Password</label>
          <div class="flex items-center gap-2 w-full p-2 border border-blue-300 rounded-md focus-within:border-blue-500 focus-within:shadow-[0_0_8px_#3b82f6] transition duration-200">
            <input type="password" class="w-full outline-none placeholder:text-blue-300" v-model="password" placeholder="••••••••">
          </div>
        </div>

        <div class="flex items-center gap-2 my-3">
          <input type="checkbox" class="accent-blue-500" checked>
          <span class="text-blue-500">Remember me</span>
        </div>

        <button class="w-full p-2 mt-3 rounded-lg font-medium text-white bg-gradient-to-r 
              from-blue-400 to-blue-600 hover:from-white hover:to-white hover:text-blue-500 hover:border hover:border-blue-600 
                transition duration-300 shadow-md hover:shadow-xl" @click="login()">
          Login
        </button>

        <button class="w-full p-2 mt-3 rounded-lg font-medium flex justify-center text-white
                  bg-gradient-to-r from-orange-300 to-orange-700   
                  hover:from-white hover:to-white 
                  hover:text-orange-600 hover:border hover:border-orange-600
                  transition duration-300 shadow-md hover:shadow-xl" @click="accountStore.signInWithGoogle()">
          <gmail class="mr-3"></gmail> Login with Google
        </button>
      </div>

      <div class="relative hidden md:block w-[400px]">
        <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/43/64/77/3ei4enw-open-daily-from.jpg"
          class="absolute inset-0 w-full h-full object-cover">
      </div>
    </div>
  </div>
</template>