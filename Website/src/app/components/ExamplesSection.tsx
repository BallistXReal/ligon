import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

const examples = [
  {
    title: "2D Game Setup",
    code: `ligon.initialize("2d"):
{
    window.create("main", 800, 600):
    window.color.set(255, 255, 255):

    ligon.draw("player"):{
        ligon.draw.color(255, 0, 0):
        ligon.draw.create.rect(10, 10, 100, 50):
    },

    if (player.health < 0).run:{
        // game over logic
        window.showGameOver():
    },
}`
  },
  {
    title: "3D Scene",
    code: `ligon.initialize("3d"):
{
    window.create("3d_view", 1024, 768):
    window.color(255, 255, 255):
    
    render.model("models/character.obj"):
    render.camera.position(0, 5, 10):
    
    ligon.getservice{exampleAddonService}:;
}`
  },
  {
    title: "Game Loop",
    code: `ligon.initialize("2d"):
{
    window.create("game", 640, 480):
    
    ligon.update():{
        player.move(input.getAxis()):
        enemy.chase(player.position):
        
        if (collision(player, enemy)).run:{
            player.health -= 10:
        },
    },
    
    ligon.draw("scene"):{
        ligon.draw.sprite("player", player.x, player.y):
        ligon.draw.sprite("enemy", enemy.x, enemy.y):
    },
}`
  },
  {
    title: "UI System",
    code: `ligon.initialize("2d"):
{
    window.create("app", 800, 600):
    
    ligon.ui.create("mainMenu"):{
        ligon.ui.button("start", 100, 100):{
            text: "Start Game":
            onClick: startGame():
        },
        
        ligon.ui.label("title", 200, 50):{
            text: "My Awesome Game":
            fontSize: 24:
        },
    },
}`
  }
];

export function ExamplesSection() {
  return (
    <section id="examples" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Code Examples</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See Ligon's intuitive syntax in action for game development and app creation
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              {examples.map((example, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  {example.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {examples.map((example, index) => (
              <TabsContent key={index} value={index.toString()}>
                <div className="bg-gray-900 rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-2">
                      <div className="size-3 rounded-full bg-red-500"></div>
                      <div className="size-3 rounded-full bg-yellow-500"></div>
                      <div className="size-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-gray-400 text-sm ml-auto">{example.title.toLowerCase().replace(/\s+/g, '_')}.ligon</span>
                  </div>
                  <pre className="text-green-400 font-mono text-sm md:text-base overflow-x-auto">
                    {example.code}
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}