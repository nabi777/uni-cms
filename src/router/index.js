import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/LoginPage.vue';
import AccountPage from '@/components/AccountPage.vue';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/account',
    name: 'Account',
    component: AccountPage
  },
 
  // other routes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
