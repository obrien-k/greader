import { Writable } from "stream";
import { Parser } from "htmlparser2";
import unzipper from "unzipper";
import { ParsedActivityRecord, ActivityType } from "../types/index.js";
import { classifyQuery } from "./classifier.js";

export interface ParserOptions {
  onRecord: (record: ParsedActivityRecord) => Promise<void> | void;
  onBatch?: (records: ParsedActivityRecord[]) => Promise<void> | void;
  batchSize?: number;
  onProgress?: (count: number) => void;
}

/**
 * Parses Takeout timestamp strings into ISO-8601 strings.
 * Handles formats like:
 * - "Dec 4, 2014, 5:09:56 AM CDT"
 * - "Oct 30, 2026, 8:51:00 AM UTC"
 * - ISO-8601 strings
 */
export function parseTakeoutDate(dateStr: string): {
  iso: string;
  year: number;
  month: number;
  day_of_week: number;
  hour_of_day: number;
} {
  const cleaned = dateStr.replace(/[\u202F\u00A0]/g, " ").trim();
  const parsedDate = new Date(cleaned);

  if (!isNaN(parsedDate.getTime())) {
    return {
      iso: parsedDate.toISOString(),
      year: parsedDate.getUTCFullYear(),
      month: parsedDate.getUTCMonth() + 1,
      day_of_week: parsedDate.getUTCDay(),
      hour_of_day: parsedDate.getUTCHours(),
    };
  }

  // Regex fallback for non-standard timezone abbreviations
  const match = cleaned.match(/([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4}),\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    const [, monthStr, dayStr, yearStr, hStr, mStr, sStr, ampm] = match;
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const m = months[monthStr.toLowerCase().slice(0, 3)] ?? 0;
    let hours = parseInt(hStr, 10);
    if (ampm) {
      if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
    }
    const d = new Date(Date.UTC(parseInt(yearStr, 10), m, parseInt(dayStr, 10), hours, parseInt(mStr, 10), parseInt(sStr, 10)));
    return {
      iso: d.toISOString(),
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day_of_week: d.getUTCDay(),
      hour_of_day: d.getUTCHours(),
    };
  }

  const now = new Date();
  return {
    iso: now.toISOString(),
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day_of_week: now.getUTCDay(),
    hour_of_day: now.getUTCHours(),
  };
}

/**
 * Creates an O(1) memory Writable stream that processes Google Takeout MyActivity.html
 */
export function createHtmlTakeoutParserStream(options: ParserOptions): Writable {
  const batchSize = options.batchSize || 500;
  let batch: ParsedActivityRecord[] = [];
  let totalProcessed = 0;

  // Parser state machine
  let inContentCell = false;
  let currentText = "";
  let currentHref = "";
  let inAnchor = false;
  let anchorText = "";

  const flushRecord = async () => {
    const text = currentText.trim();
    if (!text) return;

    let activityType: ActivityType = "Google Search";
    let queryOrUrl = anchorText || currentHref || "";

    if (text.startsWith("Visited") || text.includes("Visited ")) {
      activityType = "Visited Web Page";
    } else if (text.startsWith("Searched for") || text.includes("Searched for ")) {
      activityType = "Google Search";
    } else if (text.includes("Viewed card") || text.includes("Viewed entity") || text.includes("Viewed ")) {
      activityType = "Viewed Entity / Card";
    } else if (text.includes("notification") || text.includes("Notification")) {
      activityType = "Account Notification";
    } else {
      activityType = "Other Activity Log";
    }

    if (!queryOrUrl) {
      const match = text.match(/(?:Searched for|Visited)\s+([^<\n\r]+)/i);
      queryOrUrl = match ? match[1].trim() : text.slice(0, 100);
    }

    // Extract date from text
    const dateMatch = text.match(/([A-Za-z]{3}\s+\d{1,2},\s+\d{4},\s+\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM)?[^<\n\r]*)/i);
    const dateInfo = parseTakeoutDate(dateMatch ? dateMatch[1] : "");

    const classification = classifyQuery(queryOrUrl);

    const record: ParsedActivityRecord = {
      id: `act_${dateInfo.year}_${totalProcessed}`,
      activity_type: activityType,
      query_or_url: queryOrUrl,
      timestamp: dateInfo.iso,
      year: dateInfo.year,
      month: dateInfo.month,
      day_of_week: dateInfo.day_of_week,
      hour_of_day: dateInfo.hour_of_day,
      cluster: classification.subject,
      category: classification.category,
    };

    batch.push(record);
    totalProcessed++;

    if (options.onRecord) {
      await options.onRecord(record);
    }

    if (options.onProgress && totalProcessed % 1000 === 0) {
      options.onProgress(totalProcessed);
    }

    if (batch.length >= batchSize) {
      if (options.onBatch) {
        await options.onBatch([...batch]);
      }
      batch = [];
    }
  };

  const htmlParser = new Parser(
    {
      onopentag(name, attribs) {
        if (name === "div" && attribs.class && attribs.class.includes("content-cell")) {
          // If we encounter a primary content cell with the body text
          if (attribs.class.includes("mdl-typography--body-1") && !attribs.class.includes("mdl-typography--text-right")) {
            inContentCell = true;
            currentText = "";
            currentHref = "";
            anchorText = "";
          }
        } else if (inContentCell && name === "a") {
          inAnchor = true;
          currentHref = attribs.href || "";
          anchorText = "";
        }
      },
      ontext(text) {
        if (inContentCell) {
          currentText += text;
          if (inAnchor) {
            anchorText += text;
          }
        }
      },
      onclosetag(name) {
        if (inContentCell && name === "a") {
          inAnchor = false;
        } else if (inContentCell && name === "div") {
          inContentCell = false;
          flushRecord().catch(console.error);
        }
      },
    },
    { decodeEntities: true }
  );

  const stream = new Writable({
    write(chunk, encoding, callback) {
      htmlParser.write(chunk.toString());
      callback();
    },
    async final(callback) {
      htmlParser.end();
      if (batch.length > 0 && options.onBatch) {
        try {
          await options.onBatch([...batch]);
          batch = [];
        } catch (err) {
          return callback(err as Error);
        }
      }
      if (options.onProgress) {
        options.onProgress(totalProcessed);
      }
      callback();
    },
  });

  return stream;
}

