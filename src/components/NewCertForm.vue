<template>
    <div class="new-cert-form">
      <div class="form-header">
        <h3>New Certification</h3>
        <button class="close-btn" @click="closeForm">✕</button>
      </div>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="certificateType">Certificate Type</label>
          <select id="certificateType" v-model="formData.certificateType" required>
            <option disabled value="">Select a certificate type</option>
            <option value="Singlas Electrical">Singlas Electrical</option>
            <option value="Singlas Temperature">Singlas Temperature</option>
            <option value="Singlas Pressure">Singlas Pressure</option>
            <option value="Electrical">Electrical</option>
            <option value="Temperature">Temperature</option>
            <option value="Pressure">Pressure</option>
          </select>
        </div>
        <div class="form-group">
          <label for="jobNumber">Job Number</label>
          <input type="text" id="jobNumber" v-model="formData.jobNumber" required />
        </div>
        <div class="form-group">
          <label for="customerName">Customer Name</label>
          <input type="text" id="customerName" v-model="formData.customerName" required />
        </div>
        <div class="form-group">
          <label for="serialNumber">Serial Number</label>
          <input type="text" id="serialNumber" v-model="formData.serialNumber" required />
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
          <label for="testRange">Test Range</label>
          <input type="text" id="testRange" v-model="formData.testRange"  />
        </div>
        <div class="form-group">
          <label for="calibratedBy">Calibrated By</label>
          <input type="text" id="calibratedBy" v-model="formData.calibratedBy" />
        </div>
  
        <!-- Generate Certificate Button -->
        <button type="button" class="generate-btn" @click="generateCertificate">Generate Certificate</button>
  
        <!-- Generated Certificate Display (Read-Only) -->
        <div class="form-group">
          <input type="text" v-model="generatedCert" readonly placeholder="Generated Certificate Number" />
        </div>
  
        <!-- Submit Button -->
        <button type="submit" class="submit-btn">Insert Certificate</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'NewCertForm',
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        formData: {
          certificateType: '',
          jobNumber: '',
          customerName: '',
          serialNumber: '',
          brandName: '',
          modelNumber: '',
          testRange: '',
          calibratedBy: '',
        },
        generatedCert: '', // Holds the generated certificate number
      };
    },
    methods: {
      closeForm() {
        this.$emit('close');
      },
      async generateCertificate() {
        if (!this.formData.certificateType) {
          alert('Please select a certificate type first.');
          return;
        }
  
        try {
          const baseUrl = process.env.VUE_APP_API_BASE_URL;
          const response = await axios.get(`${baseUrl}/api/latest-certificate`, {
            params: { tableName: this.formData.certificateType },
          });
  
          const latestCert = response.data.latestCert;
  
          // Determine if the certificate type is Singlas by checking if it contains "Singlas" in the name
          const isSinglas = this.formData.certificateType.includes('Singlas');
  
          // Generate the new certificate number
          this.generatedCert = this.incrementCertNumber(latestCert, isSinglas);
        } catch (error) {
          console.error('Error generating certificate:', error);
        }
      },
      incrementCertNumber(cert, isSinglas) {
        // Determine the prefix based on whether it's Singlas or not
        const prefixEndIndex = isSinglas ? cert.lastIndexOf('S') + 1 : cert.lastIndexOf('-') + 1;
        const prefix = cert.slice(0, prefixEndIndex); // Extract prefix accordingly
        const numberPart = cert.slice(prefixEndIndex); // Extract the numeric part
        const currentNumber = parseInt(numberPart, 10);
        const newNumber = (currentNumber + 1).toString().padStart(numberPart.length, '0'); // Preserve leading zeros
  
        return `${prefix}${newNumber}`;
      },
      async submitForm() {
        if (!this.generatedCert) {
            alert("Please generate a certificate number first.");
            return;
        }

        try {
            const baseUrl = process.env.VUE_APP_API_BASE_URL;
            await axios.post(`${baseUrl}/api/certifications`, {
            ...this.formData,
            cert_number: this.generatedCert,
            testRange: this.formData.testRange || null,
            calibratedBy: this.formData.calibratedBy || null,
            });
            console.log("Certification created successfully");
            this.$emit('refresh'); // Emit refresh event to refresh CertRegistry
            this.closeForm();
        } catch (error) {
            console.error("Error creating certification:", error);
        }
        },
    },
  };
  </script>
  
  <style scoped>
  .new-cert-form {
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
    margin-bottom: 20px;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .generate-btn {
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  .generate-btn:hover {
    background-color: #218838;
  }
  
  .submit-btn {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .submit-btn:hover {
    background-color: #0056b3;
  }
  </style>
  