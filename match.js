#!/usr/bin/env node
/**
 * Influencer-Offer Matching Engine
 * Connects micro-influencers to relevant affiliate/product offers
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// --- Matching logic ---

// Score how well an influencer matches an offer (0-100)
function matchScore(influencer, offer) {
  let score = 0;
  
  // Niche match (50 points)
  if (influencer.niche === offer.nicheCategory) score += 50;
  else if (relatedNiches(influencer.niche, offer.nicheCategory)) score += 25;
  
  // Commission value (20 points)
  const commissionRate = parseFloat(offer.commission) || 0;
  if (commissionRate >= 15) score += 20;
  else if (commissionRate >= 10) score += 15;
  else if (commissionRate >= 5) score += 10;
  else score += 5;
  
  // Average order value (15 points)
  const avgOrder = parseFloat((offer.avgOrder || '').replace(/[$,]/g, '')) || 0;
  if (avgOrder >= 200) score += 15;
  else if (avgOrder >= 100) score += 10;
  else if (avgOrder >= 50) score += 5;
  
  // Cookie duration (15 points)
  if (offer.cookieDays >= 30) score += 15;
  else if (offer.cookieDays >= 7) score += 10;
  else score += 5;
  
  return score;
}

function relatedNiches(niche1, niche2) {
  const relations = {
    fitness: ['beauty', 'fashion', 'food'],
    beauty: ['fashion', 'fitness'],
    food: ['fitness', 'parenting'],
    travel: ['fashion', 'tech', 'finance'],
    tech: ['gaming', 'finance'],
    fashion: ['beauty', 'fitness', 'travel'],
    finance: ['tech', 'realestate'],
    parenting: ['pets', 'food'],
    pets: ['parenting'],
    gaming: ['tech'],
    realestate: ['finance'],
  };
  return relations[niche1]?.includes(niche2) || relations[niche2]?.includes(niche1);
}

// Generate match recommendations
function generateMatches(influencers, offers) {
  const matches = [];
  
  for (const inf of influencers) {
    for (const offer of offers) {
      const score = matchScore(inf, offer);
      if (score >= 50) { // Only show good matches
        matches.push({
          influencer: inf.username || inf.platform,
          platform: inf.platform,
          niche: inf.niche,
          offer: offer.name,
          offerCategory: offer.category,
          commission: offer.commission,
          avgOrder: offer.avgOrder,
          score,
          recommendation: score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW',
          action: `Sign up for ${offer.name} affiliate program and promote to your audience`
        });
      }
    }
  }
  
  return matches.sort((a, b) => b.score - a.score);
}

// --- Main ---
const influencers = JSON.parse(process.argv[2] || '[]');
const offers = JSON.parse(process.argv[3] || '[]');

const matches = generateMatches(influencers, offers);

const report = {
  timestamp: new Date().toISOString(),
  matches,
  summary: {
    totalMatches: matches.length,
    highMatches: matches.filter(m => m.recommendation === 'HIGH').length,
    mediumMatches: matches.filter(m => m.recommendation === 'MEDIUM').length,
    topOffer: matches[0]?.offer || 'N/A',
    avgScore: matches.length > 0 ? Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length) : 0
  }
};

console.log(JSON.stringify(report, null, 2));
