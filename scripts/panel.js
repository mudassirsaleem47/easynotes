//================================================
/*

EasyNotes
A clean, Notes-style sidebar for writing notes, checklists and web clips.
Based on Note Sidebar, Copyright (C) 2026 Stefan vd (www.stefanvd.net)
Modifications Copyright (C) 2026 EasyNotes contributors

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

*/
//================================================

/* global t, applyI18n, escapeHtml, newNote, saveNote, removeNote, loadNotes, loadFolders, saveFolders,
   getSettings, purgeTrash, checkPasswordHash, uid, NOTE_PREFIX, FOLDERS_KEY, TRASH_DAYS */

const $ = (id) => document.getElementById(id);

const ICONS = {
	compose: "<path d='M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5'/><path d='M17.6 3.6a2 2 0 0 1 2.8 2.8L12 14.8l-3.8.9.9-3.8z'/>",
	chevronLeft: "<path d='M15 5l-7 7 7 7' stroke-width='2.2'/>",
	chevronRight: "<path d='M9 5l7 7-7 7' stroke-width='2.2'/>",
	chevronUp: "<path d='M5 15l7-7 7 7' stroke-width='2.2'/>",
	chevronDown: "<path d='M5 9l7 7 7-7' stroke-width='2.2'/>",
	ellipsis: "<circle cx='12' cy='12' r='9'/><circle cx='8' cy='12' r='1.1' fill='currentColor' stroke='none'/><circle cx='12' cy='12' r='1.1' fill='currentColor' stroke='none'/><circle cx='16' cy='12' r='1.1' fill='currentColor' stroke='none'/>",
	gear: "<path d='M4 7h9M17 7h3M4 17h3M11 17h9'/><circle cx='15' cy='7' r='2'/><circle cx='9' cy='17' r='2'/>",
	folder: "<path d='M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5z'/>",
	folderPlus: "<path d='M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5z'/><path d='M12 10.5v5M9.5 13h5'/>",
	trash: "<path d='M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4.5h6V7'/>",
	search: "<circle cx='11' cy='11' r='6.5'/><path d='M20 20l-4.3-4.3'/>",
	checklist: "<circle cx='5.5' cy='7' r='2.2'/><path d='M4.5 7l.8.8 1.4-1.6'/><circle cx='5.5' cy='17' r='2.2'/><path d='M11 7h9M11 17h9'/>",
	format: "<text x='12' y='17' text-anchor='middle' font-size='14' font-weight='600' fill='currentColor' stroke='none' font-family='system-ui, sans-serif'>Aa</text>",
	lock: "<rect x='5' y='11' width='14' height='10' rx='2.2'/><path d='M8 11V8a4 4 0 0 1 8 0v3'/>",
	lockLarge: "<rect x='5' y='11' width='14' height='10' rx='2.2'/><path d='M8 11V8a4 4 0 0 1 8 0v3'/>",
	pin: "<path d='M9 4h6l-1 6 3 3H7l3-3zM12 13v7'/>",
	unpin: "<path d='M9 4h6l-1 6 3 3H7l3-3zM12 13v7M4 4l16 16'/>",
	copy: "<rect x='8' y='8' width='12' height='12' rx='2'/><path d='M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2'/>",
	duplicate: "<rect x='8' y='8' width='12' height='12' rx='2'/><path d='M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2M14 11v6M11 14h6'/>",
	export: "<path d='M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14'/>",
	print: "<path d='M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2'/><path d='M7 14h10v6H7z'/>",
	speaker: "<path d='M4 10v4h4l5 4V6l-5 4z'/><path d='M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11'/>",
	clock: "<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/>",
	recover: "<path d='M4 12a8 8 0 1 0 2.4-5.7L4 8.5M4 4v4.5h4.5'/>",
	check: "<path d='M5 12.5l4.5 4.5L19 7.5' stroke-width='2.2'/>",
	bullet: "<circle cx='5' cy='7' r='1.3' fill='currentColor' stroke='none'/><circle cx='5' cy='12' r='1.3' fill='currentColor' stroke='none'/><circle cx='5' cy='17' r='1.3' fill='currentColor' stroke='none'/><path d='M9.5 7H20M9.5 12H20M9.5 17H20'/>",
	dashed: "<path d='M3.5 7h3M3.5 12h3M3.5 17h3M9.5 7H20M9.5 12H20M9.5 17H20'/>",
	numbered: "<text x='5' y='9' text-anchor='middle' font-size='6.5' fill='currentColor' stroke='none' font-family='system-ui'>1</text><text x='5' y='14.5' text-anchor='middle' font-size='6.5' fill='currentColor' stroke='none' font-family='system-ui'>2</text><text x='5' y='20' text-anchor='middle' font-size='6.5' fill='currentColor' stroke='none' font-family='system-ui'>3</text><path d='M9.5 7H20M9.5 12H20M9.5 17H20'/>",
	quote: "<path d='M6 5v14M10 8h10M10 12h10M10 16h7'/>",
	find: "<circle cx='11' cy='11' r='6.5'/><path d='M20 20l-4.3-4.3M8.5 11h5'/>",
	link: "<path d='M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1'/><path d='M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'/>",
	move: "<path d='M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5z'/><path d='M9 13h6M12.5 10.5L15 13l-2.5 2.5'/>",
	pencil: "<path d='M16.6 4.6a2 2 0 0 1 2.8 2.8L8 18.8l-3.8.9.9-3.8z'/>",
	list: "<rect x='3.5' y='4.5' width='17' height='15' rx='2.5'/><path d='M9 4.5v15M5.5 8.5h1.5M5.5 11.5h1.5M5.5 14.5h1.5'/>",
	plus: "<path d='M12 5v14M5 12h14' stroke-width='2'/>",
	xmark: "<path d='M6 6l12 12M18 6L6 18' stroke-width='2.2'/>"
};

function icon(name){
	return "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>" + (ICONS[name] || "") + "</svg>";
}

function fillIcons(root){
	(root || document).querySelectorAll("[data-icon]").forEach((el) => {
		el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon));
	});
}

// ---------- state ----------

const ALL = "all";
const TRASH = "trash";

const state = {
	settings: null,
	notes: [],
	folders: [],
	folder: ALL,
	noteId: null,
	query: "",
	level: 1,
	speaking: false
};

const metaCache = new Map();
let saveTimer = null;
let pendingNote = null;
let editor;

function currentNote(){
	return state.notes.find((n) => n.id === state.noteId) || null;
}

function notesAreaName(){
	return state.settings.storage === "sync" ? "sync" : "local";
}

// Title, body text and search text of a note, cached per modification time.
function meta(note){
	const cached = metaCache.get(note.id);
	if(cached && cached.modified === note.modified && cached.html === note.html){ return cached; }
	const withBreaks = (note.html || "")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(div|p|h[1-6]|li|pre|blockquote)>/gi, "\n");
	const doc = new DOMParser().parseFromString(withBreaks, "text/html");
	const text = (doc.body.textContent || "").replace(/ /g, " ");
	const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
	const result = {
		modified: note.modified,
		html: note.html,
		title: lines[0] || "",
		body: lines.slice(1).join(" "),
		text: text,
		hasMedia: /<(img|li)\b/i.test(note.html || "")
	};
	metaCache.set(note.id, result);
	return result;
}

function isEmptyNote(note){
	const m = meta(note);
	return !m.text.trim() && !m.hasMedia;
}

function folderName(id){
	if(id === ALL){ return t("allNotes", "All Notes"); }
	if(id === TRASH){ return t("recentlyDeleted", "Recently Deleted"); }
	const folder = state.folders.find((f) => f.id === id);
	return folder ? folder.name : t("allNotes", "All Notes");
}

// ---------- dates ----------

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(ms){
	const d = new Date(ms);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}

function shortDate(ms){
	const today = startOfDay(Date.now());
	if(ms >= today){ return new Intl.DateTimeFormat(undefined, {timeStyle: "short"}).format(ms); }
	if(ms >= today - DAY){ return t("yesterday", "Yesterday"); }
	if(ms >= today - 6 * DAY){ return new Intl.DateTimeFormat(undefined, {weekday: "long"}).format(ms); }
	return new Intl.DateTimeFormat(undefined, {dateStyle: "short"}).format(ms);
}

function longDate(ms){
	return new Intl.DateTimeFormat(undefined, {dateStyle: "long", timeStyle: "short"}).format(ms);
}

function dateGroup(ms){
	const today = startOfDay(Date.now());
	if(ms >= today){ return {key: "today", label: t("today", "Today")}; }
	if(ms >= today - DAY){ return {key: "yesterday", label: t("yesterday", "Yesterday")}; }
	if(ms >= today - 7 * DAY){ return {key: "week", label: t("previous7", "Previous 7 Days")}; }
	if(ms >= today - 30 * DAY){ return {key: "month", label: t("previous30", "Previous 30 Days")}; }
	const d = new Date(ms);
	if(d.getFullYear() === new Date().getFullYear()){
		return {key: "m" + d.getMonth(), label: new Intl.DateTimeFormat(undefined, {month: "long"}).format(ms)};
	}
	return {key: "y" + d.getFullYear(), label: String(d.getFullYear())};
}

