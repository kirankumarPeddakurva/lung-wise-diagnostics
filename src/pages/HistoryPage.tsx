import { getHistory } from "@/lib/mockData";
import { Clock, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const HistoryPage = () => {
  const [history, setHistory] = useState(getHistory());

  const clearHistory = () => {
    localStorage.removeItem("lung-diagnosis-history");
    setHistory([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Scan History</h1>
          <p className="text-muted-foreground mt-1">{history.length} previous scan{history.length !== 1 ? "s" : ""}</p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" onClick={clearHistory} className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-2" /> Clear All
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 animate-fade-in-up">
          <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No scan history yet</p>
          <p className="text-sm text-muted-foreground">Upload a CT scan to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((entry, i) => (
            <Card key={entry.id} className="glass-card overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="relative">
                <img src={entry.imageUrl} alt="Scan" className="w-full h-48 object-cover" />
                {/* Red region overlay */}
                <div
                  className="absolute border-2 border-destructive rounded-sm"
                  style={{
                    left: `${entry.region.x}%`,
                    top: `${(entry.region.y / 100) * 192}px`,
                    width: `${entry.region.width}%`,
                    height: `${(entry.region.height / 100) * 192}px`,
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                  }}
                />
                <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-primary">
                  {entry.confidence}%
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-display text-foreground">{entry.disease}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(entry.date).toLocaleTimeString()}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entry.drugs.map((d) => (
                    <span key={d.name} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {d.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
