import { Globe2, MapPinned, Rocket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutRoute() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">About World Property</h1>
        <p className="text-muted-foreground">A global platform unifying property decisions across living, investing, and staying.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Map-first decisions",
            text: "Every search begins with geography. You control the viewport, we adapt the results.",
            icon: MapPinned
          },
          {
            title: "One platform, two modes",
            text: "Buy and rent listings sit alongside short stays with shared filters and saves.",
            icon: Globe2
          },
          {
            title: "Launch-ready MVP",
            text: "Designed to deploy fast on Azure Static Web Apps with local persistence.",
            icon: Rocket
          }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5 text-primary" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.text}</CardContent>
            </Card>
          );
        })}
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Product principles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Clarity over clutter.</p>
          <p>• Global coverage by default.</p>
          <p>• MVP seams that scale into real services.</p>
        </CardContent>
      </Card>
    </div>
  );
}
