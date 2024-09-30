<template>
  <div class="account-page">
    <AppSidebar @navigate="handleNavigation" />
    <div class="main-content">
      <AppTopbar
        :title="pageTitle"
        :buttonText="buttonText"
        @buttonClick="handleTopBarButtonClick"
      />
      <SearchBar
        v-if="showSearchBar && !isOrderFormVisible && !isEditOrderFormVisible && !isEditAccountFormVisible && !isEditCustomerFormVisible && !isEditProductFormVisible && !isEditModelFormVisible"
        @search="handleSearch"
      />
      <component
        v-if="!isOrderFormVisible && !isEditOrderFormVisible && !isEditAccountFormVisible && !isEditCustomerFormVisible && !isEditProductFormVisible && !isEditModelFormVisible"
        :is="currentComponent"
        :searchQuery="searchQuery"
        @edit-order="handleEditOrder"
        @edit-account="handleEditAccount"
        @edit-customer="handleEditCustomer"
        @edit-product="handleEditProduct"
        @edit-model="handleEditModel"
      />
      <NewOrderForm
        v-if="isOrderFormVisible && formType === 'order'"
        @close="closeForm"
        @submit="refreshOrderTable"
      />
      <EditOrderForm
        v-if="isEditOrderFormVisible"
        :orderData="editOrderData"
        @close="closeForm"
        @submit="updateOrder"
      />
      <EditAccountForm
        v-if="isEditAccountFormVisible"
        :accountData="editAccountData"
        @close="closeForm"
        @submit="updateAccount"
        class="side-form"
      />
      <EditCustomerForm
        v-if="isEditCustomerFormVisible"
        :customerData="editCustomerData"
        @close="closeForm"
        @submit="refreshCustomerTable"
        class="side-form"
      />
      <EditProductForm
        v-if="isEditProductFormVisible"
        :productData="editProductData"
        @close="closeForm"
        @submit="updateProduct"
        class="side-form"
      />
      <EditModelForm
        v-if="isEditModelFormVisible"
        :modelData="editModelData"
        @close="closeForm"
        @submit="updateModel"
        class="side-form"
      />
      <NewAccountForm
        v-if="isFormVisible && formType === 'account'"
        @close="closeForm"
        @submit="refreshAccountTable"
        class="side-form"
      />
      <NewCustomerForm
        v-if="isFormVisible && formType === 'customer'"
        @close="closeForm"
        @submit="refreshCustomerTable"
        class="side-form"
      />
      <NewProductForm
        v-if="isFormVisible && formType === 'product'"
        @close="closeForm"
        @submit="refreshProductTable"
        class="side-form"
      />
      <NewModelForm
        v-if="isFormVisible && formType === 'model'"
        @close="closeForm"
        @submit="refreshModelTable"
        class="side-form"
      />
    </div>
  </div>
</template>

<script>
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';
import SearchBar from './SearchBar.vue';
import AccountTable from './AccountTable.vue';
import CustomerTable from './CustomerTable.vue';
import ProductTable from './ProductTable.vue';
import ModelTable from './ModelTable.vue';
import OrderTable from './OrderTable.vue';
import NewOrderForm from './NewOrderForm.vue';
import EditOrderForm from './EditOrderForm.vue';
import EditAccountForm from './EditAccountForm.vue';
import EditCustomerForm from './EditCustomerForm.vue';
import EditProductForm from './EditProductForm.vue';
import EditModelForm from './EditModelForm.vue';
import NewAccountForm from './NewAccountForm.vue';
import NewCustomerForm from './NewCustomerForm.vue';
import NewProductForm from './NewProductForm.vue';
import NewModelForm from './NewModelForm.vue';

