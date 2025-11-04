import { createRouter, createWebHistory } from 'vue-router'
import User from '@/User/User.vue'
import Admin from '@/Admin/LaoutAdmin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'User',
      component: User,
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
    }
  ],
})

export default router
