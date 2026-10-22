import "server-only";
import type { Item } from "./tipe";

export const daftarItem: Item[] = [
  {
    id: 1,
    judul: "Gayo Arabica Grade 1",
    kategori: "Arabika",
    deskripsi:
      "Kopi Arabika dari dataran tinggi Gayo, Aceh Tengah. Memiliki profil rasa herbal, aroma rempah lembut, body pekat, dan keasaman bersih seimbang.",
    tersedia: true,
    harga: 125000,
  },
  {
    id: 2,
    judul: "Toraja Kalosi Specialty",
    kategori: "Arabika",
    deskripsi:
      "Kopi single-origin legendaris dari dataran tinggi Tana Toraja, Sulawesi Selatan. Karakteristik dark chocolate kental, rempah kayu manis, dan aftertaste manis tahan lama.",
    tersedia: true,
    harga: 135000,
  },
  {
    id: 3,
    judul: "Java Preanger Puntang",
    kategori: "Arabika",
    deskripsi:
      "Varietas klasik Jawa Barat dari Gunung Puntang. Menghadirkan aroma floral melati, sentuhan rasa citrus segar, dan tingkat keasaman manis yang elegan.",
    tersedia: true,
    harga: 115000,
  },
  {
    id: 4,
    judul: "Bali Kintamani Natural",
    kategori: "Arabika",
    deskripsi:
      "Ditanam berdampingan dengan kebun jeruk Kintamani di tanah vulkanik Gunung Batur. Memiliki sentuhan rasa jeruk keprok cerah dan aroma buah segar.",
    tersedia: false,
    harga: 120000,
  },
  {
    id: 5,
    judul: "Flores Bajawa Ngada",
    kategori: "Arabika",
    deskripsi:
      "Kopi organik dataran tinggi Ngada, Flores. Menampilkan aroma karamel, nutty kacang panggang, kekentalan medium, dan sensasi tembakau manis di ujung lidah.",
    tersedia: true,
    harga: 130000,
  },
  {
    id: 6,
    judul: "Lampung Robusta Fine",
    kategori: "Robusta",
    deskripsi:
      "Biji kopi Robusta petik merah pilihan dari Lampung Barat. Menghasilkan body sangat tebal, crema keemasan tebal, dan aroma kakao pekat tanpa rasa getir berlebih.",
    tersedia: true,
    harga: 95000,
  },
];

// tambahkan di bawah daftarItem
export function cariItem(id: number): Item | undefined {
  return daftarItem.find((item) => item.id === id);
}

