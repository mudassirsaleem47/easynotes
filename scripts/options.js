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

/* global t, applyI18n, getSettings, setSettings, DEFAULT_SETTINGS, loadNotes, loadFolders, saveFolders, saveNote,
   newNote, textToHtml, uid, moveNotesBetweenAreas, makePasswordHash, checkPasswordHash, notesArea, SYNC_ITEM_LIMIT, noteByteSize */

const $ = (id) => document.getElementById(id);
let settings;

const SWITCHES = ["groupByDate", "showWordCount", "spellcheck", "contextMenus", "clipSource"];
const SELECTS = ["sortBy", "fontFamily", "clipTarget", "speechVoice"];

function toast(message){
	const el = $("toast");
	el.textContent = message;
	el.classList.add("show");
	clearTimeout(toast.timer);
	toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
}

// ---------- popup buttons (macOS-style replacement for <select>) ----------

const ARROWS_SVG = "<svg viewBox='0 0 24 24'><path d='M8 10l4-4 4 4M8 14l4 4 4-4'/></svg>";
const CHECK_SVG = "<svg viewBox='0 0 24 24'><path d='M5 12.5l4.5 4.5L19 7.5'/></svg>";
const popupSyncers = [];
let openPopup = null;

function syncPopups(){
	popupSyncers.forEach((sync) => sync());
}

function enhanceSelect(select){
	select.classList.add("enhanced");
	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "popup-btn";
	btn.setAttribute("aria-haspopup", "listbox");
	btn.innerHTML = "<span class='pb-label'></span><span class='pb-arrows'>" + ARROWS_SVG + "</span>";
	select.after(btn);
	const sync = () => {
		const option = select.options[select.selectedIndex];
		btn.querySelector(".pb-label").textContent = option ? option.textContent : "";
		btn.disabled = select.disabled;
	};
	btn.addEventListener("click", () => (openPopup && openPopup.btn === btn ? closePopup() : showPopup(select, btn, sync)));
	btn.addEventListener("keydown", (e) => {
		if(["ArrowDown", "ArrowUp", " ", "Enter"].includes(e.key)){
			e.preventDefault();
			showPopup(select, btn, sync);
		}
	});
	popupSyncers.push(sync);
	sync();
}

function closePopup(){
	if(!openPopup){ return; }
	openPopup.menu.remove();
	openPopup.btn.classList.remove("open");
	document.removeEventListener("mousedown", openPopup.onDown, true);
	document.removeEventListener("keydown", openPopup.onKey, true);
	window.removeEventListener("resize", closePopup);
	window.removeEventListener("scroll", openPopup.onScroll, true);
	openPopup = null;
}