// ---------- navigation ----------

function go(level){
	state.level = level;
	$("app").dataset.level = level;
	document.querySelectorAll(".view").forEach((view) => {
		const viewLevel = Number(view.dataset.level);
		view.classList.toggle("current", viewLevel === level);
		view.classList.toggle("behind", viewLevel < level);
	});
	if(level < 2){ stopSpeaking(); }
}

function inFolder(note, folder){
	if(folder === TRASH){ return Boolean(note.deleted); }
	if(note.deleted){ return false; }
	return folder === ALL || note.folderId === folder;
}

function openFolder(id){
	state.folder = id;
	const note = currentNote();
	if(note && !inFolder(note, id)){
		closeCurrentNote();
		showEditorFor(null);
	}
	renderTabs();
	state.query = "";
	$("search").value = "";
	try{ localStorage.setItem("en_folder", id); }catch(e){ /* storage blocked */ }
	renderList();
	go(1);
	$("list-scroll").scrollTop = 0;
}

// ---------- rendering: folders ----------

function folderCount(id){
	return state.notes.filter((n) => {
		if(id === TRASH){ return n.deleted; }
		if(n.deleted){ return false; }
		return id === ALL || n.folderId === id;
	}).length;
}

function folderRow(id, name, iconName){
	const row = document.createElement("button");
	row.className = "folder-row";
	row.innerHTML = "<span class='folder-icon'>" + icon(iconName) + "</span><span class='folder-name'></span><span class='folder-count'></span><span class='chev'>" + icon("chevronRight") + "</span>";
	row.querySelector(".folder-name").textContent = name;
	row.querySelector(".folder-count").textContent = folderCount(id);
	row.addEventListener("click", () => openFolder(id));
	if(id !== ALL && id !== TRASH){
		row.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			showMenu({x: e.clientX, y: e.clientY}, folderMenuItems(id));
		});
	}
	return row;
}

function renderFolders(){
	const list = $("folder-list");
	list.textContent = "";
	list.appendChild(folderRow(ALL, t("allNotes", "All Notes"), "folder"));
	[...state.folders].sort((a, b) => a.name.localeCompare(b.name)).forEach((f) => {
		list.appendChild(folderRow(f.id, f.name, "folder"));
	});
	list.appendChild(folderRow(TRASH, t("recentlyDeleted", "Recently Deleted"), "trash"));
}

// ---------- rendering: note list ----------

let listFrame = 0;
function scheduleListRender(){
	cancelAnimationFrame(listFrame);
	listFrame = requestAnimationFrame(() => { renderList(); renderFolders(); renderTabs(); });
}

function visibleNotes(){
	const q = state.query.trim().toLowerCase();
	let notes = state.notes.filter((n) => inFolder(n, state.folder));
	// keep a brand new, still empty note out of the list until something is typed
	notes = notes.filter((n) => !(n.id === state.noteId && n.fresh && isEmptyNote(n)));
	if(q){
		notes = notes.filter((n) => meta(n).text.toLowerCase().includes(q));
	}
	const sortBy = state.settings.sortBy;
	notes.sort((a, b) => {
		if(sortBy === "title"){ return meta(a).title.localeCompare(meta(b).title) || b.modified - a.modified; }
		if(sortBy === "created"){ return b.created - a.created; }
		if(state.folder === TRASH){ return b.deleted - a.deleted; }
		return b.modified - a.modified;
	});
	return notes;
}

function highlightText(text, q){
	if(!q){ return escapeHtml(text); }
	const i = text.toLowerCase().indexOf(q);
	if(i < 0){ return escapeHtml(text); }
	return escapeHtml(text.slice(0, i)) + "<mark>" + escapeHtml(text.slice(i, i + q.length)) + "</mark>" + escapeHtml(text.slice(i + q.length));
}

function snippetFor(note, q){
	const m = meta(note);
	if(q && !m.title.toLowerCase().includes(q)){
		const flat = m.body;
		const i = flat.toLowerCase().indexOf(q);
		if(i >= 0){
			const start = Math.max(0, i - 20);
			return (start > 0 ? "…" : "") + flat.slice(start, i + q.length + 60);
		}
	}
	return m.body || t("noAdditionalText", "No additional text");
}

function noteRow(note, q){
	const m = meta(note);
	const row = document.createElement("div");
	row.className = "note-row" + (note.id === state.noteId ? " active" : "");
	row.dataset.id = note.id;
	row.tabIndex = 0;
	const date = state.folder === TRASH ? note.deleted : (state.settings.sortBy === "created" ? note.created : note.modified);
	let html = "<div class='note-title'>" + (note.pinned && !note.deleted && q ? "<span class='pin-mark'>" + icon("pin") + "</span>" : "") +
		highlightText(m.title || t("newNote", "New Note"), q) + "</div>" +
		"<div class='note-sub'><span class='note-date-small'>" + escapeHtml(shortDate(date)) + "</span>" +
		"<span class='note-snippet'>" + highlightText(snippetFor(note, q), q) + "</span></div>";
	if(state.folder === ALL && note.folderId && state.folders.some((f) => f.id === note.folderId)){
		html += "<div class='note-folder'>" + icon("folder") + escapeHtml(folderName(note.folderId)) + "</div>";
	}
	row.innerHTML = html;
	row.addEventListener("click", () => openNote(note.id, {fromSearch: true}));
	row.addEventListener("keydown", (e) => { if(e.key === "Enter"){ openNote(note.id, {fromSearch: true}); } });
	row.addEventListener("contextmenu", (e) => {
		e.preventDefault();
		showMenu({x: e.clientX, y: e.clientY}, noteMenuItems(note, false));
	});
	return row;
}

function renderList(){
	const list = $("note-list");
	const q = state.query.trim().toLowerCase();
	const notes = visibleNotes();
	list.textContent = "";
	$("list-title").textContent = folderName(state.folder);

	const sections = [];
	const pinned = state.folder === TRASH || q ? [] : notes.filter((n) => n.pinned);
	if(pinned.length){ sections.push({label: t("pinned", "Pinned"), pin: true, notes: pinned}); }
	const rest = notes.filter((n) => !pinned.includes(n));

	if(state.settings.groupByDate && state.settings.sortBy !== "title" && !q){
		const field = state.folder === TRASH ? "deleted" : (state.settings.sortBy === "created" ? "created" : "modified");
		let current = null;
		rest.forEach((n) => {
			const g = dateGroup(n[field]);
			if(!current || current.key !== g.key){
				current = {key: g.key, label: g.label, notes: []};
				sections.push(current);
			}
			current.notes.push(n);
		});
	}else if(rest.length){
		sections.push({label: q ? t("topHits", "Results") : "", notes: rest});
	}

	sections.forEach((section) => {
		const wrap = document.createElement("div");
		wrap.className = "list-section";
		if(section.label){
			const title = document.createElement("div");
			title.className = "section-title";
			title.innerHTML = (section.pin ? icon("pin") : "") + "<span></span>";
			title.querySelector("span").textContent = section.label;
			wrap.appendChild(title);
		}
		const rows = document.createElement("div");
		rows.className = "rows";
		section.notes.forEach((n) => rows.appendChild(noteRow(n, q)));
		wrap.appendChild(rows);
		list.appendChild(wrap);
	});

	const empty = $("list-empty");
	if(!notes.length){
		empty.textContent = q ? t("noResults", "No Results") : (state.folder === TRASH ? t("trashEmpty", "Notes you delete stay here for $1 days.", [TRASH_DAYS]) : t("noNotes", "No Notes"));
		empty.classList.remove("hidden");
	}else{
		empty.classList.add("hidden");
	}

	const count = notes.length;
	$("note-count").textContent = count === 1 ? t("oneNote", "1 Note") : t("countNotes", "$1 Notes", [count]);
	$("btn-new-note").disabled = state.folder === TRASH;
	$("btn-lock").classList.toggle("hidden", !(state.settings.lock && state.settings.lockHash));
}

// ---------- rendering: note tabs ----------

// Tabs keep a stable order (pinned first, then oldest to newest) so they don't jump while typing.
function tabNotes(){
	return state.notes
		.filter((n) => inFolder(n, state.folder))
		.sort((a, b) => (Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))) || a.created - b.created);
}

