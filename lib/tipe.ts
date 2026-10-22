export type Kategori = "Arabika" | "Robusta" | "Liberika";

export interface Item {
  id: number;
  judul: string;
  kategori: Kategori;
  deskripsi: string;
  tersedia: boolean;
  harga?: number;
}

