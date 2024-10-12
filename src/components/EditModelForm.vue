<template>
  <div class="edit-model-form">
    <div class="form-header">
      <h3>Edit Model</h3>
      <button class="close-btn" @click="closeForm">✕</button>
    </div>
    <form @submit.prevent="submitForm">
      <!-- Hidden field to store the model ID -->
      <input type="hidden" v-model="formData.modelId" />
      
      <div class="form-group">
        <label for="product">Product</label>
        <select id="product" v-model="formData.productName" required>
          <option disabled value="">Select a product</option>
          <option v-for="option in productOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="brandName">Brand Name</label>
        <input type="text" id="brandName" v-model="formData.brandName" required />
      </div>

      <div class="form-group">
        <label for="modelNumber">Model Number</label>
        <input type="text" id="modelNumber" v-model="formData.modelNumber" required />
      </div>

      <div class="form-group">
        <label for="modelDescription">Model Description</label>
        <textarea id="modelDescription" v-model="formData.modelDescription"></textarea>
      </div>

      <button type="submit" class="submit-btn">Save Changes</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditModelForm',
  props: {
    modelData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      formData: {
        modelId: '',
        productName: '',
        brandName: '',
        modelNumber: '',
        modelDescription: ''
      },
      productOptions: [], // Initially empty, will be populated from the API
    };
  },
  watch: {
    modelData: {
      immediate: true,
      handler(newModelData) {
        if (newModelData) {
          console.log('Model data received:', newModelData);
          this.formData = { 
            modelId: newModelData.model_id,
            productName: newModelData.product_name,
            brandName: newModelData.brand_name,
            modelNumber: newModelData.model_number,
            modelDescription: newModelData.model_description || '' // Ensure it's not undefined
          };
        }
      }
    }
  },
  methods: {
    async fetchProductOptions() {
      try {
        const baseUrl = process.env.VUE_APP_API_BASE_URL
        const response = await axios.get(`${baseUrl}/api/products`);
        this.productOptions = response.data.map(product => product.name); // Ensure product names are added to the dropdown
      } catch (error) {
        console.error('Error fetching product options:', error);
      }
    },
    closeForm() {
      this.$emit('close'); // Close the form when close button is clicked
    },
    async submitForm() {
      try {
        const baseUrl = process.env.VUE_APP_API_BASE_URL
        console.log('Model ID being updated:', this.formData.modelId);
        
        // Make the API call to update the model using the modelId
        const response = await axios.put(`${baseUrl}/api/models/${this.formData.modelId}`, this.formData);
        console.log('Model updated successfully:', response.data);

        this.$emit('submit', this.formData); 
        this.closeForm(); 
      } catch (error) {
        console.error('Error updating model:', error);
      }
    },
  },
  mounted() {
    this.fetchProductOptions(); // Fetch product options when the form is mounted
  }
};
</script>

<style scoped>
.edit-model-form {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 300px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.submit-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #138496;
}
</style>
