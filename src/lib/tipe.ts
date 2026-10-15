export type DocumentType =
  | "Certificate"
  | "Invoice"
  | "Phytosanitary"
  | "ICO Certificate"
  | "Bill of Lading";

export type DocumentStatus = "Verified" | "Pending" | "Rejected";

export interface CoffeeDocument {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
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

export type FilterStatus = "All" | DocumentStatus;
export type FilterType = "All" | DocumentType;

export interface DaftarItemProps {
  endpoint?: string;
  title?: string;
}
