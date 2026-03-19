import DashboardLayout from "@/components/layout/DashboardLayout";
import ChatWindow from "@/components/advisor/ChatWindow";
import { useCity } from "@/hooks/useCity";
import { Lightbulb } from "lucide-react";

const AdvisorPage = () => {
  const { city } = useCity();

  const tips = [
    `Avg salary for SDE-2 in ${city.name}: ₹18-28L`,
    "Top hiring: Flipkart, Amazon, Google, Razorpay",
    "LinkedIn + Naukri both active in India",
    "DSA + System Design key for top MNCs",
  ];

  return (
    <DashboardLayout title="AI Career Advisor">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-3.5rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

          {/* Chat — takes 2/3 */}
          <div className="lg:col-span-2 h-full">
            <ChatWindow />
          </div>

          {/* Tips sidebar */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="bg-card border border-border/50 rounded-xl p-4 card-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="font-heading font-semibold text-sm">{city.name} Market Tips</span>
              </div>
              <div className="space-y-2">
                {tips.map((tip) => (
                  <div key={tip} className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 leading-relaxed">
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-4 card-shadow">
              <p className="font-heading font-semibold text-sm mb-3">Try asking:</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                {[
                  `"What salary should I expect as a React dev in ${city.name}?"`,
                  '"How do I crack Amazon interviews in India?"',
                  '"Is my resume ready for FAANG applications?"',
                  '"Which skills should I learn for ML roles?"',
                  `"Is ${city.name} good for startup jobs?"`,
                ].map((q) => (
                  <p key={q} className="bg-muted/50 rounded-lg px-3 py-2 italic leading-relaxed">{q}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdvisorPage;
