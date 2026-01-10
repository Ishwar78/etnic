import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SummerCollection() {
  const [summerProducts, setSummerProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          // Map and filter API products for summer collection
          const mapped = (data.products || [])
            .filter((p: any) => p.isSummer)
            .map((p: any) => ({
              _id: p._id,
              id: p._id,
              name: p.name,
              price: p.price,
              originalPrice: p.originalPrice || p.price,
              discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
              image: p.image,
              category: p.category === 'ethnic_wear' ? 'Ethnic Wear' : 'Western Wear',
              subcategory: p.subcategory || "All",
              sizes: p.sizes || [],
              colors: p.colors || [],
              isNew: p.isNew || false,
              isBestseller: p.isBestseller || false,
            }));
          setSummerProducts(mapped);
        } else {
          setSummerProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setSummerProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <CollectionLayout
      title="Summer Collection"
      subtitle="Light • Breezy • Comfortable"
      tagline="Stay cool in style this summer"
      metaTitle="Summer Collection | Vasstra - Light & Breezy Fashion"
      metaDescription="Shop our summer collection. Light fabrics, bright colors, and breathable outfits perfect for the season. Free shipping above ₹999."
      products={summerProducts}
      heroBg="bg-gradient-to-b from-yellow-100/50 to-background"
    />
  );
}
