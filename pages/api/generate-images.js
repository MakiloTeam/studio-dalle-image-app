import { Configuration, OpenAIApi } from "openai";
import multer from "multer";
// import sharp from 'sharp';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(png)$/)) {
      return cb(new Error("Only PNG images are allowed."));
    }
    cb(null, true);
  },
});

const uploadMiddleware = upload.single("image");

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const n = parseInt(req.query.n);

  if (isNaN(n) || n < 1 || n > 10) {
    res.status(400).json({ error: "Invalid value for n." });
    return;
  }

  uploadMiddleware(req, res, async (error) => {
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    try {
      /* const image = await sharp(req.file.buffer)
        .resize({ width: 1024, height: 1024, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toBuffer(); */
      const image = req.file.buffer;
      image.name = "image.png";

      const response = await openai.createImageVariation(image, n, "1024x1024");

      res.status(200).json(response.data);
      return;
    } catch (error) {
      if (error.response) {
        console.error(error.response.status);
        console.error(error.response.data);
        res.status(error.response.status).json({ error: error.response.data.error.message });
      } else if (error.message) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
      } else {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
      return;
    }
  });
}

export default handler;
