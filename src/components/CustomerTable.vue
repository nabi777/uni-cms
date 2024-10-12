<template>
  <div class="customer-table">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Company Name</th>
          <th>UEN</th>
          <th>Address</th>
          <th>Contact Name</th>
          <th>Phone Number</th>
          <th>Email</th>
          <th>Modified Date & Time</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(customer, index) in paginatedCustomers" :key="customer.id">
          <td>{{ customer.id }}</td>
          <td>{{ customer.company_name }}</td>
          <td>{{ customer.UEN }}</td>
          <td>{{ customer.address }}</td>
          <td>{{ customer.contact_name }}</td>
          <td>{{ customer.phone_number }}</td>
          <td>{{ customer.email }}</td>
          <td>{{ customer.modified_date_time }}</td>
          <td>
            <div class="dropdown" :ref="`dropdown_${index}`">
              <button class="action-btn" @click="toggleDropdown(index)">...</button>
              <div v-if="dropdownVisible === index" class="dropdown-content">
                <a href="#" @click.prevent="editCustomer(customer)">Edit</a>
                <a href="#" @click.prevent="deleteCustomer(customer.id)">Delete</a>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="table-footer">
      <div class="total-items">
        Total {{ filteredCustomers.length }} items
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">← Prev</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next →</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CustomerTable',
  props: {
    searchQuery: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      customers: [],
      currentPage: 1,
      itemsPerPage: 5,
      dropdownVisible: null,
    };
  },
  computed: {
    filteredCustomers() {
      const lowercasedQuery = this.searchQuery.toLowerCase();
      return this.customers.filter((customer) => {
        return (
          customer.company_name.toLowerCase().includes(lowercasedQuery) ||
          (customer.UEN || '').toLowerCase().includes(lowercasedQuery) ||
          customer.address.toLowerCase().includes(lowercasedQuery) ||
          customer.contact_name.toLowerCase().includes(lowercasedQuery)
        );
      });
    },
    totalPages() {
      return Math.ceil(this.filteredCustomers.length / this.itemsPerPage);
    },
    paginatedCustomers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredCustomers.slice(start, end);
    },
  },
  methods: {
    async fetchCustomers() {
      try {
        const baseUrl = process.env.VUE_APP_API_BASE_URL
        const response = await axios.get(`${baseUrl}/api/customers`);
        this.customers = response.data;
        console.log(response.data); // Log the response to inspect the structure
      } catch (error) {
        console.error('Error fetching customers:', error);
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
    editCustomer(customer) {
      this.$emit('edit-customer', customer);
    },
    async deleteCustomer(customerId) {
      if (confirm('Are you sure you want to delete this customer?')) {
        try {
          const baseUrl = process.env.VUE_APP_API_BASE_URL
          await axios.delete(`${baseUrl}/api/customers/${customerId}`);
          this.fetchCustomers(); // Refresh the list after deletion
        } catch (error) {
          console.error('Error deleting customer:', error);
        }
      }
    },
  },
  mounted() {
    this.fetchCustomers(); // Fetch customers when the component is mounted
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  },
};
</script>

<style scoped>
.customer-table {
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

thead {
  background-color: #f8f9fa;
}

th, td {
  padding: 10px;
  border: 1px solid #dee2e6;
  text-align: left;
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
