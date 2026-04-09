import { Activity, Shield, Brain, FlaskConical, Database, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: Brain, title: "AI Disease Detection", desc: "Advanced deep learning models analyze CT scans to detect lung cancer, pneumonia, and tuberculosis with high accuracy." },
  { icon: FlaskConical, title: "Drug Discovery", desc: "Automated drug recommendation engine suggests appropriate medications based on detected disease with full chemical details." },
  { icon: Activity, title: "3D Molecule Viewer", desc: "Interactive 3D molecular visualization lets you explore drug structures with rotation and zoom controls." },
  { icon: Shield, title: "Region Highlighting", desc: "Precise disease region identification with red overlay marking on CT scan images for clear visual diagnosis." },
  { icon: Database, title: "Scan History", desc: "Complete history tracking of all uploaded scans, diagnoses, and drug recommendations for patient records." },
  { icon: Users, title: "User Management", desc: "Secure authentication system with individual user accounts and personalized dashboard experience." },
];

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-flex p-3 rounded-2xl medical-gradient mb-4">
          <Activity className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold font-display text-foreground mb-4">
          LungAI Diagnostics
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          An AI-powered platform for lung disease diagnosis and drug discovery. Upload CT scan images and receive instant diagnostic insights with recommended treatments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((f, i) => (
          <Card key={f.title} className="glass-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-display text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card animate-fade-in-up">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold font-display text-foreground mb-4">How It Works</h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Upload CT Scan", desc: "Upload a lung CT scan image in JPG or PNG format." },
              { step: "2", title: "AI Analysis", desc: "Our AI model processes the image and detects disease regions." },
              { step: "3", title: "View Results", desc: "See highlighted disease regions with confidence scores." },
              { step: "4", title: "Drug Discovery", desc: "Explore recommended drugs with 3D molecular structures." },
            ].map((item, i) => (
              <div key={item.step} className="flex items-start gap-4 animate-slide-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="w-10 h-10 rounded-full medical-gradient flex items-center justify-center text-primary-foreground font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-8">
        This is a demonstration platform. All AI predictions are simulated for presentation purposes.
      </p>
    </div>
  );
};

export default AboutPage;
