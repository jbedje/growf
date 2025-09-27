import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import notificationRoutes from './routes/notificationRoutes';
// Temporarily disabled due to middleware issues
// import mockDocumentRoutes from './routes/mockDocumentRoutes';
// import mockMessageRoutes from './routes/mockMessageRoutes';
// import mockProgramRoutes from './routes/mockProgramRoutes';

const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5175', 'http://localhost:5177', 'http://localhost:5180', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    message: 'Development server running without database'
  });
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'GROWF API is running in development mode!',
    version: '1.0.0-dev',
  });
});

// Mock auth endpoints pour le développement
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Login attempt:', { email, password });
  console.log('Expected SUPERADMIN email:', 'superadmin@growf.fr');
  console.log('Expected SUPERADMIN password:', 'SuperAdmin2024!');
  console.log('Email match:', email === 'superadmin@growf.fr');
  console.log('Password match:', password === 'SuperAdmin2024!');

  // Mock SUPERADMIN login
  if (email === 'superadmin@growf.fr' && password === 'SuperAdmin2024!') {
    console.log('✅ SUPERADMIN login successful');
    const mockUser = {
      id: 'superadmin-1',
      email: 'superadmin@growf.fr',
      role: 'SUPERADMIN',
      isVerified: true,
    };

    const mockToken = 'mock-jwt-token-superadmin';

    res.json({
      success: true,
      data: {
        user: mockUser,
        accessToken: mockToken,
      },
      message: 'Login successful (mock mode)'
    });
    return;
  }

  // Mock COMPANY login
  if (email === 'company@test.fr' && password === 'Test123!') {
    const mockUser = {
      id: 'company-1',
      email: 'company@test.fr',
      role: 'COMPANY',
      isVerified: true,
    };

    const mockToken = 'mock-jwt-token-company';

    res.json({
      success: true,
      data: {
        user: mockUser,
        accessToken: mockToken,
      },
      message: 'Login successful (mock mode)'
    });
    return;
  }

  // Mock ADMIN login for jbedje@gmail.con
  if (email === 'jbedje@gmail.con' && password === 'Cipme@2025') {
    console.log('✅ ADMIN login successful for jbedje@gmail.con');
    const mockUser = {
      id: 'admin-jbedje',
      email: 'jbedje@gmail.con',
      role: 'ADMIN',
      isVerified: true,
    };

    const mockToken = 'mock-jwt-token-admin-jbedje';

    res.json({
      success: true,
      data: {
        user: mockUser,
        accessToken: mockToken,
      },
      message: 'Login successful (mock mode)'
    });
    return;
  }

  // Mock ORGANIZATION login
  if (email === 'org@financement.fr' && password === 'Org2024!') {
    console.log('✅ ORGANIZATION login successful');
    const mockUser = {
      id: 'organization-1',
      email: 'org@financement.fr',
      role: 'ORGANIZATION',
      isVerified: true,
    };

    const mockToken = 'mock-jwt-token-organization';

    res.json({
      success: true,
      data: {
        user: mockUser,
        accessToken: mockToken,
      },
      message: 'Login successful (mock mode)'
    });
    return;
  }

  console.log('❌ Login failed - invalid credentials');
  res.status(401).json({
    success: false,
    error: 'Invalid credentials (mock mode)'
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;

  console.log('Register attempt:', { email });

  res.json({
    success: true,
    message: 'Account created successfully (mock mode)',
    data: {
      user: {
        id: 'mock-user-' + Date.now(),
        email,
        role: 'COMPANY',
        isVerified: false,
      }
    }
  });
});

app.post('/api/auth/refresh', (req, res) => {
  res.json({
    success: true,
    data: {
      accessToken: 'mock-refreshed-token',
    }
  });
});

