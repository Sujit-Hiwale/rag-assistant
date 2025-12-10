import express from "express";
import formidable from "formidable";
import fs from "fs";
import path from "path";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      allowEmptyFiles: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ error: "Failed to parse upload" });
      }

      // FIX: Formidable returns an ARRAY of files
      const uploadedFiles = files.file as any[];

      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = uploadedFiles[0]; // first file

      const tempPath = file.filepath;
      if (!tempPath) {
        console.error("Correct file object:", file);
        return res.status(500).json({ error: "Could not read file path" });
      }

      const fileName =
        file.originalFilename ||
        file.newFilename ||
        "uploaded_file.pdf";

      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const destPath = path.join(uploadsDir, fileName);

      // Move file from /tmp → uploads/
      fs.copyFileSync(tempPath, destPath);

      console.log("Uploaded:", destPath);

      res.json({ fileName });
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
