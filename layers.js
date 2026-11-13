  
/* ==========================================
   MOON DESIGN — LAYER MANAGER
   ========================================== */

const MoonLayers = (() => {

  let hidden = new Set();
  let locked = new Set();

  function getItem(id) {
    return objects.find(item => item.id === id);
  }

  function select(id) {
    if (locked.has(id)) return;

    selected = id;

    if (typeof render === "function") {
      render();
    }
  }

  function rename(id, name) {
    const item = getItem(id);
    if (!item) return;

    saveHistory();
    item.name = String(name).slice(0, 80);
    render();
  }

  function remove(id) {
    saveHistory();

    objects = objects.filter(
      item => item.id !== id
    );

    hidden.delete(id);
    locked.delete(id);

    if (selected === id) selected = null;

    render();
  }

  function duplicate(id) {
    const item = getItem(id);
    if (!item) return;

    saveHistory();

    const copy = {
      ...item,
      id: nextId++,
      name: item.name + " Copy",
      x: item.x + 20,
      y: item.y + 20
    };

    objects.push(copy);
    selected = copy.id;

    render();
  }

  function moveUp(id) {
    const index = objects.findIndex(
      item => item.id === id
    );

    if (index === -1 || index === objects.length - 1) return;

    saveHistory();

    [objects[index], objects[index + 1]] =
      [objects[index + 1], objects[index]];

    render();
  }

  function moveDown(id) {
    const index = objects.findIndex(
      item => item.id === id
    );

    if (index <= 0) return;

    saveHistory();

    [objects[index], objects[index - 1]] =
      [objects[index - 1], objects[index]];

    render();
  }

  function bringToFront(id) {
    const index = objects.findIndex(
      item => item.id === id
    );

    if (index === -1) return;

    saveHistory();

    const [item] = objects.splice(index, 1);
    objects.push(item);

    render();
  }

  function sendToBack(id) {
    const index = objects.findIndex(
      item => item.id === id
    );

    if (index === -1) return;

    saveHistory();

    const [item] = objects.splice(index, 1);
    objects.unshift(item);

    render();
  }

  function toggleVisibility(id) {
    if (hidden.has(id)) {
      hidden.delete(id);
    } else {
      hidden.add(id);
    }

    render();
  }

  function toggleLock(id) {
    if (locked.has(id)) {
      locked.delete(id);
    } else {
      locked.add(id);
    }

    render();
  }

  function isVisible(id) {
    return !hidden.has(id);
  }

  function isLocked(id) {
    return locked.has(id);
  }

  function getAll() {
    return [...objects];
  }

  return {
    select,
    rename,
    remove,
    duplicate,
    moveUp,
    moveDown,
    bringToFront,
    sendToBack,
    toggleVisibility,
    toggleLock,
    isVisible,
    isLocked,
    getAll
  };

})();
