'use client';

import { useState, useEffect } from 'react';
import ProductModal from '@/components/ProductModal';
import CategoryPillsBar from '@/components/fraganote/CategoryPillsBar';
import PromoPopupModal from '@/components/fraganote/PromoPopupModal';
import HeroBannerSlider from '@/components/fraganote/HeroBannerSlider';
import PressMarquee from '@/components/fraganote/PressMarquee';
import ShopTheMomentSection from '@/components/fraganote/ShopTheMomentSection';
import BuildBundleSection from '@/components/fraganote/BuildBundleSection';
import ShopByGenderSection from '@/components/fraganote/ShopByGenderSection';
import ShoppableReelsSection from '@/components/fraganote/ShoppableReelsSection';
import ShopByNoteProfileSection from '@/components/fraganote/ShopByNoteProfileSection';
import RetailPartnersSection from '@/components/fraganote/RetailPartnersSection';
import GiftingEditSection from '@/components/fraganote/GiftingEditSection';
import OurPromisesSection from '@/components/fraganote/OurPromisesSection';
import CustomerReviewsSection from '@/components/fraganote/CustomerReviewsSection';
import InstagramFeedSection from '@/components/fraganote/InstagramFeedSection';
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_CATEGORY_PILLS,
  DEFAULT_POPUP,
  DEFAULT_PRESS,
  DEFAULT_BUNDLES,
  DEFAULT_NOTE_PROFILES,
  DEFAULT_RETAIL_PARTNERS,
  DEFAULT_PROMISES,
  DEFAULT_INSTAGRAM,
  DEFAULT_TITLES,
} from '@/lib/homepageDefaults';

export interface HomeClientProps {
  initialBanners?: any[];
  initialProducts?: any[];
  initialReels?: any[];
  initialReviews?: any[];
  homepageData?: {
    announcements?: any[];
    categoryPills?: any[];
    popup?: any;
    press?: any[];
    bundles?: any[];
    noteProfiles?: any[];
    retailPartners?: any[];
    promises?: any[];
    instagram?: any[];
    titles?: any;
  };
  settings?: Record<string, any>;
}

