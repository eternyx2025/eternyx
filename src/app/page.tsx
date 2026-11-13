import HomeClient from '@/components/HomeClient';
import { bannerService } from '@/services/bannerService';
import { productService } from '@/services/productService';
import { reelService } from '@/services/reelService';
import { reviewService } from '@/services/reviewService';
import { homepageService } from '@/services/homepageService';
import { settingsService } from '@/services/settingsService';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [banners, products, reels, reviews, homepageData, allSettings] = await Promise.all([
    bannerService.getAll().catch(() => []),
    productService.getAll().catch(() => []),
    reelService.getAll().catch(() => []),
    reviewService.getAll().catch(() => []),
    homepageService.getAll().catch(() => null),
    settingsService.getAll().catch(() => ({})),
  ]);

  const activeBanners = banners
    .filter((b) => b.active)
    .map((b) => ({
      id: b.id,
      image_url: b.image_url,
      mobile_image_url: b.mobile_image_url || b.image_url,
      link: '/shop',
    }));

  const visibleProducts = products
    .filter((p) => p.visible)
    .map((p: any) => ({
      ...p,
      name: p.name,
      category: p.category,
      price: typeof p.price === 'number' ? `₹${p.price}` : p.price,
      compare_at_price: p.compare_at_price,
      image: p.image_url || '',
      image_url: p.image_url || '',
      badge: p.badge || null,
      gender: p.gender || 'UNISEX',
      note_profile: p.note_profile || '',
      rating: p.rating || 4.8,
      review_count: p.review_count || 128,
      is_trending: Boolean(p.is_trending),
      is_new_launch: Boolean(p.is_new_launch),
      is_bestseller: Boolean(p.is_bestseller),
      is_gifting: Boolean(p.is_gifting),
      gifting_category: p.gifting_category || '',
    }));

  const activeReels = reels
    .filter((r) => r.active)
    .map((r) => ({
      id: r.id,
      handle: r.handle,
      likes: r.likes,
      product: r.product_tag,
      image: r.thumbnail_url || '',
      video: r.video_url || '#',
    }));

  const publishedReviews = reviews.filter(
    (r) => r.status === 'Published' || r.status === 'Approved'
  );

  return (
    <HomeClient
      initialBanners={activeBanners.length > 0 ? activeBanners : undefined}
      initialProducts={visibleProducts.length > 0 ? visibleProducts : undefined}
      initialReels={activeReels}
      initialReviews={publishedReviews}
      homepageData={homepageData || undefined}
      settings={allSettings}
    />
  );
}