// Mock notifications endpoint (without auth for testing)
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;

  // Mock notifications data
  const mockNotifications = [
    {
      id: 'notif-1',
      userId: userId || 'user-1',
      type: 'APPLICATION_STATUS_CHANGE',
      title: 'Candidature mise à jour',
      message: 'Votre candidature "Application Digitale" a été examinée',
      data: { applicationId: 'app-1' },
      read: false,
      createdAt: '2024-01-20T15:30:00.000Z',
      applicationId: 'app-1',
      relatedEntity: { type: 'application', id: 'app-1' }
    },
    {
      id: 'notif-2',
      userId: userId || 'user-1',
      type: 'NEW_PROGRAM_AVAILABLE',
      title: 'Nouveau programme disponible',
      message: 'Un nouveau programme "Innovation Industrielle" correspond à votre profil',
      data: { programId: 'prog-2' },
      read: true,
      createdAt: '2024-01-19T10:15:00.000Z',
      relatedEntity: { type: 'program', id: 'prog-2' }
    },
    {
      id: 'notif-3',
      userId: userId || 'user-1',
      type: 'DOCUMENT_UPLOADED',
      title: 'Document reçu',
      message: 'Votre document "Business Plan" a été téléchargé avec succès',
      data: { documentId: 'doc-1' },
      read: false,
      createdAt: '2024-01-18T14:22:00.000Z',
      relatedEntity: { type: 'document', id: 'doc-1' }
    }
  ];

  res.json({
    success: true,
    data: mockNotifications
  });
});

// Mock unread notifications count
app.get('/api/notifications/unread-count', (req, res) => {
  const { userId } = req.query;
  res.json({
    success: true,
    data: { count: 2 }
  });
});

// Mock mark notification as read
app.put('/api/notifications/:notificationId/read', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Notification marked as read' }
  });
});

// Mock mark all notifications as read
app.put('/api/notifications/mark-all-read', (req, res) => {
  res.json({
    success: true,
    data: { message: 'All notifications marked as read' }
  });
});

// Mock delete notification
app.delete('/api/notifications/:notificationId', (req, res) => {
  res.json({
    success: true,
    data: { message: 'Notification deleted' }
  });
});

// Programs redirect compatibility
app.get('/api/programs', (req, res) => {
  // Redirect to public programs endpoint with same query params
  const queryString = new URLSearchParams(req.query as any).toString();
  return res.redirect(`/api/programs/public${queryString ? '?' + queryString : ''}`);
});

// API Routes (with auth - these will be overridden by the mock routes above)
app.use('/api/notifications', notificationRoutes);
// Temporarily disabled due to middleware issues
// app.use('/api/documents', mockDocumentRoutes);
// app.use('/api/messages', mockMessageRoutes);

// Mock Programs API - inline implementation
const mockPrograms = [
  {
    id: 'prog-1',
    organizationId: 'org-1',
    title: 'Aide à la Transformation Numérique',
    description: 'Financement pour accompagner les entreprises dans leur transformation digitale.',
    criteria: { minEmployees: 5, maxEmployees: 500 },
    amountMin: 5000,
    amountMax: 50000,
    deadline: '2024-06-30T23:59:59.000Z',
    status: 'PUBLISHED',
    sector: ['Numérique', 'Services', 'Commerce'],
    companySize: ['TPE', 'PME'],
    location: ['Île-de-France', 'Auvergne-Rhône-Alpes'],
    tags: ['transformation', 'numérique', 'innovation'],
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    organization: { id: 'org-1', name: 'Région Île-de-France', type: 'REGION' },
    _count: { applications: 45 }
  },
  {
    id: 'prog-2',
    organizationId: 'org-2',
    title: 'Subvention Innovation Industrielle',
    description: 'Soutien financier pour les projets d\'innovation dans le secteur industriel.',
    criteria: { minEmployees: 10, maxEmployees: 1000 },
    amountMin: 10000,
    amountMax: 200000,
    deadline: '2024-08-15T23:59:59.000Z',
    status: 'PUBLISHED',
    sector: ['Industrie', 'Énergie'],
    companySize: ['PME', 'ETI'],
    location: ['Nouvelle-Aquitaine', 'Occitanie', 'Grand Est'],
    tags: ['innovation', 'industrie', 'R&D'],
    createdAt: '2024-02-01T09:00:00.000Z',
    updatedAt: '2024-02-01T09:00:00.000Z',
    organization: { id: 'org-2', name: 'France Relance', type: 'NATIONAL' },
    _count: { applications: 23 }
  },
  {
    id: 'prog-3',
    organizationId: 'org-3',
    title: 'Développement Commerce Local',
    description: 'Aide aux commerces de proximité pour le développement de leur activité.',
    criteria: { maxEmployees: 50 },
    amountMin: 2000,
    amountMax: 25000,
    deadline: '2024-12-31T23:59:59.000Z',
    status: 'PUBLISHED',
    sector: ['Commerce', 'Services'],
    companySize: ['TPE', 'PME'],
    location: ['Bretagne', 'Pays de la Loire', 'Normandie'],
    tags: ['commerce', 'local', 'proximité'],
    createdAt: '2024-03-01T14:00:00.000Z',
    updatedAt: '2024-03-01T14:00:00.000Z',
    organization: { id: 'org-3', name: 'Chambre de Commerce Bretagne', type: 'CCI' },
    _count: { applications: 67 }
  }
];

