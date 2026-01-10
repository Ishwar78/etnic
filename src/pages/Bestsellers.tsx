import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Bestsellers() {
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          // Map API products to expected format
          const mapped = (data.products || [])
            .filter((p: any) => p.isBestseller)
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
              isBestseller: true,
            }));
          setBestsellers(mapped);
        } else {
          setBestsellers([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setBestsellers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <CollectionLayout
      title="Bestsellers"
      subtitle="Bestselling Outfits Loved by Customers"
      metaTitle="Bestsellers | Vasstra - Top Selling Ethnic Fashion"
      metaDescription="Shop our bestselling ethnic wear collection. Customer favorites with premium quality and stunning designs. Free shipping above ₹999."
      products={bestsellers}
      showTrending
      heroBg="bg-gradient-to-b from-primary/5 to-background"
    />
  );
}
