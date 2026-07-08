import SmilesDrawer from "smiles-drawer";
import * as $3Dmol from "3dmol";
import { loadRDKit, analyzeSmiles } from "./chem/rdkit.js";
import { parseMolblock, atomCountsFromAtoms } from "./chem/molblock.js";
import { toHillFormula, molecularWeight } from "./chem/formula.js";

const form = document.getElementById("smiles-form");
const input = document.getElementById("smiles-input");
const status = document.getElementById("parse-status");
const canvas2d = document.getElementById("canvas-2d");
const panel2d = document.getElementById("panel-2d");
const panel3d = document.getElementById("panel-3d");
const renderButton = form.querySelector(".render-button");
const readoutFormula = document.getElementById("readout-formula");
const readoutWeight = document.getElementById("readout-weight");

const drawer = new SmilesDrawer.Drawer({ width: 1, height: 1 });
const viewer3d = $3Dmol.createViewer(document.getElementById("viewer-3d"), {
  backgroundColor: "#122a4a",
});

let RDKitModule = null;

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

function setReadout(formula, weight) {
  readoutFormula.textContent = formula ?? "—";
  readoutWeight.textContent = weight == null ? "—" : `${weight.toFixed(2)} g/mol`;
}

function render(smiles) {
  sizeCanvasToPanel(canvas2d);

  const analysis = analyzeSmiles(RDKitModule, smiles);
  if (!analysis.valid) {
    flashInvalid();
    setStatus("Could not parse that SMILES string.", "error");
    setReadout(null, null);
    return;
  }

  const { atoms } = parseMolblock(analysis.molblock);
  const counts = atomCountsFromAtoms(atoms);
  const formula = toHillFormula(counts);
  const weight = molecularWeight(counts);

  SmilesDrawer.parse(
    smiles,
    (tree) => {
      drawer.draw(tree, canvas2d, "dark");
      form.classList.remove("is-invalid");
      form.classList.add("is-valid");
      markFresh(panel2d);
      markFresh(panel3d);
      setReadout(formula, weight);
      setStatus(`Rendered ${formula} — ${weight.toFixed(2)} g/mol.`, "ok");
    },
    () => {
      flashInvalid();
      setStatus("Could not parse that SMILES string.", "error");
      setReadout(null, null);
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
  .then((RDKit) => {
    RDKitModule = RDKit;
    renderButton.disabled = false;
    renderButton.textContent = "render";
    render(input.value.trim());
  })
  .catch((error) => {
    setStatus("Failed to load the chemistry engine. Try reloading the page.", "error");
    console.error(error);
  });
