export interface CRPValidationResult {
  isValid: boolean;
  message?: string;
  data?: {
    name: string;
    status: string;
    state: string;
  };
}

export const validateCRPFormat = (crp: string): boolean => {

  const crpRegex = /^\d{2}\/\d{5}$/;
  return crpRegex.test(crp);
};

export const formatCRPNumber = (value: string): string => {

  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  } else {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 7)}`;
  }
};

export const validateCRPWithAPI = async (
  crp: string,
  state: string
): Promise<CRPValidationResult> => {
  if (!validateCRPFormat(crp)) {
    return {
      isValid: false,
      message: 'Formato de CRP inválido. Use o formato XX/XXXXX',
    };
  }

  try {
    // TODO: Implement actual CRP validation API call
    // For now, simulate validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock validation - in real implementation, call the CRP API
    const mockValidation = Math.random() > 0.3; // 70% chance of valid CRP

    if (mockValidation) {
      return {
        isValid: true,
        message: 'CRP válido e ativo',
        data: {
          name: 'Psicólogo Exemplo',
          status: 'Ativo',
          state: state.toUpperCase(),
        },
      };
    } else {
      return {
        isValid: false,
        message: 'CRP não encontrado ou inativo',
      };
    }
  } catch (error) {
    console.error('Error validating CRP:', error);
    return {
      isValid: false,
      message: 'Erro ao validar CRP. Tente novamente.',
    };
  }
};

export const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

export const getCRPRegionFromState = (state: string): string => {
  // Map Brazilian states to CRP regions
  const stateToRegion: { [key: string]: string } = {
    AC: '21',
    AL: '17',
    AP: '20',
    AM: '20',
    BA: '03',
    CE: '11',
    DF: '01',
    ES: '16',
    GO: '09',
    MA: '22',
    MT: '18',
    MS: '14',
    MG: '04',
    PA: '10',
    PB: '13',
    PR: '08',
    PE: '02',
    PI: '21',
    RJ: '05',
    RN: '17',
    RS: '07',
    RO: '23',
    RR: '20',
    SC: '12',
    SP: '06',
    SE: '19',
    TO: '23',
  };

  return stateToRegion[state] || '01';
};