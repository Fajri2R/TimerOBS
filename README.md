# TimerOBS

Builder timer overlay untuk OBS Studio, Streamlabs, dan browser source lain. Proyek ini menyediakan panel konfigurasi visual, live preview, serta output overlay yang bisa langsung dipakai untuk countdown, countup, intro stream, match timer, break screen, atau broadcast scene.

## Highlight

- Countdown dan countup dalam satu builder.
- Format `HH:mm:ss`, `HH:mm:ss:ms`, `mm:ss`, dan `ss`.
- Live preview dengan mode transparan sungguhan.
- Timer style `plain`, `glass`, `card`, `bar`, `circle`, dan `broadcast`.
- Kontrol tipografi lengkap: font, ukuran, bold, italic, underline, stroke, shadow.
- Labels dan titles opsional.
- URL output otomatis untuk Browser Source OBS.
- Autosave draft builder di browser.

## Demo

- Live demo: [https://fajri2r.github.io/TimerOBS/](https://fajri2r.github.io/TimerOBS/)

## Cara Pakai Cepat

1. Buka builder.
2. Pilih `Timer mode`, `Display format`, dan `Initial time`.
3. Pilih style yang diinginkan.
4. Sesuaikan font, warna, labels, titles, dan animasi.
5. Salin URL output dari panel kanan.
6. Di OBS Studio, tambahkan `Browser Source`.
7. Paste URL output tersebut.

## Fitur Builder

### Timer setup

- `Countdown` untuk hitung mundur.
- `Countup` untuk hitung maju.
- Preset cepat seperti `5 menit`, `10 menit`, `30 menit`, dan `10 detik + ms`.

### Display format

- `HH:mm:ss` untuk intro, break, dan durasi panjang.
- `HH:mm:ss:ms` untuk race timer, esports, atau scene presisi tinggi.
- `mm:ss` untuk round timer, pick/ban, atau match intermission.
- `ss` untuk layout yang sangat minimal.

### Style

- `Plain`: tampilan bersih tanpa panel.
- `Glass`: panel semi-transparan modern.
- `Card`: tiap unit tampil seperti flip board / card timer.
- `Bar`: progress horizontal.
- `Circle`: progress melingkar.
- `Broadcast`: tampilan lebih kuat untuk live show.

### Typography

- Font populer untuk streaming dan display besar.
- Quick picks untuk font yang sering dipakai di overlay.
- Ukuran font bisa diatur dengan slider dan input angka.

### Overlay extras

- Background color.
- Text color.
- Circle color khusus untuk style `circle`.
- Title color dan title style.
- Transparent background.
- Labels atas atau bawah.
- Titles atas dan bawah.

## Parameter URL

Output overlay dibangun dari query string. Parameter utama yang tersedia:

- `mode`
- `time`
- `format`
- `font`
- `font_size`
- `bg_color`
- `text_color`
- `circle_color`
- `title_color`
- `title_font_size`
- `transparent`
- `end_message`
- `timer_style`
- `title_style`
- `time_animation`
- `bold`
- `italic`
- `underline`
- `stroke`
- `shadow`
- `show_labels`
- `label_position`
- `show_titles`
- `title_top`
- `title_bottom`
- `title_bold`
- `title_italic`
- `title_underline`

Contoh sederhana:

```text
display.html?mode=countdown&time=00:10:00&format=hh:mm:ss&timer_style=glass
```

Contoh style `circle` dengan warna progress khusus:

```text
display.html?mode=countdown&time=00:01:30&format=mm:ss&timer_style=circle&text_color=%23F8FAFC&circle_color=%23FFFFFF&bg_color=%23081120
```

## OBS Tips

- Aktifkan `Shutdown source when not visible` jika scene berganti-ganti dan kamu ingin sumber browser lebih ringan.
- Untuk overlay transparan, aktifkan opsi `Transparent background` di builder lalu gunakan URL hasil output.
- Sesuaikan resolusi Browser Source dengan layout scene kamu, misalnya `1920x1080`.

## Performance Notes

- Preview builder hanya reload saat URL preview benar-benar berubah.
- Draft builder disimpan otomatis secara terkontrol di browser.
- Overlay timer menghitung waktu berdasarkan waktu aktual, bukan sekadar menghitung tick visual.
- Mode preview menjaga scaling otomatis agar overlay tetap muat di viewer.

## Struktur File

- `index.html`: halaman builder.
- `styles.css`: styling builder.
- `main.js`: logic builder, autosave, preview, URL generation.
- `display.html`: markup overlay output.
- `display.css`: styling overlay output.
- `script.js`: runtime timer untuk overlay.

## Pengembangan Lokal

Karena project ini berbasis file statis, kamu bisa menjalankannya dengan server lokal sederhana.

Contoh:

```bash
npx serve .
```

atau gunakan extension live server di editor.

## Lisensi

Proyek ini menggunakan lisensi MIT.
