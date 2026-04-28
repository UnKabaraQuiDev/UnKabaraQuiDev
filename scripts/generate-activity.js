
const fs = require("fs");
const path = require("path");

const repos = [
  {
    name: "modelizer-next",
    owner: "UnKabaraQuiDev",
    repo: "Modelizer-Next"
  },
  {
    name: "pclib",
    owner: "Poucy113",
    repo: "PCLib"
  }
];

const token = process.env.GITHUB_TOKEN;
const outDir = path.join("assets", "activity");

fs.mkdirSync(outDir, { recursive: true });

async function getActivity(owner, repo) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json"
      }
    }
  );

  if (!res.ok) return [];
  return await res.json();
}

function makeSvg(data) {
  const weeks = data.slice(-26);
  const max = Math.max(...weeks.map(w => w.total), 1);

  const bars = weeks.map((week, i) => {
    const height = Math.max((week.total / max) * 36, week.total ? 3 : 1);
    const x = i * 8;
    const y = 40 - height;

    return `<rect x="${x}" y="${y}" width="5" height="${height}" rx="1" />`;
  }).join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 208 44" role="img">
  <title>GitHub activity over the last 26 weeks</title>
  <g fill="currentColor">
    ${bars}
  </g>
</svg>`.trim();
}

async function main() {
  for (const item of repos) {
    const data = await getActivity(item.owner, item.repo);
    const svg = makeSvg(Array.isArray(data) ? data : []);

    fs.writeFileSync(
      path.join(outDir, `${item.name}.svg`),
      svg
    );
  }
}

main();