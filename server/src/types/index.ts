export type ActivityType =
  | "Google Search"
  | "Visited Web Page"
  | "Account Notification"
  | "Viewed Entity / Card"
  | "Other Activity Log";

export interface ParsedActivityRecord {
  id?: string;
  activity_type: ActivityType;
  query_or_url: string;
  timestamp: string; // ISO-8601 UTC string
  year: number;
  month: number;
  day_of_week: number;
  hour_of_day: number;
  product?: string;
  cluster?: string;
  category?: string;
}

export interface ExecutiveSummary {
  totalLoggedItems: number;
  googleSearches: number;
  visitedWebPages: number;
  accountNotifications: number;
  viewedEntities: number;
  activitySpan: string;
  searchSharePercent: number;
  visitedSharePercent: number;
  notificationsPercent: number;
  viewedEntitiesPercent: number;
}

export interface YearlyTrend {
  year: number;
  totalCount: number;
  searches: number;
  visitedPages: number;
  cardsAndNotifications: number;
  percentShare: number;
}

export interface DecadeMetricRow {
  metric: string;
  decade1: string; // 2007 - 2016
  decade2: string; // 2017 - 2026
  netVariance: string;
  percentShift: string;
  primaryDriver: string;
  behavioralSignificance: string;
}

export interface DecadeComparison {
  title: string;
  period1: string;
  period2: string;
  rows: DecadeMetricRow[];
  era1Summary: string;
  era2Summary: string;
}

export interface QueryCluster {
  subject: string;
  category: string;
  occurrences: number;
  sharePercent: number;
}

export interface QualitativeInsight {
  number: number;
  title: string;
  era1Baseline: string;
  era2Shift: string;
  strategicImpact: string;
}

export interface DashboardData {
  uid: string;
  updatedAt: string;
  summary: ExecutiveSummary;
  yearlyTrends: YearlyTrend[];
  decadeComparison: DecadeComparison;
  queryClusters: QueryCluster[];
  qualitativeInsights: QualitativeInsight[];
  recentActivities?: ParsedActivityRecord[];
  isDemo?: boolean;
}
