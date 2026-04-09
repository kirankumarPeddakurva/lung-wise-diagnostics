import { useState, useRef } from "react";
import { diagnoseImage, saveHistory, type DiagnosisResult } from "@/lib/mockData";
import MoleculeViewer from "@/components/MoleculeViewer";
import { Upload, Loader2, AlertTriangle, FlaskConical, Atom, ChevronDown, ChevronUp, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VALID_KEYWORDS = ["lung", "ct", "scan", "chest", "thorax", "pulmonary", "dicom"];

const validateLungCTScan = (fileName: string): boolean => {
  const lower = fileName.toLowerCase();
  return VALID_KEYWORDS.some((kw) => lower.includes(kw));
};

const UploadResults = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [expandedDrug, setExpandedDrug] = useState<number | null>(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setValidationError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageUrl(dataUrl);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const runDiagnosis = async () => {
    if (!imageUrl) return;

    // Mock AI validation step
    if (!validateLungCTScan(fileName)) {
      setValidationError("Invalid image. Please upload a valid lung CT scan image.");
      return;
    }

    setValidationError(null);
    setLoading(true);
    const res = await diagnoseImage(imageUrl);
    setResult(res);
    setLoading(false);
    setExpandedDrug(0);

    saveHistory({
      id: Date.now().toString(),
      imageUrl,
      disease: res.disease,
      confidence: res.confidence,
      date: new Date().toISOString(),
      drugs: res.drugs,
      region: res.region,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold font-display text-foreground mb-2 animate-fade-in-up">
        CT Scan Analysis
      </h1>
      <p className="text-muted-foreground mb-8 animate-fade-in-up">Upload a lung CT scan for AI-powered diagnosis</p>

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
                <div className="relative">
                  <img src={imageUrl} alt="Uploaded CT Scan" className="w-full" />
                  {/* Red mark overlay */}
                  {result && (
                    <div
                      className="absolute border-2 border-destructive rounded-md animate-pulse"
                      style={{
                        left: `${result.region.x}%`,
                        top: `${result.region.y}%`,
                        width: `${result.region.width}%`,
                        height: `${result.region.height}%`,
                        backgroundColor: "rgba(239, 68, 68, 0.25)",
                        boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)",
                      }}
                    >
                      <span className="absolute -top-6 left-0 text-xs font-bold text-destructive bg-card/90 px-2 py-0.5 rounded">
                        {result.disease}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex gap-3">
                  <Button onClick={runDiagnosis} disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                      </>
                    ) : result ? (
                      "Re-analyze"
                    ) : (
                      "Run AI Diagnosis"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setImageUrl(null); setResult(null); }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnosis Result */}
          {result && (
            <Card className="glass-card animate-fade-in-up">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-display text-foreground">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Diagnosis Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div>
                    <p className="text-sm text-muted-foreground">Detected Disease</p>
                    <p className="text-xl font-bold text-destructive">{result.disease}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-xl font-bold text-primary">{result.confidence}%</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full medical-gradient rounded-full transition-all duration-1000"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Affected region highlighted in red on the scan image. Region: ({result.region.x}%, {result.region.y}%) - ({result.region.width}%×{result.region.height}%)
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Drug Discovery Panel */}
        {result && (
          <div className="space-y-4 animate-slide-in">
            <h2 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              Drug Recommendations
            </h2>
            <p className="text-sm text-muted-foreground">
              Suggested drugs for <span className="text-primary font-medium">{result.disease}</span>
            </p>

            {result.drugs.map((drug, i) => (
              <Card key={drug.name} className="glass-card overflow-hidden">
                <button
                  onClick={() => setExpandedDrug(expandedDrug === i ? null : i)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Atom className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{drug.name}</p>
                      <p className="text-xs text-muted-foreground">{drug.formula}</p>
                    </div>
                  </div>
                  {expandedDrug === i ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedDrug === i && (
                  <CardContent className="pt-0 pb-4 px-4 space-y-4 animate-fade-in-up">
                    <p className="text-sm text-muted-foreground">{drug.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Chemical Formula</p>
                        <p className="text-sm font-mono font-semibold text-foreground">{drug.formula}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs font-medium text-muted-foreground mb-1">SMILES Notation</p>
                        <p className="text-xs font-mono text-foreground break-all">{drug.smiles}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">3D Molecule Structure</p>
                      <MoleculeViewer drug={drug} />
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {!result && !loading && imageUrl && (
          <div className="flex items-center justify-center text-center p-12">
            <div>
              <Atom className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Click "Run AI Diagnosis" to analyze the scan</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
              <p className="text-foreground font-medium">Analyzing CT Scan...</p>
              <p className="text-sm text-muted-foreground">Running AI disease detection model</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResults;
