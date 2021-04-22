/**
 * @name FavoriteMedia
 * @authorId 310450863845933057
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/FavoriteMedia
 */

const { DiscordAPI, DOMTools, PluginUpdater } = ZLibrary;

class FavoriteMedia {

	config = {
		info: {
			name: "FavoriteMedia",
			author: "Dastan21",
			version: "1.4.7",
			description: "Adds media tabs, on the GIF/Emojis panel, to post favorited medias such as images, videos and audios."
		}
	};

	enableButtons = true;
	enableVideoAutoplayOnRightClick = true;

	lasttoggled = "";
	sectiondiv = null;
	navlist = null;
	imgtab = null;
	imglist = null;
	imgbtn = null;
	vidtab = null;
	vidlist = null;
	vidbtn = null;
	audtab = null;
	audlist = null;
	audbtn = null;
	modules = {
		btn: BdApi.findModuleByProps("size", "gifFavoriteButton", "selected"),
		res: BdApi.findModuleByProps("desiredItemWidth", "results", "result"),
		pos: BdApi.findModuleByProps("positionLayer", "positionContainer", "positionContainerOnlyEmoji"),
		col: BdApi.findModuleByProps("button", "lookFilled", "colorBrand"),
		con: BdApi.findModuleByProps("gutterSize", "container", "content"),
		thi: BdApi.findModuleByProps("scrollerBase", "thin", "fade"),
		wra: BdApi.findModuleByProps("wrapper", "wrapperAudio", "wrapperControlsHidden"),
		tex: BdApi.findModuleByProps("textAreaHeight", "channelTextArea", "highlighted"),
		hov: BdApi.findModuleByProps("hoverScale", "buttonWrapper", "button"),
		cha: BdApi.findModuleByProps("chat", "threadSidebar", "uploadArea"),
		inn: BdApi.findModuleByProps("container", "inner", "disabled"),
	}
	classes = {
		size: this.modules.btn.size,
		iconGif: this.modules.btn.icon,
		gifFavoriteButton: this.modules.btn.gifFavoriteButton,
		selected: this.modules.btn.selected,
		favButton: this.modules.res.favButton,
		navButton: this.modules.pos.navButton,
		navButtonActive: this.modules.pos.navButtonActive,
		button: this.modules.col.button,
		lookBlank: this.modules.col.lookBlank,
		colorBrand: this.modules.col.colorBrand,
		grow: this.modules.col.grow,
		tabContainer: this.modules.con.container,
		parentContent: this.modules.thi.content,
		itemContainer: BdApi.findModuleByProps("container", "categoryFade", "categoryFadeBlurple").container,
		thin: this.modules.thi.thin,
		scrollerBase: this.modules.thi.scrollerBase,
		fade: this.modules.thi.fade,
		childContent: this.modules.con.content,
		header: this.modules.con.header,
		result: this.modules.res.result,
		gif: this.modules.res.gif,
		message: BdApi.findModuleByProps("ephemeral", "mentioned", "replying").message,
		wrapper: this.modules.wra.wrapper,
		wrapperAudio: this.modules.wra.wrapperAudio,
		buttons: this.modules.tex.buttons,
		iconBtn: this.modules.hov.icon,
		buttonContainer: this.modules.tex.buttonContainer,
		contents: this.modules.col.contents,
		button1: this.modules.hov.button,
		button2: this.modules.tex.button,
		buttonWrapper: this.modules.hov.buttonWrapper,
		slateTextArea: BdApi.findModuleByProps("slateContainer", "slateTextArea", "placeholder").slateTextArea,
		messageContainer: BdApi.findModuleByProps("container", "gifFavoriteButton", "embedWrapper").container,
		chatContentDM: this.modules.cha.chatContent,
		chatContentGuild: this.modules.cha.chat,
		positionContainer: this.modules.pos.positionContainer,
		btnActive: BdApi.findModuleByProps("hoverScale", "active", "button").active,
		searchContainer: this.modules.inn.container,
		searchMedium: this.modules.inn.medium,
		searchInner: this.modules.inn.inner,
		searchInput: this.modules.inn.input,
	};
	favsvg_filled = `<svg class="${this.classes.size}" aria-hidden="false" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,17.6l3.6,2.2a1,1,0,0,0,1.5-1.1l-1-4.1a1,1,0,0,1,.3-1l3.2-2.8A1,1,0,0,0,19.5,9l-4.2-.4a.87.87,0,0,1-.8-.6L12.9,4.1a1.05,1.05,0,0,0-1.9,0l-1.6,4a1,1,0,0,1-.8.6L4.4,9a1.06,1.06,0,0,0-.6,1.8L7,13.6a.91.91,0,0,1,.3,1l-1,4.1a1,1,0,0,0,1.5,1.1l3.6-2.2A1.08,1.08,0,0,1,12.5,17.6Z"/></svg>`;
	favsvg_notfilled = `<svg class="${this.classes.iconGif}" aria-hidden="false" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19.6,9l-4.2-0.4c-0.4,0-0.7-0.3-0.8-0.6l-1.6-3.9c-0.3-0.8-1.5-0.8-1.8,0L9.4,8.1C9.3,8.4,9,8.6,8.6,8.7L4.4,9 c-0.9,0.1-1.2,1.2-0.6,1.8L7,13.6c0.3,0.2,0.4,0.6,0.3,1l-1,4.1c-0.2,0.9,0.7,1.5,1.5,1.1l3.6-2.2c0.3-0.2,0.7-0.2,1,0l3.6,2.2 c0.8,0.5,1.7-0.2,1.5-1.1l-1-4.1c-0.1-0.4,0-0.7,0.3-1l3.2-2.8C20.9,10.2,20.5,9.1,19.6,9z M12,15.4l-3.8,2.3l1-4.3l-3.3-2.9 l4.4-0.4l1.7-4l1.7,4l4.4,0.4l-3.3,2.9l1,4.3L12,15.4z"/></svg>`;
	favbtn_tab = `<div class="${this.classes.favButton} ${this.classes.size} ${this.classes.gifFavoriteButton} ${this.classes.selected}" tabindex="-1" role="button">${this.favsvg_filled}</div>`;
	classes_notselected = `${this.classes.navButton} ${this.classes.button} ${this.classes.lookBlank} ${this.classes.colorBrand} ${this.classes.grow}`;
	classes_selected = `${this.classes_notselected} ${this.classes.navButtonActive}`;
	chatimgbtn = `<div class="${this.classes.buttonContainer} image-button"><button aria-label="Open images tab" tabindex="0" type="button" class="${this.classes.button} ${this.classes.lookBlank} ${this.classes.colorBrand} ${this.classes.grow}"><div class="${this.classes.contents} ${this.classes.button1} ${this.classes.button2}"><div class="${this.classes.buttonWrapper}"><svg width="24" height="24" class="${this.classes.iconBtn}" aria-hidden="false" viewBox="0 0 384 384"><path fill="currentColor" d="M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z"/></svg></div></div></button></div>`;
	chatvidbtn = `<div class="${this.classes.buttonContainer} video-button"><button aria-label="Open videos tab" tabindex="0" type="button" class="${this.classes.button} ${this.classes.lookBlank} ${this.classes.colorBrand} ${this.classes.grow}"><div class="${this.classes.contents} ${this.classes.button1} ${this.classes.button2}"><div class="${this.classes.buttonWrapper}"><svg width="24" height="24" class="${this.classes.iconBtn}" aria-hidden="false" viewBox="0 0 298 298"><path fill="currentColor" d="M298,33c0-13.255-10.745-24-24-24H24C10.745,9,0,19.745,0,33v232c0,13.255,10.745,24,24,24h250c13.255,0,24-10.745,24-24V33zM91,39h43v34H91V39z M61,259H30v-34h31V259z M61,73H30V39h31V73z M134,259H91v-34h43V259z M123,176.708v-55.417c0-8.25,5.868-11.302,12.77-6.783l40.237,26.272c6.902,4.519,6.958,11.914,0.056,16.434l-40.321,26.277C128.84,188.011,123,184.958,123,176.708z M207,259h-43v-34h43V259z M207,73h-43V39h43V73z M268,259h-31v-34h31V259z M268,73h-31V39h31V73z"/></svg></div></div></button></div>`;
	chataudbtn = `<div class="${this.classes.buttonContainer} audio-button"><button aria-label="Open audios tab" tabindex="0" type="button" class="${this.classes.button} ${this.classes.lookBlank} ${this.classes.colorBrand} ${this.classes.grow}"><div class="${this.classes.contents} ${this.classes.button1} ${this.classes.button2}"><div class="${this.classes.buttonWrapper}"><svg width="24" height="24" class="${this.classes.iconBtn}" aria-hidden="false" viewBox="0 0 115.3 115.3"><path fill="currentColor" d="M47.9,14.306L26,30.706H6c-3.3,0-6,2.7-6,6v41.8c0,3.301,2.7,6,6,6h20l21.9,16.4c4,3,9.6,0.2,9.6-4.8v-77C57.5,14.106,51.8,11.306,47.9,14.306z"/><path fill="currentColor" d="M77.3,24.106c-2.7-2.7-7.2-2.7-9.899,0c-2.7,2.7-2.7,7.2,0,9.9c13,13,13,34.101,0,47.101c-2.7,2.7-2.7,7.2,0,9.899c1.399,1.4,3.199,2,4.899,2s3.601-0.699,4.9-2.1C95.8,72.606,95.8,42.606,77.3,24.106z"/><path fill="currentColor" d="M85.1,8.406c-2.699,2.7-2.699,7.2,0,9.9c10.5,10.5,16.301,24.4,16.301,39.3s-5.801,28.8-16.301,39.3c-2.699,2.7-2.699,7.2,0,9.9c1.4,1.399,3.2,2.1,4.9,2.1c1.8,0,3.6-0.7,4.9-2c13.1-13.1,20.399-30.6,20.399-49.2c0-18.6-7.2-36-20.399-49.2C92.3,5.706,87.9,5.706,85.1,8.406z"/></svg></div></div></button></div>`;
	press = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true });

	getName() { return this.config.info.name; }
	getAuthor() { return this.config.info.author; }
	getDescription() { return this.config.info.description; }
	getVersion() { return this.config.info.version; }

	getSettingsPanel() {
		const wrapper = document.createElement("div");
		wrapper.id = "FavoriteMediaSettings";

		// Enable buttons
		const button1 = document.createElement("div");
		button1.classList.add("bd-switch", ...(this.enableButtons ? ["bd-switch-checked"] : []));

		const input1 = document.createElement("input");
		input1.type = "checkbox";
		input1.className = "bd-checkbox";
		button1.appendChild(input1);
		input1.onclick = () => {
			this.enableButtons = !this.enableButtons;
			BdApi.saveData(this.getName(), "enableButtons", this.enableButtons);
			button1.classList.remove(...(this.enableButtons ? [] : ["bd-switch-checked"]));
			button1.classList.add(...(this.enableButtons ? ["bd-switch-checked"] : []));
			if (this.enableButtons) this.addButtonsOnChat();
			else this.removeChatButtons();
		};

		const description1 = document.createElement("div");
		description1.innerText = "Toggle medias buttons next to GIF/Emoji ones";
		description1.style.margin = "1em auto";
		description1.appendChild(button1);
		wrapper.appendChild(description1);


		// Enable video autoplay on right-click
		const button2 = document.createElement("div");
		button2.classList.add("bd-switch", ...(this.enableVideoAutoplayOnRightClick ? ["bd-switch-checked"] : []));

		const input2 = document.createElement("input");
		input2.type = "checkbox";
		input2.className = "bd-checkbox";
		button2.appendChild(input2);
		input2.onclick = () => {
			this.enableVideoAutoplayOnRightClick = !this.enableVideoAutoplayOnRightClick;
			BdApi.saveData(this.getName(), "enableVideoAutoplayOnRightClick", this.enableVideoAutoplayOnRightClick);
			button2.classList.remove(...(this.enableVideoAutoplayOnRightClick ? [] : ["bd-switch-checked"]));
			button2.classList.add(...(this.enableVideoAutoplayOnRightClick ? ["bd-switch-checked"] : []));
		};

		const description2 = document.createElement("div");
		description2.innerText = "Toggle autoplay videos on right-click in the videos tab";
		description2.style.margin = "1em auto";
		description2.appendChild(button2);
		wrapper.appendChild(description2);
		return wrapper;
	}

	start() {
		let enableButtons = BdApi.loadData(this.getName(), "enableButtons");
		if (enableButtons !== true || enableButtons !== false) { enableButtons = true; BdApi.saveData(this.getName(), "enableButtons", enableButtons); } this.enableButtons = enableButtons;
		let enableVideoAutoplayOnRightClick = BdApi.loadData(this.getName(), "enableButtons");
		if (enableVideoAutoplayOnRightClick !== true || enableVideoAutoplayOnRightClick !== false) { enableVideoAutoplayOnRightClick = true; BdApi.saveData(this.getName(), "enableVideoAutoplayOnRightClick", enableVideoAutoplayOnRightClick); } this.enableVideoAutoplayOnRightClick = enableVideoAutoplayOnRightClick;
		const images = BdApi.loadData(this.getName(), "image");
		if (images) BdApi.saveData(this.getName(), "image", images.filter(i => i !== null || i != undefined));
		else BdApi.saveData(this.getName(), "image", []);
		const videos = BdApi.loadData(this.getName(), "video");
		if (videos) BdApi.saveData(this.getName(), "video", videos.filter(i => i !== null || i != undefined));
		else BdApi.saveData(this.getName(), "video", []);
		const audios = BdApi.loadData(this.getName(), "audio");
		if (audios) BdApi.saveData(this.getName(), "audio", audios.filter(i => i !== null || i != undefined));
		else BdApi.saveData(this.getName(), "audio", []);
		Object.defineProperties(this.press, { keyCode: { value: 13 }, which: { value: 13 } });
		if (this.enableButtons) this.addButtonsOnChat();
		BdApi.injectCSS(this.getName(), `
            .${this.classes.message.split(' ')[0]} div a:hover ~ .favbtn_image, .${this.classes.message.split(' ')[0]} div .favbtn_image:hover, .${this.classes.wrapper.split(' ')[0]}:hover .favbtn_video, .${this.classes.wrapperAudio.split(' ')[0]}:hover .favbtn_audio {
                opacity: 1;
                -webkit-transform: none;
                transform: none;
            }
            .favbtn_image, .favbtn_video, .favbtn_audio {
				position: absolute;
				z-index: 2;
                color: #fff;
                opacity: 0;
                cursor: pointer;
                -webkit-transition: opacity .1s ease,-webkit-transform .2s ease;
                transition: opacity .1s ease,-webkit-transform .2s ease;
                transition: transform .2s ease,opacity .1s ease;
                transition: transform .2s ease,opacity .1s ease,-webkit-transform .2s ease;
            }
            .favbtn_image {
                top: 8px;
                -webkit-transform: translateY(-10px);
                transform: translateY(-10px);
            }
            .favbtn_video {
                right: 8px;
                bottom: calc(50% - 1em);
                -webkit-transform: translateX(10px);
                transform: translateX(10px);
            }
			.favbtn_audio {
				right: 30%;
				-webkit-transform: translateY(-10px);
                transform: translateY(-10px);
			}
            .favbtn_image:hover, .favbtn_image.favorited, .favbtn_video:hover, .favbtn_video.favorited, .favbtn_audio:hover, .favbtn_audio.favorited {
                color: #faa61a;
            }
            #imglist, #videolist, #audiolist {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
            }
            .${this.classes.parentContent.split(' ')[0]} .emptyItem, .${this.classes.parentContent.split(' ')[0]} .noItemFound {
                margin: 12px auto;
                color: var(--text-normal);
                text-align: center;
            }
            .${this.classes.parentContent.split(' ')[0]} .emptyItem p, .${this.classes.parentContent.split(' ')[0]} .noItemFound p {
                margin: 0 auto;
            }
            #FavoriteMediaSettings {
                color: var(--text-normal);
            }
            #FavoriteMediaSettings .bd-switch {
                float: right;
            }
			.favaudio_item {
				color: var(--text-normal);
				margin: 8px;
				font-size: 18px;
			}
			.favaudio_item_audio:focus {
				outline: none;
			}
        `);
	}
	stop() {
		BdApi.clearCSS(this.getName());
		this.removeChatButtons();
	}
	load() {
		if (window.ZLibrary) {
			PluginUpdater.checkForUpdate(
				this.getName(),
				this.getVersion(),
				"https://raw.githubusercontent.com/Dastan21/BDAddons/main/plugins/FavoriteMedia/FavoriteMedia.plugin.js"
			);
		} else {
			BdApi.showConfirmationModal("Library plugin is needed",
				[`The library plugin needed for ${this.config.info.name} is missing. Please click Download Now to install it.`], {
				confirmText: "Download",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
						if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					}); s
				}
			});
		}
	}
	observer(e) {
		// // Chat right buttons
		if (this.enableButtons && e.addedNodes[0] && e.target && (e.target.className === this.classes.chatContentDM || e.target.className === this.classes.chatContentGuild)) this.addButtonsOnChat();
		// On GIF/Emoji tab open/close
		if (e.target && e.target.className === this.classes.positionContainer) this.updateTabButtons(e.target);
		if (e.removedNodes[0] && e.removedNodes[0].childNodes[0] && e.removedNodes[0].childNodes[0].className === this.classes.positionContainer) this.updateBtnActive();
		// On media hover
		if (e.target && e.target.id && e.target.id.startsWith("chat-messages-")) this.checkForMedias(e.target.querySelector("." + this.classes.messageContainer.replace(' ', '.')));
	}
	updateTabButtons(node) {
		// sectiondiv
		this.sectiondiv = node.firstChild.lastChild;
		this.sectiondiv.parentNode.parentNode.style.opacity = 0;
		// tab header
		const tabheader = document.createElement("div");
		tabheader.className = this.classes.header;
		// tab contents
		const tabcontent4 = document.createElement("div"); tabcontent4.style = "position: absolute; left: 12px; top: 12px; width: calc(100% - 12px);";
		const tabcontent3 = document.createElement("div"); tabcontent3.className = this.classes.parentContent; tabcontent3.append(tabcontent4);
		const tabcontent2 = document.createElement("div"); tabcontent2.className = this.classes.itemContainer + ' ' + this.classes.thin + ' ' + this.classes.scrollerBase + ' ' + this.classes.fade; tabcontent2.style = "overflow: hidden scroll; padding-right: 0px"; tabcontent2.append(tabcontent3);
		const tabcontent1 = document.createElement("div"); tabcontent1.className = this.classes.childContent; tabcontent1.append(tabcontent2);
		// imgtab
		this.imgtab = document.createElement("div");
		this.imgtab.id = "image-picker-tab-panel";
		this.imgtab.setAttribute("role", "tabpanel");
		this.imgtab.setAttribute("aria-labelledby", "image-picker-tab");
		this.imgtab.className = this.classes.tabContainer;
		this.imgtab.append(tabheader);
		this.imgtab.append(tabcontent1);
		this.sectiondiv.append(this.imgtab, this.sectiondiv.lastChild);
		// videotab
		this.vidtab = this.imgtab.cloneNode(true);
		this.vidtab.id = "video-picker-tab-panel";
		this.vidtab.setAttribute("aria-labelledby", "video-picker-tab");
		this.sectiondiv.append(this.vidtab, this.sectiondiv.lastChild);
		// audiotab
		this.audtab = this.imgtab.cloneNode(true);
		this.audtab.id = "audio-picker-tab-panel";
		this.audtab.setAttribute("aria-labelledby", "audio-picker-tab");
		this.sectiondiv.append(this.audtab, this.sectiondiv.lastChild);
		// navlist
		this.navlist = this.sectiondiv.firstChild.firstChild;
		// image button
		const imgbtn = this.navlist.lastChild.cloneNode(true);
		imgbtn.firstChild.firstChild.innerHTML = "Image";
		imgbtn.id = "image-picker-tab";
		imgbtn.setAttribute("aria-controls", "image-picker-tab-panel");
		imgbtn.onclick = () => { this.updateSelected("image"); this.switchToImageTab(); };
		this.navlist.append(imgbtn);
		// video button
		const videobtn = this.navlist.lastChild.cloneNode(true);
		videobtn.firstChild.firstChild.innerHTML = "Video";
		videobtn.id = "video-picker-tab";
		videobtn.setAttribute("aria-controls", "video-picker-tab-panel");
		videobtn.onclick = () => { this.updateSelected("video"); this.switchToVideoTab(); };
		this.navlist.append(videobtn);
		// video button
		const audiobtn = this.navlist.lastChild.cloneNode(true);
		audiobtn.firstChild.firstChild.innerHTML = "Audio";
		audiobtn.id = "audio-picker-tab";
		audiobtn.setAttribute("aria-controls", "audio-picker-tab-panel");
		audiobtn.onclick = () => { this.updateSelected("audio"); this.switchToAudioTab(); };
		this.navlist.append(audiobtn);
		// update menu selected
		for (let item of this.navlist.childNodes) item.firstChild.onclick = () => this.updateSelected(item.id.split('-')[0]);
		this.updateSelected(this.sectiondiv.parentNode.lastChild.lastChild.id.split('-')[0]);
		// add onclick on tab buttons
		this.sectiondiv.querySelector("#gif-picker-tab").onclick = () => this.lasttoggled = "gif";
		this.sectiondiv.querySelector("#emoji-picker-tab").onclick = () => this.lasttoggled = "emoji";
	}
	updateSelected(type) {
		if (!type || !this.navlist) return;
		for (let item of this.navlist.childNodes) {
			if (item.id.startsWith(type)) {
				item.setAttribute("aria-selected", true);
				item.firstChild.setAttribute("aria-current", "page");
				item.firstChild.className = this.classes_selected;
			} else {
				item.setAttribute("aria-selected", false);
				item.firstChild.removeAttribute("aria-current");
				item.firstChild.className = this.classes_notselected;
			}
		}
		this.sectiondiv.lastChild.style = "display:none";
		if (!["image", "video", "audio"].includes(type)) {
			if (this.vidtab) this.vidtab.style = "display:none";
			if (this.imgtab) this.imgtab.style = "display:none";
			if (this.audtab) this.audtab.style = "display:none";
			this.sectiondiv.lastChild.style = "";
		} else {
			switch (type) {
				case "image": this.vidtab.style = "display:none"; this.audtab.style = "display:none"; break;
				case "video": this.imgtab.style = "display:none"; this.audtab.style = "display:none"; break;
				case "audio": this.imgtab.style = "display:none"; this.vidtab.style = "display:none"; break;
			}
		}
		setTimeout(() => this.sectiondiv.parentNode.parentNode.style.opacity = 1, 0);
		this.updateBtnActive(type);
	}
	updateBtnActive(type = "") {
		for (const t of ['gif', 'image', 'video', 'audio']) {
			if (t !== type && t !== "emoji") {
				const tbtn = document.querySelector(`.${t}-button > button`);
				if (tbtn) tbtn.classList.remove(this.classes.btnActive);
			} else {
				const emojibtn = document.querySelector(".emoji-button > button");
				if (emojibtn) emojibtn.firstChild.firstChild.style.filter = "grayscale(100%)";
				if (emojibtn) emojibtn.firstChild.firstChild.style.transform = "scale(1)";
			}
		}
		if (type === "emoji") {
			const emojibtn = document.querySelector(".emoji-button > button");
			if (emojibtn) emojibtn.firstChild.firstChild.style.filter = "grayscale(0%)";
			if (emojibtn) emojibtn.firstChild.firstChild.style.transform = "scale(1.14)";
		} else {
			const typebtn = document.querySelector(`.${type}-button > button`);
			if (typebtn) typebtn.classList.add(this.classes.btnActive);
		}
	}
	switchToImageTab() {
		this.imgtab.style = "";
		if (!this.imglist) this.imglist = this.imgtab.lastChild.firstChild.firstChild.firstChild;
		this.imglist.parentNode.style.height = null;
		this.imglist.style.height = null;
		const tmp = this.imglist.cloneNode(false);
		this.imglist.remove();
		this.imglist = tmp;
		this.imglist.id = "imglist";
		const width_item = 202;
		const imgcols = [];
		const showImages = (switchTo = false) => {
			const width = this.imgtab.clientWidth;
			if (width % width_item === 0 || switchTo) {
				this.imglist.innerHTML = "";
				imgcols.splice(0, imgcols.length);
				const n = Math.floor(width / width_item);
				const ratio = 100 / n;
				const imgurls = BdApi.loadData(this.getName(), "image").filter(u => u !== null || u !== undefined);
				if (!imgurls.length) this.imglist.append(this.createEmptyItem("image"));
				else {
					for (let i = 0; i < n; i++) {
						imgcols[i] = document.createElement("div");
						imgcols[i].style.width = `${ratio}%`;
						this.imglist.append(imgcols[i]);
					}
					for (let url of imgurls) {
						let j = 0;
						let min = 999999999;
						for (let i = 0; i < n; i++) {
							if (!imgcols[i].firstChild) { j = i; break };
							let c = 0;
							for (const item of imgcols[i].childNodes) c += item.clientHeight;
							if (c < min) {
								j = i;
								min = c;
							}
						}
						imgcols[j].append(this.createImageItem(url));
					}
				}
			}
		};
		this.imgtab.childNodes[1].firstChild.firstChild.append(this.imglist);
		addResizeListener(this.imgtab, showImages);
		showImages(true);
	}
	switchToVideoTab() {
		this.vidtab.style = "";
		if (!this.vidlist) this.vidlist = this.vidtab.lastChild.firstChild.firstChild.firstChild;
		this.vidlist.parentNode.style.height = null;
		this.vidlist.style.height = null;
		const tmp = this.vidlist.cloneNode(false);
		this.vidlist.remove();
		this.vidlist = tmp;
		this.vidlist.id = "videolist";
		const width_item = 202;
		const vidcols = [];
		const showVideos = (switchTo = false) => {
			const width = this.vidtab.clientWidth;
			if (width % width_item === 0 || switchTo) {
				this.vidlist.innerHTML = "";
				vidcols.splice(0, vidcols.length);
				const n = Math.floor(width / width_item);
				const ratio = 100 / n;
				const vidobjs = BdApi.loadData(this.getName(), "video").filter(u => u !== null || u !== undefined);
				if (!vidobjs.length) this.vidlist.append(this.createEmptyItem("video"));
				else {
					for (let i = 0; i < n; i++) {
						vidcols[i] = document.createElement("div");
						vidcols[i].style.width = `${ratio}%`;
						this.vidlist.append(vidcols[i]);
					}
					for (let obj of vidobjs) {
						let j = 0;
						let min = 999999999;
						for (let i = 0; i < n; i++) {
							if (!vidcols[i].firstChild) { j = i; break };
							let c = 0;
							for (const item of vidcols[i].childNodes) c += item.clientHeight;
							if (c < min) {
								j = i;
								min = c;
							}
						}
						vidcols[j].append(this.createVideoItem(obj));
					}
				}
			}
		};
		this.vidtab.childNodes[1].firstChild.firstChild.append(this.vidlist);
		addResizeListener(this.vidtab, showVideos);
		showVideos(true);
	}
	switchToAudioTab() {
		this.audtab.style = "";
		if (!this.audlist) this.audlist = this.audtab.lastChild.firstChild.firstChild.firstChild;
		this.audlist.parentNode.style.height = null;
		this.audlist.style.height = null;
		const tmp = this.audlist.cloneNode(false);
		this.audlist.remove();
		this.audlist = tmp;
		this.audlist.id = "audiolist";
		let filter = "";
		const width_item = 404;
		const audcols = [];
		const showAudios = (switchTo = false) => {
			const width = this.audtab.clientWidth;
			if (width % width_item === 0 || switchTo) {
				this.audlist.innerHTML = "";
				audcols.splice(0, audcols.length);
				const n = Math.floor(width / width_item);
				const ratio = 100 / n;
				const audobjs = BdApi.loadData(this.getName(), "audio").filter(u => u !== null && u !== undefined && u.split("/").pop().toLowerCase().includes(filter));
				if (!audobjs.length) this.audlist.append(this.createEmptyItem("audio"));
				else {
					for (let i = 0; i < n; i++) {
						audcols[i] = document.createElement("div");
						audcols[i].style.width = `${ratio}%`;
						this.audlist.append(audcols[i]);
					}
					let o = 0;
					for (let obj of audobjs) {
						audcols[o % n].append(this.createAudioItem(obj));
						o++;
					}
				}
			}
		};
		if (!this.audtab.querySelector("input")) {
			const flex = document.createElement("div");
			flex.style = "flex: 1 1 auto;";
			const container = document.createElement("div");
			container.className = `${this.classes.searchContainer} ${this.classes.searchMedium}`;
			const inner = document.createElement("div");
			inner.className = this.classes.searchInner;
			const input = document.createElement("input");
			const searchAudio = function () { filter = input.value; showAudios(true); }
			input.className = this.classes.searchInput;
			input.autofocus = true;
			input.placeholder = "Search for audio";
			input.oninput = searchAudio;
			inner.append(input);
			container.append(inner);
			flex.append(container);
			this.audtab.firstChild.append(flex);
		}
		this.audtab.childNodes[1].firstChild.firstChild.append(this.audlist);
		addResizeListener(this.audtab, showAudios);
		showAudios(true);
	}
	createImageItem(url) {
		// image item
		let imgitem = document.createElement("div");
		imgitem.className = this.classes.result;
		imgitem.setAttribute("tabindex", -1);
		imgitem.setAttribute("role", "button");
		imgitem.style = "margin: 0 0.375em 0.75em 0.375em;";
		imgitem.onclick = () => { if (this.checkImageFavorited(url)) this.sendMedia({ url: url }, "image"); };
		// image
		let imgitemimg = document.createElement("img");
		imgitemimg.alt = "";
		imgitemimg.className = this.classes.gif;
		imgitemimg.setAttribute("src", url);
		// fav button
		imgitem.innerHTML = this.favbtn_tab;
		imgitem.firstChild.onclick = () => {
			this.favoriteImage(imgitemimg);
			setTimeout(() => {
				this.updateSelected("image");
				this.switchToImageTab();
			}, 0);
		};
		imgitem.prepend(imgitemimg);

		return imgitem;
	}
	createVideoItem({ url, poster }) {
		// video item
		let videoitem = document.createElement("div");
		videoitem.className = this.classes.result;
		videoitem.setAttribute("tabindex", -1);
		videoitem.setAttribute("role", "button");
		videoitem.style = "margin: 0 0.375em 0.75em 0.375em;";
		videoitem.onclick = () => { if (this.checkVideoFavorited(url)) this.sendMedia({ url: url }, "video"); };
		// video
		let videoitemvideo = document.createElement("video");
		videoitemvideo.alt = "";
		videoitemvideo.className = this.classes.gif;
		videoitemvideo.setAttribute("src", url);
		videoitemvideo.setAttribute("poster", poster);
		videoitemvideo.volume = 0.1;
		if (this.enableVideoAutoplayOnRightClick) {
			videoitemvideo.oncontextmenu = () => videoitemvideo.play().catch(() => { });
			videoitemvideo.onmouseout = () => videoitemvideo.pause();
		}
		// fav button
		videoitem.innerHTML = this.favbtn_tab;
		videoitem.firstChild.onclick = () => {
			this.favoriteVideo(videoitemvideo, true);
			setTimeout(() => {
				this.updateSelected("video");
				this.switchToVideoTab();
			}, 0);
		};
		videoitem.append(videoitemvideo);

		return videoitem;
	}
	createAudioItem(url) {
		if (!url) return;
		const name = url.split("/").pop();
		// audio item
		let audioitem = document.createElement("div");
		audioitem.style.padding = "8px";
		audioitem.className = this.classes.result;
		audioitem.onclick = () => { if (this.checkAudioFavorited(url)) this.sendMedia({ url: url, name: name }, "audio"); };
		// audio
		const audioitemname = document.createElement("div");
		audioitemname.innerHTML = name;
		audioitemname.className = "favaudio_item";
		const audioitemaudio = document.createElement("audio");
		audioitemaudio.setAttribute("src", url);
		audioitemaudio.setAttribute("controls", true);
		audioitemaudio.style.width = "100%";
		audioitemaudio.className = "favaudio_item_audio";
		audioitemaudio.volume = 0.1;
		// fav button
		audioitem.innerHTML = this.favbtn_tab;
		audioitem.firstChild.onclick = () => {
			this.favoriteAudio(audioitemaudio);
			setTimeout(() => {
				this.updateSelected("audio");
				this.switchToAudioTab();
			}, 0);
		};
		audioitem.prepend(audioitemaudio);
		audioitem.prepend(audioitemname);

		return audioitem;
	}
	createEmptyItem(type) {
		let emptyitem = document.createElement("div");
		emptyitem.className = "emptyItem";
		emptyitem.innerHTML = `<p>It's quite empty here...</p><br><p>Add ${type}s to your favorites by clicking on ⭐ of any ${type}!</p>`;
		return emptyitem;
	}
	createNoItemFound() {
		let noitem = document.createElement("div");
		noitem.className = "noItemFound";
		noitem.innerHTML = `<p>Nothing found...</p>`;
		return noitem;
	}
	sendMedia({ url, name }, type) {
		if (this.lasttoggled === "emoji") BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatchToLastSubscribed("TOGGLE_EMOJI_POPOUT")
		else BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatchToLastSubscribed("TOGGLE_GIF_PICKER");
		if (type === "audio") {
			if (this.checkAudioFavorited(url)) {
				const channel_id = DiscordAPI.currentChannel.id;
				require("https").get(url, res => {
					const bufs = [];
					res.on('data', chunk => bufs.push(chunk));
					res.on('end', () => {
						try {
							BdApi.findModuleByProps('instantBatchUpload').upload(channel_id, new File([Buffer.concat(bufs)], name), 0, "", false, name);
						} catch (e) { console.error(e.message) }
					});
					res.on('error', err => console.error(err));
				});
			}
		} else {
			BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", { content: url });
			const textarea = document.querySelector("." + this.classes.slateTextArea.split(' ')[0]);
			if (textarea) setTimeout(() => textarea.firstChild.dispatchEvent(this.press), 0);
		}
	}
	checkForMedias(node) {
		for (let media of node.childNodes) {
			const img = media.querySelector("img"); if (img) this.addFavButtonOnImage(img.parentNode);
			const vid = media.querySelector("video"); if (vid) this.addFavButtonOnVideo(vid);
			const aud = media.querySelector("audio"); if (aud) this.addFavButtonOnAudio(aud.parentNode.firstChild);
		}
	}
	addFavButtonOnImage(node) {
		let tmp = document.createElement("div");
		tmp.className = this.classes.size + " favbtn_image";
		tmp.setAttribute("tabindex", -1);
		tmp.setAttribute("role", "button");
		tmp.style.left = "calc(" + node.style.width + " - 2.3em)";
		tmp.innerHTML = this.favsvg_notfilled;
		tmp.onclick = () => { this.favoriteImage(node) };
		if (this.checkImageFavorited(node.href)) {
			tmp.innerHTML = this.favsvg_filled;
			tmp.classList.add("favorited");
		} else {
			tmp.innerHTML = this.favsvg_notfilled;
			tmp.classList.remove("favorited");
		}
		node.parentNode.append(tmp);
	}
	addFavButtonOnVideo(node) {
		let tmp = document.createElement("div");
		tmp.className = this.classes.size + " favbtn_video";
		tmp.setAttribute("tabindex", -1);
		tmp.setAttribute("role", "button");
		tmp.innerHTML = this.favsvg_notfilled;
		tmp.onclick = () => { this.favoriteVideo(node, false) };
		if (this.checkVideoFavorited(node.src)) {
			tmp.innerHTML = this.favsvg_filled;
			tmp.classList.add("favorited");
		} else {
			tmp.innerHTML = this.favsvg_notfilled;
			tmp.classList.remove("favorited");
		}
		node.parentNode.append(tmp);
	}
	addFavButtonOnAudio(node) {
		let tmp = document.createElement("div");
		tmp.className = this.classes.size + " favbtn_audio";
		tmp.setAttribute("tabindex", -1);
		tmp.setAttribute("role", "button");
		tmp.innerHTML = this.favsvg_notfilled;
		tmp.onclick = () => { this.favoriteAudio(node.lastChild) };
		if (this.checkAudioFavorited(node.lastChild.href)) {
			tmp.innerHTML = this.favsvg_filled;
			tmp.classList.add("favorited");
		} else {
			tmp.innerHTML = this.favsvg_notfilled;
			tmp.classList.remove("favorited");
		}
		node.insertBefore(tmp, node.childNodes[node.childNodes.length - 1]);
	}
	checkImageFavorited(url) {
		return BdApi.loadData(this.getName(), "image").includes(url);
	}
	checkVideoFavorited(url) {
		for (let obj of BdApi.loadData(this.getName(), "video")) if (obj && obj.url.split("attachments")[1] === url.split("attachments")[1]) return true;
		return false;
	}
	checkAudioFavorited(url) {
		return BdApi.loadData(this.getName(), "audio").filter(u => u.endsWith(url.split('/').pop())).length;
	}
	favoriteImage(origin) {
		let url = origin.href || origin.src;
		let urls = BdApi.loadData(this.getName(), "image");
		if (this.checkImageFavorited(url)) {
			urls = urls.filter(u => u !== url)
			origin.parentNode.lastChild.innerHTML = this.favsvg_notfilled;
			origin.parentNode.lastChild.classList.remove("favorited");
		} else {
			urls.unshift(url);
			origin.parentNode.lastChild.innerHTML = this.favsvg_filled;
			origin.parentNode.lastChild.classList.add("favorited");
		}
		BdApi.saveData(this.getName(), "image", urls.filter(u => u !== null || u !== undefined));
	}
	favoriteVideo(origin, isFromTab) {
		let url = origin.src.replace("media.discordapp.net", "cdn.discordapp.com");
		let poster = origin.getAttribute("poster");
		let favel = origin.parentNode.lastChild;
		if (isFromTab) {
			url = origin.src;
			poster = poster;
		}
		let urls = BdApi.loadData(this.getName(), "video");
		if (this.checkVideoFavorited(url)) {
			urls = urls.filter(o => o && o.url !== url)
			favel.innerHTML = this.favsvg_notfilled;
			favel.classList.remove("favorited");
		} else {
			urls.unshift({ url: url, poster: poster });
			favel.innerHTML = this.favsvg_filled;
			favel.classList.add("favorited");
		}
		BdApi.saveData(this.getName(), "video", urls.filter(u => u !== null || u !== undefined));
	}
	favoriteAudio(origin) {
		let url = origin.href || origin.src;
		if (!url) return;
		let name = url.split('/').pop();
		let urls = BdApi.loadData(this.getName(), "audio");
		if (this.checkAudioFavorited(url)) {
			urls = urls.filter(u => u.split('/').pop() !== name)
			origin.parentNode.lastChild.previousSibling.innerHTML = this.favsvg_notfilled;
			origin.parentNode.lastChild.previousSibling.classList.remove("favorited");
		} else {
			urls.unshift(url);
			origin.parentNode.lastChild.previousSibling.innerHTML = this.favsvg_filled;
			origin.parentNode.lastChild.previousSibling.classList.add("favorited");
		}
		BdApi.saveData(this.getName(), "audio", urls.filter(u => u !== null || u !== undefined));
	}
	addButtonsOnChat() {
		const btnswrapper = document.querySelector("." + this.classes.buttons.split(' ')[0]); if (!btnswrapper || (btnswrapper && !btnswrapper.firstChild)) return;
		const btns = DOMTools.queryAll("." + this.classes.buttonContainer.split(' ')[0], btnswrapper); if (!btns) return;
		if (btns[0]) btns[0].classList.add("gif-button");
		if (btns[1] && btns[1].firstChild && btns[1].firstChild.className.includes("emoji")) btns[1].classList.add("emoji-button");
		else if (btns[0]) { btns[0].classList.add("emoji-button"); btns[0].classList.remove("gif-button"); }
		if (!btnswrapper.querySelector(".image-button")) {
			this.imgbtn = DOMTools.parseHTML(this.chatimgbtn);
			this.imgbtn.firstChild.onclick = () => {
				BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatchToLastSubscribed("TOGGLE_GIF_PICKER");
				setTimeout(() => {
					this.switchToImageTab();
					this.updateSelected("image");
					this.lasttoggled = "gif";
				}, 0);
			};
			if (btns[btns.length - 1] && btns[btns.length - 1].classList.contains("emoji-button")) btnswrapper.append(this.imgbtn);
			else btnswrapper.insertBefore(this.imgbtn, btnswrapper.lastChild);
		}
		if (!btnswrapper.querySelector(".video-button")) {
			this.vidbtn = DOMTools.parseHTML(this.chatvidbtn);
			this.vidbtn.firstChild.onclick = () => {
				BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatchToLastSubscribed("TOGGLE_GIF_PICKER");
				setTimeout(() => {
					this.switchToVideoTab();
					this.updateSelected("video");
					this.lasttoggled = "gif";
				}, 0);
			};
			if (btns[btns.length - 1] && btns[btns.length - 1].classList.contains("emoji-button")) btnswrapper.append(this.vidbtn);
			else btnswrapper.insertBefore(this.vidbtn, btnswrapper.lastChild);
		}
		if (!btnswrapper.querySelector(".audio-button")) {
			this.audbtn = DOMTools.parseHTML(this.chataudbtn);
			this.audbtn.firstChild.onclick = () => {
				BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatchToLastSubscribed("TOGGLE_GIF_PICKER");
				setTimeout(() => {
					this.switchToAudioTab();
					this.updateSelected("audio");
					this.lasttoggled = "gif";
				}, 0);
			};
			if (btns[btns.length - 1] && btns[btns.length - 1].classList.contains("emoji-button")) btnswrapper.append(this.audbtn);
			else btnswrapper.insertBefore(this.audbtn, btnswrapper.lastChild);
		}
		const gif_btn = btnswrapper.querySelector(".gif-button");
		if (gif_btn) gif_btn.onclick = () => { this.updateSelected("gif"); this.lasttoggled = "gif"; }
		const emoji_btn = btnswrapper.querySelector(".emoji-button");
		if (emoji_btn) emoji_btn.onclick = () => { this.updateSelected("emoji"); this.lasttoggled = "emoji"; }
	}
	removeChatButtons() {
		if (this.imgbtn) { this.imgbtn.remove(); this.imgbtn = null; }
		if (this.vidbtn) { this.vidbtn.remove(); this.vidbtn = null; }
		if (this.audbtn) { this.audbtn.remove(); this.audbtn = null; }
	}
}

