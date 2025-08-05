require("dotenv").config();
const express = require("express");
const cors = require("cors");
const archiver = require("archiver");
const stream = require("stream");
const { nanoid } = require("nanoid");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;

app.post("/deploy", async (req, res) => {
  const { html } = req.body;

  if (!html || typeof html !== "string") {
    return res.status(400).json({ error: "Invalid HTML content" });
  }

  const siteId = "flash-site-" + nanoid(6);

  try {
    // ✅ Step 1: Create in-memory ZIP
    const zipStream = new stream.PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(zipStream);
    archive.append(html, { name: "index.html" });
    archive.append("/*\n  Content-Type: text/html", { name: "_headers" });
    archive.finalize();

    // ✅ Step 2: Upload the in-memory zip directly to Netlify
    const siteResponse = await axios.post(
      "https://api.netlify.com/api/v1/sites",
      { name: siteId },
      {
        headers: {
          Authorization: `Bearer ${NETLIFY_TOKEN}`,
        },
      }
    );

    const site = siteResponse.data;
    console.log("🌐 Site created:", site.name);

    // Collect zip buffer
    const chunks = [];
    zipStream.on("data", chunk => chunks.push(chunk));

    zipStream.on("end", async () => {
      const zipBuffer = Buffer.concat(chunks);

      const deployResponse = await axios.post(
        `https://api.netlify.com/api/v1/sites/${site.id}/deploys`,
        zipBuffer,
        {
          headers: {
            Authorization: `Bearer ${NETLIFY_TOKEN}`,
            "Content-Type": "application/zip",
          },
        }
      );

      const url = `https://${site.name}.netlify.app`;
      console.log("✅ Deployed to:", url);
      res.json({ message: "✅ Site deployed successfully!", url });
    });

    zipStream.on("error", (err) => {
      throw err;
    });

  } catch (error) {
    console.error("❌ Deployment error:", error.response?.data || error.message);
    res.status(500).json({ error: "Deployment failed" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});