// ═══════════════════════════════════════════════════════════════
//  OSINT Monitor — Backend Server
//  Collects real data from: RSS feeds, GDELT, Pikud HaOref
//  Serves the frontend as static files
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const RSSParser = require('rss-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const rssParser = new RSSParser();

// ─── In-memory event store ───
let events = [];
const MAX_EVENTS = 500;

// ─── Helper: assign country from text ───
const COUNTRY_KEYWORDS = {
  IL: ['israel', 'israeli', 'ישראל', 'tel aviv', 'jerusalem', 'gaza', 'תל אביב', 'ירושלים', 'עזה', 'negev', 'נגב', 'haifa', 'חיפה', 'beer sheva', 'באר שבע'],
  IR: ['iran', 'iranian', 'tehran', 'איראן', 'טהרן', 'isfahan', 'אספהאן', 'persian'],
  YE: ['yemen', 'yemeni', 'houthi', 'תימן', 'חות\'י', 'sanaa', 'צנעא'],
  LB: ['lebanon', 'lebanese', 'hezbollah', 'לבנון', 'חיזבאללה', 'beirut', 'ביירות'],
  SY: ['syria', 'syrian', 'damascus', 'סוריה', 'דמשק', 'aleppo', 'חאלב'],
  IQ: ['iraq', 'iraqi', 'baghdad', 'עיראק', 'בגדד'],
  SA: ['saudi', 'riyadh', 'סעודיה', 'ריאד'],
  AE: ['uae', 'emirates', 'dubai', 'abu dhabi', 'אמירויות', 'דובאי'],
  JO: ['jordan', 'jordanian', 'amman', 'ירדן', 'עמאן'],
  KW: ['kuwait', 'כווית'],
  BH: ['bahrain', 'בחריין'],
  QA: ['qatar', 'doha', 'קטאר', 'דוחא'],
};

const COUNTRY_DATA = {
  IL: { name: 'ישראל', lat: 31.77, lng: 35.21 },
  IR: { name: 'איראן', lat: 32.42, lng: 53.69 },
  YE: { name: 'תימן', lat: 15.55, lng: 48.52 },
  LB: { name: 'לבנון', lat: 33.85, lng: 35.86 },
  SY: { name: 'סוריה', lat: 34.80, lng: 38.99 },
  IQ: { name: 'עיראק', lat: 33.22, lng: 43.68 },
  SA: { name: 'סעודיה', lat: 23.88, lng: 45.08 },
  AE: { name: 'אמירויות', lat: 23.42, lng: 53.85 },
  JO: { name: 'ירדן', lat: 30.59, lng: 36.24 },
  KW: { name: 'כווית', lat: 29.31, lng: 47.48 },
  BH: { name: 'בחריין', lat: 26.07, lng: 50.55 },
  QA: { name: 'קטאר', lat: 25.35, lng: 51.18 },
};

function detectCountry(text) {
  const lower = text.toLowerCase();
  for (const [code, keywords] of Object.entries(COUNTRY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return code;
    }
  }
  return null;
}

function classifyEventType(text) {
  const lower = text.toLowerCase();
  if (/missile|rocket|intercept|טיל|רקטה|יירוט|iron dome|כיפת ברזל/.test(lower)) return { id: 'missile', label: 'התרעת טילים', icon: '🚀', color: '#d32f2f' };
  if (/airstrike|bombing|air raid|תקיפה אווירית|הפצצה/.test(lower)) return { id: 'airstrike', label: 'תקיפה אווירית', icon: '💥', color: '#e65100' };
  if (/troops|military|convoy|army|צבא|שיירה|כוחות|תרגיל/.test(lower)) return { id: 'military', label: 'תנועה צבאית', icon: '🎖️', color: '#f9a825' };
  if (/earthquake|seismic|רעידה|סייסמי/.test(lower)) return { id: 'seismic', label: 'אירוע סייסמי', icon: '🌍', color: '#6a1b9a' };
  if (/navy|naval|ship|warship|ספינה|ימי|חיל הים/.test(lower)) return { id: 'naval', label: 'פעילות ימית', icon: '🚢', color: '#1565c0' };
  if (/cyber|hack|ddos|סייבר|האקר/.test(lower)) return { id: 'cyber', label: 'מתקפת סייבר', icon: '💻', color: '#00897b' };
  if (/fire|blaze|שריפה|thermal/.test(lower)) return { id: 'fire', label: 'שריפה', icon: '🔥', color: '#bf360c' };
  if (/diplomat|un |united nations|דיפלומט|או"ם/.test(lower)) return { id: 'diplomatic', label: 'דיפלומטי', icon: '🏛️', color: '#757575' };
  return { id: 'general', label: 'כללי', icon: '📰', color: '#546e7a' };
}

function createEventId(source, title, date) {
  // Simple dedup hash
  const str = `${source}-${title}-${date}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return `evt-${Math.abs(hash).toString(36)}`;
}

function addEvent(event) {
  // Dedup check
  if (events.find(e => e.id === event.id)) return false;
  events.unshift(event);
  if (events.length > MAX_EVENTS) events = events.slice(0, MAX_EVENTS);
  return true;
}

// ═══════════════════════════════════════════
//  SOURCE 1: RSS Feeds
// ═══════════════════════════════════════════

const RSS_FEEDS = [
  { url: 'https://www.jpost.com/rss/rssfeedsmiddleeast', name: 'Jerusalem Post' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'אל ג\'זירה' },
  { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', name: 'BBC Middle East' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml', name: 'NYT Middle East' },
  { url: 'https://www.timesofisrael.com/feed/', name: 'Times of Israel' },
];

// Middle East conflict keywords for filtering
const RELEVANCE_KEYWORDS = [
  'iran', 'israel', 'gaza', 'hamas', 'hezbollah', 'houthi', 'yemen',
  'lebanon', 'syria', 'iraq', 'missile', 'strike', 'military', 'attack',
  'war', 'conflict', 'bomb', 'rocket', 'drone', 'defense', 'nuclear',
  'irgc', 'idf', 'navy', 'airforce', 'ceasefire', 'hostage', 'tension',
  'sanction', 'uranium', 'centrifuge', 'proxy', 'militia',
];

function isRelevant(text) {
  const lower = text.toLowerCase();
  return RELEVANCE_KEYWORDS.some(kw => lower.includes(kw));
}

async function fetchRSSFeeds() {
  let added = 0;
  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await rssParser.parseURL(feed.url);
      for (const item of (parsed.items || []).slice(0, 15)) {
        const text = `${item.title || ''} ${item.contentSnippet || ''}`;
        if (!isRelevant(text)) continue;

        const countryCode = detectCountry(text);
        if (!countryCode) continue;

        const country = COUNTRY_DATA[countryCode];
        const type = classifyEventType(text);
        const timestamp = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
        const id = createEventId(feed.name, item.title, timestamp);

        const wasAdded = addEvent({
          id,
          type,
          country: { name: country.name, code: countryCode },
          source: feed.name,
          timestamp,
          credibility: 70,
          lat: country.lat + (Math.random() - 0.5) * 1.5,
          lng: country.lng + (Math.random() - 0.5) * 1.5,
          summary: item.title || 'אירוע ללא כותרת',
          link: item.link || null,
          verified: false,
          origin: 'rss',
        });
        if (wasAdded) added++;
      }
    } catch (err) {
      console.error(`[RSS] Error fetching ${feed.name}:`, err.message);
    }
  }
  console.log(`[RSS] Added ${added} new events`);
}

// ═══════════════════════════════════════════
//  SOURCE 2: GDELT (Global Event Database)
// ═══════════════════════════════════════════

async function fetchGDELT() {
  let added = 0;
  try {
    // GDELT GEO 2.0 API — events in Middle East
    const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=iran OR israel OR hezbollah OR houthi OR yemen&mode=artlist&maxrecords=20&format=json&timespan=1h';
    const res = await fetch(url, { timeout: 10000 });
    const data = await res.json();

    for (const article of (data.articles || [])) {
      const text = `${article.title || ''} ${article.seendate || ''}`;
      const countryCode = detectCountry(text);
      if (!countryCode) continue;

      const country = COUNTRY_DATA[countryCode];
      const type = classifyEventType(text);
      const timestamp = article.seendate ? new Date(article.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z')).getTime() : Date.now();
      const id = createEventId('GDELT', article.title, timestamp);

      const wasAdded = addEvent({
        id,
        type,
        country: { name: country.name, code: countryCode },
        source: 'GDELT',
        timestamp,
        credibility: 55,
        lat: country.lat + (Math.random() - 0.5) * 2,
        lng: country.lng + (Math.random() - 0.5) * 2,
        summary: article.title || 'אירוע GDELT',
        link: article.url || null,
        verified: false,
        origin: 'gdelt',
      });
      if (wasAdded) added++;
    }
  } catch (err) {
    console.error('[GDELT] Error:', err.message);
  }
  console.log(`[GDELT] Added ${added} new events`);
}

// ═══════════════════════════════════════════
//  SOURCE 3: Pikud HaOref (Red Alert)
// ═══════════════════════════════════════════

async function fetchPikudHaOref() {
  let added = 0;
  try {
    const res = await fetch('https://www.oref.org.il/WarningMessages/History/AlertsHistory.json', {
      headers: {
        'Referer': 'https://www.oref.org.il/',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0',
      },
      timeout: 8000,
    });

    // The API may return empty or block — handle gracefully
    const text = await res.text();
    if (!text || text.trim() === '') {
      console.log('[Pikud HaOref] No alerts (empty response)');
      return;
    }

    let alerts;
    try { alerts = JSON.parse(text); } catch { console.log('[Pikud HaOref] Non-JSON response'); return; }

    if (!Array.isArray(alerts)) {
      console.log('[Pikud HaOref] Unexpected format');
      return;
    }

    for (const alert of alerts.slice(0, 20)) {
      const areaName = alert.data || alert.title || 'אזור לא ידוע';
      const alertDate = alert.alertDate || alert.date;
      const timestamp = alertDate ? new Date(alertDate).getTime() : Date.now();
      const id = createEventId('PikudHaOref', areaName, timestamp);

      // Determine alert type
      let type = { id: 'missile', label: 'התרעת טילים', icon: '🚀', color: '#d32f2f' };
      const cat = (alert.category_desc || alert.category || '').toLowerCase();
      if (cat.includes('uav') || cat.includes('כלי טיס')) {
        type = { id: 'military', label: 'חדירת כלי טיס', icon: '🎖️', color: '#f9a825' };
      }

      const wasAdded = addEvent({
        id,
        type,
        country: { name: 'ישראל', code: 'IL' },
        source: 'פיקוד העורף',
        timestamp,
        credibility: 95,
        lat: 31.77 + (Math.random() - 0.5) * 3,
        lng: 35.21 + (Math.random() - 0.5) * 1.5,
        summary: `התרעה: ${areaName}`,
        link: 'https://www.oref.org.il/',
        verified: true,
        origin: 'pikud_haoref',
      });
      if (wasAdded) added++;
    }
  } catch (err) {
    console.error('[Pikud HaOref] Error:', err.message);
  }
  console.log(`[Pikud HaOref] Added ${added} new alerts`);
}

// ═══════════════════════════════════════════
//  Scheduling
// ═══════════════════════════════════════════

// RSS every 5 minutes
setInterval(fetchRSSFeeds, 5 * 60 * 1000);

// GDELT every 3 minutes
setInterval(fetchGDELT, 3 * 60 * 1000);

// Pikud HaOref every 15 seconds (high priority)
setInterval(fetchPikudHaOref, 15 * 1000);

// Initial fetch on startup
console.log('[OSINT Monitor] Starting initial data collection...');
Promise.all([fetchRSSFeeds(), fetchGDELT(), fetchPikudHaOref()])
  .then(() => console.log(`[OSINT Monitor] Initial load complete. ${events.length} events.`));

// ═══════════════════════════════════════════
//  API Routes
// ═══════════════════════════════════════════

// Get all events (with optional filters)
app.get('/api/events', (req, res) => {
  let result = [...events];

  // Filter by type
  if (req.query.type) {
    result = result.filter(e => e.type.id === req.query.type);
  }

  // Filter by country
  if (req.query.country) {
    result = result.filter(e => e.country.code === req.query.country);
  }

  // Limit
  const limit = parseInt(req.query.limit) || 100;
  result = result.slice(0, limit);

  res.json({
    count: result.length,
    total: events.length,
    events: result,
    lastUpdated: events[0]?.timestamp || null,
  });
});

// Get threat levels
app.get('/api/threats', (req, res) => {
  const threats = Object.entries(COUNTRY_DATA).map(([code, data]) => {
    const countryEvents = events.filter(e => e.country.code === code);
    const now = Date.now();
    let score = 0;
    countryEvents.forEach(e => {
      const decay = Math.exp(-(now - e.timestamp) / 3600000);
      const sev = e.type.id === 'missile' ? 10 : e.type.id === 'airstrike' ? 8 : e.type.id === 'cyber' ? 5 : e.type.id === 'military' ? 4 : 2;
      score += sev * decay * (e.credibility / 100);
    });
    const threat = Math.min(Math.round((1 / (1 + Math.exp(-0.3 * (score - 5)))) * 100), 100);
    return { code, name: data.name, threat, eventCount: countryEvents.length };
  }).sort((a, b) => b.threat - a.threat);

  res.json({ threats, lastUpdated: Date.now() });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    events: events.length,
    uptime: process.uptime(),
    sources: {
      rss: RSS_FEEDS.length,
      gdelt: true,
      pikudHaOref: true,
    },
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n══════════════════════════════════════════`);
  console.log(`  OSINT Monitor running on port ${PORT}`);
  console.log(`  Dashboard: http://localhost:${PORT}`);
  console.log(`  API:       http://localhost:${PORT}/api/events`);
  console.log(`══════════════════════════════════════════\n`);
});
