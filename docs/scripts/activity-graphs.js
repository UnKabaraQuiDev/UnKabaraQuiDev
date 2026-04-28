const ACTIVITY_DIR = "assets/activity";
const LARGE_CARD_MIN_WIDTH = 520;

function slug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getSvgPaths(owner, repo) {
  return [
    `${ACTIVITY_DIR}/${slug(owner)}-${slug(repo)}.svg`,
    `${ACTIVITY_DIR}/${slug(repo)}.svg`
  ];
}

async function loadSvg(paths) {
  for (const path of paths) {
    try {
      const res = await fetch(path);

      if (!res.ok) continue;

      const text = await res.text();
      console.log(text.trim());
      if (text.trim().startsWith("<svg")) {
        return text;
      }
    } catch {
      // try next path
    }
  }

  return null;
}

function colorizeSvg(svg) {
  return svg
    .replace(/stroke="black"/g, 'stroke="currentColor"')
    .replace(/stroke="#000"/g, 'stroke="currentColor"')
    .replace(/stroke="#000000"/g, 'stroke="currentColor"')
    .replace(/fill="black"/g, 'fill="currentColor"')
    .replace(/fill="#000"/g, 'fill="currentColor"')
    .replace(/fill="#000000"/g, 'fill="currentColor"');
}

function createMissingIcon() {
  const el = document.createElement("div");
  el.className = "activity-graph activity-graph-missing";
  el.innerHTML = "▧";
  el.setAttribute("aria-label", "GitHub activity graph not found");
  return el;
}

function updateGraphLayout(card) {
  const isLarge = card.offsetWidth >= LARGE_CARD_MIN_WIDTH;

  card.classList.toggle("has-side-activity-graph", isLarge);
  card.classList.toggle("has-bg-activity-graph", !isLarge);
}

async function addActivityGraph(card) {
  const owner = card.dataset.githubOwner;
  const repo = card.dataset.githubRepo;

  if (!owner || !repo) return;

  card.querySelectorAll("img.activity-graph, .activity-graph").forEach(el => {
    el.remove();
  });

  const svg = await loadSvg(getSvgPaths(owner, repo));

  const wrapper = document.createElement("div");
  wrapper.className = "activity-graph";

  if (svg) {
    wrapper.innerHTML = colorizeSvg(svg);
    wrapper.setAttribute("aria-label", `${repo} GitHub activity graph`);
  } else {
    wrapper.replaceWith(createMissingIcon());
    card.appendChild(createMissingIcon());
    updateGraphLayout(card);
    return;
  }

  card.appendChild(wrapper);
  updateGraphLayout(card);
}

function initActivityGraphs() {
  const cards = document.querySelectorAll(
    ".project-card[data-github-owner][data-github-repo]"
  );

  cards.forEach(addActivityGraph);

  const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
      updateGraphLayout(entry.target);
    }
  });

  cards.forEach(card => observer.observe(card));
}

document.addEventListener("DOMContentLoaded", initActivityGraphs);