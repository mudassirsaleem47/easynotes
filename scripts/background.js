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

/* global importScripts, getSettings, addClip, migrateLegacy, purgeTrash */
importScripts("store.js");

chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true}).catch((error) => console.error(error));

const MENU_SELECTION = "en_clip_selection";
const MENU_LINK = "en_clip_link";
const MENU_PAGE = "en_clip_page";

async function buildContextMenus(){
	await chrome.contextMenus.removeAll();
	const settings = await getSettings();
	if(!settings.contextMenus){ return; }
	chrome.contextMenus.create({id: MENU_SELECTION, title: chrome.i18n.getMessage("menuClipSelection"), contexts: ["selection"]});
	chrome.contextMenus.create({id: MENU_LINK, title: chrome.i18n.getMessage("menuClipLink"), contexts: ["link"]});
	chrome.contextMenus.create({id: MENU_PAGE, title: chrome.i18n.getMessage("menuClipPage"), contexts: ["page"]});
}

// Open the side panel while we still have the user gesture, then save the clip.
// The panel picks the note up from chrome.storage.session.
function openPanel(windowId){
	if(windowId !== undefined && chrome.sidePanel.open){
		chrome.sidePanel.open({windowId}).catch(() => { /* panel may already be open */ });
	}
}

async function clipAndFocus(text, url, title){
	const note = await addClip(text, url, title);
	if(note){
		await chrome.storage.session.set({focusNote: {id: note.id, at: Date.now()}});
	}
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
	openPanel(tab && tab.windowId);
	const pageTitle = tab && tab.title;
	if(info.menuItemId === MENU_SELECTION){
		clipAndFocus(info.selectionText, info.pageUrl, pageTitle);
	}else if(info.menuItemId === MENU_LINK){
		clipAndFocus("", info.linkUrl, info.selectionText || info.linkUrl);
	}else if(info.menuItemId === MENU_PAGE){
		clipAndFocus("", info.pageUrl, pageTitle);
	}
});

chrome.commands.onCommand.addListener((command, tab) => {
	if(command !== "clip_selection" || !tab){ return; }
	openPanel(tab.windowId);
	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		func: () => ({text: window.getSelection().toString(), url: location.href, title: document.title})
	}).then((results) => {
		const result = results && results[0] && results[0].result;
		if(result && result.text){
			clipAndFocus(result.text, result.url, result.title);
		}
	}).catch((error) => console.warn("EasyNotes: cannot read selection on this page.", error.message));
});

chrome.storage.onChanged.addListener((changes, area) => {
	if(area !== "sync" || !changes.settings){ return; }
	const before = changes.settings.oldValue || {};
	const after = changes.settings.newValue || {};
	if(before.contextMenus !== after.contextMenus){ buildContextMenus(); }
});

chrome.runtime.onInstalled.addListener(async() => {
	await migrateLegacy();
	await buildContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
	purgeTrash();
});
