import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Check, Clock, CreditCard } from "lucide-react"
import { useState } from "react"

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  description: string
  price: string
  period: string
  badge?: string
  features: PlanFeature[]
  buttonText: string
  recommended?: boolean
  trialInfo?: string
}

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState("free")

  const plans: Plan[] = [
    {
      id: "free",
      name: "Free Trial",
      description: "Full features for 14 days - same as Basic plan",
      price: "€0",
      period: "for 14 days",
      trialInfo: "After 14 days, upgrade to continue using the service",
      features: [
        { text: "1 WhatsApp channel", included: true },
        { text: "Unlimited Products and Services", included: true },
        { text: "Basic analytics dashboard", included: true },
        { text: "14-day trial period", included: true },
        { text: "API access", included: false },
        { text: "Advanced analytics", included: false },
        { text: "Push notifications", included: false },
        { text: "Custom AI training", included: false },
      ],
      buttonText: "Start Free Trial",
    },
    {
      id: "basic",
      name: "Basic",
      description: "Single WhatsApp line for small businesses",
      price: "€49",
      period: "per month",
      features: [
        { text: "1 WhatsApp channel", included: true },
        { text: "Unlimited Products and Services", included: true },
        { text: "Basic analytics dashboard", included: true },
        { text: "No time limits", included: true },
        { text: "API access", included: false },
        { text: "Advanced analytics", included: false },
        { text: "Push notifications", included: false },
        { text: "Custom AI training", included: false },
      ],
      buttonText: "Upgrade Now",
    },
    {
      id: "professional",
      name: "Professional",
      description: "Ideal for growing businesses with more needs",
      price: "€149",
      period: "per month",
      badge: "Popular",
      features: [
        { text: "Up to 3 WhatsApp channels", included: true },
        { text: "Unlimited Products and Services", included: true },
        { text: "Priority response time (12h)", included: true },
        { text: "Advanced analytics and reporting", included: true },
        { text: "API access", included: true },
        { text: "Custom AI training", included: true },
        { text: "Push notifications", included: true },
      ],
      buttonText: "Upgrade Now",
      recommended: true,
    },
  ]

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-3">
          <CreditCard className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start with our 14-day free trial with full Basic features. After the trial, choose the plan that best fits your business needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative overflow-hidden transition-all ${
              selectedPlan === plan.id 
                ? "border-2 border-primary ring-2 ring-primary/20 shadow-lg transform scale-[1.02]" 
                : "hover:shadow-md hover:border-primary/20"
            } ${plan.recommended ? "md:transform md:scale-[1.03]" : ""}`}
          >
            {plan.badge && (
              <Badge 
                variant="default" 
                className="absolute top-0 right-0 rounded-tl-none rounded-br-none rounded-tr-none bg-blue-600 text-white font-semibold m-0 p-2 transform translate-x-1"
              >
                {plan.badge}
              </Badge>
            )}
            
            <CardHeader className={plan.recommended ? "bg-primary/5" : plan.id === "free" ? "bg-green-50" : ""}>
              <CardTitle className="text-xl flex items-center gap-2">
                {plan.id === "free" && <Clock className="h-5 w-5 text-green-600" />}
                {plan.name}
              </CardTitle>
              <CardDescription className="min-h-[50px]">{plan.description}</CardDescription>
              {plan.trialInfo && (
                <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded-md mt-2">
                  ⚠️ {plan.trialInfo}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground ml-2">/{plan.period}</span>
              </div>
              
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-gray-300 flex-shrink-0 mr-2" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground"}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center pb-6">
              <Button 
                onClick={() => handleSelectPlan(plan.id)} 
                variant={selectedPlan === plan.id ? "default" : "outline"}
                className={`w-full ${
                  selectedPlan === plan.id 
                    ? plan.id === "free" 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                    : plan.id === "free"
                      ? "border-green-600 text-green-600 hover:bg-green-50"
                      : "border-blue-600 text-blue-600 hover:bg-blue-50"
                }`}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 