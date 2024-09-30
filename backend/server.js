const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Set up the MySQL connection
const db = mysql.createConnection({
  host: 'localhost', // or your database host if different
  user: 'root',
  password: '0493',
  database: 'unitest_cms',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('MySQL Connected...');
});

// Get order by ID
app.get('/api/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const sql = `SELECT * FROM orders WHERE order_id = ?`;  // Replace with your actual SQL query
  const modelSql = `SELECT * FROM order_models WHERE order_id = ?`;  // Models associated with the order
  
  db.query(sql, [orderId], (err, orderResults) => {
    if (err) {
      console.error('Error fetching order:', err);
      res.status(500).send('Server error');
      return;
    }

    db.query(modelSql, [orderId], (err, modelResults) => {
      if (err) {
        console.error('Error fetching order models:', err);
        res.status(500).send('Server error');
        return;
      }

      res.json({
        orderDetails: orderResults[0],
        models: modelResults
      });
    });
  });
});

// //get order detail
// app.get('/api/orders/:orderId', (req, res) => {
//   const orderId = req.params.orderId;

//   console.log('Received orderId:', orderId);  // Log the orderId

//   const sql = `CALL GetOrderDetails(?)`; // Make sure the stored procedure exists and works properly
//   db.query(sql, [orderId], (err, results) => {
//     if (err) {
//       console.error('Error executing query:', err);
//       res.status(500).send('Server error');
//       return;
//     }
//     res.json({ orderDetails: results[0], models: results[1] }); // Assuming the stored procedure returns both order and models
//   });
// });



// Route to delete an order by ID
app.delete('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;

  const sql = 'CALL DeleteOrderById(?)';

  db.query(sql, [orderId], (err, results) => {
    if (err) {
      console.error('Error deleting order:', err);
      return res.status(500).send('Server error');
    }

    // Check if an order was actually deleted
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  });
});

//get all orders
app.get('/api/orders', (req, res) => {
  const sql = 'CALL GetAllOrders()'; // Make sure this stored procedure exists in the database
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err); // Log the error
      res.status(500).send('Server error');
      return;
    }
    res.json(results[0]); // Return the results
  });
});

// Check if cert number exists in order_models
app.post('/api/check-cert-number', (req, res) => {
  const { certNumber } = req.body;

  if (!certNumber) {
    return res.status(400).json({ error: 'Cert number is required' });
  }

  const sql = 'SELECT COUNT(*) AS count FROM order_models WHERE cert_number = ?';
  db.query(sql, [certNumber], (err, results) => {
    if (err) {
      console.error('Error checking cert number:', err);
      return res.status(500).send('Server error');
    }

    // If count is greater than 0, the cert number exists
    const exists = results[0].count > 0;
    res.json({ exists });
  });
});


// // Route to check if a serial number exists in the order_models table
// app.post('/api/check-serial-number', (req, res) => {
//   const { serialNumber } = req.body;

//   if (!serialNumber) {
//     return res.status(400).json({ error: 'Serial number is required' });
//   }

//   const sql = 'SELECT COUNT(*) AS count FROM order_models WHERE serial_number = ?';
//   db.query(sql, [serialNumber], (err, results) => {
//     if (err) {
//       console.error('Error checking serial number:', err);
//       return res.status(500).send('Server error');
//     }

//     // If count is greater than 0, the serial number exists
//     const exists = results[0].count > 0;
//     res.json({ exists });
//   });
// });


