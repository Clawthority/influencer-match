# 🤝 Influencer Match

**The automated matching engine that connects micro-influencers with high-commission affiliate offers — so both sides earn more, faster.**

Finding the right offers is the #1 pain point for micro-influencers. Brands struggle to find authentic voices in specific niches. Influencer Match bridges that gap: discover influencers by niche, pull curated offers from major affiliate networks, and score every match algorithmically. No more cold outreach or random affiliate links.

Works as a CLI pipeline or API. Feed it a niche, get back scored matches ready to close.

## How It Works

```
1. Pick a niche (fitness, beauty, tech, travel, etc.)
2. Discover micro-influencers (1K-50K followers) across Reddit, Twitter, YouTube
3. Pull high-commission offers from 10+ affiliate networks
4. Score every influencer-offer pair (0-100) on niche fit, commission value, and audience match
5. Get ranked matches — ready to pitch or integrate
```

## Who It's For

- **Micro-influencers** — Stop hunting for relevant offers. Get matched to products your audience actually wants.
- **Affiliate managers** — Scale partnerships without manual outreach. Find authentic voices in any niche.
- **Brands** — Access a curated pool of engaged micro-influencers at a fraction of celebrity costs.
- **Agencies** — Automate your influencer discovery and deal pipeline across multiple clients.

## Features

- **Influencer Discovery** — Finds micro-influencers by niche (Reddit, Twitter, YouTube)
- **Offer Aggregator** — Curated high-commission offers from 10+ niches
- **Matching Engine** — Scores influencer-offer fit (0-100)
- **12 Niches** — Fitness, beauty, food, travel, tech, fashion, finance, pets, gaming, parenting, real estate, education

## Niches Covered

| Niche | Sample Offers | Commission Range |
|-------|--------------|-----------------|
| Fitness | Gymshark, Nike, Peloton, Whoop | 5-15% or $15-150/sale |
| Beauty | Sephora, Glossier, Dyson, FOREO | 5-15% |
| Tech | Amazon, Logitech, Anker, NordVPN | 1-100% |
| Travel | Booking.com, Airbnb, Skyscanner | 20-50% |
| Finance | Wealthsimple, Robinhood, Mint Mobile | $5-25/referral |
| Pets | Chewy, BarkBox, Rover, Furbo | 4-15% |

## Quick Start

```bash
npm install

# Discover influencers in a niche
node discover.js fitness | node format.js

# Get offers for a niche
node offers.js fitness | node format.js

# Run full pipeline
node pipeline.js fitness | node format.js
```

## Revenue Model

| Stream | How It Works | Potential |
|--------|-------------|-----------|
| Affiliate commissions | Connect influencers to offers, earn % of sales | $100-10,000/month |
| Matching fees | Brands pay to access influencer database | $500-5,000/month |
| Deal facilitation | Negotiate terms, take 10-20% of deal value | $1,000-20,000/month |
| Premium subscriptions | Influencers pay for deal alerts | $10-30/month per user |

## Matching Algorithm

Scores each influencer-offer pair on:
- Niche relevance (50 points)
- Commission value (20 points)
- Average order value (15 points)
- Cookie duration (15 points)

Only shows matches scoring 50+ (MEDIUM or HIGH).

## Market Opportunity

- **$21.1B** global influencer marketing industry (2024), projected $33B by 2028
- **77%** of brands use micro-influencers over celebrities (higher engagement, lower cost)
- **60%** of influencers say finding relevant offers is their #1 pain point
- Micro-influencers (1K-50K) drive **60% higher engagement** than macro-influencers
- Average ROI: **$5.20 per $1 spent** on influencer marketing

## Roadmap

- [x] Influencer discovery engine (Reddit, Twitter, YouTube)
- [x] Offer aggregator with 12 niches
- [x] Matching algorithm (0-100 scoring)
- [ ] Instagram & TikTok discovery
- [ ] Automated outreach templates
- [ ] Dashboard with earnings tracking
- [ ] Brand self-serve portal
- [ ] Chrome extension for instant offer lookup

## FAQ

**How does influencer discovery work?**
The engine scans public profiles across Reddit, Twitter, and YouTube by niche keyword. It identifies micro-influencers (1K-50K followers) based on content relevance, engagement rates, and audience signals.

**Where do the offers come from?**
Offers are aggregated from major affiliate networks (ShareASale, CJ Affiliate, Impact, Rakuten, and more). Each offer is tagged by niche and scored on commission rate, cookie duration, and average order value.

**Can I use this for a single niche or does it require all 12?**
You choose. Run the pipeline for any single niche or all of them. The CLI accepts any niche keyword — if we don't have curated offers for it yet, the discovery engine still works.

**How accurate is the matching algorithm?**
Matches scoring 70+ have a high probability of conversion based on niche alignment, commission structure, and audience fit. The algorithm weights niche relevance most heavily (50%) since it's the strongest predictor of campaign success.

**Is this a marketplace or a tool?**
Right now it's a discovery and matching tool (CLI/API). A full marketplace with self-serve onboarding for both influencers and brands is on the roadmap.

**What's the difference between this and existing platforms like Aspire or Grin?**
Those platforms focus on macro-influencers and require large budgets. Influencer Match is built for the micro-influencer tier (1K-50K) where engagement is highest and costs are lowest. It's also developer-first — CLI and API, not another SaaS dashboard.

## License

MIT
