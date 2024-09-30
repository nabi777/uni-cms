<template>
  <div class="new-product-form">
    <div class="form-header">
      <h3>New Product</h3>
      <button class="close-btn" @click="closeForm">✕</button>
    </div>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="productName">Product Name</label>
        <input type="text" id="productName" v-model="formData.productName" required />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" v-model="formData.description"></textarea>
      </div>
      <button type="submit" class="submit-btn">Create Product</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'NewProductForm',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {
        productName: '',
        description: '',
      },
    };
  },
  methods: {
    closeForm() {
      this.$emit('close');
    },
    async submitForm() {
      try {
        // Make an API call to create a new product
        const response = await axios.post('http://localhost:3000/api/products', {
          name: this.formData.productName,
          description: this.formData.description || null, // Optional field
        });

        console.log('Product added successfully:', response.data);
        // Emit the form data after successful submission
        this.$emit('submit', this.formData);
        this.closeForm();
      } catch (error) {
        console.error('Error adding product:', error.response?.data || error.message);
      }
    },
  },
};
</script>

<style src="@/assets/css/form-styles.css"></style>
