import { useRef } from "react";
import { Header } from "@/app/components/Header";
import { HeroSection } from "@/app/components/HeroSection";
import { FeaturesSection } from "@/app/components/FeaturesSection";
import { ExamplesSection } from "@/app/components/ExamplesSection";
import { DownloadSection } from "@/app/components/DownloadSection";
import { Footer } from "@/app/components/Footer";

export default function App() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const examplesRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (section: string) => {
    let targetRef;
    switch (section) {
      case 'hero':
        targetRef = heroRef;
        break;
      case 'features':
      case 'docs':
        targetRef = featuresRef;
        break;
      case 'examples':
        targetRef = examplesRef;
        break;
      case 'download':
        targetRef = downloadRef;
        break;
      default:
        return;
    }
    
    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleNavigate} />
      
      <div ref={heroRef}>
        <HeroSection onNavigate={handleNavigate} />
      </div>
      
      <div ref={featuresRef}>
        <FeaturesSection />
      </div>
      
      <div ref={examplesRef}>
        <ExamplesSection />
      </div>
      
      <div ref={downloadRef}>
        <DownloadSection />
      </div>
      
      <Footer />
    </div>
  );
}
