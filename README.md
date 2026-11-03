<p align="center">
  <img src="images/icon128.png" width="96" height="96" alt="EasyNotes icon">
</p>

<h1 align="center">EasyNotes</h1>

<p align="center">
  Notes in your browser sidebar, with a clean design inspired by the macOS Notes app.<br>
  Write notes in tabs, make checklists, sort notes into folders and save text from any web page.
</p>

<p align="center">
  <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-f5a20b">
  <img alt="Chrome 116+" src="https://img.shields.io/badge/Chrome-116%2B-4285F4">
  <img alt="License GPL-2.0" src="https://img.shields.io/badge/License-GPL--2.0-blue">
</p>

---

## Features

**Writing**
- **Note tabs.** Each note gets a tab at the top of the sidebar. Click **+** to add a note and **×** to close one.
- The first line of a note becomes its title automatically.
- **Formatting (Aa):** Title, Heading, Subheading, Body, Monostyled, bold, italic, underline and strikethrough.
- **Lists:** bulleted, dashed and numbered lists, block quotes, and **checklists** (click the circle to tick an item off).
- Pasting keeps simple formatting. Images can be pasted when notes are stored locally.
- **Find in note** (Ctrl+F), with highlighted matches and next/previous buttons.
- Word and character count, and *Insert date & time*.

**Organising**
- **Folders:** create, rename and delete folders, and move notes between them.
- **Pinned notes** stay at the top of the list and in the first tabs.
- **Search** across all notes. Matches are highlighted in the results.
- **Recently Deleted:** deleted notes stay for 30 days and can be recovered.
- Sort notes by date edited, date created or title, optionally grouped as Today, Yesterday, Previous 7 Days and so on.

**Web clipper**
- Select text on any page, right-click and choose **Add to EasyNotes**, or press **Alt+Shift+A**.
- **Save Link** and **Save Page Link** from the right-click menu.
- A link to the source page is added to the note (this can be turned off in Settings).

**Sharing and backup**
- Export a note as **.txt**, **.md** (Markdown) or **.html**. Copy or print it.
- **Read Aloud** using your system voices.
- Back up all notes and folders to a JSON file, and import them again. Old *Note Sidebar* exports and plain `.txt` / `.md` files can be imported too.

**Personalising**
- Light, Dark or Auto theme.
- 17 fonts (SF Pro, Serif, Rounded, Monospaced, Arial, Georgia, Verdana and more), adjustable text size, and plain, lined or grid paper.
- Optional **password lock** for the sidebar.
- Store notes **on this computer** (no size limit) or **sync them with your Chrome account**.

## Installation

### From source (developer mode)
1. Download this repository (**Code → Download ZIP**) and unzip it, or clone it:
   ```bash
   git clone https://github.com/<your-username>/easynotes.git
   ```
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder (the one that contains `manifest.json`).
5. Click the EasyNotes icon in the toolbar, or press **Alt+Shift+N**, to open the sidebar.

EasyNotes also works in other Chromium browsers that support the side panel API, such as Microsoft Edge and Brave.

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| Open EasyNotes | `Alt+Shift+N` |
| Add selected page text to a note | `Alt+Shift+A` |
| New note | `Alt+N` |
| Find in note / search notes | `Ctrl+F` |
| Checklist | `Ctrl+Shift+L` |
| Title / Heading / Subheading / Body | `Ctrl+Alt+1` / `2` / `3` / `0` |
| Bold / Italic / Underline | `Ctrl+B` / `Ctrl+I` / `Ctrl+U` |
| Strikethrough | `Ctrl+Shift+X` |
| Indent / outdent a list item | `Tab` / `Shift+Tab` |
| Open a link in a note | `Ctrl+Click` |

The two browser-wide shortcuts can be changed at `chrome://extensions/shortcuts`.

## Privacy

EasyNotes has no servers, no analytics and no tracking. Your notes never leave your browser:

- **On this computer** stores notes in `chrome.storage.local`.
- **Sync with your Chrome account** stores notes in `chrome.storage.sync`, which Chrome syncs to your own Google account. Each note can be up to about 8 KB, and all notes together up to about 100 KB.

The password lock hides your notes from other people using the same browser. The notes themselves are **not encrypted** on disk.

### Permissions

| Permission | Why it is needed |
| --- | --- |
| `sidePanel` | Shows EasyNotes in the browser sidebar |
| `storage`, `unlimitedStorage` | Saves notes and settings |
| `contextMenus` | Adds the "Add to EasyNotes" right-click items |
| `activeTab`, `scripting` | Reads the selected text on the current page when you press Alt+Shift+A |

## Project structure

```
├── manifest.json          Extension manifest (MV3)
├── panel.html             Sidebar: note tabs, editor, note list and folders
├── options.html           Settings page
├── scripts/
│   ├── store.js           Shared data layer: notes, folders, settings, migration
│   ├── panel.js           Sidebar logic
│   ├── options.js         Settings logic
│   └── background.js      Service worker: context menus, shortcuts, web clipper
├── styles/                panel.css, options.css, fonts.css
├── images/                Extension icons
├── fonts/                 Optional SF Pro font files (not included, see below)
└── _locales/en/           English UI text
```

There is no build step. Edit the files and click **Reload** on `chrome://extensions`.

### About the SF Pro font
The interface is designed for Apple's **SF Pro Display** font. Its license does not allow it to be redistributed, so the font files are **not included** in this repository. On macOS the system's own SF font is used automatically. On Windows and Linux, EasyNotes falls back to Segoe UI or the system font.

For personal use on a computer where you have the font, copy these files into the `fonts/` folder:

```
fonts/SFProDisplay-Regular.otf
fonts/SFProDisplay-Medium.otf
fonts/SFProDisplay-Bold.otf
```

## Credits and license

EasyNotes is based on **[Note Sidebar](https://www.stefanvd.net/project/note-sidebar/browser-extension/)** by Stefan vd, © 2026, and has been heavily modified (redesign, tabs, folders, checklists, web clipper and more).

This program is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License, version 2 or later**. See [LICENSE](LICENSE) for the full text.
