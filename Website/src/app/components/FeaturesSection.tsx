import { Zap, Shield, Boxes, Rocket, Code2, Heart, Gamepad2, Box } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";

const features = [
  {
    icon: Gamepad2,
    title: "2D Game Engine",
    description: "Built-in 2D rendering, sprite management, and game loop handling for seamless game development."
  },
  {
    icon: Box,
    title: "3D Graphics",
    description: "Native 3D rendering support with model loading, lighting, and advanced graphics capabilities."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized compiler ensures your games and apps run at peak performance with minimal overhead."
  },
  {
    icon: Boxes,
    title: "Modular Design",
    description: "Service-based architecture with addon support for extending functionality."
  },
  {
    icon: Rocket,
    title: "Intuitive Syntax",
    description: "Clean, block-based syntax that's easy to learn and makes game logic crystal clear."
  },
  {
    icon: Heart,
    title: "Open Source",
    description: "Free and open source, with an active community building games and apps together."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Why Choose Ligon?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built for game developers and app creators, Ligon provides all the tools you need to bring your ideas to life
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-blue-600 transition-colors">
                <CardHeader>
                  <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="size-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}