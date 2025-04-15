<template>
  <div :class="['form-container', { visible: visible }]">
    <div class="form-header">
      <h3>Edit Account</h3>
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
        <input type="text" id="mobile" v-model="formData.mobile_no" required />
      </div>
      <button type="submit" class="submit-btn">Save Changes</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditAccountForm',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    accountData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      formData: { ...this.accountData }, // Initialize with passed account data
    };
  },
  watch: {
    accountData: {
      immediate: true,
      handler(newData) {
        this.formData = { ...newData }; // Update formData when accountData changes
      },
    },
  },
  methods: {
    closeForm() {
      this.$emit('close');
    },
    async submitForm() {
      try {
        const baseUrl = process.env.VUE_APP_API_BASE_URL
        // Call API to update account using stored procedure
        const response = await axios.put(`${baseUrl}/api/accounts/${this.formData.id}`, {
          name: this.formData.name,
          email: this.formData.email,
          status: this.formData.status,
          department: this.formData.department,
          mobile_no: this.formData.mobile_no,
        });

        console.log('Account updated successfully:', response.data);
        // Emit event after successful submission to refresh the table
        this.$emit('submit', this.formData);
        this.closeForm();
      } catch (error) {
        console.error('Error updating account:', error.response?.data || error.message);
      }
    },
  },
};
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-btn {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #0056b3;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
</style>
