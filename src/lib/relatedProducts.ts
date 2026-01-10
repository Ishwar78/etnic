import { Product, products } from "@/data/products";

interface RelatedProductsOptions {
  currentProduct: Product;
  limit?: number;
}

export function getRelatedProducts({ currentProduct, limit = 4 }: RelatedProductsOptions): Product[] {
  const priceRange = 0.2; // ±20%
  const minPrice = currentProduct.price * (1 - priceRange);
  const maxPrice = currentProduct.price * (1 + priceRange);

  // Score each product for relevance
  const scoredProducts = products
    .filter((p) => p.id !== currentProduct.id)
    .map((product) => {
      let score = 0;

      // Same category (highest priority)
      if (product.category === currentProduct.category) {
        score += 50;
      }

      // Same subcategory (very high priority)
      if (product.subcategory && product.subcategory === currentProduct.subcategory) {
        score += 40;
      }

      // Price range match
      if (product.price >= minPrice && product.price <= maxPrice) {
        score += 20;
      }

      // Same season
      if (currentProduct.isSummer && product.isSummer) score += 10;
      if (currentProduct.isWinter && product.isWinter) score += 10;

      // Same type (Ethnic/Western)
      if (currentProduct.isEthnic && product.isEthnic) score += 15;
      if (currentProduct.isWestern && product.isWestern) score += 15;

      // Bonus for bestsellers and new items
      if (product.isBestseller) score += 5;
      if (product.isNew) score += 5;

      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);

  // If not enough related products, fill with bestsellers from same category
  if (scoredProducts.length < limit) {
    const remaining = limit - scoredProducts.length;
    const existingIds = new Set([currentProduct.id, ...scoredProducts.map((p) => p.id)]);
    
    const fallbackProducts = products
      .filter((p) => !existingIds.has(p.id))
      .filter((p) => p.category === currentProduct.category || p.isBestseller)
      .slice(0, remaining);
    
    return [...scoredProducts, ...fallbackProducts];
  }

  return scoredProducts;
}
