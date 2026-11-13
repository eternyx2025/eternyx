import { NextResponse } from 'next/server';
import { homepageService } from '@/services/homepageService';
import { bannerService } from '@/services/bannerService';
import { productService } from '@/services/productService';
import { reelService } from '@/services/reelService';
import { reviewService } from '@/services/reviewService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      homepageData,
      banners,
      products,
      reels,
      reviews,
    ] = await Promise.all([
      homepageService.getAll(),
      bannerService.getAll().catch(() => []),
      productService.getAll().catch(() => []),
      reelService.getAll().catch(() => []),
      reviewService.getAll().catch(() => []),
    ]);

    const activeBanners = banners.filter(b => b.active);
    const visibleProducts = products.filter(p => p.visible);
    const activeReels = reels.filter(r => r.active);
    const verifiedReviews = reviews.filter(r => r.status === 'Published' || r.status === 'Approved');

    return NextResponse.json({
      success: true,
      data: {
        ...homepageData,
        banners: activeBanners,
        products: visibleProducts,
        reels: activeReels,
        reviews: verifiedReviews,
      },
    });
  } catch (error: any) {
    console.error('Failed to get homepage data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}