app.get('/api/programs/public', (req, res) => {
  const { search, sector, location, page = 1, limit = 12 } = req.query;

  let filteredPrograms = mockPrograms.filter(p => p.status === 'PUBLISHED');

  if (search) {
    const searchLower = search.toString().toLowerCase();
    filteredPrograms = filteredPrograms.filter(p =>
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  if (sector) {
    filteredPrograms = filteredPrograms.filter(p => p.sector.includes(sector.toString()));
  }

  if (location) {
    filteredPrograms = filteredPrograms.filter(p => p.location.includes(location.toString()));
  }

  const pageNum = parseInt(page.toString());
  const limitNum = parseInt(limit.toString());
  const total = filteredPrograms.length;
  const totalPages = Math.ceil(total / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    data: {
      programs: paginatedPrograms,
      pagination: { page: pageNum, limit: limitNum, total, totalPages }
    }
  });
});

app.get('/api/programs/public/:id', (req, res) => {
  const program = mockPrograms.find(p => p.id === req.params.id && p.status === 'PUBLISHED');
  if (!program) {
    res.status(404).json({ success: false, error: 'Programme non trouvé' });
    return;
  }
  res.json({ success: true, data: program });
});

// Mock Documents API - inline implementation
const mockDocuments = [
  {
    id: 'doc-1',
    applicationId: 'app-1',
    filename: 'business-plan.pdf',
    originalName: 'Plan_affaires_2024.pdf',
    mimetype: 'application/pdf',
    size: 2048576,
    uploadedAt: '2024-01-15T10:30:00Z',
    description: 'Plan d\'affaires détaillé'
  },
  {
    id: 'doc-2',
    applicationId: 'app-1',
    filename: 'financial-statements.xlsx',
    originalName: 'Bilans_financiers.xlsx',
    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024768,
    uploadedAt: '2024-01-15T11:00:00Z',
    description: 'États financiers'
  }
];

app.get('/api/documents/all', (req, res) => {
  res.json({
    success: true,
    data: mockDocuments,
    message: 'Liste de tous les documents (mode développement)'
  });
});

app.get('/api/documents/application/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  const documents = mockDocuments.filter(doc => doc.applicationId === applicationId);
  res.json({
    success: true,
    data: documents
  });
});

app.post('/api/documents/upload/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  const newDoc = {
    id: 'doc-' + Date.now(),
    applicationId,
    filename: 'uploaded-document.pdf',
    originalName: 'Document_téléchargé.pdf',
    mimetype: 'application/pdf',
    size: 1500000,
    uploadedAt: new Date().toISOString(),
    description: req.body.description || 'Document téléchargé'
  };
  mockDocuments.push(newDoc);
  res.status(201).json({
    success: true,
    data: newDoc,
    message: 'Document uploadé avec succès (mode développement)'
  });
});

// Mock Messages API - inline implementation
const mockMessages = [
  {
    id: 'msg-1',
    applicationId: 'app-1',
    senderId: 'user-1',
    senderEmail: 'company@test.fr',
    content: 'Bonjour, j\'aimerais avoir plus d\'informations sur les critères d\'éligibilité.',
    attachments: [],
    readAt: null,
    createdAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 'msg-2',
    applicationId: 'app-1',
    senderId: 'user-2',
    senderEmail: 'org@financement.fr',
    content: 'Bonjour, merci pour votre candidature. Pouvez-vous fournir des informations complémentaires sur votre chiffre d\'affaires ?',
    attachments: [],
    readAt: '2024-01-15T15:00:00Z',
    createdAt: '2024-01-15T14:45:00Z'
  }
];

app.get('/api/messages/conversations', (req, res) => {
  // Group messages by applicationId
  const conversations = mockMessages.reduce((acc: any, message) => {
    if (!acc[message.applicationId]) {
      acc[message.applicationId] = {
        applicationId: message.applicationId,
        lastMessage: message,
        unreadCount: mockMessages.filter(m => m.applicationId === message.applicationId && !m.readAt).length,
        messages: []
      };
    }
    acc[message.applicationId].messages.push(message);
    if (new Date(message.createdAt) > new Date(acc[message.applicationId].lastMessage.createdAt)) {
      acc[message.applicationId].lastMessage = message;
    }
    return acc;
  }, {});

  res.json({
    success: true,
    data: Object.values(conversations)
  });
});

