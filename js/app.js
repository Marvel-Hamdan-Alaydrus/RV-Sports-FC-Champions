```javascript
/*
 * RV Sports: FC Champions
 * js/app.js
 *
 * Foundation controller:
 * Loading → Start Game → Character Creation
 * → Gacha → Player Card → Dashboard
 */

"use strict";

// ============================================================
// TEMPORARY LOCAL STATE
// Nanti dipindahkan ke js/core/state.js
// ============================================================

const gameState = {
  player: {
    name: "",
    email: "",
    dateOfBirth: "",
    shirtName: "",
    shirtNumber: 9,
    country: "",
    position: "ST",

    stats: {
      PAC: 0,
      SHO: 0,
      PAS: 0,
      DRI: 0,
      DEF: 0,
      PHY: 0
    },

    ovr: 0,
    tier: "Bronze",
    potential: 0,

    money: 0,
    fans: 0,
    followers: 0,
    reputation: 0,

    careerHistory: [],
    trophies: [],
    nationalTeam: [],
    clubs: []
  }
};

// ============================================================
// CONSTANTS
// ============================================================

const POSITIONS = [
  "GK",
  "LB",
  "CB",
  "RB",
  "CDM",
  "CM",
  "CAM",
  "LW",
  "RW",
  "CF",
  "ST"
];

const STAT_NAMES = [
  "PAC",
  "SHO",
  "PAS",
  "DRI",
  "DEF",
  "PHY"
];

// Bobot OVR berdasarkan posisi.
// Nanti bisa kita pindahkan ke data/positions.js.

const POSITION_WEIGHTS = {
  GK: {
    PAC: 0.10,
    SHO: 0.05,
    PAS: 0.10,
    DRI: 0.05,
    DEF: 0.35,
    PHY: 0.35
  },

  LB: {
    PAC: 0.20,
    SHO: 0.05,
    PAS: 0.20,
    DRI: 0.15,
    DEF: 0.25,
    PHY: 0.15
  },

  CB: {
    PAC: 0.10,
    SHO: 0.02,
    PAS: 0.13,
    DRI: 0.05,
    DEF: 0.45,
    PHY: 0.25
  },

  RB: {
    PAC: 0.20,
    SHO: 0.05,
    PAS: 0.20,
    DRI: 0.15,
    DEF: 0.25,
    PHY: 0.15
  },

  CDM: {
    PAC: 0.10,
    SHO: 0.05,
    PAS: 0.25,
    DRI: 0.10,
    DEF: 0.30,
    PHY: 0.20
  },

  CM: {
    PAC: 0.10,
    SHO: 0.15,
    PAS: 0.25,
    DRI: 0.20,
    DEF: 0.15,
    PHY: 0.15
  },

  CAM: {
    PAC: 0.10,
    SHO: 0.15,
    PAS: 0.25,
    DRI: 0.30,
    DEF: 0.05,
    PHY: 0.15
  },

  LW: {
    PAC: 0.25,
    SHO: 0.20,
    PAS: 0.15,
    DRI: 0.30,
    DEF: 0.03,
    PHY: 0.07
  },

  RW: {
    PAC: 0.25,
    SHO: 0.20,
    PAS: 0.15,
    DRI: 0.30,
    DEF: 0.03,
    PHY: 0.07
  },

  CF: {
    PAC: 0.15,
    SHO: 0.30,
    PAS: 0.15,
    DRI: 0.25,
    DEF: 0.02,
    PHY: 0.13
  },

  ST: {
    PAC: 0.20,
    SHO: 0.35,
    PAS: 0.10,
    DRI: 0.15,
    DEF: 0.02,
    PHY: 0.18
  }
};

// ============================================================
// CARD TIERS
// ============================================================

const CARD_TIERS = [
  {
    min: 98,
    name: "Legendary",
    className: "tier-legendary"
  },

  {
    min: 95,
    name: "Iconic",
    className: "tier-iconic"
  },

  {
    min: 90,
    name: "World Class",
    className: "tier-world-class"
  },

  {
    min: 85,
    name: "Elite",
    className: "tier-elite"
  },

  {
    min: 80,
    name: "Gold",
    className: "tier-gold"
  },

  {
    min: 70,
    name: "Silver",
    className: "tier-silver"
  },

  {
    min: 0,
    name: "Bronze",
    className: "tier-bronze"
  }
];

// ============================================================
// DOM HELPERS
// ============================================================

const $ = (id) => document.getElementById(id);

const screens = {
  loading: $("loading-screen"),
  start: $("start-screen"),
  creation: $("character-creation-screen"),
  game: $("game-screen"),
  creator: $("creator-screen")
};

function showScreen(name) {
  Object.values(screens).forEach((screen) => {
    if (screen) {
      screen.classList.add("hidden");
    }
  });

  if (screens[name]) {
    screens[name].classList.remove("hidden");
  }
}

function setText(id, value) {
  const element = $(id);

  if (element) {
    element.textContent = value;
  }
}

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

// ============================================================
// LOADING SCREEN
// ============================================================

function runLoadingScreen() {
  let progress = 1;

  const messages = [
    [1, "Booting football world..."],
    [20, "Loading clubs..."],
    [40, "Loading players..."],
    [60, "Loading career system..."],
    [80, "Preparing your career..."],
    [95, "Almost ready..."],
    [100, "Welcome to FC Champions."]
  ];

  function updateLoadingText(percent) {
    let current = messages[0][1];

    for (const [threshold, message] of messages) {
      if (percent >= threshold) {
        current = message;
      }
    }

    setText(
      "loading-text",
      current
    );
  }

  function tick() {
    setText(
      "loading-percent",
      `${progress}%`
    );

    const bar = $("loading-bar");

    if (bar) {
      bar.style.width = `${progress}%`;
    }

    updateLoadingText(progress);

    if (progress >= 100) {
      setTimeout(() => {
        showScreen("start");
      }, 500);

      return;
    }

    progress += 1;

    const delay =
      progress < 20
        ? 22
        : progress < 80
          ? 25
          : 35;

    setTimeout(
      tick,
      delay
    );
  }

  tick();
}

// ============================================================
// START GAME
// ============================================================

function handleStartGame() {
  const name =
    ($("player-name")?.value || "")
      .trim();

  const email =
    ($("player-email")?.value || "")
      .trim();

  if (!name) {
    showToast(
      "Masukin nama lu dulu."
    );

    $("player-name")?.focus();

    return;
  }

  if (
    !email ||
    !email.includes("@")
  ) {
    showToast(
      "Masukin email yang valid."
    );

    $("player-email")?.focus();

    return;
  }

  gameState.player.name = name;
  gameState.player.email = email;

  syncCreationFields();

  showScreen("creation");
}

// ============================================================
// CHARACTER CREATION
// ============================================================

function syncCreationFields() {
  const player =
    gameState.player;

  if ($("character-name")) {
    $("character-name").value =
      player.name;
  }

  if ($("shirt-name")) {
    $("shirt-name").value =
      player.shirtName;
  }

  if ($("shirt-number")) {
    $("shirt-number").value =
      player.shirtNumber;
  }

  if ($("country")) {
    $("country").value =
      player.country;
  }

  if ($("date-of-birth")) {
    $("date-of-birth").value =
      player.dateOfBirth;
  }

  updatePlayerCard();
}

function readCreationFields() {
  const player =
    gameState.player;

  player.name =
    (
      $("character-name")?.value ||
      player.name
    ).trim();

  player.dateOfBirth =
    $("date-of-birth")?.value ||
    "";

  player.shirtName =
    (
      $("shirt-name")?.value ||
      ""
    ).trim();

  const shirtNumber =
    Number(
      $("shirt-number")?.value
    );

  if (Number.isFinite(shirtNumber)) {
    player.shirtNumber =
      clamp(
        shirtNumber,
        1,
        99
      );
  }

  player.country =
    (
      $("country")?.value ||
      ""
    ).trim();

  return player;
}

function setupCreationFields() {
  const fieldIds = [
    "character-name",
    "date-of-birth",
    "shirt-name",
    "shirt-number",
    "country"
  ];

  fieldIds.forEach((id) => {
    const element = $(id);

    if (!element) {
      return;
    }

    element.addEventListener(
      "input",
      () => {
        readCreationFields();
        updatePlayerCard();
      }
    );

    element.addEventListener(
      "change",
      () => {
        readCreationFields();
        updatePlayerCard();
      }
    );
  });

  document
    .querySelectorAll(
      "[data-position], .position-option"
    )
    .forEach((element) => {
      element.addEventListener(
        "click",
        () => {
          const position =
            element.dataset.position ||
            element.value ||
            element.textContent
              .trim()
              .toUpperCase();

          if (
            !POSITIONS.includes(position)
          ) {
            return;
          }

          gameState.player.position =
            position;

          document
            .querySelectorAll(
              "[data-position], .position-option"
            )
            .forEach((item) => {
              item.classList.remove(
                "selected",
                "active"
              );
            });

          element.classList.add(
            "selected",
            "active"
          );

          updatePlayerCard();
        }
      );
    });
}

// ============================================================
// GACHA STATS
// ============================================================

function randomInt(min, max) {
  return Math.floor(
    Math.random() *
      (max - min + 1)
  ) + min;
}

function generateGachaStats() {
  const position =
    gameState.player.position;

  const weights =
    POSITION_WEIGHTS[position] ||
    POSITION_WEIGHTS.ST;

  const stats = {};

  for (const stat of STAT_NAMES) {
    const weight =
      weights[stat] || 0.1;

    const base =
      randomInt(55, 86);

    const bonus =
      Math.round(
        weight *
        randomInt(8, 30)
      );

    stats[stat] =
      clamp(
        base + bonus,
        55,
        95
      );
  }

  // Lucky stat.
  const luckyStat =
    STAT_NAMES[
      randomInt(
        0,
        STAT_NAMES.length - 1
      )
    ];

  stats[luckyStat] =
    clamp(
      stats[luckyStat] +
        randomInt(3, 9),
      55,
      99
    );

  gameState.player.stats =
    stats;

  gameState.player.ovr =
    calculateOVR(
      stats,
      position
    );

  const tier =
    getCardTier(
      gameState.player.ovr
    );

  gameState.player.tier =
    tier.name;

  gameState.player.potential =
    clamp(
      gameState.player.ovr +
        randomInt(3, 8),
      0,
      99
    );

  updateGachaResult();
  updatePlayerCard();

  showToast(
    `Gacha selesai — OVR ${gameState.player.ovr} ${gameState.player.tier}.`
  );
}

function calculateOVR(
  stats,
  position
) {
  const weights =
    POSITION_WEIGHTS[position] ||
    {};

  let total = 0;
  let weightTotal = 0;

  for (const stat of STAT_NAMES) {
    const value =
      Number(stats[stat]) || 0;

    const weight =
      Number(weights[stat]) ||
      (1 / STAT_NAMES.length);

    total +=
      value * weight;

    weightTotal +=
      weight;
  }

  return clamp(
    Math.round(
      total / weightTotal
    ),
    1,
    99
  );
}

function getCardTier(ovr) {
  return (
    CARD_TIERS.find(
      (tier) =>
        ovr >= tier.min
    ) ||
    CARD_TIERS[
      CARD_TIERS.length - 1
    ]
  );
}

// ============================================================
// PLAYER CARD
// ============================================================

function updatePlayerCard() {
  const player =
    gameState.player;

  const card =
    $("player-card");

  if (!card) {
    return;
  }

  const tier =
    getCardTier(
      player.ovr
    );

  card.dataset.tier =
    tier.name
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );

  CARD_TIERS.forEach(
    (item) => {
      card.classList.remove(
        item.className
      );
    }
  );

  card.classList.add(
    tier.className
  );

  setText(
    "card-ovr",
    player.ovr || "—"
  );

  setText(
    "card-position",
    player.position || "—"
  );

  setText(
    "card-player-name",
    player.name || "PLAYER"
  );

  setText(
    "card-nationality",
    player.country || "COUNTRY"
  );

  setText(
    "card-pac",
    player.stats.PAC || "—"
  );

  setText(
    "card-sho",
    player.stats.SHO || "—"
  );

  setText(
    "card-pas",
    player.stats.PAS || "—"
  );

  setText(
    "card-dri",
    player.stats.DRI || "—"
  );

  setText(
    "card-def",
    player.stats.DEF || "—"
  );

  setText(
    "card-phy",
    player.stats.PHY || "—"
  );

  setText(
    "card-shirt-name",
    player.shirtName || "—"
  );

  setText(
    "card-shirt-number",
    player.shirtNumber || "—"
  );

  card.style.setProperty(
    "--card-ovr",
    player.ovr || 0
  );

  card.style.setProperty(
    "--card-tier",
    `"${tier.name}"`
  );
}

// ============================================================
// GACHA RESULT UI
// ============================================================

function updateGachaResult() {
  const board =
    $("gacha-result-board");

  if (!board) {
    return;
  }

  board.innerHTML = "";

  STAT_NAMES.forEach(
    (stat) => {
      const item =
        document.createElement(
          "div"
        );

      item.className =
        "gacha-stat-result";

      const label =
        document.createElement(
          "span"
        );

      label.textContent =
        stat;

      const value =
        document.createElement(
          "strong"
        );

      value.textContent =
        gameState.player.stats[
          stat
        ];

      item.append(
        label,
        value
      );

      board.appendChild(
        item
      );
    }
  );

  const ovr =
    document.createElement(
      "div"
    );

  ovr.className =
    "gacha-ovr-result";

  ovr.textContent =
    `OVR ${gameState.player.ovr} · ${gameState.player.tier}`;

  board.appendChild(
    ovr
  );

  setText(
    "gacha-roll-count",
    "1"
  );
}

// ============================================================
// VALIDATION
// ============================================================

function validateCharacter() {
  readCreationFields();

  const player =
    gameState.player;

  if (!player.name) {
    showToast(
      "Nama karakter belum diisi."
    );

    $("character-name")?.focus();

    return false;
  }

  if (!player.dateOfBirth) {
    showToast(
      "Tanggal lahir belum diisi."
    );

    $("date-of-birth")?.focus();

    return false;
  }

  if (!player.shirtName) {
    showToast(
      "Nama punggung belum diisi."
    );

    $("shirt-name")?.focus();

    return false;
  }

  if (!player.country) {
    showToast(
      "Country belum dipilih/diisi."
    );

    $("country")?.focus();

    return false;
  }

  if (
    !POSITIONS.includes(
      player.position
    )
  ) {
    showToast(
      "Pilih posisi dulu."
    );

    return false;
  }

  const hasStats =
    STAT_NAMES.every(
      (stat) =>
        Number(
          player.stats[stat]
        ) > 0
    );

  if (!hasStats) {
    showToast(
      "Roll Gacha Stats dulu."
    );

    return false;
  }

  return true;
}

// ============================================================
// CREATE PLAYER
// ============================================================

function createPlayer() {
  if (!validateCharacter()) {
    return;
  }

  // Starter economy.
  // Nanti dipindahkan ke economy system.

  gameState.player.money =
    10000;

  gameState.player.fans =
    0;

  gameState.player.followers =
    0;

  gameState.player.reputation =
    1;

  updateDashboard();

  showScreen("game");

  showToast(
    `${gameState.player.name} resmi masuk FC Champions.`
  );
}

// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {
  const player =
    gameState.player;

  setText(
    "dashboard-player-name",
    player.name
  );

  setText(
    "dashboard-ovr",
    player.ovr
  );

  setText(
    "dashboard-money",
    formatMoney(
      player.money
    )
  );

  setText(
    "dashboard-position",
    player.position
  );

  setText(
    "dashboard-country",
    player.country
  );
}

function formatMoney(amount) {
  const value =
    Number(amount) || 0;

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }
  ).format(value);
}

// ============================================================
// CREATOR ENTRY
// ============================================================

function handleCreatorEntry() {
  /*
   * Creator authentication sengaja belum
   * ditaruh di app.js.
   *
   * Nanti:
   *
   * js/admin/auth.js
   * js/admin/console.js
   * js/admin/character-editor.js
   * js/admin/world-editor.js
   */

  showToast(
    "Creator Mode belum diaktifkan. Auth akan kita pasang di js/admin/auth.js."
  );
}

// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {
  document
    .querySelectorAll(
      "[data-screen]"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const target =
              button.dataset.screen;

            if (screens[target]) {
              showScreen(
                target
              );
            }
          }
        );
      }
    );

  document
    .querySelectorAll(
      "[data-action]"
    )
    .forEach(
      (button) => {
        button.addEventListener(
          "click",
          () => {
            const action =
              button.dataset.action;

            if (
              action === "home"
            ) {
              showScreen(
                "game"
              );
            }

            if (
              action === "creation"
            ) {
              showScreen(
                "creation"
              );
            }

            if (
              action === "creator"
            ) {
              showScreen(
                "creator"
              );
            }
          }
        );
      }
    );
}

// ============================================================
// TOAST
// ============================================================

function showToast(message) {
  let root =
    $("toast-root");

  if (!root) {
    root =
      document.createElement(
        "div"
      );

    root.id =
      "toast-root";

    document.body.appendChild(
      root
    );
  }

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    "game-toast";

  toast.textContent =
    message;

  root.appendChild(
    toast
  );

  requestAnimationFrame(
    () => {
      toast.classList.add(
        "show"
      );
    }
  );

  setTimeout(
    () => {
      toast.classList.remove(
        "show"
      );

      setTimeout(
        () => {
          toast.remove();
        },
        250
      );
    },
    2500
  );
}

// ============================================================
// EVENT BINDINGS
// ============================================================

function bindEvents() {
  $("start-game-button")
    ?.addEventListener(
      "click",
      handleStartGame
    );

  $("gacha-stats-button")
    ?.addEventListener(
      "click",
      () => {
        readCreationFields();
        generateGachaStats();
      }
    );

  $("create-player-button")
    ?.addEventListener(
      "click",
      createPlayer
    );

  $("admin-entry-button")
    ?.addEventListener(
      "click",
      handleCreatorEntry
    );

  setupCreationFields();

  setupNavigation();
}

// ============================================================
// INITIALIZATION
// ============================================================

function initApp() {
  console.log(
    "RV Sports: FC Champions — app.js initialized."
  );

  bindEvents();

  // Player card mulai dalam kondisi kosong.
  updatePlayerCard();

  // Mulai dari loading.
  showScreen(
    "loading"
  );

  runLoadingScreen();
}

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initApp
  );
} else {
  initApp();
}

// ============================================================
// TEMPORARY DEBUG ACCESS
// ============================================================

window.RVSports = {
  gameState,
  calculateOVR,
  getCardTier,
  generateGachaStats,
  updatePlayerCard,
  showScreen
};
```
