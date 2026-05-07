import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "temporary screenshots");

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] ? `-${process.argv[3]}` : "";

// Find next available screenshot number
const existing = fs.readdirSync(dir).filter((f) => f.endsWith(".png"));
const nums = existing
  .map((f) => parseInt(f.match(/screenshot-(\d+)/)?.[1] ?? "0"))
  .filter((n) => !isNaN(n));
const next = nums.length ? Math.max(...nums) + 1 : 1;

const filename = `screenshot-${next}${label}.png`;
const outPath = path.join(dir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: "networkidle2" });
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Saved: temporary screenshots/${filename}`);
