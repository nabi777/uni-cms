<template>
    <div class="search-bar-container">
      <input
        type="text"
        placeholder="Search"
        class="search-bar"
        v-model="query"
        @input="onSearch"
      />
    </div>
  </template>
  
  <script>
  export default {
    name: 'SearchBar',
    data() {
      return {
        query: ''
      };
    },
    methods: {
      onSearch() {
        this.$emit('search', this.query);
      }
    }
  };
  </script>
  
  <style scoped>
  .search-bar-container {
    margin-bottom: 20px;
    padding: 20px; /* Ensure padding matches the table's container */
    box-sizing: border-box; /* Ensure padding is included in width calculations */
    background-color: white; /* Match background with the table */
    border-radius: 8px; /* Match border-radius with the table */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Optional: Match shadow with the table */
  }
  
  .search-bar {
    width: 100%;
    padding: 10px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    box-sizing: border-box;
  }
  </style>
  