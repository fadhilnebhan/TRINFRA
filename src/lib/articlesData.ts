// Trinfra — Knowledge Centre Articles Data
// Structured editorial articles for land pooling, guides, and comparative analyses.

export interface ArticleStep {
  step: string;
  title: string;
  desc: string;
  icon: 'register' | 'verify' | 'cluster' | 'plan' | 'facilitate';
}

export interface ArticleBenefit {
  title: string;
  desc: string;
  icon: 'growth' | 'value' | 'community' | 'support' | 'trust';
}

export interface ComparisonRow {
  aspect: string;
  landPooling: string;
  traditional: string;
}

export interface Article {
  slug: string;
  category: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  date: string;
  readTime: string;
  image: string;
  imageScriptTop?: string;
  imageScriptBottom?: string;
  excerpt: string;
  introParagraphs: string[];
  highlightCardText: string;
  whatIsTitle: string;
  whatIsParagraphs: string[];
  steps: ArticleStep[];
  whyConsiderPoints: string[];
  benefits: ArticleBenefit[];
  comparisonRows: ComparisonRow[];
  thingsToConsider: string[];
  conclusionParagraphs: string[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'what-is-land-pooling',
    category: 'LAND POOLING',
    title: 'What is Land',
    titleAccent: 'Pooling?',
    subtitle: 'A simple guide for landowners.',
    date: '20 Aug 2026',
    readTime: '5 min read',
    image: '/images/hero_landscape.jpeg',
    imageScriptTop: 'Stronger Lands',
    imageScriptBottom: 'Brighter Tomorrows.',
    excerpt: 'A simple guide for landowners on collaborative development, unlocking scale advantages and preserving long-term asset value in Kerala.',
    introParagraphs: [
      'Land is one of the most valuable resources in Kerala. However, fragmented landholdings, unplanned development and lack of infrastructure often limit the true potential of many areas.',
      'Land pooling offers a structured and collaborative approach to bring landowners together, enabling planned development, better infrastructure and higher long-term value for everyone involved.',
    ],
    highlightCardText:
      'TRINFRA connects landowners, developers and professional experts to create structured development opportunities through a transparent and trusted process.',
    whatIsTitle: 'What is Land Pooling?',
    whatIsParagraphs: [
      'Land pooling is a collaborative model where multiple landowners voluntarily come together and contribute their land for planned development. Instead of selling land individually, landowners retain a share in the developed value, benefiting from better infrastructure, amenities and long-term growth.',
    ],
    steps: [
      {
        step: '01',
        title: 'Landowners Register',
        desc: 'Landowners express their interest and share land details.',
        icon: 'register',
      },
      {
        step: '02',
        title: 'Ownership & Verification',
        desc: 'Land records are verified for clarity and transparency.',
        icon: 'verify',
      },
      {
        step: '03',
        title: 'Parcels Are Clustered',
        desc: 'Adjacent parcels are grouped for planned development.',
        icon: 'cluster',
      },
      {
        step: '04',
        title: 'Development Planning',
        desc: 'A structured plan is created with infrastructure, amenities and land use.',
        icon: 'plan',
      },
      {
        step: '05',
        title: 'Project Facilitation',
        desc: 'TRINFRA works with partners to enable implementation.',
        icon: 'facilitate',
      },
    ],
    whyConsiderPoints: [
      'Better development potential',
      'Higher value realization',
      'Planned infrastructure and amenities',
      'Professional support and expert guidance',
      'Retention of long-term value',
      'Transparent and collaborative process',
    ],
    benefits: [
      {
        title: 'Better Development',
        desc: 'Enables planned growth with essential infrastructure.',
        icon: 'growth',
      },
      {
        title: 'Higher Value',
        desc: 'Increases long-term value through strategic planning.',
        icon: 'value',
      },
      {
        title: 'Planned Communities',
        desc: 'Well-designed residential, commercial and public spaces.',
        icon: 'community',
      },
      {
        title: 'Professional Support',
        desc: 'Guidance from experts at every step of the journey.',
        icon: 'support',
      },
      {
        title: 'Transparent Process',
        desc: 'Clear communication and trust among all stakeholders.',
        icon: 'trust',
      },
    ],
    comparisonRows: [
      {
        aspect: 'Land ownership',
        landPooling: 'Retain a share in developed value',
        traditional: 'Often sold outright',
      },
      {
        aspect: 'Development approach',
        landPooling: 'Planned and collaborative',
        traditional: 'Individual and uncoordinated',
      },
      {
        aspect: 'Infrastructure & amenities',
        landPooling: 'Integrated and well-planned',
        traditional: 'Limited or absent',
      },
      {
        aspect: 'Long-term value',
        landPooling: 'Higher potential',
        traditional: 'Limited growth',
      },
      {
        aspect: 'Community benefit',
        landPooling: 'Benefits multiple landowners',
        traditional: 'Primarily individual benefit',
      },
    ],
    thingsToConsider: [
      'Understand the process and timelines',
      'Ensure clear land records and ownership',
      'Participate with neighbouring landowners',
      'Evaluate the long-term benefits',
      'Stay informed and engage with experts',
    ],
    conclusionParagraphs: [
      'Land pooling creates a win-win opportunity for landowners, developers and the community. By working together, we can unlock the full potential of our land and build stronger, more sustainable communities for tomorrow.',
    ],
  },
  {
    slug: 'benefits-of-land-pooling',
    category: 'LAND POOLING',
    title: 'Benefits of Land',
    titleAccent: 'Pooling',
    subtitle: 'Discover how land pooling creates higher value, better infrastructure and stronger communities.',
    date: '12 Aug 2026',
    readTime: '4 min read',
    image: '/images/agri_fields.jpeg',
    imageScriptTop: 'Collective Growth',
    imageScriptBottom: 'Sustained Value.',
    excerpt: 'Discover how land pooling creates higher value, better infrastructure and stronger communities.',
    introParagraphs: [
      'For decades, landowners in Kerala faced a difficult choice: sell land at fragmented market rates, or let productive parcels sit underutilized due to access or scale constraints.',
      'Land pooling revolutionizes this paradigm by consolidating individual bargaining power into institutional scale, attracting top-tier development partners.',
    ],
    highlightCardText:
      'Pooled parcels typically command 35% to 60% higher realization value compared to isolated, fragmented land sales.',
    whatIsTitle: 'Why Consolidation Unlocks Multiplied Value',
    whatIsParagraphs: [
      'Individual plots often lack broad road access, modern drainage, or utility connectivity. When 10 to 50 adjacent parcels are clustered, infrastructure planning becomes economically viable, instantly transforming raw land into high-utility urban-grade assets.',
    ],
    steps: [
      {
        step: '01',
        title: 'Interest Aggregation',
        desc: 'Local landowners align on common developmental goals.',
        icon: 'register',
      },
      {
        step: '02',
        title: 'Title Verification',
        desc: 'Clear legal titles establish credible parcel clusters.',
        icon: 'verify',
      },
      {
        step: '03',
        title: 'Master Layout',
        desc: 'Urban planners formulate wide roads and open zones.',
        icon: 'cluster',
      },
      {
        step: '04',
        title: 'Infrastructure Delivery',
        desc: 'Utilities, power, and road access are implemented.',
        icon: 'plan',
      },
      {
        step: '05',
        title: 'Value Distribution',
        desc: 'Landowners enjoy enhanced developed share value.',
        icon: 'facilitate',
      },
    ],
    whyConsiderPoints: [
      'Wider internal roads and dedicated utility corridors',
      'Protection against distress sales and local middle-men cuts',
      'Retaining equitable fractional or developed asset ownership',
      'Professional environmental and soil sustainability review',
      'Direct institutional developer negotiation facilitated by TRINFRA',
    ],
    benefits: [
      {
        title: 'Enhanced Asset Valuation',
        desc: 'Consolidated land yields premium commercial or residential returns.',
        icon: 'value',
      },
      {
        title: 'World-Class Infrastructure',
        desc: 'Wide access roads, underground utilities, and proper drainage.',
        icon: 'growth',
      },
      {
        title: 'Equitable Growth',
        desc: 'All contributing landowners participate proportionally in upsides.',
        icon: 'community',
      },
      {
        title: 'Zero Distress Pressure',
        desc: 'Landowners are guided by certified legal and land experts.',
        icon: 'support',
      },
      {
        title: 'Safe Legal Structure',
        desc: 'Clean documentation vetted by institutional legal partners.',
        icon: 'trust',
      },
    ],
    comparisonRows: [
      {
        aspect: 'Road Connectivity',
        landPooling: '12m–24m planned internal arterial roads',
        traditional: 'Narrow uncoordinated right-of-ways',
      },
      {
        aspect: 'Market Reach',
        landPooling: 'Grade-A institutional developers & funds',
        traditional: 'Limited local retail buyers',
      },
      {
        aspect: 'Risk Profile',
        landPooling: 'Distributed and professionally managed',
        traditional: 'High single-landowner vulnerability',
      },
    ],
    thingsToConsider: [
      'Consensus with adjoining landowners is foundational',
      'Commitment to the agreed development masterplan timeline',
      'Reviewing the facilitation framework established with TRINFRA',
    ],
    conclusionParagraphs: [
      'By choosing land pooling over isolated sale, landowners transition from price-takers to long-term stakeholders in their region’s economic and urban progress.',
    ],
  },
  {
    slug: 'land-pooling-vs-traditional-development',
    category: 'DEVELOPMENT',
    title: 'Land Pooling vs',
    titleAccent: 'Traditional Development',
    subtitle: 'A comparison of both approaches and why land pooling can create greater long-term value.',
    date: '05 Aug 2026',
    readTime: '6 min read',
    image: '/images/farm_grid.jpeg',
    imageScriptTop: 'Strategic Clarity',
    imageScriptBottom: 'Informed Choices.',
    excerpt: 'A comparison of both approaches and why land pooling can create greater long-term value.',
    introParagraphs: [
      'Land acquisition and real-estate expansion in Kerala have historically suffered from conflict, prolonged delays, and asymmetric information between landowners and developers.',
      'This comparative guide breaks down how structured land pooling fundamentally differs from conventional outright land acquisition.',
    ],
    highlightCardText:
      'Unlike traditional sales where landowners forfeit future appreciation, land pooling ensures landowners remain key beneficiaries of community growth.',
    whatIsTitle: 'The Structural Shift in Land Economics',
    whatIsParagraphs: [
      'Traditional development models treat land simply as an upfront purchase input. Once purchased, any future appreciation from municipal roads, tech parks, or retail centers flows entirely to the developer. Land pooling changes the contract: landowners partner with the process, retaining developed plots or equity shares.',
    ],
    steps: [
      {
        step: '01',
        title: 'Voluntary Opt-In',
        desc: 'No forced acquisition; purely landowner-led clustering.',
        icon: 'register',
      },
      {
        step: '02',
        title: 'Neutral Valuation',
        desc: 'Independent assessment of existing parcel attributes.',
        icon: 'verify',
      },
      {
        step: '03',
        title: 'Zoning & Master Plan',
        desc: 'Optimized planning compliant with regional master directives.',
        icon: 'cluster',
      },
      {
        step: '04',
        title: 'Developer Alignment',
        desc: 'Reputed builders enter transparent joint frameworks.',
        icon: 'plan',
      },
      {
        step: '05',
        title: 'Handover & Growth',
        desc: 'Developed land returned with multiplied capital value.',
        icon: 'facilitate',
      },
    ],
    whyConsiderPoints: [
      'Avoid middle-man exploitation and undervalued appraisals',
      'Retain land heritage while participating in modern urbanisation',
      'Enjoy planned civic amenities such as parks, water treatment, and transit',
      'Ensure generational wealth through appreciating developed property',
    ],
    benefits: [
      {
        title: 'Collaborative Governance',
        desc: 'Landowners hold voice through recognized collective committees.',
        icon: 'community',
      },
      {
        title: 'Institutional Due Diligence',
        desc: 'Complete transparency on town planning rules and approvals.',
        icon: 'support',
      },
      {
        title: 'Tax & Capital Optimization',
        desc: 'Structured transfers minimize friction and distress taxation.',
        icon: 'value',
      },
    ],
    comparisonRows: [
      {
        aspect: 'Land ownership',
        landPooling: 'Retain a share in developed value',
        traditional: 'Often sold outright',
      },
      {
        aspect: 'Development approach',
        landPooling: 'Planned and collaborative',
        traditional: 'Individual and uncoordinated',
      },
      {
        aspect: 'Infrastructure & amenities',
        landPooling: 'Integrated and well-planned',
        traditional: 'Limited or absent',
      },
      {
        aspect: 'Long-term value',
        landPooling: 'Higher potential',
        traditional: 'Limited growth',
      },
      {
        aspect: 'Community benefit',
        landPooling: 'Benefits multiple landowners',
        traditional: 'Primarily individual benefit',
      },
    ],
    thingsToConsider: [
      'Understanding development lifecycle timelines',
      'Maintaining clear, up-to-date Encumbrance Certificates (EC)',
      'Partnering with accredited platforms like TRINFRA for dispute-free execution',
    ],
    conclusionParagraphs: [
      'Land pooling represents the civilized, forward-looking path for Kerala’s sustainable growth—uniting landowner security with developer capability.',
    ],
  },
  {
    slug: 'how-to-register-your-land',
    category: 'GUIDES',
    title: 'How to Register',
    titleAccent: 'Your Land',
    subtitle: 'A step-by-step guide for landowners to register their land with TRINFRA.',
    date: '28 Jul 2026',
    readTime: '4 min read',
    image: '/images/rolling_hills.jpeg',
    imageScriptTop: 'Simple Steps',
    imageScriptBottom: 'Verified Futures.',
    excerpt: 'A step-by-step guide for landowners to register their land with TRINFRA.',
    introParagraphs: [
      'Registering your land with TRINFRA is completely free, secure, and comes with zero commitment or transfer obligation.',
      'Our team verifies land records, maps geographic clusters with adjoining parcels, and presents high-value development opportunities directly to you.',
    ],
    highlightCardText:
      'TRINFRA respects your privacy. All land registration details are held strictly confidential and never shared without explicit authorization.',
    whatIsTitle: 'What Information Is Required?',
    whatIsParagraphs: [
      'You only need basic details to get started: your district, taluk, village, survey number, approximate area in acres or cents, and your preferred contact details.',
    ],
    steps: [
      {
        step: '01',
        title: 'Fill Online Form',
        desc: 'Complete the 3-minute registration at trinfra.com/register.',
        icon: 'register',
      },
      {
        step: '02',
        title: 'Initial Review',
        desc: 'TRINFRA officers cross-reference satellite and revenue records.',
        icon: 'verify',
      },
      {
        step: '03',
        title: 'Cluster Mapping',
        desc: 'Your parcel is evaluated against ongoing regional growth corridors.',
        icon: 'cluster',
      },
      {
        step: '04',
        title: 'Consultation',
        desc: 'Our team connects with you to discuss development options.',
        icon: 'plan',
      },
      {
        step: '05',
        title: 'Facilitation',
        desc: 'Move forward with pooling discussions at your own pace.',
        icon: 'facilitate',
      },
    ],
    whyConsiderPoints: [
      'Free preliminary land valuation and development feasibility check',
      'Discover if your neighbors are already aggregating nearby parcels',
      'No broker commissions or hidden agency fees',
      'Stay updated on regional infrastructure expansions and town plans',
    ],
    benefits: [
      {
        title: 'Zero Upfront Cost',
        desc: 'Registration and preliminary mapping are 100% complimentary.',
        icon: 'trust',
      },
      {
        title: 'Instant Confirmation',
        desc: 'Receive an official TRINFRA Registration Code (e.g. TRN-LD-...).',
        icon: 'support',
      },
      {
        title: 'Full Owner Control',
        desc: 'You decide whether, when, and how you wish to participate.',
        icon: 'community',
      },
    ],
    comparisonRows: [
      {
        aspect: 'Upfront Fees',
        landPooling: 'Zero (Free registration)',
        traditional: 'High brokerage commissions',
      },
      {
        aspect: 'Data Privacy',
        landPooling: 'Confidential & secured',
        traditional: 'Uncontrolled broker circulation',
      },
      {
        aspect: 'Obligation',
        landPooling: 'Non-binding expression of interest',
        traditional: 'Binding sale agreements & token pressure',
      },
    ],
    thingsToConsider: [
      'Keep your Survey / Re-Survey number handy',
      'Have your phone ready for OTP verification',
      'Consult family co-owners before final project commitment',
    ],
    conclusionParagraphs: [
      'Taking the first step is effortless. Register your land today and discover the true collective potential of your property with TRINFRA.',
    ],
  },
];

export function getAllArticles(): Article[] {
  return ARTICLES;
}

export function getArticleBySlug(slug: string): Article | null {
  const normalized = slug.toLowerCase().trim();
  return (
    ARTICLES.find(
      (a) =>
        a.slug === normalized ||
        a.slug.replace(/-/g, '') === normalized.replace(/-/g, '')
    ) || null
  );
}

export function getRelatedArticles(currentSlug: string, limit = 3): Article[] {
  const current = getArticleBySlug(currentSlug);
  return ARTICLES.filter((a) => a.slug !== current?.slug).slice(0, limit);
}
