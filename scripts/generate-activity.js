const fs = require("fs");
const path = require("path");

const repos = [
  ["modelizer-next", "UnKabaraQuiDev", "Modelizer-Next"],
  ["pclib", "UnKabaraQuiDev", "PCLib"],
  ["lu-1ci-scipr", "UnKabaraQuiDev", "lu_1ci_scipr"],
  ["plant-game", "UnKabaraQuiDev", "plant-game"],
  ["standalone-gameengine", "UnKabaraQuiDev", "StandaloneGameEngine"],
  ["lu-2ci-scipr", "UnKabaraQuiDev", "lu_2ci_scipr"],
  ["lu-3ci-scipr", "UnKabaraQuiDev", "lu_3ci_scipr"],
  ["rescue-rush", "RescueRush", "RescueRush"],
  ["esp32-ambient-sensors", "UnKabaraQuiDev", "esp32s3-ambient-sensors"],
  ["gameboxes", "UnKabaraQuiDev", "GameBoxES"],
  ["letzguess-bot", "UnKabaraQuiDev", "letzguess_bot"],
  ["stock-exchange-simulation", "UnKabaraQuiDev", "StockExchangeSimulation"],
  ["windows-2000", "UnKabaraQuiDev", "Windows2000"],
  ["l3lang", "UnKabaraQuiDev", "L3Lang"],
  ["packets4j", "UnKabaraQuiDev", "packets4j"],
  ["jbcodec", "UnKabaraQuiDev", "jbcodec"],
  ["multiskyblockutils", "UnKabaraQuiDev", "MultiSkyblockUtils"],
  ["extended-generators", "UnKabaraQuiDev", "extended-generators"],
  ["hard-surface-utils", "UnKabaraQuiDev", "hard_surf_utils"],
  ["shade-auto-utils", "UnKabaraQuiDev", "shade_auto_utils"],
  ["talking", "UnKabaraQuiDev", "talking"],
  ["javasocketapi", "UnKabaraQuiDev", "JavaSocketAPI"],
  ["quick-java-database", "UnKabaraQuiDev", "quickjavadatabase"]
];

const token = process.env.GITHUB_TOKEN;
const outDir = path.join("assets", "activity");

fs.mkdirSync(outDir, { recursive: true });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getActivity(owner, repo) {
  const url = `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`;

  for (let attempt = 1; attempt <= 8; attempt++) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10"
      }
    });

    if (res.status === 200) {
      return await res.json();
    }

    if (res.status === 202) {
      console.log(`${owner}/${repo}: stats not ready, retry ${attempt}/8`);
      await sleep(15000);
      continue;
    }

    console.log(`${owner}/${repo}: GitHub returned ${res.status}`);
    return [];
  }

  return [];
}

function makeEmptySvg() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 208 44" role="img">
  <title>No GitHub activity data available</title>
  <rect x="0" y="0" width="208" height="44" rx="6" fill="#eef3f8"/>
  <text x="104" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#667085">
    No activity data
  </text>
</svg>`.trim();
}

function makeSvg(data) {
  const weeks = data.slice(-26);

  if (!weeks.length) {
    return makeEmptySvg();
  }

  const max = Math.max(...weeks.map(week => week.total), 1);

  const bars = weeks.map((week, i) => {
    const height = week.total === 0 ? 2 : Math.max((week.total / max) * 36, 3);
    const x = i * 8;
    const y = 40 - height;

    return `<rect x="${x}" y="${y}" width="5" height="${height}" rx="1" fill="#2563eb" />`;
  }).join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 208 44" role="img">
  <title>GitHub activity over the last 26 weeks</title>
  <rect x="0" y="0" width="208" height="44" rx="6" fill="#eef3f8"/>
  <g>${bars}</g>
</svg>`.trim();
}

async function main() {
  for (const [fileName, owner, repo] of repos) {
    const data = await getActivity(owner, repo);
    const svg = makeSvg(Array.isArray(data) ? data : []);

    fs.writeFileSync(
      path.join(outDir, `${fileName}.svg`),
      svg
    );
  }
}

main();