export default {
  name: 'AccountPage',
  components: {
    AppSidebar,
    AppTopbar,
    SearchBar,
    AccountTable,
    CustomerTable,
    ProductTable,
    ModelTable,
    OrderTable,
    NewOrderForm,
    EditOrderForm,
    EditAccountForm,
    EditCustomerForm,
    EditProductForm,
    EditModelForm,
    NewAccountForm,
    NewCustomerForm,
    NewProductForm,
    NewModelForm,
  },
  data() {
    return {
      searchQuery: '',
      isFormVisible: false,
      isOrderFormVisible: false,
      isEditOrderFormVisible: false,
      isEditAccountFormVisible: false,
      isEditCustomerFormVisible: false,
      isEditProductFormVisible: false,
      isEditModelFormVisible: false,
      showModelListForm: false,
      formType: '',
      pageTitle: 'Account Management',
      buttonText: 'Add New Account',
      currentComponent: 'AccountTable',
      showSearchBar: true,
      editOrderData: null,
      editAccountData: null,
      editCustomerData: null,
      editProductData: null,
      editModelData: null,
    };
  },
  methods: {
    handleSearch(query) {
      this.searchQuery = query;
    },
    handleNavigation(page) {
      this.closeAllForms();
      this.updatePageContent(page);
    },
    handleTopBarButtonClick() {
      this.closeAllForms();

      if (this.currentComponent === 'AccountTable') {
        this.formType = 'account';
        this.isFormVisible = true;
      } else if (this.currentComponent === 'CustomerTable') {
        this.formType = 'customer';
        this.isFormVisible = true;
      } else if (this.currentComponent === 'ProductTable') {
        this.formType = 'product';
        this.isFormVisible = true;
      } else if (this.currentComponent === 'ModelTable') {
        this.formType = 'model';
        this.isFormVisible = true;
      } else if (this.currentComponent === 'OrderTable') {
        this.formType = 'order';
        this.isOrderFormVisible = true;
        this.showSearchBar = false;
        this.showModelListForm = true;
      }
    },
    closeForm() {
      this.isFormVisible = false;
      this.isOrderFormVisible = false;
      this.isEditOrderFormVisible = false;
      this.isEditAccountFormVisible = false;
      this.isEditCustomerFormVisible = false;
      this.isEditProductFormVisible = false;
      this.isEditModelFormVisible = false;
      this.showSearchBar = true;
      this.showModelListForm = false;
    },
    handleEditOrder(orderData) {
      this.editOrderData = orderData;
      this.isEditOrderFormVisible = true;
      this.showSearchBar = false;
    },
    handleEditAccount(accountData) {
      this.editAccountData = accountData;
      this.isEditAccountFormVisible = true;
      this.showSearchBar = false;
    },
    handleEditCustomer(customerData) {
      this.editCustomerData = customerData;
      this.isEditCustomerFormVisible = true;
      this.showSearchBar = false;
    },
    handleAccountEdit() {
      this.refreshAccountTable(); // Refresh the account table after editing
      this.closeForm(); // Close the form after successful edit
    },
    handleEditProduct(productData) {
      this.editProductData = productData;
      this.isEditProductFormVisible = true;
      this.showSearchBar = false;
    },
    handleEditModel(modelData) {
      this.editModelData = modelData;
      this.isEditModelFormVisible = true;
      this.showSearchBar = false;
    },
    updateOrder() {
      this.isEditOrderFormVisible = false;
    },
    updateAccount() {
      this.isEditAccountFormVisible = false;
      this.showSearchBar = true; // Ensure the search bar reappears after editing an account
      this.refreshAccountTable();
    },
    updateCustomer() {
      this.isEditCustomerFormVisible = false;
      this.refreshCustomerTable();
    },
    updateProduct() {
      this.isEditProductFormVisible = false;
      this.showSearchBar = true; // Ensure the search bar reappears after editing a product
      this.refreshProductTable();
    },
    updateModel() {
      this.isEditModelFormVisible = false;
      this.showSearchBar = true; // Ensure the search bar reappears after editing a product
      this.refreshModelTable();
    },
    closeAllForms() {
      this.isFormVisible = false;
      this.isOrderFormVisible = false;
      this.isEditOrderFormVisible = false;
      this.isEditAccountFormVisible = false;
      this.isEditCustomerFormVisible = false;
      this.isEditProductFormVisible = false;
      this.isEditModelFormVisible = false;
      this.showSearchBar = true;
      this.showModelListForm = false;
    },
    updatePageContent(page) {
      this.closeAllForms();
      if (page === 'account') {
        this.pageTitle = 'Account Management';
        this.buttonText = 'Add New Account';
        this.currentComponent = 'AccountTable';
      } else if (page === 'customer-management') {
        this.pageTitle = 'Customer Management';
        this.buttonText = 'Add New Customer';
        this.currentComponent = 'CustomerTable';
      } else if (page === 'product-management') {
        this.pageTitle = 'Product Management';
        this.buttonText = 'Add New Product';
        this.currentComponent = 'ProductTable';
      } else if (page === 'model-management') {
        this.pageTitle = 'Model Management';
        this.buttonText = 'Add New Model';
        this.currentComponent = 'ModelTable';
      } else if (page === 'order-management') {
        this.pageTitle = 'Order Management';
        this.buttonText = 'Add New Order';
        this.currentComponent = 'OrderTable';
      } else {
        this.currentComponent = 'AccountTable';
      }
    },
    refreshAccountTable() {
      this.currentComponent = '';
      this.$nextTick(() => {
        this.currentComponent = 'AccountTable';
      });
    },
    refreshProductTable() {
      this.currentComponent = '';
      this.$nextTick(() => {
        this.currentComponent = 'ProductTable';
      });
    },
    refreshCustomerTable() {
      this.currentComponent = '';
      this.$nextTick(() => {
        this.currentComponent = 'CustomerTable';
      });
    },
    refreshModelTable() {
      this.currentComponent = '';
      this.$nextTick(() => {
        this.currentComponent = 'ModelTable';
      });
    },
  },
};
</script>

<style scoped>
.account-page {
  display: flex;
  height: 100vh;
}

.main-content {
  flex-grow: 1;
  margin-left: 200px;
  padding: 20px;
  background-color: #f5f8fa;
  overflow-y: auto;
}

.side-form {
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
</style>
