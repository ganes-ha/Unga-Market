import { Product } from '../types';

export function createProductSVG(p?: Partial<Product> | null): string {
  const brand = (p?.b || (p as any)?.brand || 'Unga Market').trim();
  const name = (p?.n || (p as any)?.name || 'Grocery Item').trim();
  const size = (p?.s || (p as any)?.size || 'Standard Pack').trim();
  const category = (p?.c || (p as any)?.category || 'grocery').toLowerCase();

  let bgGrad1 = '#F3F4F6';
  let bgGrad2 = '#E5E7EB';
  let themeColor = '#0F8A3E';
  let accentColor = '#F26522';
  let emoji = '📦';

  const bLower = (brand || '').toLowerCase();
  const nLower = (name || '').toLowerCase();

  if (bLower.includes('tea') || bLower.includes('tata') || bLower.includes('red label') || category.includes('tea')) {
    themeColor = '#0A6B2E';
    accentColor = '#EAB308';
    bgGrad1 = '#FEFCE8';
    bgGrad2 = '#FEF08A';
    emoji = '☕';
  } else if (bLower.includes('coffee') || bLower.includes('bru') || bLower.includes('nescafe')) {
    themeColor = '#78350F';
    accentColor = '#B45309';
    bgGrad1 = '#FFFBEB';
    bgGrad2 = '#FDE68A';
    emoji = '☕';
  } else if (bLower.includes('oil') || bLower.includes('fortune') || bLower.includes('saffola') || bLower.includes('gold winner')) {
    themeColor = '#CA8A04';
    accentColor = '#F97316';
    bgGrad1 = '#FFFBEB';
    bgGrad2 = '#FEF08A';
    emoji = '🛢️';
  } else if (bLower.includes('atta') || bLower.includes('aashirvaad') || bLower.includes('rice') || bLower.includes('dal') || category.includes('staple')) {
    themeColor = '#B45309';
    accentColor = '#D97706';
    bgGrad1 = '#FFF7ED';
    bgGrad2 = '#FFEDD5';
    emoji = '🌾';
  } else if (bLower.includes('noodle') || bLower.includes('maggi') || bLower.includes('yippee') || bLower.includes('pasta')) {
    themeColor = '#DC2626';
    accentColor = '#FACC15';
    bgGrad1 = '#FEF2F2';
    bgGrad2 = '#FEE2E2';
    emoji = '🍜';
  } else if (bLower.includes('surf') || bLower.includes('aerial') || bLower.includes('rin') || bLower.includes('vim') || category.includes('clean')) {
    themeColor = '#2563EB';
    accentColor = '#38BDF8';
    bgGrad1 = '#EFF6FF';
    bgGrad2 = '#DBEAFE';
    emoji = '🧼';
  } else if (bLower.includes('dettol') || bLower.includes('colgate') || bLower.includes('dove') || bLower.includes('soap')) {
    themeColor = '#059669';
    accentColor = '#10B981';
    bgGrad1 = '#ECFDF5';
    bgGrad2 = '#D1FAE5';
    emoji = '✨';
  }

  const brandDisplay = (brand || 'UNGA MARKET').toUpperCase();
  const nameDisplay = name.length > 22 ? name.substring(0, 20) + '...' : name;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGrad1}"/>
        <stop offset="100%" stop-color="${bgGrad2}"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.15"/>
      </filter>
    </defs>
    <rect width="320" height="320" rx="16" fill="url(#bg)"/>
    
    <!-- FMCG Pack Shape -->
    <g filter="url(#shadow)">
      <rect x="55" y="45" width="210" height="230" rx="18" fill="#FFFFFF" stroke="${themeColor}" stroke-width="2.5"/>
      <rect x="55" y="45" width="210" height="55" rx="18" fill="${themeColor}"/>
      <rect x="55" y="80" width="210" height="20" fill="${themeColor}"/>
      
      <!-- Brand Ribbon -->
      <text x="160" y="78" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" text-anchor="middle" letter-spacing="0.5">${brandDisplay}</text>
      
      <!-- Center Graphic / Emoji -->
      <circle cx="160" cy="155" r="42" fill="${bgGrad1}" stroke="${accentColor}" stroke-width="2"/>
      <text x="160" y="168" font-size="34" text-anchor="middle">${emoji}</text>
      
      <!-- Product Name & Pack Size -->
      <text x="160" y="222" fill="#111827" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" text-anchor="middle">${nameDisplay}</text>
      <rect x="100" y="238" width="120" height="22" rx="11" fill="${bgGrad2}"/>
      <text x="160" y="253" fill="${themeColor}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">NET: ${size}</text>
    </g>

    <!-- Fast 15 Mins Super Saver Badge -->
    <rect x="18" y="18" width="82" height="22" rx="6" fill="${themeColor}"/>
    <text x="59" y="33" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="900" text-anchor="middle">⚡ 15 MINS</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
