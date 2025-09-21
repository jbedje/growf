import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';

async function createSuperAdmin() {
  try {
    // Vérifier si un SUPERADMIN existe déjà
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: UserRole.SUPERADMIN }
    });

    if (existingSuperAdmin) {
      console.log('❌ Un compte SUPERADMIN existe déjà');
      console.log(`Email: ${existingSuperAdmin.email}`);
      return;
    }

    // Informations du SUPERADMIN par défaut
    const superAdminData = {
      email: 'superadmin@growf.fr',
      password: 'SuperAdmin2024!',
      role: UserRole.SUPERADMIN
    };

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(superAdminData.password, saltRounds);

    // Créer le compte SUPERADMIN
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminData.email,
        password: hashedPassword,
        role: superAdminData.role,
        isVerified: true, // Compte vérifié par défaut
        isActive: true
      }
    });

    console.log('✅ Compte SUPERADMIN créé avec succès !');
    console.log('📧 Email:', superAdminData.email);
    console.log('🔑 Mot de passe:', superAdminData.password);
    console.log('🚨 IMPORTANT: Changez ce mot de passe après la première connexion !');
    console.log('🆔 ID utilisateur:', superAdmin.id);

  } catch (error) {
    console.error('❌ Erreur lors de la création du SUPERADMIN:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
createSuperAdmin();