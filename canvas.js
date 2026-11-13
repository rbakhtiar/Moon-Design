
/* ==========================================
   MOON DESIGN
   Canvas Engine v1.0
   ========================================== */

const MoonCanvas = (() => {

  const canvas = document.getElementById("canvas");

  let zoom = 1;
  let panX = 0;
  let panY = 0;

  let selectedObject = null;
  let activeOperation = null;

  let snapEnabled = true;
  let gridSize = 10;

  let lastPointer = { x: 0, y: 0 };

  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;

  // ------------------------------------------
  // Coordinate conversion
  // ------------------------------------------

  function screenToCanvas(x, y) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: (x - rect.left) / zoom,
      y: (y - rect.top) / zoom
    };
  }

  function snap(value) {
    if (!snapEnabled) return value;

    return Math.round(value / gridSize) * gridSize;
  }

  // ------------------------------------------
  // Zoom
  // ------------------------------------------

  function setZoom(value, centerX, centerY) {
    const oldZoom = zoom;

    zoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, value)
    );

    if (centerX !== undefined) {
      const rect = canvas.getBoundingClientRect();

      const localX = centerX - rect.left;
      const localY = centerY - rect.top;

      panX = localX - (localX - panX) * (zoom / oldZoom);
      panY = localY - (localY - panY) * (zoom / oldZoom);
    }

    applyTransform();
  }

  function zoomIn() {
    setZoom(zoom * 1.15);
  }

  function zoomOut() {
    setZoom(zoom / 1.15);
  }

  function resetZoom() {
    zoom = 1;
    panX = 0;
    panY = 0;
    applyTransform();
  }

  function applyTransform() {
    canvas.style.transformOrigin = "top left";
    canvas.style.transform =
      `translate(${panX}px, ${panY}px) scale(${zoom})`;

    const indicator = document.getElementById("moonZoom");

    if (indicator) {
      indicator.textContent =
        Math.round(zoom * 100) + "%";
    }
  }

  // ------------------------------------------
  // Object selection
  // ------------------------------------------

  function select(id) {
    selectedObject = id;

    if (typeof render === "function") {
      selected = id;
      render();
    }
  }

  function getSelected() {
    return objects.find(
      item => item.id === selectedObject
    ) || objects.find(
      item => item.id === selected
    ) || null;
  }

  // ------------------------------------------
  // Object movement
  // ------------------------------------------

  function startMove(event, item) {
    event.preventDefault();

    selectedObject = item.id;
    selected = item.id;

    const start = screenToCanvas(
      event.clientX,
      event.clientY
    );

    const initialX = item.x;
    const initialY = item.y;

    activeOperation = {
      type: "move",
      item,
      start,
      initialX,
      initialY
    };

    if (typeof saveHistory === "function") {
      saveHistory();
    }
  }

  function movePointer(event) {
    if (!activeOperation) return;

    const operation = activeOperation;

    const point = screenToCanvas(
      event.clientX,
      event.clientY
    );

    if (operation.type === "move") {

      operation.item.x = snap(
        operation.initialX +
        point.x - operation.start.x
      );

      operation.item.y = snap(
        operation.initialY +
        point.y - operation.start.y
      );

    }

    if (operation.type === "resize") {

      const dx = point.x - operation.start.x;
      const dy = point.y - operation.start.y;

      operation.item.width = Math.max(
        10,
        snap(operation.initialWidth + dx)
      );

      operation.item.height = Math.max(
        10,
        snap(operation.initialHeight + dy)
      );

    }

    updateObject(operation.item);
  }

  function stopPointer() {
    if (!activeOperation) return;

    activeOperation = null;

    if (typeof render === "function") {
      render();
    }
  }

  // ------------------------------------------
  // Resize handles
  // ------------------------------------------

  function startResize(event, item) {
    event.preventDefault();
    event.stopPropagation();

    if (typeof saveHistory === "function") {
      saveHistory();
    }

    const point = screenToCanvas(
      event.clientX,
      event.clientY
    );

    selectedObject = item.id;
    selected = item.id;

    activeOperation = {
      type: "resize",
      item,
      start: point,
      initialWidth: item.width,
      initialHeight: item.height
    };
  }

  function updateObject(item) {
    const element = canvas.querySelector(
      `[data-object="${item.id}"]`
    );

    if (!element) return;

    element.style.left = item.x + "px";
    element.style.top = item.y + "px";
    element.style.width = item.width + "px";
    element.style.height = item.height + "px";
  }

  // ------------------------------------------
  // Grid settings
  // ------------------------------------------

  function toggleSnap(value) {
    snapEnabled = value;
  }

  function setGridSize(value) {
    gridSize = Math.max(1, Number(value) || 10);
  }

  // ------------------------------------------
  // Event listeners
  // ------------------------------------------

  document.addEventListener(
    "pointermove",
    movePointer
  );

  document.addEventListener(
    "pointerup",
    stopPointer
  );

  document.addEventListener(
    "pointercancel",
    stopPointer
  );

  // ------------------------------------------
  // Public API
  // ------------------------------------------

  return {
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    select,
    getSelected,
    startMove,
    startResize,
    toggleSnap,
    setGridSize,

    get zoom() {
      return zoom;
    },

    get snapEnabled() {
      return snapEnabled;
    }
  };

})();
