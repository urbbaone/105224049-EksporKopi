# Dokumen Teknis Modul 3 — TypeScript dan Komponen React

**Nama:** Bagas  
**NIM:** 105224049  
**Repositori:** https://github.com/urbbaone/105224049-EksporKopi

> Dokumen ini disesuaikan dengan struktur dan implementasi aktual repository. Pada versi repository yang diperiksa, belum ditemukan berkas `lib/tipe.ts`, komponen `DaftarItem`, maupun endpoint/data `item.json`. Model data yang tersedia berada di `src/lib/mockData.ts` dan menggunakan komponen React pada `src/components/`.

## 1. Tipe Data Produk

### 1.1 Implementasi tipe data yang tersedia

Repository menggunakan beberapa interface TypeScript di `src/lib/mockData.ts`.

```typescript
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
```

Tipe tersebut digunakan untuk memastikan data dokumen ekspor, varietas kopi, dan statistik dashboard memiliki struktur yang konsisten.

### 1.2 Alasan penggunaan union type

Union type digunakan pada properti `type`, `status`, serta beberapa props komponen karena nilainya dibatasi pada pilihan yang sudah diketahui.

Contoh:

```typescript
type FilterStatus = "All" | "Verified" | "Pending" | "Rejected";
type FilterType = "All" | CoffeeDocument["type"];
```

Penggunaan union type memberikan beberapa manfaat:

1. Mencegah nilai di luar daftar yang valid, misalnya status typo `"Verifed"`.
2. Memberikan autocomplete dan pemeriksaan kesalahan saat pengembangan.
3. Menjaga filter pada halaman `/documents` tetap sesuai dengan data `CoffeeDocument`.
4. Memudahkan refactor karena perubahan pilihan status dapat dilacak oleh TypeScript.

### 1.3 Properti opsional

Properti opsional digunakan pada props komponen yang tidak selalu perlu dikirim oleh pemanggil. Contohnya:

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}
```

`error` dan `hint` bersifat opsional karena input dapat digunakan tanpa pesan kesalahan atau petunjuk tambahan. Contoh lain terdapat pada komponen `Button`:

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}
```

Nilai default diberikan ketika props tidak dikirim, misalnya `variant = "primary"`, `size = "md"`, dan `loading = false`.

## 2. Struktur Komponen

### 2.1 Diagram pohon komponen

Aplikasi menggunakan App Router Next.js. File `app/page.tsx` dan `app/dashboard/page.tsx` tidak memiliki deklarasi `"use client"`, sehingga keduanya merupakan **Server Component**. Halaman `app/documents/page.tsx`, `app/upload/page.tsx`, dan `src/components/Modal.tsx` menggunakan `"use client"` karena membutuhkan state, event handler, atau API browser.

```text
Next.js App Router
├── app/layout.tsx                         [Server Component]
├── app/page.tsx                           [Server Component]
│   └── Konten landing page Nusantara Coffee Export
├── app/dashboard/page.tsx                 [Server Component]
│   ├── StatCard                            [Server Component]
│   │   └── Card                            [Server Component]
│   └── Badge                              [Server Component]
├── app/documents/page.tsx                 [Client Component]
│   ├── Badge                               [Server-compatible component]
│   ├── Button                              [Server-compatible component]
│   └── Modal                               [Client Component]
├── app/upload/page.tsx                     [Client Component]
│   ├── Input                               [Server-compatible component]
│   ├── SelectField                         [Server-compatible component]
│   ├── Button                              [Server-compatible component]
│   └── Alert                               [Server-compatible component]
└── src/lib/mockData.ts                     [Data/type module]
```

> Catatan: `Badge`, `Button`, `Card`, `Input`, dan `SelectField` tidak menggunakan `"use client"`. Komponen-komponen tersebut tidak memiliki state atau event internal sehingga dapat dirender dari Server Component maupun digunakan di dalam Client Component.

### 2.2 Tabel komponen