(function () {
	var attachEvent = document.attachEvent;
	var isIE = navigator.userAgent.match(/Trident/);
	var requestFrame = (function () {
		var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
			function (fn) { return window.setTimeout(fn, 20); };
		return function (fn) { return raf(fn); };
	})();

	var cancelFrame = (function () {
		var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
			window.clearTimeout;
		return function (id) { return cancel(id); };
	})();

	function resizeListener(e) {
		var win = e.target || e.srcElement;
		if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
		win.__resizeRAF__ = requestFrame(function () {
			var trigger = win.__resizeTrigger__;
			trigger.__resizeListeners__.forEach(function (fn) {
				fn.call(trigger, e);
			});
		});
	}

	function objectLoad(e) {
		this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
		this.contentDocument.defaultView.addEventListener('resize', resizeListener);
	}

	window.addResizeListener = function (element, fn) {
		if (!element.__resizeListeners__) {
			element.__resizeListeners__ = [];
			if (attachEvent) {
				element.__resizeTrigger__ = element;
				element.attachEvent('onresize', resizeListener);
			}
			else {
				if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
				var obj = element.__resizeTrigger__ = document.createElement('object');
				obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
				obj.__resizeElement__ = element;
				obj.onload = objectLoad;
				obj.type = 'text/html';
				if (isIE) element.appendChild(obj);
				obj.data = 'about:blank';
				if (!isIE) element.appendChild(obj);
			}
		}
		element.__resizeListeners__.push(fn);
	};

	window.removeResizeListener = function (element, fn) {
		element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
		if (!element.__resizeListeners__.length) {
			if (attachEvent) element.detachEvent('onresize', resizeListener);
			else {
				element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
				element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
			}
		}
	}
})();