/**
 * @name FavoriteImageVideo
 * @authorId 310450863845933057
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/FavoriteImageVideo
 */


class FavoriteImageVideo {
    config = {
        info: {
            name: "FavoriteImageVideo",
            author: "Dastan21",
            version: "1.0.0",
            description: "Adds two buttons, on the GIF/Emojis tab, to bookmark images and videos."
        }
    };
    clipboard = null;
    sectiondiv = null;
    navlist = null;
    imgtab = null;
    imglist = null;
    videotab = null;
    videolist = null;
    classes = {
        size: BdApi.findModuleByProps("size", "gifFavoriteButton", "selected").size,
        icon: BdApi.findModuleByProps("size", "gifFavoriteButton", "selected").icon,
        gifFavoriteButton: BdApi.findModuleByProps("size", "gifFavoriteButton", "selected").gifFavoriteButton,
        selected: BdApi.findModuleByProps("size", "gifFavoriteButton", "selected").selected,
        favButton: BdApi.findModuleByProps("desiredItemWidth", "results", "result").favButton,
        navButtonActive: BdApi.findModuleByProps("positionContainer", "positionContainerEditingMessage", "drawerSizingWrapper").navButtonActive,
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
        message: BdApi.findModuleByProps("ephemeral", "mentioned", "replying").message.split(' ')[0],
        wrapper: BdApi.findModuleByProps("wrapper", "wrapperAudio", "wrapperControlsHidden").wrapper.split(' ')[0]
    };
    favsvg_filled = '<svg class="' + this.classes.size + '" aria-hidden="false" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5,17.6l3.6,2.2a1,1,0,0,0,1.5-1.1l-1-4.1a1,1,0,0,1,.3-1l3.2-2.8A1,1,0,0,0,19.5,9l-4.2-.4a.87.87,0,0,1-.8-.6L12.9,4.1a1.05,1.05,0,0,0-1.9,0l-1.6,4a1,1,0,0,1-.8.6L4.4,9a1.06,1.06,0,0,0-.6,1.8L7,13.6a.91.91,0,0,1,.3,1l-1,4.1a1,1,0,0,0,1.5,1.1l3.6-2.2A1.08,1.08,0,0,1,12.5,17.6Z"></path></svg>';
    favsvg_notfilled = '<svg class="' + this.classes.icon + '" aria-hidden="false" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19.6,9l-4.2-0.4c-0.4,0-0.7-0.3-0.8-0.6l-1.6-3.9c-0.3-0.8-1.5-0.8-1.8,0L9.4,8.1C9.3,8.4,9,8.6,8.6,8.7L4.4,9 c-0.9,0.1-1.2,1.2-0.6,1.8L7,13.6c0.3,0.2,0.4,0.6,0.3,1l-1,4.1c-0.2,0.9,0.7,1.5,1.5,1.1l3.6-2.2c0.3-0.2,0.7-0.2,1,0l3.6,2.2 c0.8,0.5,1.7-0.2,1.5-1.1l-1-4.1c-0.1-0.4,0-0.7,0.3-1l3.2-2.8C20.9,10.2,20.5,9.1,19.6,9z M12,15.4l-3.8,2.3l1-4.3l-3.3-2.9 l4.4-0.4l1.7-4l1.7,4l4.4,0.4l-3.3,2.9l1,4.3L12,15.4z"></path></svg>';
    favbtn_tab = '<div class="' + this.classes.favButton + ' ' + this.classes.size + ' ' + this.classes.gifFavoriteButton + ' ' + this.classes.selected + '" tabindex="-1" role="button">' + this.favsvg_filled + '</div>';
    classes_notselected = BdApi.findModuleByProps("positionContainer", "positionContainerEditingMessage", "drawerSizingWrapper").navButton + ' ' + this.classes.button + ' ' + this.classes.lookBlank + ' ' + this.classes.colorBrand + ' ' + this.classes.grow;
    classes_selected = this.classes_notselected + ' ' + this.classes.navButtonActive;


    getName() { return this.config.info.name; }
    getAuthor() { return this.config.info.author; }
    getDescription() { return this.config.info.description; }
    getVersion() { return this.config.info.version; }

