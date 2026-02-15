import { XMLParser } from 'fast-xml-parser';
import { CONFIG } from './config';

export interface ExistingFeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

export interface ExistingFeedState {
  latestDate: Date | null;
  existingItems: ExistingFeedItem[];
}

/**
 * Fetch the existing RSS feed from GitHub Pages and extract:
 * 1. The latest pubDate (used as lastModStartDate for NVD API)
 * 2. All existing items (to merge with new results)
 */
export async function fetchExistingFeedState(): Promise<ExistingFeedState> {
  try {
    const response = await fetch(CONFIG.FEED_URL);
    if (!response.ok) {
      console.log(`No existing feed found (HTTP ${response.status}), using defaults`);
      return { latestDate: null, existingItems: [] };
    }

    const xml = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      isArray: (_name, jpath) => jpath === 'rss.channel.item',
    });
    const parsed = parser.parse(xml);

    const channel = parsed?.rss?.channel;
    if (!channel?.item) {
      return { latestDate: null, existingItems: [] };
    }

    const items: ExistingFeedItem[] = channel.item.map((item: any) => ({
      title: item.title ?? '',
      link: item.link ?? '',
      description: item.description ?? '',
      pubDate: item.pubDate ?? '',
      guid: item.guid?.['#text'] ?? item.guid ?? '',
    }));

    let latestDate: Date | null = null;
    for (const item of items) {
      if (item.pubDate) {
        const d = new Date(item.pubDate);
        if (!isNaN(d.getTime()) && (!latestDate || d > latestDate)) {
          latestDate = d;
        }
      }
    }

    return { latestDate, existingItems: items };
  } catch (error) {
    console.error('Failed to fetch existing feed:', error);
    return { latestDate: null, existingItems: [] };
  }
}