| Komponen | Props dan tipe | Tempat digunakan | Jenis |
|---|---|---|---|
| `Home` | Tidak ada props | `app/page.tsx` | Server Component |
| `DashboardPage` | Tidak ada props | `app/dashboard/page.tsx` | Server Component |
| `DocumentsPage` | Tidak ada props | `app/documents/page.tsx` | Client Component |
| `UploadPage` | Tidak ada props | `app/upload/page.tsx` | Client Component |
| `Card` | `children: React.ReactNode`, `className?: string`, `hover?: boolean`, `padding?: "sm" \| "md" \| "lg"` | `StatCard` | Server-compatible |
| `StatCard` | `label: string`, `value: string`, `change: string`, `positive: boolean`, `icon: string` | `DashboardPage` | Server-compatible |
| `Badge` | `label: string`, `variant?: BadgeVariant` | `DashboardPage`, `DocumentsPage` | Server-compatible |
| `Button` | Props HTML button, `variant?`, `size?`, `loading?`, `children` | `DocumentsPage`, `UploadPage` | Server-compatible |
| `Modal` | `isOpen: boolean`, `onClose: () => void`, `title: string`, `children: React.ReactNode` | `DocumentsPage` | Client Component |
| `Input` | Props HTML input, `label: string`, `error?: string`, `hint?: string` | `UploadPage` | Server-compatible |
| `SelectField` | Props HTML select, `label: string`, `error?: string`, `options: { value: string; label: string }[]` | `UploadPage` | Server-compatible |
| `Alert` | `type`, `title`, `message`, dan props alert terkait | `UploadPage` | Server-compatible |

## 3. State dan Interaksi

### 3.1 State halaman daftar dokumen

Repository tidak memiliki komponen bernama `DaftarItem`. Padanan fungsionalnya adalah `DocumentsPage` pada `app/documents/page.tsx`, yang menampilkan daftar `CoffeeDocument`.

State yang digunakan:

```typescript
const [statusFilter, setStatusFilter] = useState<FilterStatus>("All");
const [typeFilter, setTypeFilter] = useState<FilterType>("All");
const [selectedDoc, setSelectedDoc] = useState<CoffeeDocument | null>(null);
```

State tersebut memiliki fungsi berikut:

- `statusFilter`: menyimpan filter status aktif.
- `typeFilter`: menyimpan filter jenis dokumen aktif.
- `selectedDoc`: menyimpan dokumen yang dipilih untuk ditampilkan pada modal detail.

### 3.2 Bukti tab Components

Pada repository yang diperiksa belum terdapat tangkapan layar React DevTools tab **Components**. Bukti yang perlu dilampirkan saat pengumpulan:

1. Jalankan aplikasi dengan `npm run dev`.
2. Buka halaman `/documents`.
3. Buka React DevTools → tab **Components**.
4. Pilih `DocumentsPage`, lalu catat props dan hooks/state yang tampil.
5. Pilih `Modal` setelah menekan tombol **Detail** pada salah satu dokumen.
6. Simpan tangkapan layar ke folder `docs/praktikum/`, lalu sematkan dengan format:

```markdown
![React DevTools Components — DocumentsPage](./components-documents.png)
```

### 3.3 Alur event sampai render ulang

1. Pengguna menekan tombol status atau jenis dokumen.
2. Handler `onClick` memanggil `setStatusFilter` atau `setTypeFilter`.
3. React memperbarui state pada `DocumentsPage`.
4. Nilai `filtered` dihitung ulang menggunakan `mockDocuments.filter(...)`.
5. React melakukan render ulang dan hanya menampilkan dokumen yang sesuai filter.
6. Jika pengguna menekan tombol **Detail**, `setSelectedDoc(doc)` menyimpan dokumen terpilih.
7. Nilai `isOpen={!!selectedDoc}` pada `Modal` berubah menjadi `true`, sehingga detail dokumen ditampilkan.
8. Tombol tutup, klik backdrop, atau tombol `Escape` menjalankan `setSelectedDoc(null)`, lalu modal menghilang pada render berikutnya.

## 4. Pengambilan Data

### 4.1 Kondisi repository saat ini

Instruksi awal menyebut permintaan `item.json`, kondisi memuat/berhasil/gagal, dan komponen `DaftarItem`. Namun, pada repository yang diperiksa:

- belum ditemukan endpoint atau file `item.json`;
- data halaman dashboard dan dokumen berasal dari konstanta lokal `mockDocuments`, `mockCoffees`, dan `dashboardStats`;
- belum terdapat pemanggilan `fetch` untuk daftar item;
- belum terdapat state loading/error khusus untuk pengambilan data jaringan.

Dengan demikian, pengujian Network untuk `item.json` belum dapat diklaim sebagai hasil aktual dari repository ini.

### 4.2 Bukti yang harus dilampirkan apabila fitur API telah ditambahkan

Jika tugas praktikum mensyaratkan pengambilan data melalui API, lampirkan:

```markdown
![Network request item.json](./network-item-json.png)
```

Tangkapan layar harus memperlihatkan minimal:

