<template>
  <div :class="['form-container', { visible: visible }]">
    <div class="form-header">
      <h3>Edit Customer</h3>
      <button class="close-btn" @click="closeForm">✕</button>
    </div>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="companyName">Company Name</label>
        <input type="text" id="companyName" v-model="formData.company_name" required />
      </div>
      <div class="form-group">
        <label for="uen">UEN</label>
        <input type="text" id="uen" v-model="formData.UEN" />
      </div>
      <div class="form-group">
        <label for="address">Address</label>
        <input type="text" id="address" v-model="formData.address" required />
      </div>
      <div class="form-group">
        <label for="contactName">Contact Name</label>
        <input type="text" id="contactName" v-model="formData.contact_name" required />
      </div>
      <div class="form-group">
        <label for="phoneNumber">Phone Number</label>
        <input type="text" id="phoneNumber" v-model="formData.phone_number" />
      </div>
      <div class="form-group">
        <label for="contactEmail">Contact Email</label>
        <input type="email" id="contactEmail" v-model="formData.email" required />
      </div>
      <button type="submit" class="submit-btn">Save Changes</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditCustomerForm',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    customerData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      formData: { ...this.customerData },
    };
  },
  methods: {
    closeForm() {
      this.$emit('close');
    },
    async submitForm() {
      try {
        // API call to update customer data
        const response = await axios.put(`http://localhost:3000/api/customers/${this.formData.id}`, this.formData);
        console.log('Customer updated successfully:', response.data);

        // Emit the form data after successful submission
        this.$emit('submit', this.formData);
        this.closeForm();
      } catch (error) {
        console.error('Error updating customer:', error.response?.data || error.message);
      }
    },
  },
};
</script>

<style src="@/assets/css/form-styles.css"></style>
