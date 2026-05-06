(function () {
  "use strict";

  const STORAGE_KEY = "desktop-calendar.events.v1";
  const NOTIFICATION_KEY = "desktop-calendar.notifications.enabled";
  const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const DEFAULT_WINDOW_SETTINGS = {
    mode: "Auto",
    left: 0,
    top: 0,
    width: 1280,
    height: 760,
    minLeft: 0,
    maxLeft: 1200,
    minTop: 0,
    maxTop: 800,
    minWidth: 760,
    maxWidth: 1800,
    minHeight: 460,
    maxHeight: 1100
  };

  const CATEGORIES = {
    work: { label: "업무", color: "#2f6fbd" },
    personal: { label: "개인", color: "#17855c" },
    money: { label: "금전", color: "#b46900" },
    health: { label: "건강", color: "#b4325a" },
    family: { label: "가족", color: "#7c4dcb" },
    task: { label: "할일", color: "#56616c" }
  };

  const state = {
    viewDate: startOfMonth(new Date()),
    selectedDate: toISODate(new Date()),
    selectedEventId: "",
    events: loadEvents(),
    query: "",
    filterCategory: "all",
    notifiedKeys: new Set(),
    windowSettings: { ...DEFAULT_WINDOW_SETTINGS },
    windowDrag: null,
    windowResizeDrag: null,
    suppressNextClick: false
  };

  const els = {
    weekdayRow: document.getElementById("weekdayRow"),
    calendarGrid: document.getElementById("calendarGrid"),
    currentMonth: document.getElementById("currentMonth"),
    selectedDateLabel: document.getElementById("selectedDateLabel"),
    eventForm: document.getElementById("eventForm"),
    eventId: document.getElementById("eventId"),
    eventDate: document.getElementById("eventDate"),
    eventTime: document.getElementById("eventTime"),
    eventCategory: document.getElementById("eventCategory"),
    eventTitle: document.getElementById("eventTitle"),
    eventRepeat: document.getElementById("eventRepeat"),
    eventReminder: document.getElementById("eventReminder"),
    eventNotes: document.getElementById("eventNotes"),
    eventDone: document.getElementById("eventDone"),
    deleteEventButton: document.getElementById("deleteEventButton"),
    newEventButton: document.getElementById("newEventButton"),
    prevMonth: document.getElementById("prevMonth"),
    nextMonth: document.getElementById("nextMonth"),
    todayButton: document.getElementById("todayButton"),
    fullscreenButton: document.getElementById("fullscreenButton"),
    windowMinimizeButton: document.getElementById("windowMinimizeButton"),
    windowMaximizeButton: document.getElementById("windowMaximizeButton"),
    windowCloseButton: document.getElementById("windowCloseButton"),
    windowSizeModal: document.getElementById("windowSizeModal"),
    windowSizeClose: document.getElementById("windowSizeClose"),
    windowSizeMode: document.getElementById("windowSizeMode"),
    windowWidthRange: document.getElementById("windowWidthRange"),
    windowHeightRange: document.getElementById("windowHeightRange"),
    windowLeftRange: document.getElementById("windowLeftRange"),
    windowTopRange: document.getElementById("windowTopRange"),
    windowWidthValue: document.getElementById("windowWidthValue"),
    windowHeightValue: document.getElementById("windowHeightValue"),
    windowLeftValue: document.getElementById("windowLeftValue"),
    windowTopValue: document.getElementById("windowTopValue"),
    windowSizeApply: document.getElementById("windowSizeApply"),
    windowCenterButton: document.getElementById("windowCenterButton"),
    windowSizeRefresh: document.getElementById("windowSizeRefresh"),
    dayDetailModal: document.getElementById("dayDetailModal"),
    dayDetailClose: document.getElementById("dayDetailClose"),
    dayDetailDate: document.getElementById("dayDetailDate"),
    dayQuickForm: document.getElementById("dayQuickForm"),
    dayQuickTime: document.getElementById("dayQuickTime"),
    dayQuickCategory: document.getElementById("dayQuickCategory"),
    dayQuickTitle: document.getElementById("dayQuickTitle"),
    dayQuickNotes: document.getElementById("dayQuickNotes"),
    dayDetailNewButton: document.getElementById("dayDetailNewButton"),
    dayEventList: document.getElementById("dayEventList"),
    notificationButton: document.getElementById("notificationButton"),
    searchInput: document.getElementById("searchInput"),
    categoryFilter: document.getElementById("categoryFilter"),
    todayList: document.getElementById("todayList"),
    weekList: document.getElementById("weekList"),
    searchResults: document.getElementById("searchResults"),
    todayCount: document.getElementById("todayCount"),
    weekCount: document.getElementById("weekCount"),
    searchCount: document.getElementById("searchCount"),
    toast: document.getElementById("toast")
  };

  function init() {
    renderWeekdays();
    renderCategoryOptions();
    bindEvents();
    resetEditor(state.selectedDate);
    render();
    syncEventsToHost();

    if (localStorage.getItem(NOTIFICATION_KEY) === "1") {
      requestNotificationPermission(false);
    }

    window.setInterval(checkReminders, 30000);
  }

  function bindEvents() {
    els.prevMonth.addEventListener("click", function () {
      state.viewDate = addMonths(state.viewDate, -1);
      render();
    });

    els.nextMonth.addEventListener("click", function () {
      state.viewDate = addMonths(state.viewDate, 1);
      render();
    });

    els.todayButton.addEventListener("click", function () {
      const today = new Date();
      state.viewDate = startOfMonth(today);
      state.selectedDate = toISODate(today);
      resetEditor(state.selectedDate);
      render();
      openDayDetail(state.selectedDate);
    });

    els.fullscreenButton.addEventListener("click", function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function () {
          showToast("전체화면을 사용할 수 없습니다.");
        });
        return;
      }

      document.exitFullscreen();
    });

    els.windowMinimizeButton.addEventListener("click", function () {
      postHostMessage({ type: "window:minimize" });
    });
    els.windowMaximizeButton.addEventListener("click", function () {
      postHostMessage({ type: "window:maximize" });
    });
    els.windowCloseButton.addEventListener("click", function () {
      postHostMessage({ type: "window:close" });
    });

    els.windowSizeClose.addEventListener("click", closeWindowSizeModal);
    els.windowSizeRefresh.addEventListener("click", requestWindowSettings);
    els.windowSizeApply.addEventListener("click", applyWindowSizeSettings);
    els.windowCenterButton.addEventListener("click", centerWindow);
    els.windowSizeMode.addEventListener("change", syncWindowSizeControls);
    els.windowWidthRange.addEventListener("input", syncWindowSizeControls);
    els.windowHeightRange.addEventListener("input", syncWindowSizeControls);
    els.windowLeftRange.addEventListener("input", syncWindowSizeControls);
    els.windowTopRange.addEventListener("input", syncWindowSizeControls);
    els.windowSizeModal.addEventListener("click", function (event) {
      if (event.target === els.windowSizeModal) {
        closeWindowSizeModal();
      }
    });

    els.dayDetailClose.addEventListener("click", closeDayDetail);
    els.dayDetailModal.addEventListener("click", function (event) {
      if (event.target === els.dayDetailModal) {
        closeDayDetail();
      }
    });
    els.dayQuickForm.addEventListener("submit", saveQuickEventFromDayPanel);
    els.dayDetailNewButton.addEventListener("click", resetDayQuickForm);
    els.dayEventList.addEventListener("click", handleDayEventListClick);

    if (window.chrome?.webview) {
      window.chrome.webview.addEventListener("message", function (event) {
        handleHostMessage(event.data);
      });
      requestWindowSettings();
    }

    document.querySelectorAll(".resize-handle").forEach(function (handle) {
      handle.addEventListener("pointerdown", beginWindowResize);
    });
    document.addEventListener("pointermove", moveWindowResize);
    document.addEventListener("pointerup", endWindowResize);
    document.addEventListener("pointercancel", endWindowResize);

    document.addEventListener("pointerdown", beginWindowDrag);
    document.addEventListener("pointermove", moveWindowDrag);
    document.addEventListener("pointerup", endWindowDrag);
    document.addEventListener("pointercancel", endWindowDrag);
    document.addEventListener("dblclick", handleFrameDoubleClick);

    els.notificationButton.addEventListener("click", function () {
      requestNotificationPermission(true);
    });

    els.eventForm.addEventListener("submit", function (event) {
      event.preventDefault();
      saveEventFromForm();
    });

    els.newEventButton.addEventListener("click", function () {
      resetEditor(state.selectedDate);
    });

    els.deleteEventButton.addEventListener("click", deleteSelectedEvent);

    els.searchInput.addEventListener("input", function () {
      state.query = els.searchInput.value.trim().toLowerCase();
      render();
    });

    els.categoryFilter.addEventListener("change", function () {
      state.filterCategory = els.categoryFilter.value;
      render();
    });

    els.calendarGrid.addEventListener("click", function (event) {
      if (state.suppressNextClick) {
        state.suppressNextClick = false;
        return;
      }

      const chip = event.target.closest(".event-chip");
      if (chip) {
        selectEvent(chip.dataset.eventId);
        openDayDetail(state.selectedDate);
        return;
      }

      const cell = event.target.closest(".day-cell");
      if (cell) {
        state.selectedDate = cell.dataset.date;
        resetEditor(state.selectedDate);
        render();
        openDayDetail(state.selectedDate);
      }
    });

    els.calendarGrid.addEventListener("dragstart", function (event) {
      const chip = event.target.closest(".event-chip");
      if (!chip) return;
      event.dataTransfer.setData("text/plain", chip.dataset.eventId);
      event.dataTransfer.effectAllowed = "move";
    });

    els.calendarGrid.addEventListener("dragover", function (event) {
      if (event.target.closest(".day-cell")) {
        event.preventDefault();
      }
    });

    els.calendarGrid.addEventListener("drop", function (event) {
      const cell = event.target.closest(".day-cell");
      if (!cell) return;
      event.preventDefault();
      moveEvent(event.dataTransfer.getData("text/plain"), cell.dataset.date);
    });

    document.querySelector(".side-panel").addEventListener("click", function (event) {
      const agendaItem = event.target.closest(".agenda-item");
      if (!agendaItem) return;
      selectEvent(agendaItem.dataset.eventId);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (!els.dayDetailModal.hidden) {
          closeDayDetail();
          return;
        }
        if (!els.windowSizeModal.hidden) {
          closeWindowSizeModal();
          return;
        }
        resetEditor(state.selectedDate);
      }
    });
  }

  function render() {
    renderMonthTitle();
    renderCalendar();
    renderAgenda();
    renderEditorState();
    syncOpenDayDetail();
  }

  function renderWeekdays() {
    els.weekdayRow.innerHTML = WEEKDAYS.map(function (day) {
      return `<div>${escapeHTML(day)}</div>`;
    }).join("");
  }

  function renderCategoryOptions() {
    const categoryOptions = Object.entries(CATEGORIES).map(function ([value, config]) {
      return `<option value="${value}">${escapeHTML(config.label)}</option>`;
    }).join("");

    els.eventCategory.innerHTML = categoryOptions;
    els.dayQuickCategory.innerHTML = categoryOptions;
    els.categoryFilter.innerHTML = `<option value="all">전체</option>${categoryOptions}`;
  }

  function renderMonthTitle() {
    els.currentMonth.textContent = new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long"
    }).format(state.viewDate);
  }

  function renderCalendar() {
    const today = toISODate(new Date());
    const month = state.viewDate.getMonth();
    const dates = getCalendarDates(state.viewDate);

    els.calendarGrid.innerHTML = dates.map(function (date) {
      const iso = toISODate(date);
      const classes = ["day-cell"];

      if (date.getMonth() !== month) classes.push("outside-month");
      if (iso === today) classes.push("today");
      if (iso === state.selectedDate) classes.push("selected");

      const events = eventsForDate(iso).filter(matchesVisibleFilters);
      const chips = events.slice(0, 3).map(renderEventChip).join("");
      const countLabel = events.length > 3 ? `<span class="more-count">+${events.length - 3}</span>` : "";

      return `
        <div class="${classes.join(" ")}" data-date="${iso}" tabindex="0" role="button" aria-label="${formatLongDate(iso)}">
          <div class="day-head">
            <span>${date.getDate()}</span>
            ${iso === today ? "<strong>오늘</strong>" : ""}
          </div>
          <div class="event-stack">
            ${chips}
            ${countLabel}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderEventChip(event) {
    const category = CATEGORIES[event.category] || CATEGORIES.task;
    const doneClass = event.done ? " is-done" : "";
    const time = event.time ? `<span class="chip-time">${escapeHTML(event.time)}</span>` : "";
    const repeat = event.repeat && event.repeat !== "none" ? `<span class="repeat-mark">↻</span>` : "";

    return `
      <button class="event-chip${doneClass}" draggable="true" data-event-id="${escapeHTML(event.id)}" type="button" style="--event-color: ${category.color}">
        ${time}
        <span class="chip-title">${escapeHTML(event.title)}</span>
        ${repeat}
      </button>
    `;
  }

  function renderAgenda() {
    const todayIso = toISODate(new Date());
    const todayEvents = eventsForDate(todayIso).filter(matchesVisibleFilters);
    const weekEvents = getUpcomingEvents(7).filter(function (item) {
      return matchesVisibleFilters(item.event);
    });
    const searchEvents = state.query
      ? state.events.filter(matchesSearch).sort(compareEvents)
      : [];

    els.todayCount.textContent = String(todayEvents.length);
    els.weekCount.textContent = String(weekEvents.length);
    els.searchCount.textContent = state.query ? String(searchEvents.length) : "";

    els.todayList.innerHTML = renderAgendaItems(todayEvents.map(function (event) {
      return { event, date: todayIso };
    }));
    els.weekList.innerHTML = renderAgendaItems(weekEvents);
    els.searchResults.innerHTML = state.query
      ? renderAgendaItems(searchEvents.map(function (event) {
          return { event, date: event.date };
        }))
      : `<div class="empty-state">검색어 없음</div>`;
  }

  function renderAgendaItems(items) {
    if (items.length === 0) {
      return `<div class="empty-state">일정 없음</div>`;
    }

    return items.map(function (item) {
      const event = item.event;
      const category = CATEGORIES[event.category] || CATEGORIES.task;
      const doneClass = event.done ? " is-done" : "";
      const time = event.time ? escapeHTML(event.time) : "종일";

      return `
        <button class="agenda-item${doneClass}" type="button" data-event-id="${escapeHTML(event.id)}">
          <span class="agenda-dot" style="background: ${category.color}"></span>
          <span class="agenda-main">
            <strong>${escapeHTML(event.title)}</strong>
            <small>${escapeHTML(formatShortDate(item.date))} · ${time} · ${escapeHTML(category.label)}</small>
          </span>
        </button>
      `;
    }).join("");
  }

  function renderEditorState() {
    const selected = state.events.find(function (event) {
      return event.id === state.selectedEventId;
    });

    els.selectedDateLabel.textContent = formatLongDate(state.selectedDate);
    els.deleteEventButton.disabled = !selected;
  }

  function openDayDetail(dateIso) {
    state.selectedDate = dateIso;
    resetDayQuickForm();
    syncOpenDayDetail();
    els.dayDetailModal.hidden = false;
    window.setTimeout(function () {
      els.dayQuickTitle.focus();
    }, 0);
  }

  function closeDayDetail() {
    els.dayDetailModal.hidden = true;
  }

  function syncOpenDayDetail() {
    if (els.dayDetailModal.hidden) {
      return;
    }

    els.dayDetailDate.textContent = formatLongDate(state.selectedDate);
    renderDayEventList();
  }

  function resetDayQuickForm() {
    els.dayQuickTime.value = "";
    els.dayQuickCategory.value = "work";
    els.dayQuickTitle.value = "";
    els.dayQuickNotes.value = "";
  }

  function saveQuickEventFromDayPanel(event) {
    event.preventDefault();
    const title = els.dayQuickTitle.value.trim();

    if (!title) {
      showToast("일정을 입력하세요.");
      return;
    }

    const calendarEvent = {
      id: createId(),
      date: state.selectedDate,
      time: els.dayQuickTime.value,
      title,
      category: els.dayQuickCategory.value,
      repeat: "none",
      reminder: "none",
      notes: els.dayQuickNotes.value.trim(),
      done: false,
      updatedAt: new Date().toISOString()
    };

    state.events.push(calendarEvent);
    state.selectedEventId = calendarEvent.id;
    saveEvents();
    resetDayQuickForm();
    render();
    showToast("일정 저장됨");
  }

  function renderDayEventList() {
    const items = eventsForDate(state.selectedDate);

    if (items.length === 0) {
      els.dayEventList.innerHTML = `<div class="empty-state">이 날짜의 일정 없음</div>`;
      return;
    }

    els.dayEventList.innerHTML = items.map(function (event) {
      const category = CATEGORIES[event.category] || CATEGORIES.task;
      const doneClass = event.done ? " is-done" : "";
      const time = event.time ? escapeHTML(event.time) : "종일";

      return `
        <div class="day-event-item${doneClass}" data-event-id="${escapeHTML(event.id)}">
          <span class="agenda-dot" style="background: ${category.color}"></span>
          <button class="day-event-main" type="button" data-action="select" data-event-id="${escapeHTML(event.id)}">
            <strong>${escapeHTML(event.title)}</strong>
            <small>${time} · ${escapeHTML(category.label)}${event.repeat && event.repeat !== "none" ? " · 반복" : ""}</small>
          </button>
          <button class="day-event-delete" type="button" data-action="delete" data-event-id="${escapeHTML(event.id)}" aria-label="일정 삭제">삭제</button>
        </div>
      `;
    }).join("");
  }

  function handleDayEventListClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const id = button.dataset.eventId;
    const action = button.dataset.action;

    if (action === "delete") {
      state.events = state.events.filter(function (item) {
        return item.id !== id;
      });
      if (state.selectedEventId === id) {
        state.selectedEventId = "";
      }
      saveEvents();
      render();
      showToast("삭제됨");
      return;
    }

    selectEvent(id);
    showToast("우측 편집폼에 불러옴");
  }

  function openWindowSizeModal() {
    hydrateWindowSizeControls(state.windowSettings);
    els.windowSizeModal.hidden = false;
    requestWindowSettings();
  }

  function closeWindowSizeModal() {
    els.windowSizeModal.hidden = true;
  }

  function beginWindowResize(event) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    state.windowResizeDrag = {
      pointerId: event.pointerId,
      edge: event.currentTarget.dataset.resizeEdge,
      screenX: event.screenX,
      screenY: event.screenY
    };
    document.body.classList.add("is-window-resizing");
  }

  function moveWindowResize(event) {
    if (!state.windowResizeDrag || event.pointerId !== state.windowResizeDrag.pointerId) {
      return;
    }

    const dx = event.screenX - state.windowResizeDrag.screenX;
    const dy = event.screenY - state.windowResizeDrag.screenY;

    if (dx === 0 && dy === 0) {
      return;
    }

    state.windowResizeDrag.screenX = event.screenX;
    state.windowResizeDrag.screenY = event.screenY;
    postHostMessage({
      type: "window:resizeBy",
      edge: state.windowResizeDrag.edge,
      dx,
      dy
    });
  }

  function endWindowResize(event) {
    if (!state.windowResizeDrag || event.pointerId !== state.windowResizeDrag.pointerId) {
      return;
    }

    state.windowResizeDrag = null;
    document.body.classList.remove("is-window-resizing");
    postHostMessage({ type: "window:resizeEnd" });
  }

  function beginWindowDrag(event) {
    if (event.button !== 0) {
      return;
    }

    if (!isWindowDragTarget(event.target)) {
      return;
    }

    event.target.setPointerCapture?.(event.pointerId);
    document.body.classList.add("is-window-dragging");
    state.windowDrag = {
      pointerId: event.pointerId,
      screenX: event.screenX,
      screenY: event.screenY,
      moved: false
    };
  }

  function moveWindowDrag(event) {
    if (!state.windowDrag || event.pointerId !== state.windowDrag.pointerId) {
      return;
    }

    const dx = event.screenX - state.windowDrag.screenX;
    const dy = event.screenY - state.windowDrag.screenY;
    if (dx === 0 && dy === 0) {
      return;
    }

    event.preventDefault();
    state.windowDrag.moved = true;
    state.windowDrag.screenX = event.screenX;
    state.windowDrag.screenY = event.screenY;
    postHostMessage({ type: "window:moveBy", dx, dy });
  }

  function endWindowDrag(event) {
    if (!state.windowDrag || event.pointerId !== state.windowDrag.pointerId) {
      return;
    }

    state.suppressNextClick = Boolean(state.windowDrag.moved);
    state.windowDrag = null;
    document.body.classList.remove("is-window-dragging");
    postHostMessage({ type: "window:moveEnd" });
  }

  function handleFrameDoubleClick(event) {
    if (!isFrameDoubleClickTarget(event.target)) {
      return;
    }

    event.preventDefault();
    postHostMessage({ type: "window:maximize" });
  }

  function isWindowDragTarget(target) {
    return Boolean(target)
      && !target.closest("button, input, select, textarea, label, .modal-panel, .event-chip, .agenda-item, .resize-handle, .window-controls");
  }

  function isFrameDoubleClickTarget(target) {
    return Boolean(target)
      && target.closest(".topbar, .app-shell")
      && !target.closest("button, input, select, textarea, label, .modal-panel, .event-chip, .agenda-item, .day-cell, .calendar-grid, .side-panel, .resize-handle, .window-controls");
  }

  function requestWindowSettings() {
    if (!postHostMessage({ type: "window:getSettings" })) {
      showToast("Windows 앱에서만 창 설정을 사용할 수 있습니다.");
    }
  }

  function applyWindowSizeSettings() {
    const mode = els.windowSizeMode.value;
    const payload = {
      type: "window:setSize",
      mode,
      left: Number(els.windowLeftRange.value),
      top: Number(els.windowTopRange.value),
      width: Number(els.windowWidthRange.value),
      height: Number(els.windowHeightRange.value)
    };

    if (!postHostMessage(payload)) {
      showToast("Windows 앱에서만 창 설정을 사용할 수 있습니다.");
      return;
    }

    showToast("창 크기 적용");
  }

  function centerWindow() {
    if (!postHostMessage({ type: "window:center" })) {
      showToast("Windows 앱에서만 창 설정을 사용할 수 있습니다.");
      return;
    }

    showToast("가운데로 이동");
  }

  function handleHostMessage(message) {
    if (!message) {
      return;
    }

    if (message.type === "window:interactionMode") {
      const mode = message.mode || (message.background ? "wallpaper" : "window");
      document.body.classList.toggle("is-background-mode", mode === "wallpaper");
      document.body.classList.toggle("is-desktop-overlay-mode", mode === "overlay");
      return;
    }

    if (message.type !== "window:settings") {
      return;
    }

    state.windowSettings = {
      ...DEFAULT_WINDOW_SETTINGS,
      ...message
    };
    hydrateWindowSizeControls(state.windowSettings);
  }

  function hydrateWindowSizeControls(settings) {
    els.windowSizeMode.value = settings.mode || DEFAULT_WINDOW_SETTINGS.mode;
    els.windowWidthRange.min = settings.minWidth || DEFAULT_WINDOW_SETTINGS.minWidth;
    els.windowWidthRange.max = settings.maxWidth || DEFAULT_WINDOW_SETTINGS.maxWidth;
    els.windowHeightRange.min = settings.minHeight || DEFAULT_WINDOW_SETTINGS.minHeight;
    els.windowHeightRange.max = settings.maxHeight || DEFAULT_WINDOW_SETTINGS.maxHeight;
    els.windowLeftRange.min = settings.minLeft ?? DEFAULT_WINDOW_SETTINGS.minLeft;
    els.windowLeftRange.max = settings.maxLeft ?? DEFAULT_WINDOW_SETTINGS.maxLeft;
    els.windowTopRange.min = settings.minTop ?? DEFAULT_WINDOW_SETTINGS.minTop;
    els.windowTopRange.max = settings.maxTop ?? DEFAULT_WINDOW_SETTINGS.maxTop;
    els.windowLeftRange.value = clampNumber(
      settings.left ?? DEFAULT_WINDOW_SETTINGS.left,
      Number(els.windowLeftRange.min),
      Number(els.windowLeftRange.max)
    );
    els.windowTopRange.value = clampNumber(
      settings.top ?? DEFAULT_WINDOW_SETTINGS.top,
      Number(els.windowTopRange.min),
      Number(els.windowTopRange.max)
    );
    els.windowWidthRange.value = clampNumber(
      settings.width || DEFAULT_WINDOW_SETTINGS.width,
      Number(els.windowWidthRange.min),
      Number(els.windowWidthRange.max)
    );
    els.windowHeightRange.value = clampNumber(
      settings.height || DEFAULT_WINDOW_SETTINGS.height,
      Number(els.windowHeightRange.min),
      Number(els.windowHeightRange.max)
    );
    syncWindowSizeControls();
  }

  function syncWindowSizeControls() {
    const customEnabled = els.windowSizeMode.value === "Custom";
    els.windowWidthRange.disabled = !customEnabled;
    els.windowHeightRange.disabled = !customEnabled;
    els.windowWidthValue.textContent = `${els.windowWidthRange.value}px`;
    els.windowHeightValue.textContent = `${els.windowHeightRange.value}px`;
    els.windowLeftValue.textContent = `${els.windowLeftRange.value}px`;
    els.windowTopValue.textContent = `${els.windowTopRange.value}px`;
  }

  function postHostMessage(payload) {
    if (!window.chrome?.webview) {
      return false;
    }

    window.chrome.webview.postMessage(payload);
    return true;
  }

  function resetEditor(dateIso) {
    state.selectedEventId = "";
    els.eventId.value = "";
    els.eventDate.value = dateIso;
    els.eventTime.value = "";
    els.eventCategory.value = "work";
    els.eventTitle.value = "";
    els.eventRepeat.value = "none";
    els.eventReminder.value = "none";
    els.eventNotes.value = "";
    els.eventDone.checked = false;
    renderEditorState();
  }

  function selectEvent(id) {
    const event = state.events.find(function (item) {
      return item.id === id;
    });

    if (!event) return;

    state.selectedEventId = event.id;
    state.selectedDate = event.date;
    state.viewDate = startOfMonth(parseISODate(event.date));

    els.eventId.value = event.id;
    els.eventDate.value = event.date;
    els.eventTime.value = event.time || "";
    els.eventCategory.value = event.category || "work";
    els.eventTitle.value = event.title;
    els.eventRepeat.value = event.repeat || "none";
    els.eventReminder.value = event.reminder || "none";
    els.eventNotes.value = event.notes || "";
    els.eventDone.checked = Boolean(event.done);

    render();
  }

  function saveEventFromForm() {
    const title = els.eventTitle.value.trim();
    const date = els.eventDate.value;

    if (!title || !date) {
      showToast("날짜와 일정을 입력하세요.");
      return;
    }

    const id = els.eventId.value || createId();
    const existingIndex = state.events.findIndex(function (event) {
      return event.id === id;
    });

    const event = {
      id,
      date,
      time: els.eventTime.value,
      title,
      category: els.eventCategory.value,
      repeat: els.eventRepeat.value,
      reminder: els.eventReminder.value,
      notes: els.eventNotes.value.trim(),
      done: els.eventDone.checked,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      state.events[existingIndex] = event;
    } else {
      state.events.push(event);
    }

    state.selectedDate = date;
    state.selectedEventId = id;
    state.viewDate = startOfMonth(parseISODate(date));
    saveEvents();
    render();
    showToast("저장됨");
  }

  function deleteSelectedEvent() {
    const id = els.eventId.value;
    if (!id) return;

    state.events = state.events.filter(function (event) {
      return event.id !== id;
    });
    saveEvents();
    resetEditor(state.selectedDate);
    render();
    showToast("삭제됨");
  }

  function moveEvent(id, dateIso) {
    const event = state.events.find(function (item) {
      return item.id === id;
    });

    if (!event) return;

    event.date = dateIso;
    event.updatedAt = new Date().toISOString();
    state.selectedDate = dateIso;
    state.selectedEventId = id;
    saveEvents();
    selectEvent(id);
    showToast("이동됨");
  }

  function getCalendarDates(viewDate) {
    const first = startOfMonth(viewDate);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());

    return Array.from({ length: 42 }, function (_, index) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }

  function eventsForDate(dateIso) {
    return state.events.filter(function (event) {
      return occursOn(event, dateIso);
    }).sort(compareEvents);
  }

  function occursOn(event, dateIso) {
    if (event.date === dateIso) return true;
    if (!event.repeat || event.repeat === "none") return false;

    const start = parseISODate(event.date);
    const target = parseISODate(dateIso);

    if (target < start) return false;

    if (event.repeat === "daily") return true;

    if (event.repeat === "weekly") {
      const diffDays = Math.floor((target - start) / 86400000);
      return diffDays % 7 === 0;
    }

    if (event.repeat === "monthly") {
      return target.getDate() === start.getDate();
    }

    if (event.repeat === "yearly") {
      return target.getMonth() === start.getMonth() && target.getDate() === start.getDate();
    }

    return false;
  }

  function getUpcomingEvents(days) {
    const start = new Date();
    const items = [];

    for (let index = 0; index < days; index += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const iso = toISODate(date);
      eventsForDate(iso).forEach(function (event) {
        items.push({ event, date: iso });
      });
    }

    return items.sort(function (a, b) {
      return compareEvents(a.event, b.event) || a.date.localeCompare(b.date);
    });
  }

  function matchesVisibleFilters(event) {
    if (state.filterCategory !== "all" && event.category !== state.filterCategory) {
      return false;
    }

    if (!state.query) return true;
    return matchesSearch(event);
  }

  function matchesSearch(event) {
    if (!state.query) return true;
    const haystack = [event.title, event.notes, CATEGORIES[event.category]?.label]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(state.query);
  }

  function compareEvents(a, b) {
    const timeA = a.time || "99:99";
    const timeB = b.time || "99:99";
    return timeA.localeCompare(timeB) || a.title.localeCompare(b.title, "ko-KR");
  }

  function requestNotificationPermission(showResult) {
    if (!("Notification" in window)) {
      if (showResult) showToast("이 브라우저는 알림을 지원하지 않습니다.");
      return;
    }

    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        localStorage.setItem(NOTIFICATION_KEY, "1");
        if (showResult) showToast("알림 켜짐");
        checkReminders();
        return;
      }

      if (showResult) showToast("알림 권한이 필요합니다.");
    });
  }

  function checkReminders() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const now = new Date();
    const todayIso = toISODate(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowIso = toISODate(tomorrow);

    [todayIso, tomorrowIso].forEach(function (dateIso) {
      eventsForDate(dateIso).forEach(function (event) {
        if (!event.time || !event.reminder || event.reminder === "none" || event.done) return;

        const eventStart = new Date(`${dateIso}T${event.time}:00`);
        const remindAt = new Date(eventStart.getTime() - Number(event.reminder) * 60000);
        const key = `${event.id}:${dateIso}:${event.reminder}`;

        if (state.notifiedKeys.has(key)) return;
        if (now < remindAt || now > eventStart) return;

        state.notifiedKeys.add(key);
        const category = CATEGORIES[event.category] || CATEGORIES.task;
        new Notification(event.title, {
          body: `${formatShortDate(dateIso)} ${event.time} · ${category.label}`,
          tag: key
        });
      });
    });
  }

  function loadEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeEvent).filter(Boolean) : [];
    } catch (error) {
      return [];
    }
  }

  function saveEvents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events));
    syncEventsToHost();
  }

  function syncEventsToHost() {
    postHostMessage({
      type: "calendar:eventsChanged",
      events: state.events,
      selectedDate: state.selectedDate,
      viewDate: toISODate(state.viewDate)
    });
  }

  function normalizeEvent(item) {
    return {
      id: item.id || createId(),
      date: item.date,
      time: item.time || "",
      title: String(item.title || "").slice(0, 80),
      category: CATEGORIES[item.category] ? item.category : "task",
      repeat: item.repeat || "none",
      reminder: item.reminder || "none",
      notes: item.notes || "",
      done: Boolean(item.done),
      updatedAt: item.updatedAt || new Date().toISOString()
    };
  }

  function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  function addMonths(date, count) {
    return new Date(date.getFullYear(), date.getMonth() + count, 1);
  }

  function parseISODate(iso) {
    const parts = iso.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatLongDate(iso) {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short"
    }).format(parseISODate(iso));
  }

  function formatShortDate(iso) {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      weekday: "short"
    }).format(parseISODate(iso));
  }

  function createId() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      els.toast.classList.remove("is-visible");
    }, 1800);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function clampNumber(value, minimum, maximum) {
    return Math.min(Math.max(Number(value), minimum), maximum);
  }

  window.DesktopCalendar = {
    selectEvent,
    openDayDetail
  };

  init();
})();