    start() {
        this.clipboard = require('electron').clipboard;
        if (!Array.isArray(BdApi.loadData(this.getName(), "image"))) BdApi.saveData(this.getName(), "image", []);
        if (!Array.isArray(BdApi.loadData(this.getName(), "video"))) BdApi.saveData(this.getName(), "video", []);
        BdApi.injectCSS('FavoriteImageVideo', `
            .${this.classes.message} div:hover #favbtn_image {
                transform: translateY(0.4em) scale(1);
                opacity: 1;
            }
            .${this.classes.wrapper}:hover #favbtn_video {
                transform: translateX(-0.4em) scale(1);
                opacity: 1;
            }
            #favbtn_image, #favbtn_video {
                position: absolute;
                color: #fff;
                opacity: 0;
                cursor: pointer;
                transition: 0.2s;
                transform: scale(0.7);
            }
            #favbtn_image {
                left: 0.1em;
                top: 0;
            }
            #favbtn_video {
                transform: translateX(2em);
                right: 0.075em;
                bottom: 45%;
            }
            #favbtn_image:hover, #favbtn_image.favorited, #favbtn_video:hover, #favbtn_video.favorited {
                color: #faa61a;
            }
            #imglist, #videolist {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
            }
        `);
    }
    stop() {
        BdApi.clearCSS('FavoriteImageVideo');
    }
    load() {
        if (window.ZLibrary) {
            ZLibrary.PluginUpdater.checkForUpdate(
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
                    });
                }
            });
        }
    }
    observer(e) {
        // On GIF tab
        if (e.addedNodes[0] && e.addedNodes[0].tagName && e.addedNodes[0].tagName === "SECTION" && e.previousSibling) this.updateTabButtons(e.addedNodes[0]);
        // On image preview
        if (e.target && e.target.className.includes(this.classes.message) && e.target.childNodes[1].firstChild && e.target.childNodes[1].firstChild.firstChild && e.target.childNodes[1].firstChild.firstChild.tagName === "IMG") this.addFavButtonOnImage(e.target.childNodes[1]);
        if (e.target && e.target.className.includes(this.classes.message) && e.target.childNodes[1].firstChild && e.target.childNodes[1].firstChild.firstChild && e.target.childNodes[1].firstChild.firstChild.tagName === "A" && e.target.childNodes[1].firstChild.firstChild.firstChild && e.target.childNodes[1].firstChild.firstChild.firstChild.tagName === "IMG") this.addFavButtonOnImage(e.target.childNodes[1].firstChild);
        // On video preview
        if (e.target && e.target.className.includes(this.classes.message) && e.target.childNodes[1].firstChild && e.target.childNodes[1].firstChild.firstChild && e.target.childNodes[1].firstChild.firstChild.firstChild && e.target.childNodes[1].firstChild.firstChild.firstChild.firstChild && e.target.childNodes[1].firstChild.firstChild.firstChild.firstChild.firstChild && e.target.childNodes[1].firstChild.firstChild.firstChild.firstChild.firstChild.tagName === "VIDEO") this.addFavButtonOnVideo(e.target.childNodes[1].firstChild.firstChild.firstChild.firstChild.firstChild);
        if (e.target && e.target.className.includes(this.classes.message) && e.target.childNodes[1].firstChild && e.target.childNodes[1].firstChild.firstChild && e.target.childNodes[1].firstChild.firstChild.firstChild && e.target.childNodes[1].firstChild.firstChild.firstChild && e.target.childNodes[1].firstChild.firstChild.tagName !== "A" && e.target.childNodes[1].firstChild.firstChild.childNodes[1] && e.target.childNodes[1].firstChild.firstChild.childNodes[1].tagName === "VIDEO") this.addFavButtonOnVideo(e.target.childNodes[1].firstChild.firstChild.childNodes[1]);
    }
    updateTabButtons(node) {
        // sectiondiv
        this.sectiondiv = node.firstChild.lastChild;
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
        // classes names
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
        // add onclick on chat buttons
        this.sectiondiv.parentNode.parentNode.parentNode.firstChild.firstChild.lastChild.childNodes[1].onclick = () => this.updateSelected("gif");
        this.sectiondiv.parentNode.parentNode.parentNode.firstChild.firstChild.lastChild.childNodes[2].onclick = () => this.updateSelected("emoji");
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
        this.sectiondiv.lastChild.style = "display:none;";
        if (!["image", "video"].includes(type)) {
            this.sectiondiv.childNodes[1].style = "display:none;";
            this.sectiondiv.childNodes[2].style = "display:none;";
            this.sectiondiv.lastChild.style = "";
        } else {
            if (type === "image") this.sectiondiv.childNodes[2].style = "display:none;";
            else this.sectiondiv.childNodes[1].style = "display:none;";
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
        this.imglist.append(imgcolleft);
        this.imglist.append(imgcolright);
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
        this.vidlist.append(vidcolleft);
        this.vidlist.append(vidcolright);
    }
    createImageItem(url) {
        // image item
        let imgitem = document.createElement("div");
        imgitem.className = this.classes.result;
        imgitem.setAttribute("tabindex", -1);
        imgitem.setAttribute("role", "button");
        imgitem.style = "margin: 0 0.375em 0.75em 0.375em;";
        imgitem.onclick = () => {
            if (this.checkImageFavorited(url)) {
                this.clipboard.writeText(url);
                BdApi.showToast("Copied to clipboard!", {timeout: 500});
                this.sectiondiv.parentNode.parentNode.style.display = "none";
            }
        };
        // image
        let imgitemimg = document.createElement("img");
        imgitemimg.alt = "";
        imgitemimg.className = this.classes.gif;
        imgitemimg.setAttribute("src", url);
        // fav button
        imgitem.innerHTML = this.favbtn_tab;
        imgitem.firstChild.onclick = () => {
            this.favoriteImage(imgitemimg);
            this.switchToImageTab();
        };
        imgitem.prepend(imgitemimg);
        
        return imgitem;
    }
    createVideoItem({url, poster}) {
        // video item
        let videoitem = document.createElement("div");
        videoitem.className = this.classes.result;
        videoitem.setAttribute("tabindex", -1);
        videoitem.setAttribute("role", "button");
        videoitem.style = "margin: 0 0.375em 0.75em 0.375em;";
        videoitem.onclick = () => {
            if (this.checkVideoFavorited(poster)) {
                this.clipboard.writeText(url);
                BdApi.showToast("Copied to clipboard!", {timeout: 500});
                this.sectiondiv.parentNode.parentNode.style.display = "none";
            }
        };
        // video
        let videoitemvideo = document.createElement("img");
        videoitemvideo.alt = "";
        videoitemvideo.className = this.classes.gif;
        videoitemvideo.setAttribute("src", poster);
        videoitemvideo.setAttribute("poster", url);
        // fav button
        videoitem.innerHTML = this.favbtn_tab;
        videoitem.firstChild.onclick = () => {
            this.favoriteVideo(videoitemvideo, videoitemvideo.parentNode.parentNode, true);
            this.switchToVideoTab();
        };
        videoitem.append(videoitemvideo);
        
        return videoitem;
    }
    addFavButtonOnImage(node) {
        let url = node.firstChild.href;
        let tmp = document.createElement("div");
        tmp.id = "favbtn_image";
        tmp.className = this.classes.size;
        tmp.setAttribute("tabindex", -1);
        tmp.setAttribute("role", "button");
        tmp.innerHTML = this.favsvg_notfilled;
        node.append(tmp);
        node.lastChild.onclick = () => { this.favoriteImage(node.firstChild) };
        if (this.checkImageFavorited(url)) {
            node.lastChild.innerHTML = this.favsvg_filled;
            node.lastChild.classList.add("favorited");
        } else {
            node.lastChild.innerHTML = this.favsvg_notfilled;
            node.lastChild.classList.remove("favorited");
        }
    }
    addFavButtonOnVideo(node) {
        let parent = node.parentNode;
        let tmp = document.createElement("div");
        tmp.id = "favbtn_video";
        tmp.className = this.classes.size;
        tmp.setAttribute("tabindex", -1);
        tmp.setAttribute("role", "button");
        tmp.innerHTML = this.favsvg_notfilled;
        parent.append(tmp);
        parent.lastChild.onclick = () => { this.favoriteVideo(node, parent, false) };
        if (this.checkVideoFavorited(node.poster)) {
            parent.lastChild.innerHTML = this.favsvg_filled;
            parent.lastChild.classList.add("favorited");
        } else {
            parent.lastChild.innerHTML = this.favsvg_notfilled;
            parent.lastChild.classList.remove("favorited");
        }
    }
    checkImageFavorited(url) {
        return BdApi.loadData(this.getName(), "image").includes(url);
    }
    checkVideoFavorited(poster) {
        for (let obj of BdApi.loadData(this.getName(), "video")) {
            if (obj && obj.poster === poster) return true;
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
            urls.push(url);
            origin.parentNode.lastChild.innerHTML = this.favsvg_filled;
            origin.parentNode.lastChild.classList.add("favorited");
        }
        BdApi.saveData(this.getName(), "image", urls.filter(u => u !== null || u !== undefined));
    }
    favoriteVideo(origin, parent, isFromTab) {
        let url = origin.src;
        let poster = origin.getAttribute("poster");
        if (isFromTab) {
            url = origin.getAttribute("poster");
            poster = origin.src;
        }
        let urls = BdApi.loadData(this.getName(), "video");
        if (this.checkVideoFavorited(poster)) {
            urls = urls.filter(o => o && o.poster !== poster)
            parent.lastChild.innerHTML = this.favsvg_notfilled;
            parent.lastChild.classList.remove("favorited");
        } else {
            urls.push({url:url, poster: poster});
            parent.lastChild.innerHTML = this.favsvg_filled;
            parent.lastChild.classList.add("favorited");
        }
        BdApi.saveData(this.getName(), "video", urls.filter(u => u !== null || u !== undefined));
    }    
}