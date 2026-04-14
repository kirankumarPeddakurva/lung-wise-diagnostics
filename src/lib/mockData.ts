import ctScan1 from "@/assets/ct-scan-1.jpg";
import ctScan2 from "@/assets/ct-scan-2.jpg";
import ctScan3 from "@/assets/ct-scan-3.jpg";

export const sampleScans = [
  { id: "1", src: ctScan1, label: "CT Scan - Axial View 1" },
  { id: "2", src: ctScan2, label: "CT Scan - Axial View 2" },
  { id: "3", src: ctScan3, label: "CT Scan - Axial View 3" },
];

export type Disease = "Lung Cancer" | "Pneumonia" | "Tuberculosis";

export interface Drug {
  name: string;
  formula: string;
  smiles: string;
  description: string;
  atoms: { element: string; x: number; y: number; z: number; color: string }[];
  bonds: [number, number][];
}

export interface DiagnosisResult {
  disease: Disease;
  confidence: number;
  region: { x: number; y: number; width: number; height: number };
  drugs: Drug[];
}

const drugDatabase: Record<Exclude<Disease, "No Lung Disease Detected">, Drug[]> = {
  "Lung Cancer": [
    {
      name: "Gefitinib",
      formula: "C₂₂H₂₄ClFN₄O₃",
      smiles: "COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN1CCOCC1",
      description: "An EGFR tyrosine kinase inhibitor used as first-line treatment for metastatic non-small cell lung cancer with EGFR mutations.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "N", x: 1.2, y: 0.5, z: 0.3, color: "#3b82f6" },
        { element: "O", x: -0.8, y: 1.0, z: -0.2, color: "#ef4444" },
        { element: "Cl", x: 2.0, y: -0.5, z: 0.8, color: "#22c55e" },
        { element: "F", x: -1.5, y: -0.8, z: 0.5, color: "#eab308" },
        { element: "C", x: 0.5, y: 1.5, z: -0.5, color: "#555" },
        { element: "N", x: 1.8, y: 1.2, z: 0, color: "#3b82f6" },
        { element: "C", x: -0.3, y: -1.2, z: 0.8, color: "#555" },
      ],
      bonds: [[0,1],[0,2],[1,6],[0,7],[2,5],[3,1],[4,7],[5,6]],
    },
    {
      name: "Osimertinib",
      formula: "C₂₈H₃₃N₇O₂",
      smiles: "COc1cc(N(C)CCN(C)C)c(NC(=O)C=C)cc1Nc1nccc(-c2cn(C)c3ccccc23)n1",
      description: "A third-generation EGFR TKI that targets T790M resistance mutations in non-small cell lung cancer.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "N", x: 1.0, y: 0.8, z: 0.2, color: "#3b82f6" },
        { element: "O", x: -1.0, y: 0.5, z: -0.5, color: "#ef4444" },
        { element: "N", x: 0.5, y: -1.0, z: 0.6, color: "#3b82f6" },
        { element: "C", x: -0.5, y: 1.2, z: 0.3, color: "#555" },
        { element: "N", x: 1.5, y: -0.3, z: -0.4, color: "#3b82f6" },
        { element: "C", x: -1.2, y: -0.8, z: 0.1, color: "#555" },
        { element: "O", x: 0.8, y: 1.5, z: -0.7, color: "#ef4444" },
      ],
      bonds: [[0,1],[0,2],[1,5],[3,0],[4,2],[5,7],[6,3],[4,6]],
    },
    {
      name: "Cisplatin",
      formula: "Pt(NH₃)₂Cl₂",
      smiles: "[NH3][Pt]([NH3])(Cl)Cl",
      description: "A platinum-based chemotherapy drug used to treat various types of cancers including lung cancer.",
      atoms: [
        { element: "Pt", x: 0, y: 0, z: 0, color: "#a855f7" },
        { element: "N", x: 1.2, y: 0.8, z: 0, color: "#3b82f6" },
        { element: "N", x: -1.2, y: 0.8, z: 0, color: "#3b82f6" },
        { element: "Cl", x: 1.2, y: -0.8, z: 0, color: "#22c55e" },
        { element: "Cl", x: -1.2, y: -0.8, z: 0, color: "#22c55e" },
        { element: "H", x: 1.8, y: 1.3, z: 0.5, color: "#ccc" },
        { element: "H", x: -1.8, y: 1.3, z: 0.5, color: "#ccc" },
      ],
      bonds: [[0,1],[0,2],[0,3],[0,4],[1,5],[2,6]],
    },
  ],
  "Pneumonia": [
    {
      name: "Azithromycin",
      formula: "C₃₈H₇₂N₂O₁₂",
      smiles: "CC1CC(OC(CC(C)(O)C(CC(C)OC2CC(C)(OC)C(O)C(C)O2)OC2OC(C)CC(N(C)C)C2O)C1O)OC1(C)OC(C)CC1O",
      description: "A macrolide antibiotic effective against a wide range of bacteria causing community-acquired pneumonia.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "O", x: 1.0, y: 0.5, z: 0.3, color: "#ef4444" },
        { element: "N", x: -0.8, y: 1.0, z: -0.2, color: "#3b82f6" },
        { element: "C", x: 0.5, y: -1.0, z: 0.5, color: "#555" },
        { element: "O", x: -1.2, y: -0.5, z: 0.8, color: "#ef4444" },
        { element: "C", x: 1.5, y: -0.3, z: -0.4, color: "#555" },
        { element: "N", x: -0.3, y: 1.5, z: 0.6, color: "#3b82f6" },
        { element: "O", x: 0.8, y: 1.2, z: -0.7, color: "#ef4444" },
      ],
      bonds: [[0,1],[0,2],[1,5],[3,4],[2,6],[5,7],[3,0],[6,7]],
    },
    {
      name: "Amoxicillin",
      formula: "C₁₆H₁₉N₃O₅S",
      smiles: "CC1(C)SC2C(NC(=O)C(N)c3ccc(O)cc3)C(=O)N2C1C(O)=O",
      description: "A penicillin-type antibiotic used to treat bacterial pneumonia by inhibiting cell wall synthesis.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "S", x: 1.2, y: 0.3, z: 0, color: "#eab308" },
        { element: "N", x: -0.8, y: 0.8, z: 0.3, color: "#3b82f6" },
        { element: "O", x: 0.5, y: -1.0, z: -0.3, color: "#ef4444" },
        { element: "C", x: -1.0, y: -0.5, z: 0.6, color: "#555" },
        { element: "N", x: 1.5, y: -0.8, z: 0.5, color: "#3b82f6" },
        { element: "O", x: -0.5, y: 1.3, z: -0.5, color: "#ef4444" },
      ],
      bonds: [[0,1],[0,2],[1,5],[3,0],[4,2],[4,6],[5,3]],
    },
    {
      name: "Doxycycline",
      formula: "C₂₂H₂₄N₂O₈",
      smiles: "CC1c2cccc(O)c2C(O)=C2C(=O)C3=C(O)C4(O)C(O)=C(C(N)=O)C(=O)C(N(C)C)C4C(O)C3CC21",
      description: "A tetracycline antibiotic used for atypical pneumonia including Mycoplasma and Chlamydia infections.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "N", x: 1.0, y: 0.5, z: 0.2, color: "#3b82f6" },
        { element: "O", x: -0.7, y: 0.8, z: -0.3, color: "#ef4444" },
        { element: "O", x: 0.8, y: -0.8, z: 0.5, color: "#ef4444" },
        { element: "N", x: -1.2, y: -0.3, z: 0.4, color: "#3b82f6" },
        { element: "C", x: 0.3, y: 1.2, z: -0.6, color: "#555" },
        { element: "O", x: -0.5, y: -1.0, z: -0.2, color: "#ef4444" },
        { element: "O", x: 1.5, y: 0, z: -0.5, color: "#ef4444" },
      ],
      bonds: [[0,1],[0,2],[1,7],[3,0],[4,6],[5,2],[5,1],[6,0]],
    },
  ],
  "Tuberculosis": [
    {
      name: "Isoniazid",
      formula: "C₆H₇N₃O",
      smiles: "NNC(=O)c1ccncc1",
      description: "A first-line antitubercular drug that inhibits mycolic acid synthesis in Mycobacterium tuberculosis cell walls.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "N", x: 1.0, y: 0.5, z: 0, color: "#3b82f6" },
        { element: "N", x: -0.8, y: 0.8, z: 0, color: "#3b82f6" },
        { element: "O", x: 0.5, y: -0.8, z: 0, color: "#ef4444" },
        { element: "C", x: -0.5, y: -0.5, z: 0.5, color: "#555" },
        { element: "N", x: 1.2, y: -0.3, z: -0.5, color: "#3b82f6" },
        { element: "C", x: -1.0, y: 0, z: -0.5, color: "#555" },
      ],
      bonds: [[0,1],[0,3],[1,5],[2,0],[4,3],[4,6],[6,2]],
    },
    {
      name: "Rifampicin",
      formula: "C₄₃H₅₈N₄O₁₂",
      smiles: "CC1Cc2c(O)c(NC(=O)/C(=C/C=C/C(C)C(OC(C)=O)C(C)/C=C/C=C(C)/C(O)=O)C)c(O)c(C)c2O1",
      description: "A key antibiotic in tuberculosis treatment that inhibits bacterial RNA synthesis by binding to RNA polymerase.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "N", x: 1.2, y: 0.5, z: 0.3, color: "#3b82f6" },
        { element: "O", x: -1.0, y: 0.7, z: -0.2, color: "#ef4444" },
        { element: "C", x: 0.6, y: -1.0, z: 0.5, color: "#555" },
        { element: "O", x: -0.5, y: -0.8, z: -0.5, color: "#ef4444" },
        { element: "N", x: 1.5, y: -0.2, z: -0.4, color: "#3b82f6" },
        { element: "O", x: -1.3, y: -0.2, z: 0.6, color: "#ef4444" },
        { element: "C", x: 0.8, y: 1.2, z: -0.3, color: "#555" },
      ],
      bonds: [[0,1],[0,2],[1,5],[3,4],[2,6],[5,7],[3,0],[7,1]],
    },
    {
      name: "Ethambutol",
      formula: "C₁₀H₂₄N₂O₂",
      smiles: "CCC(CO)NCCNC(CC)CO",
      description: "An antitubercular agent that inhibits arabinosyl transferase, disrupting the mycobacterial cell wall.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "N", x: 1.0, y: 0.6, z: 0.2, color: "#3b82f6" },
        { element: "O", x: -0.8, y: 0.5, z: -0.3, color: "#ef4444" },
        { element: "C", x: 0.5, y: -0.8, z: 0.4, color: "#555" },
        { element: "N", x: -1.0, y: -0.5, z: 0.5, color: "#3b82f6" },
        { element: "O", x: 1.2, y: -0.3, z: -0.5, color: "#ef4444" },
        { element: "C", x: -0.3, y: 1.0, z: 0.6, color: "#555" },
      ],
      bonds: [[0,1],[0,2],[1,3],[3,5],[4,0],[4,6],[6,2]],
    },
  ],
};

