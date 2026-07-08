import SmilesDrawer from "smiles-drawer";
import * as $3Dmol from "3dmol";
import { loadRDKit } from "./chem/rdkit.js";

const form = document.getElementById("smiles-form");
const input = document.getElementById("smiles-input");
const status = document.getElementById("parse-status");
const canvas2d = document.getElementById("canvas-2d");
const panel2d = document.getElementById("panel-2d");
const panel3d = document.getElementById("panel-3d");
const renderButton = form.querySelector(".render-button");

const drawer = new SmilesDrawer.Drawer({ width: 1, height: 1 });
const viewer3d = $3Dmol.createViewer(document.getElementById("viewer-3d"), {
  backgroundColor: "#122a4a",
});

function sizeCanvasToPanel(canvas) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
}

function setStatus(message, state) {
  status.textContent = message;
  status.dataset.state = state || "";
}

function flashInvalid() {
  form.classList.remove("is-valid");
  form.classList.add("is-invalid");
  setTimeout(() => form.classList.remove("is-invalid"), 320);
}

function markFresh(panel) {
  panel.classList.remove("is-fresh");
  // Force reflow so the class can be re-added to replay the animation.
  void panel.offsetWidth;
  panel.classList.add("is-fresh");
}

function render(smiles) {
  sizeCanvasToPanel(canvas2d);

  SmilesDrawer.parse(
    smiles,
    (tree) => {
      drawer.draw(tree, canvas2d, "dark");
      form.classList.remove("is-invalid");
      form.classList.add("is-valid");
      markFresh(panel2d);
      markFresh(panel3d);
      setStatus(
        "2D structure rendered. 3D generation and formula/weight land in the next build phase.",
        "ok"
      );
    },
    () => {
      flashInvalid();
      setStatus("Could not parse that SMILES string.", "error");
    }
  );
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const smiles = input.value.trim();
  if (smiles) render(smiles);
});

window.addEventListener("resize", () => sizeCanvasToPanel(canvas2d));

viewer3d.render();

renderButton.disabled = true;
renderButton.textContent = "loading…";
setStatus("Loading chemistry engine…", "");

loadRDKit()
  .then(() => {
    renderButton.disabled = false;
    renderButton.textContent = "render";
    render(input.value.trim());
  })
  .catch((error) => {
    setStatus("Failed to load the chemistry engine. Try reloading the page.", "error");
    console.error(error);
  });
