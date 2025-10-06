"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";

export default function PricingBillingPage() {
  const [yearly, setYearly] = useState(true);

  const plans = [
    {
      id: "trial",
      name: "Trial Plan",
      price: "Free",
      description: "To test accuracy and workflow fit",
      features: [
        { text: "1 user max", info: "Limited to a single user account" },
        { text: "5 credits", info: "Each scan consumes 1 credit" },
        { text: "30 days", info: "Trial expires 30 days after signup" },
      ],
      badgeColor: "bg-blue-500",
    },
    {
      id: "starter",
      name: "Starter Plan",
      price: yearly ? "$99/year" : "$99/month",
      description: "For freelancers, small agencies, fact-checkers",
      features: [
        { text: "1 user max", info: "Only one team member can use this plan" },
        { text: "100 credits", info: "100 verification scans included" },
        { text: "Basic reporting", info: "Downloadable PDF summaries only" },
      ],
      badgeColor: "bg-sky-500",
    },
    {
      id: "growth",
      name: "Growth Plan",
      price: yearly ? "$499/year" : "$499/month",
      description: "For media houses, mid-size financial teams",
      features: [
        { text: "1,000 credits", info: "1,000 scans included" },
        {
          text: "Advanced reporting",
          info: "Custom dashboards, CSV exports, and scheduled reports",
        },
        {
          text: "API integration for newsroom/organization workflows",
          info: "Access to REST API for automation and integrations",
        },
      ],
      badgeColor: "bg-cyan-600",
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      price: "Contact Sales",
      description: "For governments, banks, insurers, large media networks",
      features: [
        { text: "10,000+ credits", info: "Scalable limits for heavy usage" },
        {
          text: "Real-time monitoring and alerts",
          info: "Get instant fraud alerts and live dashboard updates",
        },
        {
          text: "Dedicated support, SLAs, compliance tools",
          info: "Priority 24/7 support and compliance certifications",
        },
        {
          text: "Multi-team access and audit logs",
          info: "Role-based access and detailed activity logs",
        },
      ],
      badgeColor: "bg-teal-700",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white">
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-bold mb-10">Pricing & Billing</h1>

        {/* Billing Toggle */}
        <div className="flex justify-end items-center mb-10 gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Billed Yearly
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors ${
              yearly ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-800"
            }`}
          >
            <span
              className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${
                yearly ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Billed Monthly
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-black rounded-xl shadow-md border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              {/* Badge */}
              <div
                className={`text-white text-sm px-4 py-1 rounded-full inline-block mb-4 ${plan.badgeColor}`}
              >
                {plan.name}
              </div>

              {/* Price */}
              <h2 className="text-2xl font-semibold mb-2">{plan.price}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                {plan.description}
              </p>

              {/* Features with Tooltips */}
              <ul className="space-y-3 text-sm text-gray-800 dark:text-gray-300 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between relative group"
                  >
                    <span>• {feature.text}</span>
                    <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer" />

                    {/* Tooltip */}
                    <div className="absolute right-6 top-0 opacity-0 group-hover:opacity-100 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-md px-3 py-2 w-48 transition-opacity duration-200 z-10">
                      {feature.info}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Add-On Credits & Notes */}
        <div className="text-center mt-12 text-sm text-gray-700 dark:text-gray-400">
          <p className="mb-3">
            Add-On Credits: <strong>$1 per scan</strong> (billed in packs of 100)
            after plan limits are reached
          </p>
          <p className="mb-3">
            All prices are in USD and are charged per member with applicable
            taxes added at checkout
          </p>
          <button className="border border-gray-300 dark:border-gray-800 rounded-full px-6 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            View All plan features
          </button>
        </div>
      </main>
    </div>
  );
}