<template>
  <div :class="['new-account-form', { visible: visible }]">
    <div class="form-header">
      <h3>New Account</h3>
      <button class="close-btn" @click="closeForm">✕</button>
    </div>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" v-model="formData.name" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="formData.email" required />
      </div>
      <div class="form-group">
        <label for="status">Status</label>
        <select id="status" v-model="formData.status">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div class="form-group">
        <label for="department">Department</label>
        <input type="text" id="department" v-model="formData.department" required />
      </div>
      <div class="form-group">
        <label for="mobile">Mobile No.</label>
        <input type="text" id="mobile" v-model="formData.mobile" required />
      </div>
      <button type="submit" class="submit-btn">Create Account</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "NewAccountForm",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {
        name: "",
        email: "",
        status: "Active",
        department: "",
        mobile: "",
      },
    };
  },
  methods: {
    closeForm() {
      this.$emit("close");
    },
    async submitForm() {
      console.log('Submitting the following form data:', this.formData);

      try {
        const baseUrl = process.env.VUE_APP_API_BASE_URL

        this.$emit("submit", this.formData); // Emit form data first

        const response = await axios.post(`${baseUrl}/api/accounts`, this.formData);
        console.log(response.data.message);

        this.closeForm();
      } catch (error) {
        console.error('There was an error inserting the account:', error.response?.data || error.message);
      }
    },
  },
};
</script>

<style src="@/assets/css/form-styles.css"></style>
