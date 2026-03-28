#!/usr/bin/env node
/**
 * Influencer Match — Full Pipeline
 * Discover influencers → Get offers → Match them → Output recommendations
 */

const { execSync } = require('child_process');
const path = require('path');

const niche = process.argv[2] || 'fitness';

console.error(`Running influencer-match pipeline for: ${niche}`);

// Step 1: Discover influencers
console.error('Step 1: Discovering influencers...');
const discoverOut = execSync(`node ${path.join(__dirname, 'discover.js')} ${niche}`, { encoding: 'utf-8' });
const discoverData = JSON.parse(discoverOut);

// Step 2: Get offers
console.error('Step 2: Fetching offers...');
const offersOut = execSync(`node ${path.join(__dirname, 'offers.js')} ${niche}`, { encoding: 'utf-8' });
const offersData = JSON.parse(offersOut);

// Step 3: Match them
console.error('Step 3: Matching...');
const matchOut = execSync(`node ${path.join(__dirname, 'match.js')} '${JSON.stringify(discoverData.influencers)}' '${JSON.stringify(offersData.offers)}'`, { encoding: 'utf-8' });
const matchData = JSON.parse(matchOut);

// Output combined report
const report = {
  timestamp: new Date().toISOString(),
  niche,
  influencers: discoverData.influencers,
  offers: offersData.offers,
  matches: matchData.matches,
  trends: discoverData.trends,
  summary: {
    influencersFound: discoverData.summary.totalFound,
    offersFound: offersData.summary.totalOffers,
    matchesMade: matchData.summary.totalMatches,
    highMatches: matchData.summary.highMatches,
    topOffer: matchData.summary.topOffer,
    revenuePerInfluencer: '$10-500/month (estimated)'
  }
};

console.log(JSON.stringify(report, null, 2));
