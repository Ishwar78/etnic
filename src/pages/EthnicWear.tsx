import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { ethnicSubcategories } from "@/data/products";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function EthnicWear() {
  const [ethnicProducts, setEthnicProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/products?category=ethnic_wear`);
        if (response.ok) {
          const data = await response.json();
          // Map API products to expected format
          const mapped = (data.products || []).map((p: any) => ({
            _id: p._id,
            id: p._id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice || p.price,
            discount: p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
            image: p.image,
            category: "Ethnic Wear",
            subcategory: p.subcategory || "Ethnic Wear",
            sizes: p.sizes || [],
            colors: p.colors || [],
            isNew: p.isNew || false,
            isBestseller: p.isBestseller || false,
          }));
          setEthnicProducts(mapped);
        } else {
          setEthnicProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setEthnicProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filterCategories = ethnicSubcategories.map(s => s.name);

  return (
    <CollectionLayout
      title="Ethnic Wear Collection"
      subtitle="Timeless elegance meets contemporary design"
      metaTitle="Ethnic Wear | Vasstra - Premium Indian Fashion"
      metaDescription="Explore our exclusive ethnic wear collection. Shop kurta sets, anarkali suits, lehengas, and festive wear with free shipping above ₹999."
      products={ethnicProducts}
      filterCategories={filterCategories}
      heroBg="bg-gradient-to-b from-primary/10 to-background"
      isLoading={isLoading}
    />
  );
}
