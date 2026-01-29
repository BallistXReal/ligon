import { Download, Github, BookOpen, Code } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";

export function DownloadSection() {
  return (
    <section id="download" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Get Started with Ligon</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Ligon is in early development. Clone the repository and start experimenting!
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardHeader>
              <Github className="size-12 mb-4" />
              <CardTitle className="text-white">Clone from GitHub</CardTitle>
              <CardDescription className="text-blue-100">
                Get the source code and start building with Ligon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full bg-white text-blue-600 hover:bg-gray-100">
                <a href="https://github.com/BallistXReal/ligon" target="_blank" rel="noopener noreferrer">
                  <Github className="size-5 mr-2" />
                  View on GitHub
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardHeader>
              <Code className="size-12 mb-4" />
              <CardTitle className="text-white">Open Source</CardTitle>
              <CardDescription className="text-blue-100">
                Free to use, modify, and fork under our license terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-100">
                You can copy and modify Ligon as long as you don't pretend to be Ligon, 
                claim Ligon copied you, or use the Ligon name.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="size-6" />
                Getting Started (Early Development)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Clone the Repository</h4>
                <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400 mt-2">
                  $ git clone https://github.com/BallistXReal/ligon.git<br />
                  $ cd ligon
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. Explore the Source</h4>
                <p className="text-blue-100">
                  Check out the documentation and examples in the repository to understand how Ligon works
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. Start Building</h4>
                <p className="text-blue-100">
                  Create your own game or app using Ligon's syntax. Installation tools coming soon!
                </p>
              </div>

              <div className="pt-4 border-t border-white/20">
                <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <a href="https://github.com/BallistXReal/ligon" target="_blank" rel="noopener noreferrer">
                    View Repository & Documentation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}