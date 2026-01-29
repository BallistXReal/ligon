import { Code2, Github, Twitter, Mail } from "lucide-react";
import { LigonCat } from "@/app/components/LigonCat";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LigonCat size={30} />
              <span className="text-xl font-semibold text-white">Ligon</span>
            </div>
            <p className="text-sm">
              A modern programming language for building 2D/3D games and powerful applications.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/BallistXReal/ligon" className="hover:text-blue-400 transition-colors">Documentation</a></li>
              <li><a href="https://github.com/BallistXReal/ligon" className="hover:text-blue-400 transition-colors">Examples</a></li>
              <li><a href="https://github.com/BallistXReal/ligon" className="hover:text-blue-400 transition-colors">Tutorials</a></li>
              <li><a href="https://github.com/BallistXReal/ligon" className="hover:text-blue-400 transition-colors">API Reference</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/BallistXReal/ligon" className="hover:text-blue-400 transition-colors">GitHub</a></li>
              <li><a href="https://github.com/BallistXReal/ligon" className="hover:text-blue-400 transition-colors">Discussions</a></li>
              <li><a href="https://github.com/BallistXReal/ligon" className="hover:text-blue-400 transition-colors">Contributing</a></li>
              <li><a href="https://github.com/BallistXReal/ligon" className="hover:text-blue-400 transition-colors">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="https://github.com/BallistXReal/ligon" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <Github className="size-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Twitter className="size-5" />
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                <Mail className="size-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2025 Ligon Programming Language. Open source under MIT License.</p>
        </div>
      </div>
    </footer>
  );
}