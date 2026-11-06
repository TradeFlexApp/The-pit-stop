import type { Metadata } from "next";
import { getSiteContent } from "@/lib/data/menu";
import { AskWidget } from "@/components/site/AskWidget";
import { DeliveryPlatforms } from "@/components/site/DeliveryPlatforms";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MenuSection } from "@/components/site/MenuSection";
import { StickyOrderBar } from "@/components/site/StickyOrderBar";

export const metadata: Metadata = {
  title: "Menu",
  description: "Smash burgers in three engine sizes, breakfast sandwiches till 11, loaded fries, shakes and coffee. Prices in CAD.",
};

export default async function MenuPage() {
  const content = await getSiteContent();
  return (
    <>
      <Header solid />
      <main className="pt-16 md:pt-20">
        <MenuSection categories={content.categories} tiers={content.tiers} level={1} />
        <DeliveryPlatforms location={content.location} />
      </main>
      <Footer content={content} />
      <StickyOrderBar />
      <AskWidget />
    </>
  );
}
