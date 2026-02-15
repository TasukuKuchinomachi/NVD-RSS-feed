/**
 * NVD CVE API 2.0 Request Parameters
 * @see https://nvd.nist.gov/developers/vulnerabilities
 */

/** CVSS v2 severity levels */
export type CvssV2Severity = 'LOW' | 'MEDIUM' | 'HIGH';

/** CVSS v3/v4 severity levels */
export type CvssV3V4Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** CVE contextual tags */
export type CveTag = 'disputed' | 'unsupported-when-assigned' | 'exclusively-hosted-service';

/** Version range type */
export type VersionType = 'including' | 'excluding';

/**
 * Query parameters for NVD CVE API
 * All date parameters should be in ISO-8601 format: YYYY-MM-DDThh:mm:ss.sssZ
 * Date ranges have a maximum of 120 days
 */
export interface NvdCveQueryParams {
  /** Filters CVEs by specific CPE URI */
  cpeName?: string;

  /** Retrieves a single CVE by its unique identifier */
  cveId?: string;

  /** Filters by CVE contextual tags */
  cveTag?: CveTag;

  /** Filters by CVSS v2 vector string (mutually exclusive with v3/v4) */
  cvssV2Metrics?: string;

  /** Filters by CVSS v2 severity */
  cvssV2Severity?: CvssV2Severity;

  /** Filters by CVSS v3 vector string (mutually exclusive with v2/v4) */
  cvssV3Metrics?: string;

  /** Filters by CVSS v3 severity */
  cvssV3Severity?: CvssV3V4Severity;

  /** Filters by CVSS v4 vector string (mutually exclusive with v2/v3) */
  cvssV4Metrics?: string;

  /** Filters by CVSS v4 severity */
  cvssV4Severity?: CvssV3V4Severity;

  /** Filters by Common Weakness Enumeration identifier (e.g., CWE-79) */
  cweId?: string;

  /** Returns CVEs with US-CERT Technical Alerts */
  hasCertAlerts?: boolean;

  /** Returns CVEs with CERT/CC Vulnerability Notes */
  hasCertNotes?: boolean;

  /** Returns CVEs in CISA Known Exploited Vulnerabilities catalog */
  hasKev?: boolean;

  /** Returns CVEs with MITRE OVAL information */
  hasOval?: boolean;

  /** Filters CVEs marked as vulnerable for given CPE (requires cpeName) */
  isVulnerable?: boolean;

  /** Start date for KEV catalog addition (requires kevEndDate) */
  kevStartDate?: string;

  /** End date for KEV catalog addition (requires kevStartDate) */
  kevEndDate?: string;

  /** Returns exact phrase matches in descriptions (requires keywordSearch) */
  keywordExactMatch?: boolean;

  /** Filters by keywords/phrases in CVE description */
  keywordSearch?: string;

  /** Start date for CVE last modification (requires lastModEndDate) */
  lastModStartDate?: string;

  /** End date for CVE last modification (requires lastModStartDate) */
  lastModEndDate?: string;

  /** Excludes REJECT or Rejected status CVEs */
  noRejected?: boolean;

  /** Start date for CVE publication (requires pubEndDate) */
  pubStartDate?: string;

  /** End date for CVE publication (requires pubStartDate) */
  pubEndDate?: string;

  /** Maximum results per response (default/max: 2000) */
  resultsPerPage?: number;

  /** Zero-based offset for pagination */
  startIndex?: number;

  /** Filters by exact data source identifier */
  sourceIdentifier?: string;

  /** Ending version for CPE range (requires virtualMatchString and versionStart) */
  versionEnd?: string;

  /** Whether versionEnd is including or excluding */
  versionEndType?: VersionType;

  /** Starting version for CPE range (requires virtualMatchString and versionEnd) */
  versionStart?: string;

  /** Whether versionStart is including or excluding */
  versionStartType?: VersionType;

  /** Filters CPEs more broadly than cpeName (supports version ranges) */
  virtualMatchString?: string;
}
