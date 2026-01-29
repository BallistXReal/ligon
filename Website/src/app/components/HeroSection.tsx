import { Download, Github, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { LigonCat } from "@/app/components/LigonCat";

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <LigonCat size={150} className="animate-bounce-slow" />
          </div>
          
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm">
            2D & 3D Game Development + App Development
          </div>
          
          <h1 className="text-5xl md:text-7xl mb-6">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ligon</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            A powerful programming language for building 2D/3D games and modern applications with an elegant, intuitive syntax
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={() => onNavigate('download')}>
              <Download className="size-5" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6" asChild>
              <a href="https://github.com/BallistXReal/ligon" target="_blank" rel="noopener noreferrer">
                <Github className="size-5" />
                View on GitHub
              </a>
            </Button>
          </div>

          <div className="mt-16 bg-gray-900 rounded-lg p-6 text-left shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-2">
                <div className="size-3 rounded-full bg-red-500"></div>
                <div className="size-3 rounded-full bg-yellow-500"></div>
                <div className="size-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-gray-400 text-sm ml-auto">game.ligon</span>
            </div>
            <pre className="text-green-400 font-mono text-sm md:text-base overflow-x-auto">
{`ligon.initialize("2d"):
{
    window.create("main", 800, 600):
    window.color.set(255, 255, 255):

    ligon.draw("player"):{
        ligon.draw.color(255, 0, 0):
        ligon.draw.create.rect(10, 10, 100, 50):
    },

    if (player.health < 0).run:{
        // game over logic
    },
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}