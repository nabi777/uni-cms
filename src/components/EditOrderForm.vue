<template>
  <div class="edit-order-form" v-if="orderData">
    <div class="form-header">
      <h3>Edit Order - {{ orderData.order_id }}</h3>
      <button class="close-btn" @click="closeForm">✕</button>
    </div>
    <form @submit.prevent="submitForm">
      <!-- First Row -->
      <div class="form-row">
        <!-- Customer Name -->
        <div class="form-group">
          <label for="customerName">Customer Name</label>
          <select id="customerName" v-model="formData.customerName" required>
            <option value="">Select Customer</option>
            <option v-for="customer in customers" :key="customer.id" :value="customer.company_name">
              {{ customer.company_name }}
            </option>
          </select>
        </div>

        <!-- Brand -->
        <div class="form-group">
          <label for="brand">Brand</label>
          <select id="brand" v-model="formData.brand" @change="fetchModelNumbers" required>
            <option value="">Select Brand</option>
            <option v-for="brand in brands" :key="brand.brand_name" :value="brand.brand_name">
              {{ brand.brand_name }}
            </option>
          </select>
        </div>

        <!-- Model Number -->
        <div class="form-group model-group">
          <label for="modelNumber">Model Number</label>
          <div class="model-input">
            <select id="modelNumber" v-model="formData.modelNumber" required>
              <option value="">Select Model</option>
              <option v-for="model in models" :key="model.model_number" :value="model.model_number">
                {{ model.model_number }}
              </option>
            </select>
            <button type="button" class="add-model-btn" @click="addModel">Add Model</button>
          </div>
        </div>

        <!-- Sales Person -->
        <div class="form-group">
          <label for="salesPerson">Sales Person</label>
          <select id="salesPerson" v-model="formData.salesPerson" required>
            <option value="">Select Sales Person</option>
            <option v-for="salesPerson in salesPersons" :key="salesPerson.id" :value="salesPerson.name">
              {{ salesPerson.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Second Row -->
      <div class="form-row">
        <div class="form-group">
          <label for="orderType">Order Type</label>
          <select id="orderType" v-model="formData.orderType" required>
            <option value="Calibration">Calibration</option>
            <option value="Repair">Repair</option>
            <option value="Purchase">Purchase</option>
          </select>
        </div>

        <!-- Job Number -->
        <div class="form-group">
          <label for="jobNumber">Job Number</label>
          <input type="text" id="jobNumber" v-model="formData.jobNumber" placeholder="Enter Job Number" required />
        </div>

        <!-- PO Number -->
        <div class="form-group">
          <label for="poNumber">PO Number</label>
          <input type="text" id="poNumber" v-model="formData.poNumber" placeholder="Enter PO Number" required />
        </div>
      </div>

      <!-- Third Row -->
      <div class="form-row">
        <div class="form-group full-width">
          <label for="remark">Remark</label>
          <textarea id="remark" v-model="formData.remark" maxlength="500" rows="4" placeholder="Enter up to 500 words"></textarea>
          <div class="word-count">{{ 500 - formData.remark.length }} words remaining</div>
        </div>
      </div>

      <!-- Dynamic Model Rows -->
      <div v-for="(model, index) in addedModels" :key="index" class="form-row model-row">
        <div class="form-group">
          <label>Brand</label>
          <input type="text" v-model="model.brand" readonly />
        </div>
        <div class="form-group">
          <label>Model Number</label>
          <input type="text" v-model="model.modelNumber" readonly />
        </div>
        <div class="form-group">
          <label>Tag Number</label>
          <input type="text" v-model="model.tagNumber" placeholder="Optional" />
        </div>
        <div class="form-group">
          <label>Serial Number</label>
          <input type="text" v-model="model.serialNumber" />
        </div>
        <div class="form-group">
          <label>Cert Number</label>
          <input type="text" v-model="model.certNumber" />
        </div>
        <div class="form-group delete-group">
          <button type="button" class="delete-model-btn" @click="deleteModel(index)">Delete</button>
        </div>
      </div>

      <button type="submit" class="submit-btn">Save</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditOrderForm',
  props: {
    orderData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      formData: {
        customerName: '',
        brand: '',
        modelNumber: '',
        salesPerson: '',
        orderType: '',
        remark: '',
        jobNumber: '',  // New job number field
        poNumber: ''     // New PO number field
      },
      addedModels: [], // Models for the order
      customers: [],
      brands: [],
      models: [],
      salesPersons: []
    };
  },
  watch: {
    orderData: {
      immediate: true,
      handler(newOrderData) {
        this.populateOrderForm(newOrderData);
      }
    }
  },
  methods: {
    async populateOrderForm(orderData) {
      try {
        const response = await axios.get(`http://localhost:3000/api/orders/${orderData.order_id}`);
        const orderDetails = response.data.orderDetails;

        // Populate form data
        this.formData = {
          customerName: orderDetails.customer_name,
          brand: '',
          modelNumber: '',
          salesPerson: orderDetails.sales_person,
          orderType: orderDetails.order_type,
          remark: orderDetails.remark || '',
          jobNumber: orderDetails.job_number || '',  // Populate job number
          poNumber: orderDetails.po_number || ''     // Populate PO number
        };

        // Populate models
        if (orderDetails.models && orderDetails.models.length > 0) {
          this.addedModels = orderDetails.models.map(model => ({
            brand: model.brand_name,
            modelNumber: model.model_number,
            tagNumber: model.tag_number || '',
            serialNumber: model.serial_number || '',
            certNumber: model.cert_number || ''
          }));
        }

      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    },
    async fetchCustomers() {
      try {
        const response = await axios.get('http://localhost:3000/api/customer-names');
        this.customers = response.data;
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    },
    async fetchBrands() {
      try {
        const response = await axios.get('http://localhost:3000/api/brands');
        this.brands = response.data;
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    },
    async fetchModelNumbers() {
      if (this.formData.brand) {
        try {
          const response = await axios.get(`http://localhost:3000/api/models/${this.formData.brand}`);
          this.models = response.data;
        } catch (error) {
          console.error('Error fetching models:', error);
        }
      } else {
        this.models = [];
      }
    },
    async fetchSalesPersons() {
      try {
        const response = await axios.get('http://localhost:3000/api/accounts-name');
        this.salesPersons = response.data;
      } catch (error) {
        console.error('Error fetching sales persons:', error);
      }
    },
    closeForm() {
      this.$emit('close');
    },
    async submitForm() {
      try {
        if (this.addedModels.length === 0) {
          alert('Please add at least one model.');
          return;
        }

        const orderData = {
          customerName: this.formData.customerName,
          salesPerson: this.formData.salesPerson,
          orderType: this.formData.orderType,
          remark: this.formData.remark,
          jobNumber: this.formData.jobNumber,  // Include job number
          poNumber: this.formData.poNumber,    // Include PO number
          addedModels: this.addedModels
        };

        await axios.put(`http://localhost:3000/api/orders/${this.orderData.order_id}`, orderData);
        this.$emit('submit', this.formData);
        this.closeForm();
      } catch (error) {
        console.error('Error updating order:', error);
      }
    },
    addModel() {
      if (this.formData.brand && this.formData.modelNumber) {
        this.addedModels.push({
          brand: this.formData.brand,
          modelNumber: this.formData.modelNumber,
          tagNumber: '',
          serialNumber: '',
          certNumber: ''
        });
      } else {
        alert('Please select both a brand and a model number before adding.');
      }
    },
    deleteModel(index) {
      this.addedModels.splice(index, 1);
    }
  },
  mounted() {
    this.fetchCustomers();
    this.fetchBrands();
    this.fetchSalesPersons();
  }
};
</script>

<style scoped>
.edit-order-form {
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
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

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.model-row {
  align-items: center;
}

.form-group {
  flex: 1;
}

.model-group {
  display: flex;
  flex-direction: column;
}

.model-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.model-input select {
  flex: 1;
}

.add-model-btn {
  padding: 8px 12px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-model-btn:hover {
  background-color: #138496;
}

.delete-model-btn {
  padding: 8px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-model-btn:hover {
  background-color: #c82333;
}

.submit-btn {
  background-color: #17a2b8;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}

.submit-btn:hover {
  background-color: #138496;
}
</style>
