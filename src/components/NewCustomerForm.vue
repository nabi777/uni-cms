<template>
  <div class="new-customer-form">
    <div class="form-header">
      <h3>New Customer</h3>
      <button class="close-btn" @click="closeForm">✕</button>
    </div>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="companyName">Company Name</label>
        <input type="text" id="companyName" v-model="formData.companyName" required />
      </div>
      <div class="form-group">
        <label for="uen">UEN</label>
        <input type="text" id="uen" v-model="formData.uen" />
      </div>
      <div class="form-group">
        <label for="address">Address</label>
        <input type="text" id="address" v-model="formData.address" required />
      </div>
      <div class="form-group">
        <label for="contactName">Contact Name</label>
        <input type="text" id="contactName" v-model="formData.contactName" required />
      </div>
      <div class="form-group">
        <label for="phoneNumber">Phone Number</label>
        <input type="text" id="phoneNumber" v-model="formData.phoneNumber" />
      </div>
      <div class="form-group">
        <label for="contactEmail">Contact Email</label>
        <input type="email" id="contactEmail" v-model="formData.contactEmail" required />
      </div>
      <button type="submit" class="submit-btn">Create Customer</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'NewCustomerForm',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {
        companyName: '',
        uen: '',
        address: '',
        contactName: '',
        phoneNumber: '',
        contactEmail: '',
      },
    };
  },
  methods: {
    closeForm() {
      this.$emit('close');
    },
    async submitForm() {
      try {
        // Make a POST request to your server to call the InsertNewCustomer stored procedure
        const response = await axios.post('http://localhost:3000/api/customers', {
          companyName: this.formData.companyName,
          uen: this.formData.uen,
          address: this.formData.address,
          contactName: this.formData.contactName,
          phoneNumber: this.formData.phoneNumber,
          contactEmail: this.formData.contactEmail,
        });

        console.log('Customer added successfully:', response.data.message);
        this.$emit('submit', this.formData);
        this.closeForm();
      } catch (error) {
        console.error('There was an error inserting the customer:', error.response?.data || error.message);
      }
    },
  },
};
</script>

<style src="@/assets/css/form-styles.css"></style>
