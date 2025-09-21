import { Request, Response } from 'express';

// Mock data for programs
const mockPrograms = [
  {
    id: 'prog-1',
    organizationId: 'org-1',
    title: 'Aide à la Transformation Numérique',
    description: 'Financement pour accompagner les entreprises dans leur transformation digitale. Ce programme vise à soutenir l\'adoption de nouvelles technologies, la digitalisation des processus métier et le développement de compétences numériques.',
    criteria: {
      minEmployees: 5,
      maxEmployees: 500,
      sectors: ['Numérique', 'Services', 'Commerce'],
      turnoverMin: 100000
    },
    amountMin: 5000,
    amountMax: 50000,
    deadline: '2024-06-30T23:59:59.000Z',
    status: 'PUBLISHED' as const,
    sector: ['Numérique', 'Services', 'Commerce'],
    companySize: ['TPE', 'PME'],
    location: ['Île-de-France', 'Auvergne-Rhône-Alpes'],
    tags: ['transformation', 'numérique', 'innovation'],
    requirements: {},
    applicationForm: {},
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    organization: {
      id: 'org-1',
      name: 'Région Île-de-France',
      type: 'REGION'
    },
    _count: {
      applications: 45
    }
  },
  {
    id: 'prog-2',
    organizationId: 'org-2',
    title: 'Subvention Innovation Industrielle',
    description: 'Soutien financier pour les projets d\'innovation dans le secteur industriel. Programme destiné aux entreprises développant de nouveaux procédés, produits ou services innovants.',
    criteria: {
      minEmployees: 10,
      maxEmployees: 1000,
      sectors: ['Industrie', 'Énergie'],
      hasRD: true
    },
    amountMin: 10000,
    amountMax: 200000,
    deadline: '2024-08-15T23:59:59.000Z',
    status: 'PUBLISHED' as const,
    sector: ['Industrie', 'Énergie'],
    companySize: ['PME', 'ETI'],
    location: ['Nouvelle-Aquitaine', 'Occitanie', 'Grand Est'],
    tags: ['innovation', 'industrie', 'R&D'],
    requirements: {},
    applicationForm: {},
    createdAt: '2024-02-01T09:00:00.000Z',
    updatedAt: '2024-02-01T09:00:00.000Z',
    organization: {
      id: 'org-2',
      name: 'France Relance',
      type: 'NATIONAL'
    },
    _count: {
      applications: 23
    }
  },
  {
    id: 'prog-3',
    organizationId: 'org-3',
    title: 'Développement Commerce Local',
    description: 'Aide aux commerces de proximité pour le développement de leur activité. Financement pour la modernisation, l\'extension ou l\'amélioration de l\'offre commerciale.',
    criteria: {
      maxEmployees: 50,
      sectors: ['Commerce', 'Services'],
      isLocalBusiness: true
    },
    amountMin: 2000,
    amountMax: 25000,
    deadline: '2024-12-31T23:59:59.000Z',
    status: 'PUBLISHED' as const,
    sector: ['Commerce', 'Services'],
    companySize: ['TPE', 'PME'],
    location: ['Bretagne', 'Pays de la Loire', 'Normandie'],
    tags: ['commerce', 'local', 'proximité'],
    requirements: {},
    applicationForm: {},
    createdAt: '2024-03-01T14:00:00.000Z',
    updatedAt: '2024-03-01T14:00:00.000Z',
    organization: {
      id: 'org-3',
      name: 'Chambre de Commerce Bretagne',
      type: 'CCI'
    },
    _count: {
      applications: 67
    }
  },
  {
    id: 'prog-4',
    organizationId: 'org-4',
    title: 'Transition Énergétique Entreprises',
    description: 'Financement pour les projets de transition énergétique et développement durable. Soutien aux entreprises souhaitant réduire leur empreinte carbone.',
    criteria: {
      minEmployees: 1,
      sectors: ['Énergie', 'Industrie', 'Agriculture'],
      hasGreenProject: true
    },
    amountMin: 15000,
    amountMax: 100000,
    deadline: '2024-09-30T23:59:59.000Z',
    status: 'PUBLISHED' as const,
    sector: ['Énergie', 'Industrie', 'Agriculture'],
    companySize: ['TPE', 'PME', 'ETI'],
    location: ['Provence-Alpes-Côte d\'Azur', 'Occitanie', 'Nouvelle-Aquitaine'],
    tags: ['énergie', 'environnement', 'durable'],
    requirements: {},
    applicationForm: {},
    createdAt: '2024-02-15T11:00:00.000Z',
    updatedAt: '2024-02-15T11:00:00.000Z',
    organization: {
      id: 'org-4',
      name: 'ADEME',
      type: 'AGENCE'
    },
    _count: {
      applications: 34
    }
  },
  {
    id: 'prog-5',
    organizationId: 'org-5',
    title: 'Innovation Santé Numérique',
    description: 'Programme de soutien aux innovations dans le domaine de la santé numérique. Destiné aux startups et PME développant des solutions e-santé.',
    criteria: {
      maxEmployees: 250,
      sectors: ['Santé', 'Numérique'],
      isHealthTech: true
    },
    amountMin: 20000,
    amountMax: 150000,
    deadline: '2024-07-31T23:59:59.000Z',
    status: 'PUBLISHED' as const,
    sector: ['Santé', 'Numérique'],
    companySize: ['TPE', 'PME'],
    location: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Hauts-de-France'],
    tags: ['santé', 'numérique', 'e-santé'],
    requirements: {},
    applicationForm: {},
    createdAt: '2024-01-20T16:00:00.000Z',
    updatedAt: '2024-01-20T16:00:00.000Z',
    organization: {
      id: 'org-5',
      name: 'Bpifrance',
      type: 'BANQUE'
    },
    _count: {
      applications: 18
    }
  },
  {
    id: 'prog-6',
    organizationId: 'org-6',
    title: 'Aide Formation Professionnelle',
    description: 'Soutien financier pour la formation professionnelle des salariés. Programme visant à améliorer les compétences et favoriser l\'employabilité.',
    criteria: {
      minEmployees: 2,
      maxEmployees: 300,
      sectors: ['Éducation', 'Services', 'Industrie'],
      hasTrainingPlan: true
    },
    amountMin: 3000,
    amountMax: 40000,
    deadline: '2024-11-30T23:59:59.000Z',
    status: 'PUBLISHED' as const,
    sector: ['Éducation', 'Services', 'Industrie'],
    companySize: ['TPE', 'PME', 'ETI'],
    location: ['Centre-Val de Loire', 'Bourgogne-Franche-Comté', 'Grand Est'],
    tags: ['formation', 'compétences', 'emploi'],
    requirements: {},
    applicationForm: {},
    createdAt: '2024-03-10T13:00:00.000Z',
    updatedAt: '2024-03-10T13:00:00.000Z',
    organization: {
      id: 'org-6',
      name: 'Pôle Emploi',
      type: 'SERVICE_PUBLIC'
    },
    _count: {
      applications: 91
    }
  }
];

