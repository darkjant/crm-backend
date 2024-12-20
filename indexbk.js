const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection configuration using a pool
const db = mysql.createPool({
    host: 'srv1779.hstgr.io', // Replace with your MySQL hostname
    port: 3306, // MySQL default port
    user: 'u940753595_crm_user', // Your MySQL username
    password: 'Simonki77_', // Your MySQL password
    database: 'u940753595_crm_database', // Your database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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

// Test route
app.get('/', (req, res) => {
    res.send('Backend is working!');
});

// Route to fetch all clients
app.get('/clientes', (req, res) => {
    const query = 'SELECT * FROM u940753595_clientes';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching clients:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Route to fetch all vehicles
app.get('/vehiculos', (req, res) => {
    const query = 'SELECT * FROM u940753595_vehiculos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching vehicles:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Route to fetch all services
app.get('/servicios', (req, res) => {
    const query = 'SELECT * FROM u940753595_servicios';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching services:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Route to fetch all appointments
app.get('/citas', (req, res) => {
    const query = 'SELECT * FROM u940753595_citas';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching appointments:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});



app.post('/clientes', (req, res) => {
    const { nombre, telefono, email, direccion } = req.body; // Destructure data from the request body
    const query = 'INSERT INTO u940753595_clientes (nombre, telefono, email, direccion) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, telefono, email, direccion], (err, results) => {
        if (err) {
            console.error('Error adding client:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Client added successfully', clientId: results.insertId });
    });
});


app.put('/clientes/:id', (req, res) => {
    const { id } = req.params; // Get client ID from the route parameter
    const { nombre, telefono, email, direccion } = req.body; // Get updated data from the request body
    const query = 'UPDATE u940753595_clientes SET nombre = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?';
    db.query(query, [nombre, telefono, email, direccion, id], (err) => {
        if (err) {
            console.error('Error updating client:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Client updated successfully' });
    });
});


app.delete('/clientes/:id', (req, res) => {
    const { id } = req.params; // Get client ID from the route parameter
    const query = 'DELETE FROM u940753595_clientes WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) {
            console.error('Error deleting client:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Client deleted successfully' });
    });
});

app.get('/vehiculos', (req, res) => {
    const query = 'SELECT * FROM u940753595_vehiculos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching vehicles:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});


app.post('/vehiculos', (req, res) => {
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





app.get('/servicios', (req, res) => {
    const query = 'SELECT * FROM u940753595_servicios';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching services:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});


app.post('/citas', (req, res) => {
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



app.get('/vehiculos', (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM u940753595_vehiculos LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching vehicles with pagination:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});



const jwt = require('jsonwebtoken');

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Mock user verification
    if (username === 'admin' && password === 'password123') {
        const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ error: 'Invalid credentials' });
});

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, 'your_secret_key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};


app.get('/clientes', authenticateToken, (req, res) => {
    // Only accessible with a valid token
});


const { body, validationResult } = require('express-validator');

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



// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
