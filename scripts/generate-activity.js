import fs from "fs";
import path from "path";
import { load } from "cheerio";

const USER = "UnKabaraQuiDev";
const URL = `https://github.com/${USER}?tab=repositories`;
const OUT_DIR = "assets/activity";

fs.mkdirSync(OUT_DIR, { recursive: true });

async function fetchHTML() {
  const res = await fetch(URL, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub page: ${res.status}`);
  }

  return await res.text();
}

function extractRepos(html) {
  const $ = load(html);
  const repos = [];

  $("li[itemprop='owns']").each((_, el) => {
    const name = $(el)
      .find("h3 a")
      .text()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const svg = $(el).find("svg").last(); // sparkline SVG is the last one

    if (!name || svg.length === 0) return;

    repos.push({
      name,
      svg: $.html(svg)
    });
  });

  return repos;
}

function cleanSvg(svg) {
  // remove inline styles that depend on GitHub CSS variables
  return svg
    .replace(/var\([^)]+\)/g, "#8cc665") // fallback green
    .replace(/width="[^"]+"/, 'width="155"')
    .replace(/height="[^"]+"/, 'height="30"');
}

function saveSvg(name, svg) {
  const file = path.join(OUT_DIR, `${name}.svg`);

  fs.writeFileSync(file, cleanSvg(svg));
  console.log(`Saved ${file}`);
}

async function main() {
  const html = await fetchHTML();
  const repos = extractRepos(html);

  for (const repo of repos) {
    saveSvg(repo.name, repo.svg);
  }
}

main();