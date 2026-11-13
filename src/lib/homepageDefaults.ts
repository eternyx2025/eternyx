import {
  HomepageAnnouncement,
  HomepageCategoryPill,
  HomepagePopup,
  HomepagePressItem,
  HomepageBundleCard,
  HomepageNoteProfile,
  HomepageRetailPartner,
  HomepagePromise,
  HomepageInstagramPost,
  HomepageTitles,
} from './types';

export const DEFAULT_ANNOUNCEMENTS: HomepageAnnouncement[] = [
  { text: 'Festive Gifting Starts Here. Early Festive Prices Are Live.', code: '', link: '/shop' },
  { text: 'Get Additional ₹50 OFF. Use Code: FESTIVE50', code: 'FESTIVE50', link: '/shop' },
  { text: 'Complimentary Luxury Samples with Every Order', code: '', link: '/shop' },
  { text: 'Free Express Shipping Across India', code: '', link: '/shop' },
];

export const DEFAULT_CATEGORY_PILLS: HomepageCategoryPill[] = [
  { id: 'all', label: 'All', slug: 'all', active: true },
  { id: 'gourmand', label: 'Gourmand', slug: 'gourmand', active: true },
  { id: 'him', label: 'Him', slug: 'him', active: true },
  { id: 'her', label: 'Her', slug: 'her', active: true },
  { id: 'unisex', label: 'Unisex', slug: 'unisex', active: true },
  { id: 'fruity', label: 'Fruity', slug: 'fruity', active: true },
  { id: 'fresh', label: 'Fresh', slug: 'fresh', active: true },
  { id: 'vanilla', label: 'Vanilla', slug: 'vanilla', active: true },
  { id: 'woody', label: 'Woody', slug: 'woody', active: true },
  { id: 'floral', label: 'Floral', slug: 'floral', active: true },
];

export const DEFAULT_POPUP: HomepagePopup = {
  enabled: true,
  title: 'Festive Sale is Live!',
  subtitle: "We're making your festive shopping extra special with exclusive gifts on orders.",
  imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
  buttonText: 'Explore Now',
  buttonUrl: '/shop',
  delaySeconds: 1,
};

export const DEFAULT_PRESS: HomepagePressItem[] = [
  { id: '1', name: 'ELLE', text: 'ELLE', url: '#' },
  { id: '2', name: 'BAZAAR', text: 'HARPER’S BAZAAR', url: '#' },
  { id: '3', name: 'LIFESTYLE ASIA', text: 'LIFESTYLE ASIA', url: '#' },
  { id: '4', name: 'GQ', text: 'GQ', url: '#' },
  { id: '5', name: 'COSMOPOLITAN', text: 'COSMOPOLITAN', url: '#' },
  { id: '6', name: 'ENTRACKR', text: 'ENTRACKR', url: '#' },
  { id: '7', name: 'NEWS18', text: 'NEWS 18', url: '#' },
  { id: '8', name: 'ET RETAIL', text: 'ET Retail', url: '#' },
  { id: '9', name: 'HINDUSTAN TIMES', text: 'Hindustan Times', url: '#' },
];

export const DEFAULT_BUNDLES: HomepageBundleCard[] = [
  {
    id: '1',
    title: 'PICK, PAIR AND LAYER YOUR WAY',
    subtitle: 'SAVE UPTO 60% OFF',
    buttonText: 'BUILD BUNDLE ↗',
    buttonUrl: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '2',
    title: 'PICK ANY 4 X 10ML OF YOUR CHOICE',
    subtitle: 'SAVE UPTO 60% OFF',
    buttonText: 'BUILD BUNDLE ↗',
    buttonUrl: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
  },
];

export const DEFAULT_NOTE_PROFILES: HomepageNoteProfile[] = [
  {
    id: 'gourmand',
    name: 'Gourmand',
    tag: 'Gourmand',
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80',
    description: 'Rich vanilla, caramel, roasted coffee & honey',
  },
  {
    id: 'floral',
    name: 'Floral',
    tag: 'Floral',
    imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80',
    description: 'Velvet rose, jasmine sambac & white lily',
  },
  {
    id: 'fruity',
    name: 'Fruity',
    tag: 'Fruity',
    imageUrl: 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=400&q=80',
    description: 'Wild dark berries, crisp pear & juicy mango',
  },
  {
    id: 'fresh',
    name: 'Fresh',
    tag: 'Fresh',
    imageUrl: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=400&q=80',
    description: 'Calabrian bergamot, aquatic breeze & neroli',
  },
  {
    id: 'woody',
    name: 'Woody',
    tag: 'Woody',
    imageUrl: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=400&q=80',
    description: 'Smokey cedarwood, amber resin & royal oud',
  },
];

export const DEFAULT_RETAIL_PARTNERS: HomepageRetailPartner[] = [
  { id: '1', name: 'Zepto', text: 'zepto', url: '#' },
  { id: '2', name: 'Instamart', text: 'instamart', url: '#' },
  { id: '3', name: 'Myntra', text: 'Myntra', url: '#' },
  { id: '4', name: 'Nykaa', text: 'NYKAA', url: '#' },
  { id: '5', name: 'Blinkit', text: 'blinkit', url: '#' },
  { id: '6', name: 'Amazon', text: 'amazon', url: '#' },
];

export const DEFAULT_PROMISES: HomepagePromise[] = [
  { id: '1', title: 'IFRA Certified', description: 'Global safety standard' },
  { id: '2', title: 'FDA Approved', description: 'Certified purity' },
  { id: '3', title: 'Paraben Free', description: 'Skin-friendly safety' },
  { id: '4', title: 'Gentle On Skin', description: 'Dermatologically tested' },
  { id: '5', title: 'Animal Cruelty-Free', description: 'Ethical craftsmanship' },
  { id: '6', title: 'Vegetable-Based Alcohol', description: 'Pure sugarcane spirits' },
  { id: '7', title: 'Homegrown Brand', description: 'Proudly crafted in India' },
  { id: '8', title: 'Phthalates Free', description: 'Zero toxic additives' },
];

export const DEFAULT_INSTAGRAM: HomepageInstagramPost[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
    caption: "Let's get the party and compliments started.",
    url: 'https://instagram.com',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80',
    caption: 'Leave a trail wherever you go.',
    url: 'https://instagram.com',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
    caption: 'Rich coffee, warm vanilla & cashmere.',
    url: 'https://instagram.com',
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80',
    caption: 'Quiet luxury for the discerning.',
    url: 'https://instagram.com',
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=600&q=80',
    caption: 'Signature scents that linger all night.',
    url: 'https://instagram.com',
  },
];

export const DEFAULT_TITLES: HomepageTitles = {
  shopMomentTitle: 'SHOP THE MOMENT',
  genderTitle: 'SHOP BY GENDER',
  hypeTitle: "SEE WHAT THE HYPE'S ABOUT",
  noteProfileTitle: 'SHOP BY NOTE PROFILE',
  giftingTitle: 'THE GIFTING EDIT',
  promisesTitle: 'OUR PROMISES',
  customerCountTitle: 'LOVED BY 50,000+ CUSTOMERS',
  instagramTitle: 'OUR INSTAGRAM',
  brandWordmark: 'ETERNYX',
  brandTagline: 'Memories • Feelings • Notes • Fragrances',
};

