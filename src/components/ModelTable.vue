<template>
  <section class="model-table">
    <table>
      <thead>
        <tr>
          <th>Model ID</th>
          <th>Model Number</th>
          <th>Brand Name</th>
          <th>Modified Date & Time</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(model, index) in paginatedModels" :key="model.model_id">
          <td>{{ model.model_id }}</td>
          <td>{{ model.model_number }}</td>
          <td>{{ model.brand_name }}</td>
          <td>{{ model.modified_date_time }}</td>
          <td>
            <div class="dropdown" :ref="`dropdown_${index}`">
              <button class="action-btn" @click="toggleDropdown(index)">...</button>
              <div v-if="dropdownVisible === index" class="dropdown-content">
                <a href="#" @click.prevent="editModel(model)">Edit</a>
                <a href="#" @click.prevent="deleteModel(model.model_id)">Delete</a>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="table-footer">
      <div class="total-items">
        Total {{ filteredModels.length }} items
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
  name: 'ModelTable',
  props: {
    searchQuery: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      models: [],
      currentPage: 1,
      itemsPerPage: 5,
      dropdownVisible: null, // To track which dropdown is visible
    };
  },
  computed: {
    filteredModels() {
      const lowercasedQuery = this.searchQuery.toLowerCase();
      return this.models.filter(model => {
        const modelNumber = model.model_number ? model.model_number.toLowerCase() : '';
        const brandName = model.brand_name ? model.brand_name.toLowerCase() : '';
        return modelNumber.includes(lowercasedQuery) || brandName.includes(lowercasedQuery);
      });
    },
    totalPages() {
      return Math.ceil(this.filteredModels.length / this.itemsPerPage);
    },
    paginatedModels() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredModels.slice(start, end);
    }
  },
  methods: {
    async fetchModels() {
      try {
        const response = await axios.get('http://localhost:3000/api/models');
        this.models = response.data;
      } catch (error) {
        console.error('Error fetching models:', error);
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
    editModel(model) {
      this.$emit('edit-model', model); // Emit the model data to the parent component
    },
    async deleteModel(modelId) {
      if (confirm('Are you sure you want to delete this model?')) {
        try {
          await axios.delete(`http://localhost:3000/api/models/${modelId}`);
          this.fetchModels(); // Refresh the list after deletion
        } catch (error) {
          console.error('Error deleting model:', error);
        }
      }
    }
  },
  mounted() {
    this.fetchModels(); // Fetch models when the component is mounted
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  }
};
</script>

<style scoped>
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
