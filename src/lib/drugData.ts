import type { Drug } from "@/lib/mockData";

export type DrugDisease = "Lung Cancer" | "Pneumonia" | "Tuberculosis";

export const drugCategoryMap: Record<string, string> = {
  Gefitinib: "EGFR Inhibitor",
  Osimertinib: "EGFR Inhibitor",
  Cisplatin: "Chemotherapy",
  Azithromycin: "Macrolide",
  Amoxicillin: "Penicillin",
  Doxycycline: "Tetracycline",
  Isoniazid: "Antitubercular",
  Rifampicin: "Antitubercular",
  Ethambutol: "Antitubercular",
};

export const drugDatabase: Record<DrugDisease, Drug[]> = {
  "Lung Cancer": [
    {
      name: "Gefitinib",
      formula: "C₂₂H₂₄ClFN₄O₃",
      smiles: "COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN1CCOCC1",
      description:
        "An EGFR tyrosine kinase inhibitor used as first-line treatment for metastatic non-small cell lung cancer with EGFR mutations.",
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
      bonds: [[0, 1], [0, 2], [1, 6], [0, 7], [2, 5], [3, 1], [4, 7], [5, 6]],
    },
    {
      name: "Osimertinib",
      formula: "C₂₈H₃₃N₇O₂",
      smiles: "COc1cc(N(C)CCN(C)C)c(NC(=O)C=C)cc1Nc1nccc(-c2cn(C)c3ccccc23)n1",
      description:
        "A third-generation EGFR TKI that targets T790M resistance mutations in non-small cell lung cancer.",
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
      bonds: [[0, 1], [0, 2], [1, 5], [3, 0], [4, 2], [5, 7], [6, 3], [4, 6]],
    },
    {
      name: "Cisplatin",
      formula: "Pt(NH₃)₂Cl₂",
      smiles: "[NH3][Pt]([NH3])(Cl)Cl",
      description:
        "A platinum-based chemotherapy drug used to treat various types of cancers including lung cancer.",
      atoms: [
        { element: "Pt", x: 0, y: 0, z: 0, color: "#a855f7" },
        { element: "N", x: 1.2, y: 0.8, z: 0, color: "#3b82f6" },
        { element: "N", x: -1.2, y: 0.8, z: 0, color: "#3b82f6" },
        { element: "Cl", x: 1.2, y: -0.8, z: 0, color: "#22c55e" },
        { element: "Cl", x: -1.2, y: -0.8, z: 0, color: "#22c55e" },
        { element: "H", x: 1.8, y: 1.3, z: 0.5, color: "#ccc" },
        { element: "H", x: -1.8, y: 1.3, z: 0.5, color: "#ccc" },
      ],
      bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 6]],
    },
  ],
  Pneumonia: [
    {
      name: "Azithromycin",
      formula: "C₃₈H₇₂N₂O₁₂",
      smiles:
        "CC1CC(OC(CC(C)(O)C(CC(C)OC2CC(C)(OC)C(O)C(C)O2)OC2OC(C)CC(N(C)C)C2O)C1O)OC1(C)OC(C)CC1O",
      description:
        "A macrolide antibiotic effective against a wide range of bacteria causing community-acquired pneumonia.",
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
      bonds: [[0, 1], [0, 2], [1, 5], [3, 4], [2, 6], [5, 7], [3, 0], [6, 7]],
    },
    {
      name: "Amoxicillin",
      formula: "C₁₆H₁₉N₃O₅S",
      smiles: "CC1(C)SC2C(NC(=O)C(N)c3ccc(O)cc3)C(=O)N2C1C(O)=O",
      description:
        "A penicillin-type antibiotic used to treat bacterial pneumonia by inhibiting cell wall synthesis.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "S", x: 1.2, y: 0.3, z: 0, color: "#eab308" },
        { element: "N", x: -0.8, y: 0.8, z: 0.3, color: "#3b82f6" },
        { element: "O", x: 0.5, y: -1.0, z: -0.3, color: "#ef4444" },
        { element: "C", x: -1.0, y: -0.5, z: 0.6, color: "#555" },
        { element: "N", x: 1.5, y: -0.8, z: 0.5, color: "#3b82f6" },
        { element: "O", x: -0.5, y: 1.3, z: -0.5, color: "#ef4444" },
      ],
      bonds: [[0, 1], [0, 2], [1, 5], [3, 0], [4, 2], [4, 6], [5, 3]],
    },
    {
      name: "Doxycycline",
      formula: "C₂₂H₂₄N₂O₈",
      smiles:
        "CC1c2cccc(O)c2C(O)=C2C(=O)C3=C(O)C4(O)C(O)=C(C(N)=O)C(=O)C(N(C)C)C4C(O)C3CC21",
      description:
        "A tetracycline antibiotic used for atypical pneumonia including Mycoplasma and Chlamydia infections.",
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
      bonds: [[0, 1], [0, 2], [1, 7], [3, 0], [4, 6], [5, 2], [5, 1], [6, 0]],
    },
  ],
  Tuberculosis: [
    {
      name: "Isoniazid",
      formula: "C₆H₇N₃O",
      smiles: "NNC(=O)c1ccncc1",
      description:
        "A first-line antitubercular drug that inhibits mycolic acid synthesis in Mycobacterium tuberculosis cell walls.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "N", x: 1.0, y: 0.5, z: 0, color: "#3b82f6" },
        { element: "N", x: -0.8, y: 0.8, z: 0, color: "#3b82f6" },
        { element: "O", x: 0.5, y: -0.8, z: 0, color: "#ef4444" },
        { element: "C", x: -0.5, y: -0.5, z: 0.5, color: "#555" },
        { element: "N", x: 1.2, y: -0.3, z: -0.5, color: "#3b82f6" },
        { element: "C", x: -1.0, y: 0, z: -0.5, color: "#555" },
      ],
      bonds: [[0, 1], [0, 3], [1, 5], [2, 0], [4, 3], [4, 6], [6, 2]],
    },
    {
      name: "Rifampicin",
      formula: "C₄₃H₅₈N₄O₁₂",
      smiles:
        "CC1Cc2c(O)c(NC(=O)/C(=C/C=C/C(C)C(OC(C)=O)C(C)/C=C/C=C(C)/C(O)=O)C)c(O)c(C)c2O1",
      description:
        "A key antibiotic in tuberculosis treatment that inhibits bacterial RNA synthesis by binding to RNA polymerase.",
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
      bonds: [[0, 1], [0, 2], [1, 5], [3, 4], [2, 6], [5, 7], [3, 0], [7, 1]],
    },
    {
      name: "Ethambutol",
      formula: "C₁₀H₂₄N₂O₂",
      smiles: "CCC(CO)NCCNC(CC)CO",
      description:
        "An antitubercular agent that inhibits arabinosyl transferase, disrupting the mycobacterial cell wall.",
      atoms: [
        { element: "C", x: 0, y: 0, z: 0, color: "#555" },
        { element: "N", x: 1.0, y: 0.6, z: 0.2, color: "#3b82f6" },
        { element: "O", x: -0.8, y: 0.5, z: -0.3, color: "#ef4444" },
        { element: "C", x: 0.5, y: -0.8, z: 0.4, color: "#555" },
        { element: "N", x: -1.0, y: -0.5, z: 0.5, color: "#3b82f6" },
        { element: "O", x: 1.2, y: -0.3, z: -0.5, color: "#ef4444" },
        { element: "C", x: -0.3, y: 1.0, z: 0.6, color: "#555" },
      ],
      bonds: [[0, 1], [0, 2], [1, 3], [3, 5], [4, 0], [4, 6], [6, 2]],
    },
  ],
};
