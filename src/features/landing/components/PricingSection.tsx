import SubscriptionPlans from "@/components/subscription/SubscriptionPlans";

const PricingSection = () => {
  return (
    <section id="precos" className="py-12 md:py-20 bg-gray-50 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SubscriptionPlans />
      </div>
    </section>
  );
};

export default PricingSection;