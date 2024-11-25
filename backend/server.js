const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Create MySQL connection pool with connection management
const pool = mysql.createPool({
  host: 'database-1.cr4iuy8yuyzn.ap-southeast-1.rds.amazonaws.com', // or your database host if different
  user: 'admin',
  password: '1B2Lj1wbKAJJ5MSAxPAs',
  database: 'db',
  // host: 'localhost', 
  // user: 'root', 
  // password: '0493', 
  // database: 'unitest_cms', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// const db = mysql.createConnection({
//   host: 'database-1.cr4iuy8yuyzn.ap-southeast-1.rds.amazonaws.com', // or your database host if different
//   user: 'admin',
//   password: '1B2Lj1wbKAJJ5MSAxPAs',
//   database: 'db',
// });

// // API endpoint to update the void_status
// app.put('/api/:tableName/void/:cert_number', (req, res) => {
//   const { tableName, cert_number } = req.params;
//   const { void_status } = req.body; // We expect a field like { "void_status": "Voided" }

//   // Ensure the table name is valid and matches one of your allowed tables
//   const allowedTables = [
//     'Singlas_Electrical',
//     'Singlas_Temperature',
//     'Singlas_Pressure',
//     'Non_Singlas_Electrical',
//     'Non_Singlas_Temperature',
//     'Non_Singlas_Pressure'
//   ];

//   if (!allowedTables.includes(tableName)) {
//     return res.status(400).json({ message: 'Invalid table name' });
//   }

//   // Update the void_status field in the selected table
//   const query = `
//     UPDATE ?? 
//     SET void_status = ? 
//     WHERE cert_number = ?
//   `;
  
//   db.query(query, [tableName, void_status, cert_number], (err, result) => {
//     if (err) {
//       console.error('Error updating certification status:', err);
//       return res.status(500).json({ message: 'Error updating certification status' });
//     }

//     if (result.affectedRows > 0) {
//       return res.status(200).json({ message: 'Certification status updated successfully' });
//     } else {
//       return res.status(404).json({ message: 'Certification not found' });
//     }
//   });
// });


// Export order to excel
app.get('/api/export-orders', (req, res) => {
  const query = `
    SELECT
      o.order_id,
      o.customer_name,
      o.order_type,
      o.modified_date_time,
      o.status,
      o.job_number,
      o.po_number,
      om.model_id,
      om.brand_name,
      om.model_number,
      om.tag_number,
      om.serial_number,
      om.cert_number
    FROM orders o
    LEFT JOIN order_models om ON o.order_id = om.order_id;
  `;

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching order data:', err);
      return res.status(500).json({ message: 'Error fetching order data' });
    }
    res.json(results);
  });
});


