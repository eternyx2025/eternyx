'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface Question {
  id: string;
  title: string;
  options: { value: string; label: string; description: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'vibe',
    title: 'Select your preferred atmosphere',
    options: [
      { value: 'nocturnal', label: 'Nocturnal', description: 'Dark, mysterious, incense-filled libraries and midnight rain.' },
      { value: 'sun-drenched', label: 'Sun-Drenched', description: 'Bright, warm, radiant dawn reflecting off stone terraces.' },
      { value: 'ethereal', label: 'Ethereal', description: 'Cool, mineral, silent fog rolling over grey mountains.' }
    ]
  },
  {
    id: 'intensity',
    title: 'What presence should your scent command?',
    options: [
      { value: 'skin', label: 'Skin Scent', description: 'Intimate, whisper-soft sillage designed only for those close to you.' },
      { value: 'moderate', label: 'Moderate', description: 'Balanced, elegant trace that drifts gracefully with motion.' },
      { value: 'bold', label: 'Intense', description: 'Commanding, rich projection that claims the space entirely.' }
    ]
  },
  {
    id: 'accord',
    title: 'Choose your preferred primary family accord',
    options: [
      { value: 'wood', label: 'Wood & Resins', description: 'Warm agarwood, cedar, smoke, and comforting spices.' },
      { value: 'citrus', label: 'Fresh & Mineral', description: 'Vibrant bergamot, grapefruit, aldehydes, and sea salt.' },
      { value: 'floral', label: 'Sensual Floral', description: 'Honeyed rose absolute, dark saffron, and night-blooming jasmine.' }
    ]
  }
];

const RECOMMENDATION_MAP: Record<string, {
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
}> = {
  'DARK REVENGE': {
    name: 'DARK REVENGE',
    category: 'Eau de Parfum',
    price: '₹599.00',
    image: '/images/product-dark-revenge.png',
    description: 'Seductive & rich. Fiery cardamom, sweet toffee accord, and deep amberwood.'
  },
  'CANDY': {
    name: 'CANDY',
    category: 'Eau de Parfum',
    price: '₹599.00',
    image: '/images/product-candy.png',
    description: 'Irresistible sweetness. Warm vanilla, rich coffee, and delicate white jasmine.'
  },
  'AZURA': {
    name: 'AZURA',
    category: 'Eau de Parfum',
    price: '₹599.00',
    image: '/images/product-azura.png',
    description: 'Aquatic freedom. Fresh apple, crisp bergamot, aquatic accords, and sensual musk.'
  },
  'MEMORABLE': {
    name: 'MEMORABLE',
    category: 'Eau de Parfum',
    price: '₹599.00',
    image: '/images/product-memorable.png',
    description: 'Unforgettable presence. Airy saffron, warm golden amber, and cedarwood.'
  },
  'CHERRY BLOW': {
    name: 'CHERRY BLOW',
    category: 'Eau de Parfum',
    price: '₹599.00',
    image: '/images/product-cherry-blow.png',
    description: 'Feminine luxury. Sweet almond, rich coffee, tuberose, and vanilla absolute.'
  },
  'SOVARE': {
    name: 'SOVARE',
    category: 'Eau de Parfum',
    price: '₹599.00',
    image: '/images/product-sovare.png',
    description: 'Charismatic power. Blood mandarin, zesty grapefruit, rose, and warm leather.'
  },
  'DREAM DROP LET': {
    name: 'DREAM DROP LET',
    category: 'Eau de Parfum',
    price: '₹599.00',
    image: '/images/product-dream-drop-let.png',
    description: 'Quiet confidence. Bergamot, lavender, ambroxan, and cedarwood.'
  },
  'DARK THINKER': {
    name: 'DARK THINKER',
    category: 'Eau de Parfum',
    price: '₹599.00',
    image: '/images/product-dark-thinker.png',
    description: 'Quiet intellect. Fresh bergamot, green notes, cedarwood, and warm spices.'
  },
  'AFTER MEET': {
    name: 'AFTER MEET',
    category: 'Eau de Parfum',
    price: '₹599.00',
    image: '/images/product-after-meet.png',
    description: 'Distinctive presence. Aromatic lavender, fresh orange blossom, lemon, and teakwood.'
  },
  'MY STORA': {
    name: 'MY STORA',
    category: 'Eau de Parfum',
    price: '₹599.00',
    image: '/images/product-my-stora.png',
    description: 'Life in motion. Apple, grapefruit, violet leaf, and golden amber.'
  }
};

