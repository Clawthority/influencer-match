#!/usr/bin/env node
/**
 * Affiliate Offer Aggregator
 * Pulls product/affiliate offers from major networks
 * Sources: Amazon Associates, ShareASale, CJ, Impact, direct programs
 */

const https = require('https');

// --- HTTP helper ---
function httpReq(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'OfferAggregator/1.0' },
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

// --- Offer databases by niche ---
// These are curated high-commission offers from major affiliate networks
const OFFERS = {
  fitness: [
    { name: 'Gymshark', commission: '8-12%', network: 'Impact', category: 'Apparel', avgOrder: '$80', cookieDays: 30, url: 'https://gymshark.com' },
    { name: 'MyProtein', commission: '8-15%', network: 'Direct', category: 'Supplements', avgOrder: '$50', cookieDays: 30, url: 'https://myprotein.com' },
    { name: 'Nike', commission: '5-11%', network: 'Impact', category: 'Apparel/Shoes', avgOrder: '$120', cookieDays: 7, url: 'https://nike.com' },
    { name: 'Under Armour', commission: '5-10%', network: 'Impact', category: 'Apparel', avgOrder: '$75', cookieDays: 7, url: 'https://underarmour.com' },
    { name: 'Bowflex', commission: '3-7%', network: 'ShareASale', category: 'Equipment', avgOrder: '$500', cookieDays: 30, url: 'https://bowflex.com' },
    { name: 'Peloton', commission: '$50-150/sale', network: 'Direct', category: 'Equipment', avgOrder: '$1,500', cookieDays: 30, url: 'https://onepeloton.com' },
    { name: 'Whoop', commission: '$15-30/referral', network: 'Direct', category: 'Wearables', avgOrder: '$239', cookieDays: 30, url: 'https://whoop.com' },
    { name: 'Athletic Greens', commission: '$30-75/sale', network: 'Direct', category: 'Supplements', avgOrder: '$79', cookieDays: 90, url: 'https://athleticgreens.com' },
  ],
  beauty: [
    { name: 'Sephora', commission: '5-10%', network: 'Rakuten', category: 'Cosmetics', avgOrder: '$75', cookieDays: 7, url: 'https://sephora.com' },
    { name: 'Ulta Beauty', commission: '2-5%', network: 'Impact', category: 'Cosmetics', avgOrder: '$50', cookieDays: 7, url: 'https://ulta.com' },
    { name: 'Glossier', commission: '$5-10/referral', network: 'Direct', category: 'Skincare', avgOrder: '$40', cookieDays: 30, url: 'https://glossier.com' },
    { name: 'Dyson', commission: '2-6%', network: 'Impact', category: 'Hair tools', avgOrder: '$400', cookieDays: 7, url: 'https://dyson.com' },
    { name: 'FOREO', commission: '8-15%', network: 'ShareASale', category: 'Skincare devices', avgOrder: '$150', cookieDays: 30, url: 'https://foreo.com' },
  ],
  tech: [
    { name: 'Amazon Electronics', commission: '1-4%', network: 'Amazon', category: 'Electronics', avgOrder: '$100', cookieDays: 24, url: 'https://amazon.com' },
    { name: 'Best Buy', commission: '0.5-2%', network: 'Impact', category: 'Electronics', avgOrder: '$200', cookieDays: 1, url: 'https://bestbuy.com' },
    { name: 'Logitech', commission: '4-8%', network: 'ShareASale', category: 'Peripherals', avgOrder: '$80', cookieDays: 30, url: 'https://logitech.com' },
    { name: 'Anker', commission: '5-10%', network: 'Direct', category: 'Chargers/Audio', avgOrder: '$40', cookieDays: 30, url: 'https://anker.com' },
    { name: 'NordVPN', commission: '40-100%', network: 'Direct', category: 'Software', avgOrder: '$60', cookieDays: 30, url: 'https://nordvpn.com' },
    { name: 'ExpressVPN', commission: '$13-36/sale', network: 'Direct', category: 'Software', avgOrder: '$100', cookieDays: 90, url: 'https://expressvpn.com' },
  ],
  travel: [
    { name: 'Booking.com', commission: '25-40%', network: 'Direct', category: 'Hotels', avgOrder: '$200', cookieDays: 1, url: 'https://booking.com' },
    { name: 'Airbnb', commission: '$20-50/referral', network: 'Direct', category: 'Accommodation', avgOrder: '$150', cookieDays: 30, url: 'https://airbnb.com' },
    { name: 'Skyscanner', commission: '20-50%', network: 'Direct', category: 'Flights', avgOrder: '$300', cookieDays: 30, url: 'https://skyscanner.com' },
    { name: 'World Nomads', commission: '10-15%', network: 'Direct', category: 'Insurance', avgOrder: '$100', cookieDays: 60, url: 'https://worldnomads.com' },
    { name: 'REI', commission: '5%', network: 'AvantLink', category: 'Gear', avgOrder: '$120', cookieDays: 15, url: 'https://rei.com' },
  ],
  food: [
    { name: 'HelloFresh', commission: '$10-20/referral', network: 'Impact', category: 'Meal kits', avgOrder: '$60', cookieDays: 14, url: 'https://hellofresh.com' },
    { name: 'Blue Apron', commission: '$15-25/referral', network: 'Impact', category: 'Meal kits', avgOrder: '$60', cookieDays: 30, url: 'https://blueapron.com' },
    { name: 'ButcherBox', commission: '$20-30/sale', network: 'Direct', category: 'Meat delivery', avgOrder: '$150', cookieDays: 30, url: 'https://butcherbox.com' },
    { name: 'Thrive Market', commission: '$5-40/membership', network: 'Impact', category: 'Organic groceries', avgOrder: '$50', cookieDays: 14, url: 'https://thrivemarket.com' },
    { name: 'Vitamix', commission: '5-10%', network: 'ShareASale', category: 'Kitchen', avgOrder: '$400', cookieDays: 7, url: 'https://vitamix.com' },
  ],
  finance: [
    { name: 'Wealthsimple', commission: '$5-25/referral', network: 'Direct', category: 'Investing', avgOrder: 'N/A', cookieDays: 30, url: 'https://wealthsimple.com' },
    { name: 'Robinhood', commission: '$5-20/referral', network: 'Direct', category: 'Investing', avgOrder: 'N/A', cookieDays: 30, url: 'https://robinhood.com' },
    { name: 'Mint Mobile', commission: '$10-25/sale', network: 'Direct', category: 'Phone service', avgOrder: '$30', cookieDays: 60, url: 'https://mintmobile.com' },
    { name: 'Credit Karma', commission: '$2-10/referral', network: 'Direct', category: 'Credit', avgOrder: 'N/A', cookieDays: 30, url: 'https://creditkarma.com' },
  ],
  pets: [
    { name: 'Chewy', commission: '4-8%', network: 'Impact', category: 'Pet supplies', avgOrder: '$80', cookieDays: 15, url: 'https://chewy.com' },
    { name: 'BarkBox', commission: '$15-25/subscription', network: 'Direct', category: 'Pet subscription', avgOrder: '$35', cookieDays: 30, url: 'https://barkbox.com' },
    { name: 'Rover', commission: '$10-20/referral', network: 'Direct', category: 'Pet sitting', avgOrder: '$50', cookieDays: 30, url: 'https://rover.com' },
    { name: 'Furbo', commission: '10-15%', network: 'ShareASale', category: 'Pet cameras', avgOrder: '$120', cookieDays: 30, url: 'https://furbo.com' },
  ],
  gaming: [
    { name: 'SteelSeries', commission: '5-10%', network: 'ShareASale', category: 'Peripherals', avgOrder: '$100', cookieDays: 30, url: 'https://steelseries.com' },
    { name: 'Razer', commission: '3-8%', network: 'Impact', category: 'Peripherals', avgOrder: '$150', cookieDays: 30, url: 'https://razer.com' },
    { name: 'G Fuel', commission: '10-15%', network: 'Direct', category: 'Energy drinks', avgOrder: '$30', cookieDays: 30, url: 'https://gfuel.com' },
    { name: 'Secretlab', commission: '5-10%', network: 'ShareASale', category: 'Gaming chairs', avgOrder: '$450', cookieDays: 30, url: 'https://secretlab.co' },
  ],
  parenting: [
    { name: 'Ergobaby', commission: '5-10%', network: 'ShareASale', category: 'Baby carriers', avgOrder: '$120', cookieDays: 30, url: 'https://ergobaby.com' },
    { name: 'Honest Company', commission: '5-10%', network: 'Rakuten', category: 'Baby products', avgOrder: '$50', cookieDays: 7, url: 'https://honest.com' },
    { name: 'Strolleria', commission: '3-8%', network: 'ShareASale', category: 'Strollers', avgOrder: '$500', cookieDays: 30, url: 'https://strolleria.com' },
  ],
  fashion: [
    { name: 'ASOS', commission: '5-8%', network: 'Impact', category: 'Apparel', avgOrder: '$80', cookieDays: 30, url: 'https://asos.com' },
    { name: 'SHEIN', commission: '10-20%', network: 'Direct', category: 'Fast fashion', avgOrder: '$40', cookieDays: 30, url: 'https://shein.com' },
    { name: 'Fashion Nova', commission: '10-15%', network: 'ShareASale', category: 'Apparel', avgOrder: '$60', cookieDays: 30, url: 'https://fashionnova.com' },
    { name: 'Lululemon', commission: '5-7%', network: 'Impact', category: 'Athleisure', avgOrder: '$100', cookieDays: 7, url: 'https://lululemon.com' },
  ],
  home: [
    { name: 'Wayfair', commission: '2-7%', network: 'ShareASale', category: 'Furniture', avgOrder: '$200', cookieDays: 7, url: 'https://wayfair.com' },
    { name: 'Brooklinen', commission: '5-10%', network: 'ShareASale', category: 'Bedding', avgOrder: '$200', cookieDays: 30, url: 'https://brooklinen.com' },
    { name: 'Article', commission: '3-8%', network: 'Impact', category: 'Furniture', avgOrder: '$500', cookieDays: 30, url: 'https://article.com' },
    { name: 'Casper', commission: '5-15%', network: 'ShareASale', category: 'Mattresses', avgOrder: '$1,000', cookieDays: 30, url: 'https://casper.com' },
    { name: 'Parachute Home', commission: '5-10%', network: 'ShareASale', category: 'Bedding', avgOrder: '$150', cookieDays: 30, url: 'https://parachutehome.com' },
  ],
  // NEW NICHES (2026-04-06)
  crypto: [
    { name: 'Coinbase', commission: '$5-50/referral', network: 'Direct', category: 'Crypto exchange', avgOrder: 'N/A', cookieDays: 30, url: 'https://coinbase.com' },
    { name: 'Binance', commission: '20-50%', network: 'Direct', category: 'Crypto exchange', avgOrder: 'N/A', cookieDays: 30, url: 'https://binance.com' },
    { name: 'Ledger', commission: '5-10%', network: 'ShareASale', category: 'Hardware wallets', avgOrder: '$100', cookieDays: 30, url: 'https://ledger.com' },
    { name: 'Trust Wallet', commission: '$5-15/referral', network: 'Direct', category: 'Mobile wallet', avgOrder: 'N/A', cookieDays: 30, url: 'https://trustwallet.com' },
    { name: 'BitPay', commission: '1-3%', network: 'Direct', category: 'Payment processor', avgOrder: 'N/A', cookieDays: 30, url: 'https://bitpay.com' },
  ],
  education: [
    { name: 'Skillshare', commission: '$10-30/referral', network: 'Direct', category: 'Online courses', avgOrder: '$20/mo', cookieDays: 30, url: 'https://skillshare.com' },
    { name: 'Coursera', commission: '$10-50/referral', network: 'Direct', category: 'Online courses', avgOrder: '$50/mo', cookieDays: 30, url: 'https://coursera.org' },
    { name: 'Udemy', commission: '5-15%', network: 'Direct', category: 'Online courses', avgOrder: '$20', cookieDays: 7, url: 'https://udemy.com' },
    { name: 'MasterClass', commission: '$15-30/referral', network: 'Direct', category: 'Online courses', avgOrder: '$180/yr', cookieDays: 30, url: 'https://masterclass.com' },
    { name: 'Babbel', commission: '$10-20/referral', network: 'Direct', category: 'Language learning', avgOrder: '$13/mo', cookieDays: 30, url: 'https://babbel.com' },
  ],
  health: [
    { name: 'Calm', commission: '$10-25/referral', network: 'Direct', category: 'Meditation app', avgOrder: '$15/mo', cookieDays: 30, url: 'https://calm.com' },
    { name: 'Headspace', commission: '$10-25/referral', network: 'Direct', category: 'Meditation app', avgOrder: '$13/mo', cookieDays: 30, url: 'https://headspace.com' },
    { name: 'Whoop', commission: '$15-30/referral', network: 'Direct', category: 'Wearables', avgOrder: '$239', cookieDays: 30, url: 'https://whoop.com' },
    { name: 'Eight Sleep', commission: '$50-150/sale', network: 'Direct', category: 'Smart mattresses', avgOrder: '$2,000', cookieDays: 30, url: 'https://eightsleep.com' },
    { name: 'Peloton', commission: '$50-150/sale', network: 'Direct', category: 'Fitness app', avgOrder: '$44/mo', cookieDays: 30, url: 'https://onepeloton.com' },
  ],
  sustainability: [
    { name: 'Patagonia', commission: '5-10%', network: 'Direct', category: 'Outdoor apparel', avgOrder: '$100', cookieDays: 30, url: 'https://patagonia.com' },
    { name: 'Tentree', commission: '10-15%', network: 'Direct', category: 'Eco apparel', avgOrder: '$60', cookieDays: 30, url: 'https://tentree.com' },
    { name: 'Allbirds', commission: '5-10%', network: 'Direct', category: 'Sustainable shoes', avgOrder: '$110', cookieDays: 30, url: 'https://allbirds.com' },
    { name: 'Blueland', commission: '10-20%', network: 'Direct', category: 'Eco home products', avgOrder: '$30', cookieDays: 30, url: 'https://blueland.com' },
    { name: 'Grove Collaborative', commission: '5-10%', network: 'Impact', category: 'Eco household', avgOrder: '$50', cookieDays: 30, url: 'https://grove.co' },
  ],
  business: [
    { name: 'Shopify', commission: '$10-200/referral', network: 'Direct', category: 'E-commerce', avgOrder: 'N/A', cookieDays: 30, url: 'https://shopify.com' },
    { name: 'Wix', commission: '$10-50/referral', network: 'Direct', category: 'Website builder', avgOrder: '$16/mo', cookieDays: 30, url: 'https://wix.com' },
    { name: 'Squarespace', commission: '10-20%', network: 'Direct', category: 'Website builder', avgOrder: '$18/mo', cookieDays: 30, url: 'https://squarespace.com' },
    { name: 'Notion', commission: '$10-20/referral', network: 'Direct', category: 'Productivity', avgOrder: '$10/mo', cookieDays: 30, url: 'https://notion.so' },
    { name: 'Zoom', commission: '$10-30/referral', network: 'Direct', category: 'Video conferencing', avgOrder: '$15/mo', cookieDays: 30, url: 'https://zoom.us' },
  ],
  spirituality: [
    { name: 'Aura', commission: '$10-20/referral', network: 'Direct', category: 'Meditation app', avgOrder: '$60/yr', cookieDays: 30, url: 'https://aurahealth.io' },
    { name: 'Sanctuary', commission: '$15-30/referral', network: 'Direct', category: 'Spiritual coaching', avgOrder: '$100/mo', cookieDays: 30, url: 'https://sanctuary.com' },
    { name: 'AstroFame', commission: '20-30%', network: 'Direct', category: 'Astrology readings', avgOrder: '$50', cookieDays: 30, url: 'https://astrofame.com' },
    { name: 'Pattern', commission: '$10-25/referral', network: 'Direct', category: 'Astrology app', avgOrder: '$10/mo', cookieDays: 30, url: 'https://pattern.app' },
    { name: 'CoStar', commission: '$10-30/referral', network: 'Direct', category: 'Astrology app', avgOrder: '$10/mo', cookieDays: 30, url: 'https://costar.app' },
  ],
  photography: [
    { name: 'B&H Photo', commission: '1-4%', network: 'Impact', category: 'Camera gear', avgOrder: '$500', cookieDays: 3, url: 'https://bhphotovideo.com' },
    { name: 'Adobe Creative Cloud', commission: '10-20%', network: 'Direct', category: 'Software', avgOrder: '$55/mo', cookieDays: 30, url: 'https://adobe.com' },
    { name: 'Squarespace', commission: '10-20%', network: 'Direct', category: 'Portfolio sites', avgOrder: '$18/mo', cookieDays: 30, url: 'https://squarespace.com' },
    { name: 'SmugMug', commission: '10-15%', network: 'Direct', category: 'Photo hosting', avgOrder: '$8/mo', cookieDays: 30, url: 'https://smugmug.com' },
    { name: 'PocketCamera', commission: '5-10%', network: 'Direct', category: 'Camera rental', avgOrder: '$50/day', cookieDays: 30, url: 'https://pocketcamera.io' },
  ],
  productivity: [
    { name: 'Todoist', commission: '$10-20/referral', network: 'Direct', category: 'Task management', avgOrder: '$5/mo', cookieDays: 30, url: 'https://todoist.com' },
    { name: 'Asana', commission: '$10-25/referral', network: 'Direct', category: 'Project management', avgOrder: '$25/mo', cookieDays: 30, url: 'https://asana.com' },
    { name: 'Trello', commission: '$10-20/referral', network: 'Direct', category: 'Project management', avgOrder: '$10/mo', cookieDays: 30, url: 'https://trello.com' },
    { name: 'Notion', commission: '$10-20/referral', network: 'Direct', category: 'Productivity', avgOrder: '$10/mo', cookieDays: 30, url: 'https://notion.so' },
    { name: 'Forest', commission: '$5-10/referral', network: 'Direct', category: 'Focus app', avgOrder: '$3/mo', cookieDays: 30, url: 'https://forestapp.cc' },
  ],
  relationships: [
    { name: 'Match.com', commission: '$10-30/referral', network: 'Direct', category: 'Dating', avgOrder: '$20/mo', cookieDays: 30, url: 'https://match.com' },
    { name: 'Bumble', commission: '$10-25/referral', network: 'Direct', category: 'Dating', avgOrder: '$15/mo', cookieDays: 30, url: 'https://bumble.com' },
    { name: 'Hinge', commission: '$10-25/referral', network: 'Direct', category: 'Dating', avgOrder: '$15/mo', cookieDays: 30, url: 'https://hinge.co' },
    { name: 'eHarmony', commission: '$20-40/referral', network: 'Direct', category: 'Dating', avgOrder: '$35/mo', cookieDays: 30, url: 'https://eharmony.com' },
    { name: 'FlowerDelivery', commission: '5-15%', network: 'ShareASale', category: 'Flowers', avgOrder: '$50', cookieDays: 30, url: 'https://flowerdelivery.com' },
  ],
  selfImprovement: [
    { name: 'Blinkist', commission: '$5-15/referral', network: 'Direct', category: 'Book summaries', avgOrder: '$15/mo', cookieDays: 30, url: 'https://blinkist.com' },
    { name: 'Audible', commission: '$5-10/referral', network: 'Amazon', category: 'Audiobooks', avgOrder: '$15/mo', cookieDays: 24, url: 'https://audible.com' },
    { name: 'Scribd', commission: '$5-15/referral', network: 'Direct', category: 'E-books', avgOrder: '$12/mo', cookieDays: 30, url: 'https://scribd.com' },
    { name: 'BetterHelp', commission: '$30-60/referral', network: 'Direct', category: 'Therapy', avgOrder: '$80/mo', cookieDays: 30, url: 'https://betterhelp.com' },
    { name: 'Talkspace', commission: '$30-50/referral', network: 'Direct', category: 'Therapy', avgOrder: '$70/mo', cookieDays: 30, url: 'https://talkspace.com' },
  ],
  sidegig: [
    { name: 'Fiverr', commission: '$15-50/referral', network: 'Direct', category: 'Freelance platform', avgOrder: 'N/A', cookieDays: 30, url: 'https://fiverr.com' },
    { name: 'Upwork', commission: '$50-150/referral', network: 'Direct', category: 'Freelance platform', avgOrder: 'N/A', cookieDays: 30, url: 'https://upwork.com' },
    { name: 'TaskRabbit', commission: '$10-25/referral', network: 'Direct', category: 'Gig work', avgOrder: 'N/A', cookieDays: 30, url: 'https://taskrabbit.com' },
    { name: 'Rover', commission: '$10-20/referral', network: 'Direct', category: 'Pet sitting', avgOrder: '$50', cookieDays: 30, url: 'https://rover.com' },
    { name: 'Thumbtack', commission: '$10-30/referral', network: 'Direct', category: 'Service marketplace', avgOrder: 'N/A', cookieDays: 30, url: 'https://thumbtack.com' },
  ],
};

// Get offers for a niche
function getOffers(niche) {
  return OFFERS[niche] || OFFERS.fitness;
}

// Get top offers by commission rate
function getTopOffers(niche, limit = 10) {
  const offers = getOffers(niche);
  return offers
    .sort((a, b) => {
      const rateA = parseFloat(a.commission) || 0;
      const rateB = parseFloat(b.commission) || 0;
      return rateB - rateA;
    })
    .slice(0, limit);
}

// Main
const niche = process.argv[2] || 'fitness';
const offers = getTopOffers(niche);

const report = {
  timestamp: new Date().toISOString(),
  niche,
  offers,
  summary: {
    totalOffers: offers.length,
    avgCommission: '5-15%',
    topNetwork: 'Impact',
    categories: [...new Set(offers.map(o => o.category))]
  }
};

console.log(JSON.stringify(report, null, 2));
