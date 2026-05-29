import ServicePage from "@/components/ServicePage";
export default function LongDistancePage() {
  return (
    <ServicePage
      title="Long-Distance Moving Services"
      slug="distance"
      description="Professional long-distance moving services across Canada. Purely Canadian Movers — family-owned since 1991. From Vancouver to anywhere in Canada. Call 1-877-485-6683."
      heroSubtitle="Moving across provinces? Our experienced team handles long-distance moves with the same care as your local move — from pickup to delivery."
      heroImage={{ src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663508689911/FhisZ7WXCdcqNnJdX5VyAC/Wade_e7f5a2e2.webp", alt: "Great Canadian Van Lines tractor-trailer — Purely Canadian Movers long-distance fleet" }}
      intro="Long-distance moves require a higher level of planning, coordination, and trust. When you're moving your family or business across provincial lines, you need a moving company you can rely on completely. Purely Canadian Movers has been handling long-distance moves from Metro Vancouver since 1991, with a track record of on-time, damage-free deliveries across Canada. As proud agents of Great Canadian Van Lines — Canada's moving company — we have the national network and resources to move you anywhere in the country with confidence."
      features={[
        "Detailed move planning and coordination",
        "Professional packing for long-distance transport",
        "Secure, fully enclosed moving trucks",
        "GPS-tracked shipments",
        "Flexible delivery windows",
        "Full liability coverage throughout transit",
        "Agents of Great Canadian Van Lines — Canada's moving company",
        "Experienced crew — our own employees, never subcontractors",
        "Free, no-obligation estimates",
      ]}
      highlights={[
        { title: "Careful Packing", desc: "Long-distance moves demand extra protection. We use professional-grade materials to ensure everything arrives safely." },
        { title: "On-Time Delivery", desc: "We provide realistic delivery windows and communicate throughout the journey so you're never left wondering." },
        { title: "Full Coverage", desc: "Your belongings are covered from the moment we pick them up to the moment we deliver them." },
      ]}
    />
  );
}
