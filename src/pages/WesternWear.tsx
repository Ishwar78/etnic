import { useState, useEffect } from "react";
import CollectionLayout from "@/components/CollectionLayout";
import { products, westernSubcategories } from "@/data/products";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function WesternWear() {
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products?category=western_wear`);
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
            category: "Western Wear",
            subcategory: p.subcategory || "Western Wear",
            sizes: p.sizes || [],
            colors: p.colors || [],
            isNew: p.isNew || false,
            isBestseller: p.isBestseller || false,
            isSummer: p.isSummer || false,
            isWinter: p.isWinter || false,
            isWestern: true,
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
  const westernProducts = apiProducts.length > 0
    ? apiProducts
    : products.filter(p => p.isWestern);

  const filterCategories = westernSubcategories.map(s => s.name);

  return (
    <CollectionLayout
      title="Modern Western Styles"
      subtitle="Contemporary fashion for the modern woman"
      metaTitle="Western Wear | Vasstra - Modern Fashion"
      metaDescription="Shop our western wear collection. Trendy tops, dresses, co-ord sets, and casual wear. Free shipping above ₹999."
      products={westernProducts}
      filterCategories={filterCategories}
      heroBg="bg-gradient-to-b from-secondary/10 to-background"
      isLoading={isLoading}
    />
  );
}
