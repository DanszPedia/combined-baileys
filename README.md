<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:00D9FF,50:5865F2,100:9B59B6&height=180&section=header&text=Combined%20Baileys&fontSize=42&fontColor=ffffff&animation=fadeIn" />
<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=24&duration=3000&pause=1000&color=00D9FF&center=true&vCenter=true&width=600&lines=Fork+library+Baileys;WhatsApp+Web+API;Built+for+Developers" />
</p>
<h1 align='center'><img alt="Baileys logo" src="https://raw.githubusercontent.com/DanszPedia/banners/main/aseets/logo1.png" height="75"/></h1>
  <h1>combined-baileys</h1>
  <p><em>WhatsApp Web Multi-Device library for Node.js, with interactive messages and optional Rich rendering helpers.</em></p>
<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,ts,npm,js,github" />
</p>
  <p>
    <a href="https://github.com/DanszPedia/remake-baileys">
      <img src="https://img.shields.io/badge/GitHub-DanszPedia%2Fremake--baileys-181717?logo=github" alt="GitHub repository" />
    </a>
        </a>
    <a href="https://www.npmjs.com/package/combined-baileys">
      <img src="https://img.shields.io/npm/dt/combined-baileys?color=blueviolet&label=downloads&logo=npm" alt="npm downloads" />
    </a>
    <a href="https://www.npmjs.com/package/combined-baileys">
      <img src="https://img.shields.io/badge/npm-combined--baileys-CB3837?logo=npm&logoColor=white" alt="npm package" />
    </a>
    <img src="https://img.shields.io/badge/version-1.0.0-blueviolet" alt="Version 1.0.0" />
    <img src="https://img.shields.io/badge/Node.js-%3E%3D23-339933?logo=node.js&logoColor=white" alt="Node.js >=23" />
    <img src="https://img.shields.io/badge/Module-CommonJS%20%2B%20ESM-yellow" alt="CommonJS and ESM" />
  </p>
  
  <p>
    <a href="https://whatsapp.com/channel/0029ValoF8i2phHP3yOAOx31">
      <img src="https://img.shields.io/badge/Join-WhatsApp%20Channel-25D366?logo=whatsapp&logoColor=white" alt="WhatsApp Channel" />
    </a>
  </p>

  <p><strong>Developer:</strong> Echa &nbsp;·&nbsp; <strong>Project support:</strong> Dansz</p>

</div>

> [!CAUTION]
> **⚠️Penting! Catatan:** `combined-baileys` adalah library WhatsApp Web tidak resmi. Proyek ini tidak berafiliasi dengan, tidak disponsori oleh, dan tidak didukung oleh WhatsApp atau Meta. Proyek ini hanya untuk bersenang-senang dan untuk penguna pribadi. fork/library/baileys ini adalah modifikasi (mod). Jika ada sesuatu yang tidak di inginnkan bukan tanggung jawab kami. Gunakan dengan bijak, bertanggung jawab dan patuhi ketentuan layanan serta hukum yang berlaku.

---

## Tentang proyek

`combined-baileys` merupakan library WhatsApp Multi-Device untuk Node.js. Proyek ini mempertahankan pola penggunaan socket Baileys dan menambahkan beberapa helper agar pengiriman pesan interaktif dan Rich lebih praktis.

Paket menyediakan entry CommonJS dan ESM. Jadi, proyek bot yang memakai `require()` maupun `import` bisa menggunakan paket yang sama tanpa harus mengganti seluruh struktur aplikasinya.

### Fitur utama

| Fitur | Keterangan |
|---|---|
| WhatsApp Multi-Device | Koneksi socket, autentikasi, event, dan pengiriman pesan. |
| CommonJS + ESM | Bisa digunakan dari proyek CJS maupun ESM. |
| Rich Response | Teks, potongan kode, tabel, tautan, dan konten rich yang didukung. |
| Optional Rich bypass | Opsi tambahan untuk mengirim follow-up edit protokol pada jenis pesan Rich tertentu. |
| Interactive message | Helper untuk native-flow dan interactive message. |
| Carousel | Builder carousel dan interactive carousel. |
| Rich Menu & WebUI | Helper untuk rich menu dan HTML WebUI. |
| A2UI | Builder dan pengiriman widget A2UI. |
| Classic message | Helper untuk tombol klasik dan list klasik. |
| Group & Community | Method pengelolaan grup dan komunitas yang tersedia pada socket. |
| Newsletter / Channel | Method newsletter tersedia dan dipanggil secara eksplisit oleh aplikasi. |
| VoIP eksperimental | Modul terpisah; memerlukan konfigurasi dan dependency tambahan. |

