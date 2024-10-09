<template>
    <div class="users-page">
      <h3>Create New User</h3>
      <form @submit.prevent="createUser">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" v-model="formData.username" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="formData.password" required />
        </div>
        <button type="submit" class="create-button">Create</button>
      </form>
      <h3>Existing Users</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'UsersPage',
    data() {
      return {
        formData: {
          username: '',
          password: ''
        },
        users: [] // Holds the list of users fetched from the database
      };
    },
    methods: {
      async createUser() {
        try {
          // Call API to create a new user
          const response = await axios.post('http://localhost:3000/api/register', {
            username: this.formData.username,
            password: this.formData.password
          });
  
          if (response.data.message) {
            alert('User created successfully');
            this.formData.username = '';
            this.formData.password = '';
            this.fetchUsers(); // Refresh the user list
          }
        } catch (error) {
          console.error('Error creating user:', error);
          alert('Error creating user');
        }
      },
      async fetchUsers() {
        try {
          const response = await axios.get('http://localhost:3000/api/users');
          this.users = response.data;
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    },
    mounted() {
      this.fetchUsers(); // Fetch users when the component is mounted
    }
  };
  </script>
  
  <style scoped>
  .users-page {
    padding: 20px;
  }
  
  h3 {
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .create-button {
    background-color: #17a2b8;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .create-button:hover {
    background-color: #138496;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  thead {
    background-color: #f8f9fa;
  }
  
  th, td {
    padding: 10px;
    border: 1px solid #dee2e6;
    text-align: left;
  }
  </style>
  