app.get('/api/messages/application/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  const messages = mockMessages
    .filter(msg => msg.applicationId === applicationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({
    success: true,
    data: messages
  });
});

app.post('/api/messages/application/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  const { content } = req.body;

  const newMessage = {
    id: 'msg-' + Date.now(),
    applicationId,
    senderId: 'current-user',
    senderEmail: 'user@example.com',
    content,
    attachments: [],
    readAt: null,
    createdAt: new Date().toISOString()
  };

  mockMessages.push(newMessage);

  res.status(201).json({
    success: true,
    data: newMessage,
    message: 'Message envoyé avec succès'
  });
});

app.get('/api/messages/unread-count', (req, res) => {
  const unreadCount = mockMessages.filter(msg => !msg.readAt).length;
  res.json({
    success: true,
    data: { unreadCount }
  });
});

// Standard API routes that frontend expects
app.get('/api/documents', (req, res) => {
  // Redirect to the detailed endpoint
  const { applicationId } = req.query;
  if (applicationId) {
    return res.redirect(`/api/documents/application/${applicationId}`);
  }
  return res.redirect('/api/documents/all');
});

app.get('/api/messages', (req, res) => {
  // Redirect to conversations endpoint
  return res.redirect('/api/messages/conversations');
});

app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;

  // Mock notifications data
  const mockNotifications = [
    {
      id: 'notif-1',
      userId: userId || 'user-1',
      type: 'APPLICATION_STATUS_CHANGE',
      title: 'Candidature mise à jour',
      message: 'Votre candidature "Application Digitale" a été examinée',
      data: { applicationId: 'app-1' },
      read: false,
      createdAt: '2024-01-20T15:30:00.000Z',
      applicationId: 'app-1',
      relatedEntity: { type: 'application', id: 'app-1' }
    },
    {
      id: 'notif-2',
      userId: userId || 'user-1',
      type: 'NEW_MESSAGE',
      title: 'Nouveau message',
      message: 'Vous avez reçu un nouveau message concernant votre candidature',
      data: { messageId: 'msg-2' },
      read: true,
      createdAt: '2024-01-19T10:15:00.000Z',
      applicationId: 'app-1',
      relatedEntity: { type: 'message', id: 'msg-2' }
    }
  ];

  res.json({
    success: true,
    data: mockNotifications
  });
});

// Applications API
app.get('/api/applications', (req, res) => {
  const { page = 1, limit = 20, status, programId } = req.query;

  // Mock applications data
  let mockApplications = [
    {
      id: 'app-1',
      programId: 'prog-1',
      companyId: 'company-1',
      status: 'SUBMITTED',
      data: { projectName: 'Application Digitale', budget: 25000 },
      score: 85,
      submittedAt: '2024-01-20T10:00:00.000Z',
      reviewedAt: null,
      createdAt: '2024-01-20T10:00:00.000Z',
      updatedAt: '2024-01-20T10:00:00.000Z',
      program: {
        title: 'Aide à la Transformation Numérique',
        organizationId: 'org-1',
        organization: {
          id: 'org-1',
          name: 'Région Île-de-France',
          type: 'REGION'
        }
      },
      company: {
        name: 'TechStart SAS',
        sector: 'Numérique',
        location: 'Paris',
        size: 'PME'
      }
    },
    {
      id: 'app-2',
      programId: 'prog-2',
      companyId: 'company-2',
      status: 'REVIEWED',
      data: { projectName: 'Innovation R&D', budget: 150000 },
      score: 92,
      submittedAt: '2024-02-10T14:30:00.000Z',
      reviewedAt: '2024-02-15T09:15:00.000Z',
      createdAt: '2024-02-10T14:30:00.000Z',
      updatedAt: '2024-02-15T09:15:00.000Z',
      program: {
        title: 'Subvention Innovation Industrielle',
        organizationId: 'org-2',
        organization: {
          id: 'org-2',
          name: 'France Relance',
          type: 'NATIONAL'
        }
      },
      company: {
        name: 'InnoManuf SARL',
        sector: 'Industrie',
        location: 'Lyon',
        size: 'ETI'
      }
    }
  ];

  // Apply filters
  if (status) {
    mockApplications = mockApplications.filter(app => app.status === status);
  }
  if (programId) {
    mockApplications = mockApplications.filter(app => app.programId === programId);
  }

  // Apply pagination
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedApplications = mockApplications.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      applications: paginatedApplications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: mockApplications.length,
        totalPages: Math.ceil(mockApplications.length / limitNum)
      }
    }
  });
});

