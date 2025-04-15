import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/css/global.css'; // Importing the global CSS

createApp(App).use(router).mount('#app');
