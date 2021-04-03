/**
 * @name FavoriteImageVideo
 * @authorId 310450863845933057
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/FavoriteImageVideo
 */

const { DiscordAPI, DOMTools, PluginUpdater } = ZLibrary;

class FavoriteImageVideo {


	config = {
		info: {
			name: "FavoriteImageVideo",
			author: "Dastan21",
			version: "1.3.2",
			description: "Adds Image/Video tabs, on the GIF/Emojis panel, to post favorited images and videos."
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
	classes = {
		size: BdApi.findModuleByProps("size", "gifFavoriteButton", "selected").size,
		iconGif: BdApi.findModuleByProps("size", "gifFavoriteButton", "selected").icon,
		gifFavoriteButton: BdApi.findModuleByProps("size", "gifFavoriteButton", "selected").gifFavoriteButton,
		selected: BdApi.findModuleByProps("size", "gifFavoriteButton", "selected").selected,
		favButton: BdApi.findModuleByProps("desiredItemWidth", "results", "result").favButton,
		navButton: BdApi.findModuleByProps("positionLayer", "positionContainer", "positionContainerOnlyEmoji").navButton,
		navButtonActive: BdApi.findModuleByProps("positionLayer", "positionContainer", "positionContainerOnlyEmoji").navButtonActive,
		button: BdApi.findModuleByProps("button", "lookFilled", "colorBrand").button,
		lookBlank: BdApi.findModuleByProps("button", "lookFilled", "colorBrand").lookBlank,
		colorBrand: BdApi.findModuleByProps("button", "lookFilled", "colorBrand").colorBrand,
		grow: BdApi.findModuleByProps("button", "lookFilled", "colorBrand").grow,
		tabContainer: BdApi.findModuleByProps("gutterSize", "container", "content").container,
		parentContent: BdApi.findModuleByProps("scrollerBase", "thin", "fade").content,
		itemContainer: BdApi.findModuleByProps("container", "categoryFade", "categoryFadeBlurple").container,
		thin: BdApi.findModuleByProps("scrollerBase", "thin", "fade").thin,
		scrollerBase: BdApi.findModuleByProps("scrollerBase", "thin", "fade").scrollerBase,
		fade: BdApi.findModuleByProps("scrollerBase", "thin", "fade").fade,
		childContent: BdApi.findModuleByProps("gutterSize", "container", "content").content,
		header: BdApi.findModuleByProps("gutterSize", "container", "content").header,
		result: BdApi.findModuleByProps("desiredItemWidth", "results", "result").result,
		gif: BdApi.findModuleByProps("desiredItemWidth", "results", "result").gif,
		message: BdApi.findModuleByProps("ephemeral", "mentioned", "replying").message,
		wrapper: BdApi.findModuleByProps("wrapper", "wrapperAudio", "wrapperControlsHidden").wrapper,
		buttons: BdApi.findModuleByProps("textAreaHeight", "channelTextArea", "highlighted").buttons,
		iconBtn: BdApi.findModuleByProps("hoverScale", "buttonWrapper", "button").icon,
		buttonContainer: BdApi.findModuleByProps("textAreaHeight", "channelTextArea", "highlighted").buttonContainer,
		contents: BdApi.findModuleByProps("button", "lookFilled", "colorBrand").contents,
		button1: BdApi.findModuleByProps("hoverScale", "buttonWrapper", "button").button,
		button2: BdApi.findModuleByProps("textAreaHeight", "channelTextArea", "highlighted").button,
		buttonWrapper: BdApi.findModuleByProps("hoverScale", "buttonWrapper", "button").buttonWrapper,
		slateTextArea: BdApi.findModuleByProps("slateContainer", "slateTextArea", "placeholder").slateTextArea,
		emojiButtonNormal: BdApi.findModuleByProps("emojiButton", "emojiButtonHovered", "emojiButtonNormal").emojiButtonNormal,
		emojiButtonHovered: BdApi.findModuleByProps("emojiButton", "emojiButtonHovered", "emojiButtonNormal").emojiButtonHovered,
		messageContainer: BdApi.findModuleByProps("container", "gifFavoriteButton", "embedWrapper").container,
		chatContentDM: BdApi.findModuleByProps("chat", "threadSidebar", "uploadArea").chatContent,
		chatContentGuild: BdApi.findModuleByProps("chat", "threadSidebar", "uploadArea").chat,
		positionContainer: BdApi.findModuleByProps("positionLayer", "positionContainer", "positionContainerOnlyEmoji").positionContainer,
		btnActive: BdApi.findModuleByProps("hoverScale", "active", "button").active,
	};
	favsvg_filled = `<svg class="${this.classes.size}" aria-hidden="false" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,17.6l3.6,2.2a1,1,0,0,0,1.5-1.1l-1-4.1a1,1,0,0,1,.3-1l3.2-2.8A1,1,0,0,0,19.5,9l-4.2-.4a.87.87,0,0,1-.8-.6L12.9,4.1a1.05,1.05,0,0,0-1.9,0l-1.6,4a1,1,0,0,1-.8.6L4.4,9a1.06,1.06,0,0,0-.6,1.8L7,13.6a.91.91,0,0,1,.3,1l-1,4.1a1,1,0,0,0,1.5,1.1l3.6-2.2A1.08,1.08,0,0,1,12.5,17.6Z"/></svg>`;
	favsvg_notfilled = `<svg class="${this.classes.iconGif}" aria-hidden="false" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19.6,9l-4.2-0.4c-0.4,0-0.7-0.3-0.8-0.6l-1.6-3.9c-0.3-0.8-1.5-0.8-1.8,0L9.4,8.1C9.3,8.4,9,8.6,8.6,8.7L4.4,9 c-0.9,0.1-1.2,1.2-0.6,1.8L7,13.6c0.3,0.2,0.4,0.6,0.3,1l-1,4.1c-0.2,0.9,0.7,1.5,1.5,1.1l3.6-2.2c0.3-0.2,0.7-0.2,1,0l3.6,2.2 c0.8,0.5,1.7-0.2,1.5-1.1l-1-4.1c-0.1-0.4,0-0.7,0.3-1l3.2-2.8C20.9,10.2,20.5,9.1,19.6,9z M12,15.4l-3.8,2.3l1-4.3l-3.3-2.9 l4.4-0.4l1.7-4l1.7,4l4.4,0.4l-3.3,2.9l1,4.3L12,15.4z"/></svg>`;
	favbtn_tab = `<div class="${this.classes.favButton} ${this.classes.size} ${this.classes.gifFavoriteButton} ${this.classes.selected}" tabindex="-1" role="button">${this.favsvg_filled}</div>`;
	classes_notselected = `${this.classes.navButton} ${this.classes.button} ${this.classes.lookBlank} ${this.classes.colorBrand} ${this.classes.grow}`;
	classes_selected = `${this.classes_notselected} ${this.classes.navButtonActive}`;
	chatimgbtn = `<div class="${this.classes.buttonContainer} image-button"><button aria-label="Open images tab" tabindex="0" type="button" class="${this.classes.button} ${this.classes.lookBlank} ${this.classes.colorBrand} ${this.classes.grow}"><div class="${this.classes.contents} ${this.classes.button1} ${this.classes.button2}"><div class="${this.classes.buttonWrapper}"><svg width="24" height="24" class="${this.classes.iconBtn}" aria-hidden="false" viewBox="0 0 384 384"><path fill="currentColor" d="M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z"/></svg></div></div></button></div>`;
	chatvidbtn = `<div class="${this.classes.buttonContainer} video-button"><button aria-label="Open videos tab" tabindex="0" type="button" class="${this.classes.button} ${this.classes.lookBlank} ${this.classes.colorBrand} ${this.classes.grow}"><div class="${this.classes.contents} ${this.classes.button1} ${this.classes.button2}"><div class="${this.classes.buttonWrapper}"><svg width="24" height="24" class="${this.classes.iconBtn}" aria-hidden="false" viewBox="0 0 298 298"><path fill="currentColor" d="M298,33c0-13.255-10.745-24-24-24H24C10.745,9,0,19.745,0,33v232c0,13.255,10.745,24,24,24h250c13.255,0,24-10.745,24-24V33zM91,39h43v34H91V39z M61,259H30v-34h31V259z M61,73H30V39h31V73z M134,259H91v-34h43V259z M123,176.708v-55.417c0-8.25,5.868-11.302,12.77-6.783l40.237,26.272c6.902,4.519,6.958,11.914,0.056,16.434l-40.321,26.277C128.84,188.011,123,184.958,123,176.708z M207,259h-43v-34h43V259z M207,73h-43V39h43V73z M268,259h-31v-34h31V259z M268,73h-31V39h31V73z"/></svg></div></div></button></div>`;
	press = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true });

