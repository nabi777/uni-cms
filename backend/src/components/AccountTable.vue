<template>
  <section class="account-table">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
          <th>Department</th>
          <th>Mobile No.</th>
          <th>Modified Date & Time</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(account, index) in paginatedAccounts" :key="account.id">
          <td>{{ account.id }}</td>
          <td>{{ account.name }}</td>
          <td>{{ account.email }}</td>
          <td>{{ account.status }}</td>
          <td>{{ account.department }}</td>
          <td>{{ account.mobile_no }}</td>
          <td>{{ account.modified_date_time }}</td>
          <td>
            <div class="dropdown" :ref="`dropdown_${index}`">
              <button class="action-btn" @click="toggleDropdown(index)">...</button>
              <div v-if="dropdownVisible === index" class="dropdown-content">
                <a href="#" @click.prevent="editAccount(account)">Edit</a>
                <a href="#" @click.prevent="deleteAccount(account.id)">Delete</a>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="table-footer">
      <div class="total-items">
        Total {{ filteredAccounts.length }} items
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
  name: 'AccountTable',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      accounts: [],
      currentPage: 1,
      itemsPerPage: 5,
      dropdownVisible: null, // To track which dropdown is visible
    };
  },
  computed: {
    filteredAccounts() {
      const lowercasedQuery = this.searchQuery.toLowerCase();
      return this.accounts.filter(account => {
        return (
          account.name.toLowerCase().includes(lowercasedQuery) ||
          account.email.toLowerCase().includes(lowercasedQuery)
        );
      });
    },
    totalPages() {
      return Math.ceil(this.filteredAccounts.length / this.itemsPerPage);
    },
    paginatedAccounts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredAccounts.slice(start, end);
    }
  },
  methods: {
    async fetchAccounts() {
      try {
        const baseUrl = process.env.VUE_APP_API_BASE_URL;
        const response = await axios.get(`${baseUrl}/api/accounts`);
        this.accounts = response.data;
      } catch (error) {
        console.error('Error fetching accounts:', error);
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
    editAccount(account) {
      this.$emit('edit-account', account); // Emit event to open the EditAccountForm with account data
    },
    async deleteAccount(accountId) {
      if (confirm('Are you sure you want to delete this account?')) {
        try {
          const baseUrl = process.env.VUE_APP_API_BASE_URL;
          await axios.delete(`${baseUrl}/api/accounts/${accountId}`);
          this.fetchAccounts(); // Re-fetch the accounts after deletion
        } catch (error) {
          console.error('Error deleting account:', error);
        }
      }
    }
  },
  mounted() {
    this.fetchAccounts(); // Fetch the accounts when the component is mounted
  }
};
</script>

<style scoped>
.account-table {
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
