import { reviewService } from '@/services/reviewService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productName = searchParams.get('productName');
    
    if (!productName) {
      return Response.json({ error: 'Missing product name' }, { status: 400 });
    }

    const reviews = await reviewService.getByProduct(productName);
    return Response.json(reviews);
  } catch (error) {
    console.error('Failed to get public reviews:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_name, customer, rating, comment, product_id } = body;

    if (!product_name || !customer || !comment) {
      return Response.json(
        { error: 'Product name, your name, and review feedback are required.' },
        { status: 400 }
      );
    }

    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const newReview = await reviewService.create({
      product_name: String(product_name).trim(),
      product_id: product_id ? String(product_id).trim() : undefined,
      customer: String(customer).trim(),
      rating: numRating,
      comment: String(comment).trim(),
    });

    if (!newReview) {
      return Response.json({ error: 'Failed to create review' }, { status: 500 });
    }

    return Response.json(
      { 
        message: 'Review submitted successfully and is pending approval.', 
        review: newReview 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to submit review:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
