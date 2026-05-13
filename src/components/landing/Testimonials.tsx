
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote: "YEILD pays for verified work — not guesses. Every Execution Order I complete clears escrow and lands in my account. It's the most professional gig platform I've used.",
    name: "Jessica P.",
    role: "Verified Operator · Eagle Rank",
  },
  {
    quote: "As a brand, YEILD's verification authority gave us confidence. We funded an Execution Order, got proof-backed results, and only paid for what was delivered.",
    name: "Mike D.",
    role: "Marketing Manager, Acme Corp",
  },
  {
    quote: "From digital actions to GPS field work, the variety is real and the payouts are fast. 1 Credit = ₦1, straight to my bank.",
    name: "Sarah K.",
    role: "Verified Operator · Phoenix Rank",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-yeild-yellow">What Our Community Says</h2>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-6">
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
