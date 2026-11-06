import { getSiteContent } from "@/lib/data/menu";
import { AskWidget } from "@/components/site/AskWidget";
import { CrewOrders } from "@/components/site/CrewOrders";
import { DeliveryPlatforms } from "@/components/site/DeliveryPlatforms";
import { Faq } from "@/components/site/Faq";
import { FeatureSection } from "@/components/site/FeatureSection";
import { FeaturedStrip } from "@/components/site/FeaturedStrip";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { LocationSection } from "@/components/site/LocationSection";
import { Marquee } from "@/components/site/Marquee";
import { MenuSection } from "@/components/site/MenuSection";
import { StickyOrderBar } from "@/components/site/StickyOrderBar";
import { TiersSection } from "@/components/site/TiersSection";
import { ValueProps } from "@/components/site/ValueProps";

export default async function Home() {
  const content = await getSiteContent();
  const allItems = content.categories.flatMap((c) => c.items);
  const featured = allItems.filter((i) => i.is_featured).slice(0, 6);
  const sierra = allItems.find((i) => i.slug === "sierra") ?? allItems.find((i) => i.tiers.length > 0);

  return (
    <>
      <Header />
      <main>
        <Hero location={content.location} />
        <FeaturedStrip items={featured} />
        <Marquee items={["Crispy edges. Juicy centres.", "Fort McMurray built", "Breakfast till 11", "1500 · 2500 · 3500", "Smashed to order"]} />

        <FeatureSection
          eyebrow="The work truck"
          title="The Sierra"
          text="Alberta beef smashed thin on a ripping-hot griddle for crispy, lacy edges and a juicy centre. American cheese, pickles, grilled onions and Pit Stop sauce on a toasted potato bun. The one everything else is measured against."
          cta={{ label: "See the Sierra", href: "/#menu-sierra" }}
          image={{ src: "/media/features/feat-sierra.jpg", alt: "The Sierra smash burger with fries" }}
          tone="light"
        />
        <FeatureSection
          eyebrow="Built for rough roads"
          title="The AT4"
          text="Pepper jack, fresh and crispy jalapeños, chipotle mayo and a hit of hot honey. Heat with a purpose, and a double stack by default if you ask for a 2500."
          cta={{ label: "Check the heat", href: "/#menu-at4" }}
          image={{ src: "/media/features/feat-at4.jpg", alt: "The AT4 spicy smash burger" }}
          tone="dark"
          flip
        />
        <FeatureSection
          eyebrow="Open till 11 AM"
          title="Breakfast, done the pit-stop way"
          text="Folded eggs, smoked bacon, hash browns and High Octane coffee from the minute we open. Grab a Turbo on the way to the site and you're set till lunch."
          cta={{ label: "See breakfast", href: "/#breakfast" }}
          image={{ src: "/media/features/feat-breakfast.jpg", alt: "The Turbo breakfast sandwich with a hash brown and coffee" }}
          tone="light"
        />

        <TiersSection tiers={content.tiers} example={sierra} addons={content.addons} />
        <ValueProps items={content.value_props} />
        <MenuSection categories={content.categories} tiers={content.tiers} />
        <CrewOrders location={content.location} image={{ src: "/media/features/feat-fries.jpg", alt: "Loaded Pit Fries" }} />
        <Faq faqs={content.faqs} />
        <LocationSection location={content.location} />
        <DeliveryPlatforms location={content.location} />
      </main>
      <Footer content={content} />
      <StickyOrderBar />
      <AskWidget />
    </>
  );
}
