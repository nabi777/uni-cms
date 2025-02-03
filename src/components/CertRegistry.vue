<template>
  <div class="cert-registry">
    <h1>Cert Registry</h1>

    <!-- Export to Excel Button (Top-right) -->
    <div class="export-button-container">
      <button @click="exportToExcel" class="export-btn">Export to Excel</button>
    </div>

    <!-- Button Container for Selecting Tables -->
    <div class="button-container">
      <button @click="loadTableData('Singlas_Electrical')">Singlas Electrical</button>
      <button @click="loadTableData('Singlas_Temperature')">Singlas Temperature</button>
      <button @click="loadTableData('Singlas_Pressure')">Singlas Pressure</button>
      <button @click="loadTableData('Non_Singlas_Electrical')">Non Singlas Electrical</button>
      <button @click="loadTableData('Non_Singlas_Temperature')">Non Singlas Temperature</button>
      <button @click="loadTableData('Non_Singlas_Pressure')">Non Singlas Pressure</button>
      
      <!-- New buttons for "Singlas On-site" and "Non Singlas On-Site" -->
      <button @click="loadTableData('Singlas_On_Site')" class="purple-btn">Singlas On-site</button>
      <button @click="loadTableData('Non_Singlas_On_Site')" class="purple-btn">Non Singlas On-Site</button>
    </div>

    <!-- Search Bar -->
    <SearchBar @search="handleSearch" />

    <!-- Dynamic Table Display with Pagination -->
    <div v-if="activeTable && paginatedEntries.length" class="model-table">
      <h2>{{ activeTable }}</h2>
      <table>
        <thead>
          <tr>
            <th>Cert Number</th>
            <th>Brand Name</th>
            <th>Model Number</th>
            <th>Reading Range</th>
            <th>Job Number</th>
            <th>Serial Number</th>
            <th>Customer Name</th>
            <th>Calibrated By</th>
            <th>Void Status</th>
            <th>Modified Date & Time</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in paginatedEntries" :key="entry.id">
            <td>{{ entry.cert_number }}</td>
            <td>{{ entry.brand_name }}</td>
            <td>{{ entry.model_number }}</td>
            <td>{{ entry.reading_range }}</td>
            <td>{{ entry.job_number }}</td>
            <td>{{ entry.serial_number }}</td>
            <td>{{ entry.customer_name }}</td>
            <td>{{ entry.calibrated_by }}</td>
            <td>{{ entry.void_status }}</td>
            <td>{{ entry.modified_date_time }}</td>
            <td>
              <!-- Buttons disabled for now -->
              <button @click="handleEdit(entry)" class="action-btn edit-btn" :disabled="true">
                Edit
              </button>
              <button @click="voidEntry(entry)" class="action-btn void-btn" :disabled="true">
                Void
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="table-footer">
        <div class="total-items">
          Total {{ filteredEntries.length }} items
        </div>
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">← Prev</button>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next →</button>
        </div>
      </div>
    </div>

    <div v-else-if="activeTable && !tableData.length" class="model-table">
      <h2>{{ activeTable }}</h2>
      <p>No data available for this table.</p>
    </div>
  </div>
</template>

<script>
import SearchBar from './SearchBar.vue';
import axios from 'axios';
import * as XLSX from 'xlsx';  // Import xlsx for Excel file generation