function showPopup(select, btn, sync){
	closePopup();
	const menu = document.createElement("div");
	menu.className = "popup-menu";
	menu.setAttribute("role", "listbox");
	const items = [];
	let focus = 0;

	const setFocus = (i) => {
		focus = Math.max(0, Math.min(items.length - 1, i));
		items.forEach((item, n) => item.el.classList.toggle("focus", n === focus));
		items[focus].el.scrollIntoView({block: "nearest"});
	};
	const choose = (value) => {
		closePopup();
		if(select.value !== value){
			select.value = value;
			select.dispatchEvent(new Event("change", {bubbles: true}));
		}
		sync();
		btn.focus();
	};
	const addItem = (option) => {
		const el = document.createElement("div");
		el.className = "pm-item";
		el.setAttribute("role", "option");
		el.setAttribute("aria-selected", String(option.selected));
		el.innerHTML = "<span class='pm-check'>" + (option.selected ? CHECK_SVG : "") + "</span><span></span>";
		el.lastChild.textContent = option.textContent;
		const index = items.length;
		el.addEventListener("mouseenter", () => setFocus(index));
		el.addEventListener("click", () => choose(option.value));
		items.push({el, value: option.value, label: option.textContent.toLowerCase()});
		if(option.selected){ focus = index; }
		menu.appendChild(el);
	};
	[...select.children].forEach((child, i) => {
		if(child.tagName === "OPTGROUP"){
			if(i > 0){
				const sep = document.createElement("div");
				sep.className = "pm-sep";
				menu.appendChild(sep);
			}
			const head = document.createElement("div");
			head.className = "pm-group";
			head.textContent = child.label;
			menu.appendChild(head);
			[...child.children].forEach(addItem);
		}else{
			addItem(child);
		}
	});
	if(!items.length){ return; }

	document.body.appendChild(menu);
	const r = btn.getBoundingClientRect();
	menu.style.minWidth = r.width + "px";
	const h = menu.offsetHeight;
	const w = menu.offsetWidth;
	let top = r.bottom + 4;
	if(top + h > window.innerHeight - 8){ top = Math.max(8, r.top - h - 4); }
	menu.style.top = top + "px";
	menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + "px";
	btn.classList.add("open");
	setFocus(focus);

	const onDown = (e) => { if(!menu.contains(e.target) && e.target.closest(".popup-btn") !== btn){ closePopup(); } };
	const onKey = (e) => {
		if(e.key === "ArrowDown"){ e.preventDefault(); setFocus(focus + 1); }
		else if(e.key === "ArrowUp"){ e.preventDefault(); setFocus(focus - 1); }
		else if(e.key === "Home"){ e.preventDefault(); setFocus(0); }
		else if(e.key === "End"){ e.preventDefault(); setFocus(items.length - 1); }
		else if(e.key === "Enter" || e.key === " "){ e.preventDefault(); choose(items[focus].value); }
		else if(e.key === "Escape" || e.key === "Tab"){ e.preventDefault(); closePopup(); btn.focus(); }
		else if(e.key.length === 1){
			// type a letter to jump to the next matching entry
			const letter = e.key.toLowerCase();
			const order = items.map((_, n) => (focus + 1 + n) % items.length);
			const hit = order.find((n) => items[n].label.startsWith(letter));
			if(hit !== undefined){ setFocus(hit); }
		}
	};
	const onScroll = (e) => { if(!menu.contains(e.target)){ closePopup(); } };
	document.addEventListener("mousedown", onDown, true);
	document.addEventListener("keydown", onKey, true);
	window.addEventListener("resize", closePopup);
	window.addEventListener("scroll", onScroll, true);
	openPopup = {menu, btn, onDown, onKey, onScroll};
}

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
function applyTheme(){
	const dark = settings.theme === "dark" || (settings.theme === "auto" && darkQuery.matches);
	document.documentElement.dataset.theme = dark ? "dark" : "light";
}

async function update(patch){
	settings = await setSettings(patch);
	render();
}

function render(){
	SWITCHES.forEach((id) => { $(id).checked = Boolean(settings[id]); });
	SELECTS.forEach((id) => { $(id).value = settings[id]; });
	$("groupByDate").disabled = settings.sortBy === "title";
	syncPopups();
	document.querySelectorAll("input[name=theme]").forEach((r) => { r.checked = r.value === settings.theme; });
	document.querySelectorAll("input[name=storage]").forEach((r) => { r.checked = r.value === settings.storage; });
	document.querySelectorAll("#paper button").forEach((b) => b.classList.toggle("on", b.dataset.value === settings.paper));
	$("fontSize").value = settings.fontSize;
	$("fontSizeOut").textContent = settings.fontSize + " pt";
	$("speechRate").value = settings.speechRate;
	$("speechRateOut").textContent = Number(settings.speechRate).toFixed(1) + "×";
	$("lock").checked = Boolean(settings.lock && settings.lockHash);
	$("save-password").textContent = settings.lockHash ? t("changePassword", "Change Password") : t("setPassword", "Set Password");

	const preview = $("preview");
	preview.style.fontSize = settings.fontSize + "px";
	preview.style.fontFamily = fontStack(settings.fontFamily);
	applyTheme();
	showUsage();
}

