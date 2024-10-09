<template>
  <div class="login-container">
    <div class="login-box">
      <img src="@/assets/UNITEST-logo.png" alt="UNITEST Instruments" class="logo" />
      <h1>Welcome!</h1>
      <p>Login to Continue</p>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username">Username<span class="required">*</span></label>
          <input type="text" v-model="username" id="username" required />
        </div>
        <div class="form-group">
          <label for="password">Password<span class="required">*</span></label>
          <input type="password" v-model="password" id="password" required />
        </div>
        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="!isLoading">Login</span>
          <span v-else>Logging in...</span>
        </button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '', // To show error messages on invalid login
      isLoading: false, // To disable the login button during API request
    };
  },
  methods: {
    async login() {
      this.errorMessage = ''; // Reset the error message
      this.isLoading = true; // Start loading

      try {
        const response = await axios.post('http://localhost:3000/api/login', {
          username: this.username,
          password: this.password,
        });

        if (response.data.token) {
          // Store the JWT token and username locally for future requests
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', this.username); // Store the username for role-based checks

          // Redirect to Account Page after successful login
          this.$router.push('/account');  // Ensure '/account' is mapped to AccountPage.vue
        }
      } catch (error) {
        // Display error message
        this.errorMessage = error.response && error.response.data.message
          ? error.response.data.message
          : 'Invalid username or password. Please try again.';
      } finally {
        this.isLoading = false; // Stop loading
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f5f8fa;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.logo {
  width: 150px;
  margin-bottom: 20px;
}

h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

p {
  font-size: 18px;
  color: #6c757d;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.required {
  color: red;
}

.form-group input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.login-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #138496;
}

.login-button:disabled {
  background-color: #b0e0e6;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
