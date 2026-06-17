import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import https from "https";
import http from "http";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add the proxy endpoint first
  app.get("/api/proxy", async (req, res) => {
    let targetUrl = req.query.url as string;
    
    if (!targetUrl) {
      return res.status(400).send("No url provided");
    }

    try {
      if (targetUrl.includes('webcams.thesnowcloud.com') && targetUrl.includes('webcam_name')) {
         // Custom scraper for thesnowcloud
         const mainPageRes = await fetch('https://webcams.thesnowcloud.com/');
         const mainPageHtml = await mainPageRes.text();
         
         const webcamName = targetUrl.split('webcam_name=')[1];
         // Search the HTML for the webcam name and find its corresponding img source
         const regex = new RegExp(`<img[^>]+src=['"]([^'"]+)['"][\\s\\S]*?webcam_name=${webcamName}`, 'gi');
         const match = regex.exec(mainPageHtml);
         
         if (match && match[1]) {
           targetUrl = `https://webcams.thesnowcloud.com${match[1]}`;
         } else {
           // fallback regex to look for naming ahead of the image
           const bgRegex = new RegExp(`webcam_name=${webcamName}[\\s\\S]*?<img[^>]+src=['"]([^'"]+)['"]`, 'gi');
           const bgMatch = bgRegex.exec(mainPageHtml);
           if (bgMatch && bgMatch[1]) {
             targetUrl = `https://webcams.thesnowcloud.com${bgMatch[1]}`;
           } else {
             return res.status(404).send("Webcam image not found on thesnowcloud");
           }
         }
      }

      // Fetch the actual image using User-Agent trick for FAA and others
      const headers = new Headers();
      headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      const fetchOpts = {
        headers,
        redirect: 'follow'
      } as any;
      
      const imageRes = await fetch(targetUrl, fetchOpts);
      
      if (!imageRes.ok) {
        return res.status(imageRes.status).send(`Failed to fetch image: ${imageRes.statusText}`);
      }

      const contentType = imageRes.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      res.setHeader('Cache-Control', 'public, max-age=60'); // simple cache

      const buffer = await imageRes.arrayBuffer();
      res.send(Buffer.from(buffer));

    } catch (e: any) {
      console.error('Proxy error:', e.message);
      res.status(500).send("Proxy error: " + e.message);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
