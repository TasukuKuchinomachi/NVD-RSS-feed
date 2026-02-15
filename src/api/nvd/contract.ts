import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

const NvdCveQuerySchema = z.object({
  cpeName: z.string().optional(),
  cveId: z.string().optional(),
  cveTag: z.enum(['disputed', 'unsupported-when-assigned', 'exclusively-hosted-service']).optional(),
  cvssV2Metrics: z.string().optional(),
  cvssV2Severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  cvssV3Metrics: z.string().optional(),
  cvssV3Severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  cvssV4Metrics: z.string().optional(),
  cvssV4Severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  cweId: z.string().optional(),
  hasCertAlerts: z.boolean().optional(),
  hasCertNotes: z.boolean().optional(),
  hasKev: z.boolean().optional(),
  hasOval: z.boolean().optional(),
  isVulnerable: z.boolean().optional(),
  kevStartDate: z.string().optional(),
  kevEndDate: z.string().optional(),
  keywordExactMatch: z.boolean().optional(),
  keywordSearch: z.string().optional(),
  lastModStartDate: z.string().optional(),
  lastModEndDate: z.string().optional(),
  noRejected: z.boolean().optional(),
  pubStartDate: z.string().optional(),
  pubEndDate: z.string().optional(),
  resultsPerPage: z.number().optional(),
  startIndex: z.number().optional(),
  sourceIdentifier: z.string().optional(),
  versionEnd: z.string().optional(),
  versionEndType: z.enum(['including', 'excluding']).optional(),
  versionStart: z.string().optional(),
  versionStartType: z.enum(['including', 'excluding']).optional(),
  virtualMatchString: z.string().optional(),
});

const NvdCveResponseSchema = z.object({
  resultsPerPage: z.number(),
  startIndex: z.number(),
  totalResults: z.number(),
  format: z.string(),
  version: z.string(),
  timestamp: z.string(),
  vulnerabilities: z.array(z.any()),
});

export const nvdContract = c.router({
  getCves: {
    method: 'GET',
    path: '/cves/2.0',
    query: NvdCveQuerySchema,
    responses: {
      200: NvdCveResponseSchema,
    },
  },
});
