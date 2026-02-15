import "dotenv/config";

export const CONFIG = {
  NVD_API_BASE_URL: "https://services.nvd.nist.gov/rest/json",
  NVD_API_KEY: process.env.APIKEY || "",
  FEED_URL: `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io/NVD-RSS-feed/feed.xml`,
  REPO_URL: `https://github.com/${process.env.GITHUB_REPOSITORY_OWNER}/NVD-RSS-feed`,
  MAX_FEED_ITEMS: 100,
  DEFAULT_LOOKBACK_HOURS: 24,
  NVD_DETAIL_BASE_URL: "https://nvd.nist.gov/vuln/detail",
  OUTPUT_DIR: "dist",
  OUTPUT_FILENAME: "feed.xml",
} as const;
