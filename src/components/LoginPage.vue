<template>
  <div class="login-container">
    <div class="login-box">
      <img src="@/assets/UNITEST-logo.png" alt="UNITEST Instruments" class="logo">
      <h1>Welcome!</h1>
      <p>Login to Continue</p>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username">Username<span class="required">*</span></label>
          <input type="text" v-model="username" id="username" required>
        </div>
        <div class="form-group">
          <label for="password">Password<span class="required">*</span></label>
          <input type="password" v-model="password" id="password" required>
        </div>
        <button type="submit" class="login-button">Login</button>
      </form>
    </div>
  </div>
</template>

  
  <script>
  export default {
    data() {
      return {
        email: '',
        password: '',
      };
    },
    methods: {
      login() {
        // Handle login logic
        console.log('Email:', this.email);
        console.log('Password:', this.password);
      }
    }
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
    box-sizing: border-box; /* Ensure padding and borders are included in width/height */
  }
  
  .login-box {
    width: 100%; /* Take full width available */
    max-width: 400px; /* But limit to a max width */
    padding: 40px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    box-sizing: border-box; /* Ensure padding is included in width */
  }
  
  .logo {
    width: 150px;
    margin-bottom: 20px;
  }
  
  h1 {
    font-size: 28px; /* Increase the font size */
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
  
  @media (min-width: 768px) {
    .login-container {
      padding: 0 20px;
    }
  
    .login-box {
      max-width: 400px;
    }
  }
  </style>