import axios from 'axios';
import { prisma } from './prisma';

interface CrpValidationResult {
  isValid: boolean;
  name?: string;
  status?: string;
  specialty?: string;
  message?: string;
}

export class UploadService {
  // Validar CRP através de APIs externas ou simulação
  static async validateCrp(crpNumber: string, state: string): Promise<CrpValidationResult> {
    try {
      // Verificar formato básico
      const crpRegex = /^\d{2}\/\d{5}$/;
      if (!crpRegex.test(crpNumber)) {
        return {
          isValid: false,
          message: "Formato do CRP inválido. Use o formato: XX/XXXXX"
        };
      }

      // Verificar se já existe no banco
      const existingCrp = await prisma.user.findFirst({
        where: { 
          crpNumber,
          isPsychologist: true,
          NOT: { crpStatus: 'rejected' }
        }
      });

      if (existingCrp) {
        return {
          isValid: false,
          message: "Este CRP já está cadastrado no sistema"
        };
      }

      // Aqui você pode integrar com APIs reais do CRP
      // Por exemplo, a API do Conselho Federal de Psicologia
      // Por enquanto, vamos simular a validação
      
      // Simular validação (em produção, usar API real)
      const simulatedValidation = await this.simulateCrpValidation(crpNumber, state);
      
      return simulatedValidation;
    } catch (error) {
      console.error('Erro na validação do CRP:', error);
      return {
        isValid: false,
        message: "Erro interno na validação do CRP"
      };
    }
  }

  // Simulação de validação do CRP (substituir por API real em produção)
  private static async simulateCrpValidation(crpNumber: string, state: string): Promise<CrpValidationResult> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulação de base de dados de CRPs válidos (apenas alguns exemplos para teste)
    const validCrps = [
      { crp: "06/12345", state: "SP", name: "Dr. João Silva", specialty: "Psicologia Clínica" },
      { crp: "05/23456", state: "RJ", name: "Dra. Maria Santos", specialty: "Neuropsicologia" },
      { crp: "04/34567", state: "MG", name: "Dr. Pedro Costa", specialty: "Psicologia Organizacional" },
      { crp: "07/45678", state: "SP", name: "Dra. Ana Oliveira", specialty: "Psicologia Infantil" },
      { crp: "08/56789", state: "RS", name: "Dr. Carlos Mendes", specialty: "Psicologia Social" }
    ];

    // Verificar se o CRP está na lista simulada
    const foundCrp = validCrps.find(crp => crp.crp === crpNumber && crp.state === state);

    if (foundCrp) {
      return {
        isValid: true,
        name: foundCrp.name,
        status: "active",
        specialty: foundCrp.specialty
      };
    }

    // Validações adicionais para tornar mais realista
    const crpParts = crpNumber.split('/');
    const region = parseInt(crpParts[0]);
    const number = parseInt(crpParts[1]);

    // Rejeitar números claramente inválidos
    if (region < 1 || region > 23) {
      return {
        isValid: false,
        message: "Região do CRP inválida. Deve estar entre 01 e 23."
      };
    }

    // Rejeitar números sequenciais óbvios (11111, 12345, etc.)
    const numberStr = crpParts[1];
    const isSequential = /^(\d)\1{4}$/.test(numberStr) || 
                        numberStr === "12345" || 
                        numberStr === "54321" ||
                        numberStr === "00000" ||
                        numberStr === "99999";

    if (isSequential) {
      return {
        isValid: false,
        message: "Número do CRP inválido. Números sequenciais não são aceitos."
      };
    }

    // Verificar se a região corresponde ao estado informado
    const regionStateMap: { [key: number]: string[] } = {
      1: ["DF"], // Distrito Federal
      2: ["PE"], // Pernambuco  
      3: ["BA"], // Bahia
      4: ["MG"], // Minas Gerais
      5: ["RJ"], // Rio de Janeiro
      6: ["SP"], // São Paulo
      7: ["RS"], // Rio Grande do Sul
      8: ["PR"], // Paraná
      9: ["GO"], // Goiás
      10: ["CE"], // Ceará
      11: ["SC"], // Santa Catarina
      12: ["PB"], // Paraíba
      13: ["AL"], // Alagoas
      14: ["RN"], // Rio Grande do Norte
      15: ["MT"], // Mato Grosso
      16: ["ES"], // Espírito Santo
      17: ["PI"], // Piauí
      18: ["SE"], // Sergipe
      19: ["MA"], // Maranhão
      20: ["MS"], // Mato Grosso do Sul
      21: ["AM"], // Amazonas
      22: ["RO"], // Rondônia
      23: ["AC", "AP", "PA", "RR", "TO"] // Região Norte
    };

    const validStatesForRegion = regionStateMap[region];
    if (!validStatesForRegion || !validStatesForRegion.includes(state)) {
      return {
        isValid: false,
        message: `CRP da região ${region.toString().padStart(2, '0')} não corresponde ao estado ${state}.`
      };
    }

    // Para todos os outros casos, considerar inválido por não estar na base de dados
    return {
      isValid: false,
      message: "CRP não encontrado na base de dados do Conselho Federal de Psicologia."
    };
  }

  // Validar arquivos de upload
  static validateUploadFiles(files: { [fieldname: string]: Express.Multer.File[] }): boolean {
    if (!files.identityFront || !files.identityBack) {
      return false;
    }

    const frontFile = files.identityFront[0];
    const backFile = files.identityBack[0];

    // Verificar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (frontFile.size > maxSize || backFile.size > maxSize) {
      return false;
    }

    // Verificar tipos de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(frontFile.mimetype) || !allowedTypes.includes(backFile.mimetype)) {
      return false;
    }

    return true;
  }

  // Processar upload de documentos
  static processDocumentUpload(files: { [fieldname: string]: Express.Multer.File[] }): { 
    identityFrontPhoto: string; 
    identityBackPhoto: string; 
  } | null {
    if (!this.validateUploadFiles(files)) {
      return null;
    }

    const frontFile = files.identityFront[0];
    const backFile = files.identityBack[0];

    return {
      identityFrontPhoto: `/uploads/identity/${frontFile.filename}`,
      identityBackPhoto: `/uploads/identity/${backFile.filename}`
    };
  }
} 