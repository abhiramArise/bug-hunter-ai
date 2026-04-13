const express = require("express");
const { chromium } = require("playwright");
const cors = require("cors");
const { analyzeWebsite } = require("./ai-service");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Debug Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;

app.post("/api/analyze", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  let browser;
  try {
    console.log(`Starting analysis for: ${url}`);
    
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    // Capture console logs
    const consoleLogs = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleLogs.push(msg.text());
    });

    // Navigate to URL with better retry/wait logic
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    // Wait a bit more for dynamic content, but don't strictly require networkidle
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {
      console.log("Network didn't go idle, proceeding with analysis anyway.");
    }

    // Capture Screenshot (Base64)
    const screenshot = await page.screenshot({ fullPage: true });
    const screenshotBase64 = screenshot.toString("base64");

    // Extract Text Content / Simplified DOM
    const bodyText = await page.evaluate(() => {
      // Basic cleanup to reduce tokens
      return document.body.innerText;
    });

    // AI Analysis
    const report = await analyzeWebsite(screenshotBase64, bodyText, consoleLogs);

    res.json({
      url,
      timestamp: new Date().toISOString(),
      report,
      screenshot: `data:image/png;base64,${screenshotBase64}`
    });

  } catch (error) {
    console.error("Analysis failed:", error);
    res.status(500).json({ error: "Analysis failed", details: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