app.get('/api/applications/:id', (req, res) => {
  const { id } = req.params;

  const mockApplication = {
    id,
    programId: 'prog-1',
    companyId: 'company-1',
    status: 'SUBMITTED',
    data: {
      projectName: 'Application Digitale',
      budget: 25000,
      description: 'Transformation numérique complète de nos processus métier'
    },
    score: 85,
    submittedAt: '2024-01-20T10:00:00.000Z',
    reviewedAt: null,
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
    program: {
      title: 'Aide à la Transformation Numérique',
      description: 'Financement pour accompagner les entreprises dans leur transformation digitale.',
      deadline: '2024-06-30T23:59:59.000Z',
      amountMin: 5000,
      amountMax: 50000
    },
    company: {
      name: 'TechStart SAS',
      sector: 'Numérique',
      location: 'Île-de-France'
    },
    documents: [],
    messages: []
  };

  res.json({
    success: true,
    data: mockApplication
  });
});

// Organizations API
app.get('/api/organizations', (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  // Mock organizations data
  let mockOrganizations = [
    {
      id: 'org-1',
      name: 'Région Île-de-France',
      type: 'REGION',
      description: 'Conseil régional d\'Île-de-France',
      email: 'contact@iledefrance.fr',
      phone: '+33 1 53 85 53 85',
      address: '2 rue Simone Veil, 93400 Saint-Ouen',
      website: 'https://www.iledefrance.fr',
      status: 'ACTIVE',
      createdAt: '2024-01-01T10:00:00.000Z',
      updatedAt: '2024-01-15T14:30:00.000Z',
      _count: { programs: 5, applications: 120 }
    },
    {
      id: 'org-2',
      name: 'France Relance',
      type: 'NATIONAL',
      description: 'Plan de relance de l\'économie française',
      email: 'contact@france-relance.gouv.fr',
      phone: '+33 1 42 75 80 00',
      address: '139 rue de Bercy, 75012 Paris',
      website: 'https://www.france-relance.gouv.fr',
      status: 'ACTIVE',
      createdAt: '2024-01-01T10:00:00.000Z',
      updatedAt: '2024-02-01T09:00:00.000Z',
      _count: { programs: 8, applications: 340 }
    },
    {
      id: 'org-3',
      name: 'Chambre de Commerce Bretagne',
      type: 'CCI',
      description: 'Chambre de Commerce et d\'Industrie de Bretagne',
      email: 'contact@bretagne.cci.fr',
      phone: '+33 2 99 33 66 99',
      address: '1 rue du Général Giraud, 35000 Rennes',
      website: 'https://www.bretagne.cci.fr',
      status: 'ACTIVE',
      createdAt: '2024-01-01T10:00:00.000Z',
      updatedAt: '2024-03-01T14:00:00.000Z',
      _count: { programs: 3, applications: 89 }
    },
    {
      id: 'org-4',
      name: 'BPI France',
      type: 'NATIONAL',
      description: 'Banque publique d\'investissement',
      email: 'contact@bpifrance.fr',
      phone: '+33 1 41 79 80 00',
      address: '27-31 avenue du Général Leclerc, 94710 Maisons-Alfort',
      website: 'https://www.bpifrance.fr',
      status: 'ACTIVE',
      createdAt: '2024-01-01T10:00:00.000Z',
      updatedAt: '2024-01-20T16:45:00.000Z',
      _count: { programs: 12, applications: 567 }
    }
  ];

  // Apply search filter
  if (search && typeof search === 'string') {
    const searchLower = search.toLowerCase();
    mockOrganizations = mockOrganizations.filter(org =>
      org.name.toLowerCase().includes(searchLower) ||
      org.description.toLowerCase().includes(searchLower) ||
      org.type.toLowerCase().includes(searchLower)
    );
  }

  // Apply pagination
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;

  const paginatedOrganizations = mockOrganizations.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      organizations: paginatedOrganizations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: mockOrganizations.length,
        totalPages: Math.ceil(mockOrganizations.length / limitNum)
      }
    }
  });
});

