/**
 * @name EmbedAudioLink
 * @description Embed audio link as if it was uploaded
 * @author Dastan21
 * @authorId 310450863845933057
 * @authorLink https://github.com/Dastan21
 * @version 1.0.1
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/EmbedAudioLink
 */

const AUDIO_TYPES = ["mp3", "wav", "flac", "m4a"];

const classes_modules = {
	container: BdApi.findModuleByProps("container", "gifFavoriteButton", "embedWrapper"),
	audio: BdApi.findModuleByProps("wrapper", "wrapperAudio", "wrapperControlsHidden"),
	anchor: BdApi.findModuleByProps("anchor", "anchorUnderlineOnHover"),
	mediaBar: BdApi.findModuleByProps("mediaBarInteraction", "mediaBarInteractionDragging", "mediaBarWrapper"),
	flex: BdApi.findModuleByProps("flex", "alignStart", "alignEnd"),
	volume: BdApi.findModuleByProps("volumeButtonSlider", "volumeButton"),
	color: BdApi.findModuleByProps("button", "lookFilled", "colorBrand"),
	message: BdApi.findModuleByProps("spoilerBlurRadius", "inline", "hiddenSpoilers"),
};

const classes = {
	audio: {
		audio: classes_modules.audio.audio,
		metadata: classes_modules.audio.audioMetadata,
		controls: classes_modules.audio.audioControls,
		icon: classes_modules.audio.controlIcon,
	},
	wrapper: {
		audio: classes_modules.audio.wrapperAudio,
		embed: classes_modules.container.embedWrapper,
		wrapper: classes_modules.audio.wrapper,
	},
	metadata: {
		content: classes_modules.audio.metadataContent,
		name: classes_modules.audio.metadataName,
		size: classes_modules.audio.metadataSize,
		download: classes_modules.audio.metadataDownload,
		icon: classes_modules.audio.metadataIcon,
	},
	anchor: {
		anchor: classes_modules.anchor.anchor,
		underline: classes_modules.anchor.anchorUnderlineOnHover,
	},
	durationTime: {
		wrapper: classes_modules.audio.durationTimeWrapper,
		display: classes_modules.audio.durationTimeDisplay,
		separator: classes_modules.audio.durationTimeSeparator,
	},
	mediaBar: {
		horizontal: classes_modules.mediaBar.horizontal,
		vertical: classes_modules.mediaBar.vertical,
		wrapper: classes_modules.mediaBar.mediaBarWrapper,
		interaction: classes_modules.mediaBar.mediaBarInteraction,
		preview: classes_modules.mediaBar.mediaBarPreview,
		progress: classes_modules.mediaBar.mediaBarProgress,
		grabber: classes_modules.mediaBar.mediaBarGrabber,
		bubble: classes_modules.mediaBar.bubble,
		fakeEdges: classes_modules.mediaBar.fakeEdges,
		volume: {
			interaction: classes_modules.mediaBar.mediaBarInteractionVolume,
			wrapper: classes_modules.mediaBar.mediaBarWrapperVolume,
		}
	},
	volume: {
		flex: classes_modules.flex.flex,
		button: {
			button: classes_modules.volume.volumeButton.split(' ')[0] + " da-volumeButton",
			slider: {
				slider: classes_modules.volume.volumeButtonSlider,
				visible: classes_modules.volume.sliderVisible,
			},
			wrapper: classes_modules.audio.volumeSliderWrapper,
		},
		vertical: classes_modules.flex.vertical,
		directionColumn: classes_modules.flex.directionColumn,
		alignCenter: classes_modules.flex.alignCenter,
		justifyEnd: classes_modules.flex.justifyEnd,
	},
	color: {
		button: classes_modules.color.button,
		look: classes_modules.color.lookBlank,
		color: classes_modules.color.colorBrand,
		grow: classes_modules.color.grow,
		contents: classes_modules.color.contents,
	},
	messageAttachment: classes_modules.message.messageAttachment
};

const selectors = {
	scrollerInner: classesToSelector(BdApi.findModuleByProps("messagesWrapper", "scrollerContent", "scroller").scrollerInner),
	messageContent: classesToSelector(BdApi.findModuleByProps("sizeEmoji", "wrapper", "compact").messageContent),
	messageContainer: classesToSelector(classes_modules.container.container),
};

