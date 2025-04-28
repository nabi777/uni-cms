<template>
    <div>
      <section class="order-table">
        <div class="export-btn-container">
          <button @click="exportToExcel" class="export-btn">Export to Excel</button>
        </div>
  
        <table>
          <thead>
            <tr>
              <th>
                Email ID
                <span class="sort-icon" @click="toggleSort">
                  <span v-if="sortDirection === 'asc'">▲</span>
                  <span v-else>▼</span>
                </span>
              </th>
              <th>Job No</th>
              <th>PO No</th>
              <th>Customer Name</th>
              <th>Calibration Date</th>
              <th>Due Date</th>
              <th>To Email Date</th>
              <th>Modified Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(email, index) in paginatedEmails" :key="email.email_id">
              <td>{{ email.email_id }}</td>
              <td>{{ email.job_no }}</td>
              <td>{{ email.po_no }}</td>
              <td>{{ email.customer_name }}</td>
              <td>{{ formatDate(email.cal_date) }}</td>
              <td>{{ formatDate(email.due_date) }}</td>
              <td>{{ formatDate(email.to_email_date) }}</td>
              <td>{{ email.modified_date_time }}</td>
              <td>
                <div class="dropdown" :ref="`dropdown_${index}`">
                  <button class="action-btn" @click="toggleDropdown(index)">...</button>
                  <div v-if="dropdownVisible === index" class="dropdown-content">
                    <a href="#" @click.prevent="editEmail(email)">Edit</a>
                    <a href="#" @click.prevent class="disabled-link">Delete</a>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
  
        <div class="table-footer">
          <div class="total-items">
            Total {{ sortedEmails.length }} items
          </div>
          <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">← Prev</button>
            <button @click="nextPage" :disabled="currentPage === totalPages">Next →</button>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import * as XLSX from 'xlsx';
  
  export default {
    name: 'OrderReminder',
    data() {
      return {
        emails: [],
        currentPage: 1,
        itemsPerPage: 5,
        dropdownVisible: null,
        sortDirection: 'desc',
      };
    },
    computed: {
      sortedEmails() {
        return [...this.emails].sort((a, b) => {
          if (this.sortDirection === 'asc') {
            return a.email_id - b.email_id;
          } else {
            return b.email_id - a.email_id;
          }
        });
      },
      totalPages() {
        return Math.ceil(this.sortedEmails.length / this.itemsPerPage);
      },
      paginatedEmails() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.sortedEmails.slice(start, end);
      },
    },
    methods: {
        async fetchEmails() {
        try {
            const baseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3001'; // Fallback localhost if env missing
            console.log(`${baseUrl}/api/emails`);
            const response = await axios.get(`${baseUrl}/api/emails`);
            if (response && response.data) {
            this.emails = response.data;
            } else {
            this.emails = [];
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            this.emails = []; // Clear emails on error
        }
        },
      formatDate(date) {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      },
      toggleSort() {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      },
      exportToExcel() {
        const exportData = this.emails.map((entry) => ({
          'Email ID': entry.email_id,
          'Job No': entry.job_no,
          'PO No': entry.po_no,
          'Customer Name': entry.customer_name,
          'Calibration Date': this.formatDate(entry.cal_date),
          'Due Date': this.formatDate(entry.due_date),
          'To Email Date': this.formatDate(entry.to_email_date),
          'Modified Date & Time': entry.modified_date_time,
        }));
  
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Emails');
        XLSX.writeFile(wb, 'Emails_Reminder.xlsx');
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
      editEmail(email) {
        this.$emit('edit-email', email);
      },
      deleteEmail(emailId) {
        if (confirm('Are you sure you want to delete this email reminder?')) {
          console.log('Deleting email reminder:', emailId);
          // Implement delete API here if needed
        }
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
    },
    mounted() {
      this.fetchEmails();
    },
  };
  </script>
  
  <style scoped>
  /* (SAME STYLE AS YOUR ORDER TABLE) */
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
  