## Daftar isi

- [Persyaratan](#persyaratan)
- [Instalasi](#instalasi)
- [Memulai koneksi](#memulai-koneksi)
- [Mengirim pesan](#mengirim-pesan)
- [Rich Response](#rich-response)
- [Rich bypass](#rich-bypass)
- [Helper Rich lainnya](#helper-rich-lainnya)
- [Membaca pesan Rich](#membaca-pesan-rich)
- [Session dan kompatibilitas](#session-dan-kompatibilitas)
- [Newsletter dan auto-join](#newsletter-dan-auto-join)
- [Dependency opsional](#dependency-opsional)
- [Lisensi dan atribusi](#lisensi-dan-atribusi)

## Persyaratan

- Node.js 20 atau lebih baru.
- Koneksi internet untuk menghubungkan socket ke WhatsApp.
- Akun WhatsApp yang dapat digunakan untuk proses pairing.

## Instalasi

Jika paket sudah tersedia di npm:

```bash
npm install combined-baileys
```

Memasang versi tertentu:

```bash
npm install combined-baileys@1.0.0
npm install combined-baileys@latest
npm install combined-baileys@^1.1.1
```

Memasang langsung dari folder hasil clone atau extract:

```bash
npm install ./path/ke/combined-baileys
```

Repository proyek: <https://github.com/DanszPedia/remake-baileys>

## Memulai koneksi

### CommonJS

```js
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('combined-baileys')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) console.log('Scan QR untuk login')
    if (connection === 'open') console.log('WhatsApp terhubung')
    if (connection === 'close') {
      console.log('Koneksi terputus:', lastDisconnect?.error)
    }
  })

  return sock
}

startBot().catch(console.error)
```

### ESM

```js
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from 'combined-baileys'

const { state, saveCreds } = await useMultiFileAuthState('./session')
const { version } = await fetchLatestBaileysVersion()
const sock = makeWASocket({ auth: state, version })

sock.ev.on('creds.update', saveCreds)
```

## Mengirim pesan

Pesan teks biasa tetap menggunakan API `sendMessage`:

```js
await sock.sendMessage(m.chat, {
  text: 'Halo dari Combined Baileys!'
})
```

Alias `sendMsg` juga tersedia:

```js
await sock.sendMsg(m.chat, {
  text: 'Halo juga!'
})
```

## Rich Response

Rich Response bisa berisi teks, kode, tabel, tautan, dan beberapa bagian dalam satu pesan.

### Teks dan kode

```js
const { tokenizeCode } = require('combined-baileys')

await sock.sendMessage(m.chat, {
  disclaimerText: '© Echa · Combined Baileys',
  richResponse: [
    { text: 'Contoh kode JavaScript' },
    {
      language: 'javascript',
      code: tokenizeCode('const greeting = "Hello!"', 'javascript')
    },
    { text: 'Kode di atas membuat sebuah variabel.' }
  ]
}, {
  quoted: m
})
```

### Tabel

```js
await sock.sendMessage(m.chat, {
  title: 'Daftar pemain',
  table: [
    ['Nama', 'Level', 'Status'],
    ['Dani', '12', 'Online'],
    ['Raka', '8', 'Offline']
  ],
  footerText: 'Data permainan'
})
```

### Tautan

```js
await sock.sendMessage(m.chat, {
  headerText: 'Referensi',
  links: [
    {
      text: 'Dokumentasi Node.js',
      url: 'https://nodejs.org',
      title: 'Node.js'
    }
  ]
})
```

## Rich bypass

`bypassDownload` merupakan opsi tambahan untuk jenis pesan Rich yang didukung. Saat diaktifkan, library mengirim pesan awal lalu mengirim follow-up edit protokol tipe 14 yang merujuk ke pesan tersebut. Pada client WhatsApp yang mendukung format ini, mekanisme tersebut dapat membantu Rich ditampilkan atau diperbarui tanpa menunggu alur render normal.

Opsi ini **tidak aktif secara default**. Tambahkan `bypassDownload: true` hanya pada pesan yang ingin memakai mekanisme tersebut. Jika opsi dihilangkan atau diisi `false`, pesan dikirim melalui jalur normal.

Perlu diingat: ini bukan bypass untuk mengunduh atau mendekripsi foto, video, maupun dokumen. Hasil tampilan tetap bergantung pada versi dan dukungan aplikasi WhatsApp penerima.

### Rich Response dengan bypass

```js
await sock.sendMessage(m.chat, {
  disclaimerText: '© Echa · Combined Baileys',
  richResponse: [
    { text: 'Contoh kode JavaScript' },
    {
      language: 'javascript',
      code: tokenizeCode(code, language)
    },
    { text: `Ini adalah code ${languageName} yang ada di ${fileName}` }
  ]
}, {
  quoted: m,
  bypassDownload: true
})
```

### Tabel dengan bypass

```js
await sock.sendMessage(m.chat, {
  title: 'Inventaris',
  table: [
    ['Item', 'Jumlah'],
    ['Koin', '250'],
    ['Energi', '80']
  ]
}, {
  bypassDownload: true
})
```

### Pengiriman normal

Kalau ingin pesan dikirim tanpa follow-up bypass, cukup jangan menambahkan opsinya:

```js
await sock.sendMessage(m.chat, {
  richResponse: [
    { text: 'Pesan Rich dengan pengiriman normal.' }
  ]
})
```

### Opsi tambahan

| Opsi | Kegunaan |
|---|---|
| `bypassDownload` | Mengaktifkan follow-up edit protokol. Default `false`. |
| `forwardWrapper` | Mengatur wrapper `botForwardedMessage` pada pesan edit. Default `true`. |
| `editMessageId` | ID khusus untuk pesan edit lanjutan. |

Jika pengiriman pesan pertama berhasil tetapi follow-up edit gagal, error dapat membawa properti `relayedKey`. Periksa pesan tersebut sebelum mencoba mengirim ulang agar tidak membuat pesan duplikat.

## Helper Rich lainnya

Selain melalui `sendMessage`, beberapa helper dapat dipanggil langsung dari socket.

### WebUI / HTML

```js
const html = `<!doctype html>
<html>
  <body>
    <h1>Halo!</h1>
    <p>Ini contoh tampilan WebUI.</p>
  </body>
</html>`

await sock.sendWebUIV1(m.chat, html, 'Ourin WebUI', {
  bypassDownload: true
})
```

### Rich Menu

```js
await sock.sendRichMenuV1(m.chat, {
  header: {
    title: 'Menu Bot'
  },
  body: {
    title: 'Pilih layanan',
    buttons: [
      { label: 'Menu utama', toast: 'Membuka menu utama' },
      { label: 'Bantuan', toast: 'Membuka bantuan' }
    ]
  },
  footer: {
    text: 'Buka website',
    url: 'https://example.com'
  }
}, {
  bypassDownload: true
})
```

### Carousel

```js
await sock.sendCarouselV1(m.chat, {
  text: 'Pilih produk',
  footer: 'Combined Baileys',
  cards: [
    {
      text: 'Produk A tersedia',
      header: { title: 'Produk A', subtitle: 'Paket basic' },
      buttons: [
        { type: 'quick_reply', displayText: 'Pilih A', id: '.buy_a' }
      ]
    },
    {
      text: 'Produk B tersedia',
      header: { title: 'Produk B', subtitle: 'Paket premium' },
      buttons: [
        { type: 'quick_reply', displayText: 'Pilih B', id: '.buy_b' }
      ]
    }
  ]
}, {
  bypassDownload: true
})
```

### Interactive message

```js
await sock.sendInteractiveV1(m.chat, {
  title: 'Pilih menu',
  buttons: [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Menu', id: '.menu' }) },
    { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'Website', url: 'https://example.com' }) }
  ]
}, {
  bypassDownload: true
})
```

### A2UI

```js
const { A2UI } = require('combined-baileys/rich/a2ui/v1')

const ui = new A2UI()
const heading = ui.text('Halo Combined Baileys', { variant: 'h1' })
const action = ui.button(heading, {
  action: { call: 'openUrl', args: { url: 'https://example.com' } }
})
ui.root([heading, action])

await sock.sendA2UIV1(m.chat, {
  a2ui: ui,
  bodyText: 'Contoh widget A2UI',
  bypassDownload: true
})
```

### Tombol klasik dan list

```js
await sock.sendClassicBtnV1(m.chat, {
  text: 'Pilih tombol',
  footer: 'Combined Baileys',
  buttons: [
    { buttonId: '.menu', buttonText: 'Menu' },
    { buttonId: '.owner', buttonText: 'Owner' }
  ]
}, {
  bypassDownload: true
})

await sock.sendListV1(m.chat, {
  title: 'Daftar menu',
  description: 'Pilih salah satu menu',
  buttonText: 'Buka daftar',
  sections: [{
    title: 'Umum',
    rows: [
      { title: 'Menu', description: 'Menampilkan menu', rowId: '.menu' },
      { title: 'Ping', description: 'Cek kecepatan bot', rowId: '.ping' }
    ]
  }]
}, {
  bypassDownload: true
})
```

Format interactive, carousel, A2UI, dan rich UI menggunakan struktur pesan khusus WhatsApp. Pesan yang berhasil dikirim oleh server belum tentu ditampilkan dengan cara yang sama di semua versi client.

## Membaca pesan Rich

Untuk membuat atau memproses konten Rich, beberapa utilitas tersedia dari paket utama:

```js
const {
  tokenizeCode,
  prepareRichResponseMessage
} = require('combined-baileys')
```

`tokenizeCode()` membantu membagi kode menjadi blok yang memiliki tipe highlight. `prepareRichResponseMessage()` menyiapkan payload Rich Response dari objek konten.

## Session dan kompatibilitas

Jika bot sudah memiliki session, lakukan backup sebelum mengganti dependency. Uji library dengan salinan folder session terlebih dahulu. Jangan menghapus file session lama selama proses uji.

Core socket, Signal, `WAProto`, dan autentikasi memiliki keterkaitan dengan format kredensial serta protokol. Menggabungkan file socket atau auth dari fork lain secara sembarangan dapat membuat session tidak kompatibel.

## Newsletter dan auto-join

Library menyediakan method newsletter seperti `newsletterFollow()` dan `newsletterUnfollow()` untuk dipanggil secara eksplisit oleh aplikasi. Method tersebut bukan proses auto-join yang berjalan otomatis ketika socket dibuat atau bot mulai terhubung.

Aplikasi yang memakai method follow tetap harus menentukan sendiri kapan dan channel mana yang akan diikuti. Periksa kode bot apabila ingin memastikan tidak ada pemanggilan follow dari sisi aplikasi.

## Dependency opsional

Beberapa integrasi dapat memerlukan paket tambahan. Dependency berikut bersifat opsional dan tidak semuanya dibutuhkan untuk menjalankan socket dasar.

| Paket | Kegunaan |
|---|---|
| `@roamhq/wrtc` | Transport WebRTC untuk fitur VoIP. |
| `audio-decode` | Dekode audio tambahan. |
| `fluent-ffmpeg` | Integrasi FFmpeg. |
| `jimp` / `sharp` | Pemrosesan gambar. |
| `link-preview-js` | Pembuatan link preview. |
| `qrcode-terminal` | Tampilan QR di terminal. |

Fitur VoIP bersifat eksperimental dan memerlukan konfigurasi tambahan, termasuk dukungan WebRTC serta executable FFmpeg pada sistem.

## Lisensi dan atribusi

Copyright © Echa. Project support by Dansz.

Lisensi proyek dan pemberitahuan komponen pihak ketiga mengikuti berkas `LICENSE` dan `NOTICE-THIRD-PARTY.md` di repository. Komponen yang berasal dari proyek lain tetap tunduk pada lisensi dan atribusi masing-masing.

Repository: <https://github.com/DanszPedia/remake-baileys>