function renderTabs(){
	const strip = $("tabstrip");
	const scroll = strip.scrollLeft;
	strip.textContent = "";
	tabNotes().forEach((note) => {
		const title = meta(note).title || t("newNote", "New Note");
		const tab = document.createElement("div");
		tab.className = "note-tab" + (note.id === state.noteId ? " active" : "");
		tab.dataset.id = note.id;
		tab.title = title;
		tab.setAttribute("role", "tab");
		tab.setAttribute("aria-selected", String(note.id === state.noteId));
		tab.innerHTML = (note.pinned ? "<span class='tab-pin'>" + icon("pin") + "</span>" : "") +
			"<span class='tab-title'></span><span class='tab-close' role='button'>" + icon("xmark") + "</span>";
		tab.querySelector(".tab-title").textContent = title;
		const close = tab.querySelector(".tab-close");
		close.title = note.deleted ? t("deletePermanently", "Delete Permanently") : t("closeTab", "Delete Note");
		tab.addEventListener("click", (e) => {
			if(e.target.closest(".tab-close")){ deleteNote(note); }else if(note.id !== state.noteId){ openNote(note.id); }
		});
		tab.addEventListener("auxclick", (e) => { if(e.button === 1){ e.preventDefault(); deleteNote(note); } });
		tab.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			showMenu({x: e.clientX, y: e.clientY}, noteMenuItems(note, false));
		});
		strip.appendChild(tab);
	});
	strip.scrollLeft = scroll;
}

function scrollActiveTabIntoView(){
	const tab = $("tabstrip").querySelector(".note-tab.active");
	if(tab){ tab.scrollIntoView({block: "nearest", inline: "nearest"}); }
}

// ---------- editor ----------

function showEditorFor(note){
	const has = Boolean(note);
	editor.classList.toggle("hidden", !has);
	$("note-date").classList.toggle("hidden", !has);
	$("editor-empty").classList.toggle("hidden", has);
	["btn-checklist", "btn-format", "btn-note-more"].forEach((id) => { $(id).disabled = !has || Boolean(note && note.deleted); });
	$("btn-note-more").disabled = !has;
	$("trash-banner").classList.toggle("hidden", !(note && note.deleted));
	$("quota-banner").classList.add("hidden");
	if(!has){
		editor.innerHTML = "";
		$("word-count").textContent = "";
		return;
	}
	editor.innerHTML = note.html || "";
	editor.contentEditable = note.deleted ? "false" : "true";
	updateDateLine(note);
	updateWordCount();
	if(!$("findbar").classList.contains("hidden")){ runFind(); }
}

function updateDateLine(note){
	$("note-date").textContent = longDate(note.modified);
}

function updateWordCount(){
	if(!state.settings.showWordCount){
		$("word-count").textContent = "";
		return;
	}
	const text = editor.innerText || "";
	const words = (text.match(/\S+/g) || []).length;
	const chars = text.replace(/\n/g, "").length;
	$("word-count").textContent = (words === 1 ? t("oneWord", "1 word") : t("countWords", "$1 words", [words])) + " · " + t("countChars", "$1 characters", [chars]);
}

// Leave the open note: save it, and drop it if it was left empty.
function closeCurrentNote(){
	const note = currentNote();
	flushSave();
	if(note && !note.deleted && isEmptyNote(note)){
		state.notes = state.notes.filter((n) => n.id !== note.id);
		if(!note.fresh){ removeNote(note.id); }
	}
	state.noteId = null;
	hideFind();
}

function openNote(id, opts){
	opts = opts || {};
	if(state.noteId && state.noteId !== id){ closeCurrentNote(); }
	const note = state.notes.find((n) => n.id === id);
	if(!note){ return; }
	state.noteId = id;
	try{ localStorage.setItem("en_note", id); }catch(e){ /* storage blocked */ }
	showEditorFor(note);
	go(2);
	updateWordCount();
	renderTabs();
	scrollActiveTabIntoView();
	document.querySelectorAll(".note-row").forEach((r) => r.classList.toggle("active", r.dataset.id === id));
	$("editor-scroll").scrollTop = 0;
	if(!note.deleted){
		setTimeout(() => {
			editor.focus();
			if(opts.caretEnd !== false){ placeCaretAtEnd(); }
		}, 60);
	}
	const q = state.query.trim();
	if(q && opts.fromSearch){
		showFind(q);
	}
}

function createNote(){
	if(state.folder === TRASH){ openFolder(ALL); }
	const folderId = state.folder !== ALL && state.folder !== TRASH ? state.folder : null;
	const note = newNote("<div><br></div>", folderId);
	note.fresh = true;
	state.notes.push(note);
	state.query = "";
	$("search").value = "";
	openNote(note.id, {fresh: true});
	renderList();
}