/**
 * Parses JSON format Google Takeout export
 */
export async function parseJsonTakeoutStream(
  jsonStream: NodeJS.ReadableStream,
  options: ParserOptions
): Promise<number> {
  const chunks: Buffer[] = [];
  for await (const chunk of jsonStream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const content = Buffer.concat(chunks).toString("utf-8");
  const rawArray = JSON.parse(content);

  let totalProcessed = 0;
  const batchSize = options.batchSize || 500;
  let batch: ParsedActivityRecord[] = [];

  for (const item of rawArray) {
    const title = item.title || "";
    let activityType: ActivityType = "Google Search";
    let queryOrUrl = "";

    if (title.startsWith("Searched for ")) {
      activityType = "Google Search";
      queryOrUrl = title.replace("Searched for ", "").trim();
    } else if (title.startsWith("Visited ")) {
      activityType = "Visited Web Page";
      queryOrUrl = item.titleUrl || title.replace("Visited ", "").trim();
    } else if (title.includes("Viewed ") || item.header === "Discover") {
      activityType = "Viewed Entity / Card";
      queryOrUrl = item.titleUrl || title;
    } else {
      activityType = "Other Activity Log";
      queryOrUrl = title;
    }

    const dateInfo = parseTakeoutDate(item.time || "");
    const classification = classifyQuery(queryOrUrl);

    const record: ParsedActivityRecord = {
      id: `act_${dateInfo.year}_${totalProcessed}`,
      activity_type: activityType,
      query_or_url: queryOrUrl,
      timestamp: dateInfo.iso,
      year: dateInfo.year,
      month: dateInfo.month,
      day_of_week: dateInfo.day_of_week,
      hour_of_day: dateInfo.hour_of_day,
      product: item.products?.[0] || "Search",
      cluster: classification.subject,
      category: classification.category,
    };

    batch.push(record);
    totalProcessed++;

    if (options.onRecord) {
      await options.onRecord(record);
    }

    if (batch.length >= batchSize) {
      if (options.onBatch) {
        await options.onBatch([...batch]);
      }
      batch = [];
    }
  }

  if (batch.length > 0 && options.onBatch) {
    await options.onBatch([...batch]);
  }

  return totalProcessed;
}

/**
 * Extracts and parses Takeout ZIP file stream.
 * Accurately targets the primary Google Search activity export (Search/MyActivity.html or Search/MyActivity.json),
 * avoiding accidental false positives like "Video Search" or premature loop termination.
 */
export async function parseTakeoutZipStream(
  zipStream: NodeJS.ReadableStream,
  options: ParserOptions
): Promise<void> {
  const zip = zipStream.pipe(unzipper.Parse({ forceStream: true }));
  let parsedAny = false;

  for await (const entry of zip) {
    const filePath = entry.path;
    const type = entry.type; // 'Directory' or 'File'

    if (type === "File") {
      // Specifically target Google Search activity file:
      // Matches "Takeout/My Activity/Search/MyActivity.html", "Search/MyActivity.html", or root "MyActivity.html"
      // Crucially rejects "Video Search", "Image Search", "Voice Match", etc.
      const isMainSearchHtml =
        /(^|\/)Search\/MyActivity\.(html|htm)$/i.test(filePath) ||
        filePath.toLowerCase() === "myactivity.html";

      const isMainSearchJson =
        /(^|\/)Search\/MyActivity\.json$/i.test(filePath) ||
        filePath.toLowerCase() === "myactivity.json";

      if (isMainSearchHtml) {
        console.log(`[Takeout ZIP Parser] Streaming and parsing primary Search HTML: ${filePath}`);
        const parserStream = createHtmlTakeoutParserStream(options);
        await new Promise<void>((resolve, reject) => {
          entry.pipe(parserStream).on("finish", resolve).on("error", reject);
        });
        parsedAny = true;
      } else if (isMainSearchJson) {
        console.log(`[Takeout ZIP Parser] Streaming and parsing primary Search JSON: ${filePath}`);
        await parseJsonTakeoutStream(entry, options);
        parsedAny = true;
      } else {
        entry.autodrain();
      }
    } else {
      entry.autodrain();
    }
  }

  if (!parsedAny) {
    console.warn("[Takeout ZIP Parser] Notice: No Search/MyActivity.* found in ZIP archive.");
  }
}