export default {
  name: 'CertRegistry',
  components: {
    SearchBar,
  },
  data() {
    return {
      baseUrl: process.env.VUE_APP_API_BASE_URL,
      activeTable: '',
      tableData: [],
      query: '',
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    filteredEntries() {
      return this.tableData.filter(entry =>
        Object.values(entry).some(value =>
          String(value).toLowerCase().includes(this.query.toLowerCase())
        )
      );
    },
    totalPages() {
      return Math.ceil(this.filteredEntries.length / this.itemsPerPage);
    },
    paginatedEntries() {
      if (this.filteredEntries.length) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredEntries.slice(start, end);
      }
      return [];
    },
  },
  methods: {
    handleSearch(query) {
      this.query = query;
      this.currentPage = 1;
    },
    async loadTableData(tableName) {
      // Log the click event immediately
      console.log(`Button clicked: ${tableName}`);

      // Set the session variable "cert_type" to the tableName
      sessionStorage.setItem('cert_type', tableName);
      console.log('cert_type set to:', tableName);

      // Update activeTable (display-friendly) and clear previous data
      this.activeTable = tableName.replace(/_/g, ' ');
      this.tableData = [];
      try {
        const response = await axios.get(`${this.baseUrl}/api/${tableName}`);
        this.tableData = response.data || [];
        this.currentPage = 1;
        console.log('Data loaded:', this.tableData);
      } catch (error) {
        console.error(`Error loading data from ${tableName}:`, error);
        this.tableData = [];
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    handleEdit(entry) {
      console.log('Attempting to emit edit event with entry:', entry);
      this.$emit('edit', entry); // Emit edit event with entry data
    },
    async voidEntry(entry) {
      if (confirm(`Are you sure you want to void this entry with Cert Number: ${entry.cert_number}?`)) {
        console.log(`Voiding entry with Cert Number: ${entry.cert_number}`);
      }
    },
    exportToExcel() {
      // Retrieve the cert_type from sessionStorage
      const certType = sessionStorage.getItem('cert_type');
      if (!certType) {
        console.error('No cert_type set. Please select a table first.');
        return;
      }
      
      // Build the API endpoint with cert_type as a query parameter.
      // Your backend should use this parameter to select the correct table
      // and join with the emails table where job_number = e.job_no.
      const exportEndpoint = `${this.baseUrl}/api/export?cert_type=${certType}`;
      
      axios.get(exportEndpoint)
        .then(response => {
          // Map the response data to the desired fields.
          // We expect response data to include the following fields:
          // id, cert_number, brand_name, model_number, reading_range, job_number,
          // serial_number, customer_name, calibrated_by, void_status, modified_date_time,
          // cal_date, due_date, to_email_date.
          const exportData = response.data.map(entry => ({
            id: entry.id,
            cert_number: entry.cert_number,
            brand_name: entry.brand_name,
            model_number: entry.model_number,
            reading_range: entry.reading_range,
            job_number: entry.job_number,
            serial_number: entry.serial_number,
            customer_name: entry.customer_name,
            calibrated_by: entry.calibrated_by,
            void_status: entry.void_status,
            modified_date_time: entry.modified_date_time,
            cal_date: entry.cal_date ? new Date(entry.cal_date).toLocaleDateString() : 'N/A',
            due_date: entry.due_date ? new Date(entry.due_date).toLocaleDateString() : 'N/A',
            to_email_date: entry.to_email_date ? new Date(entry.to_email_date).toLocaleDateString() : 'N/A'
          }));
          
          // Generate Excel File
          const ws = XLSX.utils.json_to_sheet(exportData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, certType);
          XLSX.writeFile(wb, `${certType}.xlsx`);
        })
        .catch(error => {
          console.error('Error exporting data:', error);
        });
    },
  },
};
</script>

<style scoped>
.cert-registry {
  padding: 20px;
}

.export-button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.export-btn {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.export-btn:hover {
  background-color: #218838;
}

.button-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.button-container button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button-container button:hover {
  background-color: #0056b3;
}

/* New button styles for the purple buttons */
.purple-btn {
  padding: 10px 20px;
  background-color: #800080;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.purple-btn:hover {
  background-color: #6a006a;
}

.model-table {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  padding: 10px;
  border: 1px solid #dee2e6;
}

thead th {
  background-color: #f8f9fa;
}

.action-btn {
  margin-right: 5px;
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.edit-btn {
  background-color: #007bff;
  color: white;
}

.void-btn {
  background-color: #dc3545;
  color: white;
}

.edit-btn:hover {
  background-color: #0056b3;
}

.void-btn:hover {
  background-color: #c82333;
}

.table-footer {
  display: flex;
  justify-content: space-between;
}

.total-items {
  color: #6c757d;
}

.pagination button {
  padding: 5px 10px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>