export default function BespokePage() {
  const { addToCart, setIsCartOpen } = useCart();
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendedProduct, setRecommendedProduct] = useState<typeof RECOMMENDATION_MAP[string] | null>(null);
  const [visibleProducts, setVisibleProducts] = useState<any[]>([]);

  // Fetch visible products on mount to filter recommendations
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVisibleProducts(data);
        }
      })
      .catch(err => console.error('Failed to fetch visible products:', err));
  }, []);

  // VIP Booking states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Paris');
  const [message, setMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSelectOption = (questionId: string, value: string) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate Match
      let matchName = 'MEMORABLE'; // Default
      
      const vibe = updatedAnswers['vibe'];
      const accord = updatedAnswers['accord'];
      const intensity = updatedAnswers['intensity'];

      if (vibe === 'nocturnal') {
        if (accord === 'wood') {
          matchName = 'DARK REVENGE';
        } else if (accord === 'floral') {
          matchName = 'CHERRY BLOW';
        } else {
          matchName = 'SOVARE';
        }
      } else if (vibe === 'ethereal') {
        if (accord === 'citrus') {
          matchName = 'AZURA';
        } else if (accord === 'wood') {
          matchName = 'DARK THINKER';
        } else {
          matchName = 'MEMORABLE';
        }
      } else { // sun-drenched
        if (accord === 'citrus') {
          matchName = 'AFTER MEET';
        } else if (accord === 'floral') {
          matchName = 'CANDY';
        } else {
          matchName = 'MY STORA';
        }
      }

      // Enforce visibility check: if matched product is not visible, fallback to first visible product
      const isVisible = visibleProducts.some(p => p.name.toUpperCase() === matchName);
      if (!isVisible && visibleProducts.length > 0) {
        const replacement = visibleProducts.find(p => RECOMMENDATION_MAP[p.name.toUpperCase()] !== undefined);
        if (replacement) {
          matchName = replacement.name.toUpperCase();
        } else {
          matchName = visibleProducts[0].name.toUpperCase();
        }
      }

      setRecommendedProduct(RECOMMENDATION_MAP[matchName] || RECOMMENDATION_MAP['MEMORABLE']);
      setStep(QUESTIONS.length);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setRecommendedProduct(null);
    setStep(0);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!recommendedProduct) return;
    
    // Map custom recommendation format to cart context structure
    const cartProduct = {
      name: recommendedProduct.name,
      category: recommendedProduct.category,
      price: recommendedProduct.price,
      image: recommendedProduct.image,
      badge: null
    };

    addToCart(cartProduct, '100 ml', 1, { x: e.clientX, y: e.clientY });
    setIsCartOpen(true);
  };

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, location, message }),
      });
      if (res.ok) {
        setBookingSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        const data = await res.json();
        setBookingError(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError('Network error. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <main className="bespoke-container">
      {/* Editorial Header */}
      <section className="bespoke-hero">
        <p className="bespoke-eyebrow">Bespoke Experience</p>
        <h1 className="bespoke-title">The Custom Atelier</h1>
        <p className="bespoke-subtitle">
          Find your signature, or consult with our creators. We guide you to your exact olfactory match, or formulate a compound aligned exclusively to your character.
        </p>
      </section>

      {/* Scent Finder Widget */}
      <section className="scent-finder-section">
        <div className="glass-card finder-card">
          {step < QUESTIONS.length ? (
            <div className="wizard-step">
              <div className="step-progress">
                <span className="step-num">Step {step + 1} of {QUESTIONS.length}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
                </div>
              </div>

              <h2 className="step-title">{QUESTIONS[step].title}</h2>

              <div className="options-grid">
                {QUESTIONS[step].options.map((opt) => (
                  <button
                    key={opt.value}
                    className="option-btn"
                    onClick={() => handleSelectOption(QUESTIONS[step].id, opt.value)}
                  >
                    <span className="opt-label">{opt.label}</span>
                    <span className="opt-desc">{opt.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            recommendedProduct && (
              <div className="recommendation-result">
                <p className="result-eyebrow">Your Olfactory Match</p>
                <div className="result-grid">
                  <div className="result-img-box">
                    {recommendedProduct.image ? (
                      <img src={recommendedProduct.image} alt={recommendedProduct.name} />
                    ) : (
                      <div className="product-card-placeholder">
                        <span className="placeholder-brand">ETERNYX</span>
                        <span className="placeholder-name">{recommendedProduct.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="result-info">
                    <span className="result-category">{recommendedProduct.category}</span>
                    <h2 className="result-name">{recommendedProduct.name}</h2>
                    <p className="result-price">{recommendedProduct.price}</p>
                    <p className="result-desc">{recommendedProduct.description}</p>
                    
                    <div className="result-actions">
                      <button className="add-cart-btn" onClick={handleAddToCart}>
                        Add Match to Cart
                      </button>
                      <button className="reset-btn" onClick={handleReset}>
                        Retake Scent Finder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* VIP Booking Form */}
      <section className="booking-section">
        <div className="booking-grid">
          <div className="booking-text">
            <h2>Bespoke Consultation</h2>
            <p>
              For individuals seeking absolute exclusivity, ETERNYX offers private formulation commissions conducted via intimate virtual video consultations. 
            </p>
            <p>
              Our master perfumers spend three digital sessions mapping your sensory memories and skin chemistry to yield a singular recipe, registered under your name and preserved in our vault.
            </p>
            <div className="booking-addresses">
              <div className="addr-box">
                <strong>Virtual Scent Atelier</strong>
                <p>Private video sessions on Zoom or Google Meet</p>
              </div>
              <div className="addr-box">
                <strong>Online Booking</strong>
                <p>Direct calendar scheduling after initial concierge review</p>
              </div>
            </div>
          </div>
          
          <div className="booking-form-col">
            <div className="glass-card booking-card">
              <h3>Request Consultation</h3>
              
              {bookingSuccess ? (
                <div className="booking-success">
                  <span className="success-icon">✓</span>
                  <h4>Request Received</h4>
                  <p>A client concierge will contact you discreetly within 24 hours to schedule your session.</p>
                  <button className="reset-btn-sub" onClick={() => setBookingSuccess(false)}>Book Another Session</button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="bespoke-form">
                  <div className="form-group">
                    <label htmlFor="cli-name">Full Name</label>
                    <input 
                      id="cli-name"
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alexander Vance"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cli-email">Contact Email</label>
                    <input 
                      id="cli-email"
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexander@vance.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cli-loc">Consultation Format</label>
                    <select 
                      id="cli-loc"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="Virtual Video">Virtual Video Consultation (Zoom/Meet)</option>
                      <option value="Virtual Audio">Virtual Audio Call</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cli-notes">Olfactory Direction / Notes</label>
                    <textarea 
                      id="cli-notes"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe any particular notes or sensory memories you wish to explore (optional)..."
                      rows={3}
                    />
                  </div>
                  {bookingError && <p className="form-error">{bookingError}</p>}
                  <button type="submit" className="submit-booking-btn" disabled={bookingLoading}>
                    {bookingLoading ? 'Submitting…' : 'Submit Reservation Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .bespoke-container {
          min-height: 100vh;
          background-color: #FAF6F4;
          padding: 140px 50px 80px 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #1A1617;
        }

        .bespoke-hero {
          text-align: center;
          margin-bottom: 60px;
          max-width: 700px;
        }

        .bespoke-eyebrow {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #B66D31;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .bespoke-title {
          font-family: var(--font-serif);
          font-size: 2.75rem;
          color: #1A1617;
          font-weight: 400;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .bespoke-subtitle {
          font-size: 0.95rem;
          color: #7A6E6A;
          line-height: 1.7;
          font-weight: 400;
        }

        .scent-finder-section {
          width: 100%;
          max-width: 900px;
          margin-bottom: 100px;
        }

        .glass-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 6px;
          padding: 40px;
          box-shadow: 0 4px 16px rgba(26, 22, 23, 0.03);
        }

        .step-progress {
          margin-bottom: 30px;
        }

        .step-num {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #7A6E6A;
          font-weight: 600;
          display: block;
          margin-bottom: 10px;
        }

        .bar-track {
          width: 100%;
          height: 3px;
          background: #EDE1DC;
          border-radius: 2px;
        }

        .bar-fill {
          height: 100%;
          background: #D99458;
          border-radius: 2px;
          transition: width 0.4s ease;
        }

        .step-title {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          color: #1A1617;
          margin-bottom: 30px;
          font-weight: 400;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .option-btn {
          background: #FAF6F4;
          border: 1.5px solid #EDE1DC;
          padding: 24px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 8px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
        }

        .option-btn:hover {
          background: #FFFFFF;
          border-color: #D99458;
          box-shadow: 0 4px 14px rgba(217, 148, 88, 0.12);
        }

        .opt-label {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          color: #1A1617;
          font-weight: 500;
        }

        .opt-desc {
          font-size: 0.85rem;
          color: #7A6E6A;
          line-height: 1.5;
        }

        .recommendation-result {
          text-align: center;
        }

        .result-eyebrow {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #B66D31;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .result-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 40px;
          align-items: center;
          text-align: left;
        }

        @media (max-width: 768px) {
          .result-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        .result-img-box {
          height: 320px;
          background: #FAF6F4;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #EDE1DC;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .result-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .result-category {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #7A6E6A;
          font-weight: 600;
          display: block;
          margin-bottom: 8px;
        }

        .result-name {
          font-family: var(--font-serif);
          font-size: 2rem;
          color: #1A1617;
          margin-bottom: 6px;
          font-weight: 400;
        }

        .result-price {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          color: #B66D31;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .result-desc {
          font-size: 0.92rem;
          color: #4A403E;
          line-height: 1.7;
          margin-bottom: 30px;
        }

        .result-actions {
          display: flex;
          gap: 16px;
        }

        .add-cart-btn {
          background: #1A1617;
          color: #FAF6F4;
          border: none;
          padding: 12px 24px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-cart-btn:hover {
          background: #2D2527;
        }

        .reset-btn {
          background: #FAF6F4;
          color: #1A1617;
          border: 1.5px solid #EDE1DC;
          padding: 12px 24px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          border-color: #D99458;
          background: #FFFFFF;
        }

        .booking-section {
          width: 100%;
          max-width: 1100px;
          margin-bottom: 40px;
        }

        .booking-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 60px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .booking-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        .booking-text h2 {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          color: #1A1617;
          margin-bottom: 20px;
          font-weight: 400;
        }

        .booking-text p {
          font-size: 0.95rem;
          color: #4A403E;
          line-height: 1.8;
          margin-bottom: 20px;
          font-weight: 400;
        }

        .booking-addresses {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .addr-box strong {
          color: #1A1617;
          font-size: 0.92rem;
          display: block;
          margin-bottom: 4px;
        }

        .addr-box p {
          font-size: 0.85rem;
          color: #7A6E6A;
          margin: 0;
        }

        .booking-card h3 {
          font-family: var(--font-serif);
          font-size: 1.45rem;
          color: #1A1617;
          margin-bottom: 24px;
          font-weight: 400;
        }

        .bespoke-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #7A6E6A;
          font-weight: 600;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          background: #FFFFFF;
          border: 1.5px solid #EDE1DC;
          padding: 11px 14px;
          color: #1A1617;
          font-size: 0.88rem;
          font-family: inherit;
          border-radius: 4px;
          transition: border-color 0.2s;
        }

        .form-group select option {
          background: #FFFFFF;
          color: #1A1617;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #D99458;
          background: #FFFFFF;
        }

        .submit-booking-btn {
          margin-top: 10px;
          background: #1A1617;
          color: #FAF6F4;
          border: none;
          padding: 13px;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-booking-btn:hover { background: #2D2527; }
        .submit-booking-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .form-error {
          color: #c53030;
          font-size: 0.8rem;
          padding: 8px 12px;
          background: rgba(229, 62, 62, 0.08);
          border: 1px solid rgba(229, 62, 62, 0.25);
          border-radius: 4px;
        }

        .booking-success {
          text-align: center;
          padding: 30px 0;
        }

        .success-icon {
          font-size: 2.5rem;
          color: #276749;
          display: block;
          margin-bottom: 16px;
        }

        .booking-success h4 {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: #1A1617;
          margin-bottom: 10px;
          font-weight: 400;
        }

        .booking-success p {
          font-size: 0.88rem;
          color: #7A6E6A;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .reset-btn-sub {
          background: #FAF6F4;
          border: 1.5px solid #EDE1DC;
          color: #1A1617;
          padding: 10px 20px;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn-sub:hover {
          border-color: #D99458;
          background: #FFFFFF;
        }

        @media (max-width: 768px) {
          .bespoke-container {
            padding: 100px 24px 60px 24px;
          }
          .bespoke-title {
            font-size: 2rem;
          }
          .glass-card {
            padding: 24px;
          }
        }
      `}</style>
    </main>
  );
}
