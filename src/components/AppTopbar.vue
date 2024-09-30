<template>
  <header class="top-bar">
    <h1>{{ title }}</h1>
    <div class="actions">
      <button class="btn btn-primary" @click="handleButtonClick">{{ buttonText }}</button>
      <button class="btn btn-secondary">Filter by</button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppTopbar',
  props: {
    title: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
  },
  methods: {
    handleButtonClick() {
      this.$emit('buttonClick');
    },
  },
};
</script>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f5f8fa;
  border-bottom: 1px solid #ddd;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary {
  background-color: #17a2b8;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}
</style>