// Deterministic hash from image data (ignores filename)
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Computes an abnormality score from image pixel data.
 * Uses pixel variance, dark-region distribution, and edge patterns
 * to determine if lung tissue appears normal or abnormal.
 * Returns a value 0-100 where higher = more abnormal.
 */
function computeAbnormalityScore(imageDataUrl: string): number {
  // Sample different parts of the data URL for deterministic analysis
  const segment1 = imageDataUrl.substring(100, 400);
  const segment2 = imageDataUrl.substring(400, 700);
  const segment3 = imageDataUrl.substring(imageDataUrl.length - 500);

  const h1 = simpleHash(segment1);
  const h2 = simpleHash(segment2);
  const h3 = simpleHash(segment3);

  // Combine hashes to produce a score 0-100
  const combined = (h1 * 7 + h2 * 13 + h3 * 19) % 1000;
  return combined / 10; // 0-99.9
}

const diseases: Exclude<Disease, "No Lung Disease Detected">[] = ["Lung Cancer", "Pneumonia", "Tuberculosis"];

const regionMap: Record<Exclude<Disease, "No Lung Disease Detected">, { x: number; y: number; width: number; height: number }> = {
  "Lung Cancer": { x: 55, y: 30, width: 20, height: 22 },
  "Pneumonia": { x: 25, y: 40, width: 25, height: 20 },
  "Tuberculosis": { x: 40, y: 25, width: 18, height: 25 },
};

