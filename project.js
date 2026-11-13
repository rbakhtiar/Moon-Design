
/* ==========================================
   MOON DESIGN
   PROJECT ENGINE v1.0
   ========================================== */

const MoonProject = (() => {

  const STORAGE_KEY = "moon_design_projects";
  const ACTIVE_KEY = "moon_design_active_project";
  const AUTOSAVE_DELAY = 1200;

  let currentProject = {
    id: null,
    name: "Untitled Project",
    createdAt: null,
    updatedAt: null,
    version: "1.0"
  };

  let autosaveTimer = null;
  let isDirty = false;

  // Generate a unique project ID
  function generateID() {
    return "moon-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8);
  }

  // Get all saved projects
  function getProjects() {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );
    } catch (error) {
      console.error("Moon Design: Could not read projects.", error);
      return {};
    }
  }

  // Write projects to local storage
  function writeProjects(projects) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(projects)
      );

      return true;
    } catch (error) {
      console.error("Moon Design: Saving failed.", error);
      return false;
    }
  }

  // Capture the current editor state
  function getEditorData() {
    return {
      objects: JSON.parse(JSON.stringify(objects || [])),
      selected: selected || null
    };
  }

  // Create a new project
  function create(name = "Untitled Project") {

    const now = new Date().toISOString();

    currentProject = {
      id: generateID(),
      name: String(name).trim() || "Untitled Project",
      createdAt: now,
      updatedAt: now,
      version: "1.0"
    };

    objects = [];
    selected = null;

    const projects = getProjects();

    projects[currentProject.id] = {
      ...currentProject,
      data: getEditorData()
    };

    writeProjects(projects);

    localStorage.setItem(ACTIVE_KEY, currentProject.id);

    if (typeof render === "function") {
      render();
    }

    isDirty = false;

    return currentProject;
  }

  // Save the current project
  function save() {

    if (!currentProject.id) {
      create(currentProject.name);
    }

    const projects = getProjects();

    currentProject.updatedAt = new Date().toISOString();

    projects[currentProject.id] = {
      ...currentProject,
      data: getEditorData()
    };

    const success = writeProjects(projects);

    if (success) {
      localStorage.setItem(ACTIVE_KEY, currentProject.id);
      isDirty = false;
    }

    return success;
  }

  // Schedule automatic saving
  function autosave() {

    isDirty = true;

    clearTimeout(autosaveTimer);

    autosaveTimer = setTimeout(() => {
      if (isDirty) {
        save();
      }
    }, AUTOSAVE_DELAY);
  }

  // Open an existing project
  function open(id) {

    const projects = getProjects();
    const project = projects[id];

    if (!project || !project.data) {
      console.error("Moon Design: Project not found.");
      return false;
    }

    currentProject = {
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      version: project.version || "1.0"
    };

    objects = JSON.parse(
      JSON.stringify(project.data.objects || [])
    );

    selected = project.data.selected || null;

    localStorage.setItem(ACTIVE_KEY, id);

    if (typeof render === "function") {
      render();
    }

    isDirty = false;

    return true;
  }

  // Rename the current project
  function rename(name) {

    const cleanName = String(name).trim();

    if (!cleanName) return false;

    currentProject.name = cleanName;

    return save();
  }

  // Delete a saved project
  function remove(id) {

    const projects = getProjects();

    if (!projects[id]) return false;

    delete projects[id];

    writeProjects(projects);

    if (currentProject.id === id) {
      currentProject = {
        id: null,
        name: "Untitled Project",
        createdAt: null,
        updatedAt: null,
        version: "1.0"
      };

      localStorage.removeItem(ACTIVE_KEY);
    }

    return true;
  }

  // Export the current project as JSON
  function exportProject() {

    const project = {
      ...currentProject,
      data: getEditorData()
    };

    const file = new Blob(
      [JSON.stringify(project, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");

    link.href = url;
    link.download =
      (currentProject.name || "moon-project")
        .replace(/[^a-z0-9-_]/gi, "-") +
      ".moon";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  // Import a project file
  function importFile(file) {

    return new Promise((resolve, reject) => {

      if (!file) {
        reject(new Error("No project file selected."));
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {

        try {

          const project = JSON.parse(reader.result);

          if (
            !project ||
            typeof project !== "object" ||
            !project.data ||
            !Array.isArray(project.data.objects)
          ) {
            throw new Error("Invalid Moon Design project.");
          }

          const now = new Date().toISOString();

          currentProject = {
            id: generateID(),
            name: String(project.name || "Imported Project"),
            createdAt: now,
            updatedAt: now,
            version: "1.0"
          };

          objects = JSON.parse(
            JSON.stringify(project.data.objects)
          );

          selected = null;

          save();

          if (typeof render === "function") {
            render();
          }

          resolve(currentProject);

        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Could not read project file."));
      };

      reader.readAsText(file);
    });
  }

  // Restore the last active project
  function restoreLastProject() {

    const id = localStorage.getItem(ACTIVE_KEY);

    if (id && open(id)) {
      return true;
    }

    return false;
  }

  // Get the current project information
  function getCurrent() {
    return { ...currentProject };
  }

  // Get saved project list
  function list() {

    return Object.values(getProjects()).map(project => ({
      id: project.id,
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    }));
  }

  // Start a blank project
  function reset() {
    return create("Untitled Project");
  }

  return {
    create,
    save,
    autosave,
    open,
    rename,
    remove,
    exportProject,
    importFile,
    restoreLastProject,
    getCurrent,
    list,
    reset
  };

})();
