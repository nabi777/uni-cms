const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

// insert new user
const saltRounds = 10; // Define saltRounds for bcrypt hashing

// API to create a new user
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Hash the password before storing it
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    // Insert user into the `users` table
    const insertUserQuery = `INSERT INTO users (username, password) VALUES (?, ?)`;

    db.query(insertUserQuery, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ error: 'Error inserting user' });
      }

      res.status(201).json({ message: 'User created successfully' });
    });
  });
});


// get users
app.get('/api/users', (req, res) => {
  const query = 'SELECT id, username FROM users'; // Fetch only id and username
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching users' });
    }
    res.status(200).json(results);
  });
});

// User login
const SECRET_KEY = 'your_secret_key';

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Query to fetch the user by username
  const userQuery = `SELECT * FROM users WHERE username = ?`;

  db.query(userQuery, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Incorrect credentials' });
    }

    const user = results[0];

    // Compare the entered password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing passwords' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect credentials' });
      }

      // Password matched, generate a JWT token
      const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, {
        expiresIn: '1h',
      });

      res.json({ message: 'Login successful', token });
    });
  });
});


// Insert into `emails` table
app.post('/api/emails', (req, res) => {
  const { job_no, po_no, customer_name, cal_date, due_date, to_email_date } = req.body;

  // Validate required fields
  if (!job_no || !customer_name || !cal_date || !due_date || !to_email_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Insert query to `emails` table
  const insertEmailQuery = `INSERT INTO emails (job_no, po_no, customer_name, cal_date, due_date, to_email_date) VALUES (?, ?, ?, ?, ?, ?)`;

  // Execute the query
  db.query(insertEmailQuery, [job_no, po_no, customer_name, cal_date, due_date, to_email_date], (err, result) => {
    if (err) {
      console.error('Error inserting email data:', err);
      return res.status(500).json({ error: 'Error inserting email data' });
    }

    // Respond with success message
    res.status(201).json({ message: 'Email record added successfully' });
  });
});

// Update Order by ID
app.put('/api/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const { customerName, salesPerson, orderType, addedModels } = req.body;

  // SQL queries to update the order and related models
  const updateOrderSql = `UPDATE orders SET customer_name = ?, sales_person = ?, order_type = ? WHERE order_id = ?`;
  const updateOrderData = [customerName, salesPerson, orderType, orderId];

  db.query(updateOrderSql, updateOrderData, (err, results) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ message: 'Error updating order' });
    }

    // Update models in the database (assuming models are handled in a separate table)
    const deleteOldModelsSql = `DELETE FROM order_models WHERE order_id = ?`;
    db.query(deleteOldModelsSql, [orderId], (err) => {
      if (err) {
        console.error('Error deleting old models:', err);
        return res.status(500).json({ message: 'Error deleting old models' });
      }

      // Insert the new models
      const insertModelsSql = `INSERT INTO order_models (order_id, brand_name, model_number, tag_number, serial_number, cert_number) VALUES ?`;
      const modelData = addedModels.map(model => [orderId, model.brand, model.modelNumber, model.tagNumber, model.serialNumber, model.certNumber]);

      db.query(insertModelsSql, [modelData], (err) => {
        if (err) {
          console.error('Error inserting models:', err);
          return res.status(500).json({ message: 'Error inserting models' });
        }

        // Respond with success
        res.json({ message: 'Order updated successfully' });
      });
    });
  });
});

// Get order by ID
app.get('/api/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;

  // Fetch the order with the corresponding `order_id`
  const orderQuery = `SELECT * FROM orders WHERE order_id = ?`;
  const modelQuery = `SELECT * FROM order_models WHERE order_id = ?`;

  db.query(orderQuery, [orderId], (err, orderResults) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).send('Error fetching order');
    }

    if (orderResults.length === 0) {
      return res.status(404).send('Order not found');
    }

    db.query(modelQuery, [orderId], (err, modelResults) => {
      if (err) {
        console.error('Error fetching models:', err);
        return res.status(500).send('Error fetching models');
      }

      // Log the models being fetched for debugging purposes
      console.log('Fetched models:', modelResults);

      // Send the order details with the associated models
      res.json({
        orderDetails: {
          ...orderResults[0],
          models: modelResults
        }
      });
    });
  });
});


// app.get('/api/orders/:orderId', (req, res) => {
//   const orderId = req.params.orderId;
//   const orderQuery = `SELECT * FROM orders WHERE order_id = ?`;
//   const modelQuery = `SELECT * FROM order_models WHERE order_id = ?`; // This should fetch associated models

//   db.query(orderQuery, [orderId], (err, orderResults) => {
//     if (err) {
//       return res.status(500).send('Error fetching order');
//     }
//     db.query(modelQuery, [orderId], (err, modelResults) => {
//       if (err) {
//         return res.status(500).send('Error fetching models');
//       }
//       // Send order details along with associated models
//       res.json({
//         orderDetails: {
//           ...orderResults[0],
//           models: modelResults // Include models in the response
//         }
//       });
//     });
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


