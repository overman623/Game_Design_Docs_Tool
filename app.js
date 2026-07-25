(() => {
  "use strict";

  const STORAGE_KEYS = {
    concept: "gameConceptBuilder.conceptData.v1",
    template: "gameConceptBuilder.templateSettings.v1",
  };

  const LAYOUT_NOTES = {
    standard: "기본형: 발표와 공유에 무난하게 쓸 수 있는 구성입니다.",
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

  const IMAGE_FIELDS = [
    { path: "images.mainScreen", label: "메인 화면" },
    { path: "images.playScreen", label: "플레이 화면" },
    { path: "images.ui", label: "UI" },
  ];

  const SECTION_FIELDS = {
    intro: ["name", "oneLiner", "coreConcept", "genrePlatformTarget"],
    features: ["whySpecial", "differentiation", "playerExperience"],
    gameplay: ["flow", "coreSystems", "winLose", "growth"],
    images: ["mainScreen", "playScreen", "ui", "artConcept"],
    market: ["targetPlatform", "targetUsers", "postLaunch"],
    team: ["teamName", "members"],
    episode: ["motivation", "trials", "redesign", "futureGoals"],
  };

  const FIELD_LABELS = {
    "intro.name": "게임이름",
    "intro.oneLiner": "한 줄 소개",
    "intro.coreConcept": "게임의 핵심 컨셉",
    "intro.genrePlatformTarget": "장르 / 플랫폼 / 타겟",
    "features.whySpecial": "왜 이 게임이 특별한가",
    "features.differentiation": "다른 게임과 차별점",
    "features.playerExperience": "플레이어가 느끼게 될 경험",
    "gameplay.flow": "게임 진행 흐름",
    "gameplay.coreSystems": "핵심 시스템",
    "gameplay.winLose": "승패 조건",
    "gameplay.growth": "성장 요소",
    "images.artConcept": "아트 컨셉",
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
    openGuideButton: document.querySelector("#open-guide"),
    closeGuideButton: document.querySelector("#close-guide"),
    guideDialog: document.querySelector("#guide-dialog"),
  };

  let state = {
    concept: createDefaultConcept(),
    template: createDefaultTemplate(),
  };
  let saveTimer = null;
  let paginationFrame = null;

  function createDefaultConcept() {
    return {
      intro: {
        name: "",
        oneLiner: "",
        coreConcept: "",
        genrePlatformTarget: "",
      },
      features: {
        whySpecial: "",
        differentiation: "",
        playerExperience: "",
      },
      gameplay: {
        flow: "",
        coreSystems: "",
        winLose: "",
        growth: "",
      },
      images: {
        mainScreen: "",
        playScreen: "",
        ui: "",
        artConcept: "",
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
      intro: "작성한 내용을 바탕으로 정리한 게임 컨셉 기획서입니다.",
      layout: "standard",
      fontSize: "medium",
      pageMargin: "preset",
      sectionSpacing: "preset",
      headingStyle: "preset",
      titleAlign: "left",
      sectionOrder: SECTION_DEFINITIONS.map((section) => section.key),
    };
  }

  function createSampleConcept() {
    return {
      intro: {
        name: "루멘 드리프트",
        oneLiner: "빛을 모아 미로를 밝히는 2D 퍼즐 어드벤처",
        coreConcept:
          "플레이어는 어둠 속 미로에서 빛 조각을 수집하고, 그 빛으로 길을 열며 숨겨진 공간을 탐험합니다. 전투보다 ‘공간을 해석하는 재미’가 중심입니다.",
        genrePlatformTarget:
          "퍼즐 어드벤처 / PC·모바일 / 캐주얼·인디 게임을 좋아하는 10~30대",
      },
      features: {
        whySpecial:
          "적과 싸우기보다 빛의 배치와 시야를 조작해 맵을 재구성하는 퍼즐 구조가 핵심입니다. 같은 공간도 빛의 위치에 따라 전혀 다른 경로가 됩니다.",
        differentiation:
          "일반적인 미로 탈출작과 달리, 맵을 외우는 것이 아니라 빛 규칙을 이해해 공간을 다시 디자인하는 플레이를 강조합니다.",
        playerExperience:
          "처음엔 막막하지만, 규칙을 깨달은 순간 ‘내가 공간을 통제한다’는 쾌감을 느끼도록 설계했습니다.",
      },
      gameplay: {
        flow:
          "프롤로그 → 기본 빛 조작 튜토리얼 → 구역별 퍼즐 스테이지 → 보스 룸(규칙 응용) → 엔딩 분기",
        coreSystems:
          "빛 수집, 빛 배치, 시야 확장, 문/다리 해금, 환경 상호작용. 스테이지마다 한 가지 규칙을 추가해 조합합니다.",
        winLose:
          "스테이지의 출구 포털을 밝히면 클리어. 빛 에너지가 모두 소진되면 실패하며 직전 체크포인트로 돌아갑니다.",
        growth:
          "새로운 빛 속성 해금, 시야 반경 확장, 조작 콤보 해금. 메타 진행으로 코스메틱과 스토리 로그를 수집합니다.",
      },
      images: {
        mainScreen: "",
        playScreen: "",
        ui: "",
        artConcept:
          "차분한 남색·청록 배경 위에 따뜻한 노란 빛이 대비되는 톤. 레퍼런스는 Monument Valley의 미니멀 공간감과 Ori의 빛 표현입니다.",
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
    renderPreview();
    updatePresetNote();
    bindEvents();
    setSaveStatus("자동 저장됐어요", "saved");
  }

  function bindEvents() {
    dom.form.addEventListener("input", handleFormChange);
    dom.form.addEventListener("change", handleFormChange);
    dom.form.addEventListener("click", handleFormClick);

    dom.refreshButton.addEventListener("click", () => {
      renderPreview();
      announcePreviewRefresh();
    });
    dom.resetButton.addEventListener("click", resetAllData);
    dom.sampleButton.addEventListener("click", loadSampleData);
    dom.printButton.addEventListener("click", () => window.print());
    dom.openGuideButton.addEventListener("click", openGuide);
    dom.closeGuideButton.addEventListener("click", closeGuide);
    dom.guideDialog.addEventListener("click", handleGuideBackdropClick);

    window.addEventListener("beforeunload", saveStateNow);
    window.addEventListener("resize", schedulePreviewPagination);
  }

  function handleFormChange(event) {
    const target = event.target;

    if (target.matches("[data-image-field]") && target.type === "file") {
      handleConceptImageUpload(target);
      return;
    }

    if (target.matches("[data-field]")) {
      setPath(state.concept, target.dataset.field, target.value);
    } else if (target.matches("[data-template-field]")) {
      state.template[target.dataset.templateField] = target.value;
      updatePresetNote();
    } else if (target.matches("[data-template-visibility]")) {
      state.template.visibility[target.dataset.templateVisibility] = target.checked;
      renderSectionOrderControls();
    } else {
      return;
    }

    renderPreview();
    scheduleSave();
  }

  function handleFormClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;

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

    if (!file.type.startsWith("image/")) {
      input.value = "";
      setImageStatus(path, "JPG, PNG, WEBP 이미지 파일을 선택해 주세요.", true);
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      input.value = "";
      setImageStatus(path, "이미지는 8MB 이하 파일로 선택해 주세요.", true);
      return;
    }

    setImageStatus(path, "이미지를 16:9 비율로 정리하고 있어요.");

    try {
      const source = await readFileAsDataUrl(file);
      setPath(state.concept, path, await resizeConceptImage(source));
      renderImagePreview(path);
      renderPreview();
      scheduleSave();
      setImageStatus(path, "이미지를 저장했어요.");
    } catch (error) {
      console.warn("이미지를 처리하지 못했습니다.", error);
      input.value = "";
      setImageStatus(path, "이미지를 불러오지 못했어요. 다른 파일을 선택해 주세요.", true);
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
    return resizeImageToRatio(source, 960, 540, 0.82);
  }

  function resizeImageToRatio(source, outputWidth, outputHeight, quality) {
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
    if (path === "images.mainScreen") return "image-main-screen";
    if (path === "images.playScreen") return "image-play-screen";
    if (path === "images.ui") return "image-ui";
    return "";
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

    renderAllImagePreviews();
    renderSectionOrderControls();
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
    dom.preview.replaceChildren();
    dom.preview.className = `preview-pages ${documentTemplateClasses()}`;

    const flowNodes = [createDocumentTopline()];
    let visibleContentCount = 0;
    let sectionNumber = 1;
    const nextSectionNumber = () => String(sectionNumber++).padStart(2, "0");

    const builders = {
      intro: () =>
        createTextSection("게임 소개", "intro", nextSectionNumber(), [
          ["coreConcept", "게임의 핵심 컨셉"],
          ["genrePlatformTarget", "장르 / 플랫폼 / 타겟"],
        ]),
      features: () =>
        createTextSection("게임의 특징", "features", nextSectionNumber(), [
          ["whySpecial", "왜 이 게임이 특별한가"],
          ["differentiation", "다른 게임과 차별점"],
          ["playerExperience", "플레이어가 느끼게 될 경험"],
        ]),
      gameplay: () =>
        createTextSection("게임 플레이 방식", "gameplay", nextSectionNumber(), [
          ["flow", "게임 진행 흐름"],
          ["coreSystems", "핵심 시스템"],
          ["winLose", "승패 조건"],
          ["growth", "성장 요소"],
        ]),
      images: () => createImagesSection(nextSectionNumber()),
      market: () =>
        createTextSection("시장 진출 계획", "market", nextSectionNumber(), [
          ["targetPlatform", "목표 플랫폼"],
          ["targetUsers", "목표 유저"],
          ["postLaunch", "출시 이후 계획"],
        ]),
      team: () =>
        createTextSection("팀 소개 및 역할", "team", nextSectionNumber(), [
          ["teamName", "팀명"],
          ["members", "팀인원 설명"],
        ]),
      episode: () =>
        createTextSection("개발 과정 에피소드", "episode", nextSectionNumber(), [
          ["motivation", "왜 이 게임을 만들게 되었는지"],
          ["trials", "시행착오"],
          ["redesign", "리디자인 과정"],
          ["futureGoals", "앞으로의 목표"],
        ]),
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

    paginateDocument(flowNodes);
    updateCompletionProgress();
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

    if (pageNumber > 1) {
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

    pages.forEach((pageState, index) => {
      pageState.footer.textContent = `${index + 1} / ${totalPages}`;
      pageState.page.setAttribute(
        "aria-label",
        `A4 문서 ${index + 1}쪽, 전체 ${totalPages}쪽`,
      );
    });

    dom.pageCount.textContent = `A4 · ${totalPages}쪽`;
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
    const header = createElement("header", "document-topline");
    const copy = createElement("div", "document-topline-copy");
    const type = createElement("p", "document-type");
    const title = createElement("h1", "document-title");

    type.textContent = "GAME CONCEPT DOCUMENT";
    title.textContent = clean(state.template.title) || "게임 컨셉 기획서";
    copy.append(type, title);

    const introText = clean(state.template.intro);
    if (introText) {
      const intro = createElement("p", "document-intro");
      intro.textContent = introText;
      copy.append(intro);
    }

    const gameName = clean(state.concept.intro.name);
    const oneLiner = clean(state.concept.intro.oneLiner);
    if (gameName || oneLiner) {
      const identity = createElement("div", "concept-identity");
      if (gameName) {
        const name = createElement("h2", "identity-name");
        name.textContent = gameName;
        identity.append(name);
      }
      if (oneLiner) {
        const summary = createElement("p", "identity-summary");
        summary.textContent = oneLiner;
        identity.append(summary);
      }
      copy.append(identity);
    }

    header.append(copy);
    return header;
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
    if (artConcept) {
      const entry = createElement("article", "resume-entry concept-entry");
      const heading = createElement("h3", "entry-title");
      const body = createElement("p", "entry-description");
      heading.textContent = "아트 컨셉";
      body.textContent = artConcept;
      entry.append(heading, body);
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

    return SECTION_FIELDS[sectionKey].some((field) => {
      const value = data[field];
      if (sectionKey === "images" && field !== "artConcept") {
        return Boolean(sanitizeImage(value));
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

  function documentTemplateClasses() {
    const classes = [
      `layout-${state.template.layout || "standard"}`,
      `font-${state.template.fontSize || "medium"}`,
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
      return {
        concept: sanitizeConcept(
          parseStoredJson(STORAGE_KEYS.concept),
          defaults.concept,
        ),
        template: sanitizeTemplate(
          parseStoredJson(STORAGE_KEYS.template),
          defaults.template,
        ),
      };
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
      intro: sanitizeTextObject(source.intro, fallback.intro),
      features: sanitizeTextObject(source.features, fallback.features),
      gameplay: sanitizeTextObject(source.gameplay, fallback.gameplay),
      images: {
        ...sanitizeTextObject(source.images, {
          artConcept: fallback.images.artConcept,
        }),
        mainScreen: sanitizeImage(source.images?.mainScreen),
        playScreen: sanitizeImage(source.images?.playScreen),
        ui: sanitizeImage(source.images?.ui),
        artConcept: coerceText(source.images?.artConcept),
      },
      market: sanitizeTextObject(source.market, fallback.market),
      team: sanitizeTextObject(source.team, fallback.team),
      episode: sanitizeTextObject(source.episode, fallback.episode),
    };
  }

  function sanitizeTemplate(source, fallback) {
    if (!source || typeof source !== "object") return fallback;

    const validLayouts = [
      "standard",
      "compact",
      "review",
      "timeline",
      "portfolio",
    ];
    const validFontSizes = ["small", "medium", "large"];
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
      intro: coerceText(source.intro) || fallback.intro,
      layout: validLayouts.includes(source.layout)
        ? source.layout
        : fallback.layout,
      fontSize: validFontSizes.includes(source.fontSize)
        ? source.fontSize
        : fallback.fontSize,
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

  // Keep field labels available for future extensions / debugging.
  void FIELD_LABELS;

  init();
})();