async function showUsage(){
	const area = await notesArea();
	const bytes = await area.getBytesInUse(null);
	const kb = (bytes / 1024).toFixed(1) + " KB";
	$("usage").textContent = settings.storage === "sync" ? kb + " / 100 KB" : kb;
}

function populateVoices(){
	const select = $("speechVoice");
	const voices = speechSynthesis.getVoices();
	if(!voices.length){ return; }
	select.length = 1;
	voices.forEach((v) => {
		const option = document.createElement("option");
		option.value = v.name;
		option.textContent = v.name + " (" + v.lang + ")";
		select.appendChild(option);
	});
	select.value = settings.speechVoice;
	syncPopups();
}

// Asks for the current password when the lock is on. Resolves true when allowed.
async function confirmCurrentPassword(){
	if(!(settings.lock && settings.lockHash)){ return true; }
	const value = window.prompt(t("currentPassword", "Enter your current password:"));
	if(value === null){ return false; }
	if(await checkPasswordHash(value, settings.lockHash)){ return true; }
	toast(t("wrongPassword", "Wrong password"));
	return false;
}

async function changeStorage(target){
	if(target === settings.storage){ return; }
	if(target === "sync"){
		const notes = await loadNotes();
		const tooBig = notes.filter((n) => noteByteSize(n) >= SYNC_ITEM_LIMIT);
		const total = notes.reduce((sum, n) => sum + noteByteSize(n), 0);
		if(tooBig.length || total > 95 * 1024){
			toast(t("syncTooLarge", "Some notes are too large to sync. Shorten them or remove images first."));
			render();
			return;
		}
	}
	await moveNotesBetweenAreas(settings.storage, target);
	await update({storage: target});
	toast(target === "sync" ? t("nowSyncing", "Notes now sync with your Chrome account") : t("nowLocal", "Notes are now kept on this computer"));
}

// ---------- backup ----------

