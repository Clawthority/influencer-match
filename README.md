# 🤝 Influencer Match

Connect micro-influencers (1K-50K followers) with affiliate and product offers. Automated matching engine for the $21B influencer marketing industry.

## How It Works

```
Find micro-influencers by niche → 
Pull affiliate offers from major networks → 
Match them algorithmically → 
Both sides earn more
```

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

## License

MIT