	getName() { return this.config.info.name; }
	getAuthor() { return this.config.info.author; }
	getDescription() { return this.config.info.description; }
	getVersion() { return this.config.info.version; }

	getSettingsPanel() {
		const wrapper = document.createElement("div");
		wrapper.id = "favoriteImageVideoSettings";

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
		description1.innerText = "Toggle Image/Video buttons next to GIF/Emoji ones";
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
		Object.defineProperties(this.press, { keyCode: { value: 13 }, which: { value: 13 } });
		if (this.enableButtons) this.addButtonsOnChat();
		// Observer
		BdApi.injectCSS('FavoriteImageVideo', `
            .${this.classes.message.split(' ')[0]} div a:hover ~ #favbtn_image, .${this.classes.message.split(' ')[0]} div #favbtn_image:hover {
                opacity: 1;
                -webkit-transform: none;
                transform: none;
            }
            .${this.classes.wrapper.split(' ')[0]}:hover #favbtn_video {
                opacity: 1;
                -webkit-transform: none;
                transform: none;
            }
            #favbtn_image, #favbtn_video {
                position: absolute;
                color: #fff;
                opacity: 0;
                cursor: pointer;
                -webkit-transition: opacity .1s ease,-webkit-transform .2s ease;
                transition: opacity .1s ease,-webkit-transform .2s ease;
                transition: transform .2s ease,opacity .1s ease;
                transition: transform .2s ease,opacity .1s ease,-webkit-transform .2s ease;
            }
            #favbtn_image {
                top: 8px;
                -webkit-transform: translateY(-10px);
                transform: translateY(-10px);
            }
            #favbtn_video {
                right: 8px;
                bottom: calc(50% - 1em);
                -webkit-transform: translateX(10px);
                transform: translateX(10px);
            }
            #favbtn_image:hover, #favbtn_image.favorited, #favbtn_video:hover, #favbtn_video.favorited {
                color: #faa61a;
            }
            #imglist, #videolist {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
            }
            .${this.classes.parentContent.split(' ')[0]} .emptyItem {
                margin: 5px auto;
                color: var(--text-normal);
                text-align: center;
            }
            .${this.classes.parentContent.split(' ')[0]} .emptyItem p {
                margin: 0 auto;
            }
            #favoriteImageVideoSettings {
                color: var(--text-normal);
            }
            #favoriteImageVideoSettings .bd-switch {
                float: right;
            }
        `);
	}
	stop() {
		BdApi.clearCSS('FavoriteImageVideo');
		this.removeChatButtons();
	}
	load() {
		if (window.ZLibrary) {
			PluginUpdater.checkForUpdate(
				this.getName(),
				this.getVersion(),
				"https://raw.githubusercontent.com/Dastan21/BDAddons/main/plugins/FavoriteImageVideo/FavoriteImageVideo.plugin.js"
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
		// Chat right buttons
		if (this.enableButtons && e.addedNodes[0] && e.target && (e.target.className === this.classes.chatContentDM || e.target.className === this.classes.chatContentGuild)) this.addButtonsOnChat();
		// On GIF/Emoji tab open/close
		if (e.addedNodes[0] && e.addedNodes[0].childNodes[0] && e.addedNodes[0].childNodes[0].className === this.classes.positionContainer) this.updateTabButtons(e.addedNodes[0].childNodes[0]);
		if (e.removedNodes[0] && e.removedNodes[0].childNodes[0] && e.removedNodes[0].childNodes[0].className === this.classes.positionContainer) this.updateBtnActive();
		// On media hover
		if (e.target && typeof (e.target.className) === "string" && e.target.className.includes(this.classes.message) && e.target.querySelector("." + this.classes.messageContainer.split(' ')[0]) && e.target.childNodes[e.target.childElementCount - 2].childElementCount) this.checkForImagesVideos(e.target.querySelector("." + this.classes.messageContainer.split(' ')[0]));
	}
	updateTabButtons(node) {
		// sectiondiv
		this.sectiondiv = node.firstChild.lastChild;
		this.sectiondiv.parentNode.parentNode.style.opacity = 0;
		// tab header
		const tabheader = document.createElement("div");
		tabheader.className = this.classes.header;
		// tab contents
		const tabcontent4 = document.createElement("div"); tabcontent4.style = "position: absolute; left: 12px; top: 12px; width: 400px;";
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
		if (!["image", "video"].includes(type)) {
			if (this.vidtab) this.vidtab.style = "display:none";
			if (this.imgtab) this.imgtab.style = "display:none";
			this.sectiondiv.lastChild.style = "";
		} else {
			if (type === "image") this.vidtab.style = "display:none";
			else this.imgtab.style = "display:none";
		}
		setTimeout(() => this.sectiondiv.parentNode.parentNode.style.opacity = 1, 100);
		this.updateBtnActive(type);
	}
	updateBtnActive(type = "") {
		for (const t of ['gif', 'image', 'video']) {
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
		this.imgtab.lastChild.firstChild.firstChild.style.height = null;
		this.imgtab.lastChild.firstChild.firstChild.firstChild.style.height = null;
		this.imglist = this.imgtab.lastChild.firstChild.firstChild.firstChild;
		const tmp = this.imglist.cloneNode(false);
		this.imglist.remove();
		this.imglist = tmp;
		this.imglist.id = "imglist";
		this.imgtab.lastChild.firstChild.firstChild.append(this.imglist);
		const imgurls = BdApi.loadData(this.getName(), "image");
		const imgcolleft = document.createElement("div");
		imgcolleft.style.width = "50%";
		const imgcolright = imgcolleft.cloneNode();
		let u = 0;
		for (let url of imgurls) {
			if (url) {
				if (u % 2 === 0) imgcolleft.append(this.createImageItem(url));
				else imgcolright.append(this.createImageItem(url));
				u++;
			}
		}
		if (!imgurls.length) this.imglist.append(this.createEmptyItem("image"));
		else {
			this.imglist.append(imgcolleft);
			this.imglist.append(imgcolright);
		}
	}
	switchToVideoTab() {
		this.vidtab.style = "";
		this.vidtab.lastChild.firstChild.firstChild.style.height = null;
		this.vidtab.lastChild.firstChild.firstChild.firstChild.style.height = null;
		this.vidlist = this.vidtab.lastChild.firstChild.firstChild.firstChild;
		const tmp = this.vidlist.cloneNode(false);
		this.vidlist.remove();
		this.vidlist = tmp;
		this.vidlist.id = "videolist";
		this.vidtab.lastChild.firstChild.firstChild.append(this.vidlist);
		const vidobjs = BdApi.loadData(this.getName(), "video");
		const vidcolleft = document.createElement("div");
		vidcolleft.style.width = "50%";
		const vidcolright = vidcolleft.cloneNode();
		let o = 0;
		for (let vid of vidobjs) {
			if (vid) {
				if (o % 2 === 0) vidcolleft.append(this.createVideoItem(vid));
				else vidcolright.append(this.createVideoItem(vid));
				o++;
			}
		}
		if (!vidobjs.length) this.vidlist.append(this.createEmptyItem("video"));
		else {
			this.vidlist.append(vidcolleft);
			this.vidlist.append(vidcolright);
		}
	}
	createImageItem(url) {
		// image item
		let imgitem = document.createElement("div");
		imgitem.className = this.classes.result;
		imgitem.setAttribute("tabindex", -1);
		imgitem.setAttribute("role", "button");
		imgitem.style = "margin: 0 0.375em 0.75em 0.375em;";
		imgitem.onclick = () => { if (this.checkImageFavorited(url)) this.sendImageVideo(url) };
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
		videoitem.onclick = () => { if (this.checkVideoFavorited(url)) this.sendImageVideo(url); };
		// video
		let videoitemvideo = document.createElement("video");
		videoitemvideo.alt = "";
		videoitemvideo.className = this.classes.gif;
		videoitemvideo.setAttribute("src", url);
		videoitemvideo.setAttribute("poster", poster);
		videoitemvideo.setAttribute("loop", true);
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
	createEmptyItem(type) {
		let emptyitem = document.createElement("div");
		emptyitem.className = "emptyItem";
		emptyitem.innerHTML = `<p>It's quite empty here...</p><br><p>Add ${type}s to your favorites by clicking on ⭐ of any ${type}!</p>`;
		return emptyitem;
	}
	sendImageVideo(url) {
		this.lasttoggled === "emoji" ?
			BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatchToLastSubscribed("TOGGLE_EMOJI_POPOUT")
			:
			BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatchToLastSubscribed("TOGGLE_GIF_PICKER");
		DiscordAPI.currentChannel.sendMessage(url);
	}
	checkForImagesVideos(node) {
		for (let media of node.childNodes) {
			if (media && media.parentNode && media.parentNode.lastChild && media.parentNode.lastChild.id !== "favbtn_image" && media.tagName !== "IFRAME" && media.firstChild && !media.firstChild.title) {
				if (media.firstChild && media.firstChild.tagName === "IMG") this.addFavButtonOnImage(media);
				if (media.firstChild && media.firstChild.firstChild && media.firstChild.tagName === "A" && media.firstChild.firstChild && media.firstChild.firstChild.tagName === "IMG") this.addFavButtonOnImage(media.firstChild);
			}
			if (media.firstChild && media.firstChild.firstChild && media.firstChild.firstChild.firstChild && media.firstChild.firstChild.firstChild.firstChild && media.firstChild.firstChild.firstChild.firstChild.tagName === "VIDEO") this.addFavButtonOnVideo(media.firstChild.firstChild.firstChild.firstChild);
			if (media.firstChild && media.firstChild.tagName !== "A" && media.firstChild.childNodes[1] && media.firstChild.childNodes[1].tagName === "VIDEO") this.addFavButtonOnVideo(media.firstChild.childNodes[1]);
		}
	}
	addFavButtonOnImage(node) {
		let tmp = document.createElement("div");
		tmp.id = "favbtn_image";
		tmp.className = this.classes.size;
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
		tmp.id = "favbtn_video";
		tmp.className = this.classes.size;
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
	checkImageFavorited(url) {
		return BdApi.loadData(this.getName(), "image").includes(url);
	}
	checkVideoFavorited(url) {
		for (let obj of BdApi.loadData(this.getName(), "video")) {
			if (obj && obj.url.split("attachments")[1] === url.split("attachments")[1]) return true;
		}
		return false;
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
		let url = origin.src;
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
				}, 0);
			};
			if (btns[btns.length - 1] && btns[btns.length - 1].classList.contains("emoji-button")) btnswrapper.append(this.vidbtn);
			else btnswrapper.insertBefore(this.vidbtn, btnswrapper.lastChild);
		}
		const gif_btn = btnswrapper.querySelector(".gif-button");
		if (gif_btn) gif_btn.onclick = () => { this.updateSelected("gif"); this.lasttoggled = "gif"; }
		const emoji_btn = btnswrapper.querySelector(".emoji-button");
		if (emoji_btn) emoji_btn.onclick = () => { this.updateSelected("emoji"); this.lasttoggled = "emoji"; }
	}
	removeChatButtons() {
		if (this.imgbtn) { this.imgbtn.remove(); this.imgbtn = null; }
		if (this.vidbtn) { this.vidbtn.remove(); this.imgbtn = null; }
	}
}