"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { createPaystackTransaction } from "@/lib/api";

export default function PricingBillingPage() {
  const [loadingRef, setLoadingRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  

  // Test credit packages with both KES and USD amounts for Paystack
  const creditPacks = [
    { id: "small", kesAmount: 64800, usdAmount: 500, credits: 50, label: "50 Credits", savings: null },
    { id: "medium", kesAmount: 259200, usdAmount: 2000, credits: 300, label: "300 Credits", savings: "17% off" },
    { id: "large", kesAmount: 518400, usdAmount: 4000, credits: 650, label: "650 Credits", savings: "25% off" },
  ];

  const plans = [
    {
      id: "trial",
      name: "Trial",
      price: "Free",
      description: "Get started",
      credits: 5,
      features: [
        "5 scan credits",
        "Basic results",
        "30-day access",
        "Email support",
      ],
      highlighted: false,
    },
    {
      id: "starter",
      name: "Starter",
      price: "KES 12,830 / $99",
      kesAmount: 12830,
      usdAmount: 99,
      description: "For individuals",
      credits: 100,
      features: [
        "100 scan credits/month",
        "Advanced analytics",
        "API access",
        "Priority support",
        "Custom branding",
      ],
      highlighted: false,
    },
    {
      id: "growth",
      name: "Growth",
      price: "KES 64,670 / $499",
      kesAmount: 64670,
      usdAmount: 499,
      description: "Most popular",
      credits: 1000,
      features: [
        "1,000 scan credits/month",
        "Real-time dashboards",
        "Webhook integrations",
        "Team collaboration (5 users)",
        "24/7 phone support",
        "Advanced reporting",
      ],
      highlighted: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      description: "For large teams",
      credits: 10000,
      features: [
        "10,000+ scan credits/month",
        "Dedicated account manager",
        "SLA guarantees",
        "Multi-team management",
        "Compliance & audit logs",
        "Custom integrations",
      ],
      highlighted: false,
    },
  ];


  const handleBuyCredits = async (pack: typeof creditPacks[0], currency: "KES" | "USD") => {
    try {
      setLoadingRef(pack.id + "-" + currency);
      const amount = currency === "KES" ? pack.kesAmount : pack.usdAmount;
      const res = await createPaystackTransaction(amount, pack.credits, currency);
      const authorizationUrl = res?.data?.authorization_url;
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
      } else {
        console.error("No authorization URL returned", res);
        alert("Failed to initialize payment. Check console.");
      }
    } catch (err) {
      console.error(err);
      alert("Error initializing payment. See console for details.");
    } finally {
      setLoadingRef(null);
    }
  };

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  type Plan = typeof plans[number];
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const openPlanCurrencyModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowCurrencyModal(true);
  };

  const choosePlanCurrency = async (currency: "KES" | "USD") => {
    if (!selectedPlan) return;
    try {
      setShowCurrencyModal(false);
      setLoadingRef(selectedPlan.id + "-plan-" + currency);
    const amount =
      currency === "KES"
        ? selectedPlan.kesAmount
        : selectedPlan.usdAmount;

        if (amount == null) {
          setError("Invalid pricing configuration. Please contact support.");
          return;
        }
      await createPaystackTransaction(amount, selectedPlan.credits, currency);
      // redirect will happen in createPaystackTransaction flow
    } catch (err) {
      console.error(err);
      alert("Error initializing plan purchase. See console.");
    } finally {
      setLoadingRef(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Choose the perfect plan for your verification needs
          </p>

          {/* Quick Buy Credits Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">Buy Credits Now</h2>
                {error && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {creditPacks.map((pack) => (
                <div key={pack.id} className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6 hover:shadow-lg transition-all">
                  {pack.savings && (
                    <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {pack.savings}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pack.label}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">KES {pack.kesAmount.toLocaleString()} • $ {pack.usdAmount.toLocaleString()}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBuyCredits(pack, "KES")}
                      disabled={!!loadingRef}
                      className="flex-1 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 py-2 rounded-lg font-semibold"
                    >
                      {loadingRef === pack.id + "-KES" ? "Processing..." : `Local — KES ${pack.kesAmount}`}
                    </button>
                    <button
                      onClick={() => handleBuyCredits(pack, "USD")}
                      disabled={!!loadingRef}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-2 rounded-lg font-semibold"
                    >
                      {loadingRef === pack.id + "-USD" ? "Processing..." : `International — $${pack.usdAmount}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              💡   Each credit = 1 scan verification
            </p>
          </div>
        </div>

        {/* Currency modal for plan purchase */}
        {showCurrencyModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Choose payment currency</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Select Local (KES) or International (USD) for the <strong>{selectedPlan.name}</strong> plan.</p>
              <div className="flex gap-3">
                <button onClick={() => choosePlanCurrency("KES")} className="flex-1 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 py-2 rounded-lg font-semibold">Local — KES {selectedPlan.kesAmount?.toLocaleString() || "—"}</button>
                <button onClick={() => choosePlanCurrency("USD")} className="flex-1 bg-blue-600 text-white hover:bg-blue-700 py-2 rounded-lg font-semibold">International — ${selectedPlan.usdAmount || "—"}</button>
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => setShowCurrencyModal(false)} className="text-sm text-slate-500 hover:underline">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl transition-all duration-300 ${
                plan.highlighted
                  ? "lg:scale-105 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl"
                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700"
              }`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan name and description */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={plan.highlighted ? "text-blue-100" : "text-slate-600 dark:text-slate-400"}>
                  {plan.description}
                </p>

                {/* Price */}
                <div className="my-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.id !== "trial" && plan.id !== "enterprise" && (
                    <span className={plan.highlighted ? "text-blue-100" : "text-slate-600 dark:text-slate-400"}>
                      {" "}/month
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                {plan.id === "trial" ? (
                  <button className={`w-full py-3 rounded-lg font-semibold mb-6 transition-all ${
                    plan.highlighted
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}>
                    Get Started
                  </button>
                ) : plan.id === "enterprise" ? (
                  <button className={`w-full py-3 rounded-lg font-semibold mb-6 transition-all ${
                    plan.highlighted
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
                  }`}>
                    Contact Sales
                  </button>
                ) : (
                  <button onClick={() => openPlanCurrencyModal(plan)} className={`w-full py-3 rounded-lg font-semibold mb-6 transition-all ${
                    plan.highlighted
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}>
                    Choose Plan
                  </button>
                )}

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${plan.highlighted ? "text-blue-50" : ""}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ / Info Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">No Credit Card Required</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Start with our free trial. Upgrade anytime.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">Flexible Billing</h4>
            <p className="text-slate-600 dark:text-slate-400">
              Pay as you go or subscribe to save more.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">Cancel Anytime</h4>
            <p className="text-slate-600 dark:text-slate-400">
              No contracts or hidden fees. Cancel with one click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}