const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5174', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const name = path.basename(originalName, extension);
    cb(null, `${timestamp}-${name}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'), false);
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'GROWF Backend Running',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'GROWF API is running!',
    version: '1.0.0'
  });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  console.log('Register request:', req.body);

  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      error: 'Email, mot de passe et rôle sont requis'
    });
  }

  // Simulation d'inscription réussie
  res.json({
    success: true,
    message: 'Inscription réussie',
    data: {
      user: {
        id: '1',
        email: email,
        role: role.toUpperCase()
      },
      token: 'fake-jwt-token'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email et mot de passe sont requis'
    });
  }

  // Simulation de connexion réussie - role basé sur email
  const role = email.includes('instit') || email.includes('org') ? 'ORGANIZATION' : 'COMPANY';

  res.json({
    success: true,
    message: 'Connexion réussie',
    data: {
      user: {
        id: role === 'ORGANIZATION' ? '2' : '1',
        email: email,
        role: role
      },
      token: 'fake-jwt-token'
    }
  });
});

// Mock data for programs
let programs = [
  {
    id: '1',
    organizationId: '2',
    title: 'Programme Innovation PME',
    description: 'Financement pour projets d\'innovation des PME ivoiriennes',
    criteria: { sector: ['tech', 'innovation'], size: ['MICRO', 'SMALL'] },
    amountMin: 1000000,
    amountMax: 10000000,
    deadline: '2024-12-31T23:59:59.000Z',
    status: 'PUBLISHED',
    sector: ['Technologie', 'Innovation'],
    companySize: ['MICRO', 'SMALL'],
    location: ['Abidjan', 'Bouaké'],
    tags: ['innovation', 'tech', 'startup'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    organizationId: '2',
    title: 'Financement Export',
    description: 'Soutien aux entreprises pour le développement à l\'export',
    criteria: { experience: '2 ans minimum', sector: ['export', 'commerce'] },
    amountMin: 5000000,
    amountMax: 50000000,
    deadline: '2025-03-15T23:59:59.000Z',
    status: 'PUBLISHED',
    sector: ['Commerce', 'Export'],
    companySize: ['SMALL', 'MEDIUM'],
    location: ['Côte d\'Ivoire'],
    tags: ['export', 'commerce', 'international'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Programs routes
app.get('/api/programs', (req, res) => {
  res.json({
    success: true,
    data: programs,
    pagination: {
      page: 1,
      limit: 10,
      total: programs.length,
      pages: 1
    }
  });
});

app.get('/api/programs/:id', (req, res) => {
  const program = programs.find(p => p.id === req.params.id);

  if (!program) {
    return res.status(404).json({
      error: 'Programme non trouvé'
    });
  }

  res.json({
    success: true,
    data: program
  });
});

app.post('/api/programs', (req, res) => {
  console.log('Create program request:', req.body);

  const {
    title,
    description,
    criteria,
    amountMin,
    amountMax,
    deadline,
    sector,
    companySize,
    location,
    tags
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: 'Titre et description sont requis'
    });
  }

  const newProgram = {
    id: String(programs.length + 1),
    organizationId: '2', // Hardcoded for demo
    title,
    description,
    criteria: criteria || {},
    amountMin: amountMin || null,
    amountMax: amountMax || null,
    deadline: deadline || null,
    status: 'DRAFT',
    sector: sector || [],
    companySize: companySize || [],
    location: location || [],
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  programs.push(newProgram);

  res.status(201).json({
    success: true,
    message: 'Programme créé avec succès',
    data: newProgram
  });
});

app.put('/api/programs/:id', (req, res) => {
  const programIndex = programs.findIndex(p => p.id === req.params.id);

  if (programIndex === -1) {
    return res.status(404).json({
      error: 'Programme non trouvé'
    });
  }

  const updatedProgram = {
    ...programs[programIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  programs[programIndex] = updatedProgram;

  res.json({
    success: true,
    message: 'Programme mis à jour avec succès',
    data: updatedProgram
  });
});

app.delete('/api/programs/:id', (req, res) => {
  const programIndex = programs.findIndex(p => p.id === req.params.id);

  if (programIndex === -1) {
    return res.status(404).json({
      error: 'Programme non trouvé'
    });
  }

  programs.splice(programIndex, 1);

  res.json({
    success: true,
    message: 'Programme supprimé avec succès'
  });
});

// Mock data for documents
let documents = [];

// Mock data for notifications
let notifications = [
  {
    id: '1',
    userId: '1',
    type: 'APPLICATION_STATUS',
    title: 'Candidature soumise',
    message: 'Votre candidature pour "Programme Innovation PME" a été soumise avec succès',
    data: { applicationId: '1', programId: '1' },
    readAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '2',
    type: 'NEW_APPLICATION',
    title: 'Nouvelle candidature',
    message: 'Une nouvelle candidature a été soumise pour votre programme "Programme Innovation PME"',
    data: { applicationId: '1', programId: '1' },
    readAt: null,
    createdAt: new Date().toISOString()
  }
];

// Mock data for applications
let applications = [
  {
    id: '1',
    programId: '1',
    companyId: '1',
    status: 'SUBMITTED',
    data: {
      companyName: 'Tech Innovations SARL',
      projectDescription: 'Développement d\'une application mobile innovante',
      requestedAmount: 5000000,
      projectDuration: '12 mois'
    },
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Applications routes
app.get('/api/applications', (req, res) => {
  res.json({
    success: true,
    data: applications,
    pagination: {
      page: 1,
      limit: 10,
      total: applications.length,
      pages: 1
    }
  });
});

app.get('/api/applications/:id', (req, res) => {
  const application = applications.find(a => a.id === req.params.id);

  if (!application) {
    return res.status(404).json({
      error: 'Candidature non trouvée'
    });
  }

  res.json({
    success: true,
    data: application
  });
});

app.post('/api/applications', (req, res) => {
  console.log('Create application request:', req.body);

  const { programId, data } = req.body;

  if (!programId || !data) {
    return res.status(400).json({
      error: 'Programme ID et données sont requis'
    });
  }

  const newApplication = {
    id: String(applications.length + 1),
    programId,
    companyId: '1', // Hardcoded for demo
    status: 'DRAFT',
    data: data,
    submittedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  applications.push(newApplication);

  res.status(201).json({
    success: true,
    message: 'Candidature créée avec succès',
    data: newApplication
  });
});

app.put('/api/applications/:id', (req, res) => {
  const applicationIndex = applications.findIndex(a => a.id === req.params.id);

  if (applicationIndex === -1) {
    return res.status(404).json({
      error: 'Candidature non trouvée'
    });
  }

  const updatedApplication = {
    ...applications[applicationIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  // Si on soumet la candidature, ajouter submittedAt
  if (req.body.status === 'SUBMITTED' && !applications[applicationIndex].submittedAt) {
    updatedApplication.submittedAt = new Date().toISOString();

    // Create notifications for application submission
    const program = programs.find(p => p.id === updatedApplication.programId);

    if (program) {
      // Notification for company (user who submitted)
      createNotification(
        '1', // Hardcoded company user ID for demo
        'APPLICATION_STATUS',
        'Candidature soumise',
        `Votre candidature pour "${program.title}" a été soumise avec succès`,
        { applicationId: req.params.id, programId: updatedApplication.programId }
      );

      // Notification for organization (program owner)
      createNotification(
        '2', // Hardcoded organization user ID for demo
        'NEW_APPLICATION',
        'Nouvelle candidature',
        `Une nouvelle candidature a été soumise pour votre programme "${program.title}"`,
        { applicationId: req.params.id, programId: updatedApplication.programId }
      );
    }
  }

  applications[applicationIndex] = updatedApplication;

  res.json({
    success: true,
    message: 'Candidature mise à jour avec succès',
    data: updatedApplication
  });
});

app.delete('/api/applications/:id', (req, res) => {
  const applicationIndex = applications.findIndex(a => a.id === req.params.id);

  if (applicationIndex === -1) {
    return res.status(404).json({
      error: 'Candidature non trouvée'
    });
  }

  applications.splice(applicationIndex, 1);

  res.json({
    success: true,
    message: 'Candidature supprimée avec succès'
  });
});

// Document routes
app.get('/api/documents', (req, res) => {
  const { applicationId } = req.query;
  let filteredDocuments = documents;

  if (applicationId) {
    filteredDocuments = documents.filter(d => d.applicationId === applicationId);
  }

  res.json({
    success: true,
    data: filteredDocuments,
    pagination: {
      page: 1,
      limit: 50,
      total: filteredDocuments.length,
      pages: 1
    }
  });
});

app.post('/api/documents/upload', upload.array('documents'), (req, res) => {
  try {
    console.log('Upload request:', req.files, req.body);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Aucun fichier fourni'
      });
    }

    const { applicationId } = req.body;
    const uploadedDocuments = [];

    req.files.forEach(file => {
      const newDocument = {
        id: String(documents.length + 1),
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
        applicationId: applicationId || null,
        companyId: '1', // Hardcoded for demo
        uploadedAt: new Date().toISOString()
      };

      documents.push(newDocument);
      uploadedDocuments.push(newDocument);
    });

    res.status(201).json({
      success: true,
      message: `${uploadedDocuments.length} document(s) uploadé(s) avec succès`,
      data: uploadedDocuments
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'upload'
    });
  }
});

app.get('/api/documents/:id', (req, res) => {
  const document = documents.find(d => d.id === req.params.id);

  if (!document) {
    return res.status(404).json({
      error: 'Document non trouvé'
    });
  }

  res.json({
    success: true,
    data: document
  });
});

app.delete('/api/documents/:id', (req, res) => {
  const documentIndex = documents.findIndex(d => d.id === req.params.id);

  if (documentIndex === -1) {
    return res.status(404).json({
      error: 'Document non trouvé'
    });
  }

  const document = documents[documentIndex];

  // Delete physical file
  const filePath = path.join(__dirname, 'uploads', path.basename(document.path));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  documents.splice(documentIndex, 1);

  res.json({
    success: true,
    message: 'Document supprimé avec succès'
  });
});

// Notification routes
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  let userNotifications = notifications;

  if (userId) {
    userNotifications = notifications.filter(n => n.userId === userId);
  }

  // Sort by creation date (most recent first)
  userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    data: userNotifications,
    pagination: {
      page: 1,
      limit: 50,
      total: userNotifications.length,
      pages: 1
    }
  });
});

app.get('/api/notifications/unread-count', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      error: 'User ID is required'
    });
  }

  const unreadCount = notifications.filter(n => n.userId === userId && !n.readAt).length;

  res.json({
    success: true,
    data: { count: unreadCount }
  });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const notificationIndex = notifications.findIndex(n => n.id === req.params.id);

  if (notificationIndex === -1) {
    return res.status(404).json({
      error: 'Notification non trouvée'
    });
  }

  notifications[notificationIndex].readAt = new Date().toISOString();

  res.json({
    success: true,
    message: 'Notification marquée comme lue',
    data: notifications[notificationIndex]
  });
});

app.put('/api/notifications/mark-all-read', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      error: 'User ID is required'
    });
  }

  const now = new Date().toISOString();
  let updatedCount = 0;

  notifications.forEach(notification => {
    if (notification.userId === userId && !notification.readAt) {
      notification.readAt = now;
      updatedCount++;
    }
  });

  res.json({
    success: true,
    message: `${updatedCount} notification(s) marquée(s) comme lue(s)`,
    data: { updatedCount }
  });
});

app.delete('/api/notifications/:id', (req, res) => {
  const notificationIndex = notifications.findIndex(n => n.id === req.params.id);

  if (notificationIndex === -1) {
    return res.status(404).json({
      error: 'Notification non trouvée'
    });
  }

  notifications.splice(notificationIndex, 1);

  res.json({
    success: true,
    message: 'Notification supprimée avec succès'
  });
});

// Helper function to create notifications
const createNotification = (userId, type, title, message, data = {}) => {
  const notification = {
    id: String(notifications.length + 1),
    userId,
    type,
    title,
    message,
    data,
    readAt: null,
    createdAt: new Date().toISOString()
  };

  notifications.push(notification);
  return notification;
};

// Mock data for messages
let messages = [
  {
    id: '1',
    applicationId: '1',
    senderId: '1',
    receiverId: '2',
    content: 'Bonjour, j\'ai quelques questions concernant votre programme de financement.',
    attachments: [],
    readAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    sender: {
      id: '1',
      email: 'company@example.com',
      role: 'COMPANY'
    }
  },
  {
    id: '2',
    applicationId: '1',
    senderId: '2',
    receiverId: '1',
    content: 'Bonjour ! Bien sûr, je serais ravi de répondre à vos questions. De quoi s\'agit-il ?',
    attachments: [],
    readAt: null,
    createdAt: new Date(Date.now() - 82800000).toISOString(), // 23 hours ago
    sender: {
      id: '2',
      email: 'org@example.com',
      role: 'ORGANIZATION'
    }
  },
  {
    id: '3',
    applicationId: '1',
    senderId: '1',
    receiverId: '2',
    content: 'Je voudrais savoir quels sont les critères exacts d\'éligibilité et s\'il est possible de modifier le dossier après soumission.',
    attachments: [],
    readAt: null,
    createdAt: new Date(Date.now() - 82200000).toISOString(), // 22.8 hours ago
    sender: {
      id: '1',
      email: 'company@example.com',
      role: 'COMPANY'
    }
  }
];

// Messaging routes
app.get('/api/messages', (req, res) => {
  const { applicationId, userId } = req.query;
  let filteredMessages = messages;

  if (applicationId) {
    filteredMessages = messages.filter(m => m.applicationId === applicationId);
  }

  if (userId) {
    filteredMessages = filteredMessages.filter(m =>
      m.senderId === userId || m.receiverId === userId
    );
  }

  // Sort by creation date (oldest first for conversation flow)
  filteredMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  res.json({
    success: true,
    data: filteredMessages,
    pagination: {
      page: 1,
      limit: 50,
      total: filteredMessages.length,
      pages: 1
    }
  });
});

app.post('/api/messages', (req, res) => {
  const { applicationId, receiverId, content, attachments = [] } = req.body;
  const senderId = req.headers.userid || '1'; // Mock user ID from headers

  if (!applicationId || !receiverId || !content) {
    return res.status(400).json({
      error: 'Application ID, receiver ID, and content are required'
    });
  }

  const newMessage = {
    id: String(messages.length + 1),
    applicationId,
    senderId,
    receiverId,
    content,
    attachments,
    readAt: null,
    createdAt: new Date().toISOString(),
    sender: {
      id: senderId,
      email: senderId === '1' ? 'company@example.com' : 'org@example.com',
      role: senderId === '1' ? 'COMPANY' : 'ORGANIZATION'
    }
  };

  messages.push(newMessage);

  // Create notification for receiver
  createNotification(
    receiverId,
    'NEW_MESSAGE',
    'Nouveau message',
    `Vous avez reçu un nouveau message concernant une candidature`,
    { applicationId, messageId: newMessage.id }
  );

  res.json({
    success: true,
    data: newMessage,
    message: 'Message envoyé avec succès'
  });
});

app.put('/api/messages/:id/read', (req, res) => {
  const messageIndex = messages.findIndex(m => m.id === req.params.id);

  if (messageIndex === -1) {
    return res.status(404).json({
      error: 'Message non trouvé'
    });
  }

  messages[messageIndex].readAt = new Date().toISOString();

  res.json({
    success: true,
    data: messages[messageIndex],
    message: 'Message marqué comme lu'
  });
});

app.get('/api/conversations', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      error: 'User ID is required'
    });
  }

  // Group messages by applicationId to create conversations
  const conversationsMap = new Map();

  messages
    .filter(m => m.senderId === userId || m.receiverId === userId)
    .forEach(message => {
      const applicationId = message.applicationId;

      if (!conversationsMap.has(applicationId)) {
        conversationsMap.set(applicationId, {
          applicationId,
          lastMessage: message,
          unreadCount: 0,
          participants: new Set()
        });
      }

      const conversation = conversationsMap.get(applicationId);

      // Update last message if this one is more recent
      if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
        conversation.lastMessage = message;
      }

      // Count unread messages for this user
      if (message.receiverId === userId && !message.readAt) {
        conversation.unreadCount++;
      }

      // Add participants
      conversation.participants.add(message.senderId);
      conversation.participants.add(message.receiverId);
    });

  const conversations = Array.from(conversationsMap.values()).map(conv => ({
    ...conv,
    participants: Array.from(conv.participants)
  }));

  // Sort by last message date (most recent first)
  conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

  res.json({
    success: true,
    data: conversations
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GROWF Backend running on port ${PORT}`);
  console.log(`📖 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
});