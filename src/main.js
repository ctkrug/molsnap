import SmilesDrawer from "smiles-drawer";
import * as $3Dmol from "3dmol";
import { loadRDKit, analyzeSmiles } from "./chem/rdkit.js";
import { parseMolblock, toMolblock, atomCountsFromAtoms } from "./chem/molblock.js";
import { embed3d } from "./chem/embed3d.js";
import { toHillFormula, molecularWeight } from "./chem/formula.js";
import { isTooLong, MAX_SMILES_LENGTH } from "./chem/validateInput.js";

const form = document.getElementById("smiles-form");
const input = document.getElementById("smiles-input");
const status = document.getElementById("parse-status");
const canvas2d = document.getElementById("canvas-2d");
const panel2d = document.getElementById("panel-2d");
const panel3d = document.getElementById("panel-3d");
const renderButton = form.querySelector(".render-button");
const readoutFormula = document.getElementById("readout-formula");
const readoutWeight = document.getElementById("readout-weight");
const spinToggle = document.getElementById("spin-toggle");
const exampleChips = document.getElementById("example-chips");
const copySmilesButton = document.getElementById("copy-smiles");
const copyFormulaButton = document.getElementById("copy-formula");

const viewer3d = $3Dmol.createViewer(document.getElementById("viewer-3d"), {
  backgroundColor: "#122a4a",
});

const SPIN_SPEED = 0.6;

let RDKitModule = null;
let spinEnabled = true;

function draw2d(tree) {
  const rect = canvas2d.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const drawer = new SmilesDrawer.Drawer({
    width: Math.max(1, Math.round(rect.width * ratio)),
    height: Math.max(1, Math.round(rect.height * ratio)),
  });
  drawer.draw(tree, canvas2d, "dark");
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

function copyToClipboard(text, button) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const originalLabel = button.getAttribute("aria-label");
    button.classList.add("is-copied");
    button.setAttribute("aria-label", "Copied!");
    setTimeout(() => {
      button.classList.remove("is-copied");
      button.setAttribute("aria-label", originalLabel);
    }, 1500);
  });
}

function setReadout(formula, weight) {
  readoutFormula.textContent = formula ?? "—";
  readoutWeight.textContent = weight == null ? "—" : `${weight.toFixed(2)} g/mol`;
}

function clearPanels() {
  const ctx2d = canvas2d.getContext("2d");
  if (ctx2d) ctx2d.clearRect(0, 0, canvas2d.width, canvas2d.height);
  viewer3d.clear();
  viewer3d.render();
}

function render3d(atoms, bonds) {
  const positioned = embed3d(atoms, bonds);
  const molblock = toMolblock(positioned, bonds);

  viewer3d.clear();
  viewer3d.addModel(molblock, "sdf");
  viewer3d.setStyle({}, { stick: { radius: 0.12 }, sphere: { scale: 0.25 } });
  viewer3d.zoomTo();
  viewer3d.render();
  viewer3d.spin(spinEnabled ? "y" : false, SPIN_SPEED);
}

function updateUrl(smiles) {
  const url = new URL(window.location.href);
  url.searchParams.set("smiles", smiles);
  window.history.replaceState(null, "", url);
}

function render(smiles) {
  if (isTooLong(smiles)) {
    flashInvalid();
    setStatus(`SMILES is too long (max ${MAX_SMILES_LENGTH} characters).`, "error");
    setReadout(null, null);
    clearPanels();
    return;
  }

  const analysis = analyzeSmiles(RDKitModule, smiles);
  if (!analysis.valid) {
    flashInvalid();
    setStatus("Could not parse that SMILES string.", "error");
    setReadout(null, null);
    clearPanels();
    return;
  }

  const { atoms, bonds } = parseMolblock(analysis.molblock);
  const counts = atomCountsFromAtoms(atoms);
  const formula = toHillFormula(counts);
  const weight = molecularWeight(counts);

  SmilesDrawer.parse(
    smiles,
    (tree) => {
      draw2d(tree);
      form.classList.remove("is-invalid");
      form.classList.add("is-valid");
      markFresh(panel2d);
      markFresh(panel3d);
      setReadout(formula, weight);
      updateUrl(smiles);

      try {
        render3d(atoms, bonds);
        setStatus(`Rendered ${formula}, ${weight.toFixed(2)} g/mol.`, "ok");
      } catch (error) {
        console.error(error);
        setStatus(
          `Rendered ${formula}, ${weight.toFixed(2)} g/mol. 3D isn't available for this molecule.`,
          "ok"
        );
      }
    },
    () => {
      flashInvalid();
      setStatus("Could not parse that SMILES string.", "error");
      setReadout(null, null);
      clearPanels();
    }
  );
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const smiles = input.value.trim();
  if (smiles) render(smiles);
});

let resizeTimeout = null;
window.addEventListener("resize", () => {
  viewer3d.resize();
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const smiles = input.value.trim();
    if (smiles) render(smiles);
  }, 150);
});

copySmilesButton.addEventListener("click", () => {
  copyToClipboard(input.value.trim(), copySmilesButton);
});

copyFormulaButton.addEventListener("click", () => {
  const formula = readoutFormula.textContent;
  if (formula === "—") return;
  copyToClipboard(formula, copyFormulaButton);
});

exampleChips.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  input.value = chip.dataset.smiles;
  if (RDKitModule) render(chip.dataset.smiles);
});

spinToggle.addEventListener("click", () => {
  spinEnabled = !spinEnabled;
  spinToggle.setAttribute("aria-pressed", String(spinEnabled));
  spinToggle.setAttribute("aria-label", spinEnabled ? "Pause auto-rotate" : "Resume auto-rotate");
  spinToggle.textContent = spinEnabled ? "⏸" : "▶";
  viewer3d.spin(spinEnabled ? "y" : false, SPIN_SPEED);
});

viewer3d.render();

renderButton.disabled = true;
renderButton.textContent = "loading…";
setStatus("Loading chemistry engine…", "");

const smilesFromUrl = new URL(window.location.href).searchParams.get("smiles");
if (smilesFromUrl) {
  input.value = smilesFromUrl;
}

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
