import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CONFIG } from './config';
import { fetchExistingFeedState } from './feed-state';
import { fetchModifiedCves } from './nvd-client';
import { generateFeed } from './feed-generator';

async function main() {
  console.log('=== NVD RSS Feed Generator ===');

  // Step 1: Fetch existing feed state from GitHub Pages
  console.log('Fetching existing feed state...');
  const { latestDate, existingItems } = await fetchExistingFeedState();

  // Step 2: Determine query start date
  let since: Date;
  if (latestDate) {
    console.log(`Latest item date: ${latestDate.toISOString()}`);
    since = latestDate;
  } else {
    since = new Date(Date.now() - CONFIG.DEFAULT_LOOKBACK_HOURS * 60 * 60 * 1000);
    console.log(`No existing feed. Using default lookback: ${since.toISOString()}`);
  }

  // Step 3: Query NVD API
  const now = new Date();
  const newCves = await fetchModifiedCves(since, now);
  console.log(`Found ${newCves.length} new/modified CVEs`);

  // Step 4: Generate RSS feed
  console.log('Generating RSS feed...');
  const rssXml = generateFeed(newCves, existingItems);

  // Step 5: Write to dist/
  const outputDir = join(process.cwd(), CONFIG.OUTPUT_DIR);
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, CONFIG.OUTPUT_FILENAME);
  writeFileSync(outputPath, rssXml, 'utf-8');
  console.log(`Written to ${outputPath}`);

  console.log('=== Done ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
