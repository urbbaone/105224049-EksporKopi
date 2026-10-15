# Dokumen Teknis Modul 3 — TypeScript dan Komponen React

**Nama:** Bagas  
**NIM:** 105224049  
**Repositori:** https://github.com/urbbaone/105224049-EksporKopi

Dokumen ini disusun berdasarkan implementasi aktual pada branch kerja saat ini, tanpa mengklaim bukti visual atau output perintah yang tidak benar-benar dijalankan.

## 1) Tipe Data Produk (`src/lib/tipe.ts`)

File sumber tipe telah dipusatkan di:

- `src/lib/tipe.ts`

### 1.1 Definisi tipe utama

- `DocumentType` (union type):
  - `"Certificate" | "Invoice" | "Phytosanitary" | "ICO Certificate" | "Bill of Lading"`
- `DocumentStatus` (union type):
  - `"Verified" | "Pending" | "Rejected"`
- `CoffeeDocument` (interface data dokumen)
- `CoffeeVariety` (interface data kopi)
- `DashboardStat` (interface statistik dashboard)
- `FilterStatus = "All" | DocumentStatus`
- `FilterType = "All" | DocumentType`
- `DaftarItemProps`:
  - `endpoint?: string`
  - `title?: string`

### 1.2 Alasan union type

Union type digunakan agar nilai status/tipe dokumen hanya menerima pilihan valid. Dampak langsung:

1. mencegah typo nilai string,
2. memperkuat validasi saat compile-time,
3. menjaga konsistensi filter dan badge status.

### 1.3 Alasan optional props

`DaftarItemProps.endpoint` dan `DaftarItemProps.title` dibuat opsional untuk:

- menyediakan konfigurasi default yang aman (`/item.json`, judul bawaan),
- memungkinkan pengujian endpoint lain tanpa mengubah kontrak komponen.

## 2) Struktur Komponen

## 2.1 Pohon Server Component / Client Component

```text
app/layout.tsx                          [Server Component]
├── src/components/Navbar.tsx           [Client Component]
└── children routes

app/documents/page.tsx                  [Server Component]
└── src/components/DaftarItem.tsx       [Client Component]
    ├── src/components/Badge.tsx        [Server-compatible]
    ├── src/components/Button.tsx       [Server-compatible]
    └── src/components/Modal.tsx        [Client Component]

app/dashboard/page.tsx                  [Server Component]
app/upload/page.tsx                     [Client Component]
```

## 2.2 Tabel komponen, props, tipe, dan lokasi

| Komponen | Props | Tipe props utama | Lokasi penggunaan |
|---|---|---|---|
| `DocumentsPage` | - | - | `app/documents/page.tsx` |
| `DaftarItem` | `endpoint?`, `title?` | `DaftarItemProps` | `app/documents/page.tsx` |
| `Modal` | `isOpen`, `onClose`, `title`, `children` | `boolean`, `() => void`, `string`, `React.ReactNode` | `src/components/DaftarItem.tsx` |
| `Button` | `variant?`, `size?`, `loading?`, props HTML button | union + `React.ButtonHTMLAttributes<HTMLButtonElement>` | `DaftarItem`, `UploadPage` |
| `Badge` | `label`, `variant?` | `string`, union variant | `DaftarItem`, `DashboardPage` |

## 3) State, Event, dan Alur Render Ulang

Implementasi ada di `src/components/DaftarItem.tsx`.

### 3.1 State yang digunakan

- `statusFilter: FilterStatus`
- `typeFilter: FilterType`
- `selectedDoc: CoffeeDocument | null`
- `items: CoffeeDocument[]`
- `loading: boolean`
- `error: string | null`
- `reloadToken: number` (untuk retry fetch)

### 3.2 Event utama

- klik filter status → `setStatusFilter(...)`
- klik filter tipe → `setTypeFilter(...)`
- klik `Detail` → `setSelectedDoc(doc)`
- klik `Coba lagi` saat error → `setReloadToken(...)`
- tutup modal → `setSelectedDoc(null)`

### 3.3 Alur render ulang

1. Komponen mount atau `reloadToken` berubah.
2. `useEffect` menjalankan `fetch(endpoint)`.
3. `loading=true` menampilkan state memuat.
4. Jika sukses dan format valid, `items` diisi lalu tabel tampil.
5. Jika gagal/format invalid, `error` diisi lalu state gagal tampil.
6. Perubahan filter memicu `useMemo(filtered)` dihitung ulang.
7. Klik `Detail` membuka modal dengan data dokumen terpilih.

