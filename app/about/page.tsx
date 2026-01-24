import { Globe2, MapPinned, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutRoute() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">About World Property</h1>
        <p className="text-muted-foreground">A buyer-first platform that brings legal clarity to global property decisions.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Map-first decisions",
            text: "Every search begins with geography. You control the viewport, we adapt the results.",
            icon: MapPinned
          },
          {
            title: "Legal journey guidance",
            text: "Understand the steps, documents, and risks before you make an offer in any country.",
            icon: Scale
          },
          {
            title: "Global coverage, local clarity",
            text: "Compare local prices with familiar currency conversions without leaving the map.",
            icon: Globe2
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
          <p>• Buyer confidence over browsing novelty.</p>
          <p>• Legal clarity as a product surface, not a footer link.</p>
          <p>• MVP seams that scale into real services.</p>
        </CardContent>
      </Card>
    </div>
  );
}
