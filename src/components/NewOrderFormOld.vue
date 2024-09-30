<template>
    <div class="new-order-form">
      <div class="form-header">
        <h3>Add New Order</h3>
        <button class="close-btn" @click="closeForm">✕</button>
      </div>
      <form @submit.prevent="submitForm">
        <!-- First Row -->
        <div class="form-row">
          <div class="form-group">
            <label for="customerName">Customer Name</label>
            <select id="customerName" v-model="formData.customerName" required>
              <option value="">Select Customer</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.name">
                {{ customer.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="brand">Brand</label>
            <select id="brand" v-model="formData.brand" required>
              <option value="">Select Brand</option>
              <option v-for="brand in brands" :key="brand.id" :value="brand.name">
                {{ brand.name }}
              </option>
            </select>
          </div>
          <div class="form-group model-group">
            <label for="modelNumber">Model Number</label>
            <div class="model-input">
              <select id="modelNumber" v-model="formData.modelNumber" required>
                <option value="">Select Model</option>
                <option v-for="model in models" :key="model.id" :value="model.name">
                  {{ model.name }}
                </option>
              </select>
              <button type="button" class="add-model-btn" @click="addModel">Add Model</button>
            </div>
          </div>
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
          <div class="form-group">
            <label for="reminderType">Reminder Type (Days)</label>
            <input type="number" id="reminderType" v-model="formData.reminderType" />
          </div>
          <div class="form-group">
            <label for="calibrationDueDate">Calibration Due Date</label>
            <input type="date" id="calibrationDueDate" v-model="formData.calibrationDueDate" required />
          </div>
        </div>
  
        <!-- Third Row -->
        <div class="form-row">
          <div class="form-group">
            <label for="lastCalibrationDate">Last Calibration Date</label>
            <input type="date" id="lastCalibrationDate" v-model="formData.lastCalibrationDate" required />
          </div>
          <div class="form-group">
            <label for="emailSendDate">Email to be sent 30 days before this date</label>
            <input type="date" id="emailSendDate" v-model="formData.emailSendDate" required />
          </div>
          <div class="form-group invisible-element">
            <!-- Invisible element to maintain the 33% width alignment -->
          </div>
        </div>
  
        <!-- Fourth Row -->
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
  export default {
    name: 'NewOrderForm',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        formData: {
          customerName: '',
          brand: '',
          modelNumber: '',
          salesPerson: '',
          orderType: '',
          reminderType: '',
          calibrationDueDate: '',
          lastCalibrationDate: '',
          emailSendDate: '',
          remark: '',
        },
        addedModels: [], // Array to store added models
        customers: [
          { id: 1, name: 'Customer A' },
          { id: 2, name: 'Customer B' },
        ],
        brands: [
          { id: 1, name: 'Brand A' },
          { id: 2, name: 'Brand B' },
        ],
        models: [
          { id: 1, name: 'Model 1' },
          { id: 2, name: 'Model 2' },
        ],
        salesPersons: [
          { id: 1, name: 'Sales Person A' },
          { id: 2, name: 'Sales Person B' },
        ],
      };
    },
    methods: {
      closeForm() {
        this.$emit('close');
      },
      submitForm() {
        // Validate that all serial numbers are filled in
        for (const model of this.addedModels) {
          if (!model.serialNumber) {
            alert('Please fill in all serial numbers before saving.');
            return; // Stop the form submission if any serial number is missing
          }
        }
        // If validation passes, emit the submit event with form data
        this.$emit('submit', { ...this.formData, addedModels: this.addedModels });
        this.closeForm();
      },
      addModel() {
        if (this.formData.brand && this.formData.modelNumber) {
          this.addedModels.push({
            brand: this.formData.brand,
            modelNumber: this.formData.modelNumber,
            tagNumber: '',
            serialNumber: '', // Initially empty, must be filled in later
          });
          // Do not reset brand and modelNumber to maintain their values
        } else {
          alert('Please select both a brand and a model number before adding.');
        }
      },
      deleteModel(index) {
        this.addedModels.splice(index, 1);
      },
    },
  };
  </script>
  
  <style scoped>
  .new-order-form {
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
  
  .invisible-element {
    flex: 1;
    visibility: hidden;
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
    align-self: flex-end;
    margin-top: 25px; /* Align the button with other fields */
  }
  
  .delete-model-btn:hover {
    background-color: #c82333;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    text-align: left;
  }
  
  input,
  select,
  textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  input[readonly] {
    background-color: #e9ecef;
  }
  
  textarea {
    resize: vertical;
  }
  
  .word-count {
    font-size: 12px;
    color: #6c757d;
    text-align: right;
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
  