async function exportAll(){
	const data = {
		app: "EasyNotes",
		version: chrome.runtime.getManifest().version,
		exported: new Date().toISOString(),
		folders: await loadFolders(),
		notes: await loadNotes()
	};
	const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = "easynotes-backup-" + new Date().toISOString().slice(0, 10) + ".json";
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importFiles(files){
	const existing = await loadNotes();
	const ids = new Set(existing.map((n) => n.id));
	const folders = await loadFolders();
	let count = 0;
	let failed = 0;

	for(const file of files){
		const content = await file.text();
		let parsed = null;
		if(/\.json$/i.test(file.name) || /^\s*[[{]/.test(content)){
			try{ parsed = JSON.parse(content); }catch(e){ parsed = null; }
		}
		const incoming = [];
		if(parsed && Array.isArray(parsed.notes)){
			// EasyNotes backup
			(parsed.folders || []).forEach((f) => {
				if(f && f.id && f.name && !folders.some((x) => x.id === f.id)){ folders.push({id: f.id, name: String(f.name)}); }
			});
			parsed.notes.forEach((n) => {
				if(!n || typeof n.html !== "string"){ return; }
				const note = Object.assign(newNote(n.html, n.folderId || null), {
					pinned: Boolean(n.pinned),
					created: Number(n.created) || Date.now(),
					modified: Number(n.modified) || Date.now(),
					deleted: n.deleted ? Number(n.deleted) : null
				});
				if(n.id && !ids.has(n.id)){ note.id = n.id; }
				incoming.push(note);
			});
		}else if(Array.isArray(parsed)){
			// Note Sidebar multiple-notes export: [{note: "..."}]
			parsed.forEach((item) => {
				if(item && typeof item.note === "string" && item.note.trim()){
					incoming.push(newNote(/<\/?[a-z][\s\S]*>/i.test(item.note) ? item.note : textToHtml(item.note)));
				}
			});
		}else if(content.trim()){
			incoming.push(newNote(textToHtml(content)));
		}else{
			failed++;
		}
		for(const note of incoming){
			const result = await saveNote(note);
			if(result.ok){ count++; ids.add(note.id); }else{ failed++; }
		}
	}
	await saveFolders(folders);
	showUsage();
	toast(failed ? t("importPartial", "Imported $1 notes, $2 could not be imported", [count, failed]) : t("importDone", "Imported $1 notes", [count]));
}

// ---------- events ----------

function bind(){
	SWITCHES.forEach((id) => $(id).addEventListener("change", (e) => update({[id]: e.target.checked})));
	SELECTS.forEach((id) => $(id).addEventListener("change", (e) => update({[id]: e.target.value})));
	document.querySelectorAll("input[name=theme]").forEach((r) => r.addEventListener("change", () => update({theme: r.value})));
	document.querySelectorAll("input[name=storage]").forEach((r) => r.addEventListener("change", () => changeStorage(r.value)));
	document.querySelectorAll("#paper button").forEach((b) => b.addEventListener("click", () => update({paper: b.dataset.value})));
	$("fontSize").addEventListener("input", (e) => update({fontSize: Number(e.target.value)}));
	$("speechRate").addEventListener("input", (e) => update({speechRate: Number(e.target.value)}));

	$("open-shortcuts").addEventListener("click", () => chrome.tabs.create({url: "chrome://extensions/shortcuts"}));

	$("lock").addEventListener("change", async(e) => {
		if(e.target.checked){
			if(settings.lockHash){
				await update({lock: true});
			}else{
				e.target.checked = false;
				$("pw1").focus();
				toast(t("setPasswordFirst", "Choose a password first"));
			}
			return;
		}
		if(await confirmCurrentPassword()){
			await update({lock: false, lockHash: ""});
		}else{
			e.target.checked = true;
		}
	});

	$("save-password").addEventListener("click", async() => {
		const pw1 = $("pw1").value;
		const pw2 = $("pw2").value;
		if(pw1.length < 4){ toast(t("passwordShort", "Use at least 4 characters")); return; }
		if(pw1 !== pw2){ toast(t("passwordMismatch", "The passwords don't match")); return; }
		if(!(await confirmCurrentPassword())){ return; }
		await update({lock: true, lockHash: await makePasswordHash(pw1)});
		$("pw1").value = "";
		$("pw2").value = "";
		toast(t("passwordSaved", "Password saved. Notes are now locked."));
	});

	$("export").addEventListener("click", exportAll);
	$("import").addEventListener("click", () => $("import-file").click());
	$("import-file").addEventListener("change", async(e) => {
		const files = [...e.target.files];
		e.target.value = "";
		if(files.length){ await importFiles(files); }
	});

	$("reset").addEventListener("click", async() => {
		if(!window.confirm(t("resetConfirm", "Reset all settings to their defaults? Your notes are kept."))){ return; }
		// keep where the notes are stored and the lock, so nothing gets lost or exposed
		const keep = {storage: settings.storage, lock: settings.lock, lockHash: settings.lockHash};
		await chrome.storage.sync.set({settings: Object.assign({}, DEFAULT_SETTINGS, keep)});
		settings = await getSettings();
		render();
		toast(t("resetDone", "Settings reset"));
	});

	// highlight the sidebar entry of the section in view
	const links = [...document.querySelectorAll(".nav-item")];
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if(entry.isIntersecting){
				links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
			}
		});
	}, {rootMargin: "-20% 0px -70% 0px"});
	document.querySelectorAll("main section").forEach((s) => observer.observe(s));

	chrome.storage.onChanged.addListener((changes, area) => {
		if(area === "sync" && changes.settings){
			settings = Object.assign({}, DEFAULT_SETTINGS, changes.settings.newValue || {});
			render();
		}else{
			showUsage();
		}
	});
	darkQuery.addEventListener("change", applyTheme);
	speechSynthesis.addEventListener("voiceschanged", populateVoices);
}

async function init(){
	applyI18n();
	settings = await getSettings();
	$("version").textContent = chrome.runtime.getManifest().version;
	document.querySelectorAll("select").forEach(enhanceSelect);
	populateVoices();
	render();
	bind();
}

init();
