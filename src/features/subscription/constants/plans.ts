export const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "₹699/-",
    period: "Once a year, taxes (18% + 15%)",
    originalPrice: "₹999/-",
    discount: "30% OFF",
    features: [
      { text: "'Premium' Badge on Profile", included: true },
      { text: "Express your lifestyle as Premium", included: true },
      { text: "See your liked Profile", included: true },
      { text: "Message directly to find your soul partner", included: true },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹1699/-",
    period: "Once a year, taxes (18% + 15%)",
    originalPrice: "₹1999",
    discount: "20% OFF",
    popular: true,
    features: [
      { text: "'Premium' Badge on Profile", included: true },
      { text: "Express your lifestyle as Premium", included: true },
      { text: "High-quality photo uploads", included: true },
      { text: "See who liked you", included: true },
      { text: "Advanced filters", included: true },
      { text: "Message directly to find your soul partner", included: true },
    ],
  },
];