export default function HomeClient({
  initialBanners = [],
  initialProducts = [],
  initialReels = [],
  initialReviews = [],
  homepageData,
}: HomeClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [activeCategoryPill, setActiveCategoryPill] = useState<string>('all');

  // Resolved dynamic data with robust fallbacks
  const banners = initialBanners.length > 0 ? initialBanners : [];
  const products = initialProducts.length > 0 ? initialProducts : [];
  const reels = initialReels.length > 0 ? initialReels : [];
  const reviews = initialReviews.length > 0 ? initialReviews : [];

  const categoryPills = homepageData?.categoryPills || DEFAULT_CATEGORY_PILLS;
  const popup = homepageData?.popup || DEFAULT_POPUP;
  const press = homepageData?.press || DEFAULT_PRESS;
  const bundles = homepageData?.bundles || DEFAULT_BUNDLES;
  const noteProfiles = homepageData?.noteProfiles || DEFAULT_NOTE_PROFILES;
  const retailPartners = homepageData?.retailPartners || DEFAULT_RETAIL_PARTNERS;
  const promises = homepageData?.promises || DEFAULT_PROMISES;
  const instagram = homepageData?.instagram || DEFAULT_INSTAGRAM;
  const titles = homepageData?.titles || DEFAULT_TITLES;

  const handleSelectCategoryPill = (slug: string) => {
    setActiveCategoryPill(slug);

    const s = slug.toLowerCase();
    if (s === 'him' || s === 'her' || s === 'unisex') {
      const el = document.getElementById('section-shop-by-gender');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (
      s === 'gourmand' ||
      s === 'floral' ||
      s === 'fruity' ||
      s === 'fresh' ||
      s === 'vanilla' ||
      s === 'woody'
    ) {
      const el = document.getElementById('section-shop-by-note');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById('section-shop-the-moment');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fraganote-storefront-wrapper">
      {/* 1. Promotional Welcome Popup (24-hr suppression) */}
      <PromoPopupModal popup={popup} />

      {/* 2. Top Category Capsule Pills Bar (Sticky Under Header) */}
      <CategoryPillsBar
        pills={categoryPills}
        selectedCategory={activeCategoryPill}
        onSelectCategory={handleSelectCategoryPill}
      />

      <main className="fraganote-main-content">
        {/* 3. Hero Banner Slider */}
        <HeroBannerSlider banners={banners} />

        {/* 4. "FEATURED IN" Press Logos Marquee */}
        <PressMarquee items={press} />

        {/* 5. "SHOP THE MOMENT" Tabbed Product Showcase */}
        <div id="section-shop-the-moment">
          <ShopTheMomentSection
            products={products}
            title={titles.shopMomentTitle}
            onQuickView={(p) => setSelectedProduct(p)}
          />
        </div>

        {/* 6. "BUILD YOUR BUNDLE" 2-Card Feature Grid */}
        <BuildBundleSection bundles={bundles} />

        {/* 7. "SHOP BY GENDER" Tabbed Grid */}
        <div id="section-shop-by-gender">
          <ShopByGenderSection
            products={products}
            title={titles.genderTitle}
            onQuickView={(p) => setSelectedProduct(p)}
          />
        </div>

        {/* 8. "SEE WHAT THE HYPE'S ABOUT" Shoppable Video Reels */}
        <div id="section-shoppable-reels">
          <ShoppableReelsSection
            reels={reels}
            products={products}
            title={titles.hypeTitle}
          />
        </div>

        {/* 9. "SHOP BY NOTE PROFILE" Visual Avatars & Filter */}
        <div id="section-shop-by-note">
          <ShopByNoteProfileSection
            noteProfiles={noteProfiles}
            products={products}
            title={titles.noteProfileTitle}
            onQuickView={(p) => setSelectedProduct(p)}
          />
        </div>

        {/* 10. "WE'RE ALSO AVAILABLE AT" Quick-Commerce Logos */}
        <RetailPartnersSection
          partners={retailPartners}
        />

        {/* 11. "THE GIFTING EDIT" Collection */}
        <div id="section-gifting-edit">
          <GiftingEditSection
            products={products}
            title={titles.giftingTitle}
            onQuickView={(p) => setSelectedProduct(p)}
          />
        </div>

        {/* 12. "OUR PROMISES" Trust Badges */}
        <OurPromisesSection
          promises={promises}
          title={titles.promisesTitle}
        />

        {/* 13. "LOVED BY 50,000+ CUSTOMERS" Verified Reviews */}
        <CustomerReviewsSection
          reviews={reviews}
          products={products}
          title={titles.customerCountTitle}
        />

        {/* 14. "OUR INSTAGRAM" Community Lifestyle Gallery */}
        <InstagramFeedSection
          posts={instagram}
          title={titles.instagramTitle}
        />
      </main>

      {/* Quick View Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={{
            id: selectedProduct.id,
            name: selectedProduct.name,
            category: selectedProduct.category || 'Luxury Blend',
            price: typeof selectedProduct.price === 'number' ? `₹${selectedProduct.price}` : selectedProduct.price,
            image: selectedProduct.image_url || selectedProduct.image || '',
            badge: selectedProduct.badge || null,
            description: selectedProduct.description,
            top_notes: selectedProduct.top_notes,
            heart_notes: selectedProduct.heart_notes,
            base_notes: selectedProduct.base_notes,
            sizes: selectedProduct.sizes,
            additional_images: selectedProduct.additional_images,
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <style jsx global>{`
        body {
          background-color: #FAF6F4 !important;
          color: #1A1617 !important;
        }
        .fraganote-storefront-wrapper {
          background-color: #FAF6F4;
          min-height: 100vh;
          overflow-x: hidden;
        }
        .fraganote-main-content {
          background-color: #FAF6F4;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
