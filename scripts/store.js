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

// Shared data layer for the panel, settings page and background worker.
// Settings live in chrome.storage.sync under "settings".
// Each note is stored under its own key "en_note_<id>" so a single note never
// hits the 8 KB per-item limit of sync storage because of the others.
// Folders are stored under "en_folders" in the same area as the notes.

/* eslint-disable no-unused-vars */

const NOTE_PREFIX = "en_note_";
const FOLDERS_KEY = "en_folders";
const SYNC_ITEM_LIMIT = 8192;
const TRASH_DAYS = 30;

const DEFAULT_SETTINGS = {
	theme: "auto", // auto | light | dark
	fontSize: 15,
	fontFamily: "system", // system | serif | mono | rounded
	paper: "none", // none | lines | grid
	sortBy: "modified", // modified | created | title
	groupByDate: true,
	showWordCount: true,
	contextMenus: true,
	clipTarget: "last", // last | new
	clipSource: true,
	storage: "local", // local | sync
	lock: false,
	lockHash: "",
	speechVoice: "",
	speechRate: 1,
	spellcheck: true
};

const FONT_STACKS = {
	system: "var(--font-ui)",
	serif: "\"New York\", \"Iowan Old Style\", Charter, Georgia, \"Times New Roman\", serif",
	mono: "\"SF Mono\", ui-monospace, Menlo, Consolas, \"Liberation Mono\", monospace",
	rounded: "\"SF Pro Rounded\", ui-rounded, \"Nunito\", \"Segoe UI\", system-ui, sans-serif"
};
const GENERIC_FONTS = ["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"];

// CSS font-family value for a setting: one of the presets, or a classic font name.
function fontStack(name){
	if(FONT_STACKS[name]){ return FONT_STACKS[name]; }
	if(GENERIC_FONTS.includes(name)){ return name + ", var(--font-ui)"; }
	if(typeof name === "string" && /^[A-Za-z0-9 \-]+$/.test(name)){ return "\"" + name + "\", var(--font-ui)"; }
	return FONT_STACKS.system;
}

function t(key, fallback, subs){
	let msg = "";
	try{ msg = chrome.i18n.getMessage(key, subs); }catch(e){ /* not available */ }
	if(msg){ return msg; }
	const list = subs === undefined ? [] : [].concat(subs);
	return String(fallback || key).replace(/\$(\d)/g, (m, i) => list[i - 1] !== undefined ? list[i - 1] : m);
}

// The English text written in the HTML is the fallback; only replace it when a translation exists.
function applyI18n(root){
	const lookup = (key) => { try{ return chrome.i18n.getMessage(key); }catch(e){ return ""; } };
	(root || document).querySelectorAll("[data-i18n]").forEach((el) => {
		const msg = lookup(el.dataset.i18n);
		if(msg){ el.textContent = msg; }
	});
	(root || document).querySelectorAll("[data-i18n-title]").forEach((el) => {
		const msg = t(el.dataset.i18nTitle, el.title);
		el.title = msg;
		el.setAttribute("aria-label", msg);
	});
	(root || document).querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
		el.placeholder = t(el.dataset.i18nPlaceholder, el.placeholder);
	});
}

function uid(){
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(str){
	return String(str).replace(/[&<>"']/g, (c) => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;"}[c]));
}

// Turn plain text into note HTML: one <div> per line, like contenteditable does.
function textToHtml(text){
	return String(text).split(/\r?\n/).map((line) => "<div>" + (line ? escapeHtml(line) : "<br>") + "</div>").join("");
}

async function getSettings(){
	const items = await chrome.storage.sync.get("settings");
	return Object.assign({}, DEFAULT_SETTINGS, items.settings || {});
}

async function setSettings(patch){
	const current = await getSettings();
	const next = Object.assign(current, patch);
	await chrome.storage.sync.set({settings: next});
	return next;
}

async function notesArea(){
	const settings = await getSettings();
	return settings.storage === "sync" ? chrome.storage.sync : chrome.storage.local;
}

async function loadNotes(area){
	area = area || await notesArea();
	const all = await area.get(null);
	const notes = [];
	for(const key in all){
		if(key.startsWith(NOTE_PREFIX) && all[key] && all[key].id){
			notes.push(all[key]);
		}
	}
	return notes;
}

async function loadFolders(area){
	area = area || await notesArea();
	const items = await area.get(FOLDERS_KEY);
	return items[FOLDERS_KEY] || [];
}

async function saveFolders(folders){
	const area = await notesArea();
	await area.set({[FOLDERS_KEY]: folders});
}

function noteByteSize(note){
	return new Blob([JSON.stringify(note)]).size + NOTE_PREFIX.length + note.id.length;
}

// Returns {ok, tooBig} so callers can warn about the sync quota.
async function saveNote(note){
	const area = await notesArea();
	const tooBig = area === chrome.storage.sync && noteByteSize(note) >= SYNC_ITEM_LIMIT;
	try{
		await area.set({[NOTE_PREFIX + note.id]: note});
		return {ok: true, tooBig};
	}catch(e){
		return {ok: false, tooBig: true, error: e.message};
	}
}

