export interface CompanyPortalInfo {
  insurerName: string;
  portalUrl: string;
  domain: string;
  supportPhone: string;
  irdaiUinPrefix: string;
}

export const COMPANY_PORTALS: Record<string, CompanyPortalInfo> = {
  'Star Health Insurance': {
    insurerName: 'Star Health and Allied Insurance Co. Ltd.',
    portalUrl: 'https://www.starhealth.in',
    domain: 'starhealth.in',
    supportPhone: '1800 425 2255',
    irdaiUinPrefix: 'SHAHLIP',
  },
  'HDFC ERGO General Insurance': {
    insurerName: 'HDFC ERGO General Insurance Co. Ltd.',
    portalUrl: 'https://www.hdfcergo.com',
    domain: 'hdfcergo.com',
    supportPhone: '022 6234 6234',
    irdaiUinPrefix: 'HDFHLIP',
  },
  'Care Health Insurance': {
    insurerName: 'Care Health Insurance Ltd.',
    portalUrl: 'https://www.careinsurance.com',
    domain: 'careinsurance.com',
    supportPhone: '1800 102 4488',
    irdaiUinPrefix: 'CHIHLIP',
  },
  'Niva Bupa Health Insurance': {
    insurerName: 'Niva Bupa Health Insurance Co. Ltd.',
    portalUrl: 'https://www.nivabupa.com',
    domain: 'nivabupa.com',
    supportPhone: '1860 500 8888',
    irdaiUinPrefix: 'NBHLIP',
  },
  'Life Insurance Corporation of India (LIC)': {
    insurerName: 'Life Insurance Corporation of India',
    portalUrl: 'https://licindia.in',
    domain: 'licindia.in',
    supportPhone: '022 6827 6827',
    irdaiUinPrefix: 'LICLIP',
  },
  'HDFC Life Insurance': {
    insurerName: 'HDFC Life Insurance Co. Ltd.',
    portalUrl: 'https://www.hdfclife.com',
    domain: 'hdfclife.com',
    supportPhone: '1860 267 9999',
    irdaiUinPrefix: 'HDFLIP',
  },
  'ICICI Lombard General Insurance': {
    insurerName: 'ICICI Lombard General Insurance Co. Ltd.',
    portalUrl: 'https://www.icicilombard.com',
    domain: 'icicilombard.com',
    supportPhone: '1800 2666',
    irdaiUinPrefix: 'ICIMOT',
  },
  'ACKO General Insurance': {
    insurerName: 'ACKO General Insurance Ltd.',
    portalUrl: 'https://www.acko.com',
    domain: 'acko.com',
    supportPhone: '1800 266 2256',
    irdaiUinPrefix: 'ACKMOT',
  },
  'Aditya Birla Health Insurance': {
    insurerName: 'Aditya Birla Health Insurance Co. Ltd.',
    portalUrl: 'https://www.adityabirlacapital.com/healthinsurance',
    domain: 'adityabirlacapital.com',
    supportPhone: '1800 270 7000',
    irdaiUinPrefix: 'ABHIP',
  },
  'Bajaj Allianz General Insurance': {
    insurerName: 'Bajaj Allianz General Insurance Co. Ltd.',
    portalUrl: 'https://www.bajajallianz.com',
    domain: 'bajajallianz.com',
    supportPhone: '1800 209 5858',
    irdaiUinPrefix: 'BAGIC',
  },
  'Tata AIG General Insurance': {
    insurerName: 'Tata AIG General Insurance Co. Ltd.',
    portalUrl: 'https://www.tataaig.com',
    domain: 'tataaig.com',
    supportPhone: '1800 266 7780',
    irdaiUinPrefix: 'TATAGIC',
  },
  'SBI General Insurance': {
    insurerName: 'SBI General Insurance Co. Ltd.',
    portalUrl: 'https://www.sbigeneral.in',
    domain: 'sbigeneral.in',
    supportPhone: '1800 102 1111',
    irdaiUinPrefix: 'SBIGIC',
  },
  'The New India Assurance Co. Ltd.': {
    insurerName: 'The New India Assurance Co. Ltd.',
    portalUrl: 'https://www.newindia.co.in',
    domain: 'newindia.co.in',
    supportPhone: '1800 209 1415',
    irdaiUinPrefix: 'NIAIC',
  },
  'Go Digit General Insurance': {
    insurerName: 'Go Digit General Insurance Ltd.',
    portalUrl: 'https://www.godigit.com',
    domain: 'godigit.com',
    supportPhone: '1800 258 4242',
    irdaiUinPrefix: 'DIGIT',
  },
  'ManipalCigna Health Insurance': {
    insurerName: 'ManipalCigna Health Insurance Co. Ltd.',
    portalUrl: 'https://www.manipalcigna.com',
    domain: 'manipalcigna.com',
    supportPhone: '1800 102 4462',
    irdaiUinPrefix: 'MANIPAL',
  },
  'Narayana Health Insurance': {
    insurerName: 'Narayana Health Insurance Ltd.',
    portalUrl: 'https://www.narayanahealth.org/insurance',
    domain: 'narayanahealth.org',
    supportPhone: '1800 309 0309',
    irdaiUinPrefix: 'NARAYANA',
  },
  'National Insurance Co. Ltd.': {
    insurerName: 'National Insurance Co. Ltd.',
    portalUrl: 'https://nationalinsurance.nic.co.in',
    domain: 'nationalinsurance.nic.co.in',
    supportPhone: '1800 345 0330',
    irdaiUinPrefix: 'NATINS',
  },
  'The Oriental Insurance Co. Ltd.': {
    insurerName: 'The Oriental Insurance Co. Ltd.',
    portalUrl: 'https://orientalinsurance.org.in',
    domain: 'orientalinsurance.org.in',
    supportPhone: '1800 11 8485',
    irdaiUinPrefix: 'OICL',
  },
  'United India Insurance Co. Ltd.': {
    insurerName: 'United India Insurance Co. Ltd.',
    portalUrl: 'https://uiic.co.in',
    domain: 'uiic.co.in',
    supportPhone: '1800 425 33333',
    irdaiUinPrefix: 'UIIC',
  },
  'Reliance General Insurance': {
    insurerName: 'Reliance General Insurance Co. Ltd.',
    portalUrl: 'https://www.reliancegeneral.co.in',
    domain: 'reliancegeneral.co.in',
    supportPhone: '1800 3009',
    irdaiUinPrefix: 'RGICL',
  },
};