interface ProgramFilters {
  search?: string;
  sector?: string;
  location?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class MockProgramController {
  // Get public programs with filtering and pagination
  static async getPublicPrograms(req: Request, res: Response) {
    try {
      const {
        search,
        sector,
        location,
        page = 1,
        limit = 12
      }: ProgramFilters = req.query;

      let filteredPrograms = mockPrograms.filter(program =>
        program.status === 'PUBLISHED'
      );

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPrograms = filteredPrograms.filter(program =>
          program.title.toLowerCase().includes(searchLower) ||
          program.description.toLowerCase().includes(searchLower) ||
          program.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          program.organization.name.toLowerCase().includes(searchLower)
        );
      }

      // Apply sector filter
      if (sector) {
        filteredPrograms = filteredPrograms.filter(program =>
          program.sector.includes(sector)
        );
      }

      // Apply location filter
      if (location) {
        filteredPrograms = filteredPrograms.filter(program =>
          program.location.includes(location)
        );
      }

      // Calculate pagination
      const pageNum = parseInt(page.toString());
      const limitNum = parseInt(limit.toString());
      const total = filteredPrograms.length;
      const totalPages = Math.ceil(total / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      const paginatedPrograms = filteredPrograms.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          programs: paginatedPrograms,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages
          }
        }
      });
    } catch (error) {
      console.error('Error in getPublicPrograms:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des programmes'
      });
    }
  }

  // Get public program by ID
  static async getPublicProgramById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const program = mockPrograms.find(p => p.id === id && p.status === 'PUBLISHED');

      if (!program) {
        return res.status(404).json({
          success: false,
          error: 'Programme non trouvé'
        });
      }

      res.json({
        success: true,
        data: program
      });
    } catch (error) {
      console.error('Error in getPublicProgramById:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du programme'
      });
    }
  }

  // Get all programs (protected route)
  static async getPrograms(req: Request, res: Response) {
    try {
      const {
        search,
        sector,
        location,
        status,
        page = 1,
        limit = 12
      }: ProgramFilters = req.query;

      let filteredPrograms = [...mockPrograms];

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPrograms = filteredPrograms.filter(program =>
          program.title.toLowerCase().includes(searchLower) ||
          program.description.toLowerCase().includes(searchLower) ||
          program.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Apply sector filter
      if (sector) {
        filteredPrograms = filteredPrograms.filter(program =>
          program.sector.includes(sector)
        );
      }

      // Apply location filter
      if (location) {
        filteredPrograms = filteredPrograms.filter(program =>
          program.location.includes(location)
        );
      }

      // Apply status filter
      if (status) {
        filteredPrograms = filteredPrograms.filter(program =>
          program.status === status
        );
      }

      // Calculate pagination
      const pageNum = parseInt(page.toString());
      const limitNum = parseInt(limit.toString());
      const total = filteredPrograms.length;
      const totalPages = Math.ceil(total / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      const paginatedPrograms = filteredPrograms.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          programs: paginatedPrograms,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages
          }
        }
      });
    } catch (error) {
      console.error('Error in getPrograms:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des programmes'
      });
    }
  }

  // Create program (protected route)
  static async createProgram(req: Request, res: Response) {
    try {
      const newProgram = {
        id: `prog-${Date.now()}`,
        organizationId: req.body.organizationId || 'org-1',
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organization: {
          id: 'org-1',
          name: 'Organisation Test',
          type: 'TEST'
        },
        _count: {
          applications: 0
        }
      };

      mockPrograms.push(newProgram);

      res.status(201).json({
        success: true,
        data: newProgram,
        message: 'Programme créé avec succès'
      });
    } catch (error) {
      console.error('Error in createProgram:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du programme'
      });
    }
  }

  // Get program by ID (protected route)
  static async getProgramById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const program = mockPrograms.find(p => p.id === id);

      if (!program) {
        return res.status(404).json({
          success: false,
          error: 'Programme non trouvé'
        });
      }

      res.json({
        success: true,
        data: program
      });
    } catch (error) {
      console.error('Error in getProgramById:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du programme'
      });
    }
  }

  // Update program (protected route)
  static async updateProgram(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const programIndex = mockPrograms.findIndex(p => p.id === id);

      if (programIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Programme non trouvé'
        });
      }

      mockPrograms[programIndex] = {
        ...mockPrograms[programIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: mockPrograms[programIndex],
        message: 'Programme mis à jour avec succès'
      });
    } catch (error) {
      console.error('Error in updateProgram:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour du programme'
      });
    }
  }

  // Delete program (protected route)
  static async deleteProgram(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const programIndex = mockPrograms.findIndex(p => p.id === id);

      if (programIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Programme non trouvé'
        });
      }

      mockPrograms.splice(programIndex, 1);

      res.json({
        success: true,
        message: 'Programme supprimé avec succès'
      });
    } catch (error) {
      console.error('Error in deleteProgram:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression du programme'
      });
    }
  }

  // Update program status (protected route)
  static async updateProgramStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const programIndex = mockPrograms.findIndex(p => p.id === id);

      if (programIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Programme non trouvé'
        });
      }

      mockPrograms[programIndex].status = status;
      mockPrograms[programIndex].updatedAt = new Date().toISOString();

      res.json({
        success: true,
        data: mockPrograms[programIndex],
        message: 'Statut du programme mis à jour avec succès'
      });
    } catch (error) {
      console.error('Error in updateProgramStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour du statut'
      });
    }
  }

  // Duplicate program (protected route)
  static async duplicateProgram(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const originalProgram = mockPrograms.find(p => p.id === id);

      if (!originalProgram) {
        return res.status(404).json({
          success: false,
          error: 'Programme non trouvé'
        });
      }

      const duplicatedProgram = {
        ...originalProgram,
        id: `prog-${Date.now()}`,
        title: `${originalProgram.title} (Copie)`,
        status: 'DRAFT' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          applications: 0
        }
      };

      mockPrograms.push(duplicatedProgram);

      res.status(201).json({
        success: true,
        data: duplicatedProgram,
        message: 'Programme dupliqué avec succès'
      });
    } catch (error) {
      console.error('Error in duplicateProgram:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la duplication du programme'
      });
    }
  }

  // Get program statistics (protected route)
  static async getProgramStatistics(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const program = mockPrograms.find(p => p.id === id);

      if (!program) {
        return res.status(404).json({
          success: false,
          error: 'Programme non trouvé'
        });
      }

      const statistics = {
        totalApplications: program._count?.applications || 0,
        applicationsByStatus: {
          'DRAFT': Math.floor((program._count?.applications || 0) * 0.2),
          'SUBMITTED': Math.floor((program._count?.applications || 0) * 0.3),
          'UNDER_REVIEW': Math.floor((program._count?.applications || 0) * 0.3),
          'APPROVED': Math.floor((program._count?.applications || 0) * 0.15),
          'REJECTED': Math.floor((program._count?.applications || 0) * 0.05)
        }
      };

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error in getProgramStatistics:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      });
    }
  }
}