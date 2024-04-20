const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./db');
const { hashPassword, verifyPassword } = require('./passwordUtils');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(cors());
const crypto = require('crypto');

const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
}

const JWT_SECRET = generateSecretKey();

// Signup endpoint
app.post('/signup', async (req, res) => {
    const { username, password, given_name, last_name, role_id } = req.body;
    try {
        const passwordHash = await hashPassword(password);

        const sql = 'INSERT INTO users (username, password_hash, given_name, last_name, role_id) VALUES (?, ?, ?, ?, ?)';
        connection.query(sql, [username, passwordHash, given_name, last_name, role_id], (err, results) => {
            if (err) {
                console.error('Error creating user:', err);
                res.status(500).json({ message: 'Error creating user' });
                return;
            }

            // Generate JWT token
            const token = jwt.sign({ username, role_id, user_id }, JWT_SECRET, { expiresIn: '1h' });

            // Return the token in the response
            res.status(201).json({ token });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ message: 'Error hashing password' });
    }
});

// Function to record the application in the database
const recordApplication = async (schoolId, userId) => {
    return new Promise((resolve, reject) => {
        // Insert the application into the school_applicants table
        const sql = 'INSERT INTO school_applicants (school_id, student_id) VALUES (?, ?)';
        connection.query(sql, [schoolId, userId], (err, results) => {
            if (err) {
                console.error('Error recording application:', err);
                reject(err);
            }
            resolve();
        });
    });
};

const getCountryIdByName = async (countryName) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT country_id FROM country WHERE country_name = ?';
        connection.query(sql, [countryName], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            if (results.length === 0) {
                reject('Country not found');
                return;
            }
            resolve(results[0].country_id);
        });
    });
};

const getTypeIdByName = async (type_name) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT type_id FROM schools_type WHERE type_name = ?';
        connection.query(sql, [type_name], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            if (results.length === 0) {
                reject('School type not found');
                return;
            }
            resolve(results[0].type_id);
        });
    });
};
// Modify the token generation logic for schools during signup and login
// Include the school_id in the payload
const generateSchoolToken = ({ abbreviation, school_name, school_id }) => {
    return jwt.sign({ abbreviation, school_name, school_id }, JWT_SECRET, { expiresIn: '1h' });
};

