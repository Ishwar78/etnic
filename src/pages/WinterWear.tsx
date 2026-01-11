import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { normalizeProduct } from "@/lib/normalizeProduct";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function WinterWear() {
  const [winterProducts, setWinterProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          // Map and filter API products for winter collection
          const mapped = (data.products || [])
            .filter((p: any) => p.isWinter)
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
          setWinterProducts(mapped);
        } else {
          setWinterProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setWinterProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <CollectionLayout
      title="Winter Wear"
      subtitle="Cozy & Stylish Winter Fits"
      tagline="Warm elegance for the cold season"
      metaTitle="Winter Wear | Vasstra - Cozy Winter Fashion"
      metaDescription="Shop our winter collection. Warm fabrics, rich colors, and stylish winter outfits. Free shipping above ₹999."
      products={winterProducts}
      heroBg="bg-gradient-to-b from-slate-100/50 to-background"
    />
  );
}
