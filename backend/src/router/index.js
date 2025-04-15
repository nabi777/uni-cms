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
    component: AccountPage,
    meta: { requiresAuth: true }  // Protect this route with a meta field
  },
  // other routes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Add navigation guard to protect the /account route
router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Check if a token exists in localStorage (or you could use a store for state management)
    const token = localStorage.getItem('token');
    
    if (!token) {
      // If not logged in, redirect to the login page
      next({
        path: '/login',
        query: { redirect: to.fullPath } // Optionally store the original target route
      });
    } else {
      // If logged in, allow access
      next();
    }
  } else {
    // If the route does not require authentication, proceed as normal
    next();
  }
});

// Prevent logged-in users from accessing the login page
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.path === '/login' && token) {
    next('/account');  // Redirect logged-in users to the account page
  } else {
    next();  // Otherwise, proceed to the intended route
  }
});

export default router;
