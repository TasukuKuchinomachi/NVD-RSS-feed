import { initClient } from '@ts-rest/core';
import { nvdContract } from './api/nvd/contract';
import { CONFIG } from './config';
import type { DefCveItem } from './api/nvd/cves/2.0/schema/response';

const client = initClient(nvdContract, {
  baseUrl: CONFIG.NVD_API_BASE_URL,
  baseHeaders: CONFIG.NVD_API_KEY ? { apiKey: CONFIG.NVD_API_KEY } : {},
});

/**
 * Fetch CVEs modified since the given date, handling pagination.
 */
export async function fetchModifiedCves(since: Date, until: Date = new Date()): Promise<DefCveItem[]> {
  const allItems: DefCveItem[] = [];
  let startIndex = 0;

  const lastModStartDate = since.toISOString();
  const lastModEndDate = until.toISOString();

  console.log(`Querying NVD API: ${lastModStartDate} to ${lastModEndDate}`);

  while (true) {
    const { status, body } = await client.getCves({
      query: {
        lastModStartDate,
        lastModEndDate,
        resultsPerPage: 2000,
        startIndex,
      },
    });

    if (status !== 200) {
      throw new Error(`NVD API error: HTTP ${status}`);
    }

    allItems.push(...body.vulnerabilities);
    console.log(`  Fetched ${body.vulnerabilities.length} items (total: ${allItems.length}/${body.totalResults})`);

    if (allItems.length >= body.totalResults) break;
    startIndex += body.resultsPerPage;

    // Rate limit: 50 req/30s with key, 5 req/30s without
    await new Promise(resolve => setTimeout(resolve, CONFIG.NVD_API_KEY ? 600 : 6000));
  }

  return allItems;
}