| Kondisi | Bukti yang diharapkan |
|---|---|
| Memuat | UI menampilkan indikator loading ketika request belum selesai |
| Berhasil | Request `item.json` berstatus `200`, data item tampil |
| Gagal | Request gagal atau berstatus bukan `2xx`, pesan error tampil |

## 5. Verifikasi

### 5.1 TypeScript

Perintah verifikasi yang digunakan:

```bash
npx tsc --noEmit
```

Perintah ini memeriksa tipe seluruh file TypeScript tanpa menghasilkan file JavaScript. Keluaran aktual perlu dicatat setelah perintah dijalankan pada environment pengembangan.

### 5.2 ESLint

Perintah lint yang tersedia pada `package.json` adalah:

```bash
npm run lint
```

Script tersebut menjalankan `eslint`. Keluaran aktual perlu ditempelkan pada bagian berikut setelah verifikasi lokal:

```text
[Tempel keluaran npx tsc --noEmit di sini]

[Tempel keluaran npm run lint di sini]
```

### 5.3 Catatan konfigurasi

`package.json` menyediakan script `dev`, `build`, `start`, `lint`, dan `test`, tetapi tidak menyediakan script `typecheck`. Oleh karena itu, pemeriksaan TypeScript dijalankan langsung dengan `npx tsc --noEmit` sesuai instruksi modul.

## 6. Kendala dan Penyelesaian

### 6.1 Perbedaan instruksi modul dengan struktur repository

Instruksi awal merujuk pada `lib/tipe.ts`, `DaftarItem`, dan `item.json`, sedangkan repository aktual menggunakan `src/lib/mockData.ts`, `DocumentsPage`, dan data mock lokal.

**Penyelesaian:** dokumentasi disinkronkan dengan implementasi aktual. Referensi `DaftarItem` dijelaskan sebagai padanan fungsional `DocumentsPage`, sedangkan bagian `item.json` diberi catatan bahwa fiturnya belum tersedia.

### 6.2 Pemisahan Server Component dan Client Component

Halaman yang memakai `useState`, `useForm`, atau event handler harus menggunakan `"use client"`. Sebaliknya, halaman yang hanya menampilkan data mock dan markup dapat tetap menjadi Server Component.

**Penyelesaian:** klasifikasi komponen dilakukan berdasarkan isi file aktual, bukan hanya berdasarkan nama komponen.

### 6.3 Verifikasi bukti visual belum lengkap

Repository belum memuat screenshot React DevTools Components dan Network request `item.json`.

**Penyelesaian:** dokumentasi menyediakan langkah dan nama file yang perlu digunakan untuk melengkapi bukti saat pengujian dilakukan secara lokal.

## 7. Catatan Pemanfaatan AI

**Alat:** GitHub Copilot/agent dan analisis repository GitHub.

**Perintah utama yang digunakan:**

```bash
npx tsc --noEmit
npm run lint
npm run dev
```

**Bagian yang digunakan:**

- membaca struktur repository dan `AGENTS.md`;
- menyesuaikan dokumentasi Modul 3 dengan file aktual;
- merangkum tipe data pada `src/lib/mockData.ts`;
- mengidentifikasi Server Component dan Client Component;
- menyusun tabel props dan alur state pada `DocumentsPage`;
- mencatat keterbatasan karena `lib/tipe.ts`, `DaftarItem`, dan `item.json` belum tersedia.

**Cara verifikasi:**

1. Isi dokumen dicocokkan dengan `src/lib/mockData.ts`.
2. Struktur halaman dicocokkan dengan `app/page.tsx`, `app/dashboard/page.tsx`, `app/documents/page.tsx`, dan `app/upload/page.tsx`.
3. Props komponen dicocokkan dengan file pada `src/components/`.
4. Script verifikasi dicocokkan dengan `package.json`.
5. Screenshot Components dan Network harus diambil secara lokal apabila diperlukan sebagai bukti praktikum.

## 8. Kesimpulan

Modul 3 pada repository ini telah menggunakan TypeScript melalui interface, union type, optional props, serta generic/HTML prop inheritance pada komponen React. Halaman dashboard menggunakan Server Component, sedangkan halaman dokumen dan upload menggunakan Client Component karena membutuhkan interaksi dan state.

Implementasi pengambilan data saat ini masih menggunakan mock data lokal. Oleh sebab itu, bukti `item.json`, loading state, success state, dan error state belum dapat disajikan sebagai hasil aktual sebelum fitur API tersebut ditambahkan atau tersedia pada repository.
