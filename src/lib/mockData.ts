// mockData.ts — Nusantara Coffee Export Platform
// Simulated data untuk UI sebelum backend tersedia (Milestone 2)

export interface CoffeeDocument {
  id: string;
  title: string;
  type: "Certificate" | "Invoice" | "Phytosanitary" | "ICO Certificate" | "Bill of Lading";
  status: "Verified" | "Pending" | "Rejected";
  origin: string;
  grade: string;
  uploadedAt: string;
  sizeKB: number;
  uploader: string;
}

export interface CoffeeVariety {
  id: string;
  name: string;
  region: string;
  altitude: string;
  notes: string;
  scaScore: number;
  stockKg: number;
  priceUSDperKg: number;
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

export const mockDocuments: CoffeeDocument[] = [
  {
    id: "DOC-001",
    title: "Gayo Arabica Grade 1 — Health Certificate",
    type: "Certificate",
    status: "Verified",
    origin: "Aceh, Sumatra",
    grade: "Grade 1",
    uploadedAt: "2026-10-01",
    sizeKB: 248,
    uploader: "Kelompok 7",
  },
  {
    id: "DOC-002",
    title: "Toraja Kalosi — ICO Certificate Oct 2026",
    type: "ICO Certificate",
    status: "Verified",
    origin: "South Sulawesi",
    grade: "Grade 1",
    uploadedAt: "2026-10-03",
    sizeKB: 512,
    uploader: "Kelompok 7",
  },
  {
    id: "DOC-003",
    title: "Java Preanger — Phytosanitary Certificate",
    type: "Phytosanitary",
    status: "Pending",
    origin: "West Java",
    grade: "Grade 2",
    uploadedAt: "2026-10-07",
    sizeKB: 180,
    uploader: "Kelompok 7",
  },
  {
    id: "DOC-004",
    title: "Bali Kintamani — Export Invoice #INV-2026-041",
    type: "Invoice",
    status: "Verified",
    origin: "Bali",
    grade: "Grade 1",
    uploadedAt: "2026-10-08",
    sizeKB: 95,
    uploader: "Kelompok 7",
  },
  {
    id: "DOC-005",
    title: "Flores Bajawa — Bill of Lading",
    type: "Bill of Lading",
    status: "Rejected",
    origin: "East Nusa Tenggara",
    grade: "Grade 2",
    uploadedAt: "2026-10-09",
    sizeKB: 320,
    uploader: "Kelompok 7",
  },
  {
    id: "DOC-006",
    title: "Wamena Papua — Organic Certificate",
    type: "Certificate",
    status: "Pending",
    origin: "Papua",
    grade: "Grade 1",
    uploadedAt: "2026-10-10",
    sizeKB: 410,
    uploader: "Kelompok 7",
  },
];

export const mockCoffees: CoffeeVariety[] = [
  {
    id: "COF-001",
    name: "Gayo Arabica",
    region: "Aceh, Sumatra",
    altitude: "1,200–1,600m",
    notes: "Herbal, Earthy, Low Acidity",
    scaScore: 85,
    stockKg: 2400,
    priceUSDperKg: 8.5,
  },
  {
    id: "COF-002",
    name: "Toraja Kalosi",
    region: "South Sulawesi",
    altitude: "1,400–1,800m",
    notes: "Spicy, Dark Chocolate, Full Body",
    scaScore: 84,
    stockKg: 1800,
    priceUSDperKg: 9.2,
  },
  {
    id: "COF-003",
    name: "Java Preanger",
    region: "West Java",
    altitude: "1,200–1,500m",
    notes: "Floral, Citrus, Sweet Finish",
    scaScore: 83,
    stockKg: 950,
    priceUSDperKg: 7.8,
  },
  {
    id: "COF-004",
    name: "Bali Kintamani",
    region: "Bali",
    altitude: "900–1,200m",
    notes: "Citrus, Lemon, Bright Acidity",
    scaScore: 84,
    stockKg: 1200,
    priceUSDperKg: 8.0,
  },
  {
    id: "COF-005",
    name: "Flores Bajawa",
    region: "East Nusa Tenggara",
    altitude: "1,000–1,400m",
    notes: "Caramel, Nutty, Medium Body",
    scaScore: 82,
    stockKg: 600,
    priceUSDperKg: 7.5,
  },
  {
    id: "COF-006",
    name: "Wamena Papua",
    region: "Papua",
    altitude: "1,500–2,000m",
    notes: "Fruity, Berry, High Acidity",
    scaScore: 87,
    stockKg: 400,
    priceUSDperKg: 12.0,
  },
];

export const dashboardStats: DashboardStat[] = [
  { label: "Total Documents", value: "124", change: "+12 this month", positive: true },
  { label: "Verified", value: "98", change: "79% approval rate", positive: true },
  { label: "Pending Review", value: "18", change: "3 urgent", positive: false },
  { label: "Coffee Varieties", value: "6", change: "Active lots", positive: true },
];
