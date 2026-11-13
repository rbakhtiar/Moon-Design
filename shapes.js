
/* ==========================================
   MOON DESIGN
   SHAPES ENGINE v1.0
   ========================================== */

const MoonShapes = (() => {

  const presets = {
    rectangle: { width: 180, height: 110 },
    square: { width: 120, height: 120 },
    circle: { width: 120, height: 120 },
    ellipse: { width: 180, height: 110 },
    triangle: { width: 140, height: 120 },
    star: { width: 130, height: 130 },
    arrow: { width: 180, height: 90 },
    diamond: { width: 130, height: 130 },
    pentagon: { width: 130, height: 130 },
    hexagon: { width: 140, height: 120 }
  };

  const defaults = {
    fill: "#087c50",
    stroke: "#c7b98b",
    strokeWidth: 2,
    opacity: 1,
    borderRadius: 0
  };

  function create(type) {
    if (!presets[type]) {
      console.warn("Unknown shape:", type);
      return null;
    }

    const shape = {
      id: "shape-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 7),
      type,
      x: 100,
      y: 100,
      ...presets[type],
      ...defaults
    };

    objects.push(shape);
    selected = shape.id;

    if (typeof saveHistory === "function") saveHistory();
    if (typeof render === "function") render();

    return shape;
  }

  function getSelected() {
    return objects.find(item => item.id === selected);
  }

  function update(property, value) {
    const shape = getSelected();

    if (!shape) return false;

    const allowed = [
      "fill",
      "stroke",
      "strokeWidth",
      "opacity",
      "borderRadius"
    ];

    if (!allowed.includes(property)) return false;

    if (property === "strokeWidth") {
      value = Math.max(0, Math.min(30, Number(value)));
    }

    if (property === "opacity") {
      value = Math.max(0, Math.min(1, Number(value)));
    }

    if (property === "borderRadius") {
      value = Math.max(0, Math.min(100, Number(value)));
    }

    if (["fill", "stroke"].includes(property)) {
      if (!/^#[0-9a-f]{6}$/i.test(value)) return false;
    }

    if (typeof saveHistory === "function") saveHistory();

    shape[property] = value;

    if (typeof render === "function") render();

    return true;
  }

  function getPolygonPoints(sides, radius = 50) {
    const points = [];

    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i / sides) - Math.PI / 2;

      points.push({
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle)
      });
    }

    return points;
  }

  function getStarPoints(
    points = 5,
    outer = 50,
    inner = 23
  ) {
    const result = [];

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = (Math.PI * i / points) - Math.PI / 2;

      result.push({
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle)
      });
    }

    return result;
  }

  function getSVG(shape) {
    if (!shape) return "";

    const points = {
      triangle: getPolygonPoints(3),
      diamond: [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 }
      ],
      pentagon: getPolygonPoints(5),
      hexagon: getPolygonPoints(6),
      star: getStarPoints()
    };

    if (shape.type === "arrow") {
      points.arrow = [
        { x: 0, y: 30 },
        { x: 65, y: 30 },
        { x: 65, y: 0 },
        { x: 100, y: 50 },
        { x: 65, y: 100 },
        { x: 65, y: 70 },
        { x: 0, y: 70 }
      ];
    }

    const polygon = points[shape.type];

    if (polygon) {
      const coordinates = polygon
        .map(point => `${point.x},${point.y}`)
        .join(" ");

      return `
        <svg viewBox="0 0 100 100"
             width="100%" height="100%"
             preserveAspectRatio="none">
          <polygon
            points="${coordinates}"
            fill="${shape.fill}"
            stroke="${shape.stroke}"
            stroke-width="${shape.strokeWidth}"
            opacity="${shape.opacity}"
          />
        </svg>
      `;
    }

    return "";
  }

  function getStyle(shape) {
    return {
      background: shape.fill,
      border: `${shape.strokeWidth}px solid ${shape.stroke}`,
      borderRadius: shape.type === "circle"
        ? "50%"
        : shape.borderRadius + "px",
      opacity: shape.opacity
    };
  }

  function createGradient(color1, color2, angle = 135) {
    const safeColor = value =>
      /^#[0-9a-f]{6}$/i.test(value);

    if (!safeColor(color1) || !safeColor(color2)) {
      return null;
    }

    return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
  }

  return {
    presets,
    create,
    update,
    getSelected,
    getPolygonPoints,
    getStarPoints,
    getSVG,
    getStyle,
    createGradient
  };

})();
