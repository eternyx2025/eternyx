'use client';

import { useState } from 'react';

interface NoteDetail {
  title: string;
  duration: string;
  description: string;
  ingredients: { name: string; description: string; origin: string }[];
}

const noteData: Record<string, NoteDetail> = {
  top: {
    title: 'Top Notes (The Prelude)',
    duration: '0 – 30 Minutes',
    description: 'The initial impression. Luminous, volatile, and ethereal accords that greet the senses immediately upon application before floating away to reveal the core.',
    ingredients: [
      { name: 'Saffron', description: 'Leathery, soft, and gold-hued spice adding immediate intrigue.', origin: 'Iran' },
      { name: 'Bergamot', description: 'Crisp, sparkling citrus that lifts the opening with cold brilliance.', origin: 'Calabria, Italy' },
      { name: 'Pink Pepper', description: 'Vibrant, rosy spiciness that provides a modern, biting edge.', origin: 'Brazil' },
    ]
  },
  heart: {
    title: 'Heart Notes (The Character)',
    duration: '30 Minutes – 4 Hours',
    description: 'The soul of the fragrance. Deeper, richer, and full-bodied notes that define the signature identity and form the true core character of ETERNYX scents.',
    ingredients: [
      { name: 'Agarwood (Oud)', description: 'Dark, woody, and resinous treasure of unparalleled complexity.', origin: 'Assam, India' },
      { name: 'Bulgarian Rose', description: 'Rich, honeyed, floral absolute harvested by hand at sunrise.', origin: 'Valley of Roses, Bulgaria' },
      { name: 'Jasmine Sambac', description: 'Indolic, sensual floral note delivering nocturnal warmth.', origin: 'Tamil Nadu, India' },
    ]
  },
  base: {
    title: 'Base Notes (The Memory)',
    duration: '4 – 12+ Hours',
    description: 'The lingering sillage. Deep, structural, and tenacious compounds that bind to the skin, slowing the evaporation of lighter notes and leaving a velvet memory.',
    ingredients: [
      { name: 'Sandalwood', description: 'Creamy, smooth, and milky wood that anchors the olfactory arc.', origin: 'Mysore, India' },
      { name: 'Ambergris', description: 'Salty, mineral-rich ocean warmth that morphs uniquely on skin.', origin: 'New Zealand Coastline' },
      { name: 'White Musk', description: 'Clean, clean-skin effect that binds the scent structures together.', origin: 'Synthesized' },
    ]
  }
};

