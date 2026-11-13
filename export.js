
/* ==========================================
   MOON DESIGN
   EXPORT ENGINE v1.0
   ========================================== */

const MoonExport = (() => {

  function download(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function getFilename(extension) {
    const project = typeof MoonProject !== "undefined"
      ? MoonProject.getCurrent()
      : { name: "moon-design" };

    const name = (project.name || "moon-design")
      .replace(/[^a-z0-9-_]/gi, "-");

    return `${name}.${extension}`;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  // Export editor data as JSON
  function JSONFile() {
    const data = {
      application: "Moon Design",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      project: MoonProject.getCurrent(),
      objects: JSON.parse(JSON.stringify(objects || []))
    };

    download(
      JSON.stringify(data, null, 2),
      getFilename("json"),
      "application/json"
    );
  }

  // Build SVG from editor objects
  function SVG() {

    const elements = (objects || []).map(item => {

      const x = Number(item.x) || 0;
      const y = Number(item.y) || 0;
      const width = Number(item.width) || 100;
      const height = Number(item.height) || 100;

      if (item.type === "text") {
        return `
          <text
            x="${x}" y="${y + height}"
            fill="${escapeHTML(item.color || "#ffffff")}"
            font-family="${escapeHTML(item.fontFamily || "Alegreya")}"
            font-size="${Number(item.fontSize) || 32}"
            font-weight="${Number(item.fontWeight) || 400}"
          >${escapeHTML(item.text || "")}</text>
        `;
      }

      if (item.type === "circle" || item.type === "ellipse") {
        return `
          <ellipse
            cx="${x + width / 2}"
            cy="${y + height / 2}"
            rx="${width / 2}"
            ry="${height / 2}"
            fill="${escapeHTML(item.fill || "#087c50")}"
          />
        `;
      }

      return `
        <rect
          x="${x}" y="${y}"
          width="${width}" height="${height}"
          fill="${escapeHTML(item.fill || "#087c50")}"
          rx="${Number(item.borderRadius) || 0}"
        />
      `;
    }).join("\n");

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
           width="900" height="560"
           viewBox="0 0 900 560">
        ${elements}
      </svg>
    `;

    download(svg, getFilename("svg"), "image/svg+xml");
  }

  // Export the visible canvas as PNG
  async function PNG() {

    const canvas = document.querySelector("#canvas");

    if (!canvas) {
      throw new Error("Canvas element not found.");
    }

    if (typeof html2canvas !== "function") {
      throw new Error("html2canvas is not loaded.");
    }

    const image = await html2canvas(canvas, {
      backgroundColor: null,
      scale: 2
    });

    const link = document.createElement("a");

    link.download = getFilename("png");
    link.href = image.toDataURL("image/png");

    link.click();
  }

  // Export canvas as PDF using jsPDF
  async function PDF() {

    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("jsPDF library is not loaded.");
    }

    const canvas = document.querySelector("#canvas");

    if (!canvas || typeof html2canvas !== "function") {
      throw new Error("Canvas or html2canvas unavailable.");
    }

    const image = await html2canvas(canvas, {
      backgroundColor: "#ffffff",
      scale: 2
    });

    const imageData = image.toDataURL("image/png");

    const pdf = new window.jspdf.jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [900, 560]
    });

    pdf.addImage(imageData, "PNG", 0, 0, 900, 560);
    pdf.save(getFilename("pdf"));
  }

  return {
    JSON: JSONFile,
    SVG,
    PNG,
    PDF
  };

})();
