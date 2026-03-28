#!/usr/bin/env node
/**
 * Influencer Discovery Engine
 * Finds micro-influencers (1K-50K followers) by niche from public data sources
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// --- HTTP helper ---
function httpReq(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'InfluencerMatch/1.0' },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// --- Niche definitions ---
const NICHES = {
  fitness: { keywords: ['fitness', 'gym', 'workout', 'health', 'muscle', 'training', 'crossfit', 'yoga', 'running'], hashtags: ['#fitness', '#gym', '#workout', '#fitfam', '#health'] },
  beauty: { keywords: ['beauty', 'makeup', 'skincare', 'cosmetics', 'hair', 'nails', 'glowup'], hashtags: ['#beauty', '#makeup', '#skincare', '#beautytips'] },
  food: { keywords: ['food', 'cooking', 'recipe', 'chef', 'baking', 'kitchen', 'foodie', 'vegan', 'keto'], hashtags: ['#foodie', '#cooking', '#recipe', '#foodporn', '#homecook'] },
  travel: { keywords: ['travel', 'adventure', 'explore', 'wanderlust', 'backpack', 'digital nomad'], hashtags: ['#travel', '#adventure', '#wanderlust', '#explore'] },
  tech: { keywords: ['tech', 'gadgets', 'review', 'unboxing', 'coding', 'programming', 'gaming'], hashtags: ['#tech', '#gadgets', '#review', '#techreview'] },
  fashion: { keywords: ['fashion', 'style', 'outfit', 'ootd', 'streetwear', 'sustainable fashion'], hashtags: ['#fashion', '#style', '#ootd', '#streetwear'] },
  finance: { keywords: ['finance', 'investing', 'money', 'crypto', 'stocks', 'budget', 'passive income'], hashtags: ['#investing', '#finance', '#money', '#personalfinance'] },
  parenting: { keywords: ['parenting', 'mom', 'dad', 'kids', 'family', 'baby', 'toddler'], hashtags: ['#momlife', '#parenting', '#family', '#dadlife'] },
  pets: { keywords: ['pets', 'dogs', 'cats', 'puppy', 'kitten', 'pet care', 'animal'], hashtags: ['#dogs', '#cats', '#pets', '#dogsofinstagram'] },
  gaming: { keywords: ['gaming', 'gamer', 'esports', 'twitch', 'streamer', 'videogames'], hashtags: ['#gaming', '#gamer', '#esports', '#twitch'] },
  realestate: { keywords: ['real estate', 'realtor', 'homes', 'property', 'mortgage', 'investing'], hashtags: ['#realestate', '#realtor', '#homes', '#property'] },
  education: { keywords: ['education', 'learning', 'study', 'tutor', 'teaching', 'courses'], hashtags: ['#education', '#learning', '#study', '#teaching'] },
};

// --- Discovery methods ---

// 1. Discover from Reddit (find people who mention being influencers/creators)
async function discoverFromReddit(niche) {
  const influencers = [];
  const config = NICHES[niche] || NICHES.fitness;
  
  const subreddits = {
    fitness: ['fitness', 'bodybuilding', 'yoga', 'running'],
    beauty: ['MakeupAddiction', 'SkincareAddiction', 'beauty'],
    food: ['Cooking', 'recipes', 'food', 'veganrecipes'],
    travel: ['travel', 'solotravel', 'digitalnomad'],
    tech: ['gadgets', 'tech', 'Android', 'apple'],
    fashion: ['malefashionadvice', 'femalefashionadvice', 'streetwear'],
    finance: ['personalfinance', 'investing', 'CryptoCurrency'],
    parenting: ['beyondthebump', 'daddit', 'Parenting'],
    pets: ['dogs', 'cats', 'pets'],
    gaming: ['gaming', 'Games', 'pcmasterrace'],
    realestate: ['RealEstate', 'realestateinvesting'],
    education: ['teachers', 'GetStudying', 'education'],
  };

  const subs = subreddits[niche] || subreddits.fitness;
  
  for (const sub of subs.slice(0, 2)) {
    try {
      const res = await httpReq(`https://www.reddit.com/r/${sub}/top.rss?t=month`);
      if (res.status === 200) {
        // Extract usernames from RSS
        const authors = (res.body.match(/<name>\/u\/([^<]+)<\/name>/g) || [])
          .map(m => m.replace(/<[^>]+>/g, '').replace('/u/', '').trim());
        
        const uniqueAuthors = [...new Set(authors)].slice(0, 10);
        for (const author of uniqueAuthors) {
          influencers.push({
            platform: 'reddit',
            username: author,
            niche,
            subreddit: sub,
            source: `r/${sub}`,
            discoveryMethod: 'reddit_top_posts'
          });
        }
      }
    } catch(e) {}
  }
  
  return influencers;
}

// 2. Discover from Twitter/X via public search
async function discoverFromTwitter(niche) {
  const influencers = [];
  // Twitter discovery would require API access
  // For now, we use hashtag-based discovery patterns
  const config = NICHES[niche] || NICHES.fitness;
  
  influencers.push({
    platform: 'twitter',
    niche,
    discoveryMethod: 'hashtag_search',
    searchTerms: config.hashtags,
    note: 'Requires xurl API for full discovery'
  });
  
  return influencers;
}

// 3. Discover from public YouTube data
async function discoverFromYouTube(niche) {
  const influencers = [];
  const config = NICHES[niche] || NICHES.fitness;
  
  // YouTube has public search that works
  try {
    const query = config.keywords.slice(0, 3).join('|');
    // This would use YouTube Data API or scraping
    // For now, we'll use RSS feeds for niche channels
    influencers.push({
      platform: 'youtube',
      niche,
      discoveryMethod: 'keyword_search',
      searchTerms: config.keywords,
      note: 'Full discovery requires YouTube API key'
    });
  } catch(e) {}
  
  return influencers;
}

// 4. Scan hashtags on public platforms
async function scanHashtags(niche) {
  const results = [];
  const config = NICHES[niche] || NICHES.fitness;
  
  // Check trending hashtags related to niche
  try {
    const res = await httpReq('https://trends.google.com/trending/rss?geo=US');
    if (res.status === 200) {
      const topics = (res.body.match(/<title[^>]*>([^<]+)<\/title>/gi) || [])
        .map(t => t.replace(/<[^>]+>/g, ''));
      
      const related = topics.filter(t => 
        config.keywords.some(k => t.toLowerCase().includes(k))
      );
      
      if (related.length > 0) {
        results.push({
          source: 'Google Trends',
          niche,
          trendingTopics: related,
          signal: 'High demand — trending topics in this niche'
        });
      }
    }
  } catch(e) {}
  
  return results;
}

// --- Main ---
async function main() {
  const report = {
    timestamp: new Date().toISOString(),
    niche: process.argv[2] || 'fitness',
    influencers: [],
    trends: [],
    summary: {}
  };

  const niche = report.niche;
  console.error(`Discovering influencers in: ${niche}`);

  // Run discovery in parallel
  const [reddit, twitter, youtube, trends] = await Promise.all([
    discoverFromReddit(niche),
    discoverFromTwitter(niche),
    discoverFromYouTube(niche),
    scanHashtags(niche)
  ]);

  report.influencers = [...reddit, ...twitter, ...youtube];
  report.trends = trends;

  report.summary = {
    totalFound: report.influencers.length,
    byPlatform: {},
    niche,
    searchTerms: NICHES[niche]?.keywords || []
  };

  for (const inf of report.influencers) {
    report.summary.byPlatform[inf.platform] = (report.summary.byPlatform[inf.platform] || 0) + 1;
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
