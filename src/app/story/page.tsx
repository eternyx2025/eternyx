'use client';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  location: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    year: '2025',
    title: 'The Genesis',
    description: 'ETERNYX began with a vision to create fragrances that go beyond the ordinary. What started as an idea became a journey to build a distinctive fragrance brand rooted in elegance, individuality, and timeless character.',
    location: 'ETERNYX'
  },
  {
    year: '2025',
    title: 'The First Creation',
    description: 'Our first fragrances took shape. From selecting distinctive notes to refining every detail of the bottle and packaging, we began creating an identity that could truly belong to ETERNYX.',
    location: 'ETERNYX'
  },
  {
    year: '2026',
    title: 'The Evolution',
    description: 'ETERNYX entered a new chapter. With new fragrances, stronger branding, and a growing community of fragrance lovers, our vision continues to evolve while staying true to where it began.',
    location: 'ETERNYX'
  },
  {
    year: '2026',
    title: 'The Journey Ahead',
    description: 'Today, ETERNYX continues its journey with one purpose — to create fragrances that are remembered, not just worn.',
    location: 'Worldwide'
  }
];

export default function StoryPage() {
  return (
    <main className="story-container">
      {/* Editorial Header */}
      <section className="story-hero">
        <p className="story-eyebrow">Our Heritage</p>
        <h1 className="story-title">Silence is Luxury</h1>
        <p className="story-subtitle">
          ETERNYX was born from a desire to escape the loud, ephemeral trends of modern perfumery. We believe that true luxury does not shout; it lingers in the quiet air, a velvet shadow.
        </p>
      </section>

      {/* Brand Philosophy Split Columns */}
      <section className="philosophy-section">
        <div className="philosophy-grid">
          <div className="philosophy-text">
            <h2>The Craft</h2>
            <p className="philosophy-paragraph">
              Every creation that exits the house of ETERNYX is hand-formulated in Grasse and aged in darkness. We do not use standard synthetic bulk compounds. Instead, we source the highest grade natural concretes and absolutes—from organic Bulgarian Rose to rare wild Assam Oud.
            </p>
            <p className="philosophy-paragraph">
              Our scent curves are engineered to morph dynamically on the skin, adapting to individual warmth to create a profile that is entirely unique to the wearer. Scent is not a mask; it is an extension of identity.
            </p>
          </div>
          <div className="philosophy-visual">
            <div className="visual-box">
              <div className="gold-accent-line" />
              <p className="visual-caption">“A fragrance must whisper to the skin before it speaks to the world.”</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="timeline-header">
          <h2>The Chronology</h2>
          <p>The milestones defining our journey in fragrance.</p>
        </div>

        <div className="timeline-tree">
          {timelineEvents.map((event, idx) => (
            <div key={idx} className="timeline-node">
              <div className="node-year-col">
                <span className="node-year">{event.year}</span>
              </div>
              
              <div className="node-marker-col">
                <div className="node-dot" />
                <div className="node-line" />
              </div>

              <div className="node-content-col">
                <div className="glass-card node-card">
                  <span className="node-location">{event.location}</span>
                  <h3 className="node-title">{event.title}</h3>
                  <p className="node-desc">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="story-closing">
          <div className="gold-accent-line" />
          <span className="closing-brand">ETERNYX</span>
          <p className="closing-quote">
            Not just a fragrance.<br />
            A statement that remains.
          </p>
        </div>
      </section>

      <style jsx>{`
        .story-container {
          min-height: 100vh;
          background-color: #FAF6F4;
          padding: 140px 50px 80px 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #1A1617;
        }

        .story-hero {
          text-align: center;
          margin-bottom: 80px;
          max-width: 750px;
        }

        .story-eyebrow {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          color: #B66D31;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .story-title {
          font-family: var(--font-serif);
          font-size: 3rem;
          color: #1A1617;
          font-weight: 400;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .story-subtitle {
          font-size: 0.95rem;
          color: #7A6E6A;
          line-height: 1.8;
          font-weight: 400;
        }

        .philosophy-section {
          width: 100%;
          max-width: 1100px;
          margin-bottom: 100px;
        }

        .philosophy-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
        }

        @media (max-width: 900px) {
          .philosophy-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        .philosophy-text h2 {
          font-size: 1.6rem;
          color: #1A1617;
          margin-bottom: 24px;
          font-weight: 400;
          font-family: var(--font-serif);
        }

        .philosophy-paragraph {
          font-size: 0.95rem;
          color: #4A403E;
          line-height: 1.8;
          margin-bottom: 20px;
          font-weight: 400;
        }

        .philosophy-visual {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 6px;
          padding: 40px;
          position: relative;
          box-shadow: 0 4px 20px rgba(26, 22, 23, 0.03);
        }

        .visual-box {
          text-align: center;
          max-width: 280px;
        }

        .gold-accent-line {
          width: 40px;
          height: 1.5px;
          background-color: #D99458;
          margin: 0 auto 24px auto;
        }

        .visual-caption {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          font-style: italic;
          line-height: 1.6;
          color: #1A1617;
          font-weight: 400;
        }

        .timeline-section {
          width: 100%;
          max-width: 900px;
          margin-bottom: 40px;
        }

        .timeline-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .timeline-header h2 {
          font-size: 1.6rem;
          color: #1A1617;
          margin-bottom: 8px;
          font-family: var(--font-serif);
          font-weight: 400;
        }

        .timeline-header p {
          font-size: 0.88rem;
          color: #7A6E6A;
        }

        .timeline-tree {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .timeline-node {
          display: flex;
          position: relative;
        }

        .node-year-col {
          width: 100px;
          display: flex;
          justify-content: flex-end;
          padding-right: 30px;
          padding-top: 20px;
          flex-shrink: 0;
        }

        .node-year {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          color: #B66D31;
          font-weight: 600;
          line-height: 1;
        }

        .node-marker-col {
          width: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex-shrink: 0;
        }

        .node-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #FAF6F4;
          border: 2px solid #D99458;
          z-index: 2;
          margin-top: 24px;
        }

        .node-line {
          flex: 1;
          width: 1.5px;
          background: #EDE1DC;
          z-index: 1;
        }

        .timeline-node:last-child .node-line {
          display: none;
        }

        .node-content-col {
          flex: 1;
          padding-left: 30px;
          padding-bottom: 40px;
        }

        .glass-card {
          background: #FFFFFF;
          border: 1px solid #EDE1DC;
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(26, 22, 23, 0.03);
        }

        .node-card {
          padding: 24px 30px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .node-card:hover {
          border-color: #D99458;
          box-shadow: 0 6px 20px rgba(217, 148, 88, 0.08);
        }

        .node-location {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #7A6E6A;
          font-weight: 600;
          display: block;
          margin-bottom: 6px;
        }

        .node-title {
          font-size: 1.15rem;
          color: #1A1617;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .node-desc {
          font-size: 0.88rem;
          color: #4A403E;
          line-height: 1.7;
          font-weight: 400;
        }

        .story-closing {
          text-align: center;
          margin-top: 80px;
          padding: 40px 20px 20px 20px;
        }

        .closing-brand {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.35em;
          color: #B66D31;
          display: block;
          margin-bottom: 16px;
          font-weight: 600;
        }

        .closing-quote {
          font-family: var(--font-serif);
          font-size: 1.45rem;
          color: #1A1617;
          line-height: 1.6;
          font-weight: 400;
          letter-spacing: 0.04em;
        }

        @media (max-width: 768px) {
          .story-container {
            padding: 100px 24px 60px 24px;
          }
          .story-title {
            font-size: 2.25rem;
          }
          .node-year-col {
            width: 70px;
            padding-right: 15px;
          }
          .node-year {
            font-size: 1.2rem;
          }
          .node-content-col {
            padding-left: 15px;
          }
          .node-card {
            padding: 16px 20px;
          }
        }
      `}</style>
    </main>
  );
}