// // Insert new order
app.post('/api/orders', (req, res) => {
  const { customerName, salesPerson, orderType, jobNumber, poNumber, addedModels } = req.body;

  // Validate required fields
  if (!customerName || !salesPerson || !orderType || !addedModels || addedModels.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Insert into `orders` table
  const insertOrderQuery = `INSERT INTO orders (customer_name, sales_person, order_type, job_number, po_number) VALUES (?, ?, ?, ?, ?)`;

  db.query(insertOrderQuery, [customerName, salesPerson, orderType, jobNumber, poNumber], (err, result) => {
    if (err) {
      console.error('Error inserting order:', err);
      return res.status(500).json({ error: 'Error inserting order' });
    }

    const orderId = result.insertId; // Get the newly created order ID

    // Insert into `order_models` table for each model, using the `order_id` from the `orders` table
    const insertModelQuery = `INSERT INTO order_models (order_id, brand_name, model_number, tag_number, serial_number, cert_number) VALUES (?, ?, ?, ?, ?, ?)`;

    // Loop through each model and insert them with the order_id
    addedModels.forEach((model) => {
      db.query(insertModelQuery, [orderId, model.brand, model.modelNumber, model.tagNumber, model.serialNumber, model.certNumber], (err, result) => {
        if (err) {
          console.error('Error inserting model:', err);
          return res.status(500).json({ error: 'Error inserting model' });
        }
      });
    });

    // Respond with success after all inserts are done
    res.status(201).json({ message: 'Order and models added successfully' });
  });
});


// app.post('/api/orders', (req, res) => {
//   const { customerName, salesPerson, orderType, jobNumber, poNumber, addedModels } = req.body;

//   // Validate required fields
//   if (!customerName || !salesPerson || !orderType || !jobNumber || !poNumber || !addedModels || addedModels.length === 0) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   // Check if the job_number already exists to avoid duplicate entry
//   const checkJobNumberQuery = 'SELECT job_number FROM orders WHERE job_number = ?';
  
//   db.query(checkJobNumberQuery, [jobNumber], (err, result) => {
//     if (err) {
//       console.error('Error checking job number:', err);
//       return res.status(500).json({ error: 'Database error' });
//     }

//     if (result.length > 0) {
//       return res.status(400).json({ error: 'Job number already exists' });
//     }

//     // Insert into `orders` table
//     const insertOrderQuery = `INSERT INTO orders (customer_name, sales_person, order_type, job_number, po_number) VALUES (?, ?, ?, ?, ?)`;

//     db.query(insertOrderQuery, [customerName, salesPerson, orderType, jobNumber, poNumber], (err, result) => {
//       if (err) {
//         console.error('Error inserting order:', err);
//         return res.status(500).json({ error: 'Error inserting order' });
//       }

//       const orderId = result.insertId; // Get the newly created order ID

//       // Insert into `order_models` table for each model, using the `job_number` from the `orders` table
//       const insertModelQuery = `INSERT INTO order_models (job_number, brand_name, model_number, tag_number, serial_number, cert_number) VALUES (?, ?, ?, ?, ?, ?)`;

//       // Loop through each model and insert them
//       addedModels.forEach((model) => {
//         db.query(insertModelQuery, [jobNumber, model.brand, model.modelNumber, model.tagNumber, model.serialNumber, model.certNumber], (err, result) => {
//           if (err) {
//             console.error('Error inserting model:', err);
//             return res.status(500).json({ error: 'Error inserting model' });
//           }
//         });
//       });

//       // Respond with success after all inserts are done
//       res.status(201).json({ message: 'Order and models added successfully' });
//     });
//   });
// });

// app.post('/api/orders', (req, res) => {
//   const { customerName, salesPerson, orderType, addedModels } = req.body;

//   // Validate required fields
//   if (!customerName || !salesPerson || !orderType || !addedModels || addedModels.length === 0) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   // Insert into `orders` table
//   const insertOrderQuery = `INSERT INTO orders (customer_name, sales_person, order_type) VALUES (?, ?, ?)`;

//   db.query(insertOrderQuery, [customerName, salesPerson, orderType], (err, result) => {
//     if (err) {
//       console.error('Error inserting order:', err);
//       return res.status(500).json({ error: 'Error inserting order' });
//     }

//     const orderId = result.insertId; // Get the newly created order ID

//     // Insert into `order_models` table for each model
//     const insertModelQuery = `INSERT INTO order_models (order_id, brand_name, model_number, tag_number, serial_number, cert_number) VALUES (?, ?, ?, ?, ?, ?)`;

//     // Loop through each model and insert them
//     addedModels.forEach((model) => {
//       db.query(insertModelQuery, [orderId, model.brand, model.modelNumber, model.tagNumber, model.serialNumber, model.certNumber], (err, result) => {
//         if (err) {
//           console.error('Error inserting model:', err);
//           return res.status(500).json({ error: 'Error inserting model' });
//         }
//       });
//     });

//     // Send success response after all models are inserted
//     res.json({ message: 'Order and models added successfully' });
//   });
// });


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
