import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { config } from '../config/env';
import { AuthRequest } from '../types';

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync(config.upload.uploadPath)) {
  fs.mkdirSync(config.upload.uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: AuthRequest, file, cb) => {
    const userFolder = path.join(config.upload.uploadPath, req.user?.id || 'anonymous');
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }
    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10, // Maximum 10 fichiers par upload
  }
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);
export const uploadFields = upload.fields([
  { name: 'documents', maxCount: 10 },
  { name: 'images', maxCount: 5 }
]);

// Middleware pour gérer les erreurs d'upload
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Fichier trop volumineux'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Trop de fichiers'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Champ de fichier non autorisé'
      });
    }
  }

  if (error.message.includes('Type de fichier non autorisé')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  next(error);
};