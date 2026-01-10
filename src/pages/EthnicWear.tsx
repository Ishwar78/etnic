import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { products, ethnicSubcategories } from "@/data/products";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function EthnicWear() {
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products?category=ethnic_wear`);
        if (response.ok) {
          const data = await response.json();
          // Map API products to expected format
          const mapped = data.products.map((p: any) => ({
            _id: p._id,
            id: p._id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            discount: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100),
            image: p.image,
            hoverImage: p.image,
            category: "Ethnic Wear",
            subcategory: p.subcategory || "Ethnic Wear",
            sizes: p.sizes || [],
            colors: p.colors || [],
            isNew: p.isNew || false,
            isBestseller: p.isBestseller || false,
            isSummer: p.isSummer || false,
            isWinter: p.isWinter || false,
            isEthnic: true,
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
  const ethnicProducts = apiProducts.length > 0
    ? apiProducts
    : products.filter(p => p.isEthnic);

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
