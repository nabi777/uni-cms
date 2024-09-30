<template>
  <div class="edit-product-form">
    <div class="form-header">
      <h3>Edit Product</h3>
      <button class="close-btn" @click="closeForm">✕</button>
    </div>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="productName">Product Name</label>
        <input type="text" id="productName" v-model="formData.name" required />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" v-model="formData.description"></textarea>
      </div>
      <button type="submit" class="submit-btn">Save Changes</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditProductForm',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    productData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      formData: { ...this.productData },
    };
  },
  methods: {
    closeForm() {
      this.$emit('close');
    },
    async submitForm() {
      try {
        // Make an API call to update the product using the stored procedure
        const response = await axios.put(`http://localhost:3000/api/products/${this.formData.id}`, {
          name: this.formData.productName,
          description: this.formData.description,
        });

        // Log success message
        console.log('Product updated successfully:', response.data);

        // Emit the form data after successful submission
        this.$emit('submit', this.formData);
        this.closeForm();
      } catch (error) {
        console.error('Error updating product:', error.response?.data || error.message);
      }
    },
  },
};
</script>

<style scoped>
.edit-product-form {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
  transform: translateX(0);
  transition: transform 0.3s ease-in-out;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-btn {
  background-color: #17a2b8;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #138496;
}
</style>
