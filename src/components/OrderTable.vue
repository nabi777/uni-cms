<template>
  <section class="order-table">
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
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
                <a href="#" @click.prevent="submitOrder(order)">Submit</a>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="table-footer">
      <div class="total-items">
        Total {{ filteredOrders.length }} items
      </div>
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">← Prev</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next →</button>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OrderTable',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      orders: [],
      currentPage: 1,
      itemsPerPage: 5,
      dropdownVisible: null,
    };
  },
  computed: {
    filteredOrders() {
      const lowercasedQuery = this.searchQuery.toLowerCase();
      return this.orders.filter(order => {
        return (
          order.customer_name.toLowerCase().includes(lowercasedQuery) ||
          order.order_type.toLowerCase().includes(lowercasedQuery)
        );
      });
    },
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    },
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredOrders.slice(start, end);
    }
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get('http://localhost:3000/api/orders');
        this.orders = response.data;
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    },
    async deleteOrder(orderId) {
      if (confirm(`Are you sure you want to delete order with ID: ${orderId}?`)) {
        try {
          await axios.delete(`http://localhost:3000/api/orders/${orderId}`);
          this.orders = this.orders.filter(order => order.order_id !== orderId);
        } catch (error) {
          console.error('Error deleting order:', error);
          alert('Failed to delete the order. Please try again.');
        }
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
    submitOrder(order) {
      alert(`Submitting order with ID: ${order.order_id}`);
      order.status = 'Submitted';
    }
  },
  mounted() {
    this.fetchOrders();
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  }
};
</script>

<style scoped>
.order-table {
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