app.get('/api/organizations/:id', (req, res) => {
  const { id } = req.params;

  const mockOrganization = {
    id,
    name: 'Région Île-de-France',
    type: 'REGION',
    description: 'Conseil régional d\'Île-de-France',
    email: 'contact@iledefrance.fr',
    phone: '+33 1 53 85 53 85',
    address: '2 rue Simone Veil, 93400 Saint-Ouen',
    website: 'https://www.iledefrance.fr',
    status: 'ACTIVE',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-15T14:30:00.000Z',
    programs: [
      {
        id: 'prog-1',
        title: 'Aide à la Transformation Numérique',
        status: 'PUBLISHED',
        deadline: '2024-06-30T23:59:59.000Z',
        _count: { applications: 45 }
      }
    ],
    _count: { programs: 5, applications: 120 }
  };

  res.json({
    success: true,
    data: mockOrganization
  });
});

// Company Settings API endpoints
app.get('/api/company/settings', (req, res) => {
  const mockSettings = {
    general: {
      companyName: 'Mon Entreprise Demo',
      email: 'contact@monentreprise.fr',
      phone: '+33 1 23 45 67 89',
      website: 'https://www.monentreprise.fr',
      language: 'fr',
      timezone: 'Europe/Paris',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      applicationUpdates: true,
      programRecommendations: true,
      marketingEmails: false,
      weeklyReports: true,
    },
    dashboard: {
      defaultView: 'overview',
      autoRefresh: true,
      refreshInterval: 300,
      theme: 'light',
      compactMode: false,
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: true,
      analyticsTracking: true,
      marketingCookies: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginNotifications: true,
    },
  };

  res.json({
    success: true,
    data: mockSettings,
    message: 'Settings retrieved successfully (mock mode)'
  });
});

app.put('/api/company/settings', (req, res) => {
  const settings = req.body;
  console.log('Updating company settings (mock mode):', settings);

  res.json({
    success: true,
    data: settings,
    message: 'Settings updated successfully (mock mode)'
  });
});

app.put('/api/company/settings/notifications', (req, res) => {
  const notificationSettings = req.body;
  console.log('Updating notification settings (mock mode):', notificationSettings);

  res.json({
    success: true,
    data: notificationSettings,
    message: 'Notification settings updated successfully (mock mode)'
  });
});

app.put('/api/company/settings/dashboard', (req, res) => {
  const dashboardSettings = req.body;
  console.log('Updating dashboard settings (mock mode):', dashboardSettings);

  res.json({
    success: true,
    data: dashboardSettings,
    message: 'Dashboard settings updated successfully (mock mode)'
  });
});

app.put('/api/company/settings/privacy', (req, res) => {
  const privacySettings = req.body;
  console.log('Updating privacy settings (mock mode):', privacySettings);

  res.json({
    success: true,
    data: privacySettings,
    message: 'Privacy settings updated successfully (mock mode)'
  });
});

app.put('/api/company/settings/security', (req, res) => {
  const securitySettings = req.body;
  console.log('Updating security settings (mock mode):', securitySettings);

  res.json({
    success: true,
    data: securitySettings,
    message: 'Security settings updated successfully (mock mode)'
  });
});

app.post('/api/company/settings/reset', (req, res) => {
  console.log('Resetting settings to defaults (mock mode)');

  const defaultSettings = {
    general: {
      companyName: '',
      email: '',
      phone: '',
      website: '',
      language: 'fr',
      timezone: 'Europe/Paris',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      applicationUpdates: true,
      programRecommendations: true,
      marketingEmails: false,
      weeklyReports: true,
    },
    dashboard: {
      defaultView: 'overview',
      autoRefresh: true,
      refreshInterval: 300,
      theme: 'light',
      compactMode: false,
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: false,
      analyticsTracking: false,
      marketingCookies: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginNotifications: true,
    },
  };

  res.json({
    success: true,
    data: defaultSettings,
    message: 'Settings reset to defaults successfully (mock mode)'
  });
});