// Helper function to map the certificate type to the actual database table name
function getTableName(certificateType) {
  switch (certificateType) {
    case 'Singlas Electrical':
      return 'Singlas_Electrical';
    case 'Singlas Temperature':
      return 'Singlas_Temperature';
    case 'Singlas Pressure':
      return 'Singlas_Pressure';
    case 'Electrical':
      return 'Non_Singlas_Electrical';
    case 'Temperature':
      return 'Non_Singlas_Temperature';
    case 'Pressure':
      return 'Non_Singlas_Pressure';
    default:
      throw new Error('Invalid certificate type');
  }
}
app.post('/api/certifications', async (req, res) => {
  const {
    certificateType,
    jobNumber,
    customerName,
    serialNumber,
    brandName,
    modelNumber,
    testRange = null, // Allow null if not provided
    calibratedBy = 'Ryan', // Default value if empty
    cert_number
  } = req.body;

  // Function to map certificate type to table name
  function getTableName(certificateType) {
    switch (certificateType) {
      case 'Singlas Electrical':
        return 'Singlas_Electrical';
      case 'Singlas Temperature':
        return 'Singlas_Temperature';
      case 'Singlas Pressure':
        return 'Singlas_Pressure';
      case 'Electrical':
        return 'Non_Singlas_Electrical';
      case 'Temperature':
        return 'Non_Singlas_Temperature';
      case 'Pressure':
        return 'Non_Singlas_Pressure';
      default:
        throw new Error('Invalid certificate type');
    }
  }

  let tableName;
  try {
    tableName = getTableName(certificateType); // Get the correct table name
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const query = `INSERT INTO ${tableName} (cert_number, job_number, customer_name, serial_number, brand_name, model_number, reading_range, calibrated_by, modified_date_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    
    // Use pool to perform the query
    pool.query(query, [cert_number, jobNumber, customerName, serialNumber, brandName, modelNumber, testRange, calibratedBy], (error, results) => {
      if (error) {
        console.error('Error inserting certification:', error);
        return res.status(500).json({ error: 'Failed to create certification' });
      }
      res.status(201).json({ message: 'Certification created successfully' });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
});

// // Insert a new certificate into the database based on certificate type
// app.post('/api/certifications', (req, res) => {
//   const { certificateType, cert_number, jobNumber, customerName, serialNumber, brandName, modelNumber, testRange, calibratedBy } = req.body;
  
//   // Replace spaces with underscores in the table name
//   const formattedTable = certificateType.replace(/\s/g, '_');
  
//   // Insert query based on certificate type
//   const query = `INSERT INTO ?? (cert_number, job_number, customer_name, serial_number, brand_name, model_number, reading_range, calibrated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
//   const values = [
//     formattedTable,
//     cert_number,
//     jobNumber,
//     customerName,
//     serialNumber,
//     brandName,
//     modelNumber,
//     testRange || null, // Allow null for testRange
//     calibratedBy || 'Ryan' // Allow null
//   ];
  
//   pool.query(query, values, (error, results) => {
//     if (error) {
//       return res.status(500).json({ error: `Failed to insert into ${formattedTable}.` });
//     }
//     res.json({ success: true, id: results.insertId });
//   });
// });

// Endpoint to fetch the latest certificate
app.get('/api/latest-certificate', async (req, res) => {
  const { tableName: certType } = req.query;
  const tableName = getTableName(certType); // Map to actual table name

  try {
    const query = `SELECT cert_number FROM ${mysql.escapeId(tableName)} ORDER BY id DESC LIMIT 1`;
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching the latest certificate:', error);
        return res.status(500).json({ error: 'Failed to retrieve latest certificate' });
      }

      const latestCert = results.length ? results[0].cert_number : null;
      res.json({ latestCert });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// // Endpoint to insert a new certification record
// app.post('/api/certifications', async (req, res) => {
//   const { certificateType, jobNumber, customerName, serialNumber, brandName, modelNumber, testRange, calibratedBy, cert_number } = req.body;
//   const tableName = getTableName(certificateType);

//   const query = `
//     INSERT INTO ${mysql.escapeId(tableName)} (cert_number, job_number, customer_name, serial_number, brand_name, model_number, reading_range, calibrated_by, modified_date_time)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
//   `;

//   pool.query(query, [cert_number, jobNumber, customerName, serialNumber, brandName, modelNumber, testRange, calibratedBy], (error, results) => {
//     if (error) {
//       console.error('Error inserting new certification:', error);
//       return res.status(500).json({ error: 'Failed to insert certification' });
//     }
//     res.json({ message: 'Certification inserted successfully', id: results.insertId });
//   });
// });

// route for cert table
// Define app.get routes for each table
app.get('/api/Singlas_Electrical', (req, res) => {
  pool.query('SELECT * FROM Singlas_Electrical ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching data from Singlas_Electrical:', error);
      res.status(500).json({ error: 'Failed to retrieve data from Singlas_Electrical' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/Singlas_Temperature', (req, res) => {
  pool.query('SELECT * FROM Singlas_Temperature ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching data from Singlas_Temperature:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/Singlas_Pressure', (req, res) => {
  pool.query('SELECT * FROM Singlas_Pressure ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching data from Singlas_Pressure:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/Non_Singlas_Electrical', (req, res) => {
  pool.query('SELECT * FROM Non_Singlas_Electrical ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching data from Non_Singlas_Electrical:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/Non_Singlas_Temperature', (req, res) => {
  pool.query('SELECT * FROM Non_Singlas_Temperature ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching data from Non_Singlas_Temperature:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    } else {
      res.json(results);
    }
  });
});

app.get('/api/Non_Singlas_Pressure', (req, res) => {
  pool.query('SELECT * FROM Non_Singlas_Pressure ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching data from Non_Singlas_Pressure:', error);
      res.status(500).json({ error: 'Failed to retrieve data' });
    } else {
      res.json(results);
    }
  });
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

    pool.query(insertUserQuery, [username, hashedPassword], (err, result) => {
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
  pool.query(query, (err, results) => {
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

  pool.query(userQuery, [username], (err, results) => {
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


// Insert into `emails` table and update `orders` status
app.post('/api/emails', (req, res) => {
  const { job_no, po_no, customer_name, cal_date, due_date, to_email_date } = req.body;

  // Validate required fields
  if (!job_no || !customer_name || !cal_date || !due_date || !to_email_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Start transaction
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Begin transaction
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error('Error starting transaction:', err);
        return res.status(500).json({ error: 'Transaction error' });
      }

      // Insert query to `emails` table
      const insertEmailQuery = `INSERT INTO emails (job_no, po_no, customer_name, cal_date, due_date, to_email_date) VALUES (?, ?, ?, ?, ?, ?)`;

      connection.query(insertEmailQuery, [job_no, po_no, customer_name, cal_date, due_date, to_email_date], (err, result) => {
        if (err) {
          connection.rollback(() => connection.release());
          console.error('Error inserting email data:', err);
          return res.status(500).json({ error: 'Error inserting email data' });
        }

        // Update the `orders` table to change status to "Completed"
        const updateOrderStatusQuery = `UPDATE orders SET status = 'Completed' WHERE job_number = ?`;

        connection.query(updateOrderStatusQuery, [job_no], (err, updateResult) => {
          if (err) {
            connection.rollback(() => connection.release());
            console.error('Error updating order status:', err);
            return res.status(500).json({ error: 'Error updating order status' });
          }

          // Commit transaction
          connection.commit((err) => {
            if (err) {
              connection.rollback(() => connection.release());
              console.error('Error committing transaction:', err);
              return res.status(500).json({ error: 'Transaction commit error' });
            }

            // Release the connection back to the pool
            connection.release();

            // Respond with success message
            res.status(201).json({ message: 'Email record added and order status updated to "Completed" successfully' });
          });
        });
      });
    });
  });
});


// Update Order by ID
app.put('/api/orders/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const { customerName, salesPerson, orderType, addedModels } = req.body;

  console.log('Received request to update order:', orderId, customerName, salesPerson, orderType);

  // SQL queries to update the order and related models
  const updateOrderSql = `UPDATE orders SET customer_name = ?, sales_person = ?, order_type = ? WHERE order_id = ?`;
  const updateOrderData = [customerName, salesPerson, orderType, orderId];

  pool.query(updateOrderSql, updateOrderData, (err, results) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ message: 'Error updating order' });
    }

    // Update models in the database (assuming models are handled in a separate table)
    const deleteOldModelsSql = `DELETE FROM order_models WHERE order_id = ?`;
    pool.query(deleteOldModelsSql, [orderId], (err) => {
      if (err) {
        console.error('Error deleting old models:', err);
        return res.status(500).json({ message: 'Error deleting old models' });
      }

      // Insert the new models
      const insertModelsSql = `INSERT INTO order_models (order_id, brand_name, model_number, tag_number, serial_number, cert_number) VALUES ?`;
      const modelData = addedModels.map(model => [orderId, model.brand, model.modelNumber, model.tagNumber, model.serialNumber, model.certNumber]);

      pool.query(insertModelsSql, [modelData], (err) => {
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

  pool.query(orderQuery, [orderId], (err, orderResults) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).send('Error fetching order');
    }

    if (orderResults.length === 0) {
      return res.status(404).send('Order not found');
    }

    pool.query(modelQuery, [orderId], (err, modelResults) => {
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


// Route to delete an order by ID
app.delete('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;

  const sql = 'CALL DeleteOrderById(?)';

  pool.query(sql, [orderId], (err, results) => {
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
  
  pool.query(sql, (err, results) => {
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
  pool.query(sql, [certNumber], (err, results) => {
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

  pool.query(insertOrderQuery, [customerName, salesPerson, orderType, jobNumber, poNumber], (err, result) => {
    if (err) {
      console.error('Error inserting order:', err);
      return res.status(500).json({ error: 'Error inserting order' });
    }

    const orderId = result.insertId; // Get the newly created order ID

    // Insert into `order_models` table for each model, using the `order_id` from the `orders` table
    const insertModelQuery = `INSERT INTO order_models (order_id, brand_name, model_number, tag_number, serial_number, cert_number) VALUES (?, ?, ?, ?, ?, ?)`;

    // Loop through each model and insert them with the order_id
    addedModels.forEach((model) => {
      pool.query(insertModelQuery, [orderId, model.brand, model.modelNumber, model.tagNumber, model.serialNumber, model.certNumber], (err, result) => {
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

// Route to get sales persons (names) from the accounts table
app.get('/api/accounts-name', (req, res) => {
  const sql = 'SELECT id, name FROM accounts';
  
  pool.query(sql, (err, results) => {
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

  pool.query(sql, [brandName], (err, results) => {
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

  pool.query(sql, (err, results) => {
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
  
  pool.query(sql, (err, results) => {
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
  pool.query(sql, (err, results) => {
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
  pool.query(sql, [name, email, status, department, mobile], (err, results) => {
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
  pool.query(sql, (err, results) => {
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
  pool.query(sql, [companyName, uen, address, contactName, phoneNumber, contactEmail], (err, results) => {
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
  pool.query(sql, [customerId], (err, results) => {
    if (err) {
      console.error('Error deleting customer:', err);
      return res.status(500).send('Server error');
    }
    res.json({ message: 'Customer deleted successfully!' });
  });
});

// Route to update a customer by ID
// app.put('/api/customers/:id', (req, res) => {
//   console.log('Incoming customer data:', req.body);
//   const customerId = req.params.id;
//   const { companyName, uen, address, contactName, phoneNumber, email } = req.body;

//   // Validate all required fields are provided
//   if (!companyName || !address || !contactName || !email) {
//     return res.status(400).json({ error: 'Required fields are missing' });
//   }

//   const sql = 'CALL UpdateCustomer(?, ?, ?, ?, ?, ?, ?)';
//   pool.query(sql, [customerId, companyName, uen, address, contactName, phoneNumber, email], (err, results) => {
//     if (err) {
//       console.error('Error updating customer:', err);
//       return res.status(500).send('Server error');
//     }
//     res.json({ message: 'Customer updated successfully!' });
//   });
// });
app.put('/api/customers/:id', (req, res) => {
  console.log('Received body:', req.body);
  const customerId = req.params.id;
  const { company_name, uen, address, contact_name, phone_number, email } = req.body;

  // Validate all required fields are provided
  if (!company_name || !address || !contact_name || !email) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  const sql = 'CALL UpdateCustomer(?, ?, ?, ?, ?, ?, ?)';
  pool.query(sql, [customerId, company_name, uen, address, contact_name, phone_number, email], (err, results) => {
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

  pool.query(query, [accountId, name, email, status, department, mobile_no], (err, result) => {
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

  pool.query(query, (err, results) => {
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
  pool.query(sql, [name, description], (err, results) => {
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

  pool.query(sql, [productId], (err, results) => {
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
  pool.query(sql, [productId, name, description], (err, results) => {
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
  pool.query(sql, [accountId], (err, results) => {
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
  
  pool.query(sql, (err, results) => {
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
  pool.query(sql, [modelId], (err, results) => {
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
  pool.query(sql, [modelId, modelNumber, brandName, modifiedDateTime], (err, results) => {
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

  pool.query(sql, [modelNumber, brandName], (err, results) => {
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
  
  pool.query(sql, (err, results) => {
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
