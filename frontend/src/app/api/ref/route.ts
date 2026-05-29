import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ref?code=REFCODE
 * Redirects the user to the Shopify store with the discount code applied.
 * Shopify handles /discount/CODE by setting a session cookie for the discount.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const refCode = searchParams.get('code');

  const shopifyStoreUrl =
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || 'https://uturn4nature.myshopify.com';

  if (!refCode) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const redirectUrl = `${shopifyStoreUrl}/discount/${encodeURIComponent(refCode)}`;
  return NextResponse.redirect(redirectUrl);
}