async function removeNote(id){
	const area = await notesArea();
	await area.remove(NOTE_PREFIX + id);
}

function newNote(html, folderId){
	const now = Date.now();
	return {id: uid(), html: html || "", folderId: folderId || null, pinned: false, created: now, modified: now, deleted: null};
}

// Permanently remove notes that have been in Recently Deleted for 30 days.
async function purgeTrash(){
	const limit = Date.now() - TRASH_DAYS * 24 * 60 * 60 * 1000;
	const notes = await loadNotes();
	const old = notes.filter((n) => n.deleted && n.deleted < limit);
	if(old.length){
		const area = await notesArea();
		await area.remove(old.map((n) => NOTE_PREFIX + n.id));
	}
}

// Append a web clip to the last edited note, or to a new note.
async function addClip(text, sourceUrl, sourceTitle){
	const settings = await getSettings();
	let html = "";
	if(text){ html += textToHtml(text); }
	if(settings.clipSource && sourceUrl && /^https?:/i.test(sourceUrl)){
		html += "<div><a href=\"" + escapeHtml(sourceUrl) + "\">" + escapeHtml(sourceTitle || sourceUrl) + "</a></div>";
	}
	if(!html){ return null; }

	const notes = (await loadNotes()).filter((n) => !n.deleted);
	let note;
	if(settings.clipTarget === "last" && notes.length){
		note = notes.sort((a, b) => b.modified - a.modified)[0];
		note.html = (note.html || "") + "<div><br></div>" + html;
		note.modified = Date.now();
	}else{
		note = newNote(html);
	}
	await saveNote(note);
	return note;
}

// Move every note and the folder list from one storage area to the other.
async function moveNotesBetweenAreas(fromType, toType){
	if(fromType === toType){ return; }
	const from = fromType === "sync" ? chrome.storage.sync : chrome.storage.local;
	const to = toType === "sync" ? chrome.storage.sync : chrome.storage.local;
	const all = await from.get(null);
	const payload = {};
	for(const key in all){
		if(key.startsWith(NOTE_PREFIX) || key === FOLDERS_KEY){ payload[key] = all[key]; }
	}
	if(!Object.keys(payload).length){ return; }
	await to.set(payload);
	await from.remove(Object.keys(payload));
}

// One-time import of notes written by Note Sidebar (txtvalue / multivalue).
async function migrateLegacy(){
	const syncItems = await chrome.storage.sync.get(null);
	if(syncItems.easynotesMigrated){ return false; }

	const legacyType = syncItems.notesStorageType === "local" ? "local" : "sync";
	const legacyArea = legacyType === "local" ? chrome.storage.local : chrome.storage.sync;
	const legacy = await legacyArea.get(["txtvalue", "multivalue"]);
	const wasRich = syncItems.richtext === true;
	const wasMultiple = syncItems.multiple === true;
	const welcome = "Hello and welcome. Type your message here.";

	const bodies = [];
	if(wasMultiple && Array.isArray(legacy.multivalue)){
		legacy.multivalue.forEach((item) => { if(item && item.note){ bodies.push(item.note); } });
	}else if(typeof legacy.txtvalue === "string" && legacy.txtvalue){
		bodies.push(legacy.txtvalue);
	}

	const patch = {};
	if(typeof syncItems.fontsize === "string" || typeof syncItems.fontsize === "number"){
		patch.fontSize = Math.max(12, Math.min(28, Number(syncItems.fontsize) || 15));
	}
	if(syncItems.contextmenus === false){ patch.contextMenus = false; }
	if(typeof syncItems.fontfamily === "string" && syncItems.fontfamily !== "Helvetica"){ patch.fontFamily = syncItems.fontfamily; }
	if(syncItems.password === true && syncItems.enterpassword){
		patch.lock = true;
		patch.lockHash = syncItems.enterpassword;
	}
	if(bodies.length){ patch.storage = legacyType; }
	if(Object.keys(patch).length){ await setSettings(patch); }

	const base = Date.now();
	for(let i = 0; i < bodies.length; i++){
		const body = bodies[i];
		if(body.trim() === welcome){ continue; }
		const note = newNote(wasRich ? body : textToHtml(body));
		note.created = note.modified = base - i * 1000;
		await saveNote(note);
	}

	await chrome.storage.sync.set({easynotesMigrated: true});
	await legacyArea.remove(["txtvalue", "multivalue"]);
	return true;
}

// Password hashing: salted SHA-256 stored as "salt$hash".
// Older Note Sidebar hashes (plain SHA-256 without salt) are still accepted.
async function sha256Hex(text){
	const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
	return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function makePasswordHash(password){
	const salt = Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("");
	return salt + "$" + await sha256Hex(salt + password);
}

async function checkPasswordHash(password, stored){
	if(!stored){ return false; }
	if(stored.includes("$")){
		const [salt, hash] = stored.split("$");
		return await sha256Hex(salt + password) === hash;
	}
	return await sha256Hex(password) === stored;
}