function placeCaretAtEnd(){
	const range = document.createRange();
	range.selectNodeContents(editor);
	range.collapse(false);
	const sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

function onEditorInput(){
	const note = currentNote();
	if(!note || note.deleted){ return; }
	normalizeEditor();
	note.html = editor.innerHTML;
	note.modified = Date.now();
	updateDateLine(note);
	updateWordCount();
	scheduleSave(note);
	scheduleListRender();
	if(!$("findbar").classList.contains("hidden")){ runFind(true); }
}

// Keep every line inside a block element so the first line can be styled as the title.
function normalizeEditor(){
	const first = editor.firstChild;
	if(first && first.nodeType === Node.TEXT_NODE){
		const sel = window.getSelection();
		const offset = sel.rangeCount && sel.anchorNode === first ? sel.anchorOffset : first.length;
		const div = document.createElement("div");
		editor.insertBefore(div, first);
		div.appendChild(first);
		while(div.nextSibling && (div.nextSibling.nodeType === Node.TEXT_NODE || /^(B|I|U|S|SPAN|A|STRONG|EM)$/.test(div.nextSibling.nodeName))){
			div.appendChild(div.nextSibling);
		}
		const range = document.createRange();
		range.setStart(first, Math.min(offset, first.length));
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

function scheduleSave(note){
	pendingNote = note;
	clearTimeout(saveTimer);
	saveTimer = setTimeout(flushSave, state.settings.storage === "sync" ? 1200 : 400);
}

function flushSave(){
	clearTimeout(saveTimer);
	saveTimer = null;
	const note = pendingNote;
	pendingNote = null;
	if(!note){ return; }
	if(note.fresh && isEmptyNote(note)){ return; }
	persist(note);
}

async function persist(note){
	const copy = Object.assign({}, note);
	delete copy.fresh;
	const result = await saveNote(copy);
	if(result.ok){ delete note.fresh; }
	if(!result.ok){ toast(t("notSaved", "Could not save the note")); }
	if(note.id === state.noteId){
		const banner = $("quota-banner");
		if(result.tooBig){
			banner.textContent = t("quotaWarning", "This note is too large to sync (limit 8 KB). Switch to Local storage in Settings to keep it safe.");
			banner.classList.remove("hidden");
		}else{
			banner.classList.add("hidden");
		}
	}
}

async function updateNote(note, patch, keepModified){
	Object.assign(note, patch);
	if(!keepModified){ note.modified = Date.now(); }
	if(note.id === state.noteId && pendingNote === note){ flushSave(); }else{ await persist(note); }
	scheduleListRender();
}

// ---------- selection helpers ----------

function selectionElement(){
	const sel = window.getSelection();
	if(!sel.rangeCount){ return null; }
	let node = sel.anchorNode;
	if(!node || !editor.contains(node)){ return null; }
	if(node.nodeType === Node.TEXT_NODE){ node = node.parentNode; }
	return node;
}

function closestInEditor(selector){
	const el = selectionElement();
	if(!el){ return null; }
	const found = el.closest(selector);
	return found && editor.contains(found) && found !== editor ? found : null;
}

function ensureFocus(){
	if(document.activeElement !== editor){
		editor.focus();
		if(!selectionElement()){ placeCaretAtEnd(); }
	}
}

function currentStyle(){
	const block = closestInEditor("h1, h2, h3, pre");
	if(!block){ return "body"; }
	return {H1: "title", H2: "heading", H3: "subheading", PRE: "mono"}[block.nodeName];
}

function setBlockStyle(style){
	ensureFocus();
	const tag = {title: "h1", heading: "h2", subheading: "h3", body: "div", mono: "pre"}[style];
	document.execCommand("formatBlock", false, tag);
	onEditorInput();
}

function listKind(list){
	if(!list){ return null; }
	if(list.nodeName === "OL"){ return "numbered"; }
	if(list.classList.contains("checklist")){ return "checklist"; }
	if(list.classList.contains("dashed")){ return "dashed"; }
	return "bullet";
}

function setListType(type){
	ensureFocus();
	const list = closestInEditor("ul, ol");
	const kind = listKind(list);
	if(kind === type){
		document.execCommand(type === "numbered" ? "insertOrderedList" : "insertUnorderedList");
	}else if(list && type !== "numbered" && kind !== "numbered"){
		list.className = type === "bullet" ? "" : type;
		if(type !== "checklist"){ list.querySelectorAll("li.checked").forEach((li) => li.classList.remove("checked")); }
		if(!list.className){ list.removeAttribute("class"); }
	}else{
		document.execCommand(type === "numbered" ? "insertOrderedList" : "insertUnorderedList");
		const created = closestInEditor("ul, ol");
		if(created && created.nodeName === "UL" && type !== "bullet"){ created.className = type; }
	}
	onEditorInput();
}

function toggleQuote(){
	ensureFocus();
	document.execCommand("formatBlock", false, closestInEditor("blockquote") ? "div" : "blockquote");
	onEditorInput();
}

function insertText(text){
	ensureFocus();
	document.execCommand("insertText", false, text);
}

// ---------- paste ----------

const ALLOWED_TAGS = new Set(["B", "STRONG", "I", "EM", "U", "S", "STRIKE", "DEL", "A", "BR", "DIV", "P", "H1", "H2", "H3", "UL", "OL", "LI", "PRE", "CODE", "BLOCKQUOTE", "IMG", "HR", "SPAN"]);
const DROP_TAGS = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "META", "LINK", "TITLE", "SVG", "CANVAS", "VIDEO", "AUDIO", "FORM", "INPUT", "BUTTON", "SELECT", "TEXTAREA", "NOSCRIPT", "TEMPLATE"]);
const BLOCK_TAGS = new Set(["SECTION", "ARTICLE", "HEADER", "FOOTER", "MAIN", "ASIDE", "NAV", "TR", "TABLE", "TBODY", "THEAD", "FIGURE", "FIGCAPTION", "H4", "H5", "H6", "DT", "DD", "DL", "ADDRESS"]);

function sanitizeHtml(html){
	const doc = new DOMParser().parseFromString(html, "text/html");
	const walk = (node) => {
		[...node.childNodes].forEach((child) => {
			if(child.nodeType === Node.COMMENT_NODE){ child.remove(); return; }
			if(child.nodeType !== Node.ELEMENT_NODE){ return; }
			const tag = child.nodeName;
			if(DROP_TAGS.has(tag)){ child.remove(); return; }
			walk(child);
			if(!ALLOWED_TAGS.has(tag)){
				if(BLOCK_TAGS.has(tag)){
					const div = doc.createElement("div");
					while(child.firstChild){ div.appendChild(child.firstChild); }
					child.replaceWith(div);
				}else{
					child.replaceWith(...child.childNodes);
				}
				return;
			}
			const keep = {};
			if(tag === "A"){
				const href = child.getAttribute("href") || "";
				if(/^(https?:|mailto:)/i.test(href)){ keep.href = href; }
			}
			if(tag === "IMG"){
				const src = child.getAttribute("src") || "";
				if(/^(https?:|data:image\/)/i.test(src)){ keep.src = src; }else{ child.remove(); return; }
				if(child.getAttribute("alt")){ keep.alt = child.getAttribute("alt"); }
			}
			if(tag === "UL" && /\b(checklist|dashed)\b/.test(child.className)){ keep.class = child.className.match(/\b(checklist|dashed)\b/)[0]; }
			if(tag === "LI" && child.classList.contains("checked")){ keep.class = "checked"; }
			[...child.attributes].forEach((attr) => child.removeAttribute(attr.name));
			Object.keys(keep).forEach((k) => child.setAttribute(k, keep[k]));
			if(tag === "SPAN"){ child.replaceWith(...child.childNodes); }
		});
	};
	walk(doc.body);
	return doc.body.innerHTML;
}

function onPaste(e){
	const data = e.clipboardData;
	if(!data){ return; }
	const image = [...data.items].find((item) => item.kind === "file" && item.type.startsWith("image/"));
	if(image){
		e.preventDefault();
		if(state.settings.storage === "sync"){
			toast(t("imagesNeedLocal", "Images can only be saved with Local storage (see Settings)."));
			return;
		}
		const reader = new FileReader();
		reader.onload = () => document.execCommand("insertHTML", false, "<img src=\"" + reader.result + "\">");
		reader.readAsDataURL(image.getAsFile());
		return;
	}
	const html = data.getData("text/html");
	e.preventDefault();
	if(html){
		document.execCommand("insertHTML", false, sanitizeHtml(html));
	}else{
		document.execCommand("insertText", false, data.getData("text/plain"));
	}
}

// ---------- checklist & links ----------

function onEditorMouseDown(e){
	const li = e.target.closest && e.target.closest("ul.checklist > li");
	if(!li || !editor.contains(li) || editor.contentEditable !== "true"){ return; }
	const rect = li.getBoundingClientRect();
	const size = parseFloat(getComputedStyle(li).fontSize) || 15;
	if(e.clientX - rect.left <= size * 1.5){
		e.preventDefault();
		li.classList.toggle("checked");
		onEditorInput();
	}
}

function onEditorClick(e){
	const a = e.target.closest && e.target.closest("a[href]");
	if(a && (e.ctrlKey || e.metaKey || editor.contentEditable !== "true")){
		e.preventDefault();
		chrome.tabs.create({url: a.href});
	}
}

function onEditorKeyDown(e){
	if(e.key === "Tab"){
		e.preventDefault();
		if(closestInEditor("li")){
			document.execCommand(e.shiftKey ? "outdent" : "indent");
		}else if(!e.shiftKey){
			document.execCommand("insertText", false, "\t");
		}
		return;
	}
	const mod = e.ctrlKey || e.metaKey;
	if(mod && e.shiftKey && e.code === "KeyL"){ e.preventDefault(); setListType("checklist"); return; }
	if(mod && e.shiftKey && e.code === "KeyX"){ e.preventDefault(); document.execCommand("strikeThrough"); return; }
	if(mod && e.altKey){
		const style = {Digit1: "title", Digit2: "heading", Digit3: "subheading", Digit0: "body"}[e.code];
		if(style){ e.preventDefault(); setBlockStyle(style); }
	}
}

function onBeforeInput(e){
	if(e.inputType === "insertParagraph"){
		// a new checklist item should start unchecked
		requestAnimationFrame(() => {
			const li = closestInEditor("ul.checklist > li");
			if(li && li.classList.contains("checked") && !li.textContent.trim()){
				li.classList.remove("checked");
				onEditorInput();
			}
		});
	}
}

// ---------- find in note ----------

let findRanges = [];
let findIndex = 0;

function showFind(value){
	$("findbar").classList.remove("hidden");
	const input = $("find-input");
	if(typeof value === "string"){ input.value = value; }
	input.focus();
	input.select();
	runFind();
}

function hideFind(){
	$("findbar").classList.add("hidden");
	findRanges = [];
	if(window.CSS && CSS.highlights){
		CSS.highlights.delete("en-find");
		CSS.highlights.delete("en-find-current");
	}
	$("find-count").textContent = "";
}

function runFind(keepIndex){
	const q = $("find-input").value.toLowerCase();
	findRanges = [];
	if(q){
		const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
		let node;
		while((node = walker.nextNode())){
			const text = node.nodeValue.toLowerCase();
			let i = text.indexOf(q);
			while(i >= 0){
				const range = new Range();
				range.setStart(node, i);
				range.setEnd(node, i + q.length);
				findRanges.push(range);
				i = text.indexOf(q, i + q.length);
			}
		}
	}
	if(!keepIndex){ findIndex = 0; }
	findIndex = Math.min(findIndex, Math.max(0, findRanges.length - 1));
	paintFind(!keepIndex);
}

function paintFind(scroll){
	if(!(window.CSS && CSS.highlights)){ return; }
	CSS.highlights.set("en-find", new Highlight(...findRanges));
	const current = findRanges[findIndex];
	if(current){
		CSS.highlights.set("en-find-current", new Highlight(current));
		$("find-count").textContent = t("findCount", "$1 of $2", [findIndex + 1, findRanges.length]);
		if(scroll){
			const box = $("editor-scroll");
			const r = current.getBoundingClientRect();
			const b = box.getBoundingClientRect();
			if(r.top < b.top + 20 || r.bottom > b.bottom - 20){
				box.scrollTop += r.top - b.top - b.height / 3;
			}
		}
	}else{
		CSS.highlights.delete("en-find-current");
		$("find-count").textContent = $("find-input").value ? t("noMatches", "0") : "";
	}
}

function stepFind(dir){
	if(!findRanges.length){ return; }
	findIndex = (findIndex + dir + findRanges.length) % findRanges.length;
	paintFind(true);
}

// ---------- export, copy, speech ----------

function noteFileName(note){
	const title = meta(note).title || t("newNote", "New Note");
	return title.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 60) || "note";
}

