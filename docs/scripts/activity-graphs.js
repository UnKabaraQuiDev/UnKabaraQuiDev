const ACTIVITY_DIR = "assets/activity";

function slug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function updateGraphMode(card) {
  const width = card.offsetWidth;

  console.log(`size: ${width}`, card)
  if (width > 1000) {
    card.classList.add("graph-full");
  } else {
    card.classList.remove("graph-full");
  }
}

function addActivityGraph(card) {
  const owner = card.dataset.githubOwner;
  const repo = card.dataset.githubRepo;

  if (!owner || !repo) return;

  card.querySelectorAll(".activity-graph").forEach(el => el.remove());

  const img = document.createElement("img");
  img.className = "activity-graph";
  img.src = `assets/activity/${slug(owner)}-${slug(repo)}.svg`;
  img.alt = "";
  img.loading = "lazy";
  img.setAttribute("aria-hidden", "true");
  console.log(`${owner} ${repo} ${slug(owner)} ${slug(repo)}`);
  img.onerror = () => {
    img.remove();
  };

  card.appendChild(img);

  updateGraphMode(card);
}

function initActivityGraphs() {
  const cards = document.querySelectorAll(
    ".project-card[data-github-owner][data-github-repo]"
  );

  cards.forEach(addActivityGraph);
}

document.addEventListener("DOMContentLoaded", initActivityGraphs);