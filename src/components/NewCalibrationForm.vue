<template>
    <div class="new-calibration-form">
      <div class="form-header">
        <h3>Submit Calibration Details</h3>
        <button class="close-btn" @click="closeForm">✕</button>
      </div>
      <form @submit.prevent="submitForm">
        <!-- Job Number (Display Only) -->
        <div class="form-group">
          <label for="jobNumber">Job Number</label>
          <input type="text" id="jobNumber" v-model="formData.job_no" readonly />
        </div>
  
        <!-- PO Number (Display Only) -->
        <div class="form-group">
          <label for="poNumber">PO Number</label>
          <input type="text" id="poNumber" v-model="formData.po_no" readonly />
        </div>
  
        <!-- Customer Name (Display Only) -->
        <div class="form-group">
          <label for="customerName">Customer Name</label>
          <input type="text" id="customerName" v-model="formData.customer_name" readonly />
        </div>
  
        <!-- Calibration Date -->
        <div class="form-group">
          <label for="calDate">Calibration Date</label>
          <input type="date" id="calDate" v-model="formData.cal_date" required />
        </div>
  
        <!-- Due Date -->
        <div class="form-group">
          <label for="dueDate">Due Date</label>
          <input type="date" id="dueDate" v-model="formData.due_date" required />
        </div>
  
        <!-- To Email Date -->
        <div class="form-group">
          <label for="toEmailDate">To Email Date</label>
          <input type="date" id="toEmailDate" v-model="formData.to_email_date" required />
        </div>
  
        <button type="submit" class="submit-btn">Submit</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'NewCalibrationForm',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      orderId: {
        type: Number,
        required: true,
      },
    },
    data() {
      return {
        formData: {
          job_no: '',
          po_no: '',
          customer_name: '',
          cal_date: '',
          due_date: '',
          to_email_date: '',
        },
      };
    },
    methods: {
      closeForm() {
        this.$emit('close');
      },
      // Fetch order details (job_no, po_no, customer_name) when component is mounted
      async fetchOrderDetails() {
        try {
          const response = await axios.get(`http://localhost:3000/api/orders/${this.orderId}`);
          const order = response.data.orderDetails;
          
          // Set the form fields based on the order details
          this.formData.job_no = order.job_number;
          this.formData.po_no = order.po_number;
          this.formData.customer_name = order.customer_name;
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      },
      async submitForm() {
        try {
          // Send a POST request to the API to insert the email data
          const response = await axios.post('http://localhost:3000/api/emails', {
            job_no: this.formData.job_no,
            po_no: this.formData.po_no,
            customer_name: this.formData.customer_name,
            cal_date: this.formData.cal_date,
            due_date: this.formData.due_date,
            to_email_date: this.formData.to_email_date,
          });
          
          console.log('Email record added successfully:', response.data);
          this.$emit('submit', this.formData); // Emit the form data to the parent component
          this.closeForm(); // Close the form after successful submission
        } catch (error) {
          console.error('Error adding email record:', error);
        }
      },
    },
    mounted() {
      this.fetchOrderDetails(); // Fetch the order details when the form is loaded
    },
  };
  </script>
  
  <style scoped>
  .new-calibration-form {
    padding: 20px;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    z-index: 1000;
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
  
  input {
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
  