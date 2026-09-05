import { Router, type IRouter } from "express";

const router: IRouter = Router();

const readText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

router.post("/issue-submissions", async (req, res) => {
  const title = readText(req.body?.title);
  const category = readText(req.body?.category);
  const description = readText(req.body?.description);
  const author = readText(req.body?.author);
  const email = readText(req.body?.email);

  if (!title || !category || !description) {
    return res.status(400).json({
      error: "Judul isu, kategori, dan deskripsi wajib diisi.",
    });
  }

  if (title.length > 160 || category.length > 80 || description.length > 4000) {
    return res.status(400).json({
      error: "Judul, kategori, atau deskripsi melebihi batas karakter.",
    });
  }

  if (author.length > 120 || email.length > 254) {
    return res.status(400).json({
      error: "Nama atau email melebihi batas karakter.",
    });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      error: "Format email belum valid.",
    });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();

  // No database write is performed. The browser stores a temporary local
  // copy when the webhook is intentionally not configured.
  if (!webhookUrl) {
    return res.json({ success: true, delivery: "local" });
  }

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "pecintaKalah",
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: "Pengajuan isu baru",
            color: 16724047,
            fields: [
              { name: "Judul isu", value: title, inline: false },
              { name: "Kategori", value: category, inline: true },
              {
                name: "Pengaju",
                value: author || "Tidak dicantumkan",
                inline: true,
              },
              {
                name: "Email",
                value: email || "Tidak dicantumkan",
                inline: true,
              },
              { name: "Deskripsi", value: description, inline: false },
            ],
            footer: { text: "Menunggu tinjauan admin · pecintaKalah" },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!discordResponse.ok) {
      req.log.error(
        { status: discordResponse.status },
        "Discord webhook rejected issue submission",
      );
      return res.status(502).json({
        error: "Pengajuan belum dapat diteruskan ke admin. Coba lagi sebentar.",
      });
    }

    return res.json({ success: true, delivery: "discord" });
  } catch (error) {
    req.log.error({ err: error }, "Discord webhook request failed");
    return res.status(502).json({
      error: "Layanan pengajuan sedang tidak tersedia. Coba lagi sebentar.",
    });
  }
});

export default router;