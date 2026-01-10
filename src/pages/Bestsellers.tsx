import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { products } from "@/data/products";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Bestsellers() {
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          // Map API products to expected format
          const mapped = data.products
            .filter((p: any) => p.isBestseller)
            .map((p: any) => ({
              _id: p._id,
              id: p._id,
              name: p.name,
              price: p.price,
              originalPrice: p.originalPrice,
              discount: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100),
              image: p.image,
              hoverImage: p.image,
              category: p.category || "All",
              subcategory: p.subcategory || "All",
              sizes: p.sizes || [],
              colors: p.colors || [],
              isNew: p.isNew || false,
              isBestseller: true,
              isSummer: p.isSummer || false,
              isWinter: p.isWinter || false,
            }));
          setApiProducts(mapped);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Use API products if available, otherwise fallback to hardcoded products
  const bestsellers = apiProducts.length > 0
    ? apiProducts
    : products.filter(p => p.isBestseller);

  return (
    <CollectionLayout
      title="Bestsellers"
      subtitle="Bestselling Outfits Loved by Customers"
      metaTitle="Bestsellers | Vasstra - Top Selling Ethnic Fashion"
      metaDescription="Shop our bestselling ethnic wear collection. Customer favorites with premium quality and stunning designs. Free shipping above ₹999."
      products={bestsellers}
      showTrending
      heroBg="bg-gradient-to-b from-primary/5 to-background"
      isLoading={isLoading}
    />
  );
}
