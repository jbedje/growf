import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorization';
import { DocumentController } from '../controllers/documentController';
import { UserRole } from '@prisma/client';

const router = Router();

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    // Générer un nom unique pour éviter les conflits
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Types de fichiers autorisés
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Upload d'un document pour une candidature
router.post('/upload/:applicationId', upload.single('document'), DocumentController.uploadDocument);

// Récupérer les documents d'une candidature
router.get('/application/:applicationId', DocumentController.getApplicationDocuments);

// Télécharger un document spécifique
router.get('/download/:documentId', DocumentController.downloadDocument);

// Supprimer un document (seulement par le propriétaire ou admin)
router.delete('/:documentId', DocumentController.deleteDocument);

// Mettre à jour les métadonnées d'un document
router.patch('/:documentId', DocumentController.updateDocument);

export default router;