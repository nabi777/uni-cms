<template>
  <div class="edit-cert-form slide-in-right">
    <div class="form-header">
      <h3>Edit Certification</h3>
      <button class="close-btn" @click="closeForm">✕</button>
    </div>
    <form @submit.prevent="submitForm">
      <input type="hidden" v-model="formData.certNumber" />

      <div class="form-group" v-for="field in fields" :key="field.id">
        <label :for="field.id">{{ field.label }}</label>
        <input
          v-if="field.type === 'text'"
          :type="field.type"
          :id="field.id"
          v-model="formData[field.model]"
          :required="field.required"
        />
        <select v-else-if="field.type === 'select'" :id="field.id" v-model="formData[field.model]" required>
          <option disabled value="">Select a certificate type</option>
          <option v-for="option in certificateOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>

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
        'Singlas On-site',
        'Non Singlas On-Site',
      ],
      generatedCert: '',
      fields: [
        { id: 'certificateType', label: 'Certificate Type', model: 'certificateType', type: 'select', required: true },
        { id: 'jobNumber', label: 'Job Number', model: 'jobNumber', type: 'text', required: true },
        { id: 'customerName', label: 'Customer Name', model: 'customerName', type: 'text', required: true },
        { id: 'serialNumber', label: 'Serial Number', model: 'serialNumber', type: 'text', required: true },
        { id: 'brandName', label: 'Brand Name', model: 'brandName', type: 'text', required: true },
        { id: 'modelNumber', label: 'Model Number', model: 'modelNumber', type: 'text', required: true },
        { id: 'testRange', label: 'Test Range', model: 'testRange', type: 'text', required: false },
        { id: 'calibratedBy', label: 'Calibrated By', model: 'calibratedBy', type: 'text', required: false },
      ],
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
          this.generatedCert = newCertData.cert_number;
        }
      },
    },
  },
  methods: {
    closeForm() {
      this.$emit('close');
    },
    async submitForm() {
      try {
        const baseUrl = process.env.VUE_APP_API_BASE_URL;
        const payload = {
          ...this.formData,
          cert_number: this.generatedCert,
          tableName: this.formData.certificateType,
        };

        console.log('[EditCertForm] Base URL:', baseUrl);
        console.log('[EditCertForm] PUT Request:', {
          url: `${baseUrl}/api/certifications/${this.formData.certNumber}`,
          payload,
        });

        await axios.put(`${baseUrl}/api/certifications/${this.formData.certNumber}`, payload);
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