app.get('/api/company/settings/export', (req, res) => {
  const mockSettings = {
    general: {
      companyName: 'Mon Entreprise Demo',
      email: 'contact@monentreprise.fr',
      phone: '+33 1 23 45 67 89',
      website: 'https://www.monentreprise.fr',
      language: 'fr',
      timezone: 'Europe/Paris',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      applicationUpdates: true,
      programRecommendations: true,
      marketingEmails: false,
      weeklyReports: true,
    },
    dashboard: {
      defaultView: 'overview',
      autoRefresh: true,
      refreshInterval: 300,
      theme: 'light',
      compactMode: false,
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: true,
      analyticsTracking: true,
      marketingCookies: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginNotifications: true,
    },
    exportInfo: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      type: 'company-settings'
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="company-settings.json"');
  res.json(mockSettings);
});

app.post('/api/company/settings/import', (req, res) => {
  const importedSettings = req.body;
  console.log('Importing settings (mock mode):', importedSettings);

  res.json({
    success: true,
    data: importedSettings,
    message: 'Settings imported successfully (mock mode)'
  });
});

// Company Profile API endpoints
app.get('/api/company/profile', (req, res) => {
  const mockProfile = {
    id: 'company-1',
    name: 'Mon Entreprise Demo',
    email: 'contact@monentreprise.fr',
    phone: '+33 1 23 45 67 89',
    website: 'https://www.monentreprise.fr',
    description: 'Entreprise de démonstration pour la plateforme GROWF',
    sector: 'Technologie',
    size: 'PME',
    siret: '12345678901234',
    address: {
      street: '123 Rue de la Demo',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockProfile,
    message: 'Company profile retrieved successfully (mock mode)'
  });
});

app.put('/api/company/profile', (req, res) => {
  const profileData = req.body;
  console.log('Updating company profile (mock mode):', profileData);

  const updatedProfile = {
    ...profileData,
    id: 'company-1',
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: updatedProfile,
    message: 'Company profile updated successfully (mock mode)'
  });
});

// Dashboard API endpoints
app.get('/api/dashboard/stats', (req, res) => {
  const { timeRange = '30d' } = req.query;
  console.log('Getting dashboard stats for time range:', timeRange);

  const mockStats = {
    applications: {
      total: 15,
      pending: 3,
      approved: 8,
      rejected: 4,
      recentlySubmitted: 2
    },
    programs: {
      available: 12,
      eligible: 8,
      applied: 5
    },
    company: {
      profileCompletion: 85,
      documentsUploaded: 12,
      lastActivity: new Date().toISOString()
    },
    timeline: [
      { date: '2024-01-01', applications: 2, approvals: 1 },
      { date: '2024-01-08', applications: 3, approvals: 2 },
      { date: '2024-01-15', applications: 1, approvals: 0 },
      { date: '2024-01-22', applications: 2, approvals: 1 }
    ]
  };

  res.json({
    success: true,
    data: mockStats,
    message: `Dashboard stats for ${timeRange} retrieved successfully (mock mode)`
  });
});

app.get('/api/dashboard/export', (req, res) => {
  const { format = 'csv', timeRange = '30d' } = req.query;
  console.log('Exporting dashboard data:', { format, timeRange });

  // Mock export data
  const exportData = {
    exportInfo: {
      format,
      timeRange,
      exportedAt: new Date().toISOString(),
      recordCount: 15
    },
    data: 'Application ID,Program,Status,Date,Amount\napp-1,Innovation Tech,Approved,2024-01-15,25000\napp-2,Digital Transform,Pending,2024-01-20,15000'
  };

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="dashboard-export.csv"');
    res.send(exportData.data);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="dashboard-export.${format}"`);
    res.json(exportData);
  }
});

app.post('/api/dashboard/refresh', (req, res) => {
  console.log('Refreshing dashboard data (mock mode)');

  res.json({
    success: true,
    message: 'Dashboard data refreshed successfully (mock mode)',
    timestamp: new Date().toISOString()
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found (mock mode)`
  });
});

// Gestionnaire d'erreurs global
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error (mock mode)'
  });
});

// Démarrage du serveur de développement
const port = config.port;
app.listen(port, () => {
  console.log(`🚧 Development server running on port ${port}`);
  console.log(`📖 Health check: http://localhost:${port}/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log('⚠️  This is a mock server for development - no real database connection');
  console.log('🔑 Mock SUPERADMIN: superadmin@growf.fr / SuperAdmin2024!');
  console.log('🔑 Mock ADMIN: jbedje@gmail.con / Cipme@2025');
  console.log('🔑 Mock COMPANY: company@test.fr / Test123!');
});