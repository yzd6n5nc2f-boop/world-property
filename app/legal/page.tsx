import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalRoute() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Legal</h1>
        <p className="text-muted-foreground">Key notices for this MVP experience.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>This application is an MVP demonstration. Listings, pricing, and availability are mocked.</p>
          <p>No real transactions, reservations, or communications occur through this interface.</p>
          <p>Map tiles and data are provided by OpenStreetMap contributors and Carto.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>All saved items and published listings are stored locally in your browser via LocalStorage.</p>
          <p>No personal data is transmitted to a backend in this MVP.</p>
        </CardContent>
      </Card>
    </div>
  );
}
