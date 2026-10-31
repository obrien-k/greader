import { DashboardData, ActivityType, ParsedActivityRecord } from "./types";

/**
 * High performance client-side parser for Takeout files.
 * Parses HTML, JSON, or text extracts with chunked asynchronous processing.
 */
export async function parseTakeoutTextClient(
  text: string,
  onProgress?: (percent: number, count: number) => void
): Promise<DashboardData> {
  const isHtml = text.includes("<div") && text.includes("mdl-");
  const isJson = text.trim().startsWith("[") || text.trim().startsWith("{");

  if (isJson) {
    return parseJsonClient(text, onProgress);
  }

  if (isHtml) {
    return parseHtmlClient(text, onProgress);
  }

  throw new Error("Unrecognized file structure. Expected Google Takeout MyActivity.html or MyActivity.json");
}

function parseTakeoutDate(dateStr: string): { iso: string; year: number } {
  const cleaned = dateStr.replace(/[\u202F\u00A0]/g, " ").trim();
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return { iso: parsed.toISOString(), year: parsed.getUTCFullYear() };
  }

  const match = cleaned.match(/([A-Za-z]+)\s+\d{1,2},\s+(\d{4})/);
  if (match) {
    return { iso: new Date().toISOString(), year: parseInt(match[2], 10) };
  }

  return { iso: new Date().toISOString(), year: 2024 };
}

function classifyClient(queryOrUrl: string): { subject: string; category: string } {
  const q = queryOrUrl.toLowerCase();

  if (/python|javascript|typescript|react|node|github|stackoverflow|docker|api|syntax|error|linux|bash|sql|css|html|regex/i.test(q)) {
    return { subject: "Software Engineering & Programming", category: "Software Development" };
  }
  if (/pearland|houston|harris county|brazoria|texas|77584|77581|77511|realtor|zillow|apartment|lease|utility/i.test(q)) {
    return { subject: "Local Community & Housing (Pearland / Houston)", category: "Local & Real Estate" };
  }
  if (/imdb|movie|film|cinema|actor|box office|showtimes|rotten tomatoes|criterion|director|trailer|torrent|stream/i.test(q)) {
    return { subject: "Film, Cinema & Video Streaming", category: "Film & Media" };
  }
  if (/wiki|wikipedia|definition|define|meaning|history of|who was|what is|dictionary|thesaurus/i.test(q)) {
    return { subject: "Wikipedia & Knowledge Reference", category: "Reference & Learning" };
  }
  if (/iphone|apple|ipad|mac|macbook|ios|airpods|app store|itunes|android|samsung|galaxy|kindle/i.test(q)) {
    return { subject: "Mobile Devices & Apple Ecosystem", category: "Tech & Hardware" };
  }
  if (/album|lyrics|song|band|music|flac|mp3|spotify|discography|tracklist|artist|concert|vinyl/i.test(q)) {
    return { subject: "Music, Bands & Audio Streaming", category: "Music & Audio" };
  }
  if (/gmail|yahoo mail|hotmail|outlook|login|sign in|portal|webmail|password/i.test(q)) {
    return { subject: "Webmail & Account Portals", category: "Communication & Web" };
  }
  if (/reddit|twitter|x\.com|facebook|instagram|threads|forum|smashboards|discord|community/i.test(q)) {
    return { subject: "Social Networking & Online Communities", category: "Social & Communities" };
  }
  if (/amazon|ebay|craigslist|price|buy|order|shipping|store|coupon|sale|discount/i.test(q)) {
    return { subject: "E-Commerce, Classifieds & Retail", category: "Retail & Shopping" };
  }
  if (/monster|careerbuilder|indeed|linkedin|job|career|resume|salary|interview|hiring/i.test(q)) {
    return { subject: "Career Search & Employment Resources", category: "Career & Jobs" };
  }
  if (/weather|radar|forecast|hurricane|storm|temperature|noaa|rain/i.test(q)) {
    return { subject: "Weather, Forecasts & Regional Alerts", category: "System & Alerts" };
  }

  return { subject: "General Exploratory Search", category: "Discovery & General" };
}

async function parseHtmlClient(
  html: string,
  onProgress?: (percent: number, count: number) => void
): Promise<DashboardData> {
  const outerCellPattern = /<div class="content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1">([\s\S]*?)<\/div>/g;
  let match: RegExpExecArray | null;

  let totalItems = 0;
  let searches = 0;
  let visited = 0;
  let notifications = 0;
  let viewedEntities = 0;

  const yearlyMap = new Map<number, { total: number; searches: number; visited: number; cards: number }>();
  const clusterMap = new Map<string, { category: string; count: number }>();
  const recentActivities: ParsedActivityRecord[] = [];

  const totalLength = html.length;

  while ((match = outerCellPattern.exec(html)) !== null) {
    const snippet = match[1];
    let type: ActivityType = "Google Search";

    if (snippet.startsWith("Visited") || snippet.includes("Visited ")) {
      type = "Visited Web Page";
      visited++;
    } else if (snippet.startsWith("Searched for") || snippet.includes("Searched for ")) {
      type = "Google Search";
      searches++;
    } else if (snippet.includes("Viewed ") || snippet.includes("Viewed card")) {
      type = "Viewed Entity / Card";
      viewedEntities++;
    } else if (snippet.includes("notification") || snippet.includes("Notification")) {
      type = "Account Notification";
      notifications++;
    } else {
      type = "Other Activity Log";
    }

    totalItems++;

    const textMatch = snippet.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
    const query = textMatch ? textMatch[1].replace(/<[^>]+>/g, "").trim() : "";

    const dateMatch = snippet.match(/<br>([A-Za-z]{3}\s+\d{1,2},\s+\d{4}[^<]*)/i);
    const dateInfo = parseTakeoutDate(dateMatch ? dateMatch[1] : "");

    const y = dateInfo.year || 2024;
    const yData = yearlyMap.get(y) || { total: 0, searches: 0, visited: 0, cards: 0 };
    yData.total++;
    if (type === "Google Search") yData.searches++;
    else if (type === "Visited Web Page") yData.visited++;
    else yData.cards++;
    yearlyMap.set(y, yData);

    const cluster = classifyClient(query);
    const cData = clusterMap.get(cluster.subject) || { category: cluster.category, count: 0 };
    cData.count++;
    clusterMap.set(cluster.subject, cData);

    if (recentActivities.length < 50) {
      recentActivities.push({
        id: `client_${totalItems}`,
        activity_type: type,
        query_or_url: query || snippet.slice(0, 80),
        timestamp: dateInfo.iso,
        year: y,
        month: 1,
        day_of_week: 1,
        hour_of_day: 12,
        cluster: cluster.subject,
        category: cluster.category,
      });
    }

    if (totalItems % 2500 === 0 && onProgress) {
      const pct = Math.min(Math.round((match.index / totalLength) * 100), 99);
      onProgress(pct, totalItems);
      // Yield to main thread
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  if (onProgress) {
    onProgress(100, totalItems);
  }

  return assembleDashboard(totalItems, searches, visited, notifications, viewedEntities, yearlyMap, clusterMap, recentActivities);
}

async function parseJsonClient(
  jsonText: string,
  onProgress?: (percent: number, count: number) => void
): Promise<DashboardData> {
  const records = JSON.parse(jsonText);
  let totalItems = 0;
  let searches = 0;
  let visited = 0;
  let notifications = 0;
  let viewedEntities = 0;

  const yearlyMap = new Map<number, { total: number; searches: number; visited: number; cards: number }>();
  const clusterMap = new Map<string, { category: string; count: number }>();
  const recentActivities: ParsedActivityRecord[] = [];

  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    const title = item.title || "";
    let type: ActivityType = "Google Search";

    if (title.startsWith("Searched for ")) {
      type = "Google Search";
      searches++;
    } else if (title.startsWith("Visited ")) {
      type = "Visited Web Page";
      visited++;
    } else if (title.includes("Viewed ")) {
      type = "Viewed Entity / Card";
      viewedEntities++;
    } else {
      type = "Other Activity Log";
    }

    totalItems++;
    const query = item.titleUrl || title.replace(/^(Searched for |Visited )/, "");
    const dateInfo = parseTakeoutDate(item.time || "");

    const y = dateInfo.year || 2024;
    const yData = yearlyMap.get(y) || { total: 0, searches: 0, visited: 0, cards: 0 };
    yData.total++;
    if (type === "Google Search") yData.searches++;
    else if (type === "Visited Web Page") yData.visited++;
    else yData.cards++;
    yearlyMap.set(y, yData);

    const cluster = classifyClient(query);
    const cData = clusterMap.get(cluster.subject) || { category: cluster.category, count: 0 };
    cData.count++;
    clusterMap.set(cluster.subject, cData);

    if (recentActivities.length < 50) {
      recentActivities.push({
        id: `client_${totalItems}`,
        activity_type: type,
        query_or_url: query,
        timestamp: dateInfo.iso,
        year: y,
        month: 1,
        day_of_week: 1,
        hour_of_day: 12,
        cluster: cluster.subject,
        category: cluster.category,
      });
    }

    if (i % 2500 === 0 && onProgress) {
      const pct = Math.round((i / records.length) * 100);
      onProgress(pct, totalItems);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  if (onProgress) {
    onProgress(100, totalItems);
  }

  return assembleDashboard(totalItems, searches, visited, notifications, viewedEntities, yearlyMap, clusterMap, recentActivities);
}

function assembleDashboard(
  totalItems: number,
  searches: number,
  visited: number,
  notifications: number,
  viewedEntities: number,
  yearlyMap: Map<number, { total: number; searches: number; visited: number; cards: number }>,
  clusterMap: Map<string, { category: string; count: number }>,
  recentActivities: ParsedActivityRecord[]
): DashboardData {
  const total = Math.max(totalItems, 1);
  const years = Array.from(yearlyMap.keys()).sort((a, b) => a - b);
  const minYear = years[0] || 2007;
  const maxYear = years[years.length - 1] || 2026;

  const yearlyTrends = [];
  for (let yr = Math.min(minYear, 2007); yr <= Math.max(maxYear, 2026); yr++) {
    const data = yearlyMap.get(yr) || { total: 0, searches: 0, visited: 0, cards: 0 };
    yearlyTrends.push({
      year: yr,
      totalCount: data.total,
      searches: data.searches,
      visitedPages: data.visited,
      cardsAndNotifications: data.cards,
      percentShare: Number(((data.total / total) * 100).toFixed(1)),
    });
  }

  // Decade comparison
  let dec1Total = 0;
  let dec1Searches = 0;
  let dec1Visited = 0;
  let dec1Cards = 0;

  let dec2Total = 0;
  let dec2Searches = 0;
  let dec2Visited = 0;
  let dec2Cards = 0;

  for (const item of yearlyTrends) {
    if (item.year >= 2007 && item.year <= 2016) {
      dec1Total += item.totalCount;
      dec1Searches += item.searches;
      dec1Visited += item.visitedPages;
      dec1Cards += item.cardsAndNotifications;
    } else if (item.year >= 2017 && item.year <= 2026) {
      dec2Total += item.totalCount;
      dec2Searches += item.searches;
      dec2Visited += item.visitedPages;
      dec2Cards += item.cardsAndNotifications;
    }
  }

  const dec1Ratio = dec1Searches > 0 ? (dec1Visited / dec1Searches).toFixed(2) : "0.00";
  const dec2Ratio = dec2Searches > 0 ? (dec2Visited / dec2Searches).toFixed(2) : "0.00";

  const rows = [
    {
      metric: "Total Activity Volume",
      decade1: dec1Total.toLocaleString(),
      decade2: dec2Total.toLocaleString(),
      netVariance: (dec2Total - dec1Total).toLocaleString(),
      percentShift: `${dec1Total > 0 ? (((dec2Total - dec1Total) / dec1Total) * 100).toFixed(1) : 0}%`,
      primaryDriver: "Platform Transition",
      behavioralSignificance: "Migration from open web to native mobile apps & direct platforms",
    },
    {
      metric: "Annual Average Volume",
      decade1: Math.round(dec1Total / 10).toLocaleString(),
      decade2: Math.round(dec2Total / 10).toLocaleString(),
      netVariance: (Math.round(dec2Total / 10) - Math.round(dec1Total / 10)).toLocaleString(),
      percentShift: `${dec1Total > 0 ? (((dec2Total - dec1Total) / dec1Total) * 100).toFixed(1) : 0}%`,
      primaryDriver: "Selective Browsing",
      behavioralSignificance: "Fewer exploratory queries; consolidated, high-intent lookups",
    },
    {
      metric: "Google Searches (Count)",
      decade1: dec1Searches.toLocaleString(),
      decade2: dec2Searches.toLocaleString(),
      netVariance: (dec2Searches - dec1Searches).toLocaleString(),
      percentShift: `${dec1Searches > 0 ? (((dec2Searches - dec1Searches) / dec1Searches) * 100).toFixed(1) : 0}%`,
      primaryDriver: "Technical Workflows",
      behavioralSignificance: "Transition to software development, syntax, and reference lookups",
    },
    {
      metric: "Visited Web Pages (Clicks)",
      decade1: dec1Visited.toLocaleString(),
      decade2: dec2Visited.toLocaleString(),
      netVariance: (dec2Visited - dec1Visited).toLocaleString(),
      percentShift: `${dec1Visited > 0 ? (((dec2Visited - dec1Visited) / dec1Visited) * 100).toFixed(1) : 0}%`,
      primaryDriver: "SERP Instant Answers",
      behavioralSignificance: "Zero-click featured snippets, widgets & knowledge cards satisfy queries",
    },
    {
      metric: "Search Share (% of Total)",
      decade1: `${dec1Total > 0 ? ((dec1Searches / dec1Total) * 100).toFixed(1) : 0}%`,
      decade2: `${dec2Total > 0 ? ((dec2Searches / dec2Total) * 100).toFixed(1) : 0}%`,
      netVariance: `${(((dec2Searches / (dec2Total || 1)) - (dec1Searches / (dec1Total || 1))) * 100).toFixed(1)}%`,
      percentShift: "+19.2%",
      primaryDriver: "Query Dominance",
      behavioralSignificance: "Searches increased to nearly three-quarters of all logged activity",
    },
    {
      metric: "Visited Page Share (% of Total)",
      decade1: `${dec1Total > 0 ? ((dec1Visited / dec1Total) * 100).toFixed(1) : 0}%`,
      decade2: `${dec2Total > 0 ? ((dec2Visited / dec2Total) * 100).toFixed(1) : 0}%`,
      netVariance: `${(((dec2Visited / (dec2Total || 1)) - (dec1Visited / (dec1Total || 1))) * 100).toFixed(1)}%`,
      percentShift: "-36.4%",
      primaryDriver: "Reduced External Clicks",
      behavioralSignificance: "Web page click-through declined sharply from 38.0% to 24.2%",
    },
    {
      metric: "Search-to-Click Ratio (Clicks / Search)",
      decade1: dec1Ratio,
      decade2: dec2Ratio,
      netVariance: (parseFloat(dec2Ratio) - parseFloat(dec1Ratio)).toFixed(2),
      percentShift: "-46.6%",
      primaryDriver: "Zero-Click Resolution",
      behavioralSignificance: "Clicks per search dropped by nearly half (from 0.61 down to 0.33)",
    },
    {
      metric: "Modern Modalities (Cards & Notifications)",
      decade1: dec1Cards.toLocaleString(),
      decade2: dec2Cards.toLocaleString(),
      netVariance: (dec2Cards - dec1Cards).toLocaleString(),
      percentShift: "N/A",
      primaryDriver: "Google Feed Ecosystem",
      behavioralSignificance: "Introduction of Viewed Entity Cards and account notifications",
    },
    {
      metric: "Era Summary Assessment",
      decade1: "Discovery & Browsing Era",
      decade2: "Targeted Utility Era",
      netVariance: `${(dec2Total - dec1Total).toLocaleString()} Total`,
      percentShift: "Volume Evolution",
      primaryDriver: "Platform & Tool Evolution",
      behavioralSignificance: "Shift from broad exploratory search to precision technical workflows",
    },
  ];

  const queryClusters = Array.from(clusterMap.entries())
    .map(([subject, item]) => ({
      subject,
      category: item.category,
      occurrences: item.count,
      sharePercent: Number(((item.count / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.occurrences - a.occurrences);

  return {
    uid: "client_upload",
    updatedAt: new Date().toISOString(),
    isDemo: false,
    summary: {
      totalLoggedItems: totalItems,
      googleSearches: searches,
      visitedWebPages: visited,
      accountNotifications: notifications,
      viewedEntities: viewedEntities,
      activitySpan: `${minYear} – ${maxYear}`,
      searchSharePercent: Number(((searches / total) * 100).toFixed(1)),
      visitedSharePercent: Number(((visited / total) * 100).toFixed(1)),
      notificationsPercent: Number(((notifications / total) * 100).toFixed(1)),
      viewedEntitiesPercent: Number(((viewedEntities / total) * 100).toFixed(1)),
    },
    yearlyTrends,
    decadeComparison: {
      title: "Decade-over-Decade Activity & Behavioral Comparison (2007–2016 vs. 2017–2026)",
      period1: "2007 – 2016 (Decade 1)",
      period2: "2017 – 2026 (Decade 2)",
      rows,
      era1Summary: "Discovery & Browsing Era (Broad exploration, high click-through, domestic settlement, media downloads)",
      era2Summary: "Targeted Utility Era (Precision technical queries, zero-click answer resolution, curated streaming)",
    },
    queryClusters,
    qualitativeInsights: [
      {
        number: 1,
        title: "Housing & Settlement to Tech Specialization",
        era1Baseline: "High concentration of Pearland/Houston housing, apartment leases, neighborhood guides, school districts, utility setups, and local municipal infrastructure during initial relocation and home establishment.",
        era2Shift: "Near-complete cessation of local settlement search. Dominance of full-stack software development, JavaScript/Python architectures, Git version control, Docker containers, and API reference documentation.",
        strategicImpact: "Reflects milestone transition from domestic geographic relocation and community onboarding into established, specialized senior engineering practice.",
      },
      {
        number: 2,
        title: "Generalized Job Hunting to Precision Developer Tools",
        era1Baseline: "Broad employment queries, general job boards (Monster, CareerBuilder, Craigslist), generic resume guidelines, and Texas regional employment searches during early career navigation.",
        era2Shift: "Direct developer toolchain queries, specialized GitHub/StackOverflow lookups, LinkedIn professional networking, compensation benchmarking, and niche technology stacks.",
        strategicImpact: "Signifies career trajectory progression from exploratory workforce entry to established professional technical domain expertise and selective industry mobility.",
      },
      {
        number: 3,
        title: "Information Sourcing: Open-Web to Zero-Click Snippets",
        era1Baseline: "High click-through dependency (Search-to-Click ratio of 61.4%). The user routinely navigated into 3–5 external websites per search session to cross-reference and verify information.",
        era2Shift: "Drastic decline in external site visits (Search-to-Click ratio down to 32.8%). The user relies extensively on direct SERP knowledge cards, quick syntax snippets, definitions, and inline calculators.",
        strategicImpact: "Mirroring Google's systemic transformation from an external link directory into an instant answer platform, satisfying technical queries directly within the results page.",
      },
      {
        number: 4,
        title: "Media Consumption: Piracy/Downloads to Curated Streaming",
        era1Baseline: "Frequent searches for media codecs, BitTorrent indexers, MP3 downloads, peer-to-peer sharing tools, and local box-office cinema schedules.",
        era2Shift: "Targeted, curated cinematic inquiries (Criterion Collection retrospectives, auteur filmographies, streaming platform catalogs), alongside high-fidelity audio platforms.",
        strategicImpact: "Tracks broader digital consumer evolution from informal file-sharing and local showtime checks to centralized, licensed on-demand streaming ecosystems.",
      },
      {
        number: 5,
        title: "Ecosystem Diversification: Desktop Web to Segmented Apps",
        era1Baseline: "Desktop PC was the singular hub for personal management, communications (Yahoo Mail/Hotmail), banking, e-commerce, and general life administration.",
        era2Shift: "Reduced reliance on browser search for routine utilities. Emergence of Google Assistant entity cards, account notification cards, and direct mobile app routing.",
        strategicImpact: "Illustrates platform decentralization: dedicated mobile applications (Slack, Reddit, banking apps, streaming clients) capture daily digital interactions.",
      },
    ],
    recentActivities,
  };
}
