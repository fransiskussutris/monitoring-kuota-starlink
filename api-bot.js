require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const app = express();
app.use(bodyParser.json());

// --- Konfigurasi Database ---
// --- Konfigurasi Database dari .env ---
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

// --- Inisialisasi WhatsApp Client ---
const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot WhatsApp siap digunakan!");
});

client.initialize();

// --- API Endpoint ---
app.post("/api/kuota", async (req, res) => {
  const dataList = req.body; // array of rows dari VB.NET

  if (!Array.isArray(dataList) || dataList.length === 0) {
    return res.status(400).json({ error: "data kosong / tidak valid" });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);

    for (const d of dataList) {
      await conn.execute(
        `INSERT INTO kuota (date, service_line, quota_usage, quota_current, quota_day, location_name, date_inserted) 
         VALUES (CURDATE(), ?, ?, ?, ?, ?, NOW())`,
        [d.service_line, d.quota_usage, d.quota_current, d.quota_day, d.location_name]
      );

      // 📩 Kirim pesan ke grup WhatsApp
      const tujuan = "120363418537877018@g.us"; // <- ganti dengan Group ID kamu
      let pesan = `📊 Update Kuota Starlink\n`;
      pesan += `Service Line: ${d.service_line}\n`;
      pesan += `Usage: ${d.quota_usage}\n`;
      pesan += `Current: ${d.quota_current}\n`;
      pesan += `Day: ${d.quota_day}\n`;
      pesan += `Lokasi: ${d.location_name}`;

      await client.sendMessage(tujuan, pesan);
    }

    await conn.end();
    res.json({ status: "ok", message: "Semua data tersimpan & terkirim" });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Gagal proses data" });
  }
});

app.listen(3000, () => console.log("🚀 API berjalan di http://localhost:3000"));
