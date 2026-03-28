#!/usr/bin/env node
const chunks = [];
process.stdin.on('data', chunk => chunks.push(chunk));
process.stdin.on('end', () => {
  const r = JSON.parse(chunks.join(''));
  const lines = [];

  lines.push(`🤝 **Influencer Match Report**`);
  lines.push(`📅 ${new Date(r.timestamp).toLocaleString()}`);
  lines.push('');

  if (r.offers) {
    // Offer aggregator output
    lines.push(`**💰 Top Offers in ${r.niche}:**`);
    lines.push('');
    for (const o of r.offers.slice(0, 10)) {
      lines.push(`• **${o.name}** — ${o.category}`);
      lines.push(`  Commission: ${o.commission} | Avg order: ${o.avgOrder} | Cookie: ${o.cookieDays}d`);
      lines.push(`  Network: ${o.network}`);
      lines.push('');
    }
    lines.push(`📊 ${r.summary.totalOffers} offers | Categories: ${r.summary.categories?.join(', ')}`);
  } else if (r.influencers) {
    // Discovery output
    lines.push(`**👤 Influencers Found in ${r.niche}:**`);
    lines.push('');
    for (const inf of r.influencers.slice(0, 15)) {
      lines.push(`• **@${inf.username || inf.platform}** (${inf.platform})`);
      if (inf.source) lines.push(`  Source: ${inf.source}`);
      lines.push('');
    }
    lines.push(`📊 ${r.summary.totalFound} influencers | Platforms: ${Object.keys(r.summary.byPlatform || {}).join(', ')}`);
  } else if (r.matches) {
    // Matching output
    lines.push(`**🎯 Top Matches:**`);
    lines.push('');
    for (const m of r.matches.slice(0, 10)) {
      const emoji = m.recommendation === 'HIGH' ? '🔥' : '✅';
      lines.push(`${emoji} **@${m.influencer}** × **${m.offer}**`);
      lines.push(`  Score: ${m.score}/100 | Commission: ${m.commission}`);
      lines.push(`  Category: ${m.offerCategory} | Avg order: ${m.avgOrder}`);
      lines.push(`  💡 ${m.action}`);
      lines.push('');
    }
    lines.push(`📊 ${r.summary.totalMatches} matches | High: ${r.summary.highMatches} | Avg score: ${r.summary.avgScore}`);
  }

  console.log(lines.join('\n'));
});
