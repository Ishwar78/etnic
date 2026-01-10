import CollectionLayout from "@/components/CollectionLayout";
import { products } from "@/data/products";

export default function WinterWear() {
  const winterProducts = products.filter(p => p.isWinter);

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
