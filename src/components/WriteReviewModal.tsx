'use client';

import { useState } from 'react';

interface WriteReviewModalProps {
  productName: string;
  productId?: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export default function WriteReviewModal({
  productName,
  productId,
  isOpen,
  onClose,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [customer, setCustomer] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customer.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 8) {
      setError('Please write at least a sentence sharing your experience.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: productName,
          product_id: productId,
          customer: customer.trim(),
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setIsSuccess(true);
      if (onReviewSubmitted) onReviewSubmitted();

      setTimeout(() => {
        setIsSuccess(false);
        setCustomer('');
        setComment('');
        setRating(5);
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="review-modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        className="review-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'linear-gradient(145deg, #161514 0%, #0d0c0b 100%)',
          border: '1px solid rgba(200, 165, 100, 0.35)',
          borderRadius: '16px',
          padding: '36px 32px',
          color: '#ffffff',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(200,165,100,0.15)',
          position: 'relative',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ✕
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: 'rgba(200, 165, 100, 0.15)', 
                border: '1.5px solid #d4af37',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                fontSize: '28px',
                color: '#d4af37'
              }}
            >
              ✓
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#fff', marginBottom: '10px' }}>
              Thank You!
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Your review for <strong style={{ color: '#d4af37' }}>{productName}</strong> has been submitted and is pending verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200, 165, 100, 0.9)', marginBottom: '6px' }}>
              Client Impression
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 300, color: '#fff', marginBottom: '20px' }}>
              Review {productName}
            </h2>

            {/* Star Rating Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your Rating
              </label>
              <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '28px',
                      color: star <= (hoverRating ?? rating) ? '#d4af37' : 'rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      padding: '2px',
                      transition: 'transform 0.15s, color 0.15s',
                      transform: star <= (hoverRating ?? rating) ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Aditya K."
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Review Comment */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your Experience & Scent Notes
              </label>
              <textarea
                placeholder="Describe the projection, longevity, opening notes, and compliments you received..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 1.5,
                }}
              />
            </div>

            {error && (
              <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '16px' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #e8cf91 0%, #c8a564 50%, #9e7f3b 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(200, 165, 100, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
