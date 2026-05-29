import axios, { AxiosInstance } from 'axios';

// ─────────────────────────────────────────────────
// Shopify API Client Factory
// Creates an authenticated Axios instance for Shopify Admin API
// ─────────────────────────────────────────────────

export const createShopifyClient = (
  storeUrl: string,
  accessToken: string
): AxiosInstance => {
  return axios.create({
    baseURL: `https://${storeUrl}/admin/api/2024-01`,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
};

/**
 * Get Shopify client using environment variables (default store)
 */
export const getDefaultShopifyClient = (): AxiosInstance => {
  const storeUrl = process.env.SHOPIFY_STORE_URL || '';
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN || '';
  return createShopifyClient(storeUrl, accessToken);
};
