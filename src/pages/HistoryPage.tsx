import { useState, useEffect } from "react";
import { Clock, Trash2, FileImage, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { cleanCancerLabel } from "@/pages/UploadResults";

const HISTORY_KEY = "scan_history";

type DiseaseResult = {
  prediction: string;
  confidence: number;
  all_scores?: Record<string, number>;
};

type ScanRecord = {
  id: number;
  timestamp: string;
  filename: string;
  results: {
    lung_cancer: DiseaseResult;
    pneumonia: DiseaseResult;
    tuberculosis: DiseaseResult;
  };
};

type DiseaseKey = keyof ScanRecord["results"];

const DISEASE_LABELS: Record<DiseaseKey, string> = {
  lung_cancer: "Lung Cancer",
  pneumonia: "Pneumonia",
  tuberculosis: "Tuberculosis",
};

const NORMAL_VALUES: Record<DiseaseKey, string[]> = {
  lung_cancer: ["normal"],
  pneumonia: ["NORMAL", "normal"],
  tuberculosis: ["Normal", "normal"],
};

const isNormal = (key: DiseaseKey, prediction: string) =>
  NORMAL_VALUES[key].some((n) => n.toLowerCase() === prediction.toLowerCase());

const formatPrediction = (key: DiseaseKey, prediction: string) => {
  if (key === "lung_cancer") return cleanCancerLabel(prediction);
  return prediction.charAt(0).toUpperCase() + prediction.slice(1).toLowerCase();
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${date} at ${time}`;
};

const loadHistory = (): ScanRecord[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const HistoryPage = () => {
  const [history, setHistory] = useState<ScanRecord[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const sorted = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const deleteOne = (id: number) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const clearAll = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Scan History</h1>
          <p className="text-muted-foreground mt-1">
            {sorted.length} previous scan{sorted.length !== 1 ? "s" : ""}
          </p>
        </div>
        {sorted.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear All History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all scan history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {sorted.length} saved scan result
                  {sorted.length !== 1 ? "s" : ""}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearAll}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 animate-fade-in-up">
          <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No scans yet. Upload a CT scan to get started.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)] pr-4">
          <div className="space-y-4">
            {sorted.map((entry, i) => (
              <Card
                key={entry.id}
                className="glass-card animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="text-base font-display text-foreground flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{entry.filename}</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(entry.timestamp)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteOne(entry.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      aria-label="Delete scan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(DISEASE_LABELS) as DiseaseKey[]).map((key) => {
                      const r = entry.results?.[key];
                      if (!r) return null;
                      const normal = isNormal(key, r.prediction);
                      const conf = Math.max(0, Math.min(100, Number(r.confidence) || 0));
                      return (
                        <div
                          key={key}
                          className={cn(
                            "rounded-lg border p-3 space-y-2",
                            normal ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5",
                          )}
                        >
                          <p className="text-xs font-medium text-muted-foreground">
                            {DISEASE_LABELS[key]}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <Badge
                              className={cn(
                                "gap-1",
                                normal
                                  ? "bg-success text-success-foreground hover:bg-success/90"
                                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                              )}
                            >
                              {normal ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              <span className="truncate max-w-[120px]">
                                {formatPrediction(key, r.prediction)}
                              </span>
                            </Badge>
                            <span className="text-xs font-mono text-foreground shrink-0">
                              {conf.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default HistoryPage;