//insert new order
app.post('/api/orders', (req, res) => {
  const { customerName, salesPerson, orderType, addedModels } = req.body;

  // Validate required fields
  if (!customerName || !salesPerson || !orderType || !addedModels || addedModels.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Insert into `orders` table
  const insertOrderQuery = `INSERT INTO orders (customer_name, sales_person, order_type) VALUES (?, ?, ?)`;

  db.query(insertOrderQuery, [customerName, salesPerson, orderType], (err, result) => {
    if (err) {
      console.error('Error inserting order:', err);
      return res.status(500).json({ error: 'Error inserting order' });
    }

    const orderId = result.insertId; // Get the newly created order ID

    // Insert into `order_models` table for each model
    const insertModelQuery = `INSERT INTO order_models (order_id, brand_name, model_number, tag_number, serial_number, cert_number) VALUES (?, ?, ?, ?, ?, ?)`;

    // Loop through each model and insert them
    addedModels.forEach((model) => {
      db.query(insertModelQuery, [orderId, model.brand, model.modelNumber, model.tagNumber, model.serialNumber, model.certNumber], (err, result) => {
        if (err) {
          console.error('Error inserting model:', err);
          return res.status(500).json({ error: 'Error inserting model' });
        }
      });
    });

    // Send success response after all models are inserted
    res.json({ message: 'Order and models added successfully' });
  });
});


// Route to get sales persons (names) from the accounts table
app.get('/api/accounts-name', (req, res) => {
  const sql = 'SELECT id, name FROM accounts';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching sales persons:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results); // Send the sales persons (names) to the client
  });
});

// Route to get models by brand name
app.get('/api/models/:brandName', (req, res) => {
  const brandName = req.params.brandName;
  const sql = 'SELECT model_number FROM models WHERE brand_name = ?';

  db.query(sql, [brandName], (err, results) => {
    if (err) {
      console.error('Error fetching models:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results); // Send the models to the client
  });
});


// Route to get distinct brand names from the models table
app.get('/api/brands', (req, res) => {
  const sql = 'SELECT DISTINCT brand_name FROM models';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching brand names:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results); // Send the distinct brand names to the client
  });
});

// Route to get customer names from the customers table
app.get('/api/customer-names', (req, res) => {
  const sql = 'SELECT id, company_name FROM customers';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching customer names:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results); // Send the customer names to the client
  });
});


// Get all accounts
app.get('/api/accounts', (req, res) => {
  const sql = 'CALL GetAllAccounts()';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results[0]); // `results[0]` because stored procedures return an array
  });
});

// Insert a new account
app.post('/api/accounts', (req, res) => {
  const { name, email, status, department, mobile } = req.body;

  // Validate all fields are provided
  if (!name || !email || !status || !department || !mobile) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `CALL InsertNewAccount(?, ?, ?, ?, ?)`;
  db.query(sql, [name, email, status, department, mobile], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Server error');
    }

    // Send success response only after the database operation succeeds
    res.json({ message: 'Account added successfully!' });
  });
});

// Get all customers
app.get('/api/customers', (req, res) => {
  const sql = 'CALL GetAllCustomers()';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results[0]); // `results[0]` because stored procedures return an array
  });
});

// Insert a new customer
app.post('/api/customers', (req, res) => {
  const { companyName, uen, address, contactName, phoneNumber, contactEmail } = req.body;

  // Validate required fields
  if (!companyName || !address || !contactName || !contactEmail) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  const sql = `CALL InsertNewCustomer(?, ?, ?, ?, ?, ?)`;
  db.query(sql, [companyName, uen, address, contactName, phoneNumber, contactEmail], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send('Server error');
    }

    // Send success response only after the database operation succeeds
    res.json({ message: 'Customer added successfully!' });
  });
});

// Route to delete a customer by ID
app.delete('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;

  const sql = 'CALL DeleteCustomerById(?)';
  db.query(sql, [customerId], (err, results) => {
    if (err) {
      console.error('Error deleting customer:', err);
      return res.status(500).send('Server error');
    }
    res.json({ message: 'Customer deleted successfully!' });
  });
});

// Route to update a customer by ID
app.put('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const { companyName, uen, address, contactName, phoneNumber, email } = req.body;

  // Validate all required fields are provided
  if (!companyName || !address || !contactName || !email) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  const sql = 'CALL UpdateCustomer(?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [customerId, companyName, uen, address, contactName, phoneNumber, email], (err, results) => {
    if (err) {
      console.error('Error updating customer:', err);
      return res.status(500).send('Server error');
    }
    res.json({ message: 'Customer updated successfully!' });
  });
});

