'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import ProductModal, { Product } from '@/components/ProductModal';
import { useCart } from '@/context/CartContext';
import { PhilosophyConfig, DEFAULT_PHILOSOPHY } from '@/lib/types';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
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

function formatVideoUrl(url?: string): string {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return url;
}

function TextReveal({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <span className={`scroll-reveal-text ${className}`}>
      {text.split(' ').map((word, wordIdx) => (
        <span key={wordIdx} className="text-reveal-mask" style={{ marginRight: '0.22em' }}>
          <span className="text-reveal-word text-reveal-trigger-item">
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

function CharacterReveal({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <span className={`scroll-reveal-chars ${className}`} style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
      {text.split('').map((char, charIdx) => (
        <span key={charIdx} className="text-reveal-mask" style={{ display: 'inline-block' }}>
          <span className="text-reveal-word char-reveal-trigger-item" style={{ display: 'inline-block', whiteSpace: 'pre' }}>
            {char}
          </span>
        </span>
      ))}
    </span>
  );
}
function ReelCard({ reel }: { reel: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  const cardId = useRef(`reel-${Math.random().toString(36).substring(2, 9)}`);

  // Helper to determine if the video is a direct play video link (like an .mp4 or /api/video/)
  const isDirectVideo = (url: string) => {
    if (!url || url === '#') return false;
    if (url.includes('instagram.com') || url.includes('facebook.com') || url.includes('tiktok.com') || url.includes('youtube.com') || url.includes('youtu.be')) return false;
    return url.startsWith('http') || url.startsWith('/') || url.endsWith('.mp4') || url.includes('drive.google.com');
  };

  const hasDirectVideo = isDirectVideo(reel.video);
  const formattedVideoSrc = formatVideoUrl(reel.video);
  const formattedImageSrc = formatImageUrl(reel.image);

  // Listen for other reels playing so only ONE reel plays with sound at a time
  useEffect(() => {
    const handleOtherReel = (e: CustomEvent) => {
      if (e.detail?.id !== cardId.current && videoRef.current) {
        videoRef.current.pause();
        videoRef.current.muted = true;
        setIsPlaying(false);
        setIsMuted(true);
      }
    };

    window.addEventListener('eternyx-reel-play' as any, handleOtherReel);
    return () => window.removeEventListener('eternyx-reel-play' as any, handleOtherReel);
  }, []);

  useEffect(() => {
    if (!videoRef.current || !hasDirectVideo || useFallbackImage) return;
    const videoEl = videoRef.current;
    videoEl.muted = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Autoplay silently on scroll
            videoEl.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            videoEl.pause();
            videoEl.muted = true;
            setIsPlaying(false);
            setIsMuted(true);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, [hasDirectVideo, useFallbackImage]);

  // When user clicks the reel: PLAY WITH AUDIO!
  const togglePlayWithAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasDirectVideo) {
      if (reel.video && reel.video !== '#') {
        window.open(reel.video, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (!videoRef.current) return;
    const videoEl = videoRef.current;

    // Broadcast event to pause/mute all other playing reels
    window.dispatchEvent(new CustomEvent('eternyx-reel-play', { detail: { id: cardId.current } }));

    if (videoEl.paused) {
      videoEl.muted = false;
      videoEl.volume = 1.0;
      videoEl.play().then(() => {
        setIsPlaying(true);
        setIsMuted(false);
      }).catch((err) => {
        console.warn('Playback error:', err);
      });
    } else if (isMuted) {
      // If currently playing in silent mode, clicking immediately UNMUTES audio!
      videoEl.muted = false;
      videoEl.volume = 1.0;
      setIsMuted(false);
    } else {
      // If already playing with audio, click toggles pause
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div 
      className="reel-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={togglePlayWithAudio}
      style={{ display: 'block', position: 'relative', cursor: 'pointer' }}
    >
      <div className="reel-thumb">
        {/* Audio badge in top corner */}
        {hasDirectVideo && !useFallbackImage && (
          <div className={`reel-sound-badge ${isPlaying && !isMuted ? 'active' : ''}`}>
            {isPlaying && !isMuted ? (
              <>
                <div className="reel-sound-bars">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span>SOUND ON</span>
              </>
            ) : isPlaying && isMuted ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
                <span>TAP FOR SOUND</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21"/>
                </svg>
                <span>PLAY</span>
              </>
            )}
          </div>
        )}

        {hasDirectVideo && !useFallbackImage ? (
          <video
            ref={videoRef}
            src={formattedVideoSrc}
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            onError={() => setUseFallbackImage(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        ) : (
          /* Render cover thumbnail or premium placeholder */
          <div 
            style={{ 
              width: '100%', 
              height: '100%', 
              position: 'absolute', 
              inset: 0,
              zIndex: 1,
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #161616 0%, #0d0d0d 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            {formattedImageSrc ? (
              <img
                src={formattedImageSrc}
                alt={reel.handle}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              /* Glassmorphic placeholder */
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '24px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  width: '80%',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                {/* Instagram Icon */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(200,165,100,0.8)' }}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.45)' }}>Watch Reel</span>
              </div>
            )}
          </div>
        )}
        <div className="reel-overlay" style={{ zIndex: 2, pointerEvents: 'none' }}>
          <div 
            className="reel-play" 
            style={{ 
              opacity: isPlaying && !isMuted ? 0 : 0.9,
              transform: isPlaying && !isMuted ? 'scale(0.8)' : 'scale(1)', 
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              alignSelf: 'center',
              marginTop: 'auto',
              marginBottom: 'auto'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          </div>
          <div className="reel-info">
            <span className="reel-product-tag">{reel.product}</span>
            <p className="reel-handle">{reel.handle}</p>
            <p className="reel-likes">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {reel.likes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


export interface HomeClientProps {
  initialBanners?: { image_url: string; mobile_image_url: string }[];
  initialProducts?: Product[];
  initialReels?: { handle: string; likes: string; product: string; image: string; video?: string }[];
  initialPhilosophy?: PhilosophyConfig;
}

export default function HomeClient({ initialBanners, initialProducts, initialReels, initialPhilosophy }: HomeClientProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const { addToCart } = useCart();
  const duoRef = useRef<HTMLDivElement>(null);
  const alchemyRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const alchemyHeaderRef = useRef<HTMLDivElement>(null);
  
  const heroContentRef = useRef<HTMLDivElement>(null);
  const isInteractingTrackRef = useRef(false);
  const isPageScrollingRef = useRef(false);

  const LOCAL_BANNERS = [
    { image_url: "/images/wide-lineup.png", mobile_image_url: "/images/wide-lineup.png" },
    { image_url: "/images/wide-close.png", mobile_image_url: "/images/wide-close.png" },
    { image_url: "/images/wide-abstract.png", mobile_image_url: "/images/wide-abstract.png" }
  ];

  const LOCAL_PRODUCTS = [
    { name: "CANDY", category: "Eau de Parfum", price: "₹599", image: "", badge: "BESTSELLER" },
    { name: "AFTER MEET", category: "Eau de Parfum", price: "₹599", image: "", badge: "NEW" },
    { name: "AZURA", category: "Eau de Parfum", price: "₹599", image: "", badge: null },
    { name: "MEMORABLE", category: "Eau de Parfum", price: "₹599", image: "", badge: "SIGNATURE" },
    { name: "CHERRY BLOW", category: "Eau de Parfum", price: "₹599", image: "", badge: "LUXURY" },
  ];

  const [banners, setBanners] = useState<{ image_url: string; mobile_image_url: string }[]>(
    initialBanners && initialBanners.length > 0 ? initialBanners : LOCAL_BANNERS
  );
  const [alchemyProducts, setAlchemyProducts] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : LOCAL_PRODUCTS
  );
  const [reels, setReels] = useState<{ handle: string; likes: string; product: string; image: string; video?: string }[]>(
    initialReels || []
  );
  const [philosophy, setPhilosophy] = useState<PhilosophyConfig>(
    initialPhilosophy || DEFAULT_PHILOSOPHY
  );
  const [isMobile, setIsMobile] = useState(false);

  // Responsive device check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fallback client fetching if server props were empty
  useEffect(() => {
    if (!initialBanners || initialBanners.length === 0) {
      fetch('/api/banners')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setBanners(data);
          }
        })
        .catch(err => console.error('Failed to fetch banners:', err));
    }

    if (!initialProducts || initialProducts.length === 0) {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((p: any) => ({
              ...p,
              name: p.name,
              category: p.category,
              price: typeof p.price === 'number' ? `₹${p.price}` : p.price,
              image: p.image_url || '',
              badge: p.badge || null
            }));
            setAlchemyProducts(mapped);
          }
        })
        .catch(err => console.error('Failed to fetch products:', err));
    }

    if (!initialReels || initialReels.length === 0) {
      fetch('/api/reels')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mapped = data.map((r: any) => {
              return {
                handle: r.handle,
                likes: r.likes,
                product: r.product_tag,
                image: r.thumbnail_url || '',
                video: r.video_url || '#'
              };
            });
            setReels(mapped);
          }
        })
        .catch(err => console.error('Failed to fetch reels:', err));
    }
  }, [initialBanners, initialProducts, initialReels]);



  // GSAP animation bindings
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768 && banners.length > 0) {
      setCurrentBanner(banners.length - 1);
    }

    const timer = setInterval(() => {
      if (banners.length > 0) {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }
    }, 5000);

    const ctx = gsap.context(() => {
      // 1. Entrance animation for Hero Content Text Subtitle & Title letters
      gsap.fromTo('.hero-subtitle', 
        { opacity: 0, letterSpacing: '0.1em' },
        { opacity: 1, letterSpacing: '0.4em', duration: 1.6, ease: "power3.out", delay: 0.3 }
      );

      gsap.to('.hero-title-reveal .char-reveal-trigger-item', {
        y: 0,
        duration: 1.4,
        stagger: 0.08,
        ease: "power4.out",
        delay: 0.5
      });

      // 2. Parallax effect for Hero Content overlay
      gsap.to(heroContentRef.current, {
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        },
        yPercent: 30,
        ease: "none"
      });

      // 3. Parallax effect for Philosophy text
      gsap.to('.philosophy-text', {
        scrollTrigger: {
          trigger: '.philosophy-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        y: -30,
        ease: "power1.out"
      });

      // 4. Parallax effect for Brand Statement Image
      gsap.fromTo('.brand-statement-right img',
        { y: -30, scale: 1.12 },
        {
          scrollTrigger: {
            trigger: '.brand-statement',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          },
          y: 30,
          ease: "none"
        }
      );

      // 5. Scroll triggers for text reveals (word staggers)
      gsap.utils.toArray('.scroll-reveal-text').forEach((element: any) => {
        gsap.to(element.querySelectorAll('.text-reveal-trigger-item'), {
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            end: "bottom top",
            toggleActions: "play reverse play reverse"
          },
          y: 0,
          duration: 1.2,
          stagger: 0.05,
          ease: "power3.out"
        });
      });

      // 6. Scroll triggers for character reveals
      gsap.utils.toArray('.scroll-reveal-chars').forEach((element: any) => {
        gsap.to(element.querySelectorAll('.char-reveal-trigger-item'), {
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            end: "bottom top",
            toggleActions: "play reverse play reverse"
          },
          y: 0,
          duration: 1.4,
          stagger: 0.03,
          ease: "power4.out"
        });
      });

      // 7. Scroll triggers for general fade items
      gsap.utils.toArray('.scroll-fade-item').forEach((element: any) => {
        gsap.fromTo(element,
          { opacity: 0, y: 20 },
          {
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              end: "bottom top",
              toggleActions: "play reverse play reverse"
            },
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out"
          }
        );
      });

      // 8. Self-drawing gold dividers
      gsap.utils.toArray('.scroll-draw-line').forEach((line: any) => {
        gsap.to(line, {
          scrollTrigger: {
            trigger: line,
            start: "top 90%",
            end: "bottom top",
            toggleActions: "play reverse play reverse"
          },
          scaleX: 1,
          duration: 1.5,
          ease: "power3.inOut"
        });
      });

      // 9. Floating Product Duo scroll triggered entrance (reveal on reaching alchemy)
      gsap.fromTo(duoRef.current,
        { xPercent: 100, yPercent: -50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: ".alchemy",
            start: "top 70%",
            end: "bottom top",
            toggleActions: "play none none reverse"
          },
          xPercent: 0,
          yPercent: -50,
          opacity: 1,
          duration: 1.0,
          ease: "power3.out",
          overwrite: "auto"
        }
      );

      gsap.fromTo(alchemyHeaderRef.current,
        { x: -50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: alchemyHeaderRef.current,
            start: "top 85%",
            end: "bottom top",
            toggleActions: "play none none reverse"
          },
          x: 0,
          opacity: 1,
          duration: 1.0,
          ease: "power3.out",
          overwrite: "auto"
        }
      );

      (self as any).cleanups = {};
    });

    return () => {
      clearInterval(timer);
      ctx.revert();
    };
  }, [banners, alchemyProducts, reels]);

  // Separate effect: clean velocity-inertia scroller for Alchemy track
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth <= 768) return;

    const track = scrollTrackRef.current;
    if (!track) return;

    // ─── Constants ───────────────────────────────────────────────────────────
    const FRICTION    = 0.88;  // velocity decay per frame
    const WHEEL_ACCEL = 0.9;   // wheel delta → velocity multiplier
    const MAX_VEL     = 70;    // max pixels/frame
    const DRAG_THRESH = 3;     // px before drag starts
    const THROW_MULT  = 1.8;   // momentum throw multiplier on pointer up

    // ─── State ───────────────────────────────────────────────────────────────
    let velocityX     = 0;
    let currentX      = 0;
    let rafId         = 0;
    let isPointerDown = false;
    let pointerStartX = 0;
    let dragStartX    = 0;
    let frameVel      = 0;
    let hasDragged    = false;
    let lenisWasStopped = false;

    const getMinX = () => -(track.scrollWidth - window.innerWidth + 80);
    const clamp   = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    const stopLenis  = () => { const l = (window as any).lenis; if (l && !lenisWasStopped) { l.stop(); lenisWasStopped = true; } };
    const startLenis = () => { const l = (window as any).lenis; if (l &&  lenisWasStopped) { l.start(); lenisWasStopped = false; } };

    // ─── RAF — only runs when user velocity is non-zero ─────────────────────
    const tick = () => {
      velocityX *= FRICTION;
      if (Math.abs(velocityX) < 0.1) {
        velocityX = 0;
        rafId = 0;
        return;
      }

      const next = clamp(currentX + velocityX, getMinX(), 0);
      if (next === getMinX() || next === 0) velocityX = 0;
      currentX = next;
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    const startRaf = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    // ─── Wheel — only intercept intentional horizontal gestures ─────────────
    // Vertical scrolling passes through cleanly to Lenis with zero interference.
    const onWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // Only intercept if user is intentionally swiping horizontally (or holding Shift)
      const isIntentionalHorizontal = (absX > absY * 1.5 && absX > 12) || (e.shiftKey && absY > 0);
      if (!isIntentionalHorizontal) return;

      e.preventDefault();
      e.stopPropagation();
      stopLenis();
      isInteractingTrackRef.current = true;

      const raw = e.shiftKey && absY > absX ? e.deltaY : e.deltaX;
      velocityX -= raw * WHEEL_ACCEL;
      velocityX  = clamp(velocityX, -MAX_VEL, MAX_VEL);

      startRaf();

      clearTimeout((onWheel as any)._t);
      (onWheel as any)._t = setTimeout(() => {
        isInteractingTrackRef.current = false;
        startLenis();
      }, 160);
    };

    // ─── Pointer drag — smooth mouse click & drag with momentum throw ────────
    const onDocMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - pointerStartX;
      if (Math.abs(dx) > DRAG_THRESH) {
        hasDragged = true;
        isInteractingTrackRef.current = true;
        track.style.cursor = 'grabbing';
      }
      if (!hasDragged) return;
      const newX = clamp(dragStartX + dx, getMinX(), 0);
      frameVel = newX - currentX;
      currentX = newX;
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
    };

    const onDocUp = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      track.style.cursor = 'grab';
      document.removeEventListener('pointermove', onDocMove);
      document.removeEventListener('pointerup',   onDocUp);
      document.removeEventListener('pointercancel', onDocUp);

      if (!hasDragged) {
        isInteractingTrackRef.current = false;
        startLenis();
      } else {
        velocityX = clamp(frameVel * THROW_MULT, -MAX_VEL, MAX_VEL);
        startRaf();
        setTimeout(() => {
          isInteractingTrackRef.current = false;
          startLenis();
        }, 200);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a')) return;
      isPointerDown = true;
      hasDragged    = false;
      pointerStartX = e.clientX;
      dragStartX    = currentX;
      frameVel      = 0;
      velocityX     = 0;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      stopLenis();
      document.addEventListener('pointermove',   onDocMove);
      document.addEventListener('pointerup',     onDocUp);
      document.addEventListener('pointercancel', onDocUp);
    };

    const onClickCapture = (e: MouseEvent) => {
      if (hasDragged) {
        e.stopPropagation();
        e.preventDefault();
        hasDragged = false;
      }
    };

    track.addEventListener('wheel',        onWheel,        { passive: false });
    track.addEventListener('pointerdown',  onPointerDown);
    track.addEventListener('click',        onClickCapture, true);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout((onWheel as any)._t);
      startLenis();
      document.removeEventListener('pointermove',   onDocMove);
      document.removeEventListener('pointerup',     onDocUp);
      document.removeEventListener('pointercancel', onDocUp);
      track.removeEventListener('wheel',          onWheel);
      track.removeEventListener('pointerdown',    onPointerDown);
      track.removeEventListener('click',          onClickCapture, true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alchemyProducts]);

  // Separate effect: custom velocity-inertia scroller for Reels track
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth <= 768) return;

    const reelsTrack = document.getElementById('reels-track') as HTMLElement | null;
    if (!reelsTrack) return;
    const reelsWrap = reelsTrack.parentElement;
    const target = reelsWrap || reelsTrack;

    const FRICTION    = 0.88;
    const WHEEL_ACCEL = 0.9;
    const MAX_VEL     = 70;
    const DRAG_THRESH = 2;
    const THROW_MULT  = 1.8;

    let velocityX     = 0;
    let currentX      = 0;
    let rafId         = 0;
    let isPointerDown = false;
    let pointerStartX = 0;
    let dragStartX    = 0;
    let frameVel      = 0;
    let hasDragged    = false;
    let lenisWasStopped = false;

    const getMinX  = () => -(reelsTrack.scrollWidth - window.innerWidth + 80);
    const clamp    = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const stopLenis  = () => { const l = (window as any).lenis; if (l && !lenisWasStopped) { l.stop(); lenisWasStopped = true; } };
    const startLenis = () => { const l = (window as any).lenis; if (l &&  lenisWasStopped) { l.start(); lenisWasStopped = false; } };

    const tick = () => {
      velocityX *= FRICTION;
      if (Math.abs(velocityX) < 0.1) { velocityX = 0; rafId = 0; return; }
      const next = clamp(currentX + velocityX, getMinX(), 0);
      if (next === getMinX() || next === 0) velocityX = 0;
      currentX = next;
      reelsTrack.style.transform = `translate3d(${currentX}px, 0, 0)`;
      rafId = requestAnimationFrame(tick);
    };
    const startRaf = () => { if (!rafId) rafId = requestAnimationFrame(tick); };

    const onWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      const isHorizontal = (absX > absY * 1.2 && absX > 8) || (e.shiftKey && absY > 0);
      if (!isHorizontal) return;
      e.preventDefault();
      e.stopPropagation();
      stopLenis();
      const raw = e.shiftKey && absY > absX ? e.deltaY : e.deltaX;
      velocityX -= raw * WHEEL_ACCEL;
      velocityX  = clamp(velocityX, -MAX_VEL, MAX_VEL);
      startRaf();
      clearTimeout((onWheel as any)._t);
      (onWheel as any)._t = setTimeout(() => startLenis(), 160);
    };

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a')) return;
      isPointerDown = true;
      hasDragged    = false;
      pointerStartX = e.clientX;
      dragStartX    = currentX;
      frameVel      = 0;
      velocityX     = 0;
      target.setPointerCapture(e.pointerId);
      reelsTrack.style.cursor = 'grabbing';
      stopLenis();
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const dx = e.clientX - pointerStartX;
      if (Math.abs(dx) > DRAG_THRESH) hasDragged = true;
      if (!hasDragged) return;
      const newX = clamp(dragStartX + dx, getMinX(), 0);
      frameVel = newX - currentX;
      currentX = newX;
      reelsTrack.style.transform = `translate3d(${currentX}px, 0, 0)`;
    };

    const onPointerUp = () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      reelsTrack.style.cursor = 'grab';
      velocityX = clamp(frameVel * THROW_MULT, -MAX_VEL, MAX_VEL);
      startRaf();
      setTimeout(() => startLenis(), 200);
    };

    const onClickCapture = (e: MouseEvent) => {
      if (hasDragged) { e.stopPropagation(); e.preventDefault(); hasDragged = false; }
    };

    target.addEventListener('wheel',        onWheel,         { passive: false });
    target.addEventListener('pointerdown',   onPointerDown);
    target.addEventListener('pointermove',   onPointerMove);
    target.addEventListener('pointerup',     onPointerUp);
    target.addEventListener('pointercancel', onPointerUp);
    target.addEventListener('click',         onClickCapture,  true);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout((onWheel as any)._t);
      startLenis();
      target.removeEventListener('wheel',        onWheel);
      target.removeEventListener('pointerdown',   onPointerDown);
      target.removeEventListener('pointermove',   onPointerMove);
      target.removeEventListener('pointerup',     onPointerUp);
      target.removeEventListener('pointercancel', onPointerUp);
      target.removeEventListener('click',         onClickCapture,  true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reels]);

  // Card interactive 3D Tilt handlers
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInteractingTrackRef.current || isPageScrollingRef.current) return;
    const trigger = e.currentTarget;
    const card = trigger.querySelector('.product-card') as HTMLDivElement;
    if (!card) return;

    const rect = trigger.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--y', `${(y / rect.height) * 100}%`);

    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    const tiltX = -py * 12;
    const tiltY = px * 12;

    gsap.to(card, {
      rotateX: tiltX,
      rotateY: tiltY,
      y: -5,
      scale: 1.02,
      transformPerspective: 1000,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.querySelector('.product-card') as HTMLDivElement;
    if (!card) return;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const availableTabs = Array.from(new Set(
    alchemyProducts.flatMap(p => {
      const tags: string[] = [];
      if (p.category) tags.push(p.category.toUpperCase().trim());
      if (p.badge) tags.push(p.badge.toUpperCase().trim());
      return tags;
    }).filter(Boolean)
  )).sort((a, b) => {
    const PREFERRED_TABS_ORDER = ['MENS', 'UNISEX', 'WOMEN', 'BESTSELLER'];
    const indexA = PREFERRED_TABS_ORDER.indexOf(a);
    const indexB = PREFERRED_TABS_ORDER.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  useEffect(() => {
    if (availableTabs.length > 0 && !activeTab) {
      setActiveTab(availableTabs[0]);
    }
  }, [availableTabs, activeTab]);

  const tabProducts = alchemyProducts.filter(p => {
    const cat = p.category ? p.category.toUpperCase().trim() : '';
    const bdg = p.badge ? p.badge.toUpperCase().trim() : '';
    return cat === activeTab || bdg === activeTab;
  });

  const spotlightProducts = alchemyProducts.slice(0, 2);

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-image-carousel">
            {banners.map((banner, index) => (
              <div 
                key={index} 
                className={`hero-image ${index === currentBanner ? 'active' : ''} hero-image-${index}`}
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              >
                <Image 
                  src={formatImageUrl(isMobile && banner.mobile_image_url ? banner.mobile_image_url : banner.image_url)} 
                  alt={`Eternyx Banner ${index + 1}`} 
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={100}
                  unoptimized={true}
                  priority={index === 0}
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}

            <div className="carousel-dots">
              {banners.map((_, index) => (
                <button 
                  key={index} 
                  className={`dot ${index === currentBanner ? 'active' : ''}`}
                  onClick={() => setCurrentBanner(index)}
                />
              ))}
            </div>

            <div className="container hero-content" ref={heroContentRef}>
              <p className="category hero-subtitle">Defining Silence</p>
              <h1 className="hero-title-reveal">
                <CharacterReveal text="ETERNYX" />
              </h1>
            </div>
          </div>
        </section>

        <section className="philosophy-section">
          <div className="container">
            <p className="philosophy-text">
              A symphony of scents crafted for the discerning. Experience luxury in its purest, most silent form.
            </p>
          </div>
        </section>

        {/* Self-drawing Line Divider */}
        <div className="container">
          <div className="gold-divider scroll-draw-line" />
        </div>

        {/* Alchemy Section (Draggable Product Gallery) */}
        <section className="alchemy" ref={alchemyRef}>
          <div className="alchemy-header" ref={alchemyHeaderRef}>
            <p className="category">The Alchemy</p>
            <h2 className="scroll-reveal-text">
              <TextReveal text="Layers of an Immortal Scent" />
            </h2>
          </div>

          <div className="alchemy-fade-left" />
          <div className="alchemy-fade-right" />

          <div className="product-scroll-track" ref={scrollTrackRef}>
            {alchemyProducts.map((product, index) => (
              <div 
                className="product-card-trigger" 
                key={index} 
                onClick={() => {
                  if (!isInteractingTrackRef.current) {
                    setSelectedProduct(product);
                  }
                }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="product-card">
                  <div className="product-card-glare" />
                  {product.badge && (
                    <span className="product-badge">{product.badge}</span>
                  )}
                  <div className="product-card-img">
                    {product.image ? (
                      <Image
                        src={formatImageUrl(product.image)}
                        alt={product.name}
                        width={280}
                        height={320}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="product-card-placeholder">
                        <span className="placeholder-brand">ETERNYX</span>
                        <span className="placeholder-name">{product.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="product-card-info">
                    <p className="product-card-category">{product.category}</p>
                    <h3 className="product-card-name">{product.name}</h3>
                    
                    {/* Savings with Coupon */}
                    <p className="product-savings">(Saving ₹650.00 with NEW50)</p>
                    
                    {/* Price Row: Final Price with Coupon + Cut Original Price */}
                    <div className="product-price-row">
                      <span className="product-final-price">₹649</span>
                      <span className="product-cut-price">{product.price.startsWith('₹') ? product.price : `₹${product.price}`}</span>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="product-rating-pill">
                      <span className="rating-star">★</span>
                      <span>4.8</span>
                    </div>

                    {/* Single Full-Width Action Button */}
                    <div className="product-card-actions">
                      <button 
                        className="btn-add-cart full-width"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, '100 ml', 1, { x: e.clientX, y: e.clientY });
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Self-drawing Line Divider */}
        <div className="container">
          <div className="gold-divider scroll-draw-line" />
        </div>

        {/* Brand Statement Section */}
        <section className="brand-statement">
          <div className="brand-statement-left">
            <p className="brand-statement-eyebrow scroll-fade-item">{philosophy.eyebrow || 'Our Philosophy'}</p>
            <h2 className="brand-statement-headline scroll-reveal-text">
              <span className="text-reveal-mask" style={{ display: 'block' }}>
                <span className="text-reveal-word text-reveal-trigger-item">{philosophy.headlinePart1 || 'Silence'}</span>
              </span>
              <span className="text-reveal-mask" style={{ display: 'block' }}>
                <span className="text-reveal-word text-reveal-trigger-item">{philosophy.headlinePart2 || 'Is Luxury.'}</span>
              </span>
            </h2>
            <p className="brand-statement-body scroll-fade-item">
              {philosophy.description}
            </p>
            <a href={philosophy.buttonUrl || '/story'} className="brand-statement-cta scroll-fade-item">
              {philosophy.buttonText || 'About Us'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          <div className="brand-statement-right">
            <Image
              src={philosophy.imageUrl || '/images/brand-statement.png'}
              alt="ETERNYX Luxury Perfumes"
              width={800}
              height={600}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              referrerPolicy="no-referrer"
              unoptimized={Boolean(philosophy.imageUrl?.includes('drive.google.com') || philosophy.imageUrl?.includes('googleusercontent.com'))}
            />
          </div>
        </section>

        {/* Self-drawing Line Divider */}
        <div className="container">
          <div className="gold-divider scroll-draw-line" />
        </div>

        {/* Tabbed Products Section */}
        {availableTabs.length > 0 && (
          <section className="tabbed-products-section">
            <div className="container">
              <div className="tabbed-header">
                <p className="category">Collections</p>
                <h2 className="scroll-reveal-text">
                  <TextReveal text="Curated Creations" />
                </h2>
              </div>
              
              <div className="tabs-nav scroll-fade-item">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="tab-grid" key={activeTab}>
                {tabProducts.map((product, index) => (
                  <div 
                    className="product-card-trigger" 
                    key={index} 
                    onClick={() => setSelectedProduct(product)}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{ flex: 'unset' }}
                  >
                    <div className="product-card">
                      <div className="product-card-glare" />
                      {product.badge && (
                        <span className="product-badge">{product.badge}</span>
                      )}
                      <div className="product-card-img">
                        {product.image ? (
                          <Image
                            src={formatImageUrl(product.image)}
                            alt={product.name}
                            width={320}
                            height={360}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            referrerPolicy="no-referrer"
                            unoptimized={true}
                          />
                        ) : (
                          <div className="product-card-placeholder">
                            <span className="placeholder-brand">ETERNYX</span>
                            <span className="placeholder-name">{product.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="product-card-info">
                        <p className="product-card-category">{product.category}</p>
                        <h3 className="product-card-name">{product.name}</h3>
                        
                        {/* Savings with Coupon */}
                        <p className="product-savings">(Saving ₹650.00 with NEW50)</p>
                        
                        {/* Price Row: Final Price with Coupon + Cut Original Price */}
                        <div className="product-price-row">
                          <span className="product-final-price">₹649</span>
                          <span className="product-cut-price">{product.price.startsWith('₹') ? product.price : `₹${product.price}`}</span>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="product-rating-pill">
                          <span className="rating-star">★</span>
                          <span>4.8</span>
                        </div>

                        {/* Single Full-Width Action Button */}
                        <div className="product-card-actions">
                          <button 
                            className="btn-add-cart full-width"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, '100 ml', 1, { x: e.clientX, y: e.clientY });
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                              <line x1="3" y1="6" x2="21" y2="6"/>
                              <path d="M16 10a4 4 0 01-8 0"/>
                            </svg>
                            ADD TO CART
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Influencer Reels Section - only display if real reels added by admin */}
        {reels.length > 0 && (
          <>
            <div className="container">
              <div className="gold-divider scroll-draw-line" />
            </div>
            <section className="reels-section">
              <div className="reels-header">
                <div>
                  <p className="reels-eyebrow">As Seen On</p>
                  <h2 className="reels-title scroll-reveal-text">
                    <TextReveal text="Featured By Our Community" />
                  </h2>
                </div>
                <a href="#" className="reels-view-all">View All →</a>
              </div>
              <div className="reels-track-wrap">
                <div className="reels-track" id="reels-track">
                  {reels.map((reel, i) => (
                    <ReelCard reel={reel} key={i} />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

      </main>

      {/* Product Detail Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      
      {/* Floating Spotlight Duo */}
      <div className="hero-product-duo" ref={duoRef}>
        {spotlightProducts.map((product, index) => (
          <div 
            key={index}
            className="product-spotlight" 
            style={{ cursor: 'pointer' }} 
            onClick={() => setSelectedProduct(product)}
          >
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="product-card-placeholder" style={{ minHeight: '140px', padding: '10px' }}>
                <span className="placeholder-brand" style={{ fontSize: '0.8rem' }}>ETERNYX</span>
                <span className="placeholder-name" style={{ fontSize: '0.6rem' }}>{product.name}</span>
              </div>
            )}
            <h3>{product.name}</h3>
            <p className="price">{product.price}</p>
            <button className="shop-now-mini">Shop Now</button>
          </div>
        ))}
      </div>
    </>
  );
}
