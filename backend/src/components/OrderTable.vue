<template>
  <div>
    <section class="order-table">
      <!-- Export Button at the top-right corner -->
      <div class="export-btn-container">
        <button @click="exportToExcel" class="export-btn">Export to Excel</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>
              Order ID
              <span class="sort-icon" @click="toggleSort">
                <span v-if="sortDirection === 'asc'">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
            <th>Customer Name</th>
            <th>Order Type</th>
            <th>Modified Date & Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(order, index) in paginatedOrders" :key="order.order_id">
            <td>{{ order.order_id }}</td>
            <td>{{ order.customer_name }}</td>
            <td>{{ order.order_type }}</td>
            <td>{{ order.modified_date_time }}</td>
            <td>{{ order.status || 'Pending' }}</td>
            <td>
              <div class="dropdown" :ref="`dropdown_${index}`">
                <button class="action-btn" @click="toggleDropdown(index)">...</button>
                <div v-if="dropdownVisible === index" class="dropdown-content">
                  <a href="#" @click.prevent="editOrder(order)">Edit</a>
                  <a href="#" @click.prevent="deleteOrder(order.order_id)">Delete</a>
                  <a href="#" @click.prevent="openCalibrationForm(order)">Submit</a>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="table-footer">
        <div class="total-items">
          Total {{ sortedOrders.length }} items
        </div>
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">← Prev</button>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next →</button>
        </div>
      </div>
    </section>

    <!-- New Calibration Form -->
    <NewCalibrationForm
      v-if="showCalibrationForm"
      :orderId="selectedOrderId"
      @close="closeCalibrationForm"
      @submit="handleCalibrationSubmit"
    />
  </div>
</template>

<script>
import axios from 'axios';
import * as XLSX from 'xlsx';
import NewCalibrationForm from './NewCalibrationForm.vue';

export default {
  name: 'OrderTable',
  components: {
    NewCalibrationForm,
  },
  props: {
    searchQuery: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      orders: [],
      currentPage: 1,
      itemsPerPage: 5,
      dropdownVisible: null,
      showCalibrationForm: false,
      selectedOrderId: null,
      sortDirection: 'desc', // Track sorting direction for Order ID
    };
  },
  computed: {
    sortedOrders() {
      // Sort the full list of filtered orders
      return [...this.filteredOrders].sort((a, b) => {
        if (this.sortDirection === 'asc') {
          return a.order_id - b.order_id;
        } else {
          return b.order_id - a.order_id;
        }
      });
    },
    filteredOrders() {
      const lowercasedQuery = this.searchQuery.toLowerCase();
      return this.orders.filter((order) => {
        return (
          order.customer_name.toLowerCase().includes(lowercasedQuery) ||
          order.order_type.toLowerCase().includes(lowercasedQuery)
        );
      });
    },
    totalPages() {
      return Math.ceil(this.sortedOrders.length / this.itemsPerPage);
    },
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedOrders.slice(start, end); // Apply pagination after sorting
    },
  },
  methods: {
    toggleSort() {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    },
    async fetchOrders() {
      try {
        const baseUrl = process.env.VUE_APP_API_BASE_URL;
        const response = await axios.get(`${baseUrl}/api/orders`);
        this.orders = response.data;
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    },
    exportToExcel() {
  axios
    .get(`${process.env.VUE_APP_API_BASE_URL}/api/export-orders`)
    .then((response) => {
      const exportData = response.data.map((entry) => ({
        'Order ID': entry.order_id,
        'Customer Name': entry.customer_name,
        'Order Type': entry.order_type,
        'Modified Date & Time': entry.modified_date_time,
        Status: entry.status || 'Pending',
        'Job Number': entry.job_number || 'N/A',
        'PO Number': entry.po_number || 'N/A',
        'Brand Name': entry.brand_name,
        'Model Number': entry.model_number,
        'Tag Number': entry.tag_number,
        'Serial Number': entry.serial_number,
        'Cert Number': entry.cert_number,
        'Calibration Date': entry.cal_date ? new Date(entry.cal_date).toLocaleDateString() : 'N/A',
        'Due Date': entry.due_date ? new Date(entry.due_date).toLocaleDateString() : 'N/A',
        'To Email Date': entry.to_email_date ? new Date(entry.to_email_date).toLocaleDateString() : 'N/A',
      }));

      // Generate Excel File
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Orders and Models');

      // Manually specify the file name
      const fileName = 'Orders_and_Models.xlsx';
      XLSX.writeFile(wb, fileName); // Ensures the file is saved with the correct name
    })
    .catch((error) => {
      console.error('Error exporting data:', error);
    });
},
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    toggleDropdown(index) {
      if (this.dropdownVisible === index) {
        this.closeDropdown();
      } else {
        this.dropdownVisible = index;
        document.addEventListener('click', this.handleOutsideClick);
      }
    },
    closeDropdown() {
      this.dropdownVisible = null;
      document.removeEventListener('click', this.handleOutsideClick);
    },
    handleOutsideClick(event) {
      const dropdown = this.$refs[`dropdown_${this.dropdownVisible}`][0];
      if (dropdown && !dropdown.contains(event.target)) {
        this.closeDropdown();
      }
    },
    editOrder(order) {
      this.$emit('edit-order', order);
    },
    openCalibrationForm(order) {
      this.selectedOrderId = order.order_id;
      this.showCalibrationForm = true;
    },
    closeCalibrationForm() {
      this.showCalibrationForm = false;
    },
    handleCalibrationSubmit(formData) {
      console.log('Submitted calibration details:', formData);
      this.showCalibrationForm = false;
    },
  },
  mounted() {
    this.fetchOrders();
  },
};
</script>

<style scoped>
.order-table {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.export-btn-container {
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

thead {
  background-color: #f8f9fa;
}

th,
td {
  padding: 10px;
  border: 1px solid #dee2e6;
  text-align: left;
}

.sort-icon {
  cursor: pointer;
  font-size: 16px;
  margin-left: 5px;
}

.sort-icon:hover {
  color: #007bff;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: block;
  position: absolute;
  right: 0;
  background-color: white;
  min-width: 100px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
}

.dropdown-content a {
  color: black;
  padding: 10px 15px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.total-items {
  font-size: 14px;
  color: #6c757d;
}

.pagination button {
  padding: 5px 10px;
  margin-left: 5px;
  border: none;
  background-color: #17a2b8;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>
