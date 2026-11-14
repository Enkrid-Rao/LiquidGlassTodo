(() => {
  "use strict";

  const STORAGE_KEY = "tide.tasks.v1";
  const FILTERS = ["open", "all", "done"];
  const MAX_TASK_LENGTH = 140;
  const GLASS_OPACITY_MIN = 30;
  const GLASS_OPACITY_MAX = 100;
  const BROWSER_EFFECTS_KEY = "tide.effects.v2";
  const TABS = ["theme", "color", "effects", "window"];

  const PRESETS = [
    { id: "lagoon", name: "Lagoon", hue: 165, tint: 34, accent: 158, atmo: "lagoon", intensity: 92 },
    { id: "aurora", name: "Aurora", hue: 236, tint: 30, accent: 202, atmo: "aurora", intensity: 95 },
    { id: "dusk", name: "Dusk", hue: 296, tint: 27, accent: 330, atmo: "dusk", intensity: 90 },
    { id: "ember", name: "Ember", hue: 24, tint: 34, accent: 26, atmo: "ember", intensity: 88 },
    { id: "frost", name: "Frost", hue: 202, tint: 24, accent: 190, atmo: "frost", intensity: 84 },
    { id: "iris", name: "Iris", hue: 264, tint: 32, accent: 272, atmo: "veil", intensity: 92 },
    { id: "moss", name: "Moss", hue: 96, tint: 30, accent: 88, atmo: "mist", intensity: 86 },
    { id: "ink", name: "Ink", hue: 218, tint: 4, accent: 210, atmo: "noir", intensity: 62 }
  ];

  const ATMO_STYLES = [
    { id: "lagoon", name: "Lagoon" },
    { id: "aurora", name: "Aurora" },
    { id: "dusk", name: "Dusk" },
    { id: "ember", name: "Ember" },
    { id: "frost", name: "Frost" },
    { id: "noir", name: "Noir" },
    { id: "veil", name: "Veil" },
    { id: "mist", name: "Mist" }
  ];

  const TINT_SWATCHES = [
    { name: "Ink", hue: 218, tint: 4 },
    { name: "Fog", hue: 210, tint: 8 },
    { name: "Sea", hue: 165, tint: 34 },
    { name: "Sky", hue: 205, tint: 32 },
    { name: "Iris", hue: 264, tint: 32 },
    { name: "Rose", hue: 334, tint: 30 },
    { name: "Clay", hue: 24, tint: 34 },
    { name: "Moss", hue: 96, tint: 30 }
  ];

  const ACCENT_SWATCHES = [
    { name: "Mint", hue: 158 },
    { name: "Sky", hue: 196 },
    { name: "Iris", hue: 262 },
    { name: "Orchid", hue: 300 },
    { name: "Rose", hue: 336 },
    { name: "Amber", hue: 32 },
    { name: "Lime", hue: 86 },
    { name: "Steel", hue: 212 }
  ];

  const DEFAULT_EFFECTS = {
    atmosphere: true,
    atmoStyle: "lagoon",
    atmoStrength: 92,
    hue: 165,
    tintSat: 34,
    accentHue: 158,
    glassOpacity: 82,
    halo: true,
    haloStrength: 70,
    cursorGlow: true,
    grain: true,
    ambientDrift: false,
    showDate: true,
    clock24: true
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const els = {
    body: document.body,
    widget: $("#widget"),
    widgetBody: $(".widget__body"),
    todayLabel: $("#todayLabel"),
    clockTime: $("#clockTime"),
    greeting: $("#greeting"),
    lede: $("#lede"),
    donePct: $("#donePct"),
    progressBlock: $(".progress-block"),
    progressTrack: $("#progressTrack"),
    progressFill: $("#progressFill"),
    doneCount: $("#doneCount"),
    leftCount: $("#leftCount"),
    workspace: $(".workspace"),
    addForm: $("#addForm"),
    taskInput: $("#taskInput"),
    addBtn: $("#addBtn"),
    filters: $("#filters"),
    filterButtons: $$(".filter"),
    listStatus: $("#listStatus"),
    listScroller: $("#listScroller"),
    taskList: $("#taskList"),
    taskTemplate: $("#taskTemplate"),
    empty: $("#empty"),
    emptyTitle: $("#emptyTitle"),
    emptyCopy: $("#emptyCopy"),
    clearDone: $("#clearDone"),
    modKey: $("#modKey"),
    toastRegion: $("#toastRegion"),
    settingsBtn: $("#settingsBtn"),
    studio: $("#studio"),
    studioClose: $("#studioClose"),
    studioTabs: $("#studioTabs"),
    studioBody: $("#studioBody"),
    tabButtons: $$(".studio__tab"),
    panes: $$(".studio__pane"),
    presetGrid: $("#presetGrid"),
    atmoGrid: $("#atmoGrid"),
    tintGrid: $("#tintGrid"),
    accentGrid: $("#accentGrid"),
    optAtmosphere: $("#optAtmosphere"),
    optAtmoStrength: $("#optAtmoStrength"),
    atmoStrengthValue: $("#atmoStrengthValue"),
    optHue: $("#optHue"),
    hueValue: $("#hueValue"),
    optTintSat: $("#optTintSat"),
    tintSatValue: $("#tintSatValue"),
    optAccentHue: $("#optAccentHue"),
    accentHueValue: $("#accentHueValue"),
    optGlassOpacity: $("#optGlassOpacity"),
    glassOpacityValue: $("#glassOpacityValue"),
    optHalo: $("#optHalo"),
    optHaloStrength: $("#optHaloStrength"),
    haloStrengthValue: $("#haloStrengthValue"),
    haloStrengthField: $("#haloStrengthField"),
    optCursorGlow: $("#optCursorGlow"),
    optGrain: $("#optGrain"),
    optAmbientDrift: $("#optAmbientDrift"),
    optShowDate: $("#optShowDate"),
    optClock24: $("#optClock24"),
    optPin: $("#optPin"),
    optStartAtLogin: $("#optStartAtLogin"),
    startupRow: $("#startupRow"),
    startupNote: $("#startupNote"),
    driftRow: $("#driftRow"),
    studioReset: $("#studioReset"),
    studioVersion: $("#studioVersion"),
    resetPosition: $("#resetPosition"),
    winPin: $("#winPin"),
    winMin: $("#winMin"),
    winClose: $("#winClose")
  };

  const state = {
    tasks: [],
    filter: "open",
    editingId: null,
    effects: { ...DEFAULT_EFFECTS },
    hasDesktopBridge: Boolean(window.tideDesktop),
    studioOpen: false,
    activeTab: "theme",
    toast: null,
    toastTimer: null,
    toastRemoveTimer: null,
    specularFrame: 0,
    lastGreeting: "",
    lastClock: "",
    lastDate: ""
  };

  const numberWords = [
    "No", "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------
     Storage
     ------------------------------------------------------- */

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function seedTasks() {
    const now = Date.now();
    return [
      {
        id: createId(),
        text: "Reply to Mira about the studio keys",
        done: false,
        createdAt: now - 1000 * 60 * 72,
        completedAt: null
      },
      {
        id: createId(),
        text: "Book the Friday train north",
        done: false,
        createdAt: now - 1000 * 60 * 49,
        completedAt: null
      },
      {
        id: createId(),
        text: "Pick up the developed film",
        done: true,
        createdAt: now - 1000 * 60 * 155,
        completedAt: now - 1000 * 60 * 17
      },
      {
        id: createId(),
        text: "Water the monstera",
        done: false,
        createdAt: now - 1000 * 60 * 36,
        completedAt: null
      },
      {
        id: createId(),
        text: "Send the field notes to Noor",
        done: false,
        createdAt: now - 1000 * 60 * 201,
        completedAt: null
      },
      {
        id: createId(),
        text: "Tidy the reading stack",
        done: true,
        createdAt: now - 1000 * 60 * 88,
        completedAt: now - 1000 * 60 * 44
      },
      {
        id: createId(),
        text: "Choose a record for tonight",
        done: false,
        createdAt: now - 1000 * 60 * 54,
        completedAt: null
      }
    ];
  }

  function loadState() {
    let loadedTasks = null;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          loadedTasks = parsed
            .filter((task) => task && typeof task.text === "string")
            .map((task) => ({
              id: typeof task.id === "string" ? task.id : createId(),
              text: task.text.trim().slice(0, MAX_TASK_LENGTH),
              done: Boolean(task.done),
              createdAt: Number(task.createdAt) || Date.now(),
              completedAt: task.done ? Number(task.completedAt) || Date.now() : null
            }))
            .filter((task) => task.text.length > 0);
        }
      }
    } catch {
      loadedTasks = null;
    }

    if (loadedTasks === null) {
      state.tasks = seedTasks();
      persistTasks();
    } else {
      state.tasks = loadedTasks;
    }

    state.filter = "open";
  }

  function persistTasks() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch {
      // A full or unavailable storage should never break the widget.
    }
  }

  function loadBrowserEffects() {
    try {
      const raw = window.localStorage.getItem(BROWSER_EFFECTS_KEY);
      if (!raw) return { ...DEFAULT_EFFECTS };
      const parsed = JSON.parse(raw);
      return normalizeEffects(parsed);
    } catch {
      return { ...DEFAULT_EFFECTS };
    }
  }

  function persistBrowserEffects() {
    try {
      window.localStorage.setItem(BROWSER_EFFECTS_KEY, JSON.stringify(state.effects));
    } catch {
      // No-op.
    }
  }

  function clampNumber(value, fallback, min, max) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.round(parsed)));
  }

  function normalizeEffects(input) {
    const source = input && typeof input === "object" ? input : {};
    const effects = {
      atmosphere: source.atmosphere !== false,
      atmoStyle: ATMO_STYLES.some((style) => style.id === source.atmoStyle)
        ? source.atmoStyle
        : DEFAULT_EFFECTS.atmoStyle,
      atmoStrength: clampNumber(source.atmoStrength, DEFAULT_EFFECTS.atmoStrength, 0, 100),
      hue: clampNumber(source.hue, DEFAULT_EFFECTS.hue, 0, 359),
      tintSat: clampNumber(source.tintSat, DEFAULT_EFFECTS.tintSat, 0, 60),
      accentHue: clampNumber(source.accentHue, DEFAULT_EFFECTS.accentHue, 0, 359),
      glassOpacity: clampNumber(
        source.glassOpacity,
        DEFAULT_EFFECTS.glassOpacity,
        GLASS_OPACITY_MIN,
        GLASS_OPACITY_MAX
      ),
      halo: source.halo !== false,
      haloStrength: clampNumber(source.haloStrength, DEFAULT_EFFECTS.haloStrength, 0, 100),
      cursorGlow: source.cursorGlow !== false,
      grain: source.grain !== false,
      ambientDrift: source.ambientDrift === true,
      showDate: source.showDate !== false,
      clock24: source.clock24 !== false
    };
    if (!effects.atmosphere) effects.ambientDrift = false;
    return effects;
  }

  /* -------------------------------------------------------
     Utilities
     ------------------------------------------------------- */

  function openTasks() {
    return state.tasks.filter((task) => !task.done);
  }

  function doneTasks() {
    return state.tasks.filter((task) => task.done);
  }

  function taskIsVisible(task) {
    return state.filter === "all" ||
      (state.filter === "open" && !task.done) ||
      (state.filter === "done" && task.done);
  }

  function taskById(id) {
    return state.tasks.find((task) => task.id === id);
  }

  function countPhrase(count) {
    return numberWords[count] || String(count);
  }

  function truncate(text, max = 48) {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }

  function getGreeting(hour) {
    if (hour < 5 || hour >= 23) return "Good night.";
    if (hour < 12) return "Good morning.";
    if (hour < 18) return "Good afternoon.";
    return "Good evening.";
  }

  function getLede() {
    const open = openTasks().length;
    if (state.tasks.length === 0) return "A clean page. Begin with one small thing.";
    if (open === 0) return "Nothing open. Leave a little room for nothing.";
    if (open === 1) return "One small thing, then you’re free.";
    if (open === 2) return "Two small things, one at a time.";
    return `${countPhrase(open)} small things, one at a time.`;
  }

  function getDateLabel(date) {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }

  function setGreeting(text) {
    if (state.lastGreeting === text) return;
    state.lastGreeting = text;
    els.greeting.textContent = "";
    els.greeting.setAttribute("aria-label", text);

    const last = text.slice(-1);
    const punctuation = [".", "!", "?"].includes(last) ? last : "";
    const body = punctuation ? text.slice(0, -1) : text;
    const words = body.split(" ").filter(Boolean);

    const lineOne = document.createElement("span");
    lineOne.className = "intro__greeting-line";
    lineOne.textContent = words.shift() || body;
    els.greeting.append(lineOne);

    let lastLine = lineOne;
    if (words.length > 0) {
      const lineTwo = document.createElement("span");
      lineTwo.className = "intro__greeting-line";
      lineTwo.textContent = words.join(" ");
      els.greeting.append(lineTwo);
      lastLine = lineTwo;
    }

    if (punctuation) {
      const mark = document.createElement("span");
      mark.className = "intro__greeting-mark";
      mark.textContent = punctuation;
      lastLine.append(mark);
    }
  }

  function refreshTemporalCopy() {
    const now = new Date();
    const date = getDateLabel(now);
    if (state.lastDate !== date) {
      state.lastDate = date;
      els.todayLabel.textContent = date;
    }
    const clock = now.toLocaleTimeString(state.effects.clock24 ? "en-GB" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !state.effects.clock24
    });
    if (state.lastClock !== clock) {
      state.lastClock = clock;
      els.clockTime.textContent = clock;
    }
    setGreeting(getGreeting(now.getHours()));
  }

  /* -------------------------------------------------------
     Progress
     ------------------------------------------------------- */

  function animateNumber(element, target) {
    const from = Number.parseInt(element.textContent, 10) || 0;
    if (from === target || reduceMotion) {
      element.textContent = String(target);
      return;
    }

    const duration = 420;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      element.textContent = String(Math.round(from + (target - from) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  function updateMetrics({ initial = false } = {}) {
    const total = state.tasks.length;
    const done = doneTasks().length;
    const open = total - done;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    animateNumber(els.donePct, pct);
    if (!initial) els.progressFill.style.width = `${pct}%`;
    els.progressFill.dataset.zero = String(pct === 0);
    els.progressTrack.setAttribute("aria-valuenow", String(pct));
    els.progressTrack.setAttribute("aria-valuetext", `${done} of ${total} tasks complete`);

    els.progressBlock.classList.toggle("is-complete", total > 0 && open === 0);
    els.doneCount.textContent = `${done} done`;
    els.leftCount.textContent = open === 0 ? "all clear" : `${open} to go`;
    els.lede.textContent = getLede();
    els.clearDone.disabled = done === 0;

    if (state.filter === "done") {
      els.listStatus.textContent = `${done} completed`;
    } else if (state.filter === "all") {
      els.listStatus.textContent = `${total} ${total === 1 ? "task" : "tasks"}`;
    } else {
      els.listStatus.textContent = open === 0 ? "all clear" : `${open} open`;
    }

    document.title = open > 0 ? `Tide · ${open} open` : "Tide · all clear";
  }

  /* -------------------------------------------------------
     Rendering
     ------------------------------------------------------- */

  function buildTaskRow(task, { animate = false, delay = 0 } = {}) {
    const fragment = els.taskTemplate.content.cloneNode(true);
    const row = $(".task", fragment);
    const checkbox = $(".task__checkbox", fragment);
    const text = $(".task__text", fragment);
    const editButton = $(".task__edit", fragment);
    const deleteButton = $(".task__delete", fragment);

    row.dataset.id = task.id;
    row.classList.toggle("is-done", task.done);

    if (animate) {
      row.classList.add("is-entering");
      if (delay) row.style.animationDelay = `${delay}ms`;
    }

    checkbox.checked = task.done;
    checkbox.setAttribute(
      "aria-label",
      `${task.done ? "Mark incomplete" : "Mark complete"}: ${task.text}`
    );

    row._tideCheckbox = checkbox;
    row._tideText = text;

    if (state.editingId === task.id) {
      row.classList.add("is-editing");
      const input = document.createElement("input");
      input.className = "task__edit-input";
      input.type = "text";
      input.maxLength = MAX_TASK_LENGTH;
      input.spellcheck = false;
      input.value = task.text;
      input.setAttribute("aria-label", "Edit task");
      text.replaceWith(input);

      let settled = false;
      const finish = (commit) => {
        if (settled) return;
        settled = true;
        const nextText = input.value.trim().slice(0, MAX_TASK_LENGTH);
        state.editingId = null;

        if (commit && nextText && nextText !== task.text) {
          task.text = nextText;
          persistTasks();
        }

        renderList();
      };

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          finish(true);
        } else if (event.key === "Escape") {
          event.preventDefault();
          finish(false);
        }
      });
      input.addEventListener("blur", () => finish(true));

      requestAnimationFrame(() => {
        input.focus();
        input.select();
      });
    } else {
      text.textContent = task.text;
    }

    checkbox.addEventListener("change", () => toggleTask(task.id, checkbox.checked));
    editButton.addEventListener("click", () => startEditing(task.id));
    deleteButton.addEventListener("click", () => removeTask(task.id));
    deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
    editButton.setAttribute("aria-label", `Edit task: ${task.text}`);

    return row;
  }

  function renderList({ animateAll = false, newId = null } = {}) {
    const visible = state.tasks.filter(taskIsVisible);
    const fragment = document.createDocumentFragment();

    visible.forEach((task, index) => {
      const animate = animateAll || task.id === newId;
      const row = buildTaskRow(task, {
        animate,
        delay: animateAll ? Math.min(index * 36, 180) : 0
      });
      fragment.append(row);
    });

    els.taskList.replaceChildren(fragment);
    els.taskList.dataset.count = String(visible.length);
    els.taskList.setAttribute("aria-label", `${state.filter} to-do list`);

    const isEmpty = visible.length === 0;
    els.empty.hidden = !isEmpty;
    if (isEmpty) updateEmptyCopy();

    if (newId) {
      els.listScroller.scrollTop = 0;
    }
  }

  function updateEmptyCopy() {
    if (state.tasks.length === 0) {
      els.emptyTitle.textContent = "All clear.";
      els.emptyCopy.textContent = "Nothing on the list. Add a small thing above, or leave it that way.";
      return;
    }

    if (state.filter === "open") {
      els.emptyTitle.textContent = "Nothing open.";
      els.emptyCopy.textContent = "Every small thing is done. Stay awhile.";
      return;
    }

    if (state.filter === "done") {
      els.emptyTitle.textContent = "Nothing finished yet.";
      els.emptyCopy.textContent = "The first tick is the satisfying one.";
      return;
    }

    els.emptyTitle.textContent = "All clear.";
    els.emptyCopy.textContent = "Nothing on the list. Add a small thing above, or leave it that way.";
  }

  function updateFilterUI() {
    const index = Math.max(0, FILTERS.indexOf(state.filter));
    els.filters.style.setProperty("--filter-index", String(index));
    els.workspace.setAttribute(
      "aria-label",
      state.filter === "open" ? "Open tasks" : state.filter === "done" ? "Completed tasks" : "All tasks"
    );

    els.filterButtons.forEach((button) => {
      const active = button.dataset.filter === state.filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.tabIndex = active ? 0 : -1;
    });
  }

  /* -------------------------------------------------------
     Task actions
     ------------------------------------------------------- */

  function setFilter(filter) {
    if (!FILTERS.includes(filter) || state.filter === filter) return;
    state.filter = filter;
    state.editingId = null;
    updateFilterUI();
    renderList({ animateAll: true });
    updateMetrics();
  }

  function startEditing(id) {
    if (!taskById(id)) return;
    state.editingId = id;
    renderList();
  }

  function toggleTask(id, checked) {
    const task = taskById(id);
    if (!task) return;

    task.done = checked;
    task.completedAt = checked ? Date.now() : null;

    const row = els.taskList.querySelector(`[data-id="${id}"]`);

    if (row) {
      row.classList.toggle("is-done", task.done);
      const checkbox = row._tideCheckbox;
      if (checkbox) {
        checkbox.setAttribute(
          "aria-label",
          `${task.done ? "Mark incomplete" : "Mark complete"}: ${task.text}`
        );
      }
      if (checked) {
        row.classList.remove("is-just-checked");
        void row.offsetWidth;
        row.classList.add("is-just-checked");
      }
    }

    persistTasks();
    updateMetrics();

    if (!taskIsVisible(task)) {
      window.setTimeout(() => {
        const currentTask = taskById(id);
        if (!currentTask || taskIsVisible(currentTask)) return;
        const currentRow = els.taskList.querySelector(`[data-id="${id}"]`);
        if (currentRow) currentRow.classList.add("is-leaving");
        window.setTimeout(() => {
          if (!taskIsVisible(taskById(id))) renderList();
        }, 275);
      }, 330);
    }
  }

  function addTask(rawText) {
    const text = rawText.trim().replace(/\s+/g, " ").slice(0, MAX_TASK_LENGTH);
    if (!text) return;

    const task = {
      id: createId(),
      text,
      done: false,
      createdAt: Date.now(),
      completedAt: null
    };

    state.tasks.unshift(task);
    state.editingId = null;

    if (state.filter === "done") {
      state.filter = "open";
      updateFilterUI();
    }

    persistTasks();
    addInputReset();
    renderList({ newId: task.id });
    updateMetrics();
    els.listScroller.scrollTop = 0;
    els.taskInput.focus();
  }

  function removeTask(id) {
    const index = state.tasks.findIndex((task) => task.id === id);
    if (index < 0) return;

    const [task] = state.tasks.splice(index, 1);
    if (state.editingId === id) state.editingId = null;

    persistTasks();
    updateMetrics();

    const row = els.taskList.querySelector(`[data-id="${id}"]`);
    if (row) {
      row.classList.add("is-leaving");
      window.setTimeout(() => renderList(), 290);
    } else {
      renderList();
    }

    showToast(`Removed “${truncate(task.text)}”`, "Undo", () => {
      const insertAt = Math.min(index, state.tasks.length);
      state.tasks.splice(insertAt, 0, task);
      persistTasks();
      renderList({ newId: task.id });
      updateMetrics();
    });
  }

  function clearCompleted() {
    const removed = [];
    const remaining = [];

    state.tasks.forEach((task, index) => {
      if (task.done) removed.push({ task, index });
      else remaining.push(task);
    });

    if (removed.length === 0) return;

    state.tasks = remaining;
    state.editingId = null;
    persistTasks();
    updateMetrics();

    if (state.filter !== "open") {
      $$(".task.is-done", els.taskList).forEach((row) => row.classList.add("is-leaving"));
      window.setTimeout(() => renderList(), 290);
    } else {
      renderList();
    }

    const label = removed.length === 1 ? "task" : "tasks";
    showToast(`Cleared ${removed.length} completed ${label}.`, "Undo", () => {
      removed
        .slice()
        .sort((a, b) => a.index - b.index)
        .forEach(({ task, index }) => {
          state.tasks.splice(Math.min(index, state.tasks.length), 0, task);
        });
      persistTasks();
      renderList({ animateAll: true });
      updateMetrics();
    });
  }

  /* -------------------------------------------------------
     Toast
     ------------------------------------------------------- */

  function dismissToast() {
    if (!state.toast) return;
    const toast = state.toast;
    state.toast = null;
    window.clearTimeout(state.toastTimer);
    window.clearTimeout(state.toastRemoveTimer);
    toast.classList.remove("is-visible");
    state.toastRemoveTimer = window.setTimeout(() => toast.remove(), 400);
  }

  function showToast(message, actionLabel = null, onAction = null) {
    if (state.toast) {
      state.toast.remove();
      window.clearTimeout(state.toastTimer);
      window.clearTimeout(state.toastRemoveTimer);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");

    const text = document.createElement("span");
    text.className = "toast__message";
    text.textContent = message;
    toast.append(text);

    if (actionLabel && typeof onAction === "function") {
      const action = document.createElement("button");
      action.className = "toast__undo";
      action.type = "button";

      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("width", "12");
      icon.setAttribute("height", "12");
      icon.setAttribute("aria-hidden", "true");
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#i-undo");
      icon.append(use);

      const label = document.createElement("span");
      label.textContent = actionLabel;
      action.append(icon, label);

      action.addEventListener("click", () => {
        dismissToast();
        onAction();
      });
      toast.append(action);
    }

    els.toastRegion.append(toast);
    state.toast = toast;

    requestAnimationFrame(() => toast.classList.add("is-visible"));
    state.toastTimer = window.setTimeout(dismissToast, 6200);
  }

  /* -------------------------------------------------------
     Composer
     ------------------------------------------------------- */

  function addInputReset() {
    els.taskInput.value = "";
    els.addBtn.disabled = true;
  }

  function updateAddButton() {
    els.addBtn.disabled = els.taskInput.value.trim().length === 0;
  }

  /* -------------------------------------------------------
     Theme engine
     ------------------------------------------------------- */

  function setRangeValue(input, value, label) {
    const min = Number(input.min);
    const max = Number(input.max);
    const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
    input.value = String(value);
    input.style.setProperty("--range-progress", `${progress.toFixed(2)}%`);
    if (label) input.setAttribute("aria-valuetext", label);
  }

  function resolvePreset(effects) {
    if (!effects.atmosphere) return null;
    return PRESETS.find((preset) =>
      preset.hue === effects.hue &&
      preset.tint === effects.tintSat &&
      preset.accent === effects.accentHue &&
      preset.atmo === effects.atmoStyle &&
      preset.intensity === effects.atmoStrength
    ) || null;
  }

  function syncThemeUI() {
    const effects = state.effects;
    const preset = resolvePreset(effects);
    const presetId = preset ? preset.id : "custom";

    $$(".preset", els.presetGrid).forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.preset === presetId));
    });
    $$(".atmo-tile", els.atmoGrid).forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.atmo === effects.atmoStyle));
    });
    $$(".swatch", els.tintGrid).forEach((button) => {
      const active = Number(button.dataset.hue) === effects.hue &&
        Number(button.dataset.tint) === effects.tintSat;
      button.setAttribute("aria-pressed", String(active));
    });
    $$(".swatch", els.accentGrid).forEach((button) => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.hue) === effects.accentHue));
    });

    setRangeValue(els.optHue, effects.hue, `Hue ${effects.hue} degrees`);
    els.optHue.style.setProperty("--thumb-color", `hsl(${effects.hue} 86% 68%)`);
    els.hueValue.textContent = `${effects.hue}°`;

    setRangeValue(els.optTintSat, effects.tintSat, `${effects.tintSat} percent`);
    els.tintSatValue.textContent = `${effects.tintSat}%`;

    setRangeValue(els.optAccentHue, effects.accentHue, `Accent hue ${effects.accentHue} degrees`);
    els.optAccentHue.style.setProperty("--thumb-color", `hsl(${effects.accentHue} 82% 66%)`);
    els.accentHueValue.textContent = `${effects.accentHue}°`;

    setRangeValue(els.optGlassOpacity, effects.glassOpacity, `${effects.glassOpacity} percent`);
    els.glassOpacityValue.textContent = `${effects.glassOpacity}%`;

    setRangeValue(els.optAtmoStrength, effects.atmoStrength, `${effects.atmoStrength} percent`);
    els.atmoStrengthValue.textContent = `${effects.atmoStrength}%`;

    setRangeValue(els.optHaloStrength, effects.haloStrength, `${effects.haloStrength} percent`);
    els.haloStrengthValue.textContent = `${effects.haloStrength}%`;

    els.optAtmosphere.checked = effects.atmosphere;
    els.optHalo.checked = effects.halo;
    els.optCursorGlow.checked = effects.cursorGlow;
    els.optGrain.checked = effects.grain;
    els.optAmbientDrift.checked = effects.ambientDrift;
    els.optAmbientDrift.disabled = !effects.atmosphere;
    els.optShowDate.checked = effects.showDate;
    els.optClock24.checked = effects.clock24;

    els.optAtmoStrength.disabled = !effects.atmosphere;
    els.optAtmoStrength.closest(".field").classList.toggle("is-disabled", !effects.atmosphere);
    els.atmoGrid.classList.toggle("is-disabled", !effects.atmosphere);
    els.driftRow.classList.toggle("is-disabled", !effects.atmosphere);
    els.optHaloStrength.disabled = !effects.halo;
    els.haloStrengthField.classList.toggle("is-disabled", !effects.halo);
  }

  function applyEffects(nextEffects, { persist = false } = {}) {
    state.effects = normalizeEffects({ ...state.effects, ...nextEffects });
    const effects = state.effects;
    const glassAlpha = 0.28 + (effects.glassOpacity / 100) * 0.55;
    const atmoK = effects.atmosphere ? effects.atmoStrength / 100 : 0;
    const haloK = effects.halo ? effects.haloStrength / 100 : 0;
    const body = els.body;

    body.dataset.atmo = effects.atmoStyle;
    body.classList.toggle("has-drift", effects.atmosphere && effects.ambientDrift);
    body.classList.toggle("hide-date", !effects.showDate);
    body.classList.toggle("no-cursor-glow", !effects.cursorGlow);
    body.classList.toggle("no-halo", !effects.halo);
    body.style.setProperty("--hue", String(effects.hue));
    body.style.setProperty("--tint-s", `${effects.tintSat}%`);
    body.style.setProperty("--accent-h", String(effects.accentHue));
    body.style.setProperty("--glass-alpha", glassAlpha.toFixed(3));
    body.style.setProperty("--atmo-k", atmoK.toFixed(3));
    body.style.setProperty("--halo-k", haloK.toFixed(3));
    body.style.setProperty("--grain-k", effects.grain ? "1" : "0");

    syncThemeUI();
    if (persist) saveEffects();
  }

  async function saveEffects() {
    if (state.hasDesktopBridge) {
      try {
        await window.tideDesktop.setEffects(state.effects);
      } catch {
        showToast("Couldn’t save the appearance settings.");
      }
    } else {
      persistBrowserEffects();
    }
  }

  function renderThemeControls() {
    els.presetGrid.innerHTML = PRESETS.map((preset) => (
      `<button class="preset" type="button" data-preset="${preset.id}" data-atmo="${preset.atmo}" ` +
      `aria-pressed="false" aria-label="${preset.name} theme" title="${preset.name}" ` +
      `style="--hue:${preset.hue};--tint-s:${preset.tint}%">` +
      `<span class="preset__scene" aria-hidden="true"></span>` +
      `<span class="preset__name">${preset.name}</span>` +
      `</button>`
    )).join("");

    els.atmoGrid.innerHTML = ATMO_STYLES.map((style) => (
      `<button class="atmo-tile" type="button" data-atmo="${style.id}" aria-pressed="false" ` +
      `aria-label="${style.name} atmosphere" title="${style.name}">` +
      `<span class="atmo-tile__scene" aria-hidden="true"></span>` +
      `<span class="atmo-tile__name">${style.name}</span>` +
      `</button>`
    )).join("");

    els.tintGrid.innerHTML = TINT_SWATCHES.map((tint) => (
      `<button class="swatch" type="button" data-hue="${tint.hue}" data-tint="${tint.tint}" ` +
      `aria-pressed="false" aria-label="${tint.name} background" title="${tint.name}" ` +
      `style="--sw:hsl(${tint.hue} ${tint.tint}% 26%)"></button>`
    )).join("");

    els.accentGrid.innerHTML = ACCENT_SWATCHES.map((accent) => (
      `<button class="swatch" type="button" data-hue="${accent.hue}" aria-pressed="false" ` +
      `aria-label="${accent.name} accent" title="${accent.name}" ` +
      `style="--sw:hsl(${accent.hue} 84% 64%)"></button>`
    )).join("");

    els.presetGrid.addEventListener("click", (event) => {
      const button = event.target.closest(".preset");
      if (!button) return;
      const preset = PRESETS.find((item) => item.id === button.dataset.preset);
      if (!preset) return;
      applyEffects({
        atmosphere: true,
        hue: preset.hue,
        tintSat: preset.tint,
        accentHue: preset.accent,
        atmoStyle: preset.atmo,
        atmoStrength: preset.intensity
      }, { persist: true });
    });

    els.atmoGrid.addEventListener("click", (event) => {
      const button = event.target.closest(".atmo-tile");
      if (!button || !state.effects.atmosphere) return;
      applyEffects({ atmoStyle: button.dataset.atmo }, { persist: true });
    });

    els.tintGrid.addEventListener("click", (event) => {
      const button = event.target.closest(".swatch");
      if (!button) return;
      applyEffects({
        hue: Number(button.dataset.hue),
        tintSat: Number(button.dataset.tint)
      }, { persist: true });
    });

    els.accentGrid.addEventListener("click", (event) => {
      const button = event.target.closest(".swatch");
      if (!button) return;
      applyEffects({ accentHue: Number(button.dataset.hue) }, { persist: true });
    });
  }

  function resetAppearance() {
    applyEffects({ ...DEFAULT_EFFECTS }, { persist: true });
    state.lastClock = "";
    refreshTemporalCopy();
    showToast("Appearance reset to the default glass.");
  }

  function setupEffectControls() {
    const toggles = [
      [els.optAtmosphere, "atmosphere"],
      [els.optHalo, "halo"],
      [els.optCursorGlow, "cursorGlow"],
      [els.optGrain, "grain"],
      [els.optAmbientDrift, "ambientDrift"],
      [els.optShowDate, "showDate"],
      [els.optClock24, "clock24"]
    ];

    toggles.forEach(([input, key]) => {
      input.addEventListener("change", () => {
        applyEffects({ [key]: input.checked }, { persist: true });
        if (key === "clock24") {
          state.lastClock = "";
          refreshTemporalCopy();
        }
      });
    });

    const ranges = [
      [els.optHue, "hue"],
      [els.optTintSat, "tintSat"],
      [els.optAccentHue, "accentHue"],
      [els.optGlassOpacity, "glassOpacity"],
      [els.optAtmoStrength, "atmoStrength"],
      [els.optHaloStrength, "haloStrength"]
    ];

    ranges.forEach(([input, key]) => {
      input.addEventListener("input", () => {
        applyEffects({ [key]: Number(input.value) });
      });
      input.addEventListener("change", () => {
        saveEffects();
      });
    });

    els.studioReset.addEventListener("click", resetAppearance);

    if (!state.hasDesktopBridge) {
      els.optStartAtLogin.disabled = true;
      els.startupRow.classList.add("is-disabled");
      els.startupNote.textContent = "Available in the desktop app";

      const pinRow = els.optPin.closest(".row");
      if (pinRow) {
        els.optPin.disabled = true;
        pinRow.classList.add("is-disabled");
        const note = $(".row__note", pinRow);
        if (note) note.textContent = "Available in the desktop app";
      }

      if (els.resetPosition) {
        els.resetPosition.disabled = true;
        els.resetPosition.textContent = "Window position available in the desktop app";
      }
      return;
    }

    els.optStartAtLogin.addEventListener("change", async () => {
      const requested = els.optStartAtLogin.checked;
      els.optStartAtLogin.disabled = true;

      try {
        const actual = await window.tideDesktop.setStartAtLogin(requested);
        els.optStartAtLogin.checked = Boolean(actual);
        if (Boolean(actual) !== requested) {
          showToast("Windows did not accept the startup change.");
        }
      } catch {
        els.optStartAtLogin.checked = !requested;
        showToast("Couldn’t change the startup setting.");
      } finally {
        els.optStartAtLogin.disabled = false;
      }
    });

    els.optPin.addEventListener("change", async () => {
      const requested = els.optPin.checked;
      els.optPin.disabled = true;

      try {
        const pinned = await window.tideDesktop.setPinned(requested);
        setPinState(Boolean(pinned));
      } catch {
        els.optPin.checked = !requested;
        showToast("Couldn’t change the window layer.");
      } finally {
        els.optPin.disabled = false;
      }
    });

    if (els.resetPosition) {
      els.resetPosition.addEventListener("click", async () => {
        els.resetPosition.disabled = true;
        try {
          await window.tideDesktop.resetPosition();
          showToast("Window returned to the lower-right corner.");
        } catch {
          showToast("Couldn’t move the window.");
        } finally {
          els.resetPosition.disabled = false;
        }
      });
    }
  }

  function setVersionLabel(version) {
    if (els.studioVersion) {
      els.studioVersion.textContent = version ? `v${version}` : "dev";
    }
  }

  async function applyDesktopSettings() {
    if (!state.hasDesktopBridge) {
      applyEffects(loadBrowserEffects());
      setVersionLabel();
    } else {
      try {
        const settings = await window.tideDesktop.getSettings();
        applyEffects(settings.effects);
        setVersionLabel(settings.version);
        els.optStartAtLogin.checked = Boolean(settings.startAtLogin);
        setPinState(Boolean(settings.alwaysOnTop));
      } catch {
        applyEffects(DEFAULT_EFFECTS);
      } finally {
        els.optStartAtLogin.disabled = false;
      }
    }

    // Stored 12/24-hour preference may differ from the boot default.
    state.lastClock = "";
    refreshTemporalCopy();
  }

  /* -------------------------------------------------------
     Customize studio
     ------------------------------------------------------- */

  function isStudioOpen() {
    return state.studioOpen;
  }

  function openStudio() {
    if (state.studioOpen) return;
    state.studioOpen = true;
    els.studio.classList.add("is-open");
    els.studio.removeAttribute("inert");
    els.studio.setAttribute("aria-hidden", "false");
    els.settingsBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("studio-open");
    els.widgetBody.setAttribute("inert", "");
    els.studioBody.scrollTop = 0;
    if (document.activeElement === els.taskInput) els.taskInput.blur();
    document.addEventListener("click", handleDocumentClick);
    window.setTimeout(() => {
      if (state.studioOpen) els.studioClose.focus({ preventScroll: true });
    }, 60);
  }

  function closeStudio({ returnFocus = false } = {}) {
    if (!state.studioOpen) return;
    state.studioOpen = false;
    els.studio.classList.remove("is-open");
    els.studio.setAttribute("inert", "");
    els.studio.setAttribute("aria-hidden", "true");
    els.settingsBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("studio-open");
    els.widgetBody.removeAttribute("inert");
    document.removeEventListener("click", handleDocumentClick);
    if (returnFocus) els.settingsBtn.focus({ preventScroll: true });
  }

  function handleDocumentClick(event) {
    if (!state.studioOpen) return;
    if (els.studio.contains(event.target) || els.settingsBtn.contains(event.target)) return;
    closeStudio();
  }

  function setStudioTab(tab) {
    if (!TABS.includes(tab) || state.activeTab === tab) return;
    state.activeTab = tab;
    els.studioTabs.style.setProperty("--tab-index", String(TABS.indexOf(tab)));

    els.tabButtons.forEach((button) => {
      const active = button.dataset.tab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });

    els.panes.forEach((pane) => {
      const active = pane.id === `pane${tab.charAt(0).toUpperCase()}${tab.slice(1)}`;
      pane.classList.toggle("is-active", active);
      pane.hidden = !active;
    });

    els.studioBody.scrollTop = 0;
  }

  function setupStudio() {
    els.settingsBtn.addEventListener("click", () => {
      if (state.studioOpen) closeStudio();
      else openStudio();
    });
    els.studioClose.addEventListener("click", () => closeStudio({ returnFocus: true }));

    els.studioTabs.addEventListener("click", (event) => {
      const button = event.target.closest(".studio__tab");
      if (!button) return;
      setStudioTab(button.dataset.tab);
    });

    els.studioTabs.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const current = TABS.indexOf(state.activeTab);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = (current + direction + TABS.length) % TABS.length;
      setStudioTab(TABS[next]);
      const nextButton = els.tabButtons[next];
      if (nextButton) nextButton.focus();
    });
  }

  /* -------------------------------------------------------
     Window bridge
     ------------------------------------------------------- */

  function setPinState(pinned) {
    const on = Boolean(pinned);
    els.winPin.setAttribute("aria-pressed", String(on));
    els.winPin.setAttribute(
      "aria-label",
      on ? "Stop keeping window on top" : "Keep window on top"
    );
    els.winPin.title = on ? "Stop keeping on top" : "Keep on top";
    els.optPin.checked = on;
  }

  function setupDesktopBridge() {
    if (!state.hasDesktopBridge) {
      return;
    }

    document.body.classList.add("is-desktop");

    els.winPin.addEventListener("click", async () => {
      const next = els.winPin.getAttribute("aria-pressed") !== "true";
      try {
        const pinned = await window.tideDesktop.setPinned(next);
        setPinState(Boolean(pinned));
      } catch {
        showToast("Couldn’t change the window layer.");
      }
    });

    els.winMin.addEventListener("click", () => {
      try { window.tideDesktop.minimize(); } catch { /* no-op */ }
    });

    els.winClose.addEventListener("click", () => {
      try { window.tideDesktop.close(); } catch { /* no-op */ }
    });
  }

  /* -------------------------------------------------------
     Pointer specular + focus state
     ------------------------------------------------------- */

  function setupSpecular() {
    if (reduceMotion) return;

    const update = (event) => {
      if (!state.effects.cursorGlow) return;
      if (state.specularFrame) return;
      state.specularFrame = requestAnimationFrame(() => {
        state.specularFrame = 0;
        const rect = els.widget.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        els.widget.style.setProperty("--gx", `${Math.max(0, Math.min(100, x)).toFixed(2)}%`);
        els.widget.style.setProperty("--gy", `${Math.max(0, Math.min(100, y)).toFixed(2)}%`);
      });
    };

    els.widget.addEventListener("pointermove", update);
    els.widget.addEventListener("pointerleave", () => {
      els.widget.style.setProperty("--gx", "18%");
      els.widget.style.setProperty("--gy", "4%");
    });
  }

  function setupWindowFocus() {
    window.addEventListener("blur", () => document.body.classList.add("is-blurred"));
    window.addEventListener("focus", () => {
      document.body.classList.remove("is-blurred");
      state.lastClock = "";
      refreshTemporalCopy();
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refreshTemporalCopy();
    });
  }

  /* -------------------------------------------------------
     Keyboard
     ------------------------------------------------------- */

  const FOCUSABLE_SELECTOR = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function isTypingTarget(target) {
    return target instanceof Element &&
      Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
  }

  function trapStudioFocus(event) {
    const nodes = $$(FOCUSABLE_SELECTOR, els.studio).filter((node) =>
      !node.closest("[hidden]") && node.getClientRects().length > 0
    );

    if (nodes.length === 0) {
      event.preventDefault();
      return;
    }

    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;

    if (!els.studio.contains(active)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    }
  }

  function setupKeyboard() {
    const isMac = /mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent);
    els.modKey.textContent = isMac ? "⌘" : "Ctrl";

    document.addEventListener("keydown", (event) => {
      const mod = isMac ? event.metaKey : event.ctrlKey;
      const key = event.key.toLowerCase();

      if (event.key === "Tab" && isStudioOpen()) {
        trapStudioFocus(event);
        return;
      }

      if (event.key === "Escape" && isStudioOpen()) {
        event.preventDefault();
        closeStudio({ returnFocus: true });
        return;
      }

      if (mod && (key === "k" || key === "n")) {
        if (isStudioOpen()) closeStudio();
        event.preventDefault();
        els.taskInput.focus();
        els.taskInput.select();
        return;
      }

      if (event.key === "Escape" && document.activeElement === els.taskInput) {
        if (els.taskInput.value.length > 0) {
          addInputReset();
        } else {
          els.taskInput.blur();
        }
        return;
      }

      if (
        !isStudioOpen() &&
        !event.defaultPrevented &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault();
        const current = Math.max(0, FILTERS.indexOf(state.filter));
        const direction = event.key === "ArrowRight" ? 1 : -1;
        setFilter(FILTERS[(current + direction + FILTERS.length) % FILTERS.length]);
      }
    });
  }

  /* -------------------------------------------------------
     Boot
     ------------------------------------------------------- */

  function setupInteractions() {
    els.addForm.addEventListener("submit", (event) => {
      event.preventDefault();
      addTask(els.taskInput.value);
    });

    els.taskInput.addEventListener("input", updateAddButton);
    els.addBtn.disabled = true;

    els.filters.addEventListener("click", (event) => {
      const button = event.target.closest(".filter");
      if (!button) return;
      setFilter(button.dataset.filter);
    });

    els.filters.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const current = FILTERS.indexOf(state.filter);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = (current + direction + FILTERS.length) % FILTERS.length;
      setFilter(FILTERS[next]);
      const nextButton = els.filterButtons[next];
      if (nextButton) nextButton.focus();
    });

    els.clearDone.addEventListener("click", clearCompleted);

    els.taskList.addEventListener("dblclick", (event) => {
      const row = event.target.closest(".task");
      if (!row) return;
      if (event.target.closest(".task__actions")) return;
      if (event.target.closest(".task__toggle")) return;
      if (event.target.classList.contains("task__edit-input")) return;
      startEditing(row.dataset.id);
    });
  }

  function boot() {
    loadState();
    refreshTemporalCopy();
    updateFilterUI();
    setupInteractions();
    setupKeyboard();
    setupWindowFocus();
    setupSpecular();
    renderThemeControls();
    setupStudio();
    setupEffectControls();
    setupDesktopBridge();

    els.donePct.textContent = "0";
    els.progressFill.style.width = "0%";
    renderList({ animateAll: true });
    updateMetrics({ initial: true });

    // Applying defaults first avoids an empty-looking glass panel while the
    // native settings request resolves. The stored settings then take over.
    applyEffects(state.hasDesktopBridge ? DEFAULT_EFFECTS : loadBrowserEffects());

    applyDesktopSettings();

    window.setTimeout(() => {
      const pct = state.tasks.length === 0
        ? 0
        : Math.round((doneTasks().length / state.tasks.length) * 100);
      els.progressFill.style.width = `${pct}%`;
    }, 380);

    window.setInterval(refreshTemporalCopy, 30000);
  }

  boot();
})();
