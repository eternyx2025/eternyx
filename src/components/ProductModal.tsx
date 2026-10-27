'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useCart } from '@/context/CartContext';
import richProducts from '@/data/products.json';

export interface Product {
  id?: string;
  name: string;
  category: string;
  price: string;
  image: string;
  badge?: string | null;
  description?: string;
  top_notes?: string[];
  heart_notes?: string[];
  base_notes?: string[];
  sizes?: { size: string; stock: number }[];
  additional_images?: string[];
}

function formatImageUrl(url?: string): string {
  if (!url) return '';
  if (url.includes('drive.google.com/thumbnail?id=')) {
    const match = url.match(/[?&]id=([^&]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=w2000`;
    }
  }
  return url;
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const productDetails: Record<string, {
  description: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  sizes: string[];
  reviews: { author: string; rating: number; text: string; date: string }[];
}> = {
  'CANDY': {
    description: 'Some women are remembered. Others are craved. CANDY by ETERNYX was created for her — the woman who is sweet yet powerful, delicate yet magnetic, impossible to forget. It opens with a luscious burst of juicy pear, pink pepper, and soft orange blossom — bright, playful, and instantly captivating. A first impression as irresistible as a smile. At its heart, rich coffee melts into jasmine and bitter almond — warm, sensual, and beautifully addictive. This is where CANDY reveals its depth — feminine, modern, and endlessly alluring. Then comes the seduction. A creamy base of vanilla, patchouli, cedarwood, and cashmere wood wraps the skin in luxurious warmth — soft, lingering, and unforgettable. A trail that leaves them wanting more. CANDY isn\'t just a fragrance. It\'s an experience — sweet, sophisticated, and utterly addictive. For the woman who owns her softness and turns it into power.',
    topNotes: ['Pear', 'Pink Pepper', 'Orange Blossom'],
    heartNotes: ['Coffee', 'Jasmine', 'Bitter Almond'],
    baseNotes: ['Vanilla', 'Patchouli', 'Cedarwood', 'Cashmere Wood'],
    sizes: ['100ml'],
    reviews: [
      { author: 'Emma R.', rating: 5, text: 'So warm and delicious! The vanilla and coffee blend beautifully. I get so many compliments.', date: 'Apr 2026' },
      { author: 'Sarah H.', rating: 5, text: 'Perfect sweet fragrance without being childish. The sillage is fantastic and it lasts all day.', date: 'Mar 2026' },
    ]
  },
  'AFTER MEET': {
    description: 'Some men are remembered for what they say. The rare few are remembered for how they made you feel. AFTER MEET by ETERNYX was created for the second kind — the man who leaves a mark that lingers. It opens with a bright, confident rush of lemon and delicate orange blossom — crisp, clean, and instantly captivating. This is your first impression, sharp and effortless. As it unfolds, an aromatic heart of lavender, rosemary, and warm nutmeg takes hold — refined, bold, and undeniably masculine. It\'s the depth beneath the surface, the character people can\'t quite forget. Then comes the signature. A warm, distinctive base of tonka bean, rich teakwood, and juicy litchi wraps the skin in smooth, magnetic warmth — the scent trail that stays in the room long after you\'ve gone. AFTER MEET isn\'t just a fragrance. It\'s the impression you leave behind. Bold, memorable, and unmistakably you. For the man who understands that presence is the ultimate power.',
    topNotes: ['Lemon', 'Orange Blossom'],
    heartNotes: ['Lavender', 'Rosemary', 'Nutmeg'],
    baseNotes: ['Tonka Bean', 'Teakwood', 'Litchi'],
    sizes: ['100ml'],
    reviews: [
      { author: 'David K.', rating: 5, text: 'A great clean, professional scent. Perfect for the office and morning meetings.', date: 'Apr 2026' },
      { author: 'Michael B.', rating: 4, text: 'Crisp lemon opening and a smooth teakwood base. Lasts around 8 hours on my skin.', date: 'Mar 2026' },
    ]
  },
  'AZURA': {
    description: 'There\'s a certain calm in confidence — the kind that feels as fresh and boundless as the open sea. AZURA by ETERNYX was created to capture it. It opens with a crisp, vibrant burst of apple, bergamot, lemon, and a touch of cinnamon — juicy, bright, and instantly energizing. Like a deep breath of ocean air, it awakens the senses. At its heart, cool aquatic notes flow into orange blossom and juicy plum — fresh, smooth, and effortlessly modern. This is the soul of AZURA — clean, elegant, and endlessly refreshing. Then comes the depth. A sensual base of musk, ambergris, driftwood, and patchouli grounds the fragrance in warm, magnetic sophistication — leaving a trail that\'s fresh yet unforgettable. AZURA isn\'t just a fragrance. It\'s the feeling of freedom, confidence, and modern elegance — bottled for the man who owns every day. Fresh. Vibrant. Timeless.',
    topNotes: ['Apple', 'Bergamot', 'Lemon', 'Cinnamon'],
    heartNotes: ['Aquatic Notes', 'Orange Blossom', 'Plum'],
    baseNotes: ['Musk', 'Ambergris', 'Driftwood', 'Patchouli'],
    sizes: ['100ml'],
    reviews: [
      { author: 'Liam N.', rating: 5, text: 'The best fresh fragrance I own. Feels like a breeze of fresh ocean air. Super clean.', date: 'Apr 2026' },
      { author: 'Chris M.', rating: 5, text: 'Vibrant and juicy opening. Perfect for warm summer days and casual wear.', date: 'Mar 2026' },
    ]
  },
  'MEMORABLE': {
    description: 'Some scents fade. This one becomes a memory. MEMORABLE by ETERNYX blends airy saffron, warm amber, and refined woods into a sophisticated unisex signature. For those who turn every moment into something unforgettable. The most powerful memories aren\'t seen — they\'re felt. A scent in the air. A presence that lingers. MEMORABLE by ETERNYX was created to capture exactly that. It opens with an airy elegance of saffron and jasmine — soft, luminous, and instantly captivating. A first impression that feels both delicate and powerful. At its heart, amberwood and a smooth ambergris accord unfold — warm, refined, and beautifully balanced. This is where MEMORABLE reveals its soul — sophisticated, sensual, and endlessly alluring. Then comes the depth. A grounding base of fir resin and cedarwood settles into the skin — rich, woody, and magnetic. A trail that lingers long after you\'ve gone, turning moments into memories. MEMORABLE isn\'t just a fragrance. It\'s the feeling you leave behind — elegant, timeless, and impossible to forget. Designed for everyone who dares to be unforgettable.',
    topNotes: ['Saffron', 'Jasmine'],
    heartNotes: ['Amberwood', 'Ambergris Accord'],
    baseNotes: ['Fir Resin', 'Cedarwood'],
    sizes: ['100ml'],
    reviews: [
      { author: 'Alex P.', rating: 5, text: 'Incredible unisex fragrance. The saffron and amberwood combination is elegant and mysterious.', date: 'Apr 2026' },
      { author: 'Jordan T.', rating: 5, text: 'This is a masterpiece. It projects incredibly well and leaves a wonderful trail.', date: 'Mar 2026' },
    ]
  },
  'CHERRY BLOW': {
    description: 'Confidence is the most beautiful thing a woman can wear. CHERRY BLOW by ETERNYX was created to celebrate it — bold, feminine, and impossibly luxurious. It opens with a rich, inviting blend of almond, coffee, bergamot, and lemon — warm yet bright, indulgent yet fresh. A first impression that\'s as captivating as it is confident. At its heart, a lavish bouquet of jasmine sambac, tuberose, and orange blossom blooms — sensual, elegant, and undeniably feminine. This is the soul of CHERRY BLOW — floral, refined, and endlessly alluring. Then comes the seduction. A creamy base of tonka bean, cocoa, vanilla, and sandalwood wraps the skin in luxurious warmth — smooth, addictive, and unforgettable. A trail that leaves a lasting impression wherever you go. CHERRY BLOW isn\'t just a fragrance. It\'s a statement of elegance and power — the scent of a woman who knows exactly who she is. Bold. Beautiful. Unforgettable.',
    topNotes: ['Almond', 'Coffee', 'Bergamot', 'Lemon'],
    heartNotes: ['Jasmine Sambac', 'Tuberose', 'Orange Blossom'],
    baseNotes: ['Tonka Bean', 'Cocoa', 'Vanilla', 'Sandalwood'],
    sizes: ['100ml'],
    reviews: [
      { author: 'Sophia L.', rating: 5, text: 'Rich, dark, and beautifully sweet. The tuberose and almond blend is so luxurious.', date: 'Apr 2026' },
      { author: 'Olivia G.', rating: 5, text: 'Absolutely stunning evening scent. Bold, feminine, and turns heads everywhere.', date: 'Mar 2026' },
    ]
  },
  'SOVARE': {
    description: 'Charisma isn\'t taught. It\'s felt the moment you walk in. SOVARE by ETERNYX was created for the man who carries it naturally — bold, energetic, and effortlessly commanding. It opens with a vibrant rush of blood mandarin, grapefruit, and cool mint — juicy, electric, and instantly alive. This is energy in its purest form, the spark that turns heads. At its heart, cinnamon, rose, and warm spices unfold — rich, refined, and undeniably masculine. It\'s the perfect balance of fire and elegance, the character that keeps people intrigued. Then comes the power. A bold base of leather, amber, and smooth woods settles into the skin — confident, sensual, and magnetic. A trail that speaks of strength and sophistication. SOVARE isn\'t just a fragrance. It\'s charisma bottled — the scent of a man who owns every moment. Vibrant. Powerful. Unforgettable.',
    topNotes: ['Blood Mandarin', 'Grapefruit', 'Mint'],
    heartNotes: ['Cinnamon', 'Rose', 'Spices'],
    baseNotes: ['Leather', 'Amber', 'Woody Notes'],
    sizes: ['100ml'],
    reviews: [
      { author: 'Marcus V.', rating: 5, text: 'Bold, spicy mandarin and smooth leather. It makes me feel confident and commanding.', date: 'Apr 2026' },
      { author: 'Tyler D.', rating: 4, text: 'A very unique leather scent. Excellent sillage and lasts all evening.', date: 'Mar 2026' },
    ]
  },
  'DREAM DROP LET': {
    description: 'There\'s a certain freedom in knowing exactly who you are. No noise. No pretending. Just quiet, effortless confidence. DREAM DROP LET by ETERNYX was created for that man. It opens with a sparkling rush of bergamot and warm pepper — fresh, vibrant, and instantly invigorating. It\'s the feeling of a new morning, full of possibility. At its heart, lavender, geranium, and patchouli weave together — aromatic, smooth, and beautifully balanced. This is where character lives — masculine, versatile, and impossible to ignore. Then the foundation settles in. Ambroxan, cedarwood, and labdanum create a rich, woody warmth that clings to the skin — sophisticated, magnetic, and timeless. A scent that feels like second nature. DREAM DROP LET isn\'t just a fragrance. It\'s the essence of freedom and quiet confidence — a signature for the man who moves through life with purpose. Fresh. Masculine. Unforgettable.',
    topNotes: ['Bergamot', 'Pepper'],
    heartNotes: ['Lavender', 'Geranium', 'Patchouli'],
    baseNotes: ['Ambroxan', 'Cedarwood', 'Labdanum'],
    sizes: ['100ml'],
    reviews: [
      { author: 'Ethan W.', rating: 5, text: 'Fresh, woody, and versatile. Great for everyday wear and special occasions alike.', date: 'Apr 2026' },
      { author: 'Ryan J.', rating: 5, text: 'The lavender and cedarwood combination is extremely clean. A true signature scent.', date: 'Mar 2026' },
    ]
  },
  'DARK THINKER': {
    description: 'Some people speak. The powerful ones think. DARK THINKER by ETERNYX was created for the individual of depth — the quiet intellect, the observer, the one whose presence says more than words ever could. It opens with a fresh breath of bergamot and cool green notes — crisp, natural, and grounding. Like the first step into a forest at dawn, it awakens the senses and sets the tone. At its heart lies a rich blend of cedarwood, patchouli, and warm spices — earthy, complex, and beautifully balanced. This is where mystery lives — layered, thoughtful, and impossible to fully define. Then comes the depth. A powerful base of amber, vetiver, and musk grounds the fragrance in raw, sensual warmth — bold, memorable, and magnetic. It lingers on the skin like a thought you can\'t shake. DARK THINKER isn\'t just a fragrance. It\'s the scent of depth and quiet power — designed for everyone who dares to be different. Because true confidence has no gender.',
    topNotes: ['Bergamot', 'Green Notes'],
    heartNotes: ['Cedarwood', 'Patchouli', 'Spices'],
    baseNotes: ['Amber', 'Vetiver', 'Musk'],
    sizes: ['100ml'],
    reviews: [
      { author: 'Taylor R.', rating: 5, text: 'An earthy, intellectual scent. The green notes and vetiver feel very sophisticated.', date: 'Apr 2026' },
      { author: 'Morgan K.', rating: 5, text: 'Beautifully balanced unisex fragrance. Mysterious, woody, and very elegant.', date: 'Mar 2026' },
    ]
  },
  'DARK REVENGE': {
    description: 'There\'s power in mystery. In the man who says little but leaves everyone wondering. DARK REVENGE by ETERNYX was made for him — the one who commands attention without ever asking for it. It opens with a sharp, spicy burst of cardamom — intense, confident, and instantly commanding. This is the entrance. The moment heads turn. At its core, a rich toffee accord melts into the composition — sweet, smooth, and dangerously addictive. It\'s warmth wrapped in seduction, the kind of scent that lingers in someone\'s memory long after you\'ve left. Then comes the depth. A powerful base of amberwood grounds the fragrance in raw, masculine warmth — sensual, bold, and impossible to ignore. DARK REVENGE isn\'t just a fragrance. It\'s your after-dark signature. The scent of confidence, control, and quiet dominance. For the man who doesn\'t chase attention — he commands it.',
    topNotes: ['Cardamom'],
    heartNotes: ['Toffee Accord'],
    baseNotes: ['Amberwood'],
    sizes: ['100ml'],
    reviews: [
      { author: 'James S.', rating: 5, text: 'Seductive and rich. The cardamom and sweet toffee notes are addictive.', date: 'Apr 2026' },
      { author: 'Robert L.', rating: 5, text: 'My go-to evening fragrance. Bold, warm, and gets lots of attention.', date: 'Mar 2026' },
    ]
  },
  'MY STORA': {
    description: 'Some men chase the moment. Others become it. MY STORA by ETERNYX is the scent of motion, confidence, and effortless energy — crafted for the man who never slows down. One spray, and the world notices. There\'s a certain kind of man who walks into a room and changes its rhythm. He doesn\'t announce himself — he simply arrives. MY STORA was created for him. It opens like the first breath of morning — crisp apple, sparkling grapefruit, and sun-warmed mandarin awakening the senses. This is energy you can feel, a freshness that mirrors the spirit of someone always ready for the next adventure. As the hours unfold, a refined heart of violet leaf, soft lavender, and spiced cardamom emerges — aromatic, modern, and quietly powerful. It\'s the moment confidence settles in and becomes second nature. Then comes the lasting impression. A smooth foundation of cedarwood, sensual musk, and warm amber lingers on the skin — grounded, magnetic, unforgettable. MY STORA isn\'t just a fragrance. It\'s the feeling of being fully alive — sporty yet sophisticated, bold yet effortlessly elegant. For the man who lives every day like it matters.',
    topNotes: ['Apple', 'Grapefruit', 'Mandarin'],
    heartNotes: ['Violet Leaf', 'Lavender', 'Cardamom'],
    baseNotes: ['Cedarwood', 'Musk', 'Amber'],
    sizes: ['100ml'],
    reviews: [
      { author: 'Daniel C.', rating: 5, text: 'Energetic, fresh, and sporty. The apple and grapefruit notes are very uplifting.', date: 'Apr 2026' },
      { author: 'Jason P.', rating: 5, text: 'Great performance for a fresh scent. Very versatile and clean.', date: 'Mar 2026' },
    ]
  }
};

const getCounterpartScent = (name: string): string => {
  const normalized = name.toUpperCase().trim();
  if (normalized === 'CANDY') return 'ETERNYX DARK THINKER';
  if (normalized === 'AFTER MEET') return 'ETERNYX MY STORA';
  if (normalized === 'AZURA') return 'ETERNYX MY STORA';
  if (normalized === 'MEMORABLE') return 'ETERNYX DARK THINKER';
  if (normalized === 'CHERRY BLOW') return 'ETERNYX CANDY';
  if (normalized === 'SOVARE') return 'ETERNYX DARK REVENGE';
  if (normalized === 'DREAM DROP LET') return 'ETERNYX MY STORA';
  if (normalized === 'DARK THINKER') return 'ETERNYX DARK REVENGE';
  if (normalized === 'DARK REVENGE') return 'ETERNYX AFTER MEET';
  if (normalized === 'MY STORA') return 'ETERNYX NOIR';
  return 'ETERNYX CANDY';
};

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const detailsColRef = useRef<HTMLDivElement>(null);
  const imageColRef = useRef<HTMLDivElement>(null);
  
  const [selectedSize, setSelectedSize] = useState('100 ml');
  const [reviews, setReviews] = useState<{ author: string; rating: number; text: string; date: string }[]>([]);
  const { addToCart, setIsCartOpen } = useCart();
  const [activeImage, setActiveImage] = useState('');
  
  // Custom interactive details states
  const [activeDetailsTab, setActiveDetailsTab] = useState<'journey' | 'specs' | 'faqs'>('journey');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const images: string[] = [];
    if (product.image) images.push(product.image);
    if (product.additional_images && Array.isArray(product.additional_images)) {
      product.additional_images.forEach(img => {
        if (img && !images.includes(img)) {
          images.push(img);
        }
      });
    }
    return images;
  }, [product]);

  // Lookup the product in rich data (from products.json)
  const richProduct = useMemo(() => {
    if (!product) return null;
    return richProducts.find(rp => rp.name.toLowerCase() === product.name.toLowerCase()) as any;
  }, [product]);

  // Set default tab based on what's available
  useEffect(() => {
    if (richProduct) {
      if (richProduct.fragrance_journey) {
        setActiveDetailsTab('journey');
      } else if (richProduct.key_features) {
        setActiveDetailsTab('specs');
      } else if (richProduct.faqs) {
        setActiveDetailsTab('faqs');
      }
    }
  }, [richProduct]);

  // 1. Resolve product metadata & fallbacks
  const nameKey = product?.name || 'CANDY';
  const fallbackKey = Object.keys(productDetails).find(
    (key) => key.toLowerCase() === nameKey.toLowerCase()
  ) || 'CANDY';
  const fallbackDetails = productDetails[fallbackKey];

  const description = product?.description || fallbackDetails.description;
  const topNotes = product?.top_notes && product.top_notes.length > 0 ? product.top_notes : fallbackDetails.topNotes;
  const heartNotes = product?.heart_notes && product.heart_notes.length > 0 ? product.heart_notes : fallbackDetails.heartNotes;
  const baseNotes = product?.base_notes && product.base_notes.length > 0 ? product.base_notes : fallbackDetails.baseNotes;

  const sizes = useMemo(() => {
    return product?.sizes && product.sizes.length > 0
      ? product.sizes.map((s) => s.size)
      : fallbackDetails.sizes;
  }, [product, fallbackDetails.sizes]);

  // 2. Fetch reviews from Database or fallback
  useEffect(() => {
    if (!product) return;

    fetch(`/api/reviews?productName=${encodeURIComponent(product.name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedReviews = data.map((r: any) => ({
            author: r.customer,
            rating: Number(r.rating),
            text: r.comment,
            date: r.date || new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          }));
          setReviews(mappedReviews);
        } else {
          setReviews(fallbackDetails.reviews);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch product reviews:', err);
        setReviews(fallbackDetails.reviews);
      });
  }, [product, fallbackDetails]);

  // Bypass Lenis scrolling
  useEffect(() => {
    const detailsEl = detailsColRef.current;
    const imageEl = imageColRef.current;
    const panelEl = panelRef.current;
    if (!detailsEl || !product) return;

    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (window.innerWidth <= 1024 && panelEl) {
        panelEl.scrollTop += e.deltaY;
      } else {
        detailsEl.scrollTop += e.deltaY;
      }
    };

    detailsEl.addEventListener('wheel', onWheel, { passive: false, capture: true });
    imageEl?.addEventListener('wheel', onWheel, { passive: false, capture: true });
    panelEl?.addEventListener('wheel', onWheel, { passive: false, capture: true });

    return () => {
      detailsEl.removeEventListener('wheel', onWheel, { capture: true });
      imageEl?.removeEventListener('wheel', onWheel, { capture: true });
      panelEl?.removeEventListener('wheel', onWheel, { capture: true });
    };
  }, [product]);

  useEffect(() => {
    if (product && panelRef.current && overlayRef.current) {
      if (sizes?.[0]) {
        setSelectedSize(sizes[0]);
      }

      // Stop background scrolling
      const lenis = (window as any).lenis;
      lenis?.stop();
      document.body.style.overflow = 'hidden';

      // Animate In
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
      gsap.fromTo(panelRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.6, ease: 'expo.out', delay: 0.05 }
      );
    }

    return () => {
      const lenis = (window as any).lenis;
      const isCartOpen = document.querySelector('.cart-drawer.open');
      if (!isCartOpen) {
        lenis?.start();
        document.body.style.overflow = '';
      }
    };
  }, [product, sizes]);

  const handleClose = () => {
    if (panelRef.current && overlayRef.current) {
      gsap.to(panelRef.current, { x: '100%', opacity: 0, duration: 0.4, ease: 'power2.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: onClose });
    }
  };

  if (!product) return null;

  const counterpartScent = getCounterpartScent(product.name);

  return (
    <div className="pm-overlay" ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}>
      <div className="pm-panel" ref={panelRef} data-lenis-prevent>

        {/* Close Button */}
        <button className="pm-close" onClick={handleClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Left — Image */}
        <div className="pm-image-col" ref={imageColRef}>
          <div className="pm-image-wrap">
            {product.badge && <span className="product-badge">{product.badge}</span>}
            {(activeImage || product.image) ? (
              <Image
                src={formatImageUrl(activeImage || product.image)}
                alt={
                  (richProduct?.image_alt && richProduct.image_alt[allImages.indexOf(activeImage || product.image)]) ||
                  `${product.name} Eau de Parfum by ETERNYX`
                }
                width={1600}
                height={2000}
                style={{ width: '100%', minWidth: '100%', maxWidth: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom', display: 'block', transition: 'opacity 0.3s ease' }}
                key={activeImage}
                referrerPolicy="no-referrer"
                unoptimized={true}
              />
            ) : (
              <div className="pm-no-image-placeholder">
                <span className="placeholder-brand">ETERNYX</span>
                <span className="placeholder-name">{product.name}</span>
              </div>
            )}
          </div>
          
          {/* Thumbnails Strip */}
          {allImages.length > 1 && (
            <div className="pm-thumbnails">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`pm-thumbnail-btn ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img
                    src={formatImageUrl(img)}
                    alt={
                      (richProduct?.image_alt && richProduct.image_alt[idx]) ||
                      `${product.name} thumbnail ${idx + 1}`
                    }
                    className="pm-thumbnail-img"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Scent Pyramid */}
          <div className="pm-pyramid pm-pyramid-desktop">
            <p className="pm-section-label">Scent Pyramid</p>
            <div className="pm-notes-grid">
              <div className="pm-note-group">
                <span className="pm-note-type">Top</span>
                {topNotes.map(n => <span key={n} className="pm-note-tag">{n}</span>)}
              </div>
              <div className="pm-note-group">
                <span className="pm-note-type">Heart</span>
                {heartNotes.map(n => <span key={n} className="pm-note-tag">{n}</span>)}
              </div>
              <div className="pm-note-group">
                <span className="pm-note-type">Base</span>
                {baseNotes.map(n => <span key={n} className="pm-note-tag">{n}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Details */}
        <div className="pm-details-col" ref={detailsColRef}>
          <p className="pm-category">{product.category}</p>
          <h2 className="pm-name">{product.name}</h2>
          {/* Savings with Coupon */}
          <p className="pm-savings">(Saving ₹650.00 with NEW50)</p>

          {/* Pricing Row: Final Price with Coupon + Cut Original Price */}
          <div className="pm-price-row">
            <span className="pm-final-price">₹649</span>
            <span className="pm-cut-price">
              {typeof product.price === 'number'
                ? `₹${product.price}`
                : product.price?.startsWith('$')
                ? product.price.replace('$', '₹')
                : product.price?.startsWith('₹')
                ? product.price
                : `₹${product.price}`}
            </span>
            <div className="pm-rating-badge">
              <span className="rating-star">★</span>
              <span>4.8</span>
            </div>
          </div>

          {/* Tagline / Hook */}
          {richProduct && richProduct.hook && (
            <p className="pm-hook">&ldquo;{richProduct.hook}&rdquo;</p>
          )}

          {/* Scent Pyramid (Mobile Only) */}
          <div className="pm-pyramid pm-pyramid-mobile">
            <p className="pm-section-label">Scent Pyramid</p>
            <div className="pm-notes-grid">
              <div className="pm-note-group">
                <span className="pm-note-type">Top</span>
                {topNotes.map(n => <span key={n} className="pm-note-tag">{n}</span>)}
              </div>
              <div className="pm-note-group">
                <span className="pm-note-type">Heart</span>
                {heartNotes.map(n => <span key={n} className="pm-note-tag">{n}</span>)}
              </div>
              <div className="pm-note-group">
                <span className="pm-note-type">Base</span>
                {baseNotes.map(n => <span key={n} className="pm-note-tag">{n}</span>)}
              </div>
            </div>
          </div>

          {/* Size Selector */}
          <div className="pm-size-section">
            <p className="pm-section-label">Select Size</p>
            <div className="pm-sizes">
              {sizes.map(size => (
                <button
                  key={size}
                  className={`pm-size-btn ${selectedSize === size ? 'pm-size-active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="pm-actions">
            <button className="pm-btn-cart" onClick={(e) => addToCart(product, selectedSize, 1, { x: e.clientX, y: e.clientY })}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Add to Cart
            </button>
            <button className="pm-btn-buy" onClick={(e) => {
              addToCart(product, selectedSize, 1, { x: e.clientX, y: e.clientY });
              setIsCartOpen(true);
              handleClose();
            }}>Buy Now</button>
          </div>

          {/* Dynamic Tabs: Spec Sheet, Scent Journey & FAQs */}
          {richProduct && (richProduct.fragrance_journey || richProduct.key_features || (richProduct.faqs && richProduct.faqs.length > 0)) && (
            <div className="pm-tabs-container">
              <div className="pm-tabs-nav">
                {richProduct.fragrance_journey && (
                  <button 
                    className={`pm-tab-trigger ${activeDetailsTab === 'journey' ? 'active' : ''}`}
                    onClick={() => setActiveDetailsTab('journey')}
                  >
                    Scent Journey
                  </button>
                )}
                {richProduct.key_features && (
                  <button 
                    className={`pm-tab-trigger ${activeDetailsTab === 'specs' ? 'active' : ''}`}
                    onClick={() => setActiveDetailsTab('specs')}
                  >
                    Specifications
                  </button>
                )}
                {richProduct.faqs && richProduct.faqs.length > 0 && (
                  <button 
                    className={`pm-tab-trigger ${activeDetailsTab === 'faqs' ? 'active' : ''}`}
                    onClick={() => setActiveDetailsTab('faqs')}
                  >
                    FAQs
                  </button>
                )}
              </div>
              <div className="pm-tabs-content">
                {activeDetailsTab === 'journey' && richProduct.fragrance_journey && (
                  <div className="pm-journey-content">
                    <div className="journey-step">
                      <div className="journey-time">0–30 MIN</div>
                      <div className="journey-info">
                        <h4>The Opening</h4>
                        <p>{richProduct.fragrance_journey.opening}</p>
                      </div>
                    </div>
                    <div className="journey-step">
                      <div className="journey-time">30 MIN–3 HRS</div>
                      <div className="journey-info">
                        <h4>The Heart</h4>
                        <p>{richProduct.fragrance_journey.heart}</p>
                      </div>
                    </div>
                    <div className="journey-step">
                      <div className="journey-time">3 HRS+</div>
                      <div className="journey-info">
                        <h4>The Dry Down</h4>
                        <p>{richProduct.fragrance_journey.dry_down}</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeDetailsTab === 'specs' && richProduct.key_features && (
                  <div className="pm-specs-content">
                    <table className="specs-table">
                      <tbody>
                        {Object.entries(richProduct.key_features).map(([key, val]) => (
                          <tr key={key}>
                            <td className="spec-name">{key.replace('_', ' ').toUpperCase()}</td>
                            <td className="spec-val">{val as string}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {activeDetailsTab === 'faqs' && richProduct.faqs && (
                  <div className="pm-faqs-content">
                    {richProduct.faqs.map((faq: any, idx: number) => (
                      <div className="faq-item" key={idx}>
                        <button 
                          className={`faq-question ${expandedFaq === idx ? 'expanded' : ''}`}
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        >
                          <span>{faq.question}</span>
                          <span className="faq-icon">{expandedFaq === idx ? '−' : '+'}</span>
                        </button>
                        {expandedFaq === idx && (
                          <div className="faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cross-Sell, Upsell & Trust Badges Section */}
          {richProduct && (
            <div className="pm-cross-sell-section">
              {richProduct.upsell ? (
                <div className="pm-upsell-card">
                  <div className="upsell-badge">Special Scent Bundle</div>
                  <p className="upsell-text">{richProduct.upsell}</p>
                </div>
              ) : (
                <div className="pm-upsell-card">
                  <div className="upsell-badge">Special Scent Bundle</div>
                  <h4>Upgrade to the {product.name} Luxury Duo Set</h4>
                  <p>Get the 100ml Eau de Parfum + Matching Travel Spray + Premium Gift Box at a special bundle price. The complete luxury signature experience.</p>
                </div>
              )}

              {richProduct.objection_handling && richProduct.objection_handling.length > 0 && (
                <div className="pm-objections-section">
                  <p className="pm-section-label">Buyer Assurance</p>
                  <div className="pm-objections-grid">
                    {richProduct.objection_handling.map((item: any, idx: number) => (
                      <div key={idx} className="objection-card">
                        <p className="objection-q">{item.question}</p>
                        <p className="objection-a">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pm-trust-badges">
                <div className="badge-item">🔒 Secure Checkout</div>
                <div className="badge-item">🚚 Fast Shipping</div>
                <div className="badge-item">🛡️ 100% Authentic</div>
              </div>

              <div className="pm-direct-link-box">
                <a 
                  href={`/shop/${encodeURIComponent(product.name.toLowerCase().trim().replace(/\s+/g, '-'))}`}
                  className="pm-direct-link"
                >
                  <span>Open Full Dedicated Product Page</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Fragrance Story / Full Description */}
          {description && (
            <div className="pm-story-section" style={{ marginTop: '36px', marginBottom: '24px' }}>
              <p className="pm-section-label">The Fragrance Story</p>
              <p className="pm-description" style={{ marginBottom: 0 }}>{description}</p>
            </div>
          )}

          {/* Divider */}
          <div className="pm-divider" style={{ marginTop: '30px' }} />

          {/* Reviews */}
          <div className="pm-reviews">
            <p className="pm-section-label">Customer Reviews</p>
            <div className="pm-review-summary">
              <span className="pm-review-score">5.0</span>
              <div>
                <div className="pm-stars">★★★★★</div>
                <span className="pm-review-count">Based on {reviews.length} reviews</span>
              </div>
            </div>
            <div className="pm-review-list">
              {reviews.map((r, i) => (
                <div key={i} className="pm-review-card">
                  <div className="pm-review-header">
                    <div className="pm-review-avatar">{r.author ? r.author[0] : 'C'}</div>
                    <div>
                      <p className="pm-review-author">{r.author || 'Verified Customer'}</p>
                      <span className="pm-review-date">{r.date}</span>
                    </div>
                    <div className="pm-review-stars">{'★'.repeat(r.rating)}</div>
                  </div>
                  <p className="pm-review-text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
