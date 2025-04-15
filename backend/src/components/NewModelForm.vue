  <template>
    <div class="new-model-form">
      <div class="form-header">
        <h3>New Model</h3>
        <button class="close-btn" @click="closeForm">✕</button>
      </div>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="product">Product</label>
          <select id="product" v-model="formData.productName" required>
            <option disabled value="">Select a product</option>
            <option v-for="product in productOptions" :key="product.id" :value="product.name">{{ product.name }}</option>
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
        <button type="submit" class="submit-btn">Create Model</button>
      </form>
    </div>
  </template>

  <script>
  import axios from 'axios';

  export default {
    name: 'NewModelForm',
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
          brandName: '',
          modelNumber: '',
          modelDescription: '',
        },
        productOptions: [], // Will hold the product names fetched from the product table
      };
    },
    methods: {
      async fetchProductOptions() {
        try {
          const baseUrl = process.env.VUE_APP_API_BASE_URL

          const response = await axios.get(`${baseUrl}/api/products`);
          this.productOptions = response.data; // Assuming the response is an array of products
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      },
      closeForm() {
        this.$emit('close');
      },
      async submitForm() {
        try {
          const baseUrl = process.env.VUE_APP_API_BASE_URL

          const response = await axios.post(`${baseUrl}/api/models`, {
            modelNumber: this.formData.modelNumber,
            brandName: this.formData.brandName,
            productName: this.formData.productName,
            modelDescription: this.formData.modelDescription || null,
          });
          console.log('Model added successfully:', response.data);
          this.$emit('submit', this.formData); // Emit the data to the parent component
          this.closeForm(); // Close the form after successful submission
        } catch (error) {
          console.error('Error adding model:', error);
        }
      },
    },
    mounted() {
      this.fetchProductOptions(); // Fetch the product options when the component is mounted
    },
  };
  </script>

  <style src="@/assets/css/form-styles.css"></style>