## 4) Pengambilan Data (`item.json`)

### 4.1 Sumber data

- File: `public/item.json`
- Akses dari browser: `GET /item.json`
- Konsumsi data: `src/components/DaftarItem.tsx`

### 4.2 Kondisi loading / sukses / gagal

- **Loading**: panel teks “Memuat data dokumen dari /item.json...”
- **Sukses**: tabel dokumen tampil + badge status + tombol detail
- **Gagal**: panel error + tombol `Coba lagi`

### 4.3 Validasi format data

Komponen melakukan validasi runtime sederhana melalui `isCoffeeDocumentArray(...)` sebelum menyimpan data ke state.

## 5) Verifikasi Teknis (Aktual)

Perintah dijalankan di repository ini.

### 5.1 TypeScript

```bash
npx tsc --noEmit
```

Hasil aktual:

```text
(exit code 0, tanpa error output)
```

### 5.2 Lint

```bash
npm run lint
```

Hasil aktual:

```text
> my-app@0.1.0 lint
> eslint
```

### 5.3 Test

Script test tersedia (`vitest`), sehingga juga diverifikasi.

```bash
npm test
```

Hasil aktual:

```text
Test Files  1 passed (1)
Tests       7 passed (7)
```

## 6) Daftar Screenshot yang Wajib Dikumpulkan

> Catatan kejujuran bukti: agent tidak membuat screenshot palsu. File berikut **belum ada** di repository pada sesi ini dan harus diambil manual saat demo/laporan lokal.

Simpan di folder: `docs/praktikum/`

1. `components-daftaritem-default.png`  
   - React DevTools tab **Components**, komponen `DaftarItem` saat sukses.
2. `components-daftaritem-filter.png`  
   - React DevTools saat state filter berubah.
3. `components-daftaritem-modal.png`  
   - React DevTools saat modal detail terbuka.
4. `network-item-loading.png`  
   - DevTools Network saat request `/item.json` masih loading.
5. `network-item-success.png`  
   - DevTools Network status `200` untuk `/item.json`.
6. `network-item-error.png`  
   - DevTools Network saat gagal (misal endpoint diubah sementara ke path invalid).
7. `verifikasi-tsc-lint-test.png`  
   - Terminal berisi `npx tsc --noEmit`, `npm run lint`, `npm test`.

Contoh penyematan markdown:

```md
![DaftarItem default state](./components-daftaritem-default.png)
```

## 7) Kendala dan Penyelesaian

1. **Instruksi modul meminta `lib/tipe.ts`, `DaftarItem`, dan `item.json`, tetapi sebelumnya belum ada.**  
   Penyelesaian: ditambahkan implementasi minimal nyata (`src/lib/tipe.ts`, `src/components/DaftarItem.tsx`, `public/item.json`) dan dihubungkan ke `/documents`.

2. **Perlu menjaga fitur existing agar tidak rusak.**  
   Penyelesaian: perubahan difokuskan hanya pada jalur dokumen, tanpa mengubah perilaku halaman dashboard/upload.

3. **Bukti screenshot belum bisa diproduksi otomatis secara valid pada sesi ini.**  
   Penyelesaian: diberikan daftar screenshot dan nama file final yang harus diambil manual.

## 8) Catatan Pemanfaatan AI

Mengikuti format dan semangat `AI_LOG.md`:

- **Alat AI**: GitHub Copilot Coding Agent.
- **Penggunaan pada Modul 3**:
  1. audit struktur file dan tipe aktual,
  2. implementasi komponen `DaftarItem` + fetch `/item.json`,
  3. sinkronisasi dokumen teknis berbasis kode aktual,
  4. eksekusi verifikasi `tsc`, `lint`, `test`.
- **Validasi manusia**:
  - meninjau diff kode,
  - memeriksa hasil command (exit code/output),
  - memastikan dokumentasi tidak mengklaim screenshot palsu.

---

## Ringkasan File yang Diubah

1. `src/lib/tipe.ts` (baru)
2. `src/lib/mockData.ts`
3. `src/components/DaftarItem.tsx` (baru)
4. `public/item.json` (baru)
5. `app/documents/page.tsx`
6. `docs/praktikum/modul-03.md`

## Keterbatasan Bukti Screenshot

Bukti screenshot React DevTools/Network/terminal belum ditambahkan sebagai file gambar pada commit ini. Daftar nama file dan lokasi penyimpanan sudah disediakan agar dapat dilengkapi manual secara jujur.