export default function AlchemyPage() {
  const [activeTab, setActiveTab] = useState<'top' | 'heart' | 'base'>('heart');

  const selectedNote = noteData[activeTab];

  return (
    <main className="alchemy-container">
      {/* Hero Header */}
      <section className="alchemy-hero animate-fade-in">
        <p className="alchemy-eyebrow">Formulation Artistry</p>
        <h1 className="alchemy-title">The Alchemy of Scent</h1>
        <p className="alchemy-subtitle">
          In our pursuit of olfactory poetry, we merge the precision of organic science with the rarity of raw nature. Explore the molecular evolution of our compositions.
        </p>
      </section>

      {/* Scent Pyramid & Spotlights Grid */}
      <section className="alchemy-pyramid-section">
        <div className="alchemy-grid">
          
          {/* Scent Pyramid visual column */}
          <div className="pyramid-visual-col">
            <h3 className="visual-heading">The Olfactory Pyramid</h3>
            <p className="visual-desc">Click a layer to dissect its active ingredients</p>
            
            <div className="pyramid-interactive">
              {/* Top Layer */}
              <button 
                className={`pyramid-layer layer-top ${activeTab === 'top' ? 'active' : ''}`}
                onClick={() => setActiveTab('top')}
                aria-label="Top Notes"
              >
                <span className="layer-label">Top Notes</span>
                <span className="layer-duration">0 - 30m</span>
              </button>

              {/* Heart Layer */}
              <button 
                className={`pyramid-layer layer-heart ${activeTab === 'heart' ? 'active' : ''}`}
                onClick={() => setActiveTab('heart')}
                aria-label="Heart Notes"
              >
                <span className="layer-label">Heart Notes</span>
                <span className="layer-duration">30m - 4h</span>
              </button>

              {/* Base Layer */}
              <button 
                className={`pyramid-layer layer-base ${activeTab === 'base' ? 'active' : ''}`}
                onClick={() => setActiveTab('base')}
                aria-label="Base Notes"
              >
                <span className="layer-label">Base Notes</span>
                <span className="layer-duration">4h - 12h+</span>
              </button>
            </div>
          </div>

          {/* Details column */}
          <div className="pyramid-details-col">
            <div className="glass-card details-card">
              <span className="details-badge">{selectedNote.duration}</span>
              <h2 className="details-title">{selectedNote.title}</h2>
              <p className="details-desc">{selectedNote.description}</p>
              
              <div className="ingredients-list">
                <h4 className="ingredients-heading">Key Raw Materials</h4>
                {selectedNote.ingredients.map((ing, idx) => (
                  <div key={idx} className="ingredient-item">
                    <div className="ing-header">
                      <strong className="ing-name">{ing.name}</strong>
                      <span className="ing-origin">{ing.origin}</span>
                    </div>
                    <p className="ing-desc">{ing.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Evaporation Chart Section */}
      <section className="alchemy-chart-section">
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Notes Evaporation Curve</h3>
            <p>Visualizing the molecular dry-down timeline on skin over 12 hours</p>
          </div>

          <div className="svg-container">
            <svg viewBox="0 0 800 350" className="chart-svg">
              {/* Grids */}
              <line x1="50" y1="50" x2="750" y2="50" stroke="#EDE1DC" />
              <line x1="50" y1="125" x2="750" y2="125" stroke="#EDE1DC" />
              <line x1="50" y1="200" x2="750" y2="200" stroke="#EDE1DC" />
              <line x1="50" y1="275" x2="750" y2="275" stroke="#EDE1DC" />
              
              {/* Axes */}
              <line x1="50" y1="300" x2="750" y2="300" stroke="#7A6E6A" strokeWidth="1.5" />
              <line x1="50" y1="300" x2="50" y2="30" stroke="#7A6E6A" strokeWidth="1.5" />
              
              {/* Chart lines for each note category */}
              
              {/* Top Notes Curve (Volatile fast drop) */}
              <path 
                d="M 50 40 Q 150 150 250 300 L 750 300" 
                fill="none" 
                stroke="#c53030" 
                strokeWidth="2.5" 
                strokeDasharray="4"
                opacity={activeTab === 'top' ? 1 : 0.25}
                className="curve-path"
              />
              
              {/* Heart Notes Curve (Slower hump and gradual fall) */}
              <path 
                d="M 50 150 C 150 40 250 100 450 300 L 750 300" 
                fill="none" 
                stroke="#D99458" 
                strokeWidth="3.5"
                opacity={activeTab === 'heart' ? 1 : 0.25}
                className="curve-path"
              />
              
              {/* Base Notes Curve (Tenacious long baseline) */}
              <path 
                d="M 50 250 Q 150 220 300 200 T 750 220" 
                fill="none" 
                stroke="#3182ce" 
                strokeWidth="2.5"
                strokeDasharray="2"
                opacity={activeTab === 'base' ? 1 : 0.25}
                className="curve-path"
              />

              {/* Data points */}
              {/* Top notes peak */}
              <circle cx="50" cy="40" r="5" fill="#c53030" opacity={activeTab === 'top' ? 1 : 0.4} />
              {/* Heart notes peak */}
              <circle cx="180" cy="55" r="6" fill="#D99458" opacity={activeTab === 'heart' ? 1 : 0.4} />
              {/* Base notes transition */}
              <circle cx="300" cy="200" r="5" fill="#3182ce" opacity={activeTab === 'base' ? 1 : 0.4} />

              {/* Labels */}
              <text x="75" y="30" fill="#c53030" fontSize="10" opacity={activeTab === 'top' ? 1 : 0.4}>Top Notes Peak (Instant)</text>
              <text x="200" y="45" fill="#B66D31" fontSize="10" opacity={activeTab === 'heart' ? 1 : 0.4}>Heart Accords (Full Bloom)</text>
              <text x="320" y="190" fill="#3182ce" fontSize="10" opacity={activeTab === 'base' ? 1 : 0.4}>Base Fixatives (Sillage)</text>

              {/* Y Axis labels */}
              <text x="15" y="55" fill="#7A6E6A" fontSize="10">High</text>
              <text x="15" y="170" fill="#7A6E6A" fontSize="10">Medium</text>
              <text x="15" y="295" fill="#7A6E6A" fontSize="10">Low</text>
              <text x="-190" y="35" fill="#7A6E6A" fontSize="10" transform="rotate(-90)" letterSpacing="0.1em">CONCENTRATION</text>

              {/* X Axis labels */}
              <text x="50" y="325" fill="#7A6E6A" fontSize="10">0 Hours (Spray)</text>
              <text x="250" y="325" fill="#7A6E6A" fontSize="10">1 Hour</text>
              <text x="450" y="325" fill="#7A6E6A" fontSize="10">4 Hours</text>
              <text x="650" y="325" fill="#7A6E6A" fontSize="10">12+ Hours (Dry Down)</text>
            </svg>
          </div>
          
          <div className="chart-legend">
            <div className="legend-item" onClick={() => setActiveTab('top')}>
              <span className="legend-dot color-top" />
              <span>Top Notes (Ethereal Opening)</span>
            </div>
            <div className="legend-item" onClick={() => setActiveTab('heart')}>
              <span className="legend-dot color-heart" />
              <span>Heart Notes (Core Sillage)</span>
            </div>
            <div className="legend-item" onClick={() => setActiveTab('base')}>
              <span className="legend-dot color-base" />
              <span>Base Notes (Deep Fixation)</span>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .alchemy-container {
          min-height: 100vh;
          background-color: #FAF6F4;
          padding: 140px 50px 80px 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #1A1617;
        }

        .alchemy-hero {
          text-align: center;
          margin-bottom: 60px;
          max-width: 700px;
        }

        .alchemy-eyebrow {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #B66D31;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .alchemy-title {
          font-family: var(--font-serif);
          font-size: 2.75rem;
          color: #1A1617;
          font-weight: 400;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .alchemy-subtitle {
          font-size: 0.95rem;
          color: #7A6E6A;
          line-height: 1.7;
          font-weight: 400;
        }

        .alchemy-pyramid-section {
          width: 100%;
          max-width: 1200px;
          margin-bottom: 60px;
        }

        .alchemy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .alchemy-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        .pyramid-visual-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 6px;
          padding: 40px;
          box-shadow: 0 4px 16px rgba(26, 22, 23, 0.03);
        }

        .visual-heading {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          margin-bottom: 8px;
          color: #1A1617;
          font-weight: 400;
        }

        .visual-desc {
          font-size: 0.85rem;
          color: #7A6E6A;
          margin-bottom: 40px;
        }

        .pyramid-interactive {
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .pyramid-layer {
          width: 100%;
          background: #FAF6F4;
          border: 1.5px solid #EDE1DC;
          color: #7A6E6A;
          padding: 24px 20px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          outline: none;
        }

        .layer-top {
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
          height: 100px;
          justify-content: flex-end;
          padding-bottom: 12px;
          width: 65%;
        }

        .layer-heart {
          clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
          height: 90px;
          justify-content: center;
          width: 85%;
        }

        .layer-base {
          clip-path: polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%);
          height: 90px;
          justify-content: center;
          width: 100%;
        }

        .layer-label {
          font-family: var(--font-serif);
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: color 0.3s;
          font-weight: 500;
        }

        .layer-duration {
          font-size: 0.72rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .pyramid-layer:hover {
          background: #FFFFFF;
          border-color: #D99458;
          color: #1A1617;
        }

        .pyramid-layer.active {
          background: rgba(217, 148, 88, 0.12);
          border-color: #D99458;
          color: #1A1617;
          box-shadow: 0 4px 16px rgba(217, 148, 88, 0.15);
        }

        .layer-top.active {
          border-color: #c53030;
          background: rgba(229, 62, 62, 0.08);
        }
        .layer-top:hover {
          border-color: #c53030;
        }

        .layer-base.active {
          border-color: #3182ce;
          background: rgba(49, 130, 206, 0.08);
        }
        .layer-base:hover {
          border-color: #3182ce;
        }

        .glass-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(26, 22, 23, 0.03);
        }

        .details-card {
          padding: 40px;
          height: 100%;
        }

        .details-badge {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #B66D31;
          border: 1px solid rgba(217, 148, 88, 0.4);
          background: rgba(217, 148, 88, 0.1);
          padding: 4px 12px;
          border-radius: 12px;
          display: inline-block;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .details-title {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          color: #1A1617;
          margin-bottom: 16px;
          font-weight: 400;
        }

        .details-desc {
          font-size: 0.92rem;
          color: #4A403E;
          line-height: 1.7;
          margin-bottom: 30px;
        }

        .ingredients-list {
          border-top: 1px solid #EDE1DC;
          padding-top: 24px;
        }

        .ingredients-heading {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #7A6E6A;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .ingredient-item {
          margin-bottom: 16px;
          background: #FAF6F4;
          padding: 14px 18px;
          border-radius: 6px;
          border: 1px solid #EDE1DC;
        }

        .ing-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 0.92rem;
        }

        .ing-name {
          color: #1A1617;
          font-weight: 500;
        }

        .ing-origin {
          color: #B66D31;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .ing-desc {
          font-size: 0.85rem;
          color: #4A403E;
          line-height: 1.5;
        }

        .alchemy-chart-section {
          width: 100%;
          max-width: 1200px;
          margin-bottom: 40px;
        }

        .chart-card {
          padding: 40px;
        }

        .chart-header {
          margin-bottom: 30px;
        }

        .chart-header h3 {
          font-family: var(--font-serif);
          font-size: 1.45rem;
          color: #1A1617;
          margin-bottom: 6px;
          font-weight: 400;
        }

        .chart-header p {
          font-size: 0.85rem;
          color: #7A6E6A;
        }

        .svg-container {
          width: 100%;
          background: #FAF6F4;
          border: 1px solid #EDE1DC;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .chart-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .curve-path {
          transition: opacity 0.5s ease;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.82rem;
          color: #7A6E6A;
          cursor: pointer;
          transition: color 0.2s;
        }

        .legend-item:hover {
          color: #1A1617;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .color-top { background-color: #c53030; }
        .color-heart { background-color: #D99458; }
        .color-base { background-color: #3182ce; }

        @media (max-width: 768px) {
          .alchemy-container {
            padding: 100px 24px 60px 24px;
          }
          .alchemy-title {
            font-size: 2rem;
          }
          .details-card, .chart-card {
            padding: 24px;
          }
        }
      `}</style>
    </main>
  );
}
