import { initClient } from '@ts-rest/core';
import { nvdContract } from './api/nvd/contract';
import { CONFIG } from './config';
import type { DefCveItem } from './api/nvd/cves/2.0/schema/response';

// NVD API can be slow; allow up to 2 minutes per attempt before aborting.
const REQUEST_TIMEOUT_MS = 120_000;
const MAX_RETRIES = 3;

const client = initClient(nvdContract, {
  baseUrl: CONFIG.NVD_API_BASE_URL,
  baseHeaders: CONFIG.NVD_API_KEY ? { apiKey: CONFIG.NVD_API_KEY } : {},
  api: async ({ path, method, headers, body }) => {
    const result = await fetch(path, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const contentType = result.headers.get('content-type');
    if (contentType && (contentType.includes('application/') || contentType.includes('text/json'))) {
      return { status: result.status, body: await result.json(), headers: result.headers };
    }
    return { status: result.status, body: await result.text(), headers: result.headers };
  },
});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPageWithRetry(
  lastModStartDate: string,
  lastModEndDate: string,
  startIndex: number,
) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await client.getCves({
        query: {
          lastModStartDate,
          lastModEndDate,
          resultsPerPage: 2000,
          startIndex,
        },
      });
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        const delay = 10_000 * Math.pow(2, attempt);
        console.log(`  Request failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${(err as Error).message}. Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
  // unreachable, but satisfies TypeScript
  throw new Error('exceeded max retries');
}

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
    const { status, body } = await fetchPageWithRetry(lastModStartDate, lastModEndDate, startIndex);

    if (status !== 200) {
      throw new Error(`NVD API error: HTTP ${status}`);
    }

    allItems.push(...body.vulnerabilities);
    console.log(`  Fetched ${body.vulnerabilities.length} items (total: ${allItems.length}/${body.totalResults})`);

    if (allItems.length >= body.totalResults) break;
    startIndex += body.resultsPerPage;

    // Rate limit: 50 req/30s with key, 5 req/30s without
    await sleep(CONFIG.NVD_API_KEY ? 600 : 6000);
  }

  return allItems;
}