module.exports = class EmbedAudioLink {
	start() {
		this.hideLinks = BdApi.loadData("EmbedAudioLink", "hideLinks");
		this.embedLinks();
		this.subscribeToChat();
	}
	stop() {
		if (this.observer) this.observer.disconnect();
	}
	onSwitch() {
		this.embedLinks();
		this.observer.disconnect();
		this.subscribeToChat();
	}
	subscribeToChat() {
		const chat = document.querySelector(selectors.scrollerInner);
		if (!chat) return;
		this.observer = new MutationObserver(e => { if (e[1] && e[1].addedNodes && e[1].addedNodes[0]) this.embedLinks(e[1].addedNodes[0]); });
		this.observer.observe(chat, { childList: true });
	}
	embedLinks(node) {
		if (!node) node = document.querySelector(selectors.scrollerInner);
		if (!node) return;
		for (const type of AUDIO_TYPES) {
			const alist = node.querySelectorAll(`${selectors.messageContent} a[href$=".${type}"]:not(.embededAudio)`);
			for (const a of alist) {
				a.classList.add("embededAudio");
				const metadata = {
					url: a.href,
					name: a.href.split('/').pop()
				};
				const container = a.parentNode.parentNode.parentNode.querySelector(selectors.messageContainer);
				container.append(this.AudioNode(metadata));
				// a.parentNode.remove();
			}
		}
	}
	AudioNode({ url, name }) {
		const wrapperAudio = document.createElement("div");
		wrapperAudio.className = `${classes.wrapper.audio} ${classes.wrapper.embed}`;
		wrapperAudio.setAttribute("data-fullscreen", false);
		wrapperAudio.style = "width: 400px; heigth: auto;";
		wrapperAudio.innerHTML = `
			<div class="${classes.audio.metadata}">
				<div class="${classes.metadata.content}">
					<a class="${classes.anchor.anchor} ${classes.anchor.underline} ${classes.metadata.name}" href="${url}" rel="noreferrer noopener" target="_blank">
						${name}
					</a>
					<div class="${classes.metadata.size}"></div>
				</div>
				<a class="${classes.anchor.anchor} ${classes.anchor.underline} ${classes.metadata.download}" href="https://cdn.discordapp.com/attachments/783379926249766922/833267264022511626/TG.flac" rel="noreferrer noopener" target="_blank">
					<svg class="${classes.metadata.icon}" aria-hidden="false" width="24" height="24" viewBox="0 0 24 24">
						<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16.293 9.293L17.707 10.707L12 16.414L6.29297 10.707L7.70697 9.293L11 12.586V2H13V12.586L16.293 9.293ZM18 20V18H20V20C20 21.102 19.104 22 18 22H6C4.896 22 4 21.102 4 20V18H6V20H18Z"></path>
					</svg>
				</a>
			</div>
			<audio class="${classes.audio.audio}" preload="metadata">
				<source src="${url}">
			</audio>
			<div class="${classes.audio.controls}" style="transform: translateY(0%);">
				<div tabindex="0" role="button">
					<svg class="${classes.audio.icon}" aria-hidden="false" width="16" height="16" viewBox="0 0 24 24">
						<polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon>
					</svg>
				</div>
				<div class="${classes.durationTime.wrapper}">
					<span class="${classes.durationTime.display}">-:--</span>
					<span class="${classes.durationTime.separator}">/</span>
					<span class="${classes.durationTime.display}">-:--</span>
				</div>
				<div class="${classes.mediaBar.horizontal}">
					<div class="${classes.mediaBar.interaction}">
						<div class="${classes.mediaBar.wrapper}">
							<div class="${classes.mediaBar.preview}" style="width: 100%;"></div>
							<div class="${classes.mediaBar.progress}" style="width: 0%;"></div>
						</div>
					</div>
				</div>
				<div class="${classes.volume.flex}">
					<div class="${classes.volume.button.button} ${classes.volume.vertical} ${classes.volume.flex} ${classes.volume.directionColumn} ${classes.volume.alignCenter} ${classes.volume.justifyEnd}">
						<div class="${classes.volume.button.slider.slider} ${classes.volume.button.wrapper}">
							<div class="${classes.mediaBar.vertical}">
								<div class="${classes.mediaBar.interaction} ${classes.mediaBar.volume.interaction}">
									<div class="${classes.mediaBar.wrapper} ${classes.mediaBar.volume.wrapper}">
										<div class="${classes.mediaBar.progress}" style="width: 10%;">
											<span class="${classes.mediaBar.grabber}"></span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<button type="button" class="${classes.color.button} ${classes.color.look} ${classes.color.color} ${classes.color.grow}">
							<div class="${classes.color.contents}">
								<svg class="${classes.audio.icon}" aria-hidden="false" width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M10.293 3.29604C10.579 3.01004 11.009 2.92504 11.383 3.07904C11.757 3.23204 12 3.59904 12 4.00204V20.002C12 20.407 11.757 20.772 11.383 20.927C11.009 21.082 10.579 20.996 10.293 20.71L6 16.002H3C2.45 16.002 2 15.552 2 15.002V9.00204C2 8.45304 2.45 8.00204 3 8.00204H6L10.293 3.29604ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z"></path>
								</svg>
							</div>
						</button>
					</div>
				</div>
			</div>
		`;
		if (wrapperAudio) {
			const audio = wrapperAudio.querySelector("audio");
			audio.volume = 0.1;
			require("https").get(url, res => {
				const bufs = [];
				res.on('data', chunk => bufs.push(chunk));
				res.on('end', () => {
					try {
						const file = new File([Buffer.concat(bufs)], name);
						wrapperAudio.querySelector(classesToSelector(classes.metadata.size)).innerText = bytesToSize(file.size);
						wrapperAudio.onmouseenter = () => {
							const duration = getAudioDuration(audio.duration);
							const time_els = wrapperAudio.querySelectorAll(classesToSelector(classes.durationTime.display));
							time_els[0].innerText = "0:00";
							time_els[1].innerText = `${duration[0]}:${duration[1]}`;
							wrapperAudio.onmouseenter = undefined;
						}
						const playbtn = wrapperAudio.querySelector(`${classesToSelector(classes.audio.controls)} > div > ${classesToSelector(classes.audio.icon)}`);
						playbtn.parentNode.onclick = () => {
							if (audio.paused) {
								audio.play().catch(() => { });
								playbtn.innerHTML = '<path fill="currentColor" d="M0,14 L4,14 L4,0 L0,0 L0,14 L0,14 Z M8,0 L8,14 L12,14 L12,0 L8,0 L8,0 Z" transform="translate(6 5)"></path>';
							} else {
								audio.pause();
								playbtn.innerHTML = '<polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon>';
							}
						};
						audio.onended = () => {
							clearInterval(this.playing);
							playbtn.innerHTML = '<path fill="currentColor" d="M12,5 L12,1 L7,6 L12,11 L12,7 C15.31,7 18,9.69 18,13 C18,16.31 15.31,19 12,19 C8.69,19 6,16.31 6,13 L4,13 C4,17.42 7.58,21 12,21 C16.42,21 20,17.42 20,13 C20,8.58 16.42,5 12,5 L12,5 Z"></path>';
						};
						const durationBar = wrapperAudio.querySelector(`${classesToSelector(classes.mediaBar.horizontal)} > ${classesToSelector(classes.mediaBar.interaction)}`);
						const progressBar = durationBar.querySelector(classesToSelector(classes.mediaBar.progress));
						audio.onplay = () => {
							this.playing = setInterval(() => {
								progressBar.style.width = `${(100 * audio.currentTime / audio.duration).toFixed(4)}%`;
							}, 1);
						}
						audio.onpause = () => {
							clearInterval(this.playing);
						}
						const volumeButton = wrapperAudio.querySelector(classesToSelector(classes.volume.button.button));
						const volumeSlider = volumeButton.querySelector(classesToSelector(classes.volume.button.slider.slider));
						const volumeBar = volumeButton.querySelector(classesToSelector(classes.mediaBar.interaction));
						const volumeBtn = volumeButton.querySelector(classesToSelector(classes.color.button));
						const volumeProgress = volumeButton.querySelector(classesToSelector(classes.mediaBar.progress));
						volumeBtn.onclick = () => {
							if (volumeSlider.classList.contains(classes.volume.button.slider.visible)) volumeSlider.classList.remove(classes.volume.button.slider.visible);
							else volumeSlider.classList.add(classes.volume.button.slider.visible);
						};
						volumeBar.onclick = e => {
							const vol = Math.min(100, Math.max(0, 100 * (e.layerY * -1 + 40) / 75));
							volumeProgress.style.width = `${vol}%`;
							audio.volume = vol / 200;
						};
					} catch (e) { console.error(e.message) } // remove when debugging done
				});
				res.on('error', err => console.error(err));
			});
		}
		const msg = document.createElement("div");
		msg.className = classes.messageAttachment;
		msg.append(wrapperAudio);
		return msg;
	};
}

function classesToSelector(classes_modules) {
	return `.${classes_modules.split(' ').join('.')}`;
}
function bytesToSize(bytes) {
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return '0 B';
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}
function getAudioDuration(ad) {
	let duration = (ad + "").split('.')[0];
	duration = (duration / 60 + "").split('.');
	duration[1] = ((("0." + duration[1]) * 60) + "").slice(0, 2);
	duration[1] = ("0" + duration[1]).slice(-2)
	if (duration[1] === "Na") duration[1] = "00";
	return duration;
}