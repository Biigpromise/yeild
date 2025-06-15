
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote: "YEILD has been a game-changer for me. I can earn extra cash in my spare time doing simple tasks. It's so easy and rewarding!",
    name: "Jessica P.",
    role: "Verified User",
  },
  {
    quote: "As a brand, YEILD helped us connect with our target audience in a meaningful way. The campaign results exceeded our expectations.",
    name: "Mike D.",
    role: "Marketing Manager, Acme Corp",
  },
  {
    quote: "I love the variety of tasks available. From surveys to social media tasks, there's always something interesting to do. Payouts are fast too!",
    name: "Sarah K.",
    role: "Verified User",
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
