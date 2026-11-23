# Fork merge audit — Combined Baileys 1.0.1

Developer: Echa · Project support: Dansz

## Basis yang dipertahankan

- `dansz.zip` (basis proyek yang diserahkan kepada pengelola Combined Baileys) menjadi core runtime dan sumber utama `WAProto`, Signal, Socket, WABinary, multi-device, serta API Baileys yang sudah ada.
- Core `sendMessage` dan dispatcher kompatibilitas tidak diganti. Alias baru memanggil API yang sama agar payload lama tetap diproses oleh jalur aslinya.

## Fitur yang digabung dan dipasang

| Sumber | Versi input | Integrasi pada dansz |
|---|---:|---|
| `@ryuu-reinzz/button-helper` | 2.2.3 | Native Flow validator/builder disediakan sebagai `sendBtnV3`, `sendBtnV4`, `sendButtonsV1`, dan subpath `button-helper/v1`. |
| `raiden-baileys` | 2.2.5 | Community socket methods dipasang sebagai layer tambahan; MEX query helper `executeMexV1`; rich classic, carousel, rich menu, WebUI, A2UI dan rich message helpers tersedia sebagai V1. |
| `lunaaa-baileys` | 9.0.23 | VoIP client, signaling, relay transport, audio feeder, WASM engine dan WASM asset disertakan sebagai `dansz/voip/v1` (eksperimental, opt-in). Custom `resolveLid` ditambahkan karena basis Dansz tidak menyediakan `signalRepository.lidMapping`. |

## Sumber yang diaudit tetapi tidak disalin mentah

Arsip berikut diperiksa untuk membandingkan source/API dan fitur khusus:

- `aroyareinzu-baileys` 2.0.0
- `itsliaaa-baileys` 0.5.3
- `kelvdra-baileys` 1.0.7-rc.1
- `ryuu-reinzz-baileys` 5.5.0
- `ryuu-reinzz-baileys-cjs` 1.0.0-beta.1
- `ourin-remake-baileys` 2.0.4
- `zervonex-baileys` 4.0.0
- `ryuu-reinzz-haruka-lib` 4.0.3
- `ryuu-reinzz-luna-lib` 4.3.0
- `neoxr/wb` 6.0.5
- `@rexxhayanasi/elaina-baileys` 1.4.7
- `felicia-baileys` 1.0.4

Elaina dan Felicia menyediakan `bypassDownload` pada AI `MessageBuilder`: setelah relay pesan rich response, keduanya dapat mengirim protocol edit tipe 14. dansz mengadopsi pola tersebut secara opt-in melalui WebUI, `sendRichMessageV1(...)`, dispatcher `sendMessage(..., { bypassDownload: true })`, serta helper Rich Menu, Carousel, Classic List/Button dan A2UI. Opsi tetap opt-in; tanpa `bypassDownload: true`, pengiriman tetap memakai jalur normal. Ini bukan bypass untuk download/dekripsi media WhatsApp. Struktur `Socket`, `Signal`, `auth-utils`, dan `WAProto` dari kedua fork tidak ditimpa.

Banyak file mereka mengubah rangkaian Socket, Signal, `WAProto`, protobuf runtime, LID handling atau versi Node/dependency. Menyalin `messages-send.js`, `socket.js`, `WAProto` maupun layer socket secara keseluruhan akan menimpa perilaku core Dansz dan berisiko membuat multi-device rusak. Karena itu bagian-bagian tersebut tidak digabung sebagai overwrite.

## Struktur direktori

Folder root diringkas menjadi empat direktori: `WAProto/`, `lib/`, `docs/`, dan `tools/`. Contoh serta lisensi pihak ketiga berada di `docs/`; skrip pemeriksaan dan tes berada di `tools/`. Entry point dan jalur ekspor paket tetap mengarah ke `lib/` dan `WAProto/`.

## Batas yang disengaja

- Modul builder Raiden bernama `MessageBuilder.js` tidak disertakan. Berkas itu memuat ketentuan tambahan yang melarang redistribusi/reupload sebagai produk standalone; paket ini memang dimaksudkan untuk dipublikasikan ke GitHub/npm.
- Builder Kelvdra juga memuat ketentuan redistribusi tambahan serupa; tidak disalin.
- `sharp`, `jimp`, `canvas`, `better-sqlite3`, `ffmpeg-static`, `ffprobe-static` dan backend DB native tidak menjadi dependency wajib.
- VoIP tidak digabung ke socket core karena memerlukan `@roamhq/wrtc`, `ffmpeg` dan pemetaan PN→LID. API-nya opt-in dan harus diberi `resolveLid` sendiri jika map tidak tersedia.
- Integrasi server WhatsApp bersifat berubah-ubah; source berhasil dipaketkan bukan bukti bahwa semua endpoint internal akan diterima/dipresentasikan oleh WhatsApp untuk setiap akun/client.

## Konvensi versi API

- `sendBtn` = alias default untuk payload interactive mentah (sama fungsi dengan `sendBtnV1`).
- `sendBtnV2` = shorthand `{ id, text }` → `quick_reply`.
- `sendBtnV3` dan `sendBtnV4` = dua varian Native Flow helper yang berbeda.
- Helper classic, carousel, rich menu, WebUI, A2UI dan MEX diberi suffix `V1` karena hanya satu implementasi yang dipasang saat ini. Bila port kompatibel kedua ditemukan, nama versi baru dapat ditambah tanpa mengganti V1.


## Patch 1.0.1 — Rich bypass relay binding

- Fixed the `sendMessage(..., { bypassDownload: true })` dispatcher for both `richResponse` and direct `interactiveMessage` payloads.
- The dispatcher now passes the in-scope `relayMessage` function to `sendRichMessageWithBypass`, rather than the pre-extension `sock` object captured inside `makeMessagesSocket`.
- This resolves the runtime error `sock must expose relayMessage()` in those two bypass-enabled send paths.
- Ordinary rich-response sending and the public socket helper APIs remain unchanged.
