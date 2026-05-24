import { put } from "@vercel/blob";
import { publishSingleImage } from "../../lib/instagram";

// Accepts a base64 PNG + caption, hosts it on Vercel Blob to get a public URL,
// publishes it to Instagram as a single post, then deletes the temp blob.
export const config = {
  api: {
    bodyParser: { sizeLimit: "12mb" }, // HD PNGs can be a few MB
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      error:
        "Vercel Blob is not configured. Create a Blob store in your Vercel project (Storage tab).",
    });
  }

  const { imageBase64, caption } = req.body || {};
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return res.status(400).json({ error: "Missing image data." });
  }

  let blob = null;
  try {
    // Decode the data URL / base64 into a Buffer.
    const base64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    // Upload to Blob with a unique name; public so Instagram can fetch it.
    const filename = `ig/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.png`;
    blob = await put(filename, buffer, {
      access: "public",
      contentType: "image/png",
    });

    // Publish to Instagram using the public URL.
    const { mediaId } = await publishSingleImage({
      imageUrl: blob.url,
      caption: caption || "",
    });

    return res.status(200).json({ mediaId, imageUrl: blob.url });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to post to Instagram." });
  }
}
