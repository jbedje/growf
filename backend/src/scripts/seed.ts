import { PrismaClient, UserRole, CompanySize, ProgramStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin users
  const hashedPassword = await bcrypt.hash('SuperAdmin2024!', 12);
  const hashedCompanyPassword = await bcrypt.hash('Test123!', 12);
  const hashedOrgPassword = await bcrypt.hash('Org2024!', 12);
  const hashedAdminPassword = await bcrypt.hash('Cipme@2025', 12);

  // Create SUPERADMIN user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@growf.fr' },
    update: {},
    create: {
      email: 'superadmin@growf.fr',
      password: hashedPassword,
      role: UserRole.SUPERADMIN,
      isVerified: true,
    },
  });

  // Create ADMIN user
  const admin = await prisma.user.upsert({
    where: { email: 'jbedje@gmail.con' },
    update: {},
    create: {
      email: 'jbedje@gmail.con',
      password: hashedAdminPassword,
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  // Create test company user
  const companyUser = await prisma.user.upsert({
    where: { email: 'company@test.fr' },
    update: {},
    create: {
      email: 'company@test.fr',
      password: hashedCompanyPassword,
      role: UserRole.COMPANY,
      isVerified: true,
    },
  });

  // Create test organization user
  const orgUser = await prisma.user.upsert({
    where: { email: 'org@financement.fr' },
    update: {},
    create: {
      email: 'org@financement.fr',
      password: hashedOrgPassword,
      role: UserRole.ORGANIZATION,
      isVerified: true,
    },
  });

  // Create company profile
  const company = await prisma.company.upsert({
    where: { userId: companyUser.id },
    update: {},
    create: {
      userId: companyUser.id,
      name: 'TechInnovate SARL',
      siret: '12345678901234',
      sector: 'Numérique',
      size: CompanySize.SMALL,
      revenue: 500000,
      location: 'Île-de-France',
      address: '123 Rue de la Tech, 75001 Paris',
      phone: '+33 1 23 45 67 89',
      website: 'https://techinnovate.fr',
      description: 'Entreprise spécialisée dans le développement de solutions numériques innovantes.',
      foundedYear: 2020,
      employeeCount: 25,
      legalForm: 'SARL',
    },
  });

  // Create organization profile
  const organization = await prisma.organization.upsert({
    where: { userId: orgUser.id },
    update: {},
    create: {
      userId: orgUser.id,
      name: 'Région Île-de-France',
      type: 'REGION',
      description: 'Collectivité territoriale proposant des aides aux entreprises',
      website: 'https://iledefrance.fr',
      phone: '+33 1 53 85 53 85',
      address: '2 rue Simone Veil, 93400 Saint-Ouen',
      contactInfo: {
        email: 'contact@iledefrance.fr',
        department: 'Développement économique'
      },
    },
  });

  // Create test programs
  const programs = [
    {
      organizationId: organization.id,
      title: 'Aide à la Transformation Numérique',
      description: 'Financement pour accompagner les entreprises dans leur transformation digitale. Cette aide vise à soutenir les projets d\'innovation technologique et de digitalisation des processus.',
      criteria: {
        minEmployees: 5,
        maxEmployees: 500,
        minRevenue: 100000,
        sectors: ['Numérique', 'Services', 'Commerce'],
        locations: ['Île-de-France']
      },
      amountMin: 5000,
      amountMax: 50000,
      deadline: new Date('2024-06-30T23:59:59.000Z'),
      status: ProgramStatus.PUBLISHED,
      sector: ['Numérique', 'Services', 'Commerce'],
      companySize: [CompanySize.SMALL, CompanySize.MEDIUM],
      location: ['Île-de-France', 'Auvergne-Rhône-Alpes'],
      tags: ['transformation', 'numérique', 'innovation'],
      requirements: {
        documents: ['business_plan', 'financial_statements', 'project_description'],
        criteria: {
          projectDuration: '6-24 months',
          cofinancementMin: 20
        }
      },
      applicationForm: {
        sections: [
          {
            title: 'Informations projet',
            fields: [
              { name: 'projectTitle', type: 'text', required: true },
              { name: 'projectDescription', type: 'textarea', required: true },
              { name: 'budget', type: 'number', required: true }
            ]
          }
        ]
      }
    },
    {
      organizationId: organization.id,
      title: 'Subvention Innovation Industrielle',
      description: 'Soutien financier pour les projets d\'innovation dans le secteur industriel, favorisant la recherche et développement.',
      criteria: {
        minEmployees: 10,
        maxEmployees: 1000,
        minRevenue: 500000,
        sectors: ['Industrie', 'Énergie'],
        locations: ['Nouvelle-Aquitaine', 'Occitanie', 'Grand Est']
      },
      amountMin: 10000,
      amountMax: 200000,
      deadline: new Date('2024-08-15T23:59:59.000Z'),
      status: ProgramStatus.PUBLISHED,
      sector: ['Industrie', 'Énergie'],
      companySize: [CompanySize.MEDIUM, CompanySize.LARGE],
      location: ['Nouvelle-Aquitaine', 'Occitanie', 'Grand Est'],
      tags: ['innovation', 'industrie', 'R&D'],
      requirements: {
        documents: ['business_plan', 'rd_project', 'financial_plan'],
        criteria: {
          rdBudgetMin: 50000,
          projectDuration: '12-36 months'
        }
      }
    },
    {
      organizationId: organization.id,
      title: 'Développement Commerce Local',
      description: 'Aide aux commerces de proximité pour le développement de leur activité et l\'amélioration de leur visibilité.',
      criteria: {
        maxEmployees: 50,
        maxRevenue: 2000000,
        sectors: ['Commerce', 'Services'],
        locations: ['Bretagne', 'Pays de la Loire', 'Normandie']
      },
      amountMin: 2000,
      amountMax: 25000,
      deadline: new Date('2024-12-31T23:59:59.000Z'),
      status: ProgramStatus.PUBLISHED,
      sector: ['Commerce', 'Services'],
      companySize: [CompanySize.MICRO, CompanySize.SMALL],
      location: ['Bretagne', 'Pays de la Loire', 'Normandie'],
      tags: ['commerce', 'local', 'proximité'],
      requirements: {
        documents: ['business_plan', 'market_study'],
        criteria: {
          localImpact: true,
          projectDuration: '3-12 months'
        }
      }
    }
  ];

  for (const programData of programs) {
    await prisma.program.create({
      data: programData,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`Created users:`);
  console.log(`- SUPERADMIN: superadmin@growf.fr`);
  console.log(`- ADMIN: jbedje@gmail.con`);
  console.log(`- COMPANY: company@test.fr`);
  console.log(`- ORGANIZATION: org@financement.fr`);
  console.log(`Created ${programs.length} programs`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });