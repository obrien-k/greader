import { genai } from "../config/gcp.js";

export interface ClusterMatch {
  subject: string;
  category: string;
}

interface RuleDefinition {
  subject: string;
  category: string;
  patterns: RegExp[];
}

const RULES: RuleDefinition[] = [
  {
    subject: "Software Engineering & Programming",
    category: "Software Development",
    patterns: [
      /\b(python|javascript|typescript|react|node|nodejs|github|git|stackoverflow|docker|kubernetes|api|sdk|npm|yarn|function|syntax|error|exception|debug|terminal|bash|zsh|linux|sql|postgres|mysql|css|html|regex|rust|golang|c\+\+|aws|cloud run|gcp|compiler|webpack|vite|nextjs)\b/i,
      /github\.com|stackoverflow\.com|developer\.mozilla\.org|npmjs\.com|w3schools\.com/i,
    ],
  },
  {
    subject: "Local Community & Housing (Pearland / Houston)",
    category: "Local & Real Estate",
    patterns: [
      /\b(pearland|houston|harris county|brazoria|texas|77584|77581|77511|centerpoint|reliant|ez tag|beltway 8|i-45|galveston|apartment|lease|rent|realtor|zillow|har\.com|mortgage|property tax)\b/i,
      /har\.com|zillow\.com|apartments\.com/i,
    ],
  },
  {
    subject: "Film, Cinema & Video Streaming",
    category: "Film & Media",
    patterns: [
      /\b(imdb|movie|film|cinema|actor|actress|box office|showtimes|rotten tomatoes|criterion|director|trailer|bluray|dvd|torrent|stream|netflix|hulu|letterboxd|cinemark|amc theater)\b/i,
      /imdb\.com|rottentomatoes\.com|netflix\.com|hulu\.com|letterboxd\.com/i,
    ],
  },
  {
    subject: "Wikipedia & Knowledge Reference",
    category: "Reference & Learning",
    patterns: [
      /\b(wiki|wikipedia|definition|define|meaning|etymology|history of|who is|who was|what is|how do|encyclopedia|dictionary|merriam|thesaurus|biography|synonym)\b/i,
      /wikipedia\.org|wiktionary\.org|merriam-webster\.com|dictionary\.com/i,
    ],
  },
  {
    subject: "Mobile Devices & Apple Ecosystem",
    category: "Tech & Hardware",
    patterns: [
      /\b(iphone|apple|ipad|mac|macbook|ios|icloud|airpods|app store|itunes|jailbreak|android|samsung|galaxy|pixel|kindle|tablet|touchscreen|headphone|usb-c|firmware)\b/i,
      /apple\.com|macrumors\.com|9to5mac\.com|androidcentral\.com/i,
    ],
  },
  {
    subject: "Music, Bands & Audio Streaming",
    category: "Music & Audio",
    patterns: [
      /\b(album|lyrics|song|band|music|flac|mp3|spotify|soundcloud|discography|tracklist|artist|tour|concert|vinyl|remix|pitchfork|stereogum|audio|guitar|chords)\b/i,
      /spotify\.com|soundcloud\.com|pitchfork\.com|genius\.com|discogs\.com|allmusic\.com/i,
    ],
  },
  {
    subject: "Webmail & Account Portals",
    category: "Communication & Web",
    patterns: [
      /\b(gmail|yahoo mail|hotmail|outlook|login|sign in|portal|webmail|password reset|inbox|account security|auth0|sso)\b/i,
      /mail\.google\.com|mail\.yahoo\.com|outlook\.live\.com/i,
    ],
  },
  {
    subject: "Social Networking & Online Communities",
    category: "Social & Communities",
    patterns: [
      /\b(reddit|twitter|x\.com|facebook|instagram|threads|forum|smashboards|discord|message board|community|subreddit|threads)\b/i,
      /reddit\.com|twitter\.com|x\.com|facebook\.com|smashboards\.com|discord\.com/i,
    ],
  },
  {
    subject: "E-Commerce, Classifieds & Retail",
    category: "Retail & Shopping",
    patterns: [
      /\b(amazon|ebay|craigslist|price|buy|order|shipping|tracking|coupon|sale|discount|store|cart|walmart|target|best buy|checkout|deal)\b/i,
      /amazon\.com|ebay\.com|craigslist\.org|walmart\.com|target\.com|bestbuy\.com/i,
    ],
  },
  {
    subject: "Career Search & Employment Resources",
    category: "Career & Jobs",
    patterns: [
      /\b(monster|careerbuilder|indeed|linkedin|job|career|resume|curriculum vitae|salary|compensation|interview|hiring|job board|recruiter|benefits|glassdoor)\b/i,
      /linkedin\.com|indeed\.com|glassdoor\.com|careerbuilder\.com|monster\.com/i,
    ],
  },
  {
    subject: "Weather, Forecasts & Regional Alerts",
    category: "System & Alerts",
    patterns: [
      /\b(weather|radar|forecast|hurricane|tropical storm|flood|temperature|noaa|national weather service|accuweather|dew point|rain)\b/i,
      /weather\.com|wunderground\.com|accuweather\.com|noaa\.gov/i,
    ],
  },
];

/**
 * Classifies a search query or URL into one of the 11 analytical clusters.
 * Uses high-speed regex matching first, with optional batch Gemini fallback.
 */
export function classifyQuery(text: string): ClusterMatch {
  if (!text) {
    return { subject: "Other Activity Log", category: "General Activity" };
  }

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        return { subject: rule.subject, category: rule.category };
      }
    }
  }

  return { subject: "General Exploratory Search", category: "Discovery & General" };
}

/**
 * Batch classify queries using Gemini API fallback when configured
 */
export async function batchClassifyWithGemini(
  queries: string[]
): Promise<Map<string, ClusterMatch>> {
  const results = new Map<string, ClusterMatch>();

  // If Gemini is not configured or queries list is empty, return early
  if (!genai || queries.length === 0) {
    return results;
  }

  try {
    const prompt = `Classify the following user search queries into the most appropriate category from this exact list:
- "Film, Cinema & Video Streaming" (Category: "Film & Media")
- "Wikipedia & Knowledge Reference" (Category: "Reference & Learning")
- "Mobile Devices & Apple Ecosystem" (Category: "Tech & Hardware")
- "Music, Bands & Audio Streaming" (Category: "Music & Audio")
- "Local Community & Housing (Pearland / Houston)" (Category: "Local & Real Estate")
- "Software Engineering & Programming" (Category: "Software Development")
- "Webmail & Account Portals" (Category: "Communication & Web")
- "Social Networking & Online Communities" (Category: "Social & Communities")
- "E-Commerce, Classifieds & Retail" (Category: "Retail & Shopping")
- "Career Search & Employment Resources" (Category: "Career & Jobs")
- "Weather, Forecasts & Regional Alerts" (Category: "System & Alerts")
- "General Exploratory Search" (Category: "Discovery & General")

Input Queries:
${JSON.stringify(queries.slice(0, 50))}

Return a JSON object mapping each query string to { "subject": string, "category": string }.`;

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    for (const [key, val] of Object.entries(parsed)) {
      if (val && typeof val === "object" && "subject" in val && "category" in val) {
        results.set(key, val as ClusterMatch);
      }
    }
  } catch (err) {
    console.warn("Gemini batch classification fallback skipped:", err);
  }

  return results;
}
