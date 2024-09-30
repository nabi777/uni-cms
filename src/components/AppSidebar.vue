<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <img src="@/assets/UNITEST-logo2.png" alt="UNITEST" class="logo">
      <h2>UNITEST</h2>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li @click="navigate('account')"><a class="sidebar-link">Account Management</a></li>
        <li @click="navigate('customer-management')"><a class="sidebar-link">Customer Management</a></li>
        <li @click="navigate('product-management')"><a class="sidebar-link">Product Management</a></li>
        <li @click="navigate('model-management')"><a class="sidebar-link">Model Management</a></li>
        <li @click="navigate('order-management')"><a class="sidebar-link">Order Management</a></li>
      </ul>
    </nav>
    <div class="logout-section">
      <button class="logout-btn" @click="logout">Logout</button>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'AppSidebar',
  methods: {
    navigate(page) {
      this.$emit('navigate', page);
    },
    logout() {
      console.log('Logout button clicked');
      // Implement your logout logic here
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: auto;
  z-index: 1000;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 20px;
}

.logo {
  width: 40px;
  margin-right: 10px;
}

.sidebar-nav ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  padding: 10px 0; /* Adjust vertical padding */
}

.sidebar-link {
  color: white;
  text-decoration: none;
  display: block;
  padding: 10px 20px; /* Ensure text is aligned to the left */
  border-radius: 25px;
  transition: background-color 0.3s ease;
  text-align: left; /* Align text to the left */
}

.sidebar-link.active,
.sidebar-link:hover {
  background-color: #1abc9c;
}

.logout-section {
  padding: 20px;
  margin-top: auto; /* Ensure logout button stays at the bottom */
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background-color: #dc3545; /* Red color for logout */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
}

.logout-btn:hover {
  background-color: #c82333; /* Darker red on hover */
}


</style>
