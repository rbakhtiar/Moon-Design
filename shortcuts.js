
/* ==========================================
   MOON DESIGN — KEYBOARD SHORTCUTS
   ========================================== */

const MoonShortcuts = (() => {

  const shortcuts = new Map();

  function register(key, callback, description) {
    shortcuts.set(key.toLowerCase(), {
      callback,
      description
    });
  }

  function selectedItem() {
    return objects.find(
      item => item.id === selected
    );
  }

  function registerDefaults() {

    register("delete", () => {
      const item = selectedItem();
      if (item) MoonLayers.remove(item.id);
    }, "Delete selected object");

    register("backspace", () => {
      const item = selectedItem();
      if (item) MoonLayers.remove(item.id);
    }, "Delete selected object");

    register("ctrl+d", () => {
      const item = selectedItem();
      if (item) MoonLayers.duplicate(item.id);
    }, "Duplicate");

    register("ctrl+z", () => undo(), "Undo");

    register("ctrl+y", () => redo(), "Redo");

    register("ctrl+shift+z", () => redo(), "Redo");

    register("v", () => {
      setTool("select");
    }, "Selection tool");

    register("r", () => {
      addShape("rect");
    }, "Rectangle");

    register("o", () => {
      addShape("circle");
    }, "Circle");

    register("t", () => {
      addText();
    }, "Text");

    register("ctrl+shift+]", () => {
      const item = selectedItem();
      if (item) MoonLayers.bringToFront(item.id);
    }, "Bring to front");

    register("ctrl+shift+[", () => {
      const item = selectedItem();
      if (item) MoonLayers.sendToBack(item.id);
    }, "Send to back");

    register("ctrl+e", () => {
      exportPNG();
    }, "Export PNG");

  }

  function handleKey(event) {

    const target = event.target;

    if (
      target &&
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
    ) return;

    const parts = [];

    if (event.ctrlKey || event.metaKey) parts.push("ctrl");
    if (event.shiftKey) parts.push("shift");
    if (event.altKey) parts.push("alt");

    parts.push(event.key.toLowerCase());

    const key = parts.join("+");
    const action = shortcuts.get(key);

    if (!action) return;

    event.preventDefault();
    action.callback();
  }

  function getAll() {
    return Array.from(shortcuts.entries()).map(
      ([key, data]) => ({
        key,
        description: data.description
      })
    );
  }

  registerDefaults();

  document.addEventListener(
    "keydown",
    handleKey
  );

  return {
    register,
    getAll
  };

})();
