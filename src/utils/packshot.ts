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

  const bLower = brand.toLowerCase();
  const nLower = name.toLowerCase();

  if (bLower.includes('tea') || bLower.includes('tata') || bLower.includes('red label') || bLower.includes('wagh') || bLower.includes('tez') || bLower.includes('marvel') || category.includes('tea')) {
    themeColor = '#0A6B2E';
    accentColor = '#EAB308';
    bgGrad1 = '#FEFCE8';
    bgGrad2 = '#FEF08A';
    emoji = '🍃';
  } else if (bLower.includes('coffee') || bLower.includes('bru') || bLower.includes('regen') || bLower.includes('horlicks') || bLower.includes('boost')) {
    themeColor = '#78350F';
    accentColor = '#B45309';
    bgGrad1 = '#FFFBEB';
    bgGrad2 = '#FDE68A';
    emoji = '☕';
  } else if (bLower.includes('colgate') || bLower.includes('oral') || bLower.includes('pepsodent') || bLower.includes('sensodyne') || bLower.includes('close up') || nLower.includes('toothpaste') || nLower.includes('toothbrush')) {
    themeColor = '#0284C7';
    accentColor = '#38BDF8';
    bgGrad1 = '#F0F9FF';
    bgGrad2 = '#BAE6FD';
    emoji = '🪥';
  } else if (bLower.includes('maggi') || bLower.includes('noodle') || bLower.includes('ketchup') || nLower.includes('noodle') || nLower.includes('ketchup')) {
    themeColor = '#DC2626';
    accentColor = '#FACC15';
    bgGrad1 = '#FEF2F2';
    bgGrad2 = '#FEE2E2';
    emoji = '🍜';
  } else if (bLower.includes('pasta') || bLower.includes('keya') || bLower.includes('bambino') || bLower.includes('oleev') || bLower.includes('foodcraft') || bLower.includes('chef') || bLower.includes('golden shine') || bLower.includes('wingreens')) {
    themeColor = '#D97706';
    accentColor = '#F59E0B';
    bgGrad1 = '#FFFBEB';
    bgGrad2 = '#FEF3C7';
    emoji = '🍝';
  } else if (bLower.includes('biscuit') || bLower.includes('mcvitie') || bLower.includes('unibic') || bLower.includes('parle') || bLower.includes('britannia') || bLower.includes('sunfeast') || bLower.includes('dark fantasy') || bLower.includes('bonn') || bLower.includes('barry') || bLower.includes('lay') || bLower.includes('frooti')) {
    themeColor = '#B45309';
    accentColor = '#F97316';
    bgGrad1 = '#FFF7ED';
    bgGrad2 = '#FFEDD5';
    emoji = '🍪';
  } else if (bLower.includes('surf') || bLower.includes('tide') || bLower.includes('comfort') || bLower.includes('ghadi') || bLower.includes('safewash') || bLower.includes('ariel') || bLower.includes('rin') || bLower.includes('wheel') || bLower.includes('more light') || bLower.includes('vim') || category.includes('clean')) {
    themeColor = '#1D4ED8';
    accentColor = '#60A5FA';
    bgGrad1 = '#EFF6FF';
    bgGrad2 = '#DBEAFE';
    emoji = '🧼';
  } else if (bLower.includes('soap') || bLower.includes('liril') || bLower.includes('dove') || bLower.includes('pears') || bLower.includes('lux') || bLower.includes('santoor') || bLower.includes('dettol') || bLower.includes('medimix') || bLower.includes('vivel') || bLower.includes('johnson')) {
    themeColor = '#059669';
    accentColor = '#10B981';
    bgGrad1 = '#ECFDF5';
    bgGrad2 = '#D1FAE5';
    emoji = '🫧';
  } else if (bLower.includes('shampoo') || bLower.includes('vatika') || bLower.includes('pantene') || bLower.includes('head & shoulders') || bLower.includes('clinic') || bLower.includes('sunsilk') || bLower.includes('indulekha')) {
    themeColor = '#7C3AED';
    accentColor = '#A78BFA';
    bgGrad1 = '#F5F3FF';
    bgGrad2 = '#EDE9FE';
    emoji = '🧴';
  } else if (bLower.includes('hair oil') || bLower.includes('parachute') || bLower.includes('hair & care') || bLower.includes('garnier') || bLower.includes('dabur') || bLower.includes('emami') || bLower.includes('indu lekha') || bLower.includes('sesa') || bLower.includes('nihar')) {
    themeColor = '#047857';
    accentColor = '#34D399';
    bgGrad1 = '#F0FDF4';
    bgGrad2 = '#DCFCE7';
    emoji = '🌿';
  } else if (bLower.includes('himalaya') || bLower.includes('diaper') || bLower.includes('baby')) {
    themeColor = '#0284C7';
    accentColor = '#38BDF8';
    bgGrad1 = '#F0F9FF';
    bgGrad2 = '#E0F2FE';
    emoji = '👶';
  } else if (bLower.includes('face wash') || bLower.includes('joy') || bLower.includes('mama') || bLower.includes('pond') || bLower.includes('glow') || bLower.includes('wow') || bLower.includes('lacto') || bLower.includes('lakme') || bLower.includes('vlcc')) {
    themeColor = '#DB2777';
    accentColor = '#F472B6';
    bgGrad1 = '#FDF2F8';
    bgGrad2 = '#FCE7F3';
    emoji = '✨';
  } else if (bLower.includes('talc') || bLower.includes('powder') || bLower.includes('dermicool') || bLower.includes('nycil') || bLower.includes('navratna') || bLower.includes('wildstone')) {
    themeColor = '#0D9488';
    accentColor = '#2DD4BF';
    bgGrad1 = '#F0FDFA';
    bgGrad2 = '#CCFBF1';
    emoji = '❄️';
  }

  const brandDisplay = brand.toUpperCase().substring(0, 24);
  const nameDisplay = name.length > 26 ? name.substring(0, 24) + '...' : name;

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
      <text x="160" y="78" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="900" text-anchor="middle" letter-spacing="0.5">${brandDisplay}</text>
      
      <!-- Center Graphic / Emoji -->
      <circle cx="160" cy="155" r="42" fill="${bgGrad1}" stroke="${accentColor}" stroke-width="2"/>
      <text x="160" y="168" font-size="34" text-anchor="middle">${emoji}</text>
      
      <!-- Product Name & Pack Size -->
      <text x="160" y="222" fill="#111827" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" text-anchor="middle">${nameDisplay}</text>
      <rect x="90" y="238" width="140" height="22" rx="11" fill="${bgGrad2}"/>
      <text x="160" y="253" fill="${themeColor}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">NET: ${size}</text>
    </g>

    <!-- Net Weight Badge -->
    <rect x="18" y="18" width="90" height="22" rx="6" fill="${themeColor}"/>
    <text x="63" y="33" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="900" text-anchor="middle">ORIGINAL PACK</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
