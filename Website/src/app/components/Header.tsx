import { Code2, Download, Book, Github } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { LigonCat } from "@/app/components/LigonCat";

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('hero')}>
            <LigonCat size={40} />
            <span className="text-2xl font-semibold">Ligon</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => onNavigate('features')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Features
            </button>
            <button onClick={() => onNavigate('docs')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Documentation
            </button>
            <button onClick={() => onNavigate('examples')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Examples
            </button>
            <Button onClick={() => onNavigate('download')} className="gap-2">
              <Download className="size-4" />
              Download
            </Button>
          </nav>

          <div className="md:hidden">
            <Button onClick={() => onNavigate('download')} size="sm">
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}