// Route to update an account by ID
app.put('/api/accounts/:id', (req, res) => {
  const accountId = req.params.id;
  const { name, email, status, department, mobile_no } = req.body;

  if (!name || !email || !status || !department || !mobile_no) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `CALL EditAccount(?, ?, ?, ?, ?, ?)`;

  db.query(query, [accountId, name, email, status, department, mobile_no], (err, result) => {
    if (err) {
      console.error('Error executing EditAccount procedure:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.json({ message: 'Account updated successfully' });
  });
});

// API route to get all products
app.get('/api/products', (req, res) => {
  const query = 'CALL GetAllProducts()'; // SQL query to call the stored procedure

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving products:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Send back the products
    res.json(results[0]); // Results from stored procedure
  });
});



// API route to add a new product
app.post('/api/products', (req, res) => {
  const { name, description } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const sql = 'CALL InsertNewProduct(?, ?)';
  db.query(sql, [name, description], (err, results) => {
    if (err) {
      console.error('Error inserting product:', err);
      return res.status(500).send('Server error');
    }

    // Send success response after the product is added
    res.json({ message: 'Product added successfully!' });
  });
});

// Route to delete a product by ID (New Route)
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id; // Get the product ID from the URL

  // Call the DeleteProduct stored procedure
  const sql = 'CALL DeleteProduct(?)';

  db.query(sql, [productId], (err, results) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).send('Server error');
    }
    res.json({ message: 'Product deleted successfully!' });
  });
});

// Update Product API Route
app.put('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const { name, description } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  // Call the stored procedure to update the product
  const sql = `CALL EditProduct(?, ?, ?)`;
  db.query(sql, [productId, name, description], (err, results) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    res.json({ message: 'Product updated successfully!' });
  });
});

app.delete('/api/accounts/:id', (req, res) => {
  const accountId = req.params.id; // Get account ID from request URL

  const sql = 'CALL DeleteAccountById(?)'; // Call stored procedure
  db.query(sql, [accountId], (err, results) => {
    if (err) {
      console.error('Error executing stored procedure:', err);
      return res.status(500).send('Server error');
    }

    // Check if an account was deleted
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  });
});

// Route to get all models sorted by modified date & time
app.get('/api/models', (req, res) => {
  const sql = 'CALL GetAllModels()';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching models:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results[0]); // `results[0]` because stored procedures return an array
  });
});

// Route to delete a model by ID
app.delete('/api/models/:id', (req, res) => {
  const modelId = req.params.id; // Get model ID from the URL

  const sql = 'CALL DeleteModelById(?)'; // SQL query to call the stored procedure
  db.query(sql, [modelId], (err, results) => {
    if (err) {
      console.error('Error deleting model:', err);
      return res.status(500).send('Server error');
    }

    // Check if any rows were affected (if the model was actually deleted)
    if (results.affectedRows === 0) {
      return res.status(404).send('Model not found');
    }

    res.json({ message: 'Model deleted successfully!' });
  });
});


// Update model API route
app.put('/api/models/:id', (req, res) => {
  const modelId = req.params.id; // Get the modelId from the route parameter
  const { modelNumber, brandName, modifiedDateTime } = req.body;

  if (!modelId || !modelNumber || !brandName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = 'CALL UpdateModel(?, ?, ?, ?)';
  db.query(sql, [modelId, modelNumber, brandName, modifiedDateTime], (err, results) => {
    if (err) {
      console.error('Error updating model:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Model updated successfully!' });
  });
});

app.post('/api/models', (req, res) => {
  const { modelNumber, brandName } = req.body;

  // Validate the required fields
  if (!modelNumber || !brandName) {
    return res.status(400).json({ error: 'Model number and brand name are required' });
  }

  // Call the stored procedure to add a new model
  const sql = `CALL AddNewModel(?, ?, NOW())`;

  db.query(sql, [modelNumber, brandName], (err, results) => {
    if (err) {
      console.error('Error executing AddNewModel procedure:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.json({ message: 'Model added successfully' });
  });
});


// Route to get distinct product names for the dropdown
app.get('/api/products', (req, res) => {
  const sql = 'SELECT DISTINCT name FROM products';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching product names:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
