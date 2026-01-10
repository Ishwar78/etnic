import CollectionLayout from "@/components/CollectionLayout";
import { products } from "@/data/products";

export default function SummerCollection() {
  const summerProducts = products.filter(p => p.isSummer);

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
