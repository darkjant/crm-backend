require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection configuration using a pool
const db = mysql.createPool({
    host: process.env.DB_HOST, // Use environment variable
    port: 3306, // Port stays the same
    user: process.env.DB_USER, // Use environment variable
    password: process.env.DB_PASSWORD, // Use environment variable
    database: process.env.DB_NAME, // Use environment variable
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the database successfully');
        connection.release(); // Release the connection back to the pool
    }
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Test route
app.get('/', (req, res) => {
    res.send('Backend is working!');
});

// Authentication route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Mock user verification
    if (username === 'admin' && password === 'password123') {
        const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
        return res.json({ token });
    }

    res.status(401).json({ error: 'Invalid credentials' });
});

// Route to fetch all clients (protected)
app.get('/clientes', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM u940753595_clientes';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching clients:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Add a new client with validation
app.post(
    '/clientes',
    [
        body('nombre').isString().notEmpty(),
        body('email').isEmail(),
        body('telefono').isMobilePhone(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, telefono, email, direccion } = req.body;
        const query = 'INSERT INTO u940753595_clientes (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)';
        db.query(query, [nombre, telefono, email, direccion], (err, results) => {
            if (err) {
                console.error('Error adding client:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Client added successfully', clientId: results.insertId });
        });
    }
);

// Update a client
app.put('/clientes/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, email, direccion } = req.body;
    const query = 'UPDATE u940753595_clientes SET nombre = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?';
    db.query(query, [nombre, telefono, email, direccion, id], (err) => {
        if (err) {
            console.error('Error updating client:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Client updated successfully' });
    });
});

// Delete a client
app.delete('/clientes/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM u940753595_clientes WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) {
            console.error('Error deleting client:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Client deleted successfully' });
    });
});

// Fetch all vehicles with pagination
app.get('/vehiculos', authenticateToken, (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM u940753595_vehiculos LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching vehicles:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Add a new vehicle
app.post('/vehiculos', authenticateToken, (req, res) => {
    const { cliente_id, marca, modelo, placas, motor, cilindros, anio } = req.body;
    const query = 'INSERT INTO u940753595_vehiculos (cliente_id, marca, modelo, placas, motor, cilindros, anio) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [cliente_id, marca, modelo, placas, motor, cilindros, anio], (err, results) => {
        if (err) {
            console.error('Error adding vehicle:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Vehicle added successfully', vehicleId: results.insertId });
    });
});

// Add a new appointment
app.post('/citas', authenticateToken, (req, res) => {
    const { cliente_id, vehiculo_id, fecha, hora, motivo } = req.body;
    const query = 'INSERT INTO u940753595_citas (cliente_id, vehiculo_id, fecha, hora, motivo) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [cliente_id, vehiculo_id, fecha, hora, motivo], (err, results) => {
        if (err) {
            console.error('Error adding appointment:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Appointment added successfully', appointmentId: results.insertId });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