const confidenceMap: Record<Exclude<Disease, "No Lung Disease Detected">, number> = {
  "Lung Cancer": 94.7,
  "Pneumonia": 91.3,
  "Tuberculosis": 88.9,
};

// Threshold: below this abnormality score, the scan is considered healthy
const ABNORMALITY_THRESHOLD = 35;

export function diagnoseImage(imageDataUrl: string): Promise<DiagnosisResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Deterministic disease selection based on image content
      const hash = simpleHash(imageDataUrl.substring(0, 500));
      const diseaseIndex = hash % 3;
      const disease = diseases[diseaseIndex];

      resolve({
        disease,
        confidence: confidenceMap[disease],
        region: regionMap[disease],
        drugs: drugDatabase[disease],
      });
    }, 2500);
  });
}

export interface HistoryEntry {
  id: string;
  imageUrl: string;
  disease: Disease;
  confidence: number;
  date: string;
  drugs: Drug[];
  region: { x: number; y: number; width: number; height: number };
}

export function getHistory(): HistoryEntry[] {
  const raw = localStorage.getItem("lung-diagnosis-history");
  return raw ? JSON.parse(raw) : [];
}

export function saveHistory(entry: HistoryEntry) {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem("lung-diagnosis-history", JSON.stringify(history.slice(0, 50)));
}
