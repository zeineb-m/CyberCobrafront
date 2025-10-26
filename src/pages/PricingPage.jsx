"use client"

import { useNavigate } from "react-router-dom"

export default function PricingPage() {
  const navigate = useNavigate()

  const plans = [
    {
      name: "Starter",
      price: "$999",
      period: "/month",
      description: "Perfect for small deployments",
      features: ["Up to 5 zones", "10 cameras", "Basic reporting", "Email support", "1 admin user"],
      cta: "Get Started",
    },
    {
      name: "Professional",
      price: "$2,999",
      period: "/month",
      description: "For growing organizations",
      features: [
        "Up to 50 zones",
        "100 cameras",
        "Advanced analytics",
        "Priority support",
        "10 admin users",
        "Custom integrations",
      ],
      cta: "Get Started",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large-scale deployments",
      features: [
        "Unlimited zones",
        "Unlimited cameras",
        "Full analytics suite",
        "24/7 dedicated support",
        "Unlimited users",
        "Custom development",
        "On-premise option",
      ],
      cta: "Contact Sales",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-primary/80 backdrop-blur border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 hover:opacity-80">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold">🐍</span>
            </div>
            <span className="font-bold text-lg">CyberCobra</span>
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-accent text-primary font-medium rounded-lg hover:bg-accent-light transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-20 px-6 bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your organization's needs
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-lg border transition-all ${
                  plan.highlighted
                    ? "bg-accent/10 border-accent scale-105"
                    : "bg-surface border-border hover:border-accent"
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-text-secondary mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-text-secondary ml-2">{plan.period}</span>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className={`w-full py-2 rounded-lg font-semibold mb-8 transition-colors ${
                    plan.highlighted
                      ? "bg-accent text-primary hover:bg-accent-light"
                      : "bg-primary border border-border hover:border-accent"
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className="text-accent mt-1">✓</span>
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes, you can change your plan at any time. Changes take effect at the next billing cycle.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, we offer a 14-day free trial for all plans. No credit card required.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, bank transfers, and government purchase orders.",
              },
              {
                q: "Do you offer discounts for annual billing?",
                a: "Yes, annual billing includes a 20% discount compared to monthly billing.",
              },
            ].map((faq, i) => (
              <div key={i} className="p-6 bg-primary border border-border rounded-lg">
                <h4 className="font-semibold mb-2">{faq.q}</h4>
                <p className="text-text-secondary">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto text-center text-text-muted">
          <p>&copy; 2025 CyberCobra. Ministry of Interior. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
