

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();
import cors from "cors";

app.use(cors({
  origin: "https://nomad-production-4d66.up.railway.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());

// Initialize Firebase Admin SDK (skip if credentials are dummy)
let db = null;

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID !== 'dummy') {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    db = admin.firestore();
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase credentials not configured. Running in development mode without database.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error.message);
  console.log('Running in development mode without database.');
}
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User signup
app.post('/api/signup', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not configured. Please set up Firebase credentials.' });
    }

    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (!['creator', 'worker'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either creator or worker' });
    }

    // Check if user already exists
    const userRef = db.collection('users').where('email', '==', email);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.empty) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      email,
      password: hashedPassword,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('users').add(newUser);
    const userId = docRef.id;

    // Create JWT token
    const token = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, role }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not configured. Please set up Firebase credentials.' });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const userRef = db.collection('users').where('email', '==', email);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: userDoc.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: userDoc.id, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task (only for creators)
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not configured. Please set up Firebase credentials.' });
    }

    if (req.user.role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can create tasks' });
    }

    const { title, description, price } = req.body;

    // Validate input
    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Title, description, and price are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    // Create task
    const newTask = {
      title,
      description,
      price: parseFloat(price),
      status: 'open',
      createdBy: req.user.userId,
      acceptedBy: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('tasks').add(newTask);

    res.status(201).json({
      message: 'Task created successfully',
      task: { id: docRef.id, ...newTask }
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tasks
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not configured. Please set up Firebase credentials.' });
    }

    let query = db.collection('tasks');

    let tasks = [];

    if (req.user.role === 'worker') {
      // Workers need to see both open tasks AND their accepted tasks
      const [openTasksSnapshot, acceptedTasksSnapshot] = await Promise.all([
        db.collection('tasks').where('status', '==', 'open').get(),
        db.collection('tasks').where('status', '==', 'accepted').where('acceptedBy', '==', req.user.userId).get()
      ]);

      // Add open tasks
      openTasksSnapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      // Add accepted tasks
      acceptedTasksSnapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
    } else if (req.user.role === 'creator') {
      // Creators see all their own tasks
      const tasksSnapshot = await query.where('createdBy', '==', req.user.userId).get();
      tasksSnapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
    } else {
      // Fallback - shouldn't happen
      const tasksSnapshot = await query.get();
      tasksSnapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
    }

    // Sort tasks by createdAt in descending order (newest first)
    tasks.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    res.json({ tasks });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept task (only for workers)
app.put('/api/tasks/:taskId/accept', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not configured. Please set up Firebase credentials.' });
    }

    if (req.user.role !== 'worker') {
      return res.status(403).json({ error: 'Only workers can accept tasks' });
    }

    const { taskId } = req.params;
    const taskRef = db.collection('tasks').doc(taskId);

    // Use transaction to prevent race conditions
    const result = await db.runTransaction(async (transaction) => {
      const taskDoc = await transaction.get(taskRef);

      if (!taskDoc.exists) {
        throw new Error('Task not found');
      }

      const task = taskDoc.data();

      // Check if task is still open
      if (task.status !== 'open') {
        throw new Error('Task is not available for acceptance');
      }

      // Update task status
      transaction.update(taskRef, {
        status: 'accepted',
        acceptedBy: req.user.userId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, message: 'Task accepted successfully' };
    });

    res.json(result);

  } catch (error) {
    console.error('Accept task error:', error);

    // Handle specific error messages
    if (error.message === 'Task not found') {
      return res.status(404).json({ error: 'Task not found' });
    } else if (error.message === 'Task is not available for acceptance') {
      return res.status(409).json({ error: 'Task was already accepted by another worker' });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Complete task (only for workers who accepted it)
app.put('/api/tasks/:taskId/complete', authenticateToken, async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not configured. Please set up Firebase credentials.' });
    }

    if (req.user.role !== 'worker') {
      return res.status(403).json({ error: 'Only workers can complete tasks' });
    }

    const { taskId } = req.params;
    const taskRef = db.collection('tasks').doc(taskId);

    // Get current task
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskDoc.data();

    // Check if task is accepted by this worker
    if (task.status !== 'accepted' || task.acceptedBy !== req.user.userId) {
      return res.status(403).json({ error: 'You can only complete tasks you have accepted' });
    }

    // Update task
    await taskRef.update({
      status: 'completed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: 'Task completed successfully' });

  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Nomad server running on port ${PORT}`);
});
