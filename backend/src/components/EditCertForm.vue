<template>
  <div class="edit-cert-form">
    <div class="form-header">
      <h3>Edit Certification</h3>
      <button class="close-btn" @click="closeForm">✕</button>
    </div>
    <form @submit.prevent="submitForm">
      <!-- Hidden field to store the cert number -->
      <input type="hidden" v-model="formData.certNumber" />

      <div class="form-group">
        <label for="certificateType">Certificate Type</label>
        <select id="certificateType" v-model="formData.certificateType" required>
          <option disabled value="">Select a certificate type</option>
          <option v-for="option in certificateOptions" :key="option" :value="option">{{ option }}</option>
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
        <input type="text" id="testRange" v-model="formData.testRange" />
      </div>

      <div class="form-group">
        <label for="calibratedBy">Calibrated By</label>
        <input type="text" id="calibratedBy" v-model="formData.calibratedBy" />
      </div>

      <!-- Display the previously chosen certificate number -->
      <div class="form-group">
        <label for="generatedCert">Generated Certificate Number</label>
        <input type="text" id="generatedCert" v-model="generatedCert" readonly placeholder="Generated Certificate Number" />
      </div>

      <button type="submit" class="submit-btn">Save Changes</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'EditCertForm',
  props: {
    certData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      formData: {
        certNumber: '',
        certificateType: '',
        jobNumber: '',
        customerName: '',
        serialNumber: '',
        brandName: '',
        modelNumber: '',
        testRange: '',
        calibratedBy: '',
      },
      certificateOptions: [
        'Singlas Electrical',
        'Singlas Temperature',
        'Singlas Pressure',
        'Electrical',
        'Temperature',
        'Pressure',
      ],
      generatedCert: '', // Holds the generated certificate number
    };
  },
  watch: {
    certData: {
      immediate: true,
      handler(newCertData) {
        if (newCertData) {
          this.formData = {
            certNumber: newCertData.cert_number,
            certificateType: newCertData.certificate_type,
            jobNumber: newCertData.job_number,
            customerName: newCertData.customer_name,
            serialNumber: newCertData.serial_number,
            brandName: newCertData.brand_name,
            modelNumber: newCertData.model_number,
            testRange: newCertData.test_range || '',
            calibratedBy: newCertData.calibrated_by || '',
          };
          this.generateCertificate(); // Generate the certificate number based on the existing cert data
        }
      },
    },
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
      try {
        const baseUrl = process.env.VUE_APP_API_BASE_URL;
        await axios.put(`${baseUrl}/api/certifications/${this.formData.certNumber}`, this.formData);
        this.$emit('submit', this.formData);
        this.closeForm();
      } catch (error) {
        console.error('Error updating certification:', error);
      }
    },
  },
};
</script>

<style scoped>
.edit-cert-form {
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
