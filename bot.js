require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const mysql = require("mysql2/promise");
const cron = require("node-cron");
const qrcode = require("qrcode-terminal");

// Konfigurasi koneksi database
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

// Nomor penerima pesan (nomor pribadi atau grup, format: 62xxxxx@c.us atau groupId@g.us)
const tujuan = "120363418537877018@g.us"; // Ganti dengan nomor tujuan

// Inisialisasi WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth(),
});

// Tampilkan QR code di terminal saat login
client.on("qr", (qr) => {
  console.log("Scan QR code ini untuk login WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("Bot WhatsApp siap digunakan!");
  // Tunggu 3 detik supaya WhatsApp Web siap
  setTimeout(async () => {
    try {
      const chats = await client.getChats();
      const groups = chats.filter((chat) => chat.isGroup);

      console.log("Grup yang tersedia:");
      groups.forEach((group) => {
        console.log(`Nama Grup: ${group.name} | ID: ${group.id._serialized}`);
      });
    } catch (err) {
      console.error("Gagal ambil grup:", err.message);
    }
  }, 20000);
  // Jadwalkan setiap hari jam 17:00 (5 sore)
  cron.schedule("46 12 * * *", async () => {
    try {
      const connection = await mysql.createConnection(dbConfig);

      // Ambil total pemakaian data hari ini sbi
      const [rows] = await connection.execute(`
                SELECT SUM(data_bytes) AS total_bytes 
                FROM ip_activity_log 
                WHERE DATE(tanggal_jam) = CURDATE()
            `);

      // Ambil total pemakaian data hari ini sbi
      const [rows_sap] = await connection.execute(`
                SELECT SUM(data_bytes) AS total_bytes 
                FROM ip_activity_log_sap 
                WHERE DATE(tanggal_jam) = CURDATE()
            `);

      const total = rows[0].total_bytes || 0;
      const totalMB = (total / 1048576).toFixed(2);

      const total_sap = rows_sap[0].total_bytes || 0;
      const totalMB_sap = (total_sap / 1048576).toFixed(2);

      var pesan = `Total Pemakaian Internet Hari ini:\n`;
      pesan = pesan + `SBI : ${totalMB} MB`;
      pesan = pesan + `\nSAP : ${totalMB_sap} MB`;
      await client.sendMessage(tujuan, pesan);
      console.log("Pesan berhasil dikirim:", pesan);

      await connection.end();
    } catch (err) {
      console.error("Gagal kirim pesan:", err.message);
    }
  });
});

client.initialize();
