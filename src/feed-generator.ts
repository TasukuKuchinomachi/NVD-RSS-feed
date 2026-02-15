import { Feed } from 'feed';
import { CONFIG } from './config';
import { extractCvssInfo } from './cvss';
import type { DefCveItem } from './api/nvd/cves/2.0/schema/response';
import type { ExistingFeedItem } from './feed-state';

interface FeedItemData {
  id: string;
  title: string;
  link: string;
  description: string;
  date: Date;
}

function cveToFeedItem(item: DefCveItem): FeedItemData {
  const cve = item.cve;
  const cvss = extractCvssInfo(cve);

  const enDesc = cve.descriptions.find((d: { lang: string }) => d.lang === 'en')?.value
    ?? cve.descriptions[0]?.value
    ?? 'No description available';

  let title = cve.id;
  if (cvss) {
    title += ` [${cvss.version} ${cvss.baseScore} ${cvss.baseSeverity}]`;
  }

  let description = enDesc;
  if (cvss) {
    description += `\n\nScore: ${cvss.baseScore} (${cvss.baseSeverity})\nVector: ${cvss.vectorString}`;
  }

  return {
    id: cve.id,
    title,
    link: `${CONFIG.NVD_DETAIL_BASE_URL}/${cve.id}`,
    description,
    date: new Date(cve.lastModified),
  };
}

function existingToFeedItem(item: ExistingFeedItem): FeedItemData {
  const id = item.guid || item.link.split('/').pop() || '';
  return {
    id,
    title: item.title,
    link: item.link,
    description: item.description,
    date: new Date(item.pubDate),
  };
}

/**
 * Generate RSS 2.0 XML from new CVEs merged with existing feed items.
 * Deduplicates by CVE-ID (new items take precedence).
 * Keeps at most MAX_FEED_ITEMS, sorted by date descending.
 */
export function generateFeed(newCves: DefCveItem[], existingItems: ExistingFeedItem[]): string {
  const newItems = newCves.map(cveToFeedItem);
  const oldItems = existingItems.map(existingToFeedItem);

  // Merge: new items overwrite old items with the same CVE-ID
  const itemMap = new Map<string, FeedItemData>();
  for (const item of oldItems) {
    itemMap.set(item.id, item);
  }
  for (const item of newItems) {
    itemMap.set(item.id, item);
  }

  const allItems = Array.from(itemMap.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, CONFIG.MAX_FEED_ITEMS);

  const feed = new Feed({
    title: 'NVD CVE Feed',
    description: 'Latest CVE entries from the National Vulnerability Database. This product uses the NVD API but is not endorsed or certified by the NVD.',
    id: CONFIG.FEED_URL,
    link: CONFIG.REPO_URL,
    language: 'en',
    updated: allItems.length > 0 ? allItems[0].date : new Date(),
    copyright: 'National Vulnerability Database - NIST',
  });

  for (const item of allItems) {
    feed.addItem({
      title: item.title,
      id: item.id,
      link: item.link,
      description: item.description,
      date: item.date,
    });
  }

  return feed.rss2();
}