function download(name, content, type){
	const blob = new Blob([content], {type: type + ";charset=utf-8"});
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Plain text with checklist boxes, using the browser's own line breaking.
function noteToText(note){
	const box = document.createElement("div");
	box.style.cssText = "position:fixed;left:-10000px;top:0;white-space:pre-wrap;width:600px";
	box.innerHTML = note.html || "";
	box.querySelectorAll("ul.checklist > li").forEach((li) => li.prepend(li.classList.contains("checked") ? "☑ " : "☐ "));
	box.querySelectorAll("ul:not(.checklist) > li").forEach((li) => li.prepend("• "));
	box.querySelectorAll("ol").forEach((ol) => [...ol.children].forEach((li, i) => li.prepend((i + 1) + ". ")));
	document.body.appendChild(box);
	const text = box.innerText;
	box.remove();
	return text.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function noteToMarkdown(note){
	const doc = new DOMParser().parseFromString("<div>" + (note.html || "") + "</div>", "text/html");
	const inline = (node) => [...node.childNodes].map((n) => {
		if(n.nodeType === Node.TEXT_NODE){ return n.nodeValue.replace(/([*_`[\]])/g, "\\$1"); }
		if(n.nodeType !== Node.ELEMENT_NODE){ return ""; }
		const inner = inline(n);
		switch(n.nodeName){
		case "B": case "STRONG": return inner.trim() ? "**" + inner + "**" : inner;
		case "I": case "EM": return inner.trim() ? "_" + inner + "_" : inner;
		case "S": case "STRIKE": case "DEL": return inner.trim() ? "~~" + inner + "~~" : inner;
		case "CODE": return "`" + n.textContent + "`";
		case "A": return "[" + inner + "](" + n.getAttribute("href") + ")";
		case "IMG": return "![" + (n.getAttribute("alt") || "") + "](" + (n.getAttribute("src") || "").slice(0, 2000) + ")";
		case "BR": return "\n";
		default: return isBlock(n) ? "\n" + blockOf(n) + "\n" : inner;
		}
	}).join("");
	const isBlock = (n) => /^(DIV|P|H1|H2|H3|UL|OL|PRE|BLOCKQUOTE|HR)$/.test(n.nodeName);
	const blockOf = (n) => {
		const holder = doc.createElement("div");
		holder.appendChild(n.cloneNode(true));
		return block(holder, 0).join("\n");
	};
	const block = (node, depth) => {
		const out = [];
		let buffer = "";
		const flush = () => { if(buffer){ out.push(buffer); buffer = ""; } };
		[...node.childNodes].forEach((n) => {
			if(n.nodeType === Node.ELEMENT_NODE && isBlock(n)){
				flush();
				const pad = "  ".repeat(depth);
				switch(n.nodeName){
				case "H1": out.push("# " + inline(n).trim()); break;
				case "H2": out.push("## " + inline(n).trim()); break;
				case "H3": out.push("### " + inline(n).trim()); break;
				case "PRE": out.push("```\n" + n.textContent + "\n```"); break;
				case "HR": out.push("---"); break;
				case "BLOCKQUOTE": out.push(...block(n, depth).map((l) => "> " + l)); break;
				case "UL": case "OL":
					[...n.children].forEach((li, i) => {
						const marker = n.nodeName === "OL" ? (i + 1) + "." : n.classList.contains("checklist") ? (li.classList.contains("checked") ? "- [x]" : "- [ ]") : "-";
						const nested = [...li.children].filter((c) => c.nodeName === "UL" || c.nodeName === "OL");
						const clone = li.cloneNode(true);
						[...clone.children].filter((c) => c.nodeName === "UL" || c.nodeName === "OL").forEach((c) => c.remove());
						out.push(pad + marker + " " + inline(clone).trim());
						nested.forEach((sub) => {
							const holder = doc.createElement("div");
							holder.appendChild(sub.cloneNode(true));
							out.push(...block(holder, depth + 1));
						});
					});
					break;
				default: {
					if([...n.children].some(isBlock)){
						out.push(...block(n, depth));
						break;
					}
					const text = inline(n).replace(/\n+$/, "");
					out.push(text.trim() ? text : "");
				}
				}
			}else{
				buffer += n.nodeType === Node.ELEMENT_NODE ? inline({childNodes: [n]}) : inline({childNodes: [n]});
			}
		});
		flush();
		return out;
	};
	const lines = block(doc.body.firstChild, 0);
	if(lines.length && lines[0] && !lines[0].startsWith("#")){ lines[0] = "# " + lines[0]; }
	return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function noteToHtmlDocument(note){
	const title = escapeHtml(meta(note).title || t("newNote", "New Note"));
	return "<!DOCTYPE html>\n<html><head><meta charset=\"utf-8\"><title>" + title + "</title>" +
		"<style>body{font:16px/1.5 -apple-system,'Segoe UI',sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#1d1d1f}" +
		"body>div:first-child{font-size:1.6em;font-weight:700}ul.checklist{list-style:none;padding-left:0}" +
		"ul.checklist li::before{content:'\\25CB  '}ul.checklist li.checked::before{content:'\\25C9  '}ul.checklist li.checked{text-decoration:line-through;color:#888}" +
		"ul.dashed{list-style-type:'–  '}blockquote{border-left:3px solid #e0a100;margin:0;padding-left:12px;color:#555}img{max-width:100%}</style>" +
		"</head><body>" + (note.html || "") + "</body></html>\n";
}

async function copyNote(note){
	const text = noteToText(note);
	try{
		await navigator.clipboard.write([new ClipboardItem({
			"text/plain": new Blob([text], {type: "text/plain"}),
			"text/html": new Blob([note.html || ""], {type: "text/html"})
		})]);
	}catch(e){
		await navigator.clipboard.writeText(text);
	}
	toast(t("copied", "Copied to clipboard"));
}

function speak(note){
	stopSpeaking();
	const utterance = new SpeechSynthesisUtterance(noteToText(note));
	const voice = speechSynthesis.getVoices().find((v) => v.name === state.settings.speechVoice);
	if(voice){ utterance.voice = voice; }
	utterance.rate = Number(state.settings.speechRate) || 1;
	utterance.onend = utterance.onerror = () => setSpeaking(false);
	setSpeaking(true);
	speechSynthesis.speak(utterance);
}

function stopSpeaking(){
	if(state.speaking){ speechSynthesis.cancel(); }
	setSpeaking(false);
}

function setSpeaking(on){
	state.speaking = on;
	$("btn-speak-stop").classList.toggle("hidden", !on);
}

// ---------- menus ----------

function closePopover(){
	const layer = $("popover-layer");
	layer.textContent = "";
	layer.classList.add("hidden");
	document.querySelectorAll(".icon-btn.on").forEach((b) => b.classList.remove("on"));
}

function placePopover(pop, anchor){
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const w = pop.offsetWidth;
	const h = pop.offsetHeight;
	let x;
	let y;
	if(anchor instanceof Element){
		const r = anchor.getBoundingClientRect();
		x = r.right - w;
		y = r.bottom + 4;
		if(y + h > vh - 8){ y = Math.max(8, r.top - h - 4); }
	}else{
		x = anchor.x;
		y = anchor.y;
		if(y + h > vh - 8){ y = Math.max(8, y - h); }
	}
	pop.style.left = Math.max(8, Math.min(x, vw - w - 8)) + "px";
	pop.style.top = Math.max(8, Math.min(y, vh - h - 8)) + "px";
}

function openPopover(anchor, build, cls){
	closePopover();
	const layer = $("popover-layer");
	const pop = document.createElement("div");
	pop.className = "popover " + (cls || "");
	build(pop);
	layer.appendChild(pop);
	layer.classList.remove("hidden");
	if(anchor instanceof Element){ anchor.classList.add("on"); }
	placePopover(pop, anchor);
	return pop;
}

function showMenu(anchor, items){
	openPopover(anchor, (pop) => {
		pop.setAttribute("role", "menu");
		items.filter(Boolean).forEach((item) => {
			if(item === "-"){
				const sep = document.createElement("div");
				sep.className = "menu-sep";
				pop.appendChild(sep);
				return;
			}
			if(item.header){
				const h = document.createElement("div");
				h.className = "menu-header";
				h.textContent = item.header;
				pop.appendChild(h);
				return;
			}
			const btn = document.createElement("button");
			btn.className = "menu-item" + (item.danger ? " danger" : "");
			btn.setAttribute("role", "menuitem");
			btn.disabled = Boolean(item.disabled);
			btn.innerHTML = "<span class='mi-icon'>" + (item.checked ? icon("check") : item.icon ? icon(item.icon) : "") + "</span><span class='mi-label'></span>" + (item.hint ? "<span class='mi-hint'></span>" : "");
			btn.querySelector(".mi-label").textContent = item.label;
			if(item.hint){ btn.querySelector(".mi-hint").textContent = item.hint; }
			btn.addEventListener("click", () => { closePopover(); item.action(); });
			pop.appendChild(btn);
		});
	});
	const first = $("popover-layer").querySelector(".menu-item:not(:disabled)");
	if(first && !(anchor instanceof Element)){ first.focus(); }
}

function noteMenuItems(note, inEditor){
	if(note.deleted){
		return [
			{label: t("recover", "Recover"), icon: "recover", action: () => recoverNote(note)},
			"-",
			{label: t("deletePermanently", "Delete Permanently"), icon: "trash", danger: true, action: () => deleteNote(note)}
		];
	}
	return [
		{label: note.pinned ? t("unpinNote", "Unpin Note") : t("pinNote", "Pin Note"), icon: note.pinned ? "unpin" : "pin", action: () => updateNote(note, {pinned: !note.pinned}, true)},
		{label: t("moveToFolder", "Move to Folder…"), icon: "move", action: () => moveNote(note)},
		{label: t("duplicate", "Duplicate"), icon: "duplicate", action: () => duplicateNote(note)},
		inEditor && "-",
		inEditor && {label: t("findInNote", "Find in Note"), icon: "find", hint: "Ctrl+F", action: () => showFind()},
		inEditor && {label: t("insertDate", "Insert Date & Time"), icon: "clock", action: () => insertText(longDate(Date.now()))},
		"-",
		{label: t("copyNote", "Copy Note"), icon: "copy", action: () => copyNote(note)},
		inEditor && {label: state.speaking ? t("stopReading", "Stop Reading") : t("readAloud", "Read Aloud"), icon: "speaker", action: () => (state.speaking ? stopSpeaking() : speak(note))},
		{header: t("export", "Export")},
		{label: t("exportTxt", "Plain Text (.txt)"), icon: "export", action: () => download(noteFileName(note) + ".txt", noteToText(note), "text/plain")},
		{label: t("exportMd", "Markdown (.md)"), icon: "export", action: () => download(noteFileName(note) + ".md", noteToMarkdown(note), "text/markdown")},
		{label: t("exportHtml", "Web Page (.html)"), icon: "export", action: () => download(noteFileName(note) + ".html", noteToHtmlDocument(note), "text/html")},
		inEditor && {label: t("print", "Print"), icon: "print", hint: "Ctrl+P", action: () => window.print()},
		"-",
		{label: t("deleteNote", "Delete Note"), icon: "trash", danger: true, action: () => deleteNote(note)}
	];
}

function folderMenuItems(id){
	return [
		{label: t("renameFolder", "Rename Folder…"), icon: "pencil", action: () => renameFolder(id)},
		{label: t("deleteFolder", "Delete Folder"), icon: "trash", danger: true, action: () => deleteFolder(id)}
	];
}

function listMenuItems(){
	const s = state.settings;
	const isUserFolder = state.folder !== ALL && state.folder !== TRASH;
	return [
		{header: t("sortBy", "Sort By")},
		{label: t("sortModified", "Date Edited"), checked: s.sortBy === "modified", action: () => changeSetting({sortBy: "modified"})},
		{label: t("sortCreated", "Date Created"), checked: s.sortBy === "created", action: () => changeSetting({sortBy: "created"})},
		{label: t("sortTitle", "Title"), checked: s.sortBy === "title", action: () => changeSetting({sortBy: "title"})},
		"-",
		{label: t("groupByDate", "Group by Date"), checked: s.groupByDate, disabled: s.sortBy === "title", action: () => changeSetting({groupByDate: !s.groupByDate})},
		isUserFolder && "-",
		isUserFolder && {label: t("renameFolder", "Rename Folder…"), icon: "pencil", action: () => renameFolder(state.folder)},
		isUserFolder && {label: t("deleteFolder", "Delete Folder"), icon: "trash", danger: true, action: () => deleteFolder(state.folder)},
		state.folder === TRASH && "-",
		state.folder === TRASH && {label: t("emptyTrash", "Delete All"), icon: "trash", danger: true, disabled: !folderCount(TRASH), action: emptyTrash},
		"-",
		{label: t("settings", "Settings"), icon: "gear", action: () => chrome.runtime.openOptionsPage()}
	];
}

function showFormatPopover(anchor){
	ensureFocus();
	const style = currentStyle();
	const list = listKind(closestInEditor("ul, ol"));
	openPopover(anchor, (pop) => {
		const styles = document.createElement("div");
		styles.className = "style-list";
		[
			["title", t("styleTitle", "Title"), "Ctrl+Alt+1"],
			["heading", t("styleHeading", "Heading"), "Ctrl+Alt+2"],
			["subheading", t("styleSubheading", "Subheading"), "Ctrl+Alt+3"],
			["body", t("styleBody", "Body"), "Ctrl+Alt+0"],
			["mono", t("styleMono", "Monostyled"), ""]
		].forEach(([key, label, hint]) => {
			const b = document.createElement("button");
			b.className = "style-btn" + (style === key ? " on" : "");
			b.dataset.style = key;
			b.innerHTML = "<span></span><span class='mi-hint'></span>";
			b.firstChild.textContent = label;
			b.lastChild.textContent = hint;
			b.addEventListener("click", () => { setBlockStyle(key); closePopover(); });
			styles.appendChild(b);
		});
		pop.appendChild(styles);

		const seg = (buttons) => {
			const row = document.createElement("div");
			row.className = "seg";
			buttons.forEach(([html, title, on, action]) => {
				const b = document.createElement("button");
				b.innerHTML = html;
				b.title = title;
				b.setAttribute("aria-label", title);
				b.classList.toggle("on", on);
				b.addEventListener("click", () => {
					action();
					b.classList.toggle("on", !b.classList.contains("on"));
				});
				row.appendChild(b);
			});
			pop.appendChild(row);
		};
		const cmd = (name) => () => { ensureFocus(); document.execCommand(name); onEditorInput(); };
		seg([
			["<b>B</b>", t("bold", "Bold") + " (Ctrl+B)", document.queryCommandState("bold"), cmd("bold")],
			["<i>I</i>", t("italic", "Italic") + " (Ctrl+I)", document.queryCommandState("italic"), cmd("italic")],
			["<u>U</u>", t("underline", "Underline") + " (Ctrl+U)", document.queryCommandState("underline"), cmd("underline")],
			["<s>S</s>", t("strikethrough", "Strikethrough") + " (Ctrl+Shift+X)", document.queryCommandState("strikeThrough"), cmd("strikeThrough")]
		]);
		const listAction = (type) => () => { setListType(type); closePopover(); };
		seg([
			[icon("bullet"), t("bulletedList", "Bulleted List"), list === "bullet", listAction("bullet")],
			[icon("dashed"), t("dashedList", "Dashed List"), list === "dashed", listAction("dashed")],
			[icon("numbered"), t("numberedList", "Numbered List"), list === "numbered", listAction("numbered")],
			[icon("quote"), t("blockQuote", "Block Quote"), Boolean(closestInEditor("blockquote")), () => { toggleQuote(); closePopover(); }]
		]);
	}, "format-pop");
}

// ---------- sheets (dialogs) ----------

function openSheet(build){
	return new Promise((resolve) => {
		const layer = $("sheet-layer");
		layer.textContent = "";
		const sheet = document.createElement("div");
		sheet.className = "sheet";
		sheet.setAttribute("role", "dialog");
		layer.appendChild(sheet);
		layer.classList.remove("hidden");
		const close = (value) => {
			layer.classList.add("hidden");
			layer.textContent = "";
			document.removeEventListener("keydown", onKey, true);
			resolve(value);
		};
		const onKey = (e) => { if(e.key === "Escape"){ e.stopPropagation(); close(null); } };
		document.addEventListener("keydown", onKey, true);
		layer.onmousedown = (e) => { if(e.target === layer){ close(null); } };
		build(sheet, close);
	});
}

function sheetButtons(sheet, buttons){
	const row = document.createElement("div");
	row.className = "sheet-actions";
	buttons.forEach(([label, cls, onClick]) => {
		const b = document.createElement("button");
		b.textContent = label;
		if(cls){ b.className = cls; }
		b.addEventListener("click", onClick);
		row.appendChild(b);
	});
	sheet.appendChild(row);
	return row;
}

function sheetHeading(sheet, title, message){
	const h = document.createElement("h3");
	h.textContent = title;
	sheet.appendChild(h);
	if(message){
		const p = document.createElement("p");
		p.textContent = message;
		sheet.appendChild(p);
	}
}

function askConfirm(title, message, okLabel, danger){
	return openSheet((sheet, close) => {
		sheetHeading(sheet, title, message);
		const row = sheetButtons(sheet, [
			[t("cancel", "Cancel"), "", () => close(false)],
			[okLabel, danger ? "danger" : "primary", () => close(true)]
		]);
		row.lastChild.focus();
	}).then(Boolean);
}

function askText(title, value, okLabel){
	return openSheet((sheet, close) => {
		sheetHeading(sheet, title);
		const input = document.createElement("input");
		input.type = "text";
		input.value = value || "";
		input.maxLength = 60;
		sheet.appendChild(input);
		const submit = () => close(input.value.trim() || null);
		input.addEventListener("keydown", (e) => { if(e.key === "Enter"){ submit(); } });
		sheetButtons(sheet, [
			[t("cancel", "Cancel"), "", () => close(null)],
			[okLabel, "primary", submit]
		]);
		setTimeout(() => { input.focus(); input.select(); }, 30);
	});
}

function pickFolder(note){
	return openSheet((sheet, close) => {
		sheetHeading(sheet, t("moveToFolder", "Move to Folder…"));
		const list = document.createElement("div");
		list.className = "sheet-list";
		const options = [{id: null, name: t("noFolder", "No Folder (All Notes)")}].concat([...state.folders].sort((a, b) => a.name.localeCompare(b.name)));
		options.forEach((f) => {
			const row = document.createElement("button");
			row.className = "folder-row";
			row.innerHTML = "<span class='folder-icon'>" + icon(f.id ? "folder" : "folder") + "</span><span class='folder-name'></span>" + (note.folderId === f.id ? "<span class='folder-icon'>" + icon("check") + "</span>" : "");
			row.querySelector(".folder-name").textContent = f.name;
			row.addEventListener("click", () => close({id: f.id}));
			list.appendChild(row);
		});
		sheet.appendChild(list);
		sheetButtons(sheet, [
			[t("newFolder", "New Folder"), "", async() => {
				close(null);
				const id = await createFolder();
				if(id){ updateNote(note, {folderId: id}, true); }
			}],
			[t("cancel", "Cancel"), "", () => close(null)]
		]);
	});
}

// ---------- actions ----------

async function deleteNote(note){
	const tabIndex = tabNotes().findIndex((n) => n.id === note.id);
	if(note.deleted){
		const ok = await askConfirm(t("deleteForeverTitle", "Delete this note permanently?"), t("cannotUndo", "You can't undo this action."), t("delete", "Delete"), true);
		if(!ok){ return; }
		state.notes = state.notes.filter((n) => n.id !== note.id);
		await removeNote(note.id);
	}else{
		if(note.id === state.noteId){ flushSave(); }
		if(isEmptyNote(note)){
			state.notes = state.notes.filter((n) => n.id !== note.id);
			if(!note.fresh){ await removeNote(note.id); }
		}else{
			await updateNote(note, {deleted: Date.now(), pinned: false}, true);
			toast(t("movedToTrash", "Moved to Recently Deleted"));
		}
	}
	if(note.id === state.noteId){
		// like closing a tab: move on to the neighbouring note
		state.noteId = null;
		hideFind();
		const tabs = tabNotes();
		const next = tabs[Math.min(Math.max(tabIndex, 0), tabs.length - 1)];
		if(next && state.level === 2){ openNote(next.id, {caretEnd: true}); }else{ showEditorFor(null); }
	}
	scheduleListRender();
}

async function recoverNote(note){
	await updateNote(note, {deleted: null}, true);
	if(note.folderId && !state.folders.some((f) => f.id === note.folderId)){ note.folderId = null; }
	if(note.id === state.noteId){ showEditorFor(note); }
	toast(t("recovered", "Note recovered"));
}

async function duplicateNote(note){
	if(note.id === state.noteId){ flushSave(); }
	const copy = newNote(note.html, note.folderId);
	state.notes.push(copy);
	await persist(copy);
	openNote(copy.id);
	scheduleListRender();
}

async function moveNote(note){
	const choice = await pickFolder(note);
	if(choice){
		await updateNote(note, {folderId: choice.id}, true);
		toast(t("movedTo", "Moved to $1", [choice.id ? folderName(choice.id) : t("allNotes", "All Notes")]));
	}
}

async function emptyTrash(){
	const ok = await askConfirm(t("emptyTrashTitle", "Delete all notes in Recently Deleted?"), t("cannotUndo", "You can't undo this action."), t("deleteAll", "Delete All"), true);
	if(!ok){ return; }
	const trashed = state.notes.filter((n) => n.deleted);
	state.notes = state.notes.filter((n) => !n.deleted);
	for(const n of trashed){ await removeNote(n.id); }
	if(trashed.some((n) => n.id === state.noteId)){ state.noteId = null; showEditorFor(null); }
	scheduleListRender();
}

async function createFolder(){
	const name = await askText(t("newFolder", "New Folder"), "", t("create", "Create"));
	if(!name){ return null; }
	const folder = {id: uid(), name};
	state.folders.push(folder);
	await saveFolders(state.folders);
	renderFolders();
	return folder.id;
}

async function renameFolder(id){
	const folder = state.folders.find((f) => f.id === id);
	if(!folder){ return; }
	const name = await askText(t("renameFolder", "Rename Folder…").replace("…", ""), folder.name, t("rename", "Rename"));
	if(!name){ return; }
	folder.name = name;
	await saveFolders(state.folders);
	renderFolders();
	renderList();
}

async function deleteFolder(id){
	const folder = state.folders.find((f) => f.id === id);
	if(!folder){ return; }
	const inside = state.notes.filter((n) => n.folderId === id && !n.deleted);
	const ok = await askConfirm(
		t("deleteFolderTitle", "Delete “$1”?", [folder.name]),
		inside.length ? t("deleteFolderText", "The notes in this folder will be moved to Recently Deleted.") : "",
		t("delete", "Delete"), true);
	if(!ok){ return; }
	const now = Date.now();
	for(const n of state.notes.filter((x) => x.folderId === id)){
		n.folderId = null;
		if(!n.deleted){ n.deleted = now; n.pinned = false; }
		await persist(n);
	}
	state.folders = state.folders.filter((f) => f.id !== id);
	await saveFolders(state.folders);
	if(state.folder === id){ openFolder(ALL); }
	scheduleListRender();
}

async function changeSetting(patch){
	const next = Object.assign({}, state.settings, patch);
	state.settings = next;
	await chrome.storage.sync.set({settings: next});
	applySettings();
	renderList();
}

// ---------- settings & theme ----------

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(){
	const theme = state.settings.theme;
	const dark = theme === "dark" || (theme === "auto" && darkQuery.matches);
	document.documentElement.dataset.theme = dark ? "dark" : "light";
}

function applySettings(){
	const s = state.settings;
	applyTheme();
	const root = document.documentElement.style;
	root.setProperty("--editor-size", Math.max(11, Math.min(32, Number(s.fontSize) || 15)) + "px");
	root.setProperty("--font-editor", fontStack(s.fontFamily));
	editor.classList.toggle("paper-lines", s.paper === "lines");
	editor.classList.toggle("paper-grid", s.paper === "grid");
	editor.spellcheck = s.spellcheck !== false;
	updateWordCount();
}

// ---------- lock ----------

function lockNotes(){
	if(!(state.settings.lock && state.settings.lockHash)){ return; }
	closeCurrentNote();
	showEditorFor(null);
	go(1);
	const screen = $("lockscreen");
	screen.classList.remove("hidden");
	const input = $("lock-input");
	input.value = "";
	setTimeout(() => input.focus(), 50);
}

async function tryUnlock(submitted){
	const input = $("lock-input");
	if(await checkPasswordHash(input.value, state.settings.lockHash)){
		$("lockscreen").classList.add("hidden");
		input.value = "";
		return;
	}
	if(submitted){
		const card = document.querySelector(".lock-card");
		card.classList.remove("shake");
		void card.offsetWidth;
		card.classList.add("shake");
		input.select();
	}
}

// ---------- toast ----------

let toastTimer = 0;
function toast(message){
	const el = $("toast");
	el.textContent = message;
	el.classList.add("show");
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

// ---------- storage sync between windows ----------

function onStorageChanged(changes, area){
	if(area === "sync" && changes.settings){
		const before = state.settings;
		state.settings = Object.assign({}, before, changes.settings.newValue || {});
		applySettings();
		if(before.storage !== state.settings.storage){
			reloadData();
			return;
		}
		if(before.lock !== state.settings.lock || before.lockHash !== state.settings.lockHash){
			if(!state.settings.lock){ $("lockscreen").classList.add("hidden"); }
		}
		scheduleListRender();
	}
	if(area === "session" && changes.focusNote && changes.focusNote.newValue){
		focusFromSession(changes.focusNote.newValue);
	}
	if(area !== notesAreaName()){ return; }

	let touched = false;
	for(const key in changes){
		if(key === FOLDERS_KEY){
			state.folders = changes[key].newValue || [];
			touched = true;
			continue;
		}
		if(!key.startsWith(NOTE_PREFIX)){ continue; }
		touched = true;
		const id = key.slice(NOTE_PREFIX.length);
		const incoming = changes[key].newValue;
		const index = state.notes.findIndex((n) => n.id === id);
		if(!incoming){
			if(index >= 0 && !state.notes[index].fresh){
				state.notes.splice(index, 1);
				if(id === state.noteId){ state.noteId = null; showEditorFor(null); }
			}
			continue;
		}
		if(index < 0){
			state.notes.push(incoming);
			continue;
		}
		const local = state.notes[index];
		if(id === state.noteId && pendingNote === local){ continue; }
		const htmlChanged = incoming.html !== local.html;
		Object.assign(local, incoming);
		if(id === state.noteId){
			if(htmlChanged && incoming.html !== editor.innerHTML){
				const focused = document.activeElement === editor;
				editor.innerHTML = incoming.html;
				if(focused){ placeCaretAtEnd(); }
				updateWordCount();
			}
			$("trash-banner").classList.toggle("hidden", !local.deleted);
			editor.contentEditable = local.deleted ? "false" : "true";
			updateDateLine(local);
		}
	}
	if(touched){ scheduleListRender(); }
}

function focusFromSession(value){
	if(!value || !value.id || Date.now() - value.at > 15000){ return; }
	chrome.storage.session.remove("focusNote");
	const open = () => {
		const note = state.notes.find((n) => n.id === value.id);
		if(note){
			if(state.folder === TRASH || (state.folder !== ALL && note.folderId !== state.folder)){ state.folder = ALL; renderList(); }
			openNote(note.id);
			toast(t("clipped", "Added to note"));
		}
	};
	// the note may arrive a moment after the focus request
	if(state.notes.some((n) => n.id === value.id)){ open(); }else{ setTimeout(open, 300); }
}

async function reloadData(){
	closeCurrentNote();
	state.notes = await loadNotes();
	state.folders = await loadFolders();
	if(state.folder !== ALL && state.folder !== TRASH && !state.folders.some((f) => f.id === state.folder)){ state.folder = ALL; }
	showEditorFor(null);
	renderFolders();
	renderList();
	renderTabs();
}

// ---------- welcome ----------

async function addWelcomeNote(){
	const flags = await chrome.storage.sync.get("easynotesWelcomed");
	if(flags.easynotesWelcomed){ return; }
	await chrome.storage.sync.set({easynotesWelcomed: true});
	if(state.notes.length){ return; }
	const tip = (key, text) => escapeHtml(t(key, text));
	const html = "<div>" + tip("welcomeTitle", "Welcome to EasyNotes 👋") + "</div>" +
		"<div>" + tip("welcomeIntro", "Your notes live right here in the sidebar. A few things to try:") + "</div>" +
		"<ul class=\"checklist\">" +
		"<li class=\"checked\">" + tip("welcome1", "Open EasyNotes with Alt+Shift+N") + "</li>" +
		"<li>" + tip("welcome2", "Click a circle to tick off a to-do") + "</li>" +
		"<li>" + tip("welcome3", "Select text on any page, right-click and choose “Add to EasyNotes”") + "</li>" +
		"<li>" + tip("welcome4", "Pin important notes and sort them into folders") + "</li>" +
		"<li>" + tip("welcome5", "Choose a font, theme and paper style in Settings") + "</li>" +
		"</ul><div><br></div>" +
		"<div>" + tip("welcome6", "The first line of a note becomes its title.") + "</div>";
	const note = newNote(html);
	note.pinned = true;
	state.notes.push(note);
	await persist(note);
}

// ---------- startup ----------

function bindEvents(){
	$("btn-settings").addEventListener("click", () => chrome.runtime.openOptionsPage());
	$("btn-new-folder").addEventListener("click", createFolder);
	$("btn-new-note-folders").addEventListener("click", createNote);
	$("btn-new-note").addEventListener("click", createNote);
	$("btn-to-folders").addEventListener("click", () => { flushSave(); renderFolders(); go(0); });
	$("btn-back").addEventListener("click", () => { flushSave(); renderList(); go(1); });
	$("btn-add-tab").addEventListener("click", createNote);
	$("btn-empty-new").addEventListener("click", createNote);
	$("tabstrip").addEventListener("dblclick", (e) => { if(e.target === e.currentTarget){ createNote(); } });
	$("tabstrip").addEventListener("wheel", (e) => {
		// let a normal mouse wheel scroll the tabs sideways
		if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){ e.currentTarget.scrollLeft += e.deltaY; e.preventDefault(); }
	}, {passive: false});
	$("btn-list-more").addEventListener("click", (e) => showMenu(e.currentTarget, listMenuItems()));
	$("btn-lock").addEventListener("click", lockNotes);
	$("btn-checklist").addEventListener("click", () => setListType("checklist"));
	$("btn-format").addEventListener("click", (e) => showFormatPopover(e.currentTarget));
	$("btn-note-more").addEventListener("click", (e) => {
		const note = currentNote();
		if(note){ showMenu(e.currentTarget, noteMenuItems(note, true)); }
	});
	$("btn-recover").addEventListener("click", () => { const note = currentNote(); if(note){ recoverNote(note); } });
	$("btn-speak-stop").addEventListener("click", stopSpeaking);

	// keep the editor selection while using toolbar buttons and popovers
	["btn-checklist", "btn-format"].forEach((id) => $(id).addEventListener("mousedown", (e) => e.preventDefault()));
	const layer = $("popover-layer");
	layer.addEventListener("mousedown", (e) => {
		if(e.target === layer){ e.preventDefault(); closePopover(); return; }
		if(!e.target.closest("input")){ e.preventDefault(); }
	});
	layer.addEventListener("contextmenu", (e) => { e.preventDefault(); closePopover(); });

	$("search").addEventListener("input", (e) => {
		state.query = e.target.value;
		renderList();
	});

	editor.addEventListener("input", onEditorInput);
	editor.addEventListener("beforeinput", onBeforeInput);
	editor.addEventListener("paste", onPaste);
	editor.addEventListener("mousedown", onEditorMouseDown);
	editor.addEventListener("click", onEditorClick);
	editor.addEventListener("keydown", onEditorKeyDown);
	editor.addEventListener("focus", () => {
		if(!editor.innerHTML.trim()){
			editor.innerHTML = "<div><br></div>";
			placeCaretAtEnd();
		}
	});

	$("find-input").addEventListener("input", () => runFind());
	$("find-input").addEventListener("keydown", (e) => {
		if(e.key === "Enter"){ e.preventDefault(); stepFind(e.shiftKey ? -1 : 1); }
		if(e.key === "Escape"){ e.preventDefault(); hideFind(); editor.focus(); }
	});
	$("find-prev").addEventListener("click", () => stepFind(-1));
	$("find-next").addEventListener("click", () => stepFind(1));
	$("find-done").addEventListener("click", () => { hideFind(); editor.focus(); });

	$("lock-form").addEventListener("submit", (e) => { e.preventDefault(); tryUnlock(true); });
	$("lock-input").addEventListener("input", () => tryUnlock(false));

	document.addEventListener("keydown", (e) => {
		const mod = e.ctrlKey || e.metaKey;
		if(e.key === "Escape"){
			if(!$("popover-layer").classList.contains("hidden")){ closePopover(); return; }
			if(!$("findbar").classList.contains("hidden")){ hideFind(); return; }
		}
		if(!$("lockscreen").classList.contains("hidden")){ return; }
		if(e.altKey && !mod && e.code === "KeyN"){ e.preventDefault(); createNote(); return; }
		if(mod && !e.shiftKey && e.code === "KeyF"){
			e.preventDefault();
			if(state.level === 2 && currentNote()){ showFind(); }else{ go(1); $("search").focus(); }
		}
	});

	chrome.storage.onChanged.addListener(onStorageChanged);
	darkQuery.addEventListener("change", applyTheme);
	window.addEventListener("pagehide", flushSave);
	document.addEventListener("visibilitychange", () => { if(document.hidden){ flushSave(); } });
}

async function init(){
	editor = $("editor");
	applyI18n();
	fillIcons();
	state.settings = await getSettings();
	applySettings();

	if(state.settings.lock && state.settings.lockHash){
		$("lockscreen").classList.remove("hidden");
		setTimeout(() => $("lock-input").focus(), 50);
	}

	bindEvents();
	await purgeTrash();
	state.notes = await loadNotes();
	state.folders = await loadFolders();
	await addWelcomeNote();

	let saved = ALL;
	try{ saved = localStorage.getItem("en_folder") || ALL; }catch(e){ /* storage blocked */ }
	state.folder = saved === TRASH || saved === ALL || state.folders.some((f) => f.id === saved) ? saved : ALL;

	// open straight into the note tabs, on the note that was open last time
	$("app").classList.add("no-anim");
	renderFolders();
	renderList();
	let lastId = null;
	try{ lastId = localStorage.getItem("en_note"); }catch(e){ /* storage blocked */ }
	const tabs = tabNotes();
	const start = tabs.find((n) => n.id === lastId) || [...tabs].sort((a, b) => b.modified - a.modified)[0];
	if(start){
		openNote(start.id);
	}else{
		showEditorFor(null);
		renderTabs();
		go(2);
	}
	requestAnimationFrame(() => requestAnimationFrame(() => $("app").classList.remove("no-anim")));

	const session = await chrome.storage.session.get("focusNote");
	if(session.focusNote){ focusFromSession(session.focusNote); }
}

init();
