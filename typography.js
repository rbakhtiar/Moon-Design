
/* ==========================================
   MOON DESIGN
   TYPOGRAPHY ENGINE v1.0
   ========================================== */

const MoonTypography = (() => {

  const fonts = [
    "Alegreya",
    "Inter",
    "Arial",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "Trebuchet MS",
    "Courier New",
    "Impact",
    "Palatino Linotype"
  ];

  const defaultSettings = {
    fontFamily: "Alegreya",
    fontSize: 32,
    fontWeight: "400",
    fontStyle: "normal",
    textAlign: "left",
    lineHeight: 1.4,
    letterSpacing: 0,
    textDecoration: "none",
    textTransform: "none",
    color: "#202633"
  };

  function getSelected() {
    return objects.find(
      item => item.id === selected && item.type === "text"
    );
  }

  function ensureSettings(item) {
    if (!item || item.type !== "text") return;

    Object.keys(defaultSettings).forEach(key => {
      if (item[key] === undefined) {
        item[key] = defaultSettings[key];
      }
    });
  }

  function update(property, value) {
    const item = getSelected();

    if (!item) return false;

    ensureSettings(item);

    const allowed = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "textAlign",
      "lineHeight",
      "letterSpacing",
      "textDecoration",
      "textTransform",
      "color"
    ];

    if (!allowed.includes(property)) return false;

    if (property === "fontSize") {
      value = Math.max(6, Math.min(300, Number(value)));
    }

    if (property === "lineHeight") {
      value = Math.max(0.5, Math.min(5, Number(value)));
    }

    if (property === "letterSpacing") {
      value = Math.max(-20, Math.min(100, Number(value)));
    }

    if (property === "fontWeight") {
      if (!["400", "500", "600", "700", "800"].includes(String(value))) {
        return false;
      }
    }

    if (property === "fontStyle") {
      if (!["normal", "italic"].includes(value)) return false;
    }

    if (property === "textAlign") {
      if (!["left", "center", "right", "justify"].includes(value)) {
        return false;
      }
    }

    if (property === "textDecoration") {
      if (!["none", "underline", "line-through"].includes(value)) {
        return false;
      }
    }

    if (property === "textTransform") {
      if (!["none", "uppercase", "lowercase", "capitalize"].includes(value)) {
        return false;
      }
    }

    if (property === "fontFamily") {
      if (!fonts.includes(value)) return false;
    }

    if (property === "color") {
      if (!/^#[0-9a-f]{6}$/i.test(value)) return false;
    }

    if (typeof saveHistory === "function") {
      saveHistory();
    }

    item[property] = value;

    apply(item);

    return true;
  }

  function apply(item) {
    if (!item || item.type !== "text") return;

    ensureSettings(item);

    const element = document.querySelector(
      `[data-object="${item.id}"]`
    );

    if (!element) return;

    element.style.fontFamily = item.fontFamily;
    element.style.fontSize = item.fontSize + "px";
    element.style.fontWeight = item.fontWeight;
    element.style.fontStyle = item.fontStyle;
    element.style.textAlign = item.textAlign;
    element.style.lineHeight = item.lineHeight;
    element.style.letterSpacing = item.letterSpacing + "px";
    element.style.textDecoration = item.textDecoration;
    element.style.textTransform = item.textTransform;
    element.style.color = item.color;
  }

  function applyAll() {
    objects.forEach(item => {
      if (item.type === "text") {
        ensureSettings(item);
        apply(item);
      }
    });
  }

  function setText(content) {
    const item = getSelected();

    if (!item) return;

    if (typeof saveHistory === "function") {
      saveHistory();
    }

    item.text = String(content);

    if (typeof render === "function") {
      render();
    }
  }

  function getSettings() {
    const item = getSelected();

    if (!item) return null;

    ensureSettings(item);

    return {
      fontFamily: item.fontFamily,
      fontSize: item.fontSize,
      fontWeight: item.fontWeight,
      fontStyle: item.fontStyle,
      textAlign: item.textAlign,
      lineHeight: item.lineHeight,
      letterSpacing: item.letterSpacing,
      textDecoration: item.textDecoration,
      textTransform: item.textTransform,
      color: item.color
    };
  }

  function getFonts() {
    return [...fonts];
  }

  function createText(content = "Your text") {
    if (typeof addText !== "function") return;

    addText();

    const item = getSelected();

    if (!item) return;

    item.text = content;

    Object.assign(item, defaultSettings);

    if (typeof render === "function") {
      render();
    }
  }

  return {
    update,
    apply,
    applyAll,
    setText,
    getSettings,
    getFonts,
    createText
  };

})();