// Modify the login endpoint for schools to generate a token with the school_id
app.post('/loginSchool', async (req, res) => {
    const { abbreviation, password } = req.body;

    const sql = 'SELECT * FROM schools WHERE abbreviation = ?';
    connection.query(sql, [abbreviation], async (err, results) => {
        if (err) {
            console.error('Error finding school:', err);
            res.status(500).json({ message: 'Login failed' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ message: 'School not found' });
            return;
        }

        const school = results[0];
        try {
            const passwordMatch = await verifyPassword(password, school.password_hash);
            if (passwordMatch) {
                // Generate JWT token with school_id included in the payload
                const token = generateSchoolToken({
                    abbreviation: school.abbreviation,
                    school_name: school.school_name,
                    school_id: school.school_id
                });
                res.status(200).json({ message: 'Login successful', token });
            } else {
                res.status(401).json({ message: 'Invalid password' });
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            res.status(500).json({ message: 'Error verifying password' });
        }
    });
});

// Modify the signup endpoint for schools to generate a token with the school_id
app.post('/signupSchool', async (req, res) => {
    const { abbreviation, password, school_name, country_name, type_name } = req.body;
    try {
        // Get the country ID by name
        const country_id = await getCountryIdByName(country_name);
        const type_id = await getTypeIdByName(type_name);
        const passwordHash = await hashPassword(password);
        // Insert school data into the database
        const sql = 'INSERT INTO schools (abbreviation, password_hash, school_name, country_id, type_id) VALUES (?, ?, ?, ?, ?)';
        connection.query(sql, [abbreviation, passwordHash, school_name, country_id, type_id], (err, results) => {
            if (err) {
                console.error('Error creating school:', err);
                res.status(500).json({ message: 'Error creating school' });
                return;
            }
            // Fetch the inserted school's ID from the results
            const schoolId = results.insertId;
            // Generate JWT token with school_id included in the payload
            const token = generateSchoolToken({
                abbreviation,
                school_name,
                school_id: schoolId
            });
            res.status(201).json({ message: 'School created successfully', token });
        });
    } catch (error) {
        console.error('Error creating school:', error);
        res.status(500).json({ message: 'Error creating school' });
    }
});

// Login endpoint for users
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    connection.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Error finding user:', err);
            res.status(500).json({ message: 'Login failed' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const user = results[0];
        try {
            const passwordMatch = await verifyPassword(password, user.password_hash);
            if (passwordMatch) {
                // Generate JWT token
                const token = jwt.sign({ username: user.username, role_id: user.role_id, user_id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
                res.status(200).json({ message: 'Login successful', token });
            } else {
                res.status(401).json({ message: 'Invalid password' });
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            res.status(500).json({ message: 'Error verifying password' });
        }
    });
});


app.get('/countries', async (req, res) => {
    try {
      // Query the database to get the list of countries
      const query = 'SELECT country_name FROM country';
      connection.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching countries:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
        }
        // Extract country names from query results
        const countries = results.map(result => result.country_name);
        res.json(countries);
      });
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/school_types', async (req, res) => {
    try {
      // Query the database to get the list of school types
      const query = 'SELECT type_name FROM schools_type';
      connection.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching school types:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
        }
        // Extract type names from query results
        const schoolTypes = results.map(result => result.type_name);
        res.json(schoolTypes);
      });
    } catch (error) {
      console.error('Error fetching school types:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/schools', async (req, res) => {
    try {
        const query = 'SELECT * FROM schools';
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching schools:', err);
                res.status(500).json({ message: 'Internal server error' });
                return;
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/countries_all', async (req, res) => {
    try {
        // Query the database to get the list of countries
        const query = 'SELECT country_id, country_name FROM country';
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching countries:', err);
                res.status(500).json({ message: 'Internal server error' });
                return;
            }
            // Extract country data from query results
            const countries = results.map(result => ({
                country_id: result.country_id,
                country_name: result.country_name
            }));
            res.json(countries);
        });
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

  app.get('/school_types_all', async (req, res) => {
    try {
      // Query the database to get the list of school types
      const query = 'SELECT type_id, type_name FROM schools_type';
      connection.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching school types:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
        }
        // Send the query results as JSON response
        res.json(results);
      });
    } catch (error) {
      console.error('Error fetching school types:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const getCountryNameById = async (countryId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT country_name FROM country WHERE country_id = ?';
      connection.query(sql, [countryId], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        if (results.length === 0) {
          resolve(null);
          return;
        }
        resolve(results[0].country_name);
      });
    });
  };
  
  // Function to fetch type name by ID from the database
  const getTypeNameById = async (typeId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT type_name FROM schools_type WHERE type_id = ?';
      connection.query(sql, [typeId], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        if (results.length === 0) {
          reject({ error: 'Type not found', typeId: typeId }); // Reject with error message and type ID
          return;
        }
        resolve(results[0].type_name);
      });
    });
  };

  app.get('/countries/:id', async (req, res) => {
    const countryId = req.params.id;

    try {
        const country = await getCountryNameById(countryId);

        if (country) {
            res.status(200).json({ country });
        } else {
            res.status(404).json({ error: 'Country not found' });
        }
    } catch (error) {
        console.error('Error fetching country name:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.get('/school_types/:id', async (req, res) => {
    const typeId = req.params.id;

    try {
        const type = await getTypeNameById(typeId);

        if (type) {
            res.status(200).json({ type });
        } else {
            res.status(404).json({ error: 'Type not found' });
        }
    } catch (error) {
        console.error('Error fetching type name:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});
// Function to fetch school information using the authenticated school's ID
const fetchSchoolInfo = async (schoolId) => {
    return new Promise((resolve, reject) => {
        // Query to fetch school information
        const sql = 'SELECT info FROM schools WHERE school_id = ?';
        connection.query(sql, [schoolId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                // Extract the info from the result
                const info = results.length > 0 ? results[0].info : '';
                resolve(info);
            }
        });
    });
};

// Modify the token verification middleware to extract school_id from the decoded token
const verifyTokenAndExtractSchoolId = (req, res, next) => {
    // Extract the JWT token from the request headers
    const token = req.headers.authorization;

    if (!token) {
        // If the token is missing, return an error response
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            // If the token is invalid, return an error response
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        // Extract the school ID from the decoded token
        const schoolId = decoded.school_id;

        // Attach the school ID to the request object for further use
        req.schoolId = schoolId;

        // Call the next middleware function
        next();
    });
};

// Modify the /school/info endpoint to allow authenticated access
app.get('/school/info', verifyTokenAndExtractSchoolId, async (req, res) => {
    try {
        // Get the school ID from the request object
        const schoolId = req.schoolId;
        
        // Fetch school information using the authenticated school's ID
        const info = await fetchSchoolInfo(schoolId);
        res.status(200).json({ info });
    } catch (error) {
        console.error('Error fetching school info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Modify the /school/info endpoint to allow authenticated access
app.post('/school/info', verifyTokenAndExtractSchoolId, async (req, res) => {
    try {
        // Get the school ID from the request object
        const schoolId = req.schoolId;

        // Extract the info from the request body
        const { info } = req.body;

        // Update the school info
        await updateSchoolInfo(schoolId, info);

        // Send a success response
        res.status(200).json({ message: 'School information updated successfully' });
    } catch (error) {
        console.error('Error updating school info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const checkApplicationExists = async (schoolId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM school_applicants WHERE school_id = ? AND student_id = ?';
        connection.query(sql, [schoolId, userId], (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            // If there are any results, it means the application exists
            if (results.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};
const verifyToken = (req, res, next) => {
    // Extract the JWT token from the request headers
    const token = req.headers.authorization;
  
    if (!token) {
      // If the token is missing, return an error response
      return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }
  
    // Verify the token
    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
      if (err) {
        // If the token is invalid, return an error response
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
  
      // Attach the decoded token payload to the request object for further use
      req.decodedToken = decoded;
  
      // Call the next middleware function
      next();
    });
  };
  
  // Apply the verifyToken middleware to relevant routes
  app.post('/apply', verifyToken, async (req, res) => {
    try {
        // Extract the school ID and user ID from the request body
        const { schoolId, userId } = req.body;

        // Check if the application already exists
        const applicationExists = await checkApplicationExists(schoolId, userId);
        if (applicationExists) {
            return res.status(400).json({ message: 'Application already exists' });
        }

        // Record the application in the database
        await recordApplication(schoolId, userId);

        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/school_applicants/:id', async (req, res) => {
    try {
        const schoolId = req.params.id; // Corrected access to route parameter
        
        // Query the database to retrieve applicants for the specified school
        const applicants = await connection.promise().query('SELECT * FROM school_applicants WHERE school_id = ?', [schoolId]);
    
        res.json(applicants[0]); // Return the applicants as JSON response
      } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ error: 'Failed to fetch applicants' }); // Return error response if fetching fails
      }
});

app.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Query to retrieve user details based on user_id
      const query = 'SELECT * FROM users WHERE user_id = ?';
  
      const user = await connection.promise().query(query, [userId]);
  
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(user[0]);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