export function getCompanyPortalInfo(insurerName: string): CompanyPortalInfo {
  // Check exact match first
  if (COMPANY_PORTALS[insurerName]) {
    return COMPANY_PORTALS[insurerName];
  }

  // Check substring match
  const lower = insurerName.toLowerCase();
  for (const key of Object.keys(COMPANY_PORTALS)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return COMPANY_PORTALS[key];
    }
  }

  if (lower.includes('star')) return COMPANY_PORTALS['Star Health Insurance'];
  if (lower.includes('hdfc ergo')) return COMPANY_PORTALS['HDFC ERGO General Insurance'];
  if (lower.includes('care')) return COMPANY_PORTALS['Care Health Insurance'];
  if (lower.includes('niva') || lower.includes('bupa')) return COMPANY_PORTALS['Niva Bupa Health Insurance'];
  if (lower.includes('lic')) return COMPANY_PORTALS['Life Insurance Corporation of India (LIC)'];
  if (lower.includes('hdfc life')) return COMPANY_PORTALS['HDFC Life Insurance'];
  if (lower.includes('icici')) return COMPANY_PORTALS['ICICI Lombard General Insurance'];
  if (lower.includes('acko')) return COMPANY_PORTALS['ACKO General Insurance'];
  if (lower.includes('digit')) return COMPANY_PORTALS['Go Digit General Insurance'];
  if (lower.includes('new india')) return COMPANY_PORTALS['The New India Assurance Co. Ltd.'];

  // Default fallback
  const fallbackDomain = insurerName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  return {
    insurerName: insurerName,
    portalUrl: `https://www.${fallbackDomain}`,
    domain: fallbackDomain,
    supportPhone: '1800-110-001',
    irdaiUinPrefix: 'IRDAI',
  };
}
