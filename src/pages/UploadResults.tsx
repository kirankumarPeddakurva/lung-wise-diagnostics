import { useState, useRef } from "react";
import { Upload, Loader2, AlertTriangle, XCircle, ScanSearch, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const API_URL = "https://amenity-appendage-herbs.ngrok-free.dev/predict";
const HISTORY_KEY = "scan_history";

type DiseaseResult = {
  prediction: string;
  confidence: number;
  all_scores?: Record<string, number>;
};

type PredictionResponse = {
  lung_cancer: DiseaseResult;
  pneumonia: DiseaseResult;
  tuberculosis: DiseaseResult;
};

const DISEASE_META: Record<keyof PredictionResponse, { title: string; normalLabels: string[] }> = {
  lung_cancer: { title: "Lung Cancer Analysis", normalLabels: ["normal", "benign", "no cancer"] },
  pneumonia: { title: "Pneumonia Analysis", normalLabels: ["normal", "no pneumonia"] },
  tuberculosis: { title: "Tuberculosis Analysis", normalLabels: ["normal", "no tb", "no tuberculosis"] },
};

const isNormal = (key: keyof PredictionResponse, prediction: string) => {
  const p = prediction.toLowerCase().trim();
  return DISEASE_META[key].normalLabels.some((n) => p === n || p.includes(n));
};

/**
 * Cleans up lung-cancer class names like
 *   "squamous.cell.carcinoma_left.hilum_T1_N2_M0_IIIa"
 * into a friendly display label like "Squamous Cell Carcinoma".
 */
export const cleanCancerLabel = (raw: string): string => {
  if (!raw) return raw;
  const lower = raw.toLowerCase();
  if (lower === "normal") return "Normal";
  if (lower.startsWith("squamous")) return "Squamous Cell Carcinoma";
  if (lower.startsWith("adenocarcinoma")) return "Adenocarcinoma";
  if (lower.startsWith("large")) return "Large Cell Carcinoma";
  // Generic fallback: take portion before first "_", replace dots with spaces, title-case
  const base = raw.split("_")[0].replace(/\./g, " ");
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatLabel = (key: keyof PredictionResponse, label: string): string => {
  if (key === "lung_cancer") return cleanCancerLabel(label);
  return label;
};

const saveToHistory = (filename: string, results: PredictionResponse) => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      filename,
      results,
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save scan to history:", e);
  }
};

const UploadResults = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PredictionResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setApiError(null);
    setImageFile(file);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (e) => setImageUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const runDiagnosis = async () => {
    if (!imageFile) return;
    setApiError(null);
    setResults(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(
        "https://amenity-appendage-herbs.ngrok-free.dev/predict",
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true"
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data: PredictionResponse = await response.json();
      setResults(data);
      saveToHistory(imageFile.name, data);
    } catch (err) {
      console.error("Prediction API error:", err);
      setApiError(
        "Unable to connect to analysis server. Make sure the backend is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setImageFile(null);
    setImageUrl(null);
    setResults(null);
    setApiError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-display text-foreground mb-2 animate-fade-in-up">
        CT Scan Analysis
      </h1>
      <p className="text-muted-foreground mb-8 animate-fade-in-up">
        Upload a lung CT scan for AI-powered diagnosis (Cancer, Pneumonia, TB)
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload area */}
        <div className="space-y-6 animate-fade-in-up">
          {!imageUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
            >
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">Drop CT scan here</p>
              <p className="text-sm text-muted-foreground">or click to browse (JPG/PNG)</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0">
                <img src={imageUrl} alt="Uploaded CT Scan" className="w-full" />
                <div className="p-4 flex gap-3">
                  <Button onClick={runDiagnosis} disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing CT scan with AI...
                      </>
                    ) : results ? (
                      "Re-analyze"
                    ) : (
                      "Run AI Diagnosis"
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearAll}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {apiError && (
            <Alert variant="destructive" className="animate-fade-in-up">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <Card className="glass-card animate-fade-in-up">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <ScanSearch className="w-12 h-12 text-primary animate-pulse mb-3" />
                <p className="text-foreground font-medium">Analyzing CT scan with AI...</p>
                <p className="text-sm text-muted-foreground">
                  Running deep learning models on the FastAPI backend
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results panel */}
        <div className="space-y-4 animate-slide-in">
          {results ? (
            <>
              <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Diagnosis Results
              </h2>
              <p className="text-sm text-muted-foreground">
                Predictions from three independent models
              </p>

              {(Object.keys(DISEASE_META) as (keyof PredictionResponse)[]).map((key) => {
                const r = results[key];
                if (!r) return null;
                const normal = isNormal(key, r.prediction);
                const confidence = Math.max(0, Math.min(100, Number(r.confidence) || 0));
                const displayPrediction = formatLabel(key, r.prediction);

                return (
                  <Card
                    key={key}
                    className={cn(
                      "glass-card border-2 transition-all",
                      normal ? "border-success/60" : "border-destructive/60",
                    )}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between font-display text-foreground">
                        <span className="flex items-center gap-2">
                          {normal ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          )}
                          {DISEASE_META[key].title}
                        </span>
                        <Badge
                          className={cn(
                            normal
                              ? "bg-success text-success-foreground hover:bg-success/90"
                              : "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                          )}
                        >
                          {normal ? "Normal" : "Detected"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Prediction</p>
                        <p
                          className={cn(
                            "text-2xl font-bold",
                            normal ? "text-success" : "text-destructive",
                          )}
                        >
                          {displayPrediction}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <p className="text-sm font-semibold text-foreground">
                            {confidence.toFixed(1)}%
                          </p>
                        </div>
                        <Progress value={confidence} className="h-2" />
                      </div>

                      {r.all_scores && Object.keys(r.all_scores).length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            All class scores
                          </p>
                          <div className="space-y-1.5">
                            {Object.entries(r.all_scores).map(([label, score]) => {
                              const s = Math.max(0, Math.min(100, Number(score) || 0));
                              return (
                                <div key={label} className="flex items-center gap-2 text-xs">
                                  <span className="w-32 truncate text-muted-foreground">
                                    {formatLabel(key, label)}
                                  </span>
                                  <Progress value={s} className="h-1.5 flex-1" />
                                  <span className="w-12 text-right font-mono text-foreground">
                                    {s.toFixed(1)}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </>
          ) : (
            !loading &&
            !apiError && (
              <div className="flex items-center justify-center text-center p-12 h-full">
                <div>
                  <Activity className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {imageUrl
                      ? 'Click "Run AI Diagnosis" to analyze the scan'
                      : "Upload a CT scan to get started"}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadResults;
