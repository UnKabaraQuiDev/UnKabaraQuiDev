import fs from "fs";
import path from "path";
import { load } from "cheerio";

const INDEX_FILE = "../docs/index.html";
const OUT_DIR = "../docs/assets/activity";

fs.mkdirSync(OUT_DIR, { recursive: true });

function getReposFromIndex() {
  const html = fs.readFileSync(INDEX_FILE, "utf8");
  const $ = load(html);

  const repos = [];

  $("[data-github-owner][data-github-repo]").each((_, el) => {
    const owner = $(el).attr("data-github-owner")?.trim();
    const repo = $(el).attr("data-github-repo")?.trim();

    if (!owner || !repo) return;

    repos.push({ owner, repo });
  });

  return repos;
}

function cleanSvg(svg) {
  return svg
//    .replace(/var\([^)]+\)/g, "#8cc665")
    .replace(/width="[^"]+"/, 'width="155"')
    .replace(/height="[^"]+"/, 'height="30"');
}

async function fetchSvg(owner, repo) {
  const url = `https://github.com/${owner}/${repo}/graphs/participation?h=28&type=sparkline&w=155`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 16; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.12.45 Mobile Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });

  if (!res.ok) {
    console.log(res);
    throw new Error(`Failed to fetch SVG for ${owner}/${repo}: ${res.status}`);
  }

  return await res.text();
}

function saveSvg(owner, repo, svg) {
  const safeOwner = owner.toLowerCase().replace(/\s+/g, "-");
  const safeRepo = repo.toLowerCase().replace(/\s+/g, "-");

  const file = path.join(OUT_DIR, `${safeOwner}-${safeRepo}.svg`);

  fs.writeFileSync(file, cleanSvg(svg), "utf8");
  console.log(`Saved ${file}`);
}

async function main() {
  const repos = getReposFromIndex();

  if (repos.length === 0) {
    console.log("No GitHub repo tags found.");
    return;
  }

  for (const { owner, repo } of repos) {
    try {
      const svg = await fetchSvg(owner, repo);
      saveSvg(owner, repo, svg);
    } catch (error) {
      console.error(error.message);
    }
  }
}

main();