(() => {
  "use strict";

  const STORAGE_KEYS = {
    concept: "gameConceptBuilder.conceptData.v1",
    template: "gameConceptBuilder.templateSettings.v1",
  };

  const LAYOUT_NOTES = {
    slides:
      "슬라이드형: 16:9 발표용으로 항목을 장표처럼 나눕니다. PPTX도 와이드스크린으로 저장됩니다.",
    standard: "기본형: A4 문서로 발표와 공유에 무난하게 쓸 수 있는 구성입니다.",
    compact: "간결형: 내용이 많을 때 여백을 줄여 더 촘촘하게 보여줍니다.",
    review: "발표 검토형: 핵심 문장과 차별점이 빠르게 보이도록 강조합니다.",
    timeline: "스토리형: 개발 과정과 기획 흐름을 이야기처럼 읽기 쉽게 보여줍니다.",
    portfolio: "비주얼 강조형: 게임 이미지와 아트 컨셉을 더 크게 보여주는 구성입니다.",
  };

  const SECTION_DEFINITIONS = [
    { key: "intro", label: "게임 소개" },
    { key: "features", label: "게임의 특징" },
    { key: "gameplay", label: "게임 플레이 방식" },
    { key: "images", label: "게임 이미지" },
    { key: "market", label: "시장 진출 계획" },
    { key: "team", label: "팀 소개 및 역할" },
    { key: "episode", label: "개발 과정 에피소드" },
  ];

  const MAX_CORE_CONCEPT_IMAGES = 3;

  const IMAGE_FIELDS = [
    { path: "features.whySpecialImage", label: "특별함 설명 이미지", inputId: "image-why-special" },
    {
      path: "features.playerExperienceImage",
      label: "경험 설명 이미지",
      inputId: "image-player-experience",
    },
    { path: "gameplay.flowImage", label: "진행 흐름 이미지", inputId: "image-gameplay-flow" },
    {
      path: "gameplay.coreSystemsImage",
      label: "핵심 시스템 이미지",
      inputId: "image-gameplay-systems",
    },
    { path: "gameplay.winLoseImage", label: "승패 조건 이미지", inputId: "image-gameplay-winlose" },
    { path: "gameplay.growthImage", label: "성장 요소 이미지", inputId: "image-gameplay-growth" },
    { path: "images.mainScreen", label: "메인 화면", inputId: "image-main-screen" },
    { path: "images.playScreen", label: "플레이 화면", inputId: "image-play-screen" },
    { path: "images.ui", label: "UI", inputId: "image-ui" },
  ];

  const SECTION_FIELDS = {
    intro: [
      "name",
      "oneLiner",
      "coreConcept",
      "coreConceptImages",
      "genre",
      "platform",
      "target",
      "references",
    ],
    features: [
      "whySpecial",
      "whySpecialImage",
      "differentiationText",
      "differentiation",
      "playerExperience",
      "playerExperienceImage",
    ],
    gameplay: [
      "flow",
      "flowImage",
      "coreSystems",
      "coreSystemsImage",
      "winLose",
      "winLoseImage",
      "growth",
      "growthImage",
    ],
    images: ["mainScreen", "playScreen", "ui", "artConcept", "artColors"],
    market: ["targetPlatform", "targetUsers", "postLaunch"],
    team: ["teamName", "members"],
    episode: ["motivation", "trials", "redesign", "futureGoals"],
  };

  const FIELD_LABELS = {
    "intro.name": "게임이름",
    "intro.oneLiner": "한 줄 소개",
    "intro.coreConcept": "게임의 핵심 컨셉",
    "intro.genre": "장르",
    "intro.platform": "플랫폼",
    "intro.target": "타겟",
    "features.whySpecial": "왜 이 게임이 특별한가",
    "features.differentiationText": "다른 게임과 차별점",
    "features.playerExperience": "플레이어가 느끼게 될 경험",
    "gameplay.flow": "게임 진행 흐름",
    "gameplay.coreSystems": "핵심 시스템",
    "gameplay.winLose": "승패 조건",
    "gameplay.growth": "성장 요소",
    "images.artConcept": "아트 컨셉",
    "images.artColors": "아트 컬러",
    "market.targetPlatform": "목표 플랫폼",
    "market.targetUsers": "목표 유저",
    "market.postLaunch": "출시 이후 계획",
    "team.teamName": "팀명",
    "team.members": "팀인원 설명",
    "episode.motivation": "왜 이 게임을 만들게 되었는지",
    "episode.trials": "시행착오",
    "episode.redesign": "리디자인 과정",
    "episode.futureGoals": "앞으로의 목표",
  };

  const dom = {
    form: document.querySelector("#document-form"),
    comparisonHead: document.querySelector("#comparison-head"),
    comparisonRows: document.querySelector("#comparison-rows"),
    referenceItems: document.querySelector("#reference-items"),
    coreConceptImageItems: document.querySelector("#core-concept-image-items"),
    addCoreConceptImageButton: document.querySelector(
      '[data-action="add-core-concept-image"]',
    ),
    artColorItems: document.querySelector("#art-color-items"),
    previewScroll: document.querySelector(".preview-scroll"),
    preview: document.querySelector("#document-preview"),
    pageCount: document.querySelector("#page-count"),
    saveStatus: document.querySelector("#save-status"),
    progressText: document.querySelector("#progress-text"),
    completionProgress: document.querySelector("#completion-progress"),
    presetNote: document.querySelector("#preset-note"),
    sectionOrderList: document.querySelector("#section-order-list"),
    refreshButton: document.querySelector("#refresh-preview"),
    resetButton: document.querySelector("#reset-data"),
    sampleButton: document.querySelector("#load-sample"),
    printButton: document.querySelector("#print-document"),
    copyAiPromptButton: document.querySelector("#copy-ai-prompt"),
    openGuideButton: document.querySelector("#open-guide"),
    closeGuideButton: document.querySelector("#close-guide"),
    guideDialog: document.querySelector("#guide-dialog"),
  };

  function createId(prefix) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function createEmptyReference() {
    return {
      id: createId("reference"),
      name: "",
      image: "",
    };
  }

  function createEmptyCoreConceptImage() {
    return {
      id: createId("core-image"),
      image: "",
    };
  }

  function ensureCoreConceptImages() {
    if (!Array.isArray(state.concept.intro.coreConceptImages)) {
      state.concept.intro.coreConceptImages = [];
    }
  }

  function createEmptyArtColor(hex = "#808080", name = "") {
    return {
      id: createId("color"),
      hex: normalizeHex(hex),
      name,
    };
  }

  function createEmptyComparisonGame(name = "") {
    return {
      id: createId("game"),
      name,
    };
  }

  function createEmptyComparisonRow(gameIds) {
    const values = {};
    const ids = Array.isArray(gameIds) ? gameIds : getComparisonGameIds();
    ids.forEach((gameId) => {
      values[gameId] = "";
    });
    return {
      id: createId("compare"),
      aspect: "",
      values,
      ourGame: "",
    };
  }

  function getComparisonGameIds() {
    try {
      return (state?.concept?.features?.comparisonGames || []).map(
        (game) => game.id,
      );
    } catch (error) {
      return [];
    }
  }

  function syncComparisonRowValues() {
    const gameIds = getComparisonGameIds();
    state.concept.features.differentiation = (
      state.concept.features.differentiation || []
    ).map((row) => {
      const values = {};
      gameIds.forEach((gameId) => {
        values[gameId] = coerceText(row.values?.[gameId] ?? "");
      });
      return {
        id: row.id || createId("compare"),
        aspect: coerceText(row.aspect),
        values,
        ourGame: coerceText(row.ourGame),
      };
    });
  }

  let state = {
    concept: createDefaultConcept(),
    template: createDefaultTemplate(),
  };
  let saveTimer = null;
  let paginationFrame = null;
  let lastImagePasteTarget = null;
  let artColorDragId = null;

  function createDefaultConcept() {
    const firstGame = createEmptyComparisonGame("비교 대상 게임 1");
    return {
      intro: {
        name: "",
        oneLiner: "",
        coreConcept: "",
        coreConceptImages: [],
        genre: "",
        platform: "",
        target: "",
        references: [createEmptyReference()],
      },
      features: {
        whySpecial: "",
        whySpecialImage: "",
        differentiationText: "",
        comparisonGames: [firstGame],
        differentiation: [createEmptyComparisonRow([firstGame.id])],
        playerExperience: "",
        playerExperienceImage: "",
      },
      gameplay: {
        flow: "",
        flowImage: "",
        coreSystems: "",
        coreSystemsImage: "",
        winLose: "",
        winLoseImage: "",
        growth: "",
        growthImage: "",
      },
      images: {
        mainScreen: "",
        playScreen: "",
        ui: "",
        artConcept: "",
        artColors: [],
      },
      market: {
        targetPlatform: "",
        targetUsers: "",
        postLaunch: "",
      },
      team: {
        teamName: "",
        members: "",
      },
      episode: {
        motivation: "",
        trials: "",
        redesign: "",
        futureGoals: "",
      },
    };
  }

  function createDefaultTemplate() {
    return {
      visibility: Object.fromEntries(
        SECTION_DEFINITIONS.map((section) => [section.key, true]),
      ),
      title: "게임 컨셉 기획서",
      author: "",
      intro: "작성한 내용을 바탕으로 정리한 게임 컨셉 기획서입니다.",
      layout: "slides",
      fontSize: "medium",
      theme: "neutral",
      imageFit: "contain",
      pageMargin: "preset",
      sectionSpacing: "preset",
      headingStyle: "preset",
      titleAlign: "left",
      sectionOrder: SECTION_DEFINITIONS.map((section) => section.key),
    };
  }

  function createSampleConcept() {
    const mazeGame = createEmptyComparisonGame("미로 탈출작");
    const actionGame = createEmptyComparisonGame("액션 어드벤처");

    return {
      intro: {
        name: "루멘 드리프트",
        oneLiner: "빛을 모아 미로를 밝히는 2D 퍼즐 어드벤처",
        coreConcept:
          "플레이어는 어둠 속 미로에서 빛 조각을 수집하고, 그 빛으로 길을 열며 숨겨진 공간을 탐험합니다. 전투보다 ‘공간을 해석하는 재미’가 중심입니다.",
        coreConceptImages: [],
        genre: "퍼즐 어드벤처",
        platform: "PC · 모바일",
        target: "캐주얼·인디 게임을 좋아하는 10~30대",
        references: [
          {
            id: createId("reference"),
            name: "Monument Valley",
            image: "",
          },
          {
            id: createId("reference"),
            name: "Ori and the Blind Forest",
            image: "",
          },
        ],
      },
      features: {
        whySpecial:
          "적과 싸우기보다 빛의 배치와 시야를 조작해 맵을 재구성하는 퍼즐 구조가 핵심입니다. 같은 공간도 빛의 위치에 따라 전혀 다른 경로가 됩니다.",
        whySpecialImage: "",
        differentiationText:
          "일반적인 미로 탈출작·액션 어드벤처와 비교해, 맵 암기나 전투보다 빛 규칙을 발견하고 공간을 다시 디자인하는 플레이를 강조합니다.",
        comparisonGames: [mazeGame, actionGame],
        differentiation: [
          {
            id: createId("compare"),
            aspect: "핵심 플레이",
            values: {
              [mazeGame.id]: "맵 암기와 길찾기 중심",
              [actionGame.id]: "전투·회피 중심의 진행",
            },
            ourGame: "빛 규칙으로 공간을 재구성하는 퍼즐",
          },
          {
            id: createId("compare"),
            aspect: "전투 비중",
            values: {
              [mazeGame.id]: "전투가 거의 없음",
              [actionGame.id]: "전투가 진행의 핵심",
            },
            ourGame: "전투보다 시야·배치 조작이 핵심",
          },
          {
            id: createId("compare"),
            aspect: "학습 방식",
            values: {
              [mazeGame.id]: "맵 구조를 반복 학습",
              [actionGame.id]: "조작·콤보를 길게 설명",
            },
            ourGame: "스테이지마다 규칙 하나를 발견하게 설계",
          },
        ],
        playerExperience:
          "처음엔 막막하지만, 규칙을 깨달은 순간 ‘내가 공간을 통제한다’는 쾌감을 느끼도록 설계했습니다.",
        playerExperienceImage: "",
      },
      gameplay: {
        flow:
          "프롤로그 → 기본 빛 조작 튜토리얼 → 구역별 퍼즐 스테이지 → 보스 룸(규칙 응용) → 엔딩 분기",
        flowImage: "",
        coreSystems:
          "빛 수집, 빛 배치, 시야 확장, 문/다리 해금, 환경 상호작용. 스테이지마다 한 가지 규칙을 추가해 조합합니다.",
        coreSystemsImage: "",
        winLose:
          "스테이지의 출구 포털을 밝히면 클리어. 빛 에너지가 모두 소진되면 실패하며 직전 체크포인트로 돌아갑니다.",
        winLoseImage: "",
        growth:
          "새로운 빛 속성 해금, 시야 반경 확장, 조작 콤보 해금. 메타 진행으로 코스메틱과 스토리 로그를 수집합니다.",
        growthImage: "",
      },
      images: {
        mainScreen: "",
        playScreen: "",
        ui: "",
        artConcept:
          "차분한 남색·청록 배경 위에 따뜻한 노란 빛이 대비되는 톤. 레퍼런스는 Monument Valley의 미니멀 공간감과 Ori의 빛 표현입니다.",
        artColors: [
          createEmptyArtColor("#1B2A4A", "미드나잇 네이비"),
          createEmptyArtColor("#2F6F6A", "청록 안개"),
          createEmptyArtColor("#F2C14E", "루멘 골드"),
          createEmptyArtColor("#F4F1EA", "페이퍼 화이트"),
        ],
      },
      market: {
        targetPlatform: "1차 Steam / 2차 Google Play·iOS",
        targetUsers:
          "짧은 세션으로 퍼즐을 즐기고, 비주얼과 분위기를 중시하는 인디 게임 유저",
        postLaunch:
          "무료 업데이트로 주간 퍼즐·커뮤니티 스테이지를 추가하고, 유저 레벨 공유 기능을 검토합니다.",
      },
      team: {
        teamName: "Studio Lumen",
        members:
          "기획 2명(시스템·레벨) / 아트 1명(2D·UI) / 프로그래밍 2명(클라이언트·툴) — 5인 소규모 팀",
      },
      episode: {
        motivation:
          "복잡한 전투보다 ‘규칙을 발견하는 순간’의 재미를 전달하고 싶어 이 프로젝트를 시작했습니다.",
        trials:
          "초반에는 시스템이 너무 많아 튜토리얼이 길어졌고, 플레이 테스트에서 이탈이 많았습니다.",
        redesign:
          "핵심을 빛 배치 하나로 줄이고, 나머지는 스테이지별 변형으로 옮기면서 학습 곡선이 안정됐습니다.",
        futureGoals:
          "데모 빌드 공개 후 피드백을 반영해 Steam Next Fest 참가를 목표로 합니다.",
      },
    };
  }

  function init() {
    state = loadState();
    syncFormFromState();
    syncImageFitClass();
    renderPreview();
    updatePresetNote();
    prepareImagePasteTargets();
    bindEvents();
    setSaveStatus("자동 저장됐어요", "saved");
  }

  function bindEvents() {
    dom.form.addEventListener("input", handleFormChange);
    dom.form.addEventListener("change", handleFormChange);
    dom.form.addEventListener("click", handleFormClick);
    dom.form.addEventListener("focusin", rememberImagePasteTarget);
    dom.form.addEventListener("pointerdown", rememberImagePasteTarget);
    document.addEventListener("paste", handleImagePaste);

    dom.refreshButton.addEventListener("click", () => {
      renderPreview();
      announcePreviewRefresh();
    });
    dom.resetButton.addEventListener("click", resetAllData);
    dom.sampleButton.addEventListener("click", loadSampleData);
    dom.printButton.addEventListener("click", () => window.print());
    dom.copyAiPromptButton?.addEventListener("click", copyAiSummaryPrompt);
    dom.openGuideButton.addEventListener("click", openGuide);
    dom.closeGuideButton.addEventListener("click", closeGuide);
    dom.guideDialog.addEventListener("click", handleGuideBackdropClick);

    window.addEventListener("beforeunload", saveStateNow);
    window.addEventListener("resize", schedulePreviewPagination);
    bindArtColorDragEvents();
  }

  function bindArtColorDragEvents() {
    if (!dom.artColorItems) return;

    dom.artColorItems.addEventListener("pointerdown", (event) => {
      const item = event.target.closest(".art-color-item");
      if (!item) return;
      item.draggable = Boolean(event.target.closest(".art-color-drag-handle"));
    });

    dom.artColorItems.addEventListener("dragstart", (event) => {
      const item = event.target.closest(".art-color-item");
      if (!item?.draggable) {
        event.preventDefault();
        return;
      }

      artColorDragId = item.dataset.itemId;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", artColorDragId);
      item.classList.add("is-dragging");
    });

    dom.artColorItems.addEventListener("dragover", (event) => {
      const item = event.target.closest(".art-color-item");
      if (!item || !artColorDragId || item.dataset.itemId === artColorDragId) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";

      const rect = item.getBoundingClientRect();
      const placeAfter = event.clientY >= rect.top + rect.height / 2;
      clearArtColorDropIndicators();
      item.classList.add(placeAfter ? "drop-after" : "drop-before");
    });

    dom.artColorItems.addEventListener("dragleave", (event) => {
      const item = event.target.closest(".art-color-item");
      if (!item) return;
      if (item.contains(event.relatedTarget)) return;
      item.classList.remove("drop-before", "drop-after");
    });

    dom.artColorItems.addEventListener("drop", (event) => {
      const target = event.target.closest(".art-color-item");
      const draggedId =
        event.dataTransfer.getData("text/plain") || artColorDragId;
      if (!target || !draggedId) return;

      event.preventDefault();
      const rect = target.getBoundingClientRect();
      const placeAfter = event.clientY >= rect.top + rect.height / 2;
      reorderArtColors(draggedId, target.dataset.itemId, placeAfter);
      clearArtColorDropIndicators();
      artColorDragId = null;
      renderArtColorItems();
      renderPreview();
      scheduleSave();
    });

    dom.artColorItems.addEventListener("dragend", () => {
      clearArtColorDropIndicators();
      artColorDragId = null;
      dom.artColorItems
        .querySelectorAll(".art-color-item.is-dragging")
        .forEach((item) => {
          item.classList.remove("is-dragging");
          item.draggable = false;
        });
    });
  }

  function clearArtColorDropIndicators() {
    dom.artColorItems
      ?.querySelectorAll(".art-color-item.drop-before, .art-color-item.drop-after")
      .forEach((item) => item.classList.remove("drop-before", "drop-after"));
  }

  function reorderArtColors(draggedId, targetId, placeAfter) {
    if (!draggedId || !targetId || draggedId === targetId) return;

    const colors = [...(state.concept.images.artColors || [])];
    const fromIndex = colors.findIndex((item) => item.id === draggedId);
    let toIndex = colors.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = colors.splice(fromIndex, 1);
    toIndex = colors.findIndex((item) => item.id === targetId);
    if (toIndex < 0) {
      colors.push(moved);
    } else {
      colors.splice(placeAfter ? toIndex + 1 : toIndex, 0, moved);
    }

    state.concept.images.artColors = colors;
  }

  function rememberImagePasteTarget(event) {
    const target = resolvePasteImageTarget(event.target);
    if (!target) return;

    lastImagePasteTarget = target;

    const panel = event.target.closest?.(".photo-upload-panel");
    if (
      panel &&
      event.type === "pointerdown" &&
      !event.target.closest("input, textarea, button, label, select, a")
    ) {
      panel.focus({ preventScroll: true });
    }
  }

  function handleImagePaste(event) {
    const imageFile = getClipboardImageFile(event.clipboardData);
    if (!imageFile) return;

    const target =
      resolvePasteImageTarget(event.target) || lastImagePasteTarget;
    if (!target) return;

    const active = document.activeElement;
    if (
      active &&
      active.matches("input:not([type='file']), textarea") &&
      !active.closest(".photo-upload-panel")
    ) {
      return;
    }

    event.preventDefault();

    if (target.kind === "concept") {
      void applyConceptImageFromFile(target.path, imageFile, {
        successMessage: "붙여넣은 이미지를 저장했어요.",
      });
      return;
    }

    if (target.kind === "coreConcept") {
      void applyCoreConceptImageFromFile(target.itemId, imageFile, {
        successMessage: "붙여넣은 이미지를 저장했어요.",
      });
      return;
    }

    if (target.kind === "reference") {
      void applyReferenceImageFromFile(target.itemId, imageFile, {
        successMessage: "붙여넣은 이미지를 저장했어요.",
      });
    }
  }

  function getClipboardImageFile(clipboardData) {
    if (!clipboardData) return null;

    const items = Array.from(clipboardData.items || []);
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) return file;
      }
    }

    return (
      Array.from(clipboardData.files || []).find((file) =>
        file.type.startsWith("image/"),
      ) || null
    );
  }

  function resolvePasteImageTarget(element) {
    const panel = element?.closest?.(".photo-upload-panel");
    if (!panel) return null;

    const conceptField =
      panel.querySelector("input[data-image-field]")?.dataset.imageField ||
      panel.querySelector("[data-image-preview]")?.dataset.imagePreview;
    if (conceptField) return { kind: "concept", path: conceptField };

    const coreConceptId =
      panel.querySelector("input[data-core-concept-image]")?.dataset.itemId ||
      panel.querySelector("[data-core-concept-image-preview]")
        ?.dataset.coreConceptImagePreview;
    if (coreConceptId) return { kind: "coreConcept", itemId: coreConceptId };

    const referenceId =
      panel.querySelector("input[data-reference-image]")?.dataset.itemId ||
      panel.querySelector("[data-reference-image-preview]")
        ?.dataset.referenceImagePreview;
    if (referenceId) return { kind: "reference", itemId: referenceId };

    return null;
  }

  function prepareImagePasteTargets() {
    dom.form.querySelectorAll(".photo-upload-panel").forEach((panel) => {
      panel.tabIndex = 0;
      panel.classList.add("image-paste-target");
      panel.setAttribute(
        "aria-label",
        "이미지 영역. 클릭한 뒤 Ctrl+V 또는 Command+V로 붙여넣을 수 있습니다.",
      );
    });
  }

  function handleFormChange(event) {
    const target = event.target;

    if (target.matches("[data-image-field]") && target.type === "file") {
      handleConceptImageUpload(target);
      return;
    }

    if (target.matches("[data-core-concept-image]") && target.type === "file") {
      handleCoreConceptImageUpload(target);
      return;
    }

    if (target.matches("[data-reference-image]") && target.type === "file") {
      handleReferenceImageUpload(target);
      return;
    }

    if (target.matches("[data-field]")) {
      setPath(state.concept, target.dataset.field, target.value);
      if (target.dataset.field === "intro.name") {
        renderComparisonTable();
      }
    } else if (target.matches("[data-reference-field]")) {
      updateReferenceItem(target);
    } else if (target.matches("[data-art-color-field]")) {
      updateArtColorItem(target);
    } else if (target.matches("[data-comparison-field]")) {
      updateComparisonRow(target);
    } else if (target.matches("[data-comparison-game-name]")) {
      updateComparisonGameName(target);
    } else if (target.matches("[data-template-field]")) {
      state.template[target.dataset.templateField] = target.value;
      updatePresetNote();
      if (target.dataset.templateField === "imageFit") {
        syncImageFitClass();
      }
    } else if (target.matches("[data-template-visibility]")) {
      state.template.visibility[target.dataset.templateVisibility] = target.checked;
      renderSectionOrderControls();
    } else {
      return;
    }

    renderPreview();
    scheduleSave();
  }

  function updateReferenceItem(input) {
    const item = state.concept.intro.references.find(
      (reference) => reference.id === input.dataset.itemId,
    );
    if (!item) return;
    item[input.dataset.referenceField] = input.value;
  }

  function updateArtColorItem(input) {
    if (!Array.isArray(state.concept.images.artColors)) {
      state.concept.images.artColors = [];
    }

    const item = state.concept.images.artColors.find(
      (color) => color.id === input.dataset.itemId,
    );
    if (!item) return;

    const field = input.dataset.artColorField;
    if (field === "name") {
      item.name = input.value;
      return;
    }

    if (field === "hex") {
      item.hex = normalizeHex(input.value);
      const row = input.closest(".art-color-item");
      const picker = row?.querySelector('input[type="color"]');
      const hexInput = row?.querySelector('input[data-art-color-field="hex"]');
      if (picker) picker.value = item.hex;
      if (hexInput) hexInput.value = item.hex;
    }
  }

  function updateComparisonRow(input) {
    const row = state.concept.features.differentiation.find(
      (item) => item.id === input.dataset.itemId,
    );
    if (!row) return;

    const field = input.dataset.comparisonField;
    if (field === "aspect" || field === "ourGame") {
      row[field] = input.value;
      return;
    }

    if (field === "gameValue") {
      if (!row.values || typeof row.values !== "object") row.values = {};
      row.values[input.dataset.gameId] = input.value;
    }
  }

  function updateComparisonGameName(input) {
    const game = state.concept.features.comparisonGames.find(
      (item) => item.id === input.dataset.gameId,
    );
    if (!game) return;
    game.name = input.value;
  }

  function handleFormClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;

    if (action === "add-core-concept-image") {
      ensureCoreConceptImages();
      if (state.concept.intro.coreConceptImages.length >= MAX_CORE_CONCEPT_IMAGES) {
        return;
      }
      state.concept.intro.coreConceptImages.push(createEmptyCoreConceptImage());
      renderCoreConceptImageItems();
      prepareImagePasteTargets();
    }

    if (action === "remove-core-concept-image") {
      ensureCoreConceptImages();
      state.concept.intro.coreConceptImages =
        state.concept.intro.coreConceptImages.filter(
          (item) => item.id !== button.dataset.itemId,
        );
      renderCoreConceptImageItems();
      prepareImagePasteTargets();
    }

    if (action === "remove-core-concept-image-file") {
      const item = (state.concept.intro.coreConceptImages || []).find(
        (entry) => entry.id === button.dataset.itemId,
      );
      if (item) {
        item.image = "";
        renderCoreConceptImagePreview(item.id);
        setCoreConceptImageStatus(item.id, "이미지를 삭제했어요.");
      }
    }

    if (action === "add-reference") {
      state.concept.intro.references.push(createEmptyReference());
      renderReferenceItems();
      focusLatestReferenceItem();
    }

    if (action === "remove-reference") {
      const rows = state.concept.intro.references;
      if (rows.length <= 1) {
        rows[0] = createEmptyReference();
      } else {
        state.concept.intro.references = rows.filter(
          (item) => item.id !== button.dataset.itemId,
        );
      }
      renderReferenceItems();
    }

    if (action === "add-art-color") {
      if (!Array.isArray(state.concept.images.artColors)) {
        state.concept.images.artColors = [];
      }
      state.concept.images.artColors.push(createEmptyArtColor());
      renderArtColorItems();
      focusLatestArtColorItem();
    }

    if (action === "remove-art-color") {
      const rows = state.concept.images.artColors || [];
      state.concept.images.artColors = rows.filter(
        (item) => item.id !== button.dataset.itemId,
      );
      renderArtColorItems();
    }

    if (action === "remove-reference-image") {
      const item = state.concept.intro.references.find(
        (reference) => reference.id === button.dataset.itemId,
      );
      if (item) {
        item.image = "";
        renderReferenceImagePreview(item.id);
        setReferenceImageStatus(item.id, "이미지를 삭제했어요.");
      }
    }

    if (action === "add-comparison") {
      state.concept.features.differentiation.push(createEmptyComparisonRow());
      renderComparisonTable();
      focusLatestComparisonRow();
    }

    if (action === "remove-comparison") {
      const rows = state.concept.features.differentiation;
      if (rows.length <= 1) {
        rows[0] = createEmptyComparisonRow();
      } else {
        state.concept.features.differentiation = rows.filter(
          (item) => item.id !== button.dataset.itemId,
        );
      }
      renderComparisonTable();
    }

    if (action === "add-comparison-game") {
      const nextIndex = state.concept.features.comparisonGames.length + 1;
      const game = createEmptyComparisonGame(`비교 대상 게임 ${nextIndex}`);
      state.concept.features.comparisonGames.push(game);
      syncComparisonRowValues();
      renderComparisonTable();
    }

    if (action === "remove-comparison-game") {
      const games = state.concept.features.comparisonGames;
      if (games.length <= 1) {
        games[0] = createEmptyComparisonGame("비교 대상 게임 1");
      } else {
        state.concept.features.comparisonGames = games.filter(
          (item) => item.id !== button.dataset.gameId,
        );
      }
      syncComparisonRowValues();
      renderComparisonTable();
    }

    if (action === "remove-image") {
      setPath(state.concept, button.dataset.imageField, "");
      const input = dom.form.querySelector(
        `input[type="file"][data-image-field="${button.dataset.imageField}"]`,
      );
      if (input) input.value = "";
      renderImagePreview(button.dataset.imageField);
      setImageStatus(button.dataset.imageField, "이미지를 삭제했어요.");
    }

    if (action === "move-section-up") {
      moveTemplateSection(button.dataset.sectionKey, -1);
    }

    if (action === "move-section-down") {
      moveTemplateSection(button.dataset.sectionKey, 1);
    }

    renderPreview();
    scheduleSave();
  }

  async function handleConceptImageUpload(input) {
    const path = input.dataset.imageField;
    const file = input.files?.[0];
    if (!path || !file) return;

    const saved = await applyConceptImageFromFile(path, file);
    if (!saved) input.value = "";
  }

  async function handleCoreConceptImageUpload(input) {
    const itemId = input.dataset.itemId;
    const file = input.files?.[0];
    if (!itemId || !file) return;

    const saved = await applyCoreConceptImageFromFile(itemId, file);
    if (!saved) input.value = "";
  }

  async function applyCoreConceptImageFromFile(itemId, file, options = {}) {
    ensureCoreConceptImages();
    const item = state.concept.intro.coreConceptImages.find(
      (entry) => entry.id === itemId,
    );
    if (!item) return false;

    if (!file.type.startsWith("image/")) {
      setCoreConceptImageStatus(
        itemId,
        "JPG, PNG, WEBP 이미지를 선택하거나 붙여넣어 주세요.",
        true,
      );
      return false;
    }

    if (file.size > 8 * 1024 * 1024) {
      setCoreConceptImageStatus(itemId, "이미지는 8MB 이하로 넣어 주세요.", true);
      return false;
    }

    setCoreConceptImageStatus(itemId, getImageProcessingMessage());

    try {
      const source = await readFileAsDataUrl(file);
      item.image = await resizeConceptImage(source);
      renderCoreConceptImagePreview(itemId);
      renderPreview();
      scheduleSave();
      setCoreConceptImageStatus(
        itemId,
        options.successMessage || "이미지를 저장했어요.",
      );
      return true;
    } catch (error) {
      console.warn("핵심 컨셉 이미지를 처리하지 못했습니다.", error);
      setCoreConceptImageStatus(
        itemId,
        "이미지를 불러오지 못했어요. 다른 이미지나 파일을 넣어 주세요.",
        true,
      );
      return false;
    }
  }

  async function applyConceptImageFromFile(path, file, options = {}) {
    if (!file.type.startsWith("image/")) {
      setImageStatus(path, "JPG, PNG, WEBP 이미지를 선택하거나 붙여넣어 주세요.", true);
      return false;
    }

    if (file.size > 8 * 1024 * 1024) {
      setImageStatus(path, "이미지는 8MB 이하로 넣어 주세요.", true);
      return false;
    }

    setImageStatus(path, getImageProcessingMessage());

    try {
      const source = await readFileAsDataUrl(file);
      setPath(state.concept, path, await resizeConceptImage(source));
      renderImagePreview(path);
      renderPreview();
      scheduleSave();
      setImageStatus(
        path,
        options.successMessage || "이미지를 저장했어요.",
      );
      return true;
    } catch (error) {
      console.warn("이미지를 처리하지 못했습니다.", error);
      setImageStatus(
        path,
        "이미지를 불러오지 못했어요. 다른 이미지나 파일을 넣어 주세요.",
        true,
      );
      return false;
    }
  }

  async function handleReferenceImageUpload(input) {
    const itemId = input.dataset.itemId;
    const file = input.files?.[0];
    if (!itemId || !file) return;

    const saved = await applyReferenceImageFromFile(itemId, file);
    if (!saved) input.value = "";
  }

  async function applyReferenceImageFromFile(itemId, file, options = {}) {
    const item = state.concept.intro.references.find(
      (reference) => reference.id === itemId,
    );
    if (!item) return false;

    if (!file.type.startsWith("image/")) {
      setReferenceImageStatus(
        itemId,
        "JPG, PNG, WEBP 이미지를 선택하거나 붙여넣어 주세요.",
        true,
      );
      return false;
    }

    if (file.size > 8 * 1024 * 1024) {
      setReferenceImageStatus(itemId, "이미지는 8MB 이하로 넣어 주세요.", true);
      return false;
    }

    setReferenceImageStatus(itemId, getImageProcessingMessage());

    try {
      const source = await readFileAsDataUrl(file);
      item.image = await resizeConceptImage(source);
      renderReferenceImagePreview(itemId);
      renderPreview();
      scheduleSave();
      setReferenceImageStatus(
        itemId,
        options.successMessage || "이미지를 저장했어요.",
      );
      return true;
    } catch (error) {
      console.warn("레퍼런스 이미지를 처리하지 못했습니다.", error);
      setReferenceImageStatus(
        itemId,
        "이미지를 불러오지 못했어요. 다른 이미지나 파일을 넣어 주세요.",
        true,
      );
      return false;
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("파일 읽기 실패"));
      reader.readAsDataURL(file);
    });
  }

  function resizeConceptImage(source) {
    const fit = state.template.imageFit || "contain";
    if (fit === "cover16x9") return resizeImageToCover(source, 1280, 720, 0.86);
    if (fit === "cover1x1") return resizeImageToCover(source, 960, 960, 0.86);
    return resizeImageToFit(source, 1280, 720, 0.86);
  }

  function getImageProcessingMessage() {
    const fit = state.template.imageFit || "contain";
    if (fit === "cover16x9") return "이미지를 16:9로 맞춰 채우고 있어요.";
    if (fit === "cover1x1") return "이미지를 정사각형으로 맞춰 채우고 있어요.";
    return "비율을 유지한 채 이미지 크기를 맞추고 있어요.";
  }

  function resizeImageToFit(source, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("이미지 처리 기능을 사용할 수 없습니다."));
          return;
        }

        const scale = Math.min(
          1,
          maxWidth / image.naturalWidth,
          maxHeight / image.naturalHeight,
        );
        const outputWidth = Math.max(1, Math.round(image.naturalWidth * scale));
        const outputHeight = Math.max(1, Math.round(image.naturalHeight * scale));

        canvas.width = outputWidth;
        canvas.height = outputHeight;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, outputWidth, outputHeight);
        context.drawImage(image, 0, 0, outputWidth, outputHeight);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.onerror = () => reject(new Error("이미지 디코딩 실패"));
      image.src = source;
    });
  }

  function resizeImageToCover(source, outputWidth, outputHeight, quality) {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("이미지 처리 기능을 사용할 수 없습니다."));
          return;
        }

        const targetRatio = outputWidth / outputHeight;
        const sourceRatio = image.naturalWidth / image.naturalHeight;
        let sourceWidth = image.naturalWidth;
        let sourceHeight = image.naturalHeight;
        let sourceX = 0;
        let sourceY = 0;

        if (sourceRatio > targetRatio) {
          sourceWidth = image.naturalHeight * targetRatio;
          sourceX = (image.naturalWidth - sourceWidth) / 2;
        } else {
          sourceHeight = image.naturalWidth / targetRatio;
          sourceY = (image.naturalHeight - sourceHeight) / 2;
        }

        canvas.width = outputWidth;
        canvas.height = outputHeight;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, outputWidth, outputHeight);
        context.drawImage(
          image,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          outputWidth,
          outputHeight,
        );

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.onerror = () => reject(new Error("이미지 디코딩 실패"));
      image.src = source;
    });
  }

  function renderImagePreview(path) {
    const preview = dom.form.querySelector(`[data-image-preview="${path}"]`);
    const removeButton = dom.form.querySelector(
      `button[data-action="remove-image"][data-image-field="${path}"]`,
    );
    const uploadLabel = dom.form.querySelector(`label[for="${getImageInputId(path)}"]`);
    if (!preview) return;

    const imageSource = sanitizeImage(getPath(state.concept, path));
    preview.replaceChildren();

    if (imageSource) {
      const image = document.createElement("img");
      image.src = imageSource;
      image.alt = `${getImageLabel(path)} 미리보기`;
      preview.append(image);
    } else {
      const emptyText = document.createElement("span");
      emptyText.textContent = "이미지 없음";
      preview.append(emptyText);
    }

    if (removeButton) removeButton.disabled = !imageSource;
    if (uploadLabel) {
      uploadLabel.textContent = imageSource ? "이미지 변경" : "이미지 선택";
    }
  }

  function getImageInputId(path) {
    return IMAGE_FIELDS.find((item) => item.path === path)?.inputId || "";
  }

  function getImageLabel(path) {
    return IMAGE_FIELDS.find((item) => item.path === path)?.label || "이미지";
  }

  function setImageStatus(path, message, isError = false) {
    const status = dom.form.querySelector(`[data-image-status="${path}"]`);
    if (!status) return;
    status.textContent = message;
    status.dataset.state = isError ? "error" : "normal";
  }

  function renderAllImagePreviews() {
    IMAGE_FIELDS.forEach((item) => renderImagePreview(item.path));
  }

  function syncFormFromState() {
    dom.form.querySelectorAll("[data-field]").forEach((input) => {
      input.value = getPath(state.concept, input.dataset.field) || "";
    });

    dom.form.querySelectorAll("[data-template-field]").forEach((input) => {
      input.value = state.template[input.dataset.templateField] ?? "";
    });

    dom.form.querySelectorAll("[data-template-visibility]").forEach((input) => {
      input.checked = Boolean(state.template.visibility[input.dataset.templateVisibility]);
    });

    syncImageFitClass();
    renderAllImagePreviews();
    renderCoreConceptImageItems();
    renderReferenceItems();
    renderArtColorItems();
    renderComparisonTable();
    renderSectionOrderControls();
  }

  function renderCoreConceptImageItems() {
    if (!dom.coreConceptImageItems) return;

    ensureCoreConceptImages();
    const items = state.concept.intro.coreConceptImages;
    dom.coreConceptImageItems.replaceChildren(
      ...items.map((item, index) => createCoreConceptImageInputItem(item, index)),
    );

    if (dom.addCoreConceptImageButton) {
      dom.addCoreConceptImageButton.disabled =
        items.length >= MAX_CORE_CONCEPT_IMAGES;
      dom.addCoreConceptImageButton.textContent =
        items.length >= MAX_CORE_CONCEPT_IMAGES
          ? "이미지 3장까지 추가됨"
          : "이미지 추가";
    }

    prepareImagePasteTargets();
  }

  function createCoreConceptImageInputItem(item, index) {
    const wrapper = createElement("article", "repeat-item core-concept-image-item");
    wrapper.dataset.itemId = item.id;

    const header = createElement("div", "repeat-item-header");
    const title = document.createElement("h3");
    title.textContent = `핵심 컨셉 이미지 ${index + 1}`;
    const removeButton = createElement("button", "button button-delete");
    removeButton.type = "button";
    removeButton.dataset.action = "remove-core-concept-image";
    removeButton.dataset.itemId = item.id;
    removeButton.textContent = "삭제";
    header.append(title, removeButton);

    const imagePanel = createElement("div", "photo-upload-panel concept-image-panel");
    const preview = createElement(
      "div",
      "photo-input-preview concept-image-preview",
    );
    preview.dataset.coreConceptImagePreview = item.id;
    const imageSource = sanitizeImage(item.image);
    if (imageSource) {
      const image = document.createElement("img");
      image.src = imageSource;
      image.alt = `핵심 컨셉 이미지 ${index + 1}`;
      preview.append(image);
    } else {
      const emptyText = document.createElement("span");
      emptyText.textContent = "이미지 없음";
      preview.append(emptyText);
    }

    const copy = createElement("div", "photo-upload-copy");
    const strong = document.createElement("strong");
    strong.textContent = "이미지 파일";
    const description = document.createElement("p");
    description.textContent =
      "다이어그램, 키비주얼, 레퍼런스 컷을 넣어 주세요.";
    const actions = createElement("div", "photo-actions");
    const uploadId = `core-concept-image-${item.id}`;
    const uploadLabel = createElement(
      "label",
      "button button-secondary photo-upload-button",
    );
    uploadLabel.htmlFor = uploadId;
    uploadLabel.textContent = imageSource ? "이미지 변경" : "이미지 선택";
    uploadLabel.dataset.coreConceptImageLabel = item.id;

    const fileInput = document.createElement("input");
    fileInput.id = uploadId;
    fileInput.className = "visually-hidden";
    fileInput.type = "file";
    fileInput.accept = "image/png,image/jpeg,image/webp";
    fileInput.dataset.coreConceptImage = "";
    fileInput.dataset.itemId = item.id;

    const removeImageButton = createElement("button", "button button-delete");
    removeImageButton.type = "button";
    removeImageButton.dataset.action = "remove-core-concept-image-file";
    removeImageButton.dataset.itemId = item.id;
    removeImageButton.textContent = "이미지 비우기";
    removeImageButton.disabled = !imageSource;

    const status = createElement("p", "field-help");
    status.dataset.coreConceptImageStatus = item.id;
    status.textContent =
      "JPG, PNG, WEBP / 8MB 이하 · 선택 또는 Ctrl+V 붙여넣기";

    actions.append(uploadLabel, fileInput, removeImageButton);
    copy.append(strong, description, actions, status);
    imagePanel.append(preview, copy);
    wrapper.append(header, imagePanel);
    return wrapper;
  }

  function renderCoreConceptImagePreview(itemId) {
    const item = (state.concept.intro.coreConceptImages || []).find(
      (entry) => entry.id === itemId,
    );
    const preview = dom.coreConceptImageItems?.querySelector(
      `[data-core-concept-image-preview="${itemId}"]`,
    );
    const removeButton = dom.coreConceptImageItems?.querySelector(
      `[data-action="remove-core-concept-image-file"][data-item-id="${itemId}"]`,
    );
    const uploadLabel = dom.coreConceptImageItems?.querySelector(
      `[data-core-concept-image-label="${itemId}"]`,
    );
    if (!item || !preview) return;

    const imageSource = sanitizeImage(item.image);
    preview.replaceChildren();
    if (imageSource) {
      const image = document.createElement("img");
      image.src = imageSource;
      image.alt = "핵심 컨셉 이미지 미리보기";
      preview.append(image);
    } else {
      const emptyText = document.createElement("span");
      emptyText.textContent = "이미지 없음";
      preview.append(emptyText);
    }

    if (removeButton) removeButton.disabled = !imageSource;
    if (uploadLabel) {
      uploadLabel.textContent = imageSource ? "이미지 변경" : "이미지 선택";
    }
  }

  function setCoreConceptImageStatus(itemId, message, isError = false) {
    const status = dom.coreConceptImageItems?.querySelector(
      `[data-core-concept-image-status="${itemId}"]`,
    );
    if (!status) return;
    status.textContent = message;
    status.dataset.state = isError ? "error" : "normal";
  }

  function nonEmptyCoreConceptImages() {
    return (state.concept.intro.coreConceptImages || []).filter((item) =>
      Boolean(sanitizeImage(item?.image)),
    );
  }

  function renderReferenceItems() {
    if (!dom.referenceItems) return;

    const references = state.concept.intro.references || [];
    dom.referenceItems.replaceChildren(
      ...references.map((item, index) => createReferenceInputItem(item, index)),
    );
    prepareImagePasteTargets();
  }

  function createReferenceInputItem(item, index) {
    const wrapper = createElement("article", "repeat-item reference-item");
    wrapper.dataset.itemId = item.id;

    const header = createElement("div", "repeat-item-header");
    const title = document.createElement("h3");
    title.textContent = `레퍼런스 게임 ${index + 1}`;
    const removeButton = createElement("button", "button button-delete");
    removeButton.type = "button";
    removeButton.dataset.action = "remove-reference";
    removeButton.dataset.itemId = item.id;
    removeButton.textContent = "삭제";
    header.append(title, removeButton);

    const nameField = createElement("div", "field");
    const nameLabel = document.createElement("label");
    const nameInputId = `reference-name-${item.id}`;
    nameLabel.htmlFor = nameInputId;
    nameLabel.textContent = "게임 이름";
    const nameInput = document.createElement("input");
    nameInput.id = nameInputId;
    nameInput.type = "text";
    nameInput.value = item.name || "";
    nameInput.placeholder = "예: Monument Valley";
    nameInput.dataset.referenceField = "name";
    nameInput.dataset.itemId = item.id;
    nameField.append(nameLabel, nameInput);

    const imagePanel = createElement("div", "photo-upload-panel concept-image-panel");
    const preview = createElement(
      "div",
      "photo-input-preview concept-image-preview",
    );
    preview.dataset.referenceImagePreview = item.id;
    const imageSource = sanitizeImage(item.image);
    if (imageSource) {
      const image = document.createElement("img");
      image.src = imageSource;
      image.alt = `${clean(item.name) || "레퍼런스 게임"} 이미지`;
      preview.append(image);
    } else {
      const emptyText = document.createElement("span");
      emptyText.textContent = "이미지 없음";
      preview.append(emptyText);
    }

    const copy = createElement("div", "photo-upload-copy");
    const strong = document.createElement("strong");
    strong.textContent = "이미지 (선택)";
    const description = document.createElement("p");
    description.textContent =
      "대표 화면이나 키비주얼이 있으면 넣어 주세요. 없어도 괜찮아요.";
    const actions = createElement("div", "photo-actions");
    const uploadId = `reference-image-${item.id}`;
    const uploadLabel = createElement(
      "label",
      "button button-secondary photo-upload-button",
    );
    uploadLabel.htmlFor = uploadId;
    uploadLabel.textContent = imageSource ? "이미지 변경" : "이미지 선택";
    uploadLabel.dataset.referenceImageLabel = item.id;

    const fileInput = document.createElement("input");
    fileInput.id = uploadId;
    fileInput.className = "visually-hidden";
    fileInput.type = "file";
    fileInput.accept = "image/png,image/jpeg,image/webp";
    fileInput.dataset.referenceImage = "";
    fileInput.dataset.itemId = item.id;

    const removeImageButton = createElement("button", "button button-delete");
    removeImageButton.type = "button";
    removeImageButton.dataset.action = "remove-reference-image";
    removeImageButton.dataset.itemId = item.id;
    removeImageButton.textContent = "이미지 삭제";
    removeImageButton.disabled = !imageSource;

    const status = createElement("p", "field-help");
    status.dataset.referenceImageStatus = item.id;
    status.textContent =
      "JPG, PNG, WEBP / 8MB 이하 · 선택 또는 Ctrl+V 붙여넣기";

    actions.append(uploadLabel, fileInput, removeImageButton);
    copy.append(strong, description, actions, status);
    imagePanel.append(preview, copy);

    wrapper.append(header, nameField, imagePanel);
    return wrapper;
  }

  function renderReferenceImagePreview(itemId) {
    const item = state.concept.intro.references.find(
      (reference) => reference.id === itemId,
    );
    const preview = dom.referenceItems?.querySelector(
      `[data-reference-image-preview="${itemId}"]`,
    );
    const removeButton = dom.referenceItems?.querySelector(
      `[data-action="remove-reference-image"][data-item-id="${itemId}"]`,
    );
    const uploadLabel = dom.referenceItems?.querySelector(
      `[data-reference-image-label="${itemId}"]`,
    );
    if (!item || !preview) return;

    const imageSource = sanitizeImage(item.image);
    preview.replaceChildren();

    if (imageSource) {
      const image = document.createElement("img");
      image.src = imageSource;
      image.alt = `${clean(item.name) || "레퍼런스 게임"} 이미지`;
      preview.append(image);
    } else {
      const emptyText = document.createElement("span");
      emptyText.textContent = "이미지 없음";
      preview.append(emptyText);
    }

    if (removeButton) removeButton.disabled = !imageSource;
    if (uploadLabel) {
      uploadLabel.textContent = imageSource ? "이미지 변경" : "이미지 선택";
    }
  }

  function setReferenceImageStatus(itemId, message, isError = false) {
    const status = dom.referenceItems?.querySelector(
      `[data-reference-image-status="${itemId}"]`,
    );
    if (!status) return;
    status.textContent = message;
    status.dataset.state = isError ? "error" : "normal";
  }

  function focusLatestReferenceItem() {
    requestAnimationFrame(() => {
      const lastInput = dom.referenceItems?.querySelector(
        ".reference-item:last-child input[type='text']",
      );
      lastInput?.focus();
    });
  }

  function renderArtColorItems() {
    if (!dom.artColorItems) return;

    const colors = state.concept.images.artColors || [];
    dom.artColorItems.replaceChildren(
      ...colors.map((item, index) => createArtColorInputItem(item, index)),
    );
  }

  function createArtColorInputItem(item, index) {
    const wrapper = createElement("article", "repeat-item art-color-item");
    wrapper.dataset.itemId = item.id;
    wrapper.draggable = false;

    const header = createElement("div", "repeat-item-header");
    const titleGroup = createElement("div", "art-color-title-group");
    const handle = createElement("button", "art-color-drag-handle");
    handle.type = "button";
    handle.setAttribute("aria-label", `색상 ${index + 1} 순서 변경`);
    handle.title = "드래그해서 순서 변경";
    handle.textContent = "⋮⋮";
    const title = document.createElement("h3");
    title.textContent = `색상 ${index + 1}`;
    titleGroup.append(handle, title);

    const removeButton = createElement("button", "button button-delete");
    removeButton.type = "button";
    removeButton.dataset.action = "remove-art-color";
    removeButton.dataset.itemId = item.id;
    removeButton.textContent = "삭제";
    header.append(titleGroup, removeButton);

    const controls = createElement("div", "art-color-controls");

    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = normalizeHex(item.hex);
    picker.dataset.artColorField = "hex";
    picker.dataset.itemId = item.id;
    picker.setAttribute("aria-label", `색상 ${index + 1} 선택`);

    const hexField = createElement("div", "field art-color-hex-field");
    const hexLabel = document.createElement("label");
    const hexInputId = `art-color-hex-${item.id}`;
    hexLabel.htmlFor = hexInputId;
    hexLabel.textContent = "HEX";
    const hexInput = document.createElement("input");
    hexInput.id = hexInputId;
    hexInput.type = "text";
    hexInput.value = normalizeHex(item.hex);
    hexInput.placeholder = "#808080";
    hexInput.spellcheck = false;
    hexInput.dataset.artColorField = "hex";
    hexInput.dataset.itemId = item.id;
    hexField.append(hexLabel, hexInput);

    const nameField = createElement("div", "field art-color-name-field");
    const nameLabel = document.createElement("label");
    const nameInputId = `art-color-name-${item.id}`;
    nameLabel.htmlFor = nameInputId;
    nameLabel.textContent = "이름 (선택)";
    const nameInput = document.createElement("input");
    nameInput.id = nameInputId;
    nameInput.type = "text";
    nameInput.value = item.name || "";
    nameInput.placeholder = "예: 메인 컬러";
    nameInput.dataset.artColorField = "name";
    nameInput.dataset.itemId = item.id;
    nameField.append(nameLabel, nameInput);

    controls.append(picker, hexField, nameField);
    wrapper.append(header, controls);
    return wrapper;
  }

  function focusLatestArtColorItem() {
    requestAnimationFrame(() => {
      const lastInput = dom.artColorItems?.querySelector(
        ".art-color-item:last-child input[type='color']",
      );
      lastInput?.focus();
    });
  }

  function nonEmptyArtColors() {
    return (state.concept.images.artColors || []).filter((item) =>
      Boolean(normalizeHex(item?.hex)),
    );
  }

  function normalizeHex(value) {
    let hex = clean(value);
    if (!hex) return "#808080";
    if (!hex.startsWith("#")) hex = `#${hex}`;
    if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
      hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return "#808080";
    return hex.toUpperCase();
  }

  function renderComparisonTable() {
    renderComparisonHead();
    renderComparisonRows();
  }

  function getOurGameLabel() {
    return clean(state.concept.intro.name) || "우리 게임";
  }

  function renderComparisonHead() {
    if (!dom.comparisonHead) return;

    const games = state.concept.features.comparisonGames || [];
    const ourGameLabel = getOurGameLabel();
    const tr = document.createElement("tr");

    const aspectTh = document.createElement("th");
    aspectTh.scope = "col";
    aspectTh.textContent = "비교 항목";
    tr.append(aspectTh);

    games.forEach((game, index) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = "comparison-game-col";

      const wrap = createElement("div", "comparison-game-header");
      const input = document.createElement("input");
      input.type = "text";
      input.value = game.name || "";
      input.placeholder = `비교 대상 게임 ${index + 1}`;
      input.dataset.comparisonGameName = "";
      input.dataset.gameId = game.id;
      input.setAttribute("aria-label", `비교 대상 게임 ${index + 1} 이름`);

      const removeButton = createElement("button", "button button-delete");
      removeButton.type = "button";
      removeButton.dataset.action = "remove-comparison-game";
      removeButton.dataset.gameId = game.id;
      removeButton.textContent = "열 삭제";
      removeButton.disabled = games.length <= 1;

      wrap.append(input, removeButton);
      th.append(wrap);
      tr.append(th);
    });

    const ourTh = document.createElement("th");
    ourTh.scope = "col";
    ourTh.textContent = ourGameLabel;
    tr.append(ourTh);

    const actionTh = document.createElement("th");
    actionTh.scope = "col";
    actionTh.className = "comparison-actions-col";
    const hidden = createElement("span", "visually-hidden");
    hidden.textContent = "행 삭제";
    actionTh.append(hidden);
    tr.append(actionTh);

    dom.comparisonHead.replaceChildren(tr);
  }

  function renderComparisonRows() {
    if (!dom.comparisonRows) return;

    const games = state.concept.features.comparisonGames || [];
    const rows = state.concept.features.differentiation || [];

    dom.comparisonRows.replaceChildren(
      ...rows.map((item) => {
        const tr = document.createElement("tr");
        tr.dataset.itemId = item.id;
        tr.append(createComparisonCell(item, "aspect", "예: 핵심 플레이"));

        games.forEach((game) => {
          tr.append(
            createComparisonGameValueCell(
              item,
              game.id,
              `${clean(game.name) || "비교 게임"}의 방식`,
            ),
          );
        });

        tr.append(
          createComparisonCell(
            item,
            "ourGame",
            `예: ${getOurGameLabel()}의 방식`,
          ),
        );

        const actionCell = document.createElement("td");
        actionCell.className = "comparison-actions-col";
        const removeButton = createElement("button", "button button-delete");
        removeButton.type = "button";
        removeButton.dataset.action = "remove-comparison";
        removeButton.dataset.itemId = item.id;
        removeButton.textContent = "삭제";
        actionCell.append(removeButton);
        tr.append(actionCell);

        return tr;
      }),
    );
  }

  function createComparisonCell(item, field, placeholder) {
    const cell = document.createElement("td");
    const input = document.createElement("textarea");
    input.rows = 2;
    input.placeholder = placeholder;
    input.value = item[field] || "";
    input.dataset.comparisonField = field;
    input.dataset.itemId = item.id;
    cell.append(input);
    return cell;
  }

  function createComparisonGameValueCell(item, gameId, placeholder) {
    const cell = document.createElement("td");
    const input = document.createElement("textarea");
    input.rows = 2;
    input.placeholder = placeholder;
    input.value = item.values?.[gameId] || "";
    input.dataset.comparisonField = "gameValue";
    input.dataset.itemId = item.id;
    input.dataset.gameId = gameId;
    cell.append(input);
    return cell;
  }

  function focusLatestComparisonRow() {
    requestAnimationFrame(() => {
      const lastRow = dom.comparisonRows?.querySelector("tr:last-child textarea");
      lastRow?.focus();
    });
  }

  function renderSectionOrderControls() {
    if (!dom.sectionOrderList) return;

    const order = state.template.sectionOrder;
    dom.sectionOrderList.replaceChildren(
      ...order.map((key, index) => {
        const definition = SECTION_DEFINITIONS.find((section) => section.key === key);
        const item = createElement("li", "section-order-item");
        const label = createElement("span", "section-order-label");
        const position = createElement("span", "section-order-position");
        const actions = createElement("span", "section-order-actions");
        const upButton = createElement("button", "section-order-button");
        const downButton = createElement("button", "section-order-button");

        position.textContent = String(index + 1).padStart(2, "0");
        label.textContent = definition?.label || key;

        if (!state.template.visibility[key]) {
          item.classList.add("is-hidden-section");
          const hiddenLabel = createElement("small", "section-order-hidden");
          hiddenLabel.textContent = "문서에서 숨김";
          label.append(hiddenLabel);
        }

        upButton.type = "button";
        upButton.dataset.action = "move-section-up";
        upButton.dataset.sectionKey = key;
        upButton.textContent = "▲";
        upButton.disabled = index === 0;

        downButton.type = "button";
        downButton.dataset.action = "move-section-down";
        downButton.dataset.sectionKey = key;
        downButton.textContent = "▼";
        downButton.disabled = index === order.length - 1;

        actions.append(upButton, downButton);
        item.append(position, label, actions);
        return item;
      }),
    );
  }

  function moveTemplateSection(sectionKey, direction) {
    const order = [...state.template.sectionOrder];
    const index = order.indexOf(sectionKey);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return;
    [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
    state.template.sectionOrder = order;
    renderSectionOrderControls();
  }

  function renderPreview() {
    const previewScroll = capturePreviewScroll();
    dom.preview.replaceChildren();
    dom.preview.className = `preview-pages ${documentTemplateClasses()}`;

    const flowNodes = [createDocumentTopline()];
    let visibleContentCount = 0;
    let sectionNumber = 1;
    const nextSectionNumber = () => String(sectionNumber++).padStart(2, "0");

    const builders = {
      intro: () => createIntroSection(nextSectionNumber()),
      features: () => createFeaturesSection(nextSectionNumber()),
      gameplay: () => createGameplaySection(nextSectionNumber()),
      images: () => createImagesSection(nextSectionNumber()),
      market: () => createMarketSection(nextSectionNumber()),
      team: () => createTeamSection(nextSectionNumber()),
      episode: () => createEpisodeSection(nextSectionNumber()),
    };

    state.template.sectionOrder.forEach((key) => {
      if (!state.template.visibility[key] || !sectionHasContent(key)) return;
      const section = builders[key]?.();
      if (!section) return;
      flowNodes.push(section);
      visibleContentCount += 1;
    });

    if (visibleContentCount === 0) {
      flowNodes.push(createEmptyDocumentMessage());
    }

    if (isSlideLayout()) {
      paginateAsPresentationSlides(flowNodes);
    } else {
      paginateDocument(flowNodes);
    }
    updateCompletionProgress();
    restorePreviewScroll(previewScroll);
  }

  function capturePreviewScroll() {
    if (!dom.previewScroll) return { top: 0, left: 0 };
    return {
      top: dom.previewScroll.scrollTop,
      left: dom.previewScroll.scrollLeft,
    };
  }

  function restorePreviewScroll(scroll) {
    if (!dom.previewScroll || !scroll) return;

    const apply = () => {
      const el = dom.previewScroll;
      const maxTop = Math.max(0, el.scrollHeight - el.clientHeight);
      const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      el.scrollTop = Math.min(scroll.top, maxTop);
      el.scrollLeft = Math.min(scroll.left, maxLeft);
    };

    apply();
    requestAnimationFrame(apply);
  }

  function isSlideLayout() {
    return state.template.layout === "slides";
  }

  function paginateAsPresentationSlides(flowNodes) {
    const context = { pages: [], current: null };

    flowNodes.forEach((node) => {
      if (node.classList?.contains("document-section")) {
        const sourceList = Array.from(node.children).find(
          (child) => !child.classList.contains("document-section-title"),
        );
        const entries = sourceList ? Array.from(sourceList.children) : [];

        if (entries.length === 0) {
          context.current = createDocumentPage(context, context.pages.length + 1);
          context.current.content.append(node);
          return;
        }

        entries.forEach((entry) => {
          context.current = createDocumentPage(context, context.pages.length + 1);
          const shell = createSectionShell(node, false);
          shell.list.append(entry);
          context.current.content.append(shell.section);

          if (pageIsOverflowing(context.current.content)) {
            entry.classList.add("oversized-page-block");
          }
        });
        return;
      }

      context.current = createDocumentPage(context, context.pages.length + 1);
      context.current.content.append(node);
      if (pageIsOverflowing(context.current.content)) {
        node.classList.add("oversized-page-block");
      }
    });

    if (context.pages.length === 0) {
      context.current = createDocumentPage(context, 1);
      context.current.content.append(createEmptyDocumentMessage());
    }

    updatePageNumbers(context.pages);
  }

  function schedulePreviewPagination() {
    window.cancelAnimationFrame(paginationFrame);
    paginationFrame = window.requestAnimationFrame(renderPreview);
  }

  function paginateDocument(flowNodes) {
    const context = { pages: [], current: null };
    context.current = createDocumentPage(context, 1);

    flowNodes.forEach((node) => {
      if (node.classList?.contains("document-section")) {
        paginateSection(context, node);
      } else {
        appendAtomicNode(context, node);
      }
    });

    updatePageNumbers(context.pages);
  }

  function createDocumentPage(context, pageNumber) {
    const page = createElement(
      "article",
      `document-sheet document-page ${documentTemplateClasses()}`,
    );
    const content = createElement("div", "document-page-content");
    const footer = createElement("footer", "document-page-footer");

    page.dataset.pageNumber = String(pageNumber);

    if (pageNumber > 1 && !isSlideLayout()) {
      content.append(createRunningHeader());
    }

    page.append(content, footer);
    dom.preview.append(page);

    const pageState = { page, content, footer };
    context.pages.push(pageState);
    return pageState;
  }

  function createRunningHeader() {
    const header = createElement("header", "document-running-header");
    const title = document.createElement("span");
    const name = document.createElement("span");

    title.textContent = clean(state.template.title) || "게임 컨셉 기획서";
    name.textContent = clean(state.concept.intro.name);
    header.append(title);
    if (name.textContent) header.append(name);
    return header;
  }

  function appendAtomicNode(context, node) {
    const hadContent = pageHasFlowContent(context.current.content);
    context.current.content.append(node);

    if (pageIsOverflowing(context.current.content) && hadContent) {
      node.remove();
      context.current = createDocumentPage(context, context.pages.length + 1);
      context.current.content.append(node);
    }

    if (pageIsOverflowing(context.current.content)) {
      node.classList.add("oversized-page-block");
    }
  }

  function paginateSection(context, sourceSection) {
    const sourceList = Array.from(sourceSection.children).find(
      (child) => !child.classList.contains("document-section-title"),
    );
    const entries = sourceList ? Array.from(sourceList.children) : [];
    let continuation = false;
    let shell = createAndPlaceSectionShell(context, sourceSection, continuation);

    if (entries.length === 0) return;

    entries.forEach((entry) => {
      shell.list.append(entry);

      if (!pageIsOverflowing(context.current.content)) return;

      entry.remove();
      const sectionHasEntries = shell.list.children.length > 0;

      if (!sectionHasEntries) {
        shell.section.remove();
      }

      context.current = createDocumentPage(context, context.pages.length + 1);
      continuation = continuation || sectionHasEntries;
      shell = createAndPlaceSectionShell(context, sourceSection, continuation);
      shell.list.append(entry);

      if (!pageIsOverflowing(context.current.content)) return;

      entry.remove();
      splitEntryAcrossPages(context, sourceSection, shell, entry);
    });
  }

  function createAndPlaceSectionShell(context, sourceSection, continuation) {
    let shell = createSectionShell(sourceSection, continuation);
    const hadContent = pageHasFlowContent(context.current.content);
    context.current.content.append(shell.section);

    if (pageIsOverflowing(context.current.content) && hadContent) {
      shell.section.remove();
      context.current = createDocumentPage(context, context.pages.length + 1);
      shell = createSectionShell(sourceSection, continuation);
      context.current.content.append(shell.section);
    }

    return shell;
  }

  function createSectionShell(sourceSection, continuation) {
    const section = sourceSection.cloneNode(false);
    const sourceTitle = sourceSection.querySelector(".document-section-title");
    const sourceList = Array.from(sourceSection.children).find(
      (child) => !child.classList.contains("document-section-title"),
    );
    const title = sourceTitle.cloneNode(true);
    const list = sourceList
      ? sourceList.cloneNode(false)
      : document.createElement("div");

    if (continuation) {
      const label = title.lastElementChild;
      if (label) label.textContent = `${label.textContent} (계속)`;
      section.classList.add("continued-section");
    }

    section.append(title, list);
    return { section, list };
  }

  function splitEntryAcrossPages(context, sourceSection, shell, entry) {
    const children = Array.from(entry.children);
    let chunk = entry.cloneNode(false);
    let chunkHasContent = false;

    shell.list.append(chunk);

    children.forEach((child) => {
      chunk.append(child);

      if (!pageIsOverflowing(context.current.content)) {
        chunkHasContent = true;
        return;
      }

      child.remove();

      if (!chunkHasContent) {
        chunk.append(child);
        chunk.classList.add("oversized-page-block");
        chunkHasContent = true;
        return;
      }

      context.current = createDocumentPage(context, context.pages.length + 1);
      shell = createAndPlaceSectionShell(context, sourceSection, true);
      chunk = entry.cloneNode(false);
      chunk.classList.add("continued-entry");
      chunk.append(child);
      shell.list.append(chunk);
      chunkHasContent = true;

      if (pageIsOverflowing(context.current.content)) {
        chunk.classList.add("oversized-page-block");
      }
    });
  }

  function pageHasFlowContent(content) {
    return Array.from(content.children).some(
      (child) => !child.classList.contains("document-running-header"),
    );
  }

  function pageIsOverflowing(content) {
    if (!content.clientHeight) return false;
    const contentTop = content.getBoundingClientRect().top;
    const usedHeight = Array.from(content.children).reduce((maximum, child) => {
      const rect = child.getBoundingClientRect();
      const marginBottom =
        Number.parseFloat(window.getComputedStyle(child).marginBottom) || 0;
      return Math.max(maximum, rect.bottom - contentTop + marginBottom);
    }, 0);

    return usedHeight > content.clientHeight - 16;
  }

  function updatePageNumbers(pages) {
    const totalPages = Math.max(1, pages.length);
    const slide = isSlideLayout();

    pages.forEach((pageState, index) => {
      pageState.footer.textContent = `${index + 1} / ${totalPages}`;
      pageState.page.setAttribute(
        "aria-label",
        slide
          ? `발표 슬라이드 ${index + 1}장, 전체 ${totalPages}장`
          : `A4 문서 ${index + 1}쪽, 전체 ${totalPages}쪽`,
      );
    });

    dom.pageCount.textContent = slide
      ? `16:9 · ${totalPages}장`
      : `A4 · ${totalPages}쪽`;
    applyPreviewScale(pages);
  }

  function applyPreviewScale(pages) {
    const firstPage = pages[0]?.page;
    if (!firstPage || !dom.previewScroll?.clientWidth) return;

    const availableWidth = Math.max(320, dom.previewScroll.clientWidth - 14);
    const pageWidth = firstPage.offsetWidth;
    if (!pageWidth) return;

    const scale = Math.min(1, availableWidth / pageWidth);
    dom.preview.style.zoom = String(Math.max(0.55, scale));
  }

  function createDocumentTopline() {
    const header = createElement(
      "header",
      isSlideLayout() ? "document-topline document-title-slide" : "document-topline",
    );
    const copy = createElement("div", "document-topline-copy");
    const type = createElement("p", "document-type");
    const title = createElement("h1", "document-title");
    const author = clean(state.template.author);

    type.textContent = "GAME CONCEPT DOCUMENT";
    title.textContent = clean(state.template.title) || "게임 컨셉 기획서";
    copy.append(type);

    if (author) {
      const authorLine = createElement("p", "document-author");
      authorLine.textContent = `작성 · ${author}`;
      copy.append(authorLine);
    }

    copy.append(title);

    const introText = clean(state.template.intro);
    if (introText) {
      const intro = createElement("p", "document-intro");
      intro.textContent = introText;
      copy.append(intro);
    }

    header.append(copy);
    return header;
  }

  function createIntroSection(sectionNumber) {
    const section = createDocumentSection(sectionNumber, "게임 소개");
    const list = createElement("div", "resume-entry-list");
    const intro = state.concept.intro;

    if (isSlideLayout()) {
      const gameName = clean(intro.name);
      const oneLiner = clean(intro.oneLiner);
      if (gameName || oneLiner) {
        const entry = createElement(
          "article",
          "resume-entry concept-entry slide-combined-entry",
        );
        if (gameName) {
          const nameBlock = createElement("div", "slide-field-block");
          const nameHeading = createElement("h3", "entry-title");
          const nameBody = createElement("p", "entry-description");
          nameHeading.textContent = "게임이름";
          nameBody.textContent = gameName;
          nameBlock.append(nameHeading, nameBody);
          entry.append(nameBlock);
        }
        if (oneLiner) {
          const lineBlock = createElement("div", "slide-field-block");
          const lineHeading = createElement("h3", "entry-title");
          const lineBody = createElement("p", "entry-description");
          lineHeading.textContent = "한 줄 소개";
          lineBody.textContent = oneLiner;
          lineBlock.append(lineHeading, lineBody);
          entry.append(lineBlock);
        }
        list.append(entry);
      }
    } else {
      appendTextEntry(list, "게임이름", intro.name);
      appendTextEntry(list, "한 줄 소개", intro.oneLiner);
    }

    const conceptText = clean(intro.coreConcept);
    const conceptImages = nonEmptyCoreConceptImages();
    if (conceptText || conceptImages.length > 0) {
      const entry = createElement("article", "resume-entry concept-entry");
      const heading = createElement("h3", "entry-title");
      heading.textContent = "게임의 핵심 컨셉";
      entry.append(heading);

      if (conceptText) {
        const body = createElement("p", "entry-description");
        body.textContent = conceptText;
        entry.append(body);
      }

      if (conceptImages.length > 0) {
        const gallery = createElement(
          "div",
          `concept-image-gallery count-${Math.min(3, conceptImages.length)}`,
        );
        conceptImages.forEach((item, index) => {
          const figure = createElement("figure", "concept-document-image");
          const image = document.createElement("img");
          image.src = sanitizeImage(item.image);
          image.alt = `핵심 컨셉 이미지 ${index + 1}`;
          figure.append(image);
          gallery.append(figure);
        });
        entry.append(gallery);
      }

      list.append(entry);
    }

    if (isSlideLayout()) {
      const genre = clean(intro.genre);
      const platform = clean(intro.platform);
      const target = clean(intro.target);
      if (genre || platform || target) {
        const entry = createElement("article", "resume-entry concept-entry slide-meta-entry");
        const heading = createElement("h3", "entry-title");
        heading.textContent = "장르 · 플랫폼 · 타겟";
        entry.append(heading);

        const metaGrid = createElement("div", "slide-meta-grid");
        [
          ["장르", genre],
          ["플랫폼", platform],
          ["타겟", target],
        ].forEach(([label, value]) => {
          if (!value) return;
          const item = createElement("div", "slide-meta-item");
          const labelEl = createElement("p", "slide-meta-label");
          const valueEl = createElement("p", "slide-meta-value");
          labelEl.textContent = label;
          valueEl.textContent = value;
          item.append(labelEl, valueEl);
          metaGrid.append(item);
        });
        entry.append(metaGrid);
        list.append(entry);
      }
    } else {
      appendTextEntry(list, "장르", intro.genre);
      appendTextEntry(list, "플랫폼", intro.platform);
      appendTextEntry(list, "타겟", intro.target);
    }

    const references = nonEmptyReferences();
    if (references.length > 0) {
      if (isSlideLayout()) {
        chunkItems(references, 3).forEach((chunk, index) => {
          const entry = createElement("article", "resume-entry concept-entry");
          const heading = createElement("h3", "entry-title");
          heading.textContent =
            index === 0 ? "레퍼런스 게임" : "레퍼런스 게임 (계속)";
          entry.append(heading);

          const referenceList = createElement(
            "div",
            "reference-document-list slide-reference-grid",
          );
          chunk.forEach((item) => {
            const card = createElement("article", "reference-document-item");
            const nameText = clean(item.name);
            if (nameText) {
              const name = createElement(
                "p",
                "entry-description reference-document-name",
              );
              name.textContent = nameText;
              card.append(name);
            }

            const imageSource = sanitizeImage(item.image);
            if (imageSource) {
              const figure = createElement("figure", "concept-document-image");
              const image = document.createElement("img");
              image.src = imageSource;
              image.alt = `${nameText || "레퍼런스"} 레퍼런스 이미지`;
              figure.append(image);
              card.append(figure);
            }

            referenceList.append(card);
          });

          entry.append(referenceList);
          list.append(entry);
        });
      } else {
        const entry = createElement("article", "resume-entry concept-entry");
        const heading = createElement("h3", "entry-title");
        heading.textContent = "레퍼런스 게임";
        entry.append(heading);

        const referenceList = createElement("div", "reference-document-list");
        references.forEach((item) => {
          const card = createElement("article", "reference-document-item");
          const name = createElement("p", "entry-description reference-document-name");
          name.textContent = clean(item.name);
          card.append(name);

          const imageSource = sanitizeImage(item.image);
          if (imageSource) {
            const figure = createElement("figure", "concept-document-image");
            const image = document.createElement("img");
            image.src = imageSource;
            image.alt = `${clean(item.name)} 레퍼런스 이미지`;
            figure.append(image);
            card.append(figure);
          }

          referenceList.append(card);
        });

        entry.append(referenceList);
        list.append(entry);
      }
    }

    section.append(list);
    return section;
  }

  function chunkItems(items, size) {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }
    return chunks;
  }

  function nonEmptyReferences() {
    return (state.concept.intro.references || []).filter(
      (item) => clean(item.name) || sanitizeImage(item.image),
    );
  }

  function createTextSection(titleText, sectionKey, sectionNumber, fields) {
    const section = createDocumentSection(sectionNumber, titleText);
    const list = createElement("div", "resume-entry-list");
    const data = state.concept[sectionKey];

    fields.forEach(([field, label]) => {
      const value = clean(data?.[field]);
      if (!value) return;

      const entry = createElement("article", "resume-entry concept-entry");
      const heading = createElement("h3", "entry-title");
      const body = createElement("p", "entry-description");
      heading.textContent = label;
      body.textContent = value;
      entry.append(heading, body);
      list.append(entry);
    });

    section.append(list);
    return section;
  }

  function appendSlideFieldBlock(entry, label, value) {
    const text = clean(value);
    if (!text) return;

    const block = createElement("div", "slide-field-block");
    const heading = createElement("h3", "entry-title");
    const body = createElement("p", "entry-description");
    heading.textContent = label;
    body.textContent = text;
    block.append(heading, body);
    entry.append(block);
  }

  function shouldBundleMotivationWithTeam() {
    return isSlideLayout() && Boolean(state.template.visibility.team);
  }

  function createMarketSection(sectionNumber) {
    if (!isSlideLayout()) {
      return createTextSection("시장 진출 계획", "market", sectionNumber, [
        ["targetPlatform", "목표 플랫폼"],
        ["targetUsers", "목표 유저"],
        ["postLaunch", "출시 이후 계획"],
      ]);
    }

    const section = createDocumentSection(sectionNumber, "시장 진출 계획");
    const list = createElement("div", "resume-entry-list");
    const platform = clean(state.concept.market.targetPlatform);
    const users = clean(state.concept.market.targetUsers);
    const postLaunch = clean(state.concept.market.postLaunch);

    if (platform || users || postLaunch) {
      const entry = createElement(
        "article",
        "resume-entry concept-entry slide-combined-entry",
      );
      appendSlideFieldBlock(entry, "목표 플랫폼", platform);
      appendSlideFieldBlock(entry, "목표 유저", users);
      appendSlideFieldBlock(entry, "출시 이후 계획", postLaunch);
      list.append(entry);
    }

    section.append(list);
    return section;
  }

  function createTeamSection(sectionNumber) {
    if (!isSlideLayout()) {
      return createTextSection("팀 소개 및 역할", "team", sectionNumber, [
        ["teamName", "팀명"],
        ["members", "팀인원 설명"],
      ]);
    }

    const section = createDocumentSection(sectionNumber, "팀 소개 및 역할");
    const list = createElement("div", "resume-entry-list");
    const teamName = clean(state.concept.team.teamName);
    const members = clean(state.concept.team.members);
    const motivation = clean(state.concept.episode.motivation);

    if (teamName || members || motivation) {
      const entry = createElement(
        "article",
        "resume-entry concept-entry slide-combined-entry",
      );
      appendSlideFieldBlock(entry, "팀명", teamName);
      appendSlideFieldBlock(entry, "팀인원 설명", members);
      appendSlideFieldBlock(entry, "왜 이 게임을 만들게 되었는지", motivation);
      list.append(entry);
    }

    section.append(list);
    return section;
  }

  function createEpisodeSection(sectionNumber) {
    const fields = [
      ["motivation", "왜 이 게임을 만들게 되었는지"],
      ["trials", "시행착오"],
      ["redesign", "리디자인 과정"],
      ["futureGoals", "앞으로의 목표"],
    ];

    const visibleFields = shouldBundleMotivationWithTeam()
      ? fields.filter(([field]) => field !== "motivation")
      : fields;

    return createTextSection(
      "개발 과정 에피소드",
      "episode",
      sectionNumber,
      visibleFields,
    );
  }

  function createFeaturesSection(sectionNumber) {
    const section = createDocumentSection(sectionNumber, "게임의 특징");
    const list = createElement("div", "resume-entry-list");
    const features = state.concept.features;

    appendTextAndImageEntry(
      list,
      "왜 이 게임이 특별한가",
      features.whySpecial,
      features.whySpecialImage,
    );

    const summary = clean(features.differentiationText);
    const comparisons = nonEmptyComparisons();
    if (summary || comparisons.length > 0) {
      if (isSlideLayout() && summary && comparisons.length > 0) {
        const summaryEntry = createElement("article", "resume-entry concept-entry");
        const summaryHeading = createElement("h3", "entry-title");
        const summaryBody = createElement("p", "entry-description");
        summaryHeading.textContent = "다른 게임과 차별점";
        summaryBody.textContent = summary;
        summaryEntry.append(summaryHeading, summaryBody);
        list.append(summaryEntry);

        const tableEntry = createElement("article", "resume-entry concept-entry");
        const tableHeading = createElement("h3", "entry-title");
        tableHeading.textContent = "비교표";
        tableEntry.append(tableHeading, createComparisonDocumentTable(comparisons));
        list.append(tableEntry);
      } else {
        const entry = createElement("article", "resume-entry concept-entry");
        const heading = createElement("h3", "entry-title");
        heading.textContent = "다른 게임과 차별점";
        entry.append(heading);

        if (summary) {
          const body = createElement("p", "entry-description");
          body.textContent = summary;
          entry.append(body);
        }

        if (comparisons.length > 0) {
          entry.append(createComparisonDocumentTable(comparisons));
        }

        list.append(entry);
      }
    }

    appendTextAndImageEntry(
      list,
      "플레이어가 느끼게 될 경험",
      features.playerExperience,
      features.playerExperienceImage,
    );
    section.append(list);
    return section;
  }

  function createGameplaySection(sectionNumber) {
    const section = createDocumentSection(sectionNumber, "게임 플레이 방식");
    const list = createElement("div", "resume-entry-list");
    const gameplay = state.concept.gameplay;

    appendTextAndImageEntry(list, "게임 진행 흐름", gameplay.flow, gameplay.flowImage);
    appendTextAndImageEntry(
      list,
      "핵심 시스템",
      gameplay.coreSystems,
      gameplay.coreSystemsImage,
    );
    appendTextAndImageEntry(list, "승패 조건", gameplay.winLose, gameplay.winLoseImage);
    appendTextAndImageEntry(list, "성장 요소", gameplay.growth, gameplay.growthImage);

    section.append(list);
    return section;
  }

  function appendTextAndImageEntry(list, label, rawText, rawImage) {
    const text = clean(rawText);
    const imageSource = sanitizeImage(rawImage);
    if (!text && !imageSource) return;

    const entry = createElement("article", "resume-entry concept-entry");
    const heading = createElement("h3", "entry-title");
    heading.textContent = label;
    entry.append(heading);

    if (text) {
      const body = createElement("p", "entry-description");
      body.textContent = text;
      entry.append(body);
    }

    if (imageSource) {
      const figure = createElement("figure", "concept-document-image");
      const image = document.createElement("img");
      image.src = imageSource;
      image.alt = `${label} 이미지`;
      figure.append(image);
      entry.append(figure);
    }

    list.append(entry);
  }

  function appendTextEntry(list, label, rawValue) {
    const value = clean(rawValue);
    if (!value) return;

    const entry = createElement("article", "resume-entry concept-entry");
    const heading = createElement("h3", "entry-title");
    const body = createElement("p", "entry-description");
    heading.textContent = label;
    body.textContent = value;
    entry.append(heading, body);
    list.append(entry);
  }

  function createComparisonDocumentTable(rows) {
    const games = state.concept.features.comparisonGames || [];
    const table = createElement("table", "comparison-document-table");
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    const headers = [
      "비교 항목",
      ...games.map(
        (game, index) => clean(game.name) || `비교 대상 게임 ${index + 1}`,
      ),
      getOurGameLabel(),
    ];

    headers.forEach((label) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = label;
      headRow.append(th);
    });
    thead.append(headRow);

    const tbody = document.createElement("tbody");
    rows.forEach((item) => {
      const tr = document.createElement("tr");
      const cells = [
        item.aspect,
        ...games.map((game) => item.values?.[game.id] || ""),
        item.ourGame,
      ];
      cells.forEach((value) => {
        const td = document.createElement("td");
        td.textContent = clean(value);
        tr.append(td);
      });
      tbody.append(tr);
    });

    table.append(thead, tbody);
    return table;
  }

  function nonEmptyComparisons() {
    const games = state.concept.features.comparisonGames || [];
    return (state.concept.features.differentiation || []).filter((item) => {
      const hasGameValue = games.some((game) =>
        clean(item.values?.[game.id]),
      );
      return clean(item.aspect) || hasGameValue || clean(item.ourGame);
    });
  }

  function createImagesSection(sectionNumber) {
    const section = createDocumentSection(sectionNumber, "게임 이미지");
    const list = createElement("div", "resume-entry-list");
    const images = state.concept.images;

    IMAGE_FIELDS.forEach((item) => {
      const key = item.path.split(".")[1];
      const source = sanitizeImage(images[key]);
      if (!source) return;

      const entry = createElement("article", "resume-entry concept-image-entry");
      const heading = createElement("h3", "entry-title");
      const figure = createElement("figure", "concept-document-image");
      const image = document.createElement("img");

      heading.textContent = item.label;
      image.src = source;
      image.alt = item.label;
      figure.append(image);
      entry.append(heading, figure);
      list.append(entry);
    });

    const artConcept = clean(images.artConcept);
    const artColors = nonEmptyArtColors();
    if (artConcept || artColors.length > 0) {
      const entry = createElement("article", "resume-entry concept-entry");
      const heading = createElement("h3", "entry-title");
      heading.textContent = "아트 컨셉";
      entry.append(heading);

      if (artConcept) {
        const body = createElement("p", "entry-description");
        body.textContent = artConcept;
        entry.append(body);
      }

      if (artColors.length > 0) {
        const paletteLabel = createElement("p", "art-palette-label");
        paletteLabel.textContent = "아트 컬러";
        const palette = createElement("div", "art-palette");
        artColors.forEach((item) => {
          const swatch = createElement("div", "art-palette-swatch");
          const chip = createElement("span", "art-palette-chip");
          chip.style.backgroundColor = normalizeHex(item.hex);
          chip.title = clean(item.name)
            ? `${clean(item.name)} (${normalizeHex(item.hex)})`
            : normalizeHex(item.hex);

          const meta = createElement("span", "art-palette-meta");
          const hexText = createElement("span", "art-palette-hex");
          hexText.textContent = normalizeHex(item.hex);
          meta.append(hexText);
          if (clean(item.name)) {
            const nameText = createElement("span", "art-palette-name");
            nameText.textContent = clean(item.name);
            meta.append(nameText);
          }

          swatch.append(chip, meta);
          palette.append(swatch);
        });
        entry.append(paletteLabel, palette);
      }

      list.append(entry);
    }

    section.append(list);
    return section;
  }

  function createDocumentSection(index, titleText) {
    const section = createElement("section", "document-section");
    const title = createElement("h2", "document-section-title");
    const indexText = createElement("span", "section-index");
    const label = document.createElement("span");

    indexText.textContent = index;
    label.textContent = titleText;
    title.append(indexText, label);
    section.append(title);
    return section;
  }

  function createEmptyDocumentMessage() {
    const wrapper = createElement("div", "empty-document");
    const message = document.createElement("p");
    const title = document.createElement("strong");

    title.textContent = "아직 작성한 내용이 없어요.";
    message.append(
      title,
      document.createTextNode(
        "왼쪽에서 게임 소개부터 작성해 보세요. 입력한 내용은 바로 이곳에 정리됩니다.",
      ),
    );
    wrapper.append(message);
    return wrapper;
  }

  function sectionHasContent(sectionKey) {
    const data = state.concept[sectionKey];
    if (!data) return false;

    if (sectionKey === "team" && shouldBundleMotivationWithTeam()) {
      if (clean(state.concept.episode?.motivation)) return true;
    }

    return SECTION_FIELDS[sectionKey].some((field) => {
      if (
        sectionKey === "episode" &&
        field === "motivation" &&
        shouldBundleMotivationWithTeam()
      ) {
        return false;
      }

      const value = data[field];
      if (sectionKey === "images" && field === "artColors") {
        return nonEmptyArtColors().length > 0;
      }
      if (sectionKey === "images" && field !== "artConcept") {
        return Boolean(sanitizeImage(value));
      }
      if (
        (sectionKey === "intro" ||
          sectionKey === "features" ||
          sectionKey === "gameplay") &&
        String(field).endsWith("Image")
      ) {
        return Boolean(sanitizeImage(value));
      }
      if (sectionKey === "intro" && field === "coreConceptImages") {
        return nonEmptyCoreConceptImages().length > 0;
      }
      if (sectionKey === "intro" && field === "references") {
        return nonEmptyReferences().length > 0;
      }
      if (sectionKey === "features" && field === "differentiation") {
        return nonEmptyComparisons().length > 0;
      }
      if (sectionKey === "features" && field === "differentiationText") {
        return Boolean(clean(value));
      }
      return Boolean(clean(value));
    });
  }

  function updateCompletionProgress() {
    const completedSections = SECTION_DEFINITIONS.filter((section) =>
      sectionHasContent(section.key),
    ).length;

    dom.completionProgress.value = completedSections;
    dom.progressText.textContent = `작성한 항목 ${completedSections} / 7`;
  }

  function updatePresetNote() {
    dom.presetNote.textContent =
      LAYOUT_NOTES[state.template.layout] || LAYOUT_NOTES.standard;
  }

  function syncImageFitClass() {
    document.documentElement.dataset.imageFit =
      state.template.imageFit || "contain";
  }

  function documentTemplateClasses() {
    const classes = [
      `layout-${state.template.layout || "standard"}`,
      `font-${state.template.fontSize || "medium"}`,
      `theme-${state.template.theme || "neutral"}`,
      `image-fit-${state.template.imageFit || "contain"}`,
    ];

    if (state.template.pageMargin && state.template.pageMargin !== "preset") {
      classes.push(`manual-margin-${state.template.pageMargin}`);
    }
    if (
      state.template.sectionSpacing &&
      state.template.sectionSpacing !== "preset"
    ) {
      classes.push(`manual-spacing-${state.template.sectionSpacing}`);
    }
    if (state.template.headingStyle && state.template.headingStyle !== "preset") {
      classes.push(`manual-heading-${state.template.headingStyle}`);
    }
    if (state.template.titleAlign === "center") {
      classes.push("manual-title-center");
    }

    return classes.join(" ");
  }

  function loadState() {
    const defaults = {
      concept: createDefaultConcept(),
      template: createDefaultTemplate(),
    };

    try {
      const rawConcept = parseStoredJson(STORAGE_KEYS.concept);
      const concept = sanitizeConcept(rawConcept, defaults.concept);
      const template = sanitizeTemplate(
        parseStoredJson(STORAGE_KEYS.template),
        defaults.template,
      );

      if (!clean(template.author) && rawConcept?.intro) {
        template.author =
          coerceText(rawConcept.intro.author) ||
          coerceText(rawConcept.intro.teamName);
      }

      return { concept, template };
    } catch (error) {
      console.warn("저장 데이터를 불러오지 못해 기본값을 사용합니다.", error);
      return defaults;
    }
  }

  function parseStoredJson(key) {
    const value = localStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value);
  }

  function sanitizeConcept(source, fallback) {
    if (!source || typeof source !== "object") return fallback;

    return {
      intro: sanitizeIntro(source.intro, fallback.intro),
      features: {
        whySpecial: coerceText(source.features?.whySpecial),
        whySpecialImage: sanitizeImage(source.features?.whySpecialImage),
        differentiationText: sanitizeDifferentiationText(source.features),
        playerExperience: coerceText(source.features?.playerExperience),
        playerExperienceImage: sanitizeImage(
          source.features?.playerExperienceImage,
        ),
        ...sanitizeComparisonBlock(source.features),
      },
      gameplay: sanitizeGameplay(source.gameplay, fallback.gameplay),
      images: {
        ...sanitizeTextObject(source.images, {
          artConcept: fallback.images.artConcept,
        }),
        mainScreen: sanitizeImage(source.images?.mainScreen),
        playScreen: sanitizeImage(source.images?.playScreen),
        ui: sanitizeImage(source.images?.ui),
        artConcept: coerceText(source.images?.artConcept),
        artColors: sanitizeArtColors(source.images?.artColors),
      },
      market: sanitizeTextObject(source.market, fallback.market),
      team: sanitizeTextObject(source.team, fallback.team),
      episode: sanitizeTextObject(source.episode, fallback.episode),
    };
  }

  function sanitizeGameplay(source, fallback) {
    return {
      flow: coerceText(source?.flow),
      flowImage: sanitizeImage(source?.flowImage),
      coreSystems: coerceText(source?.coreSystems),
      coreSystemsImage: sanitizeImage(source?.coreSystemsImage),
      winLose: coerceText(source?.winLose),
      winLoseImage: sanitizeImage(source?.winLoseImage),
      growth: coerceText(source?.growth),
      growthImage: sanitizeImage(source?.growthImage),
    };
  }

  function sanitizeArtColors(source) {
    if (!Array.isArray(source)) return [];

    return source
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        return {
          id: coerceText(item.id) || createId("color"),
          hex: normalizeHex(item.hex),
          name: coerceText(item.name),
        };
      })
      .filter(Boolean);
  }

  function sanitizeIntro(source, fallback) {
    const intro = sanitizeTextObject(source, {
      name: fallback.name,
      oneLiner: fallback.oneLiner,
      coreConcept: fallback.coreConcept,
      genre: fallback.genre,
      platform: fallback.platform,
      target: fallback.target,
    });
    intro.coreConceptImages = sanitizeCoreConceptImages(
      source?.coreConceptImages,
      source?.coreConceptImage,
    );
    intro.references = sanitizeReferences(source?.references);
    if (
      !clean(intro.genre) &&
      !clean(intro.platform) &&
      !clean(intro.target) &&
      source &&
      typeof source === "object"
    ) {
      const legacy = coerceText(source.genrePlatformTarget);
      if (legacy) {
        const parts = legacy.split("/").map((part) => part.trim());
        intro.genre = parts[0] || "";
        intro.platform = parts[1] || "";
        intro.target = parts.slice(2).join(" / ") || "";
      }
    }
    return intro;
  }

  function sanitizeCoreConceptImages(source, legacyImage) {
    const rows = [];

    if (Array.isArray(source)) {
      source.forEach((item) => {
        if (!item || typeof item !== "object") return;
        rows.push({
          id: coerceText(item.id) || createId("core-image"),
          image: sanitizeImage(item.image),
        });
      });
    }

    if (rows.length === 0) {
      const legacy = sanitizeImage(legacyImage);
      if (legacy) {
        rows.push({
          id: createId("core-image"),
          image: legacy,
        });
      }
    }

    return rows.slice(0, MAX_CORE_CONCEPT_IMAGES);
  }

  function sanitizeReferences(source) {
    if (!Array.isArray(source)) return [createEmptyReference()];

    const rows = source
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        return {
          id: coerceText(item.id) || createId("reference"),
          name: coerceText(item.name),
          image: sanitizeImage(item.image),
        };
      })
      .filter(Boolean);

    return rows.length ? rows : [createEmptyReference()];
  }

  function sanitizeDifferentiationText(features) {
    if (!features || typeof features !== "object") return "";
    if (typeof features.differentiationText === "string") {
      return coerceText(features.differentiationText);
    }
    // 예전 버전에서 차별점이 문자열만 있던 경우 본문으로 이전
    if (
      typeof features.differentiation === "string" &&
      clean(features.differentiation)
    ) {
      return coerceText(features.differentiation);
    }
    return "";
  }

  function sanitizeComparisonBlock(features) {
    const legacyRows = Array.isArray(features?.differentiation)
      ? features.differentiation
      : [];
    const hasLegacyOtherGame = legacyRows.some(
      (item) => item && typeof item === "object" && "otherGame" in item,
    );

    let comparisonGames = sanitizeComparisonGames(features?.comparisonGames);
    if (
      (!features?.comparisonGames || !Array.isArray(features.comparisonGames)) &&
      hasLegacyOtherGame
    ) {
      comparisonGames = [createEmptyComparisonGame("비교 대상 게임 1")];
    }

    const gameIds = comparisonGames.map((game) => game.id);
    const differentiation = sanitizeComparisons(
      features?.differentiation,
      gameIds,
    );

    return { comparisonGames, differentiation };
  }

  function sanitizeComparisonGames(source) {
    if (!Array.isArray(source) || source.length === 0) {
      return [createEmptyComparisonGame("비교 대상 게임 1")];
    }

    return source
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        return {
          id: coerceText(item.id) || createId("game"),
          name: coerceText(item.name) || `비교 대상 게임 ${index + 1}`,
        };
      })
      .filter(Boolean);
  }

  function sanitizeComparisons(source, gameIds) {
    const ids =
      Array.isArray(gameIds) && gameIds.length
        ? gameIds
        : [createId("game")];

    if (typeof source === "string") {
      return [createEmptyComparisonRow(ids)];
    }

    if (!Array.isArray(source)) return [createEmptyComparisonRow(ids)];

    const rows = source
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const values = {};
        ids.forEach((gameId, index) => {
          if (item.values && typeof item.values === "object") {
            values[gameId] = coerceText(item.values[gameId]);
          } else if (index === 0) {
            values[gameId] = coerceText(item.otherGame);
          } else {
            values[gameId] = "";
          }
        });

        return {
          id: coerceText(item.id) || createId("compare"),
          aspect: coerceText(item.aspect),
          values,
          ourGame: coerceText(item.ourGame),
        };
      })
      .filter(Boolean);

    return rows.length ? rows : [createEmptyComparisonRow(ids)];
  }

  function sanitizeTemplate(source, fallback) {
    if (!source || typeof source !== "object") return fallback;

    const validLayouts = [
      "slides",
      "standard",
      "compact",
      "review",
      "timeline",
      "portfolio",
    ];
    const validFontSizes = ["small", "medium", "large"];
    const validThemes = ["neutral", "graphite"];
    const validImageFits = ["contain", "cover16x9", "cover1x1"];
    const validPageMargins = ["preset", "narrow", "normal", "wide"];
    const validSectionSpacings = ["preset", "tight", "normal", "relaxed"];
    const validHeadingStyles = ["preset", "line", "numbered", "minimal"];
    const validTitleAlignments = ["left", "center"];

    const visibility = {};
    SECTION_DEFINITIONS.forEach((section) => {
      visibility[section.key] = readBoolean(
        source.visibility?.[section.key],
        fallback.visibility[section.key],
      );
    });

    return {
      visibility,
      title: coerceText(source.title) || fallback.title,
      author: coerceText(source.author) || fallback.author,
      intro: coerceText(source.intro) || fallback.intro,
      layout: validLayouts.includes(source.layout)
        ? source.layout
        : fallback.layout,
      fontSize: validFontSizes.includes(source.fontSize)
        ? source.fontSize
        : fallback.fontSize,
      theme: validThemes.includes(source.theme)
        ? source.theme
        : fallback.theme,
      imageFit: validImageFits.includes(source.imageFit)
        ? source.imageFit
        : fallback.imageFit,
      pageMargin: validPageMargins.includes(source.pageMargin)
        ? source.pageMargin
        : fallback.pageMargin,
      sectionSpacing: validSectionSpacings.includes(source.sectionSpacing)
        ? source.sectionSpacing
        : fallback.sectionSpacing,
      headingStyle: validHeadingStyles.includes(source.headingStyle)
        ? source.headingStyle
        : fallback.headingStyle,
      titleAlign: validTitleAlignments.includes(source.titleAlign)
        ? source.titleAlign
        : fallback.titleAlign,
      sectionOrder: sanitizeSectionOrder(source.sectionOrder),
    };
  }

  function sanitizeSectionOrder(source) {
    const validKeys = SECTION_DEFINITIONS.map((section) => section.key);
    const savedOrder = Array.isArray(source)
      ? source.filter((key) => validKeys.includes(key))
      : [];
    return [...new Set([...savedOrder, ...validKeys])];
  }

  function sanitizeTextObject(source, fallback) {
    const base = fallback && typeof fallback === "object" ? fallback : {};
    const keys = Object.keys(base);
    if (!source || typeof source !== "object") {
      return Object.fromEntries(keys.map((key) => [key, ""]));
    }
    return Object.fromEntries(keys.map((key) => [key, coerceText(source[key])]));
  }

  function readBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
  }

  function coerceText(value) {
    return typeof value === "string" ? value : "";
  }

  function sanitizeImage(value) {
    const text = coerceText(value);
    return /^data:image\/(?:jpeg|png|webp);base64,/i.test(text) ? text : "";
  }

  function scheduleSave() {
    window.clearTimeout(saveTimer);
    setSaveStatus("저장 중이에요…", "saving");
    saveTimer = window.setTimeout(saveStateNow, 350);
  }

  function saveStateNow() {
    window.clearTimeout(saveTimer);

    try {
      localStorage.setItem(STORAGE_KEYS.concept, JSON.stringify(state.concept));
      localStorage.setItem(STORAGE_KEYS.template, JSON.stringify(state.template));
      setSaveStatus("자동 저장됐어요", "saved");
    } catch (error) {
      console.warn("자동 저장에 실패했습니다.", error);
      setSaveStatus("저장하지 못했어요", "error");
    }
  }

  function setSaveStatus(message, status) {
    dom.saveStatus.textContent = message;
    dom.saveStatus.dataset.state = status;
  }

  function resetAllData() {
    const confirmed = window.confirm(
      "지금까지 작성한 내용과 문서 설정을 모두 지울까요? 삭제한 내용은 다시 되돌릴 수 없어요.",
    );
    if (!confirmed) return;

    state = {
      concept: createDefaultConcept(),
      template: createDefaultTemplate(),
    };
    syncFormFromState();
    renderPreview();
    updatePresetNote();
    IMAGE_FIELDS.forEach((item) => {
      const input = dom.form.querySelector(
        `input[type="file"][data-image-field="${item.path}"]`,
      );
      if (input) input.value = "";
      setImageStatus(item.path, "JPG, PNG, WEBP / 8MB 이하 권장");
    });
    saveStateNow();
  }

  function loadSampleData() {
    if (
      hasAnyConceptInput() &&
      !window.confirm("지금 작성한 내용을 지우고 예시 내용으로 채워볼까요?")
    ) {
      return;
    }

    state.concept = createSampleConcept();
    state.template.author = "Studio Lumen";
    syncFormFromState();
    renderPreview();
    IMAGE_FIELDS.forEach((item) => {
      const input = dom.form.querySelector(
        `input[type="file"][data-image-field="${item.path}"]`,
      );
      if (input) input.value = "";
      setImageStatus(
        item.path,
        "예시에는 이미지가 없어요. 필요하면 직접 추가해 주세요.",
      );
    });
    saveStateNow();
  }

  function hasAnyConceptInput() {
    return SECTION_DEFINITIONS.some((section) => sectionHasContent(section.key));
  }

  function announcePreviewRefresh() {
    const original = dom.refreshButton.textContent;
    dom.refreshButton.textContent = "문서에 반영됐어요";
    window.setTimeout(() => {
      dom.refreshButton.textContent = original;
    }, 1200);
  }

  function openGuide() {
    if (typeof dom.guideDialog.showModal === "function") {
      dom.guideDialog.showModal();
    }
  }

  function closeGuide() {
    if (typeof dom.guideDialog.close === "function") {
      dom.guideDialog.close();
    }
  }

  function handleGuideBackdropClick(event) {
    if (event.target === dom.guideDialog) closeGuide();
  }

  async function copyAiSummaryPrompt() {
    const prompt = buildAiSummaryPrompt();
    if (!prompt) {
      setSaveStatus("요약할 내용이 아직 없어요.", "error");
      return;
    }

    try {
      await writeTextToClipboard(prompt);
      announceAiPromptCopied();
      setSaveStatus("AI 요약 프롬프트를 복사했어요.", "saved");
    } catch (error) {
      console.warn("프롬프트 복사에 실패했습니다.", error);
      setSaveStatus("복사하지 못했어요. 브라우저 권한을 확인해 주세요.", "error");
    }
  }

  function buildAiSummaryPrompt() {
    const sections = [];
    const docTitle = clean(state.template.title) || "게임 컨셉 기획서";
    const author = clean(state.template.author);
    const docIntro = clean(state.template.intro);

    sections.push("## 문서 정보");
    sections.push(`- 문서 제목: ${docTitle}`);
    if (author) sections.push(`- 작성자: ${author}`);
    if (docIntro) sections.push(`- 문서 소개: ${docIntro}`);

    const introLines = [];
    appendPromptField(introLines, "intro.name");
    appendPromptField(introLines, "intro.oneLiner");
    appendPromptField(introLines, "intro.coreConcept");
    const coreConceptImageCount = nonEmptyCoreConceptImages().length;
    if (coreConceptImageCount > 0) {
      introLines.push(`- 핵심 컨셉 이미지: ${coreConceptImageCount}장`);
    }
    appendPromptField(introLines, "intro.genre");
    appendPromptField(introLines, "intro.platform");
    appendPromptField(introLines, "intro.target");
    const references = nonEmptyReferences()
      .map((item) => clean(item.name))
      .filter(Boolean);
    if (references.length) {
      introLines.push(`- 레퍼런스 게임: ${references.join(", ")}`);
    }
    if (introLines.length) {
      sections.push("", "## 게임 소개", ...introLines);
    }

    const featureLines = [];
    appendPromptField(featureLines, "features.whySpecial");
    appendPromptField(featureLines, "features.differentiationText");
    const comparisons = nonEmptyComparisons();
    if (comparisons.length) {
      const games = state.concept.features.comparisonGames || [];
      featureLines.push("- 비교표:");
      comparisons.forEach((row) => {
        const aspect = clean(row.aspect) || "비교 항목";
        const otherValues = games
          .map((game) => {
            const name = clean(game.name) || "비교 대상";
            const value = clean(row.values?.[game.id]);
            return value ? `${name}=${value}` : null;
          })
          .filter(Boolean);
        const ourGame = clean(row.ourGame);
        const parts = [...otherValues];
        if (ourGame) parts.push(`${getOurGameLabel()}=${ourGame}`);
        featureLines.push(
          parts.length
            ? `  - ${aspect}: ${parts.join(" / ")}`
            : `  - ${aspect}`,
        );
      });
    }
    appendPromptField(featureLines, "features.playerExperience");
    if (featureLines.length) {
      sections.push("", "## 게임의 특징", ...featureLines);
    }

    const gameplayLines = [];
    appendPromptField(gameplayLines, "gameplay.flow");
    appendPromptField(gameplayLines, "gameplay.coreSystems");
    appendPromptField(gameplayLines, "gameplay.winLose");
    appendPromptField(gameplayLines, "gameplay.growth");
    if (gameplayLines.length) {
      sections.push("", "## 게임 플레이 방식", ...gameplayLines);
    }

    const imageNotes = [];
    IMAGE_FIELDS.forEach((item) => {
      if (sanitizeImage(getPath(state.concept, item.path))) {
        imageNotes.push(`- ${item.label}: 있음`);
      }
    });
    appendPromptField(imageNotes, "images.artConcept");
    const artColors = nonEmptyArtColors();
    if (artColors.length) {
      imageNotes.push(
        `- 아트 컬러: ${artColors
          .map((item) => {
            const hex = normalizeHex(item.hex);
            const name = clean(item.name);
            return name ? `${name}(${hex})` : hex;
          })
          .join(", ")}`,
      );
    }
    if (imageNotes.length) {
      sections.push("", "## 게임 이미지 / 아트", ...imageNotes);
    }

    const marketLines = [];
    appendPromptField(marketLines, "market.targetPlatform");
    appendPromptField(marketLines, "market.targetUsers");
    appendPromptField(marketLines, "market.postLaunch");
    if (marketLines.length) {
      sections.push("", "## 시장 진출 계획", ...marketLines);
    }

    const teamLines = [];
    appendPromptField(teamLines, "team.teamName");
    appendPromptField(teamLines, "team.members");
    if (teamLines.length) {
      sections.push("", "## 팀 소개 및 역할", ...teamLines);
    }

    const episodeLines = [];
    appendPromptField(episodeLines, "episode.motivation");
    appendPromptField(episodeLines, "episode.trials");
    appendPromptField(episodeLines, "episode.redesign");
    appendPromptField(episodeLines, "episode.futureGoals");
    if (episodeLines.length) {
      sections.push("", "## 개발 과정 에피소드", ...episodeLines);
    }

    const hasBody = sections.some(
      (line) => line.startsWith("## ") && line !== "## 문서 정보",
    );
    if (!hasBody) return "";

    return [
      "당신은 게임 기획 문서 작성 도우미입니다.",
      "아래 게임 컨셉 기획서 내용을 바탕으로, 발표·공유용 1페이지 요약을 작성해 주세요.",
      "",
      "## 작성 요구사항",
      "- 한국어로 작성할 것",
      "- 한 장에 들어갈 짧은 분량으로 작성할 것",
      "- 구성: 게임명과 한 줄 소개, 장르·플랫폼·타겟, 핵심 컨셉, 차별점, 플레이 핵심, 팀/작성 정보",
      "- 없는 내용은 지어내지 말 것",
      "- 불릿 중심으로 읽기 쉽게 정리할 것",
      "- 필요하면 제목과 부제만 짧게 제안할 것",
      "",
      ...sections,
    ].join("\n");
  }

  function appendPromptField(lines, path) {
    const value = clean(getPath(state.concept, path));
    if (!value) return;
    const label = FIELD_LABELS[path] || path;
    lines.push(`- ${label}: ${value}`);
  }

  async function writeTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("clipboard copy failed");
  }

  function announceAiPromptCopied() {
    if (!dom.copyAiPromptButton) return;
    const original = dom.copyAiPromptButton.textContent;
    dom.copyAiPromptButton.textContent = "프롬프트 복사됨";
    window.setTimeout(() => {
      dom.copyAiPromptButton.textContent = original;
    }, 1600);
  }

  function getPath(object, path) {
    return path.split(".").reduce((current, key) => current?.[key], object);
  }

  function setPath(object, path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== "object") current[key] = {};
      return current[key];
    }, object);
    target[last] = value;
  }

  function clean(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function createElement(tagName, className = "") {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    return element;
  }

  init();
})();
