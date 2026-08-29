import { Router, type IRouter } from "express";
import { getSupabaseClient } from "../lib/supabase";

const router: IRouter = Router();

const fakeAuthors = ["Aktivis_Jalanan", "Anon_Kritis", "Rakyat_Biasa"];
const fakeReplies = [
  "Gue setuju banget. Solusinya pemda harus open data soal alokasi dana infrastruktur daerah ini.",
  "Menurut saya, kita harus galang petisi online juga selain donasi, biar diteken langsung sama bupati.",
  "Betul, pengawasan langsung dari warga kayak gini yang bikin birokrasi ga bisa main-main lagi.",
];

const readText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

router.get("/comments", async (req, res) => {
  const issueId = readText(req.query["issue_id"]);

  if (!issueId) {
    return res.status(400).json({ error: "issue_id wajib diisi." });
  }

  try {
    const { data, error } = await getSupabaseClient()
      .from("comments")
      .select("*")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (error) {
      req.log.error({ err: error, issueId }, "Failed to fetch issue comments");
      return res
        .status(502)
        .json({ error: "Komentar belum dapat dimuat. Coba lagi sebentar." });
    }

    return res.json(data ?? []);
  } catch (error) {
    req.log.error({ err: error, issueId }, "Unexpected comments fetch error");
    return res
      .status(503)
      .json({ error: "Layanan diskusi sedang tidak tersedia." });
  }
});

router.post("/comments", async (req, res) => {
  const issueId = readText(req.body?.issue_id);
  const author = readText(req.body?.author);
  const content = readText(req.body?.content);

  if (!issueId || !author || !content) {
    return res
      .status(400)
      .json({ error: "issue_id, author, dan content wajib diisi." });
  }

  if (content.length > 1000) {
    return res
      .status(400)
      .json({ error: "Komentar maksimal 1000 karakter." });
  }

  try {
    const supabase = getSupabaseClient();
    const { data: userComment, error: userCommentError } = await supabase
      .from("comments")
      .insert({ issue_id: issueId, author, content })
      .select()
      .single();

    if (userCommentError) {
      req.log.error(
        { err: userCommentError, issueId },
        "Failed to insert user comment",
      );
      return res
        .status(502)
        .json({ error: "Komentar belum tersimpan. Coba lagi sebentar." });
    }

    const fakeAuthor =
      fakeAuthors[Math.floor(Math.random() * fakeAuthors.length)];
    const fakeReply =
      fakeReplies[Math.floor(Math.random() * fakeReplies.length)];
    const { data: botComment, error: botCommentError } = await supabase
      .from("comments")
      .insert({
        issue_id: issueId,
        author: fakeAuthor,
        content: fakeReply,
      })
      .select()
      .single();

    if (botCommentError) {
      req.log.error(
        { err: botCommentError, issueId },
        "Failed to insert fake netizen reply",
      );
      return res.status(201).json({
        comment: userComment,
        botComment: null,
        warning: "Komentar tersimpan, tetapi balasan otomatis belum tersedia.",
      });
    }

    return res.status(201).json({ comment: userComment, botComment });
  } catch (error) {
    req.log.error({ err: error, issueId }, "Unexpected comments write error");
    return res
      .status(503)
      .json({ error: "Layanan diskusi sedang tidak tersedia." });
  }
});

export default router;