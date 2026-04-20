import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { sampleScans, getHistory } from "@/lib/mockData";
import { getUser } from "@/lib/auth";
import { Upload, Clock, Activity, AlertTriangle, Wind, Microscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const HISTORY_KEY = "scan_history";

type ScanRecord = {
  id: number;
  timestamp: string;
  filename: string;
  results: {
    lung_cancer: { prediction: string; confidence: number };
    pneumonia: { prediction: string; confidence: number };
    tuberculosis: { prediction: string; confidence: number };
  };
};

const loadScanHistory = (): ScanRecord[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const history = getHistory();

  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  useEffect(() => {
    setScanHistory(loadScanHistory());
  }, []);

  const cancerCount = scanHistory.filter(
    (s) => s.results?.lung_cancer && s.results.lung_cancer.prediction.toLowerCase() !== "normal",
  ).length;
  const pneumoniaCount = scanHistory.filter(
    (s) => s.results?.pneumonia?.prediction === "PNEUMONIA",
  ).length;
  const tbCount = scanHistory.filter((s) => s.results?.tuberculosis?.prediction === "TB").length;

  const summaryStats = [
    {
      label: "Total Scans",
      value: scanHistory.length,
      icon: Activity,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderColor: "border-primary/30",
    },
    {
      label: "Cancer Detected",
      value: cancerCount,
      icon: AlertTriangle,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      borderColor: "border-destructive/30",
    },
    {
      label: "Pneumonia Detected",
      value: pneumoniaCount,
      icon: Wind,
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-500",
      borderColor: "border-orange-500/30",
    },
    {
      label: "TB Detected",
      value: tbCount,
      icon: Microscope,
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
      borderColor: "border-yellow-500/30",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold font-display text-foreground">
          Welcome back, {user?.name || "Doctor"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">AI-powered lung disease diagnosis and drug discovery</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass-card animate-fade-in-up">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload CTA */}
      <Card className="medical-gradient text-primary-foreground mb-8 overflow-hidden relative animate-fade-in-up">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold font-display mb-2">Upload CT Scan</h2>
            <p className="opacity-90">Upload a lung CT scan image to get instant AI-powered disease detection and drug recommendations.</p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate("/upload")}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 shrink-0"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Scan
          </Button>
        </CardContent>
      </Card>

      {/* Sample CT Scans */}
      <div className="mb-8">
        <h2 className="text-xl font-bold font-display text-foreground mb-4">Sample CT Scans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sampleScans.map((scan, i) => (
            <Card key={scan.id} className="glass-card overflow-hidden group cursor-pointer hover:shadow-xl transition-all animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="relative overflow-hidden">
                <img
                  src={scan.src}
                  alt={scan.label}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  width={512}
                  height={512}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-foreground">{scan.label}</p>
                <p className="text-xs text-muted-foreground">High-resolution medical imaging</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-foreground">Recent Results</h2>
            <Button variant="ghost" onClick={() => navigate("/history")} className="text-primary">
              <Clock className="w-4 h-4 mr-1" /> View All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.slice(0, 3).map((entry, i) => (
              <Card key={entry.id} className="glass-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="p-4 flex gap-4">
                  <img src={entry.imageUrl} alt="Scan" className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p className="font-semibold text-foreground">{entry.disease}</p>
                    <p className="text-sm text-primary">{entry.confidence}% confidence</p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
