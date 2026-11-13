
/* ==========================================
   MOON DESIGN — RESIZE ENGINE
   ========================================== */

const MoonResize = (() => {

  let active = null;
  let aspectLocked = false;

  const MIN_SIZE = 10;

  const handles = [
    "nw", "n", "ne",
    "e", "se", "s",
    "sw", "w"
  ];

  function createHandles(element, item) {
    removeHandles(element);

    handles.forEach(position => {
      const handle = document.createElement("div");

      handle.className = "moon-resize-handle";
      handle.dataset.handle = position;

      Object.assign(handle.style, {
        position: "absolute",
        width: "9px",
        height: "9px",
        background: "#91acd8",
        border: "1px solid white",
        borderRadius: "2px",
        zIndex: "1000"
      });

      const positions = {
        nw: ["-5px", "-5px", null, null],
        n: ["-5px", "50%", null, null],
        ne: ["-5px", null, "-5px", null],
        e: ["50%", null, "-5px", null],
        se: [null, null, "-5px", "-5px"],
        s: [null, "50%", null, "-5px"],
        sw: [null, "-5px", null, "-5px"],
        w: ["50%", "-5px", null, null]
      };

      const p = positions[position];

      if (position.includes("n")) handle.style.top = p[0];
      if (position.includes("s")) handle.style.bottom = p[3];
      if (position.includes("w")) handle.style.left = p[1];
      if (position.includes("e")) handle.style.right = p[2];

      if (position === "n" || position === "s") {
        handle.style.left = "calc(50% - 4px)";
      }

      if (position === "e" || position === "w") {
        handle.style.top = "calc(50% - 4px)";
      }

      handle.addEventListener("pointerdown", event => {
        event.preventDefault();
        event.stopPropagation();
        start(event, item, position);
      });

      element.appendChild(handle);
    });
  }

  function removeHandles(element) {
    element.querySelectorAll(
      ".moon-resize-handle"
    ).forEach(handle => handle.remove());
  }

  function start(event, item, position) {
    if (typeof saveHistory === "function") {
      saveHistory();
    }

    const point = MoonCanvas
      ? eventPoint(event)
      : { x: event.clientX, y: event.clientY };

    active = {
      item,
      position,
      startX: point.x,
      startY: point.y,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height
    };
  }

  function eventPoint(event) {
    const rect = document.getElementById("canvas")
      .getBoundingClientRect();

    const zoom = MoonCanvas.zoom;

    return {
      x: (event.clientX - rect.left) / zoom,
      y: (event.clientY - rect.top) / zoom
    };
  }

  function move(event) {
    if (!active) return;

    const point = eventPoint(event);
    const a = active;
    const dx = point.x - a.startX;
    const dy = point.y - a.startY;

    const left = a.position.includes("w");
    const right = a.position.includes("e");
    const top = a.position.includes("n");
    const bottom = a.position.includes("s");

    let width = a.width;
    let height = a.height;
    let x = a.x;
    let y = a.y;

    if (left) {
      width = a.width - dx;
      x = a.x + dx;
    }

    if (right) width = a.width + dx;
    if (top) {
      height = a.height - dy;
      y = a.y + dy;
    }

    if (bottom) height = a.height + dy;

    if (aspectLocked) {
      const ratio = a.width / a.height;

      if (Math.abs(dx) > Math.abs(dy)) {
        height = width / ratio;
        if (top) y = a.y + a.height - height;
      } else {
        width = height * ratio;
        if (left) x = a.x + a.width - width;
      }
    }

    if (width < MIN_SIZE || height < MIN_SIZE) return;

    a.item.x = x;
    a.item.y = y;
    a.item.width = width;
    a.item.height = height;

    const el = document.querySelector(
      `[data-object="${a.item.id}"]`
    );

    if (el) {
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.width = width + "px";
      el.style.height = height + "px";
    }
  }

  function stop() {
    if (!active) return;
    active = null;

    if (typeof render === "function") render();
  }

  function lockAspect(value) {
    aspectLocked = Boolean(value);
  }

  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", stop);
  document.addEventListener("pointercancel", stop);

  return {
    createHandles,
    removeHandles,
    lockAspect,
    get aspectLocked() {
      return aspectLocked;
    }
  };

})();
