/**
 * @name FavoriteMedia
 * @description Allows to favorite images, videos and audios. Adds tabs to the emojis menu to see your favorited medias.
 * @author Dastan
 * @authorId 310450863845933057
 * @authorLink https://github.com/Dastan21
 * @version 1.5.20
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/FavoriteMedia
 */

module.exports = (() => {
	const config = {
		info: {
			name: "FavoriteMedia",
			authors: [{ name: "Dastan", github_username: "Dastan21", discord_id: "310450863845933057" }],
			description: "Allows to favorite images, videos and audios. Adds tabs to the emojis menu to see your favorited medias.",
			version: "1.5.20",
			github: "https://github.com/Dastan21/BDAddons/tree/main/plugins/FavoriteMedia",
			github_raw: "https://github.com/Dastan21/BDAddons/blob/main/plugins/FavoriteMedia/FavoriteMedia.plugin.js"
		},
		defaultConfig: [
			{
				type: "switch",
				id: "hideUnsortedMedias",
				name: "Hide Medias",
				note: "Hide unsorted medias from the picker tab",
				value: true
			},
			{
				type: "switch",
				id: "hideThumbnail",
				name: "Hide Thumbnail",
				note: "Show the category color instead of a random media thumbnail",
				value: false
			},
			{
				type: "switch",
				id: "showContextMenuFavorite",
				name: "Show ContextMenu Favorite Button",
				note: "Show the button in the message context menu to favorite a media",
				value: true
			},
			{
				type: "switch",
				id: "forceShowFavoritesGIFs",
				name: "Show only favorites in GIFs tab",
				note: "Force show favorites GIFs over trendings categories",
				value: false
			},
			{
				type: "slider",
				id: "mediaVolume",
				name: "Preview Media Volume",
				note: "Volume of the previews medias on the picker tab",
				value: 10
			},
			{
				type: "dropdown",
				id: "btnsPosition",
				name: "Buttons Position",
				note: "Position of the buttons on the chat",
				value: 'right',
				options: [
					{
						label: 'Right',
						value: 'right'
					},
					{
						label: 'Left',
						value: 'left'
					}
				]
			},
			{
				type: "category",
				id: "image",
				name: "Image Settings",
				collapsible: true,
				shown: false,
				settings: [
					{
						type: "switch",
						id: "enabled",
						name: "General",
						note: "Enable images",
						value: true
					},
					{
						type: "switch",
						id: "showBtn",
						name: "Button",
						note: "Show image button on chat",
						value: true
					}
				]
			},
			{
				type: "category",
				id: "video",
				name: "Video Settings",
				collapsible: true,
				shown: false,
				settings: [
					{
						type: "switch",
						id: "enabled",
						name: "General",
						note: "Enable videos",
						value: true
					},
					{
						type: "switch",
						id: "showBtn",
						name: "Button",
						note: "Show video button on chat",
						value: true
					}
				]
			},
			{
				type: "category",
				id: "audio",
				name: "Audio Settings",
				collapsible: true,
				shown: false,
				settings: [
					{
						type: "switch",
						id: "enabled",
						name: "General",
						note: "Enable audios",
						value: true
					},
					{
						type: "switch",
						id: "showBtn",
						name: "Button",
						note: "Show audio button on chat",
						value: true
					}
				]
			}
		],
		changelog: [
			{
				title: "Fixed",
				type: "fixed",
				items: [
					"Fixed category dot module import"
				]
			}
		]
	};

	return !global.ZeresPluginLibrary ? class {
		constructor() { this._config = config; }
		getName() { return config.info.name }
		getAuthor() { return config.info.authors.map(a => a.name).join(", ") }
		getDescription() { return config.info.description }
		getVersion() { return config.info.version }
		load() {
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, _, body) => {
						if (error) return require("electron").shell.openExternal("https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
		}
		start() { }
		stop() { }
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			const { WebpackModules, ReactComponents, PluginUpdater, ContextMenu, PluginUtilities, Utilities, ColorConverter, Toasts, Modals, Tooltip, DiscordModules: { React, ElectronModule, Dispatcher, UserSettingsStore, SelectedChannelStore, ChannelStore, UserStore, Permissions }, Patcher } = Api;
			const { mkdir, access, writeFile, constants } = require('fs');

			const class_modules = {
				icon: WebpackModules.getByProps("hoverScale", "buttonWrapper", "button"),
				menu: WebpackModules.getByProps("menu", "scroller", "styleFixed"),
				result: WebpackModules.getByProps("desiredItemWidth", "results", "result"),
				input: WebpackModules.getByProps("inputWrapper", "input", "focused"),
				role: WebpackModules.getByProps("roleCircle"),
				_gif: WebpackModules.getByProps("container", "gifFavoriteButton", "embedWrapper"),
				gif: WebpackModules.getByProps("size", "gifFavoriteButton", "selected"),
				image: WebpackModules.getByProps("flexCenter", "imageWrapper", "imageWrapperBackground"),
				control: WebpackModules.getByProps("container", "labelRow", "control"),
				category: WebpackModules.getByProps("container", "categoryFade", "categoryFadeBlurple"),
				textarea: WebpackModules.getByProps("textAreaHeight", "channelTextArea", "highlighted"),
				gutter: WebpackModules.getByProps("gutterSize", "container", "content"),
				_flex: WebpackModules.getByProps("_flex", "_horizontal", "_horizontalReverse"),
				flex: WebpackModules.getByProps("flex", "alignStart", "alignEnd"),
				color: WebpackModules.getByProps("selectable", "strong", "colorStandard"),
				size: WebpackModules.getByProps("size10", "size12", "size14"),
				title: WebpackModules.getByProps("title", "h1", "h2"),
				container: WebpackModules.getByProps("container", "inner", "pointer"),
				scroller: WebpackModules.getByProps("scrollerBase", "thin", "fade"),
				look: WebpackModules.getByProps("lowSaturationUnderline", "button", "lookFilled"),
			};
			const classes = {
				icon: {
					icon: class_modules.icon.icon,
					active: class_modules.icon.active,
					button: class_modules.icon.button,
					buttonWrapper: class_modules.icon.buttonWrapper,
				},
				menu: {
					item: class_modules.menu.item,
					labelContainer: class_modules.menu.labelContainer,
					label: class_modules.menu.label,
					colorDefault: class_modules.menu.colorDefault,
					focused: class_modules.menu.focused,
				},
				result: {
					result: class_modules.result.result,
					gif: class_modules.result.result,
					favButton: class_modules.result.favButton,
					emptyHints: class_modules.result.emptyHints,
					emptyHint: class_modules.result.emptyHint,
					emptyHintCard: class_modules.result.emptyHintCard,
					emptyHintFavorite: class_modules.result.emptyHintFavorite,
					emptyHintText: class_modules.result.emptyHintText,
					gif: class_modules.result.gif,
					endContainer: class_modules.result.endContainer,
				},
				input: {
					inputDefault: class_modules.input.inputDefault,
					inputWrapper: class_modules.input.inputWrapper,
				},
				roleCircle: class_modules.role.roleCircle,
				gif: {
					gifFavoriteButton1: class_modules._gif.gifFavoriteButton,
					size: class_modules.gif.size,
					gifFavoriteButton2: class_modules.gif.gifFavoriteButton,
					selected: class_modules.gif.selected,
					showPulse: class_modules.gif.showPulse,
					icon: class_modules.gif.icon,
				},
				image: {
					imageAccessory: class_modules.image.imageAccessory,
					clickable: class_modules.image.clickable,
				},
				control: class_modules.control.control,
				category: {
					categoryFade: class_modules.category.categoryFade,
					categoryText: class_modules.category.categoryText,
					categoryName: class_modules.category.categoryName,
					categoryIcon: class_modules.category.categoryIcon,
					container: class_modules.category.container,
				},
				textarea: {
					textAreaSlate: class_modules.textarea.textAreaSlate,
					buttonContainer: class_modules.textarea.buttonContainer,
					button: class_modules.textarea.button,
				},
				gutter: {
					header: class_modules.gutter.header,
					backButton: class_modules.gutter.backButton,
					searchHeader: class_modules.gutter.searchHeader,
					searchBar: class_modules.gutter.searchBar,
					content: class_modules.gutter.content,
					container: class_modules.gutter.container,
				},
				flex: {
					flex: class_modules._flex.flex,
					horizontal: class_modules._flex.horizontal,
					justifyStart: class_modules.flex.justifyStart,
					alignCenter: class_modules.flex.alignCenter,
					noWrap: class_modules.flex.noWrap,
				},
				colorStandard: class_modules.color.colorStandard,
				size14: class_modules.size.size14,
				h5: class_modules.title.h5,
				container: {
					container: class_modules.container.container,
					medium: class_modules.container.medium,
					inner: class_modules.container.inner,
					input: class_modules.container.input,
					iconLayout: class_modules.container.iconLayout,
					iconContainer: class_modules.container.iconContainer,
					pointer: class_modules.container.pointer,
					clear: class_modules.container.clear,
					visible: class_modules.container.visible,
				},
				scroller: {
					thin: class_modules.scroller.thin,
					scrollerBase: class_modules.scroller.scrollerBase,
					fade: class_modules.scroller.fade,
					content: class_modules.scroller.content,
				},
				look: {
					button: class_modules.look.button,
					lookBlank: class_modules.look.lookBlank,
					colorBrand: class_modules.look.colorBrand,
					grow: class_modules.look.grow,
					contents: class_modules.look.contents,
				}
			};
			const DEFAULT_BACKGROUND_COLOR = "#202225";
			let canClosePicker = true;
			const labels = setLabelsByLanguage();
			const ExpressionPicker = WebpackModules.getModule(e => e.type?.displayName === "ExpressionPicker");
			const ChannelTextAreaButtons = WebpackModules.getModule(m => m.type?.displayName === "ChannelTextAreaButtons");
			const ComponentDispatch = WebpackModules.getByProps("ComponentDispatch").ComponentDispatch;
			const EPS = WebpackModules.getByProps("toggleExpressionPicker");
			const EPSConstants = WebpackModules.getByProps("ChatInputTypes").ChatInputTypes.NORMAL;
			const PermissionsConstants = WebpackModules.getByProps("Permissions", "ActivityTypes").Permissions;
			const MediaPlayer = WebpackModules.getByDisplayName("MediaPlayer");
			const Image = WebpackModules.getByDisplayName("Image");
			const Strings = BdApi.findModule(m => m.Messages && m.getLocale && m.Messages.CLOSE).Messages;
			const ImageSVG = () => React.createElement("svg", { className: classes.icon.icon, "aria-hidden": "false", viewBox: "0 0 384 384", width: "24", height: "24" }, React.createElement("path", { fill: "currentColor", d: "M341.333,0H42.667C19.093,0,0,19.093,0,42.667v298.667C0,364.907,19.093,384,42.667,384h298.667 C364.907,384,384,364.907,384,341.333V42.667C384,19.093,364.907,0,341.333,0z M42.667,320l74.667-96l53.333,64.107L245.333,192l96,128H42.667z" }));
			const VideoSVG = () => React.createElement("svg", { className: classes.icon.icon, "aria-hidden": "false", viewBox: "0 0 298 298", width: "24", height: "24" }, React.createElement("path", { fill: "currentColor", d: "M298,33c0-13.255-10.745-24-24-24H24C10.745,9,0,19.745,0,33v232c0,13.255,10.745,24,24,24h250c13.255,0,24-10.745,24-24V33zM91,39h43v34H91V39z M61,259H30v-34h31V259z M61,73H30V39h31V73z M134,259H91v-34h43V259z M123,176.708v-55.417c0-8.25,5.868-11.302,12.77-6.783l40.237,26.272c6.902,4.519,6.958,11.914,0.056,16.434l-40.321,26.277C128.84,188.011,123,184.958,123,176.708z M207,259h-43v-34h43V259z M207,73h-43V39h43V73z M268,259h-31v-34h31V259z M268,73h-31V39h31V73z" }));
			const AudioSVG = () => React.createElement("svg", { className: classes.icon.icon, "aria-hidden": "false", viewBox: "0 0 115.3 115.3", width: "24", height: "24" }, React.createElement("path", { fill: "currentColor", d: "M47.9,14.306L26,30.706H6c-3.3,0-6,2.7-6,6v41.8c0,3.301,2.7,6,6,6h20l21.9,16.4c4,3,9.6,0.2,9.6-4.8v-77C57.5,14.106,51.8,11.306,47.9,14.306z" }), React.createElement("path", { fill: "currentColor", d: "M77.3,24.106c-2.7-2.7-7.2-2.7-9.899,0c-2.7,2.7-2.7,7.2,0,9.9c13,13,13,34.101,0,47.101c-2.7,2.7-2.7,7.2,0,9.899c1.399,1.4,3.199,2,4.899,2s3.601-0.699,4.9-2.1C95.8,72.606,95.8,42.606,77.3,24.106z" }), React.createElement("path", { fill: "currentColor", d: "M85.1,8.406c-2.699,2.7-2.699,7.2,0,9.9c10.5,10.5,16.301,24.4,16.301,39.3s-5.801,28.8-16.301,39.3c-2.699,2.7-2.699,7.2,0,9.9c1.4,1.399,3.2,2.1,4.9,2.1c1.8,0,3.6-0.7,4.9-2c13.1-13.1,20.399-30.6,20.399-49.2c0-18.6-7.2-36-20.399-49.2C92.3,5.706,87.9,5.706,85.1,8.406z" }));
			const ColorDot = props => React.createElement("div", { className: classes.roleCircle + " fm-colorDot", style: { "background-color": props.color || DEFAULT_BACKGROUND_COLOR } });

			const MediaMenuItemInput = class extends React.Component {
				constructor(props) {
					super(props);
				}

				componentDidMount() {
					const media = PluginUtilities.loadData(config.info.name, this.props.type, { medias: [] }).medias[this.props.id];
					this.refs.inputName.value = media.name || "";
				}

				componentWillUnmount() {
					const name = this.refs.inputName.value;
					if (!name || name === "") return;
					const type_data = PluginUtilities.loadData(config.info.name, this.props.type, { medias: [] });
					if (!type_data.medias.length) return;
					if (!type_data.medias[this.props.id]) return;
					type_data.medias[this.props.id].name = name;
					PluginUtilities.saveData(config.info.name, this.props.type, type_data);
					this.props.loadMedias();
				}

				render() {
					return React.createElement("div", {
						className: `${classes.menu.item} ${classes.menu.labelContainer}`,
						role: "menuitem",
						id: "media-input",
						tabindex: "-1"
					},
						React.createElement("input", {
							className: classes.input.inputDefault,
							name: "media-name",
							type: "text",
							placeholder: labels.media.placeholder[this.props.type],
							maxlength: "40",
							ref: "inputName",
							onChange: this.saveName
						})
					)
				}
			}

			const CategoryMenuItem = class extends React.Component {
				constructor(props) {
					super(props);

					this.state = {
						focused: false
					}
				}

				render() {
					return React.createElement("div", {
						className: `${classes.menu.item} ${classes.menu.labelContainer} ${classes.menu.colorDefault}${this.state.focused ? ` ${classes.menu.focused}` : ""}`,
						role: "menuitem",
						id: `${this.props.name}-${this.props.key}`,
						tabindex: "-1",
						onMouseOver: () => this.setState({ focused: true }),
						onMouseOut: () => this.setState({ focused: false })
					},
						React.createElement(ColorDot, { color: this.props.color }),
						React.createElement("div", { className: classes.menu.label }, this.props.name)
					)
				}
			}

			const MediaFavButton = class extends React.Component {
				constructor(props) {
					super(props);

					this.state = {
						favorited: this.isFavorited,
						pulse: false
					}

					this.updateFavorite = this.updateFavorite.bind(this);
					this.changeFavorite = this.changeFavorite.bind(this);
					this.favoriteMedia = this.favoriteMedia.bind(this);
					this.unfavoriteMedia = this.unfavoriteMedia.bind(this);
					this.favButton = this.favButton.bind(this);
				}

				componentDidMount() {
					this.tooltipFav = Tooltip.create(this.refs.tooltipFav, this.isFavorited ? Strings.GIF_TOOLTIP_REMOVE_FROM_FAVORITES : Strings.GIF_TOOLTIP_ADD_TO_FAVORITES);
					Dispatcher.subscribe("FAVORITE_MEDIA", this.updateFavorite);
				}

				componentWillUnmount() {
					Dispatcher.unsubscribe("FAVORITE_MEDIA", this.updateFavorite);
				}

				get isFavorited() {
					return PluginUtilities.loadData(config.info.name, this.props.type, { medias: [] }).medias.find(e => e.url === this.props.url) !== undefined;
				}

				updateFavorite(data) {
					if (this.props.fromPicker) return;
					if (data.url !== this.props.url) return;
					const fav = this.isFavorited;
					this.setState({ favorited: fav });
					this.tooltipFav.label = fav ? Strings.GIF_TOOLTIP_REMOVE_FROM_FAVORITES : Strings.GIF_TOOLTIP_ADD_TO_FAVORITES;
				}

				changeFavorite() {
					if (this.state.favorited) this.unfavoriteMedia();
					else this.favoriteMedia();
					if (!this.props.fromPicker) this.setState({ favorited: this.isFavorited });
					Dispatcher.dispatch({ type: "FAVORITE_MEDIA", url: this.props.url });
					if (this.props.fromPicker) return;
					this.tooltipFav.label = this.state.favorited ? Strings.GIF_TOOLTIP_ADD_TO_FAVORITES : Strings.GIF_TOOLTIP_REMOVE_FROM_FAVORITES;
					this.tooltipFav.hide();
					this.tooltipFav.show();
					this.setState({ pulse: true });
					setTimeout(() => {
						this.setState({ pulse: false });
					}, 200);
				}

				favoriteMedia() {
					let type_data = PluginUtilities.loadData(config.info.name, this.props.type, { medias: [] });
					if (type_data.medias.find(m => m.url === this.props.url)) return;
					let data = null;
					switch (this.props.type) {
						case "video":
							data = {
								url: this.props.url,
								poster: this.props.poster,
								width: this.props.width,
								height: this.props.height,
								name: getUrlName(this.props.url)
							};
							break;
						case "audio":
							data = {
								url: this.props.url,
								name: getUrlName(this.props.url),
								ext: getUrlExt(this.props.url)
							};
							break;
						default: // image
							data = {
								url: this.props.url,
								width: this.props.width,
								height: this.props.height,
								name: getUrlName(this.props.url)
							};
					}
					if (!data) return;
					type_data.medias.push(data);
					PluginUtilities.saveData(config.info.name, this.props.type, type_data);
				}

				unfavoriteMedia() {
					let type_data = PluginUtilities.loadData(config.info.name, this.props.type, { medias: [] });
					if (!type_data.medias.length) return;
					type_data.medias = type_data.medias.filter(e => e.url !== this.props.url);
					PluginUtilities.saveData(config.info.name, this.props.type, type_data);
					if (this.props.fromPicker) Dispatcher.dispatch({ type: "UPDATE_MEDIAS" });
				}

				favButton() {
					return React.createElement("div", {
						className: `${this.props.fromPicker ? `${classes.result.favButton} ` : classes.gif.gifFavoriteButton1} ${classes.gif.size} ${classes.gif.gifFavoriteButton2}${this.state.favorited ? ` ${classes.gif.selected}` : ""}${this.state.pulse ? ` ${classes.gif.showPulse}` : ""}`,
						tabindex: "-1",
						role: "button",
						ref: "tooltipFav",
						onClick: this.changeFavorite
					},
						React.createElement(StarSVG, {
							filled: this.state.favorited
						})
					)
				}

				render() {
					return this.props.fromPicker ? this.favButton() :
						React.createElement("div", {
							className: `${classes.image.imageAccessory} ${classes.image.clickable} ${this.props.type}-favbtn`
						}, this.favButton())
				}
			}

			const StarSVG = class extends React.Component {
				constructor(props) {
					super(props);
				}

				render() {
					return React.createElement("svg", {
						className: classes.gif.icon,
						"aria-hidden": "false",
						viewBox: "0 0 24 24",
						width: "16",
						height: "16"
					},
						this.props.filled ?
							React.createElement("path", { fill: "currentColor", d: "M12.5,17.6l3.6,2.2a1,1,0,0,0,1.5-1.1l-1-4.1a1,1,0,0,1,.3-1l3.2-2.8A1,1,0,0,0,19.5,9l-4.2-.4a.87.87,0,0,1-.8-.6L12.9,4.1a1.05,1.05,0,0,0-1.9,0l-1.6,4a1,1,0,0,1-.8.6L4.4,9a1.06,1.06,0,0,0-.6,1.8L7,13.6a.91.91,0,0,1,.3,1l-1,4.1a1,1,0,0,0,1.5,1.1l3.6-2.2A1.08,1.08,0,0,1,12.5,17.6Z" })
							:
							React.createElement("path", { fill: "currentColor", d: "M19.6,9l-4.2-0.4c-0.4,0-0.7-0.3-0.8-0.6l-1.6-3.9c-0.3-0.8-1.5-0.8-1.8,0L9.4,8.1C9.3,8.4,9,8.6,8.6,8.7L4.4,9 c-0.9,0.1-1.2,1.2-0.6,1.8L7,13.6c0.3,0.2,0.4,0.6,0.3,1l-1,4.1c-0.2,0.9,0.7,1.5,1.5,1.1l3.6-2.2c0.3-0.2,0.7-0.2,1,0l3.6,2.2 c0.8,0.5,1.7-0.2,1.5-1.1l-1-4.1c-0.1-0.4,0-0.7,0.3-1l3.2-2.8C20.9,10.2,20.5,9.1,19.6,9z M12,15.4l-3.8,2.3l1-4.3l-3.3-2.9 l4.4-0.4l1.7-4l1.7,4l4.4,0.4l-3.3,2.9l1,4.3L12,15.4z" })
					)
				}
			}

			const ColorPicker = class extends React.Component {
				constructor(props) {
					super(props);
				}

				componentDidMount() {
					this.refs.inputColor.value = this.props.color || DEFAULT_BACKGROUND_COLOR;
					this.props.setRef(this.refs.inputColor);
					this.refs.inputColor.parentNode.style["background-color"] = this.refs.inputColor.value;
				}

				render() {
					return React.createElement("div", {
						className: "category-input-color",
						style: { width: "48px", height: "48px", "margin-top": "8px", "border-radius": "100%" }
					},
						React.createElement("input", {
							type: "color",
							id: "category-input-color",
							name: "category-input-color",
							ref: "inputColor",
							onChange: e => e.target.parentNode.style["background-color"] = e.target.value
						})
					);
				}
			}

			const EmptyFavorites = class extends React.Component {
				constructor(props) {
					super(props);
				}

				render() {
					return React.createElement("div", {
						className: classes.result.emptyHints
					},
						React.createElement("div", {
							className: classes.result.emptyHint
						},
							React.createElement("div", {
								className: classes.result.emptyHintCard
							},
								React.createElement("svg", {
									className: classes.result.emptyHintFavorite,
									"aria-hidden": "false",
									viewBox: "0 0 24 24",
									width: "16",
									height: "16"
								},
									React.createElement("path", {
										d: "M0,0H24V24H0Z",
										fill: "none"
									}),
									React.createElement("path", {
										fill: "currentColor",
										d: "M12.5,17.6l3.6,2.2a1,1,0,0,0,1.5-1.1l-1-4.1a1,1,0,0,1,.3-1l3.2-2.8A1,1,0,0,0,19.5,9l-4.2-.4a.87.87,0,0,1-.8-.6L12.9,4.1a1.05,1.05,0,0,0-1.9,0l-1.6,4a1,1,0,0,1-.8.6L4.4,9a1.06,1.06,0,0,0-.6,1.8L7,13.6a.91.91,0,0,1,.3,1l-1,4.1a1,1,0,0,0,1.5,1.1l3.6-2.2A1.08,1.08,0,0,1,12.5,17.6Z"
									})
								),
								React.createElement("div", {
									className: classes.result.emptyHintText
								}, labels.media.emptyHint[this.props.type])
							)
						),
						React.createElement("div", {
							className: classes.result.emptyHint
						},
							React.createElement("div", {
								className: classes.result.emptyHintCard
							},
								React.createElement("div", {
									className: classes.result.emptyHintText
								}, labels.category.emptyHint)
							)
						)
					)
				}
			}

			const CategoryModal = class extends React.Component {
				constructor(props) {
					super(props);

					this.setRef = this.setRef.bind(this);
					this.getValues = this.getValues.bind(this);
				}

				setRef(input) {
					this.inputColor = input;
				}

				componentDidMount() {
					this.props.modalRef(this);
					this.refs.inputName.value = this.props.name || "";
				}
				componentWillUnmount() {
					this.props.modalRef(undefined);
				}

				getValues() {
					return {
						name: this.refs.inputName && this.refs.inputName.value,
						color: this.inputColor && this.inputColor.value
					}
				}

				render() {
					return React.createElement("div", {
						className: classes.control,
						style: { display: "grid", "grid-template-columns": "auto 70px", "margin-right": "-16px" }
					},
						React.createElement("div", {
							className: classes.input.inputWrapper,
							style: { padding: "1em 0", "margin-right": "16px" }
						},
							React.createElement("input", {
								className: classes.input.inputDefault,
								name: "category-name",
								type: "text",
								placeholder: labels.category.placeholder,
								maxlength: "20",
								ref: "inputName"
							})
						),
						React.createElement(ColorPicker, {
							color: this.props.color,
							setRef: this.setRef
						})
					)
				}
			}

			const CategoryCard = class extends React.Component {
				constructor(props) {
					super(props);

					this.onContextMenu = this.onContextMenu.bind(this);
					this.onDrop = this.onDrop.bind(this);
				}

				get nameColor() {
					const rgb = ColorConverter.getRGB(this.props.color);
					const brightness = Math.round((
						(parseInt(rgb[0]) * 299) +
						(parseInt(rgb[1]) * 587) +
						(parseInt(rgb[2]) * 114)) / 1000);
					if (brightness > 125) return "black";
					return "white";
				}

				get showColor() {
					return PluginUtilities.loadSettings(config.info.name).hideThumbnail || !this.props.thumbnail;
				}

				onContextMenu(e) {
					canClosePicker = false;
					const moveItems = [];
					if (this.props.index > 0) {
						moveItems.push({
							label: labels.category.movePrevious,
							action: () => moveCategory(this.props.type, this.props.index, this.props.index - 1)
						});
					}
					if (this.props.index < this.props.length - 1) {
						moveItems.push({
							label: labels.category.moveNext,
							action: () => moveCategory(this.props.type, this.props.index, this.props.index + 1)
						});
					}
					const items = [
						{
							label: labels.category.copyColor,
							action: () => {
								ElectronModule.copy(this.props.color || DEFAULT_BACKGROUND_COLOR);
								Toasts.success(labels.category.copiedColor);
							}
						},
						{
							label: labels.category.download,
							action: () => BdApi.openDialog({ openDirectory: true }).then(({ filePaths }) => {
								if (!filePaths) return;
								const path = filePaths[0];
								if (!path) return;
								const category_folder = path + `\\${this.props.name}`;
								mkdir(category_folder, () => {
									const medias = PluginUtilities.loadData(config.info.name, this.props.type, { medias: [] }).medias.filter(m => m.category_id === this.props.id).map(m => { return this.props.type === "audio" ? m : { ...m, ext: getUrlExt(m.url) } });
									Promise.all(medias.map(m => new Promise((resolve, reject) => {
										access(category_folder + `\\${m.name}${m.ext}`, constants.F_OK, e => {
											if (!e) return resolve();
											require("https").get(m.url, res => {
												const bufs = [];
												res.on('data', chunk => bufs.push(chunk));
												res.on('end', () => writeFile(category_folder + `\\${m.name}${m.ext}`, Buffer.concat(bufs), err => err ? reject(err) : resolve()));
												res.on('error', err => reject(err));
											});
										});
									}))).then(() => Toasts.success(labels.category.success.download)).catch(() => Toasts.error(labels.category.error.download));
								});
							})
						},
						{
							label: labels.category.edit,
							action: () => this.props.openCategoryModal("edit", { name: this.props.name, color: this.props.color, id: this.props.id })
						},
						{
							label: labels.category.delete,
							danger: true,
							action: () => {
								deleteCategory(this.props.type, this.props.id);
								this.props.setCategory();
							}
						}
					];
					if (moveItems.length > 0) items.unshift({
						label: labels.category.move,
						type: "submenu",
						items: moveItems
					});
					ContextMenu.openContextMenu(e, ContextMenu.buildMenu([
						{
							type: "group",
							items: items
						}
					]), {
						onClose: () => canClosePicker = true
					});
				}

				onDrop(e) {
					const data = e.dataTransfer.getData("card-data");
					let media;
					try {
						media = JSON.parse(data);
					} catch (err) {
						console.error(err);
					}
					if (!media) return;
					this.props.changeMediaCategory(media.id, this.props.id);
					this.refs.category.classList.remove("category-dragover");
				}

				render() {
					return React.createElement("div", {
						className: classes.result.result,
						tabindex: "-1",
						role: "button",
						style: {
							position: "absolute",
							top: `${this.props.positions.top}px`,
							left: `${this.props.positions.left}px`,
							width: `${this.props.positions.width}px`,
							height: "110px"
						},
						ref: "category",
						onClick: () => this.props.setCategory({ name: this.props.name, color: this.props.color, id: this.props.id }),
						onContextMenu: this.onContextMenu,
						onDragEnter: e => { e.preventDefault(); this.refs.category.classList.add("category-dragover"); },
						onDragLeave: e => { e.preventDefault(); this.refs.category.classList.remove("category-dragover"); },
						onDragOver: e => { e.stopPropagation(); e.preventDefault(); },
						onDrop: this.onDrop
					},
						React.createElement("div", {
							className: classes.category.categoryFade,
							style: { "background-color": `${this.showColor ? (this.props.color || DEFAULT_BACKGROUND_COLOR) : ""}` }
						}),
						React.createElement("div", { className: classes.category.categoryText },
							React.createElement("span", {
								className: classes.category.categoryName,
								style: this.showColor ? { color: this.nameColor, "text-shadow": "none" } : {}
							}, this.props.name)
						),
						this.props.thumbnail && !PluginUtilities.loadSettings(config.info.name).hideThumbnail ?
							React.createElement("img", {
								className: classes.result.gif,
								preload: "auto",
								src: this.props.thumbnail,
								height: "110px",
								width: "100%"
							})
							: null
					)
				}
			}

			const MediaCard = class extends React.Component {
				constructor(props) {
					super(props);

					this.state = {
						showControls: false,
						visible: this.props.positions.top < 350
					}

					this.changeControls = this.changeControls.bind(this);
					this.hideControls = this.hideControls.bind(this);
					this.sendMedia = this.sendMedia.bind(this);
					this.handleVisible = this.handleVisible.bind(this);
					this.onDragStart = this.onDragStart.bind(this);
				}

				get isPlayable() {
					return ["video", "audio"].includes(this.props.type);
				}

				handleVisible({ scroll }) {
					if (scroll > this.props.positions.top) this.setState({ visible: true });
				}

				componentDidMount() {
					this.url = this.props.url;
					if (this.isPlayable) this.tooltipControls = Tooltip.create(this.refs.tooltipControls, this.state.showControls ? labels.media.controls.hide : labels.media.controls.show);
					Dispatcher.subscribe("TOGGLE_CONTROLS", this.hideControls);
					Dispatcher.subscribe("SCROLLING_MEDIAS", this.handleVisible);
				}

				componentWillUnmount() {
					Dispatcher.unsubscribe("TOGGLE_CONTROLS", this.hideControls);
					Dispatcher.unsubscribe("SCROLLING_MEDIAS", this.handleVisible);
				}

				componentDidUpdate() {
					if (this.url !== this.props.url && this.state.showControls) this.changeControls(false);
					if (this.isPlayable && !this.tooltipControls) this.tooltipControls = Tooltip.create(this.refs.tooltipControls, this.state.showControls ? labels.media.controls.hide : labels.media.controls.show);
					this.url = this.props.url;
					if (this.state.showControls) this.refs.media.volume = this.props.volume / 100 || 0.1;
				}

				changeControls(force) {
					this.setState((prevState) => {
						const newControls = force !== undefined ? force : !prevState.showControls;
						if (this.tooltipControls) {
							this.tooltipControls.label = newControls ? labels.media.controls.hide : labels.media.controls.show;
							this.tooltipControls.hide();
							this.tooltipControls.show();
							if (force !== undefined) this.tooltipControls.hide();
						}
						if (newControls) Dispatcher.dispatch({ type: "TOGGLE_CONTROLS" });
						return ({ showControls: newControls });
					});
				}

				hideControls() {
					if (this.state.showControls) this.changeControls(false);
				}

				onDragStart(e) {
					e.dataTransfer.setData('card-data', JSON.stringify(this.props));
					e.dataTransfer.effectAllowed = "move";
				}

				sendMedia(e) {
					if (["path", "svg"].includes(e.target.tagName)) return;
					const shiftPressed = e.shiftKey
					if (this.props.type === "audio") {
						require("https").get(this.props.url, res => {
							const bufs = [];
							res.on('data', chunk => bufs.push(chunk));
							res.on('end', () => {
								if (!shiftPressed) WebpackModules.getByProps("closeExpressionPicker").closeExpressionPicker();
								try {
									const content = document.querySelector('[class*="textArea"] [data-slate-string]')?.innerText
									const fileName = this.props.name + this.props.ext
									WebpackModules.getByProps("instantBatchUpload").upload({
										channelId: SelectedChannelStore.getChannelId(),
										file: new File([Buffer.concat(bufs)], fileName),
										hasSpoiler: false,
										fileName: fileName,
										draftType: 0,
										message: { content: content || '' }
									});
									ComponentDispatch.dispatchToLastSubscribed("CLEAR_TEXT");
								} catch (e) { console.error(e.message) }
							});
							res.on('error', err => console.error(err));
						});
					} else {
						if (!shiftPressed) {
							ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", { content: this.props.url, plainText: this.props.url });
							const textarea = document.querySelector(`.${classes.textarea.textAreaSlate}`);
							const input = textarea?.querySelector('[role="textbox"]')
							const enterEvent = new KeyboardEvent('keydown', { charCode: 13, keyCode: 13, bubbles: true });
							if (input) setTimeout(() => input?.dispatchEvent(enterEvent), 0);
							else EPS.toggleExpressionPicker(this.props.type, EPSConstants)
						} else {
							WebpackModules.getByProps("sendMessage").sendMessage(SelectedChannelStore.getChannelId(), { content: this.props.url, validNonShortcutEmojis: [] });
						}
					}
				}

				render() {
					return React.createElement("div", {
						className: classes.result.result,
						tabindex: "-1",
						role: "button",
						style: {
							position: "absolute",
							top: `${this.props.positions.top}px`,
							left: `${this.props.positions.left}px`,
							width: `${this.props.positions.width}px`,
							height: `${this.props.positions.height}px`,
							"background-color": DEFAULT_BACKGROUND_COLOR
						},
						onContextMenu: e => this.props.onMediaContextMenu(e, this.props.id),
						onClick: this.sendMedia
					},
						this.isPlayable ? React.createElement("div", {
							className: `show-controls ${classes.gif.size}${this.state.showControls ? ` ${classes.gif.selected} active` : ""}`,
							tabindex: "-1",
							role: "button",
							ref: "tooltipControls",
							onClick: () => this.changeControls()
						},
							React.createElement("svg", {
								className: classes.gif.icon,
								"aria-hidden": "false",
								viewBox: "0 0 780 780",
								width: "16",
								height: "16"
							},
								React.createElement("path", { fill: "currentColor", d: "M490.667,405.333h-56.811C424.619,374.592,396.373,352,362.667,352s-61.931,22.592-71.189,53.333H21.333C9.557,405.333,0,414.891,0,426.667S9.557,448,21.333,448h270.144c9.237,30.741,37.483,53.333,71.189,53.333s61.931-22.592,71.189-53.333h56.811c11.797,0,21.333-9.557,21.333-21.333S502.464,405.333,490.667,405.333zM362.667,458.667c-17.643,0-32-14.357-32-32s14.357-32,32-32s32,14.357,32,32S380.309,458.667,362.667,458.667z" }),
								React.createElement("path", { fill: "currentColor", d: "M490.667,64h-56.811c-9.259-30.741-37.483-53.333-71.189-53.333S300.736,33.259,291.477,64H21.333C9.557,64,0,73.557,0,85.333s9.557,21.333,21.333,21.333h270.144C300.736,137.408,328.96,160,362.667,160s61.931-22.592,71.189-53.333h56.811c11.797,0,21.333-9.557,21.333-21.333S502.464,64,490.667,64z M362.667,117.333c-17.643,0-32-14.357-32-32c0-17.643,14.357-32,32-32s32,14.357,32,32C394.667,102.976,380.309,117.333,362.667,117.333z" }),
								React.createElement("path", { fill: "currentColor", d: "M490.667,234.667H220.523c-9.259-30.741-37.483-53.333-71.189-53.333s-61.931,22.592-71.189,53.333H21.333C9.557,234.667,0,244.224,0,256c0,11.776,9.557,21.333,21.333,21.333h56.811c9.259,30.741,37.483,53.333,71.189,53.333s61.931-22.592,71.189-53.333h270.144c11.797,0,21.333-9.557,21.333-21.333C512,244.224,502.464,234.667,490.667,234.667zM149.333,288c-17.643,0-32-14.357-32-32s14.357-32,32-32c17.643,0,32,14.357,32,32S166.976,288,149.333,288z" })
							)
						) : null,
						React.createElement(MediaFavButton, {
							type: this.props.type,
							url: this.props.url,
							poster: this.props.poster,
							fromPicker: true
						}),
						this.state.visible ? React.createElement(this.props.type === "audio" ? "audio" : this.state.showControls ? "video" : "img", {
							className: classes.result.gif,
							preload: "auto",
							src: this.props.type === "video" && !this.state.showControls ? this.props.poster : this.props.url,
							poster: this.props.poster,
							width: this.props.positions.width,
							height: this.props.positions.height,
							ref: "media",
							controls: this.state.showControls,
							style: this.props.type === "audio" ? { position: "absolute", bottom: "0", left: "0", "z-index": "2" } : null,
							onDragStart: this.onDragStart
						}) : null,
						this.props.type === "audio" ? React.createElement("div", {
							className: classes.category.categoryFade,
							style: { "background-color": DEFAULT_BACKGROUND_COLOR }
						}) : null,
						this.props.type === "audio" ? React.createElement("div", {
							className: classes.category.categoryText,
							style: { top: this.state.showControls ? "-50%" : null }
						},
							React.createElement("svg", {
								className: classes.category.categoryIcon,
								"aria-hidden": false,
								viewBox: "0 0 500 500",
								width: "16",
								height: "16"
							},
								React.createElement("path", { fill: "currentColor", d: "M328.712,264.539c12.928-21.632,21.504-48.992,23.168-76.064c1.056-17.376-2.816-35.616-11.2-52.768c-13.152-26.944-35.744-42.08-57.568-56.704c-16.288-10.912-31.68-21.216-42.56-35.936l-1.952-2.624c-6.432-8.64-13.696-18.432-14.848-26.656c-1.152-8.32-8.704-14.24-16.96-13.76c-8.384,0.576-14.88,7.52-14.88,15.936v285.12c-13.408-8.128-29.92-13.12-48-13.12c-44.096,0-80,28.704-80,64s35.904,64,80,64s80-28.704,80-64V165.467c24.032,9.184,63.36,32.576,74.176,87.2c-2.016,2.976-3.936,6.176-6.176,8.736c-5.856,6.624-5.216,16.736,1.44,22.56c6.592,5.888,16.704,5.184,22.56-1.44c4.288-4.864,8.096-10.56,11.744-16.512C328.04,265.563,328.393,265.083,328.712,264.539z" }),
							),
							React.createElement("span", { className: classes.category.categoryName }, React.createElement("div", {}, this.props.name.replace(/_/gm, ' '))),
						) : null
					)
				}
			}

			const RenderList = class extends React.Component {
				constructor(props) {
					super(props);
				}

				render() {
					return React.createElement(React.Fragment, {
						children: this.props.items.map((itemProps, i) => React.createElement(this.props.component, {
							...itemProps,
							...this.props.componentProps,
							index: i
						}))
					})
				}
			}

			const MediaPicker = class extends React.Component {
				constructor(props) {
					super(props);

					this.state = {
						textFilter: "",
						categories: PluginUtilities.loadData(config.info.name, this.props.type, { categories: [] }).categories,
						category: null,
						medias: PluginUtilities.loadData(config.info.name, this.props.type, { medias: [] }).medias,
						contentWidth: null
					};

					this.type = this.props.type;
					this.contentHeight = 400;

					this.clearSearch = this.clearSearch.bind(this);
					this.setCategory = this.setCategory.bind(this);
					this.onContextMenu = this.onContextMenu.bind(this);
					this.onMediaContextMenu = this.onMediaContextMenu.bind(this);
					this.openCategoryModal = this.openCategoryModal.bind(this);
					this.categoriesItems = this.categoriesItems.bind(this);
					this.changeMediaCategory = this.changeMediaCategory.bind(this);
					this.removeMediaCategory = this.removeMediaCategory.bind(this);
					this.isInCategory = this.isInCategory.bind(this);
					this.loadMedias = this.loadMedias.bind(this);
					this.loadCategories = this.loadCategories.bind(this);
					this.uploadMedia = this.uploadMedia.bind(this);
					this.setContentHeight = this.setContentHeight.bind(this);
				}

				componentDidMount() {
					this.refs.input.focus();
					this.setState({ contentWidth: this.refs.content.clientWidth });
					Dispatcher.subscribe("UPDATE_MEDIAS", this.loadMedias);
					Dispatcher.subscribe("UPDATE_CATEGORIES", this.loadCategories);
					Dispatcher.dispatch({ type: "PICKER_BUTTON_ACTIVE", media_type: this.props.type });
				}

				componentDidUpdate() {
					if (this.type !== this.props.type) {
						this.type = this.props.type;
						this.setState({ category: null });
						this.loadCategories();
						this.loadMedias();
						Dispatcher.dispatch({ type: "PICKER_BUTTON_ACTIVE", media_type: this.props.type });
					}
					if (this.state.contentWidth !== this.refs.content.clientWidth) this.setState({ contentWidth: this.refs.content.clientWidth });
				}

				componentWillUnmount() {
					Dispatcher.unsubscribe("UPDATE_MEDIAS", this.loadMedias);
					Dispatcher.unsubscribe("UPDATE_CATEGORIES", this.loadCategories);
					Dispatcher.dispatch({ type: "PICKER_BUTTON_ACTIVE" });
				}

				clearSearch() {
					this.refs.input.value = "";
					this.setState({ textFilter: "" });
				}

				get numberOfColumns() {
					return Math.floor(this.state.contentWidth / 200);
				}

				setContentHeight(height) {
					this.contentHeight = height;
					if (this.refs.content) this.refs.content.style.height = `${this.contentHeight}px`;
					if (this.refs.endSticker) this.refs.endSticker.style.top = `${this.contentHeight + 12}px`;
				}

				get heights() {
					const cols = this.numberOfColumns;
					const heights = new Array(cols); heights.fill(0);
					if (this.state.category) return heights;
					const categories_len = this.filteredCategories.length;
					const rows = Math.ceil(categories_len / cols);
					const max = (categories_len % cols) || 999;
					for (let i = 0; i < cols; i++)
						heights[i] = (rows - (i < max ? 0 : 1)) * 122;
					return heights;
				}

				setCategory(category) {
					if (!category) { this.loadCategories(); this.loadMedias(); }
					this.setState({ category: category });
					this.clearSearch();
				}

				listWithId(list) {
					return list.map((e, i) => ({ ...e, id: i }));
				}

				filterCondition(name, filter) {
					name = name.replace(/(_|-)/gm, " ");
					filter = filter.replace(/(_|-)/gm, " ");
					for (const f of filter.split(' ').filter(e => e))
						if (!name.includes(f)) return false;
					return true;
				}

				get filteredCategories() {
					let filter = this.state.textFilter;
					if (!filter) return this.state.categories;
					return this.state.categories.filter(c => this.filterCondition(c.name.toLowerCase(), filter.toString().toLowerCase()));
				}

				get positionedCategories() {
					const thumbnails = this.randomThumbnails;
					const categories = this.filteredCategories;
					const width = this.state.contentWidth || 200;
					const n = Math.floor(width / 200);
					const item_width = (width - (12 * (n - 1))) / n;
					for (let c = 0; c < categories.length; c++) {
						if (this.props.type !== "audio") categories[c].thumbnail = thumbnails[categories[c].id];
						categories[c].positions = {
							left: (item_width + 12) * (c % n),
							top: 122 * Math.floor(c / n),
							width: item_width
						};
					}
					return categories;
				}

				get positionedMedias() {
					const heights = this.heights;
					const width = this.state.contentWidth || 200;
					const n = Math.floor(width / 200);
					const offset = this.state.textFilter ? this.filteredCategories.length : !this.state.category ? this.state.categories.length : 0;
					const placed = new Array(n);
					placed.fill(false);
					placed.fill(true, 0, offset % n);
					const item_width = (width - (12 * (n - 1))) / n;
					const medias = this.filteredMedias.reverse();
					for (let m = 0; m < medias.length; m++) {
						const min = {
							height: Math.min(...heights),
							index: heights.indexOf(Math.min(...heights))
						};
						const max = Math.max(...heights);
						const item_height = Math.round(100 * item_width * medias[m].height / medias[m].width) / 100;
						let placed_i = placed.indexOf(false);
						if (placed_i === -1) { placed.fill(false); placed_i = 0; }
						if (this.props.type === "audio") {
							medias[m].positions = {
								left: (item_width + 12) * ((offset + m) % n),
								top: 122 * Math.floor((offset + m) / n),
								width: item_width,
								height: 110
							}
							heights[min.index] = heights[min.index] + 110 + 12;
						} else {
							if ((min.height + item_height) < (max + 110) || m == medias.length - 1) {
								medias[m].positions = {
									left: (item_width + 12) * (min.index % n),
									top: min.height,
									width: item_width,
									height: item_height
								}
								heights[min.index] = heights[min.index] + item_height + 12;
							} else {
								medias[m].positions = {
									left: (item_width + 12) * (placed_i % n),
									top: Math.round(100 * heights[placed_i]) / 100,
									width: item_width,
									height: item_height
								}
								heights[placed_i] = heights[placed_i] + item_height + 12;
							}
							placed[placed_i] = true;
						}
					}
					this.setContentHeight(Math.max(...heights));
					return medias;
				}

				get filteredMedias() {
					let filter = this.state.textFilter;
					if (!filter) return this.mediasInCategory();
					return this.listWithId(this.state.medias).filter(m => this.filterCondition(m.name.toLowerCase(), filter.toString().toLowerCase()));
				}

				mediasInCategory() {
					if (!this.state.category) {
						if (!PluginUtilities.loadSettings(config.info.name).hideUnsortedMedias) return this.listWithId(this.state.medias);
						else return this.listWithId(this.state.medias).filter(m => m.category_id === undefined);
					}
					return this.listWithId(this.state.medias).filter(m => m.category_id === this.state.category.id);
				}

				openCategoryModal(op, values) {
					Modals.showModal(op === "create" ? labels.category.create : labels.category.edit,
						React.createElement(CategoryModal, {
							...values,
							modalRef: ref => this.modal = ref
						}),
						{
							danger: false,
							confirmText: op === "create" ? labels.create : Strings.EDIT,
							cancelText: Strings.CANCEL,
							onConfirm: () => {
								let res = false;
								if (op === "create") res = createCategory(this.props.type, this.modal.getValues());
								else res = editCategory(this.props.type, this.modal.getValues(), values.id);
								if (res) this.loadCategories();
							}
						}
					);
				}

				onContextMenu(e) {
					if (this.state.category) return;
					canClosePicker = false;
					ContextMenu.openContextMenu(e,
						ContextMenu.buildMenu([{
							type: "group",
							items: [{
								label: labels.category.create,
								action: () => this.openCategoryModal("create")
							}]
						}]), {
						onClose: () => canClosePicker = true
					})
				}

				onScroll(e) {
					Dispatcher.dispatch({ type: "SCROLLING_MEDIAS", scroll: e.target.scrollTop + 350 });
				}

				changeMediaCategory(media_id, category_id) {
					let type_data = PluginUtilities.loadData(config.info.name, this.props.type);
					type_data.medias[media_id].category_id = category_id;
					PluginUtilities.saveData(config.info.name, this.props.type, type_data);
					Toasts.success(labels.media.success.move[this.props.type]);
					this.loadMedias();
				}

				removeMediaCategory(media_id) {
					let type_data = PluginUtilities.loadData(config.info.name, this.props.type);
					delete type_data.medias[media_id].category_id;
					PluginUtilities.saveData(config.info.name, this.props.type, type_data);
					Toasts.success(labels.media.success.remove[this.props.type]);
					this.loadMedias();
				}

				categoriesItems(media_id) {
					return this.state.categories.map(c => {
						return {
							label: c.name,
							key: c.id,
							action: () => this.changeMediaCategory(media_id, c.id),
							render: () => React.createElement(CategoryMenuItem, { ...c, key: c.id })
						};
					}).filter(c => c.key !== (this.state.category && this.state.category.id) && c.key !== this.isInCategory(media_id));
				}

				isInCategory(media_id) {
					const media = PluginUtilities.loadData(config.info.name, this.props.type, { medias: [] }).medias[media_id];
					if (!media) return undefined;
					return media.category_id;
				}

				get randomThumbnails() {
					const thumbnails = [];
					for (let c = 0; c < this.state.categories.length; c++) {
						const id = this.state.categories[c].id;
						const medias = this.state.medias.filter(m => m.category_id === id);
						let media = null;
						if (medias.length === 0) continue;
						else if (medias.length === 1) media = medias[0];
						else media = medias[Math.floor(Math.random() * medias.length)];
						thumbnails[id] = media.poster || media.url;
					}
					return thumbnails;
				}

				loadCategories() {
					this.setState({ categories: PluginUtilities.loadData(config.info.name, this.props.type, { categories: [] }).categories });
				}

				loadMedias() {
					this.setState({ medias: PluginUtilities.loadData(config.info.name, this.props.type, { medias: [] }).medias });
				}

				uploadMedia(media_id, spoiler) {
					const media = this.state.medias[media_id];
					if (!media) return;
					require("https").get(media.url, res => {
						const bufs = [];
						res.on('data', chunk => bufs.push(chunk));
						res.on('end', () => {
							try {
								const content = document.querySelector('[class*="textArea"] [data-slate-string]')?.innerText
								const fileName = (media.name || "unknown") + "." + (media.url.split(".").pop().split("?").shift() || "png")
								WebpackModules.getByProps("instantBatchUpload").upload({
									channelId: SelectedChannelStore.getChannelId(),
									file: new File([Buffer.concat(bufs)], fileName),
									hasSpoiler: spoiler,
									fileName: fileName,
									draftType: 0,
									message: { content: content || '' }
								});
								ComponentDispatch.dispatchToLastSubscribed("CLEAR_TEXT");
								WebpackModules.getByProps("closeExpressionPicker").closeExpressionPicker();
							} catch (e) { console.error(e) }
						});
						res.on('error', err => console.error(err));
					});
				}

				onMediaContextMenu(e, media_id) {
					const items = [{
						label: "media-input",
						render: () => React.createElement(MediaMenuItemInput, { id: media_id, type: this.props.type, loadMedias: this.loadMedias })
					},
					{
						label: labels.media.upload.title,
						type: "submenu",
						items: [{
							label: labels.media.upload.normal,
							action: () => this.uploadMedia(media_id)
						}, {
							label: labels.media.upload.spoiler,
							action: () => this.uploadMedia(media_id, true)
						}]
					},
					{
						label: Strings.DOWNLOAD,
						action: () => {
							const media = PluginUtilities.loadData(config.info.name, this.props.type, { medias: [] }).medias[media_id];
							const ext = getUrlExt(media.url);
							BdApi.openDialog({ mode: "save", defaultPath: media.name + ext }).then(({ filePath }) => {
								require("https").get(media.url, res => {
									const bufs = [];
									res.on('data', chunk => bufs.push(chunk));
									res.on('end', () => writeFile(filePath, Buffer.concat(bufs), err => {
										if (err) return Toasts.error(labels.media.error.download[this.props.type]);
										Toasts.success(labels.media.success.download[this.props.type])
									}));
									res.on('error', () => Toasts.error(labels.media.error.download[this.props.type]));
								});
							})
						}
					}];
					const items_categories = this.categoriesItems(media_id);
					if (items_categories.length > 0) {
						items.splice(1, 0, {
							label: this.state.category || this.isInCategory(media_id) !== undefined ? labels.media.moveTo : labels.media.addTo,
							type: "submenu",
							items: items_categories
						});
					}
					if (this.isInCategory(media_id) !== undefined) items.push({
						label: labels.media.removeFrom,
						danger: true,
						action: () => this.removeMediaCategory(media_id)
					});
					canClosePicker = false;
					ContextMenu.openContextMenu(e, ContextMenu.buildMenu([
						{
							type: "group",
							items: items
						}
					]), {
						onClose: () => canClosePicker = true
					});
				}

				render() {
					return React.createElement("div", {
						id: `${this.props.type}-picker-tab-panel`,
						role: "tabpanel",
						"aria-labelledby": `${this.props.type}-picker-tab`,
						className: `${classes.gutter.container} fm-pickerContainer`
					},
						React.createElement("div", {
							className: `${classes.gutter.header} fm-header`
						},
							React.createElement("div", {
								className: `${classes.flex.flex} ${classes.flex.horizontal} ${classes.flex.justifyStart} ${classes.flex.alignCenter} ${classes.flex.noWrap}`,
								style: { flex: "1 1 auto" }
							},
								this.state.category ?
									React.createElement("div", {
										className: classes.gutter.backButton,
										role: "button",
										tabindex: "0",
										onClick: () => this.setState({ category: null })
									},
										React.createElement("svg", {
											"aria-hidden": false,
											width: "24",
											height: "24",
											viewBox: "0 0 24 24",
											fill: "none"
										},
											React.createElement("path", {
												fill: "currentColor",
												d: "M20 10.9378H14.2199H8.06628L10.502 8.50202L9 7L4 12L9 17L10.502 15.498L8.06628 13.0622H20V10.9378Z"
											})
										)
									) : null,
								this.state.category ?
									React.createElement("h5", {
										className: `${classes.colorStandard} ${classes.size14} ${classes.h5} ${classes.gutter.searchHeader}`
									}, this.state.category.name) : null,
								this.state.textFilter && !this.state.category ?
									React.createElement("div", {
										className: classes.gutter.backButton,
										role: "button",
										tabindex: "0",
										onClick: this.clearSearch
									},
										React.createElement("svg", {
											"aria-hidden": false,
											width: "24",
											height: "24",
											viewBox: "0 0 24 24",
											fill: "none"
										},
											React.createElement("path", {
												fill: "currentColor",
												d: "M20 10.9378H14.2199H8.06628L10.502 8.50202L9 7L4 12L9 17L10.502 15.498L8.06628 13.0622H20V10.9378Z"
											})
										)
									) : null,
								!this.state.category ?
									React.createElement("div", {
										className: `${classes.gutter.searchBar} ${classes.container.container} ${classes.container.medium}`
									},
										React.createElement("div", {
											className: classes.container.inner
										},
											React.createElement("input", {
												className: classes.container.input,
												placeholder: labels.searchItem[this.props.type],
												autofocus: true,
												ref: "input",
												onChange: e => this.setState({ textFilter: e.target.value })
											}),
											React.createElement("div", {
												className: `${classes.container.iconLayout} ${classes.container.medium} ${this.state.textFilter ? classes.container.pointer : ""}`,
												tabindex: "-1",
												role: "button",
												onClick: this.clearSearch
											},
												React.createElement("div", {
													className: classes.container.iconContainer
												},
													React.createElement("svg", {
														className: `${classes.container.clear} ${this.state.textFilter ? "" : ` ${classes.container.visible}`}`,
														"aria-hidden": false,
														width: "24",
														height: "24",
														viewBox: "0 0 24 24"
													},
														React.createElement("path", {
															fill: "currentColor",
															d: "M21.707 20.293L16.314 14.9C17.403 13.504 18 11.799 18 10C18 7.863 17.167 5.854 15.656 4.344C14.146 2.832 12.137 2 10 2C7.863 2 5.854 2.832 4.344 4.344C2.833 5.854 2 7.863 2 10C2 12.137 2.833 14.146 4.344 15.656C5.854 17.168 7.863 18 10 18C11.799 18 13.504 17.404 14.9 16.314L20.293 21.706L21.707 20.293ZM10 16C8.397 16 6.891 15.376 5.758 14.243C4.624 13.11 4 11.603 4 10C4 8.398 4.624 6.891 5.758 5.758C6.891 4.624 8.397 4 10 4C11.603 4 13.109 4.624 14.242 5.758C15.376 6.891 16 8.398 16 10C16 11.603 15.376 13.11 14.242 14.243C13.109 15.376 11.603 16 10 16Z"
														})
													),
													React.createElement("svg", {
														className: `${classes.container.clear} ${this.state.textFilter ? ` ${classes.container.visible}` : ""}`,
														"aria-hidden": false,
														width: "24",
														height: "24",
														viewBox: "0 0 24 24"
													},
														React.createElement("path", {
															fill: "currentColor",
															d: "M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
														})
													)
												)
											)
										)
									) : null
							)
						),
						React.createElement("div", {
							className: `${classes.gutter.content} fm-pickerContent`,
							style: { height: "100%" }
						},
							React.createElement("div", {
								className: `${classes.category.container} ${classes.scroller.thin} ${classes.scroller.scrollerBase} ${classes.scroller.fade} fm-pickerContentContainer`,
								style: { overflow: "hidden scroll", "padding-right": "0" },
								onContextMenu: this.onContextMenu,
								onScroll: this.onScroll
							},
								React.createElement("div", {
									className: `${classes.scroller.content} fm-pickerContentContainerContent`
								},
									React.createElement("div", {
										style: { position: "absolute", left: "12px", top: "12px", width: "calc(100% - 16px)" },
										ref: "content"
									},
										!this.state.category && (this.state.categories.length + this.state.medias.length === 0) ?
											React.createElement(EmptyFavorites, { type: this.props.type })
											: null,
										this.state.categories.length > 0 && !this.state.category && this.state.contentWidth ?
											React.createElement(RenderList, {
												component: CategoryCard,
												items: this.positionedCategories,
												componentProps: {
													type: this.props.type,
													setCategory: this.setCategory,
													openCategoryModal: this.openCategoryModal,
													changeMediaCategory: this.changeMediaCategory,
													length: this.state.categories.length
												}
											})
											: null,
										this.state.medias.length > 0 && this.state.contentWidth ?
											React.createElement(RenderList, {
												component: MediaCard,
												items: this.positionedMedias,
												componentProps: {
													type: this.props.type,
													volume: this.props.volume,
													onMediaContextMenu: this.onMediaContextMenu
												}
											})
											: null
									),
									this.state.categories.length > 0 || this.state.medias.length > 0 ?
										React.createElement("div", {
											style: {
												position: "absolute",
												left: "12px",
												top: `${this.contentHeight + 12}px`,
												width: "calc(100% - 16px)",
												height: "220px"
											},
											ref: "endSticker"
										},
											React.createElement("div", {
												className: classes.result.endContainer,
												style: {
													position: "sticky",
													top: "0px",
													left: "0px",
													width: "100%",
													height: "220px"
												}
											})
										) : null
								)
							)
						)
					);
				}
			}

			const MediaButton = class extends React.Component {
				constructor(props) {
					super(props);

					this.state = {
						active: false
					}

					this.changeActive = this.changeActive.bind(this);
					this.checkPicker = this.checkPicker.bind(this);
				}

				changeActive({ media_type }) {
					this.setState({ active: media_type === this.props.type });
				}

				checkPicker() {
					canClosePicker = this.props.type !== WebpackModules.getByProps("useExpressionPickerStore").useExpressionPickerStore.getState().activeView;
				}

				componentDidMount() {
					Dispatcher.subscribe("PICKER_BUTTON_ACTIVE", this.changeActive);
				}

				componentWillUnmount() {
					Dispatcher.unsubscribe("PICKER_BUTTON_ACTIVE", this.changeActive);
				}

				render() {
					return React.createElement("div", {
						onMouseDown: this.checkPicker,
						onClick: () => EPS.toggleExpressionPicker(this.props.type, EPSConstants),
						className: `${classes.textarea.buttonContainer} fm-buttonContainer`
					},
						React.createElement("button", {
							className: `${classes.look.button} ${classes.look.lookBlank} ${classes.look.colorBrand} ${classes.look.grow}${this.state.active ? ` ${classes.icon.active}` : ""} fm-button`,
							tabindex: "0",
							type: "button",
						},
							React.createElement("div", {
								className: `${classes.look.contents} ${classes.textarea.button} ${classes.icon.button} fm-buttonContent`
							},
								React.createElement("div", {
									className: `${classes.icon.buttonWrapper} fm-buttonWrapper`,
									style: { opacity: "1", transform: "none" }
								},
									this.props.type === "image" ? ImageSVG() : null,
									this.props.type === "video" ? VideoSVG() : null,
									this.props.type === "audio" ? AudioSVG() : null,
								)
							)
						)
					)
				}
			}

			function categoryValidator(type, name, color, id) {
				if (!name || typeof name !== "string") return { error: "error", message: labels.category.error.needName };
				if (name.length > 20) return { error: "error", message: labels.category.error.invalidNameLength };
				if (!color || typeof color !== "string" || !color.startsWith("#")) return { error: "error", message: labels.category.error.wrongColor };
				const type_data = PluginUtilities.loadData(config.info.name, type, { categories: [], medias: [] });
				if (type_data.categories.find(c => c.name === name && c.id !== id) !== undefined) return { error: "error", message: labels.category.error.nameExists };
				return type_data;
			}

			function createCategory(type, { name, color }) {
				const res = categoryValidator(type, name, color);
				if (res.error) { Toasts.error(res.message); return false; }

				res.categories.push({ id: (res.categories.slice(-1)[0] && res.categories.slice(-1)[0].id || 0) + 1, name: name, color: color });
				PluginUtilities.saveData(config.info.name, type, res);

				Toasts.success(labels.category.success.create);
				return true;
			}

			function editCategory(type, { name, color }, id) {
				const res = categoryValidator(type, name, color, id);
				if (res.error) { Toasts.error(res.message); return false; }

				res.categories[res.categories.findIndex(c => c.id === id)] = { id: id, name: name, color: color };
				PluginUtilities.saveData(config.info.name, type, res);

				Toasts.success(labels.category.success.edit);
				return true;
			}

			function moveCategory(type, old_i, new_i) {
				const type_data = PluginUtilities.loadData(config.info.name, type, { categories: [], medias: [] });
				array_move(type_data.categories, old_i, new_i);
				PluginUtilities.saveData(config.info.name, type, type_data);

				Toasts.success(labels.category.success.move);
				Dispatcher.dispatch({ type: "UPDATE_CATEGORIES" });
			}

			function deleteCategory(type, id) {
				let type_data = PluginUtilities.loadData(config.info.name, type, { categories: [], medias: [] });
				if (type_data.categories.find(c => c.id === id) === undefined) { Toasts.error(labels.category.error.invalidCategory); return false; }
				type_data.categories = type_data.categories.filter(c => c.id !== id);
				type_data.medias = type_data.medias.map(m => { if (m.category_id === id) delete m.category_id; return m; });
				PluginUtilities.saveData(config.info.name, type, type_data);

				Toasts.success(labels.category.success.delete);
				return true;
			}

			return class FavoriteMedia extends Plugin {

				onStart() {
					PluginUpdater.checkForUpdate(
						this.getName(),
						this.getVersion(),
						"https://raw.githubusercontent.com/Dastan21/BDAddons/main/plugins/FavoriteMedia/FavoriteMedia.plugin.js"
					);
					this.patchExpressionPicker();
					this.patchChannelTextArea();
					this.patchMedias();
					this.patchClosePicker();
					this.patchGIFTab();
					this.patchMessageContextMenu();
					PluginUtilities.addStyle(this.getName() + "-css", `
						.category-input-color > input[type="color"] {
							opacity: 0;
							-webkit-appearance: none;
							width: 48px;
							height: 48px;
						}
						.category-input-color {
							transition: 0.2s;
						}
						.category-input-color:hover {
							transform: scale(1.1);
						}
						.video-favbtn {
							top: calc(50% - 1em);
						}
						.audio-favbtn {
							margin-right: 12%;
						}
						.show-controls {
							position: absolute;
							top: 8px;
							left: 8px;
							z-index: 4;
							opacity: 0;
							-webkit-box-sizing: border-box;
							box-sizing: border-box;
							-webkit-transform: translateY(-10px);
							transform: translateY(-10px);
							-webkit-transition: opacity .1s ease,-webkit-transform .2s ease;
							transition: opacity .1s ease,-webkit-transform .2s ease;
							transition: transform .2s ease,opacity .1s ease;
							transition: transform .2s ease,opacity .1s ease,-webkit-transform .2s ease;
							width: 26px;
							height: 26px;
							color: var(--interactive-normal);
						}
						.show-controls:hover, .show-controls.active {
							-webkit-transform: none;
							transform: none;
							color: var(--interactive-active);
						}
						div:hover > .show-controls {
							opacity: 1;
							-webkit-transform: none;
							transform: none;
						}
						.${classes.result.result} > .${classes.result.gif}:focus {
							outline: none;
						}
						.${classes.image.imageAccessory} > div:not(.${classes.gif.selected}) > svg {
							filter: drop-shadow(2px 2px 2px rgb(0 0 0 / 0.3));
						}
						.category-dragover:after {
							-webkit-box-shadow: inset 0 0 0 2px var(--brand-experiment), inset 0 0 0 3px #2f3136 !important;
    						box-shadow: inset 0 0 0 2px var(--brand-experiment), inset 0 0 0 3px #2f3136 !important;
						}
						.fm-colorDot {
							margin-right: 0.7em;
							margin-left: 0;
						}
					`);
				}
				onStop() {
					PluginUtilities.removeStyle(this.getName() + "-css");
					Patcher.unpatchAll();
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}

				MediaTab(mediaType, elementType) {
					const selected = mediaType === WebpackModules.getByProps("useExpressionPickerStore").useExpressionPickerStore.getState().activeView;
					return React.createElement(elementType, {
						id: `${mediaType}-picker-tab`,
						"aria-controls": `${mediaType}-picker-tab-panel`,
						"aria-selected": selected,
						className: "fm-pickerTab",
						viewType: mediaType,
						isActive: selected
					}, labels.tabName[mediaType]);
				}

				patchExpressionPicker() {
					// https://github.com/rauenzi/BetterDiscordApp/blob/main/renderer/src/builtins/emotes/emotemenu.js
					Patcher.after(ExpressionPicker, "type", (_, __, returnValue) => {
						const originalChildren = Utilities.getNestedProp(returnValue, "props.children.props.children");
						if (!originalChildren) return;
						returnValue.props.children.props.children = (props) => {
							const childrenReturn = Reflect.apply(originalChildren, null, [props]);
							let head = Utilities.getNestedProp(childrenReturn, "props.children.props.children.1.props.children.1.props.children.props.children");
							if (!head) head = Utilities.getNestedProp(childrenReturn, "props.children.props.children.1.props.children.0.props.children.props.children");
							const body = Utilities.getNestedProp(childrenReturn, "props.children.props.children.1.props.children");
							if (!head || !body) return childrenReturn;
							try {
								const elementType = head[0].type.type;
								if (this.settings.image.enabled) head.push(this.MediaTab("image", elementType));
								if (this.settings.video.enabled) head.push(this.MediaTab("video", elementType));
								if (this.settings.audio.enabled) head.push(this.MediaTab("audio", elementType));
								const activeMediaPicker = WebpackModules.getByProps("useExpressionPickerStore").useExpressionPickerStore.getState().activeView;
								if (["image", "video", "audio"].includes(activeMediaPicker)) body.push(React.createElement(MediaPicker, { type: activeMediaPicker, volume: this.settings.mediaVolume }));
							} catch (err) {
								console.error("[FavoriteMedia] Error in ExpressionPicker\n", err);
							}
							return childrenReturn;
						};
					});
				}

				patchChannelTextArea() {
					Patcher.after(ChannelTextAreaButtons, "type", (_, __, returnValue) => {
						if (Utilities.getNestedProp(returnValue, "props.children.1.props.type") === "sidebar") return;
						const channel = ChannelStore.getChannel(SelectedChannelStore.getChannelId());
						let perms = true;
						// Deprecated, just kept in case of old versions
						try { perms = Permissions.can(PermissionsConstants.SEND_MESSAGES, channel, UserStore.getCurrentUser().id); } catch (_) { }
						try { perms = Permissions.can(PermissionsConstants.SEND_MESSAGES, UserStore.getCurrentUser(), channel) } catch (_) { }

						if (!perms) perms = Permissions.can({
							permission: PermissionsConstants.SEND_MESSAGES,
							user: UserStore.getCurrentUser(),
							context: channel
						})
						if (!channel.type && !perms) return;
						const buttons = returnValue.props.children;
						if (!buttons || !Array.isArray(buttons)) return;
						if (this.settings.btnsPosition === "left") {
							if (this.settings.audio.showBtn && this.settings.audio.enabled) buttons.unshift(React.createElement(MediaButton, { type: "audio" }));
							if (this.settings.video.showBtn && this.settings.video.enabled) buttons.unshift(React.createElement(MediaButton, { type: "video" }));
							if (this.settings.image.showBtn && this.settings.image.enabled) buttons.unshift(React.createElement(MediaButton, { type: "image" }));
						} else {
							if (this.settings.image.showBtn && this.settings.image.enabled) buttons.push(React.createElement(MediaButton, { type: "image" }));
							if (this.settings.video.showBtn && this.settings.video.enabled) buttons.push(React.createElement(MediaButton, { type: "video" }));
							if (this.settings.audio.showBtn && this.settings.audio.enabled) buttons.push(React.createElement(MediaButton, { type: "audio" }));
						}
					});
				}

				patchMedias() {
					Patcher.after(MediaPlayer.prototype, "render", ({ props }, __, returnValue) => {
						const type = returnValue.props.children[1].type === "audio" ? "audio" : "video";
						if (!this.settings[type].enabled) return;
						let url = props.src;
						if (!url) return;
						url = url.split("https/")[1];
						if (!url) url = props.src;
						else url = "https://" + url;
						// force cdn link because on PC media link videos can't be played
						url = url.replace("media.discordapp.net", "cdn.discordapp.com");
						returnValue.props.children.push(React.createElement(MediaFavButton, {
							type: type,
							url: url,
							poster: props.poster,
							width: props.width,
							height: props.height
						}));
					});
					Patcher.after(Image.prototype, "render", (_, __, returnValue) => {
						if (!this.settings.image.enabled) return;
						const propsDiv = returnValue.props?.children?.props;
						if (!propsDiv) return;
						const propsButton = propsDiv.children?.[1]?.props;
						if (!propsButton) return;
						const propsImg = propsButton.children?.props;
						if (!propsImg?.src || propsDiv.className?.includes("embedVideo")) return;
						const onclick = propsButton.onClick;
						propsButton.onClick = e => {
							if (e.target?.alt === undefined) e.preventDefault();
							else onclick(e);
						}
						returnValue.props.children.props.children.push(React.createElement(MediaFavButton, {
							type: "image",
							url: propsImg.src.replace("media.discordapp.net", "cdn.discordapp.com").replace(/\?width=([\d]*)\&height=([\d]*)/, ""),
							width: propsImg.style?.width,
							height: propsImg.style?.height
						}));
					});
				}

				patchClosePicker() {
					Patcher.instead(WebpackModules.getByProps("closeExpressionPicker"), "closeExpressionPicker", (_, __, originalFunction) => {
						if (canClosePicker) originalFunction();
					});
				}

				async patchGIFTab() {
					const GIFPicker = await ReactComponents.getComponentByName("GIFPicker", "#gif-picker-tab-panel");
					Patcher.after(GIFPicker.component.prototype, "render", (_this, _, __) => {
						if (!this.settings.forceShowFavoritesGIFs) return;
						_this.setState({ resultType: "Favorites" });
					});
				}

				async patchMessageContextMenu() {
					const MessageContextMenu = await ContextMenu.getDiscordMenu(m => m?.displayName === "MessageContextMenu");
					Patcher.after(MessageContextMenu, "default", (_, [props], returnValue) => {
						if (returnValue.props?.children?.find(e => e?.props?.id === "favoriteMedia")) return;
						if (!this.settings.showContextMenuFavorite) return;
						if (!(
							((props.target.tagName === "A" && !props.target.parentElement.className?.includes("embedVideo")) || (props.target.tagName === "svg" && props.target.className && props.target.className.baseVal === classes.gif.icon) || props.target.tagName === "path") || // image
							(props.target.tagName === "VIDEO" && props.target.className && !props.target.className.includes("embedMedia")) || // video
							(props.target.tagName === "A" && props.target.className && props.target.className.includes("metadataName")) // audio
						)) return;
						let target = props.target;
						if (target.tagName === "svg") target = props.target.parentElement?.parentElement?.previousSibling;
						if (target.tagName === "path") target = props.target.parentElement?.parentElement?.parentElement?.previousSibling;
						if (!target) return;
						const data = {
							type: "image",
							url: target.src || target.href,
							poster: target.poster,
							width: Number(target.clientWidth),
							height: Number(target.clientHeight),
							favorited: undefined
						};
						data.url = data.url.replace("media.discordapp.net", "cdn.discordapp.com");
						if (props.target.tagName === "VIDEO") {
							data.type = "video";
							data.width = Number(target.parentElement.parentElement.style.width.replace("px", ""))
							data.height = Number(target.parentElement.parentElement.style.height.replace("px", ""))
						}
						if (target.className.includes("metadataName")) data.type = "audio";
						data.favorited = this.isFavorited(data.type, data.url);
						const menuItems = [];
						if (data.favorited) {
							const category_id = PluginUtilities.loadData(config.info.name, data.type, { medias: [] }).medias.find(m => m.url === data.url)?.category_id;
							const categories = PluginUtilities.loadData(config.info.name, data.type, { categories: [] }).categories.filter(c => category_id !== undefined ? c.id !== category_id : true);
							const buttonCategories = categories.map(c => ({
								label: c.name,
								key: c.id,
								action: () => {
									this.moveMediaCategory(data.type, data.url, c.id);
								},
								render: () => React.createElement(CategoryMenuItem, { ...c, key: c.id })
							}));
							menuItems.push({
								label: Strings.GIF_TOOLTIP_REMOVE_FROM_FAVORITES,
								icon: () => React.createElement(StarSVG, { filled: true }),
								action: () => {
									this.unfavoriteMedia(data);
									Dispatcher.dispatch({ type: "FAVORITE_MEDIA", url: data.url });
								}
							});
							if (categories.length) menuItems.push({
								label: category_id !== undefined ? labels.media.moveTo : labels.media.addTo,
								type: "submenu",
								items: buttonCategories
							});
						} else {
							const categories = PluginUtilities.loadData(config.info.name, data.type, { categories: [] }).categories;
							const buttonCategories = categories.map(c => ({
								label: c.name,
								key: c.id,
								action: () => {
									this.favoriteMedia(data);
									this.moveMediaCategory(data.type, data.url, c.id);
									Dispatcher.dispatch({ type: "FAVORITE_MEDIA", url: data.url });
								},
								render: () => React.createElement(CategoryMenuItem, { ...c, key: c.id })
							}));
							menuItems.push({
								label: Strings.GIF_TOOLTIP_ADD_TO_FAVORITES,
								icon: () => React.createElement(StarSVG, { filled: true }),
								action: () => {
									this.favoriteMedia(data);
									Dispatcher.dispatch({ type: "FAVORITE_MEDIA", url: data.url });
								}
							});
							if (categories.length) menuItems.push({
								label: labels.media.addTo,
								type: "submenu",
								items: buttonCategories
							});
						}
						const contextMenu = ContextMenu.buildMenuItem({
							id: "favoriteMedia",
							label: config.info.name,
							type: "submenu",
							items: menuItems
						});
						returnValue.props.children.splice(returnValue.props.children.length, 0, contextMenu);
					});
				}

				isFavorited(type, url) {
					return PluginUtilities.loadData(config.info.name, type, { medias: [] }).medias.find(e => e.url === url) !== undefined;
				}

				favoriteMedia(props) {
					let type_data = PluginUtilities.loadData(config.info.name, props.type, { medias: [] });
					if (type_data.medias.find(m => m.url === props.url)) return;
					let data = null;
					switch (props.type) {
						case "video":
							data = {
								url: props.url,
								poster: props.poster,
								width: props.width,
								height: props.height,
								name: getUrlName(props.url)
							};
							break;
						case "audio":
							data = {
								url: props.url,
								name: getUrlName(props.url),
								ext: getUrlExt(props.url)
							};
							break;
						default: // image
							data = {
								url: props.url,
								width: props.width,
								height: props.height,
								name: getUrlName(props.url)
							};
					}
					if (!data) return;
					type_data.medias.push(data);
					PluginUtilities.saveData(config.info.name, props.type, type_data);
				}

				unfavoriteMedia(props) {
					let type_data = PluginUtilities.loadData(config.info.name, props.type, { medias: [] });
					if (!type_data.medias.length) return;
					type_data.medias = type_data.medias.filter(e => e.url !== props.url);
					PluginUtilities.saveData(config.info.name, props.type, type_data);
					if (props.fromPicker) Dispatcher.dispatch({ type: "UPDATE_MEDIAS" });
				}

				moveMediaCategory(type, url, category_id) {
					let type_data = PluginUtilities.loadData(config.info.name, type, { medias: [] });
					const index = type_data.medias.findIndex(m => m.url === url);
					if (index < 0) return;
					type_data.medias[index].category_id = category_id;
					PluginUtilities.saveData(config.info.name, type, type_data);
					Toasts.success(labels.media.success.move[type]);
				}
			};

			function setLabelsByLanguage() {
				switch (UserSettingsStore.locale) {
					case "bg":		// Bulgarian
						return {
							"tabName": {
								"image": "Картина",
								"video": "Видео",
								"audio": "Аудио"
							},
							"create": "Създайте",
							"category": {
								"unsorted": "Не са сортирани",
								"create": "Създайте категория",
								"edit": "Редактиране на категорията",
								"delete": "Изтриване на категорията",
								"download": "Изтеглете мултимедия",
								"placeholder": "Име на категория",
								"move": "Ход",
								"moveNext": "След",
								"movePrevious": "Преди",
								"color": "Цвят",
								"copyColor": "Копиране на цвят",
								"copiedColor": "Цветът е копиран!",
								"error": {
									"needName": "Името не може да бъде празно",
									"invalidNameLength": "Името трябва да съдържа максимум 20 знака",
									"wrongColor": "Цветът е невалиден",
									"nameExists": "това име вече съществува",
									"invalidCategory": "Категорията не съществува",
									"download": "Изтеглянето на мултимедия не бе успешно",
									"download": "Median lataaminen epäonnistui"
								},
								"success": {
									"create": "Категорията е създадена!",
									"delete": "Категорията е изтрита!",
									"edit": "Категорията е променена!",
									"move": "Категорията е преместена!",
									"download": "Медиите са качени!"
								},
								"emptyHint": "Щракнете с десния бутон, за да създадете категория!"
							},
							"media": {
								"emptyHint": {
									"image": "Кликнете върху звездата в ъгъла на изображението, за да го поставите в любимите си",
									"video": "Кликнете върху звездата в ъгъла на видеоклипа, за да го поставите в любимите си",
									"audio": "Кликнете върху звездата в ъгъла на звука, за да го поставите в любимите си"
								},
								"addTo": "Добавяне",
								"moveTo": "Ход",
								"removeFrom": "Премахване от категорията",
								"upload": {
									"title": "Качване",
									"normal": "Нормално",
									"spoiler": "Спойлер"
								},
								"success": {
									"move": {
										"image": "Изображението е преместено!",
										"video": "Видеото е преместено!",
										"audio": "Аудиото е преместено!"
									},
									"remove": {
										"image": "Изображението е премахнато от категориите!",
										"video": "Видеото е премахнато от категориите!",
										"audio": "Аудиото е премахнато от категориите!"
									},
									"download": {
										"image": "Изображението е качено!",
										"video": "Видеото е качено!",
										"audio": "Аудиото е изтеглено!"
									}
								},
								"error": {
									"download": {
										"image": "Качването на изображението не бе успешно",
										"video": "Изтеглянето на видеоклипа не бе успешно",
										"audio": "Изтеглянето на аудио не бе успешно"
									}
								},
								"controls": {
									"show": "Показване на поръчки",
									"hide": "Скриване на поръчките"
								},
								"placeholder": {
									"image": "Име на изображението",
									"video": "Име на видеоклипа",
									"audio": "Име на звука"
								}
							},
							"searchItem": {
								"image": "Търсене на изображения или категории",
								"video": "Търсете видеоклипове или категории",
								"audio": "Търсене на аудио или категории"
							}
						};
					case "da":		// Danish
						return {
							"tabName": {
								"image": "Billede",
								"video": "Video",
								"audio": "Lyd"
							},
							"create": "skab",
							"category": {
								"unsorted": "Ikke sorteret",
								"create": "Opret en kategori",
								"edit": "Rediger kategori",
								"delete": "Slet kategori",
								"download": "Download medier",
								"placeholder": "Kategorinavn",
								"move": "Bevæge sig",
								"moveNext": "Efter",
								"movePrevious": "Før",
								"color": "Farve",
								"copyColor": "Kopier farve",
								"copiedColor": "Farve kopieret!",
								"error": {
									"needName": "Navnet kan ikke være tomt",
									"invalidNameLength": "Navnet skal maksimalt indeholde 20 tegn",
									"wrongColor": "Farven er ugyldig",
									"nameExists": "dette navn findes allerede",
									"invalidCategory": "Kategorien findes ikke",
									"download": "Kunne ikke downloade medier"
								},
								"success": {
									"create": "Kategorien er oprettet!",
									"delete": "Kategorien er blevet slettet!",
									"edit": "Kategorien er blevet ændret!",
									"move": "Kategorien er flyttet!",
									"download": "Medierne er blevet uploadet!"
								},
								"emptyHint": "Højreklik for at oprette en kategori!"
							},
							"media": {
								"emptyHint": {
									"image": "Klik på stjernen i hjørnet af et billede for at placere det i dine favoritter",
									"video": "Klik på stjernen i hjørnet af en video for at placere den i dine favoritter",
									"audio": "Klik på stjernen i hjørnet af en lyd for at placere den i dine favoritter"
								},
								"addTo": "Tilføje",
								"moveTo": "Bevæge sig",
								"removeFrom": "Fjern fra kategori",
								"upload": {
									"title": "Upload",
									"normal": "Normal",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "Billedet er flyttet!",
										"video": "Videoen er flyttet!",
										"audio": "Lyden er flyttet!",
										"download": {
											"image": "Billedet er uploadet!",
											"video": "Videoen er blevet uploadet!",
											"audio": "Lyden er downloadet!"
										}
									},
									"remove": {
										"image": "Billedet er fjernet fra kategorierne!",
										"video": "Videoen er fjernet fra kategorierne!",
										"audio": "Lyd er fjernet fra kategorier!"
									},
									"download": {
										"image": "Billedet er uploadet!",
										"video": "Videoen er blevet uploadet!",
										"audio": "Lyden er downloadet!"
									}
								},
								"error": {
									"download": {
										"image": "Billedet kunne ikke uploades",
										"video": "Videoen kunne ikke downloades",
										"audio": "Kunne ikke downloade lyd"
									}
								},
								"controls": {
									"show": "Vis ordrer",
									"hide": "Skjul ordrer"
								},
								"placeholder": {
									"image": "Billednavn",
									"video": "Video navn",
									"audio": "Audio navn"
								}
							},
							"searchItem": {
								"image": "Søg efter billeder eller kategorier",
								"video": "Søg efter videoer eller kategorier",
								"audio": "Søg efter lydbånd eller kategorier"
							}
						};
					case "de":		// German
						return {
							"tabName": {
								"image": "Bild",
								"video": "Video",
								"audio": "Audio"
							},
							"create": "Erstellen",
							"category": {
								"unsorted": "Nicht sortiert",
								"create": "Erstellen Sie eine Kategorie",
								"edit": "Kategorie bearbeiten",
								"delete": "Kategorie löschen",
								"download": "Medien herunterladen",
								"placeholder": "Kategoriename",
								"move": "Bewegung",
								"moveNext": "Nach dem",
								"movePrevious": "Vor",
								"color": "Farbe",
								"copyColor": "Farbe kopieren",
								"copiedColor": "Farbe kopiert!",
								"error": {
									"needName": "Name darf nicht leer sein",
									"invalidNameLength": "Der Name darf maximal 20 Zeichen lang sein",
									"wrongColor": "Farbe ist ungültig",
									"nameExists": "Dieser Name existiert bereits",
									"invalidCategory": "Die Kategorie existiert nicht",
									"download": "Fehler beim Herunterladen der Medien"
								},
								"success": {
									"create": "Die Kategorie wurde erstellt!",
									"delete": "Die Kategorie wurde gelöscht!",
									"edit": "Die Kategorie wurde geändert!",
									"move": "Die Kategorie wurde verschoben!",
									"download": "Die Medien wurden hochgeladen!"
								},
								"emptyHint": "Rechtsklick um eine Kategorie zu erstellen!"
							},
							"media": {
								"emptyHint": {
									"image": "Klicken Sie auf den Stern in der Ecke eines Bildes, um es in Ihre Favoriten aufzunehmen",
									"video": "Klicke auf den Stern in der Ecke eines Videos, um es zu deinen Favoriten hinzuzufügen",
									"audio": "Klicken Sie auf den Stern in der Ecke eines Audios, um es in Ihre Favoriten aufzunehmen"
								},
								"addTo": "Hinzufügen",
								"moveTo": "Bewegung",
								"removeFrom": "Aus Kategorie entfernen",
								"upload": {
									"title": "Hochladen",
									"normal": "Normal",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "Das Bild wurde verschoben!",
										"video": "Das Video wurde verschoben!",
										"audio": "Der Ton wurde verschoben!"
									},
									"remove": {
										"image": "Das Bild wurde aus den Kategorien entfernt!",
										"video": "Das Video wurde aus den Kategorien entfernt!",
										"audio": "Audio wurde aus den Kategorien entfernt!"
									},
									"download": {
										"image": "Das Bild wurde hochgeladen!",
										"video": "Das Video wurde hochgeladen!",
										"audio": "Die Audiodatei wurde heruntergeladen!"
									}
								},
								"error": {
									"download": {
										"image": "Fehler beim Hochladen des Bildes",
										"video": "Video konnte nicht heruntergeladen werden",
										"audio": "Audio konnte nicht heruntergeladen werden"
									}
								},
								"controls": {
									"show": "Bestellungen anzeigen",
									"hide": "Bestellungen ausblenden"
								},
								"placeholder": {
									"image": "Bildname",
									"video": "Videoname",
									"audio": "Audioname"
								}
							},
							"searchItem": {
								"image": "Nach Bildern oder Kategorien suchen",
								"video": "Nach Videos oder Kategorien suchen",
								"audio": "Nach Audios oder Kategorien suchen"
							}
						};
					case "el":		// Greek
						return {
							"tabName": {
								"image": "Εικόνα",
								"video": "βίντεο",
								"audio": "Ήχος"
							},
							"create": "Δημιουργώ",
							"category": {
								"unsorted": "Χωρίς ταξινόμηση",
								"create": "Δημιουργήστε μια κατηγορία",
								"edit": "Επεξεργασία κατηγορίας",
								"delete": "Διαγραφή κατηγορίας",
								"download": "Λήψη μέσων",
								"placeholder": "Ονομα κατηγορίας",
								"move": "Κίνηση",
								"moveNext": "Μετά",
								"movePrevious": "Πριν",
								"color": "Χρώμα",
								"copyColor": "Αντιγραφή χρώματος",
								"copiedColor": "Το χρώμα αντιγράφηκε!",
								"error": {
									"needName": "Το όνομα δεν μπορεί να είναι κενό",
									"invalidNameLength": "Το όνομα πρέπει να περιέχει έως και 20 χαρακτήρες",
									"wrongColor": "Το χρώμα δεν είναι έγκυρο",
									"nameExists": "αυτό το όνομα υπάρχει ήδη",
									"invalidCategory": "Η κατηγορία δεν υπάρχει",
									"download": "Αποτυχία λήψης μέσων"
								},
								"success": {
									"create": "Η κατηγορία έχει δημιουργηθεί!",
									"delete": "Η κατηγορία διαγράφηκε!",
									"edit": "Η κατηγορία άλλαξε!",
									"move": "Η κατηγορία έχει μετακινηθεί!",
									"download": "Τα μέσα έχουν ανέβει!"
								},
								"emptyHint": "Κάντε δεξί κλικ για να δημιουργήσετε μια κατηγορία!"
							},
							"media": {
								"emptyHint": {
									"image": "Κάντε κλικ στο αστέρι στη γωνία μιας εικόνας για να την βάλετε στα αγαπημένα σας",
									"video": "Κάντε κλικ στο αστέρι στη γωνία ενός βίντεο για να το βάλετε στα αγαπημένα σας",
									"audio": "Κάντε κλικ στο αστέρι στη γωνία ενός ήχου για να το βάλετε στα αγαπημένα σας"
								},
								"addTo": "Προσθήκη",
								"moveTo": "Κίνηση",
								"removeFrom": "Κατάργηση από την κατηγορία",
								"upload": {
									"title": "Μεταφόρτωση",
									"normal": "Κανονικός",
									"spoiler": "Φθείρων"
								},
								"success": {
									"move": {
										"image": "Η εικόνα μετακινήθηκε!",
										"video": "Το βίντεο μετακινήθηκε!",
										"audio": "Ο ήχος μετακινήθηκε!"
									},
									"remove": {
										"image": "Η εικόνα έχει αφαιρεθεί από τις κατηγορίες!",
										"video": "Το βίντεο καταργήθηκε από τις κατηγορίες!",
										"audio": "Ο ήχος καταργήθηκε από κατηγορίες!"
									},
									"download": {
										"image": "Η εικόνα ανέβηκε!",
										"video": "Το βίντεο ανέβηκε!",
										"audio": "Ο ήχος έχει γίνει λήψη!"
									}
								},
								"error": {
									"download": {
										"image": "Αποτυχία μεταφόρτωσης εικόνας",
										"video": "Αποτυχία λήψης βίντεο",
										"audio": "Αποτυχία λήψης ήχου"
									}
								},
								"controls": {
									"show": "Εμφάνιση παραγγελιών",
									"hide": "Απόκρυψη παραγγελιών"
								},
								"placeholder": {
									"image": "Όνομα εικόνας",
									"video": "Όνομα βίντεο",
									"audio": "Όνομα ήχου"
								}
							},
							"searchItem": {
								"image": "Αναζήτηση εικόνων ή κατηγοριών",
								"video": "Αναζήτηση βίντεο ή κατηγοριών",
								"audio": "Αναζήτηση ήχων ή κατηγοριών"
							}
						};
					case "es":		// Spanish
						return {
							"tabName": {
								"image": "Imagen",
								"video": "Video",
								"audio": "Audio"
							},
							"create": "Crear",
							"category": {
								"unsorted": "No ordenado",
								"create": "Crea una categoria",
								"edit": "Editar categoria",
								"delete": "Eliminar categoría",
								"download": "Descargar medios",
								"placeholder": "Nombre de la categoría",
								"move": "Moverse",
								"moveNext": "Después",
								"movePrevious": "Antes",
								"color": "Color",
								"copyColor": "Copiar color",
								"copiedColor": "¡Color copiado!",
								"error": {
									"needName": "El nombre no puede estar vacío",
									"invalidNameLength": "El nombre debe contener un máximo de 20 caracteres.",
									"wrongColor": "El color no es válido",
									"nameExists": "Este nombre ya existe",
									"invalidCategory": "La categoría no existe",
									"download": "¡Los medios han sido cargados!"
								},
								"success": {
									"create": "¡La categoría ha sido creada!",
									"delete": "¡La categoría ha sido eliminada!",
									"edit": "¡La categoría ha sido cambiada!",
									"move": "¡La categoría ha sido movida!",
									"download": "¡Los medios han sido cargados!"
								},
								"emptyHint": "¡Haz clic derecho para crear una categoría!"
							},
							"media": {
								"emptyHint": {
									"image": "Haga clic en la estrella en la esquina de una imagen para ponerla en sus favoritos",
									"video": "Haga clic en la estrella en la esquina de un video para ponerlo en sus favoritos",
									"audio": "Haga clic en la estrella en la esquina de un audio para ponerlo en sus favoritos"
								},
								"addTo": "Agregar",
								"moveTo": "Moverse",
								"removeFrom": "Quitar de la categoría",
								"upload": {
									"title": "Subir",
									"normal": "normal",
									"spoiler": "Revelación"
								},
								"success": {
									"move": {
										"image": "¡La imagen se ha movido!",
										"video": "¡El video se ha movido!",
										"audio": "¡El audio se ha movido!"
									},
									"remove": {
										"image": "¡La imagen ha sido eliminada de las categorías!",
										"video": "¡El video ha sido eliminado de las categorías!",
										"audio": "¡El audio ha sido eliminado de las categorías!"
									},
									"download": {
										"image": "¡La imagen ha sido cargada!",
										"video": "¡El video ha sido subido!",
										"audio": "¡El audio se ha descargado!"
									}
								},
								"error": {
									"download": {
										"image": "No se pudo cargar la imagen.",
										"video": "No se pudo descargar el video",
										"audio": "No se pudo descargar el audio"
									}
								},
								"controls": {
									"show": "Mostrar pedidos",
									"hide": "Ocultar pedidos"
								},
								"placeholder": {
									"image": "Nombre de la imágen",
									"video": "Nombre del video",
									"audio": "Nombre de audio"
								}
							},
							"searchItem": {
								"image": "Buscar imágenes o categorías",
								"video": "Buscar videos o categorías",
								"audio": "Busque audios o categorías"
							}
						};
					case "fi":		// Finnish
						return {
							"tabName": {
								"image": "Kuva",
								"video": "Video",
								"audio": "Audio"
							},
							"create": "Luoda",
							"category": {
								"unsorted": "Ei lajiteltu",
								"create": "Luo luokka",
								"edit": "Muokkaa kategoriaa",
								"delete": "Poista luokka",
								"download": "Lataa media",
								"placeholder": "Kategorian nimi",
								"move": "Liikkua",
								"moveNext": "Jälkeen",
								"movePrevious": "Ennen",
								"color": "Väri",
								"copyColor": "Kopioi väri",
								"copiedColor": "Väri kopioitu!",
								"error": {
									"needName": "Nimi ei voi olla tyhjä",
									"invalidNameLength": "Nimi saa sisältää enintään 20 merkkiä",
									"wrongColor": "Väri on virheellinen",
									"nameExists": "tämä nimi on jo olemassa",
									"invalidCategory": "Luokkaa ei ole olemassa",
									"download": "Median lataaminen epäonnistui"
								},
								"success": {
									"create": "Luokka on luotu!",
									"delete": "Luokka on poistettu!",
									"edit": "Luokkaa on muutettu!",
									"move": "Luokka on siirretty!",
									"download": "Media on ladattu!"
								},
								"emptyHint": "Napsauta hiiren kakkospainikkeella luodaksesi luokan!"
							},
							"media": {
								"emptyHint": {
									"image": "Napsauta kuvan kulmassa olevaa tähteä lisätäksesi sen suosikkeihisi",
									"video": "Napsauta videon kulmassa olevaa tähteä lisätäksesi sen suosikkeihisi",
									"audio": "Napsauta äänen kulmassa olevaa tähteä lisätäksesi sen suosikkeihisi"
								},
								"addTo": "Lisätä",
								"moveTo": "Liikkua",
								"removeFrom": "Poista luokasta",
								"upload": {
									"title": "Lähetä",
									"normal": "Normaali",
									"spoiler": "Spoileri"
								},
								"success": {
									"move": {
										"image": "Kuva on siirretty!",
										"video": "Video on siirretty!",
										"audio": "Ääni on siirretty!"
									},
									"remove": {
										"image": "Kuva on poistettu luokista!",
										"video": "Video on poistettu luokista!",
										"audio": "Ääni on poistettu luokista!"
									},
									"download": {
										"image": "Kuva on ladattu!",
										"video": "Video on ladattu!",
										"audio": "Ääni on ladattu!"
									}
								},
								"error": {
									"download": {
										"image": "Kuvan lataaminen epäonnistui",
										"video": "Videon lataaminen epäonnistui",
										"audio": "Äänen lataaminen epäonnistui"
									}
								},
								"controls": {
									"show": "Näytä tilaukset",
									"hide": "Piilota tilaukset"
								},
								"placeholder": {
									"image": "Kuvan nimi",
									"video": "Videon nimi",
									"audio": "Äänen nimi"
								}
							},
							"searchItem": {
								"image": "Hae kuvia tai luokkia",
								"video": "Hae videoita tai luokkia",
								"audio": "Hae ääniä tai luokkia"
							}
						};
					case "fr":		// French
						return {
							"tabName": {
								"image": "Image",
								"video": "Vidéo",
								"audio": "Audio",
							},
							"create": "Créer",
							"category": {
								"unsorted": "Non trié",
								"create": "Créer une catégorie",
								"edit": "Modifier la catégorie",
								"delete": "Supprimer la catégorie",
								"download": "Télécharger les médias",
								"placeholder": "Nom de la catégorie",
								"move": "Déplacer",
								"moveNext": "Après",
								"movePrevious": "Avant",
								"color": "Couleur",
								"copyColor": "Copier la couleur",
								"copiedColor": "Couleur copiée !",
								"error": {
									"needName": "Le nom ne peut être vide",
									"invalidNameLength": "Le nom doit contenir au maximum 20 caractères",
									"wrongColor": "La couleur est invalide",
									"nameExists": "Ce nom existe déjà",
									"invalidCategory": "La catégorie n'existe pas",
									"download": "Échec lors du téléchargement des médias"
								},
								"success": {
									"create": "La catégorie a été créée !",
									"delete": "La catégorie a été supprimée !",
									"edit": "La catégorie a été modifiée !",
									"move": "La catégorie a été déplacée !",
									"download": "Les médias ont été téléchargées !",
								},
								"emptyHint": "Fais un clique-droit pour créer une catégorie !",
							},
							"media": {
								"emptyHint": {
									"image": "Clique sur l'étoile dans le coin d'une image pour la mettre dans tes favoris",
									"video": "Clique sur l'étoile dans le coin d'une vidéo pour la mettre dans tes favoris",
									"audio": "Clique sur l'étoile dans le coin d'un audio pour le mettre dans tes favoris",
								},
								"addTo": "Ajouter",
								"moveTo": "Déplacer",
								"removeFrom": "Retirer de la catégorie",
								"upload": {
									"title": "Uploader",
									"normal": "Normal",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "L'image a été déplacée !",
										"video": "La vidéo a été déplacée !",
										"audio": "L'audio a été déplacé !",
									},
									"remove": {
										"image": "L'image a été enlevée des catégories !",
										"video": "La vidéo a été enlevée des catégories !",
										"audio": "L'audio a été enlevé des catégories !",
									},
									"download": {
										"image": "L'image a été téléchargée !",
										"video": "La vidéo a été téléchargée !",
										"audio": "L'audio a été téléchargée !",
									}
								},
								"error": {
									"download": {
										"image": "Échec lors du téléchargement de l'image",
										"video": "Échec lors du téléchargement de la vidéo",
										"audio": "Échec lors du téléchargement de l'audio",
									}
								},
								"controls": {
									"show": "Afficher les commandes",
									"hide": "Cacher les commandes",
								},
								"placeholder": {
									"image": "Nom de l'image",
									"video": "Nom de la vidéo",
									"audio": "Nom de l'audio",
								},
							},
							"searchItem": {
								"image": "Recherche des images ou des catégories",
								"video": "Recherche des vidéos ou des catégories",
								"audio": "Recherche des audios ou des catégories",
							}
						};
					case "hr":		// Croatian
						return {
							"tabName": {
								"image": "Slika",
								"video": "Video",
								"audio": "Audio"
							},
							"create": "Stvoriti",
							"category": {
								"unsorted": "Nije sortirano",
								"create": "Stvorite kategoriju",
								"edit": "Uredi kategoriju",
								"delete": "Izbriši kategoriju",
								"download": "Preuzmite medije",
								"placeholder": "Ime kategorije",
								"move": "Potez",
								"moveNext": "Nakon",
								"movePrevious": "Prije",
								"color": "Boja",
								"copyColor": "Kopiraj u boji",
								"copiedColor": "Kopirana boja!",
								"error": {
									"needName": "Ime ne može biti prazno",
									"invalidNameLength": "Ime mora sadržavati najviše 20 znakova",
									"wrongColor": "Boja je nevaljana",
									"nameExists": "ovo ime već postoji",
									"invalidCategory": "Kategorija ne postoji",
									"download": "Preuzimanje medija nije uspjelo"
								},
								"success": {
									"create": "Kategorija je stvorena!",
									"delete": "Kategorija je izbrisana!",
									"edit": "Izmijenjena je kategorija!",
									"move": "Kategorija je premještena!",
									"download": "Mediji su učitani!"
								},
								"emptyHint": "Desni klik za stvaranje kategorije!"
							},
							"media": {
								"emptyHint": {
									"image": "Kliknite zvjezdicu u kutu slike da biste je stavili među svoje favorite",
									"video": "Kliknite zvjezdicu u kutu videozapisa da biste je stavili među svoje favorite",
									"audio": "Kliknite zvjezdicu u kutu zvuka da biste je stavili među svoje favorite"
								},
								"addTo": "Dodati",
								"moveTo": "Potez",
								"removeFrom": "Ukloni iz kategorije",
								"upload": {
									"title": "Učitaj",
									"normal": "Normalan",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "Slika je premještena!",
										"video": "Video je premješten!",
										"audio": "Zvuk je premješten!"
									},
									"remove": {
										"image": "Slika je uklonjena iz kategorija!",
										"video": "Videozapis je uklonjen iz kategorija!",
										"audio": "Audio je uklonjen iz kategorija!"
									},
									"download": {
										"image": "Slika je učitana!",
										"video": "Video je postavljen!",
										"audio": "Zvuk je preuzet!"
									}
								},
								"error": {
									"download": {
										"image": "Učitavanje slike nije uspjelo",
										"video": "Preuzimanje videozapisa nije uspjelo",
										"audio": "Preuzimanje zvuka nije uspjelo"
									}
								},
								"controls": {
									"show": "Prikaži narudžbe",
									"hide": "Sakrij narudžbe"
								},
								"placeholder": {
									"image": "Naziv slike",
									"video": "Naziv videozapisa",
									"audio": "Naziv zvuka"
								}
							},
							"searchItem": {
								"image": "Potražite slike ili kategorije",
								"video": "Potražite videozapise ili kategorije",
								"audio": "Potražite audio ili kategorije"
							}
						};
					case "hu":		// Hungarian
						return {
							"tabName": {
								"image": "Kép",
								"video": "Videó",
								"audio": "Hang"
							},
							"create": "Teremt",
							"category": {
								"unsorted": "Nincs rendezve",
								"create": "Hozzon létre egy kategóriát",
								"edit": "Kategória szerkesztése",
								"delete": "Kategória törlése",
								"download": "Média letöltése",
								"placeholder": "Kategória név",
								"move": "Mozog",
								"moveNext": "Utána",
								"movePrevious": "Előtt",
								"color": "Szín",
								"copyColor": "Szín másolása",
								"copiedColor": "Szín másolva!",
								"error": {
									"needName": "A név nem lehet üres",
									"invalidNameLength": "A név legfeljebb 20 karakterből állhat",
									"wrongColor": "A szín érvénytelen",
									"nameExists": "Ez a név már létezik",
									"invalidCategory": "A kategória nem létezik",
									"download": "Nem sikerült letölteni a médiát"
								},
								"success": {
									"create": "A kategória elkészült!",
									"delete": "A kategória törölve lett!",
									"edit": "A kategória megváltozott!",
									"move": "A kategória áthelyezve!",
									"download": "A média feltöltve!"
								},
								"emptyHint": "Kattintson jobb gombbal a kategória létrehozásához!"
							},
							"media": {
								"emptyHint": {
									"image": "Kattintson a kép sarkában lévő csillagra, hogy a kedvencek közé helyezze",
									"video": "Kattintson a videó sarkában lévő csillagra, hogy a kedvencek közé tegye",
									"audio": "Kattintson a csillagra egy hang sarkában, hogy a kedvencek közé helyezze"
								},
								"addTo": "Hozzáadás",
								"moveTo": "Mozog",
								"removeFrom": "Törlés a kategóriából",
								"upload": {
									"title": "Feltöltés",
									"normal": "Normál",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "A kép áthelyezve!",
										"video": "A videó áthelyezve!",
										"audio": "A hang áthelyezve!"
									},
									"remove": {
										"image": "A képet eltávolítottuk a kategóriákból!",
										"video": "A videót eltávolítottuk a kategóriákból!",
										"audio": "A hangot eltávolítottuk a kategóriákból!"
									},
									"download": {
										"image": "A kép feltöltve!",
										"video": "A videó feltöltve!",
										"audio": "A hanganyag letöltve!"
									}
								},
								"error": {
									"download": {
										"image": "Nem sikerült feltölteni a képet",
										"video": "Nem sikerült letölteni a videót",
										"audio": "Nem sikerült letölteni a hangot"
									}
								},
								"controls": {
									"show": "Mutasson megrendeléseket",
									"hide": "Parancsok elrejtése"
								},
								"placeholder": {
									"image": "Kép neve",
									"video": "Videó neve",
									"audio": "Hang neve"
								}
							},
							"searchItem": {
								"image": "Képek vagy kategóriák keresése",
								"video": "Videók vagy kategóriák keresése",
								"audio": "Audió vagy kategória keresése"
							}
						};
					case "it":		// Italian
						return {
							"tabName": {
								"image": "Immagine",
								"video": "video",
								"audio": "Audio"
							},
							"create": "Creare",
							"category": {
								"unsorted": "Non ordinato",
								"create": "Crea una categoria",
								"edit": "Modifica categoria",
								"delete": "Elimina categoria",
								"download": "Scarica file multimediali",
								"placeholder": "Nome della categoria",
								"move": "Spostare",
								"moveNext": "Dopo",
								"movePrevious": "Prima",
								"color": "Colore",
								"copyColor": "Copia colore",
								"copiedColor": "Colore copiato!",
								"error": {
									"needName": "Il nome non può essere vuoto",
									"invalidNameLength": "Il nome deve contenere un massimo di 20 caratteri",
									"wrongColor": "Il colore non è valido",
									"nameExists": "Questo nome esiste già",
									"invalidCategory": "La categoria non esiste",
									"download": "Impossibile scaricare i media"
								},
								"success": {
									"create": "La categoria è stata creata!",
									"delete": "La categoria è stata eliminata!",
									"edit": "La categoria è stata cambiata!",
									"move": "La categoria è stata spostata!",
									"download": "Il supporto è stato caricato!"
								},
								"emptyHint": "Fare clic con il tasto destro per creare una categoria!"
							},
							"media": {
								"emptyHint": {
									"image": "Fai clic sulla stella nell'angolo di un'immagine per inserirla nei preferiti",
									"video": "Fai clic sulla stella nell'angolo di un video per inserirlo nei preferiti",
									"audio": "Fai clic sulla stella nell'angolo di un audio per inserirlo nei preferiti"
								},
								"addTo": "Inserisci",
								"moveTo": "Spostare",
								"removeFrom": "Rimuovi dalla categoria",
								"upload": {
									"title": "Caricare",
									"normal": "Normale",
									"spoiler": "spoiler"
								},
								"success": {
									"move": {
										"image": "L'immagine è stata spostata!",
										"video": "Il video è stato spostato!",
										"audio": "L'audio è stato spostato!"
									},
									"remove": {
										"image": "L'immagine è stata rimossa dalle categorie!",
										"video": "Il video è stato rimosso dalle categorie!",
										"audio": "L'audio è stato rimosso dalle categorie!"
									},
									"download": {
										"image": "L'immagine è stata caricata!",
										"video": "Il video è stato caricato!",
										"audio": "L'audio è stato scaricato!"
									}
								},
								"error": {
									"download": {
										"image": "Impossibile caricare l'immagine",
										"video": "Impossibile scaricare il video",
										"audio": "Impossibile scaricare l'audio"
									}
								},
								"controls": {
									"show": "Mostra ordini",
									"hide": "Nascondi ordini"
								},
								"placeholder": {
									"image": "Nome immagine",
									"video": "Nome del video",
									"audio": "Nome dell'audio"
								}
							},
							"searchItem": {
								"image": "Cerca immagini o categorie",
								"video": "Cerca video o categorie",
								"audio": "Cerca audio o categorie"
							}
						};
					case "ja":		// Japanese
						return {
							"tabName": {
								"image": "画像",
								"video": "ビデオ",
								"audio": "オーディオ"
							},
							"create": "作成する",
							"category": {
								"unsorted": "ソートされていません",
								"create": "カテゴリを作成する",
								"edit": "カテゴリを編集",
								"delete": "カテゴリを削除",
								"download": "メディアをダウンロード",
								"placeholder": "種別名",
								"move": "移動",
								"moveNext": "後",
								"movePrevious": "前",
								"color": "色",
								"copyColor": "コピーカラー",
								"copiedColor": "カラーコピー！",
								"error": {
									"needName": "名前を空にすることはできません",
									"invalidNameLength": "名前には最大20文字を含める必要があります",
									"wrongColor": "色が無効です",
									"nameExists": "この名前はすでに存在します",
									"invalidCategory": "カテゴリが存在しません",
									"download": "メディアのダウンロードに失敗しました"
								},
								"success": {
									"create": "カテゴリが作成されました！",
									"delete": "カテゴリが削除されました！",
									"edit": "カテゴリが変更されました！",
									"move": "カテゴリが移動しました！",
									"download": "メディアがアップしました！"
								},
								"emptyHint": "右クリックしてカテゴリを作成してください！"
							},
							"media": {
								"emptyHint": {
									"image": "画像の隅にある星をクリックして、お気に入りに追加します",
									"video": "動画の隅にある星をクリックして、お気に入りに追加します",
									"audio": "オーディオの隅にある星をクリックして、お気に入りに入れます"
								},
								"addTo": "追加",
								"moveTo": "移動",
								"removeFrom": "カテゴリから削除",
								"upload": {
									"title": "アップロード",
									"normal": "正常",
									"spoiler": "ネタバレ"
								},
								"success": {
									"move": {
										"image": "画像が移動しました！",
										"video": "ビデオが移動しました！",
										"audio": "音声が移動しました！"
									},
									"remove": {
										"image": "画像はカテゴリから削除されました！",
										"video": "動画はカテゴリから削除されました！",
										"audio": "オーディオはカテゴリから削除されました！"
									},
									"download": {
										"image": "画像をアップしました！",
										"video": "動画がアップしました！",
										"audio": "音声がダウンロードされました！"
									}
								},
								"error": {
									"download": {
										"image": "画像のアップロードに失敗しました",
										"video": "ビデオのダウンロードに失敗しました",
										"audio": "オーディオのダウンロードに失敗しました"
									}
								},
								"controls": {
									"show": "注文を表示",
									"hide": "注文を非表示"
								},
								"placeholder": {
									"image": "画像名",
									"video": "ビデオ名",
									"audio": "音声名"
								}
							},
							"searchItem": {
								"image": "画像やカテゴリを検索する",
								"video": "ビデオまたはカテゴリを検索する",
								"audio": "オーディオまたはカテゴリを検索する"
							}
						};
					case "ko":		// Korean
						return {
							"tabName": {
								"image": "그림",
								"video": "비디오",
								"audio": "오디오"
							},
							"create": "창조하다",
							"category": {
								"unsorted": "정렬되지 않음",
								"create": "카테고리 생성",
								"edit": "카테고리 수정",
								"delete": "카테고리 삭제",
								"download": "미디어 다운로드",
								"placeholder": "카테고리 이름",
								"move": "움직임",
								"moveNext": "후",
								"movePrevious": "전에",
								"color": "색깔",
								"copyColor": "색상 복사",
								"copiedColor": "색상이 복사되었습니다!",
								"error": {
									"needName": "이름은 비워 둘 수 없습니다.",
									"invalidNameLength": "이름은 최대 20 자 여야합니다.",
									"wrongColor": "색상이 잘못되었습니다.",
									"nameExists": "이 이름은 이미 존재합니다",
									"invalidCategory": "카테고리가 없습니다.",
									"download": "미디어 다운로드 실패"
								},
								"success": {
									"create": "카테고리가 생성되었습니다!",
									"delete": "카테고리가 삭제되었습니다!",
									"edit": "카테고리가 변경되었습니다!",
									"move": "카테고리가 이동되었습니다!",
									"download": "미디어가 업로드되었습니다!"
								},
								"emptyHint": "카테고리를 만들려면 마우스 오른쪽 버튼을 클릭하십시오!"
							},
							"media": {
								"emptyHint": {
									"image": "이미지 모서리에있는 별을 클릭하여 즐겨 찾기에 추가하세요.",
									"video": "동영상 모서리에있는 별표를 클릭하여 즐겨 찾기에 추가하세요.",
									"audio": "오디오 모서리에있는 별표를 클릭하여 즐겨 찾기에 넣습니다."
								},
								"addTo": "더하다",
								"moveTo": "움직임",
								"removeFrom": "카테고리에서 제거",
								"upload": {
									"title": "업로드",
									"normal": "표준",
									"spoiler": "스포일러"
								},
								"success": {
									"move": {
										"image": "이미지가 이동되었습니다!",
										"video": "동영상이 이동되었습니다!",
										"audio": "오디오가 이동되었습니다!"
									},
									"remove": {
										"image": "카테고리에서 이미지가 제거되었습니다!",
										"video": "비디오가 카테고리에서 제거되었습니다!",
										"audio": "카테고리에서 오디오가 제거되었습니다!"
									},
									"download": {
										"image": "이미지가 업로드되었습니다!",
										"video": "영상이 업로드 되었습니다!",
										"audio": "오디오가 다운로드되었습니다!"
									}
								},
								"error": {
									"download": {
										"image": "이미지를 업로드하지 못했습니다.",
										"video": "동영상 다운로드 실패",
										"audio": "오디오 다운로드 실패"
									}
								},
								"controls": {
									"show": "주문보기",
									"hide": "주문 숨기기"
								},
								"placeholder": {
									"image": "이미지 이름",
									"video": "비디오 이름",
									"audio": "오디오 이름"
								}
							},
							"searchItem": {
								"image": "이미지 또는 카테고리 검색",
								"video": "비디오 또는 카테고리 검색",
								"audio": "오디오 또는 카테고리 검색"
							}
						};
					case "lt":		// Lithuanian
						return {
							"tabName": {
								"image": "Paveikslėlis",
								"video": "Vaizdo įrašas",
								"audio": "Garso įrašas"
							},
							"create": "Kurti",
							"category": {
								"unsorted": "Nerūšiuota",
								"create": "Sukurkite kategoriją",
								"edit": "Redaguoti kategoriją",
								"delete": "Ištrinti kategoriją",
								"download": "Parsisiųsti mediją",
								"placeholder": "Kategorijos pavadinimas",
								"move": "Perkelti",
								"moveNext": "Po",
								"movePrevious": "Anksčiau",
								"color": "Spalva",
								"copyColor": "Kopijuoti spalvą",
								"copiedColor": "Spalva nukopijuota!",
								"error": {
									"needName": "Pavadinimas negali būti tuščias",
									"invalidNameLength": "Pavadinime gali būti ne daugiau kaip 20 simbolių",
									"wrongColor": "Spalva neteisinga",
									"nameExists": "šis vardas jau egzistuoja",
									"invalidCategory": "Kategorija neegzistuoja",
									"download": "Nepavyko atsisiųsti medijos"
								},
								"success": {
									"create": "Kategorija sukurta!",
									"delete": "Kategorija ištrinta!",
									"edit": "Kategorija pakeista!",
									"move": "Kategorija perkelta!",
									"download": "Žiniasklaida įkelta!"
								},
								"emptyHint": "Dešiniuoju pelės mygtuku spustelėkite norėdami sukurti kategoriją!"
							},
							"media": {
								"emptyHint": {
									"image": "Spustelėkite žvaigždutę atvaizdo kampe, kad ją įtrauktumėte į mėgstamiausius",
									"video": "Spustelėkite žvaigždutę vaizdo įrašo kampe, kad įtrauktumėte ją į mėgstamiausius",
									"audio": "Spustelėkite žvaigždutę garso kampe, kad įtrauktumėte ją į mėgstamiausius"
								},
								"addTo": "Papildyti",
								"moveTo": "Perkelti",
								"removeFrom": "Pašalinti iš kategorijos",
								"upload": {
									"title": "Įkelti",
									"normal": "Normalus",
									"spoiler": "Spoileris"
								},
								"success": {
									"move": {
										"image": "Vaizdas perkeltas!",
										"video": "Vaizdo įrašas perkeltas!",
										"audio": "Garso įrašas perkeltas!"
									},
									"remove": {
										"image": "Vaizdas pašalintas iš kategorijų!",
										"video": "Vaizdo įrašas pašalintas iš kategorijų!",
										"audio": "Garso įrašas pašalintas iš kategorijų!"
									},
									"download": {
										"image": "Vaizdas įkeltas!",
										"video": "Vaizdo įrašas įkeltas!",
										"audio": "Garso įrašas atsisiųstas!"
									}
								},
								"error": {
									"download": {
										"image": "Nepavyko įkelti vaizdo",
										"video": "Nepavyko atsisiųsti vaizdo įrašo",
										"audio": "Nepavyko atsisiųsti garso įrašo"
									}
								},
								"controls": {
									"show": "Rodyti užsakymus",
									"hide": "Slėpti užsakymus"
								},
								"placeholder": {
									"image": "Paveikslėlio pavadinimas",
									"video": "Vaizdo įrašo pavadinimas",
									"audio": "Garso įrašo pavadinimas"
								}
							},
							"searchItem": {
								"image": "Ieškokite vaizdų ar kategorijų",
								"video": "Ieškokite vaizdo įrašų ar kategorijų",
								"audio": "Ieškokite garso įrašų ar kategorijų"
							}
						};
					case "nl":		// Dutch
						return {
							"tabName": {
								"image": "Afbeelding",
								"video": "Video",
								"audio": "Audio"
							},
							"create": "scheppen",
							"category": {
								"unsorted": "Niet gesorteerd",
								"create": "Maak een categorie",
								"edit": "Categorie bewerken",
								"delete": "Categorie verwijderen",
								"download": "Media downloaden",
								"placeholder": "Categorie naam",
								"move": "Verplaatsen, verschuiven",
								"moveNext": "Na",
								"movePrevious": "Voordat",
								"color": "Kleur",
								"copyColor": "Kopieer kleur",
								"copiedColor": "Kleur gekopieerd!",
								"error": {
									"needName": "Naam mag niet leeg zijn",
									"invalidNameLength": "De naam mag maximaal 20 tekens bevatten",
									"wrongColor": "Kleur is ongeldig",
									"nameExists": "Deze naam bestaat al",
									"invalidCategory": "De categorie bestaat niet",
									"download": "Kan media niet downloaden"
								},
								"success": {
									"create": "De categorie is aangemaakt!",
									"delete": "De categorie is verwijderd!",
									"edit": "De categorie is gewijzigd!",
									"move": "De categorie is verplaatst!",
									"download": "De media is geüpload!"
								},
								"emptyHint": "Klik met de rechtermuisknop om een categorie aan te maken!"
							},
							"media": {
								"emptyHint": {
									"image": "Klik op de ster in de hoek van een afbeelding om deze in je favorieten te plaatsen",
									"video": "Klik op de ster in de hoek van een video om deze in je favorieten te plaatsen",
									"audio": "Klik op de ster in de hoek van een audio om deze in je favorieten te plaatsen"
								},
								"addTo": "Toevoegen",
								"moveTo": "Verplaatsen, verschuiven",
								"removeFrom": "Verwijderen uit categorie",
								"upload": {
									"title": "Uploaden",
									"normal": "normaal",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "De afbeelding is verplaatst!",
										"video": "De video is verplaatst!",
										"audio": "Het geluid is verplaatst!"
									},
									"remove": {
										"image": "De afbeelding is verwijderd uit de categorieën!",
										"video": "De video is verwijderd uit de categorieën!",
										"audio": "Audio is verwijderd uit categorieën!"
									},
									"download": {
										"image": "De afbeelding is geüpload!",
										"video": "De video is geüpload!",
										"audio": "De audio is gedownload!"
									}
								},
								"error": {
									"download": {
										"image": "Kan afbeelding niet uploaden",
										"video": "Kan video niet downloaden",
										"audio": "Kan audio niet downloaden"
									}
								},
								"controls": {
									"show": "Toon bestellingen",
									"hide": "Verberg bestellingen"
								},
								"placeholder": {
									"image": "Naam afbeelding",
									"video": "Videonaam",
									"audio": "Audionaam"
								}
							},
							"searchItem": {
								"image": "Zoeken naar afbeeldingen of categorieën",
								"video": "Zoeken naar video's of categorieën",
								"audio": "Zoeken naar audio of categorieën"
							}
						};
					case "no":		// Norwegian
						return {
							"tabName": {
								"image": "Bilde",
								"video": "Video",
								"audio": "Lyd"
							},
							"create": "Skape",
							"category": {
								"unsorted": "Ikke sortert",
								"create": "Opprett en kategori",
								"edit": "Rediger kategori",
								"delete": "Slett kategori",
								"download": "Last ned media",
								"placeholder": "Kategori navn",
								"move": "Bevege seg",
								"moveNext": "Etter",
								"movePrevious": "Før",
								"color": "Farge",
								"copyColor": "Kopier farge",
								"copiedColor": "Farge kopiert!",
								"error": {
									"needName": "Navnet kan ikke være tomt",
									"invalidNameLength": "Navnet må inneholde maksimalt 20 tegn",
									"wrongColor": "Fargen er ugyldig",
									"nameExists": "dette navnet eksisterer allerede",
									"invalidCategory": "Kategorien eksisterer ikke",
									"download": "Kunne ikke laste ned medier"
								},
								"success": {
									"create": "Kategorien er opprettet!",
									"delete": "Kategorien er slettet!",
									"edit": "Kategorien er endret!",
									"move": "Kategorien er flyttet!",
									"download": "Mediene er lastet opp!"
								},
								"emptyHint": "Høyreklikk for å opprette en kategori!"
							},
							"media": {
								"emptyHint": {
									"image": "Klikk på stjernen i hjørnet av et bilde for å sette det i favorittene dine",
									"video": "Klikk på stjernen i hjørnet av en video for å sette den i favorittene dine",
									"audio": "Klikk på stjernen i hjørnet av en lyd for å sette den i favorittene dine"
								},
								"addTo": "Legge til",
								"moveTo": "Bevege seg",
								"removeFrom": "Fjern fra kategori",
								"upload": {
									"title": "Laste opp",
									"normal": "Vanlig",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "Bildet er flyttet!",
										"video": "Videoen er flyttet!",
										"audio": "Lyden er flyttet!"
									},
									"remove": {
										"image": "Bildet er fjernet fra kategoriene!",
										"video": "Videoen er fjernet fra kategoriene!",
										"audio": "Lyd er fjernet fra kategorier!"
									},
									"download": {
										"image": "Bildet er lastet opp!",
										"video": "Videoen er lastet opp!",
										"audio": "Lyden er lastet ned!"
									}
								},
								"error": {
									"download": {
										"image": "Kunne ikke laste opp bildet",
										"video": "Kunne ikke laste ned video",
										"audio": "Kunne ikke laste ned lyd"
									}
								},
								"controls": {
									"show": "Vis ordrer",
									"hide": "Skjul ordrer"
								},
								"placeholder": {
									"image": "Bilde navn",
									"video": "Video navn",
									"audio": "Lydnavn"
								}
							},
							"searchItem": {
								"image": "Søk etter bilder eller kategorier",
								"video": "Søk etter videoer eller kategorier",
								"audio": "Søk etter lyd eller kategorier"
							}
						};
					case "pl":		// Polish
						return {
							"tabName": {
								"image": "Obrazek",
								"video": "Wideo",
								"audio": "Audio"
							},
							"create": "Stwórz",
							"category": {
								"unsorted": "Nie posortowane",
								"create": "Utwórz kategorię",
								"edit": "Edytuj kategorię",
								"delete": "Usuń kategorię",
								"download": "Pobierz multimedia",
								"placeholder": "Nazwa Kategorii",
								"move": "Ruszaj się",
								"moveNext": "Po",
								"movePrevious": "Przed",
								"color": "Kolor",
								"copyColor": "Kopiuj kolor",
								"copiedColor": "Kolor skopiowany!",
								"error": {
									"needName": "Nazwa nie może być pusta",
									"invalidNameLength": "Nazwa musi zawierać maksymalnie 20 znaków",
									"wrongColor": "Kolor jest nieprawidłowy",
									"nameExists": "ta nazwa już istnieje",
									"invalidCategory": "Kategoria nie istnieje",
									"download": "Nie udało się pobrać multimediów"
								},
								"success": {
									"create": "Kategoria została stworzona!",
									"delete": "Kategoria została usunięta!",
									"edit": "Kategoria została zmieniona!",
									"move": "Kategoria została przeniesiona!",
									"download": "Media zostały przesłane!"
								},
								"emptyHint": "Kliknij prawym przyciskiem myszy, aby utworzyć kategorię!"
							},
							"media": {
								"emptyHint": {
									"image": "Kliknij gwiazdkę w rogu obrazu, aby umieścić go w ulubionych",
									"video": "Kliknij gwiazdkę w rogu filmu, aby umieścić go w ulubionych",
									"audio": "Kliknij gwiazdkę w rogu nagrania, aby umieścić go w ulubionych your"
								},
								"addTo": "Dodaj",
								"moveTo": "Ruszaj się",
								"removeFrom": "Usuń z kategorii",
								"upload": {
									"title": "Przekazać plik",
									"normal": "Normalna",
									"spoiler": "Spojler"
								},
								"success": {
									"move": {
										"image": "Obraz został przeniesiony!",
										"video": "Film został przeniesiony!",
										"audio": "Dźwięk został przeniesiony!"
									},
									"remove": {
										"image": "Obraz został usunięty z kategorii!",
										"video": "Film został usunięty z kategorii!",
										"audio": "Dźwięk został usunięty z kategorii!"
									},
									"download": {
										"image": "Obraz został przesłany!",
										"video": "Film został przesłany!",
										"audio": "Dźwięk został pobrany!"
									}
								},
								"error": {
									"download": {
										"image": "Nie udało się przesłać obrazu",
										"video": "Nie udało się pobrać wideo",
										"audio": "Nie udało się pobrać dźwięku"
									}
								},
								"controls": {
									"show": "Pokaż zamówienia",
									"hide": "Ukryj zamówienia"
								},
								"placeholder": {
									"image": "Nazwa obrazu",
									"video": "Nazwa wideo",
									"audio": "Nazwa dźwięku"
								}
							},
							"searchItem": {
								"image": "Wyszukaj obrazy lub kategorie",
								"video": "Wyszukaj filmy lub kategorie",
								"audio": "Wyszukaj audio lub kategorie"
							}
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							"tabName": {
								"image": "Foto",
								"video": "Vídeo",
								"audio": "Áudio"
							},
							"create": "Crio",
							"category": {
								"unsorted": "Não classificado",
								"create": "Crie uma categoria",
								"edit": "Editar categoria",
								"delete": "Apagar categoria",
								"download": "Baixar mídia",
								"placeholder": "Nome da Categoria",
								"move": "Mover",
								"moveNext": "Após",
								"movePrevious": "Antes",
								"color": "Cor",
								"copyColor": "Cor da cópia",
								"copiedColor": "Cor copiada!",
								"error": {
									"needName": "O nome não pode estar vazio",
									"invalidNameLength": "O nome deve conter no máximo 20 caracteres",
									"wrongColor": "Cor é inválida",
									"nameExists": "Este nome já existe",
									"invalidCategory": "A categoria não existe",
									"download": "Falha ao baixar mídia"
								},
								"success": {
									"create": "A categoria foi criada!",
									"delete": "A categoria foi excluída!",
									"edit": "A categoria foi alterada!",
									"move": "A categoria foi movida!",
									"download": "A mídia foi carregada!"
								},
								"emptyHint": "Clique com o botão direito para criar uma categoria!"
							},
							"media": {
								"emptyHint": {
									"image": "Clique na estrela no canto de uma imagem para colocá-la em seus favoritos",
									"video": "Clique na estrela no canto de um vídeo para colocá-lo em seus favoritos",
									"audio": "Clique na estrela no canto de um áudio para colocá-lo em seus favoritos"
								},
								"addTo": "Adicionar",
								"moveTo": "Mover",
								"removeFrom": "Remover da categoria",
								"upload": {
									"title": "Envio",
									"normal": "Normal",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "A imagem foi movida!",
										"video": "O vídeo foi movido!",
										"audio": "O áudio foi movido!"
									},
									"remove": {
										"image": "A imagem foi removida das categorias!",
										"video": "O vídeo foi removido das categorias!",
										"audio": "O áudio foi removido das categorias!"
									},
									"download": {
										"image": "A imagem foi carregada!",
										"video": "O vídeo foi carregado!",
										"audio": "O áudio foi baixado!"
									}
								},
								"error": {
									"download": {
										"image": "Falha ao carregar imagem",
										"video": "Falha ao baixar o vídeo",
										"audio": "Falha ao baixar áudio"
									}
								},
								"controls": {
									"show": "Mostrar pedidos",
									"hide": "Ocultar pedidos"
								},
								"placeholder": {
									"image": "Nome da imagem",
									"video": "Nome do vídeo",
									"audio": "Nome de áudio"
								}
							},
							"searchItem": {
								"image": "Pesquise imagens ou categorias",
								"video": "Pesquise vídeos ou categorias",
								"audio": "Pesquise áudios ou categorias"
							}
						};
					case "ro":		// Romanian
						return {
							"tabName": {
								"image": "Imagine",
								"video": "Video",
								"audio": "Audio"
							},
							"create": "Crea",
							"category": {
								"unsorted": "Nu sunt sortate",
								"create": "Creați o categorie",
								"edit": "Editați categoria",
								"delete": "Ștergeți categoria",
								"download": "Descărcați conținut media",
								"placeholder": "Numele categoriei",
								"move": "Mișcare",
								"moveNext": "După",
								"movePrevious": "Inainte de",
								"color": "Culoare",
								"copyColor": "Copiați culoarea",
								"copiedColor": "Culoare copiată!",
								"error": {
									"needName": "Numele nu poate fi gol",
									"invalidNameLength": "Numele trebuie să conțină maximum 20 de caractere",
									"wrongColor": "Culoarea nu este validă",
									"nameExists": "Acest nume există deja",
									"invalidCategory": "Categoria nu există",
									"download": "Descărcarea conținutului media nu a reușit"
								},
								"success": {
									"create": "Categoria a fost creată!",
									"delete": "Categoria a fost ștearsă!",
									"edit": "Categoria a fost schimbată!",
									"move": "Categoria a fost mutată!",
									"download": "Media a fost încărcată!"
								},
								"emptyHint": "Faceți clic dreapta pentru a crea o categorie!"
							},
							"media": {
								"emptyHint": {
									"image": "Faceți clic pe steaua din colțul unei imagini pentru ao pune în preferatele dvs.",
									"video": "Faceți clic pe steaua din colțul unui videoclip pentru a-l introduce în preferatele dvs.",
									"audio": "Faceți clic pe steaua din colțul unui sunet pentru ao pune în preferatele dvs."
								},
								"addTo": "Adăuga",
								"moveTo": "Mișcare",
								"removeFrom": "Eliminați din categorie",
								"upload": {
									"title": "Încărcare",
									"normal": "Normal",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "Imaginea a fost mutată!",
										"video": "Videoclipul a fost mutat!",
										"audio": "Sunetul a fost mutat!"
									},
									"remove": {
										"image": "Imaginea a fost eliminată din categorii!",
										"video": "Videoclipul a fost eliminat din categorii!",
										"audio": "Sunetul a fost eliminat din categorii!"
									},
									"download": {
										"image": "Imaginea a fost încărcată!",
										"video": "Videoclipul a fost încărcat!",
										"audio": "Sunetul a fost descărcat!"
									}
								},
								"error": {
									"download": {
										"image": "Nu s-a încărcat imaginea",
										"video": "Descărcarea videoclipului nu a reușit",
										"audio": "Descărcarea audio nu a reușit"
									}
								},
								"controls": {
									"show": "Afișați comenzile",
									"hide": "Ascundeți comenzile"
								},
								"placeholder": {
									"image": "Numele imaginii",
									"video": "Numele videoclipului",
									"audio": "Numele audio"
								}
							},
							"searchItem": {
								"image": "Căutați imagini sau categorii",
								"video": "Căutați videoclipuri sau categorii",
								"audio": "Căutați audio sau categorii"
							}
						};
					case "ru":		// Russian
						return {
							"tabName": {
								"image": "Картина",
								"video": "видео",
								"audio": "Аудио"
							},
							"create": "Создавать",
							"category": {
								"unsorted": "Не отсортировано",
								"create": "Создать категорию",
								"edit": "Изменить категорию",
								"delete": "Удалить категорию",
								"download": "Скачать медиа",
								"placeholder": "Название категории",
								"move": "Двигаться",
								"moveNext": "После",
								"movePrevious": "Перед",
								"color": "Цвет",
								"copyColor": "Цвет копии",
								"copiedColor": "Цвет скопирован!",
								"error": {
									"needName": "Имя не может быть пустым",
									"invalidNameLength": "Имя должно содержать не более 20 символов.",
									"wrongColor": "Цвет недействителен",
									"nameExists": "Это имя уже существует",
									"invalidCategory": "Категория не существует",
									"download": "Не удалось скачать медиа"
								},
								"success": {
									"create": "Категория создана!",
									"delete": "Категория удалена!",
									"edit": "Категория изменена!",
									"move": "Категория перемещена!",
									"download": "Медиа загружена!"
								},
								"emptyHint": "Щелкните правой кнопкой мыши, чтобы создать категорию!"
							},
							"media": {
								"emptyHint": {
									"image": "Нажмите на звезду в углу изображения, чтобы добавить его в избранное.",
									"video": "Нажмите на звездочку в углу видео, чтобы добавить его в избранное.",
									"audio": "Нажмите на звездочку в углу аудио, чтобы добавить его в избранное."
								},
								"addTo": "Добавлять",
								"moveTo": "Двигаться",
								"removeFrom": "Удалить из категории",
								"upload": {
									"title": "Загрузить",
									"normal": "Обычный",
									"spoiler": "Спойлер"
								},
								"success": {
									"move": {
										"image": "Изображение было перемещено!",
										"video": "Видео перемещено!",
										"audio": "Звук был перемещен!"
									},
									"remove": {
										"image": "Изображение удалено из категорий!",
										"video": "Видео удалено из категорий!",
										"audio": "Аудио удалено из категорий!"
									},
									"download": {
										"image": "Изображение загружено!",
										"video": "Видео загружено!",
										"audio": "Аудио скачано!"
									}
								},
								"error": {
									"download": {
										"image": "Не удалось загрузить изображение",
										"video": "Не удалось скачать видео",
										"audio": "Не удалось скачать аудио"
									}
								},
								"controls": {
									"show": "Показать заказы",
									"hide": "Скрыть заказы"
								},
								"placeholder": {
									"image": "Имя изображения",
									"video": "Название видео",
									"audio": "Название аудио"
								}
							},
							"searchItem": {
								"image": "Поиск изображений или категорий",
								"video": "Поиск видео или категорий",
								"audio": "Поиск аудио или категорий"
							}
						};
					case "sv":		// Swedish
						return {
							"tabName": {
								"image": "Bild",
								"video": "Video",
								"audio": "Audio"
							},
							"create": "Skapa",
							"category": {
								"unsorted": "Inte sorterat",
								"create": "Skapa en kategori",
								"edit": "Redigera kategori",
								"delete": "Ta bort kategori",
								"download": "Ladda ner media",
								"placeholder": "Kategori namn",
								"move": "Flytta",
								"moveNext": "Efter",
								"movePrevious": "Innan",
								"color": "Färg",
								"copyColor": "Kopiera färg",
								"copiedColor": "Färg kopieras!",
								"error": {
									"needName": "Namnet kan inte vara tomt",
									"invalidNameLength": "Namnet måste innehålla högst 20 tecken",
									"wrongColor": "Färgen är ogiltig",
									"nameExists": "detta namn finns redan",
									"invalidCategory": "Kategorin finns inte",
									"download": "Det gick inte att ladda ner media"
								},
								"success": {
									"create": "Kategorin har skapats!",
									"delete": "Kategorin har tagits bort!",
									"edit": "Kategorin har ändrats!",
									"move": "Kategorin har flyttats!",
									"download": "Media har laddats upp!"
								},
								"emptyHint": "Högerklicka för att skapa en kategori!"
							},
							"media": {
								"emptyHint": {
									"image": "Klicka på stjärnan i hörnet av en bild för att lägga den till dina favoriter",
									"video": "Klicka på stjärnan i hörnet av en video för att lägga den till dina favoriter",
									"audio": "Klicka på stjärnan i hörnet av ett ljud för att placera den i dina favoriter"
								},
								"addTo": "Lägg till",
								"moveTo": "Flytta",
								"removeFrom": "Ta bort från kategori",
								"upload": {
									"title": "Ladda upp",
									"normal": "Vanligt",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "Bilden har flyttats!",
										"video": "Videon har flyttats!",
										"audio": "Ljudet har flyttats!"
									},
									"remove": {
										"image": "Bilden har tagits bort från kategorierna!",
										"video": "Videon har tagits bort från kategorierna!",
										"audio": "Ljud har tagits bort från kategorier!"
									},
									"download": {
										"image": "Bilden har laddats upp!",
										"video": "Videon har laddats upp!",
										"audio": "Ljudet har laddats ner!"
									}
								},
								"error": {
									"download": {
										"image": "Det gick inte att ladda upp bilden",
										"video": "Det gick inte att ladda ner videon",
										"audio": "Det gick inte att ladda ner ljudet"
									}
								},
								"controls": {
									"show": "Visa order",
									"hide": "Dölj beställningar"
								},
								"placeholder": {
									"image": "Bildnamn",
									"video": "Videonamn",
									"audio": "Ljudnamn"
								}
							},
							"searchItem": {
								"image": "Sök efter bilder eller kategorier",
								"video": "Sök efter videor eller kategorier",
								"audio": "Sök efter ljud eller kategorier"
							}
						};
					case "th":		// Thai
						return {
							"tabName": {
								"image": "ภาพ",
								"video": "วีดีโอ",
								"audio": "เครื่องเสียง"
							},
							"create": "สร้าง",
							"category": {
								"unsorted": "ไม่เรียง",
								"create": "สร้างหมวดหมู่",
								"edit": "แก้ไขหมวดหมู่",
								"delete": "ลบหมวดหมู่",
								"download": "ดาวน์โหลดสื่อ",
								"placeholder": "ชื่อหมวดหมู่",
								"move": "ย้าย",
								"moveNext": "หลังจาก",
								"movePrevious": "ก่อน",
								"color": "สี",
								"copyColor": "คัดลอกสี",
								"copiedColor": "คัดลอกสี!",
								"error": {
									"needName": "ชื่อไม่สามารถเว้นว่างได้",
									"invalidNameLength": "ชื่อต้องมีอักขระไม่เกิน 20 ตัว",
									"wrongColor": "สีไม่ถูกต้อง",
									"nameExists": "มีชื่อนี้แล้ว",
									"invalidCategory": "ไม่มีหมวดหมู่",
									"download": "ไม่สามารถดาวน์โหลดสื่อ"
								},
								"success": {
									"create": "หมวดหมู่ถูกสร้างขึ้น!",
									"delete": "หมวดหมู่ถูกลบ!",
									"edit": "หมวดหมู่มีการเปลี่ยนแปลง!",
									"move": "หมวดหมู่ถูกย้าย!",
									"download": "สื่อได้รับการอัปโหลด!"
								},
								"emptyHint": "คลิกขวาเพื่อสร้างหมวดหมู่!"
							},
							"media": {
								"emptyHint": {
									"image": "คลิกที่ดาวที่มุมของภาพเพื่อใส่ในรายการโปรดของคุณ",
									"video": "คลิกที่ดาวที่มุมของวิดีโอเพื่อใส่ในรายการโปรดของคุณ",
									"audio": "คลิกที่ดาวตรงมุมของเสียงเพื่อใส่ในรายการโปรดของคุณ"
								},
								"addTo": "เพิ่ม",
								"moveTo": "ย้าย",
								"removeFrom": "ลบออกจากหมวดหมู่",
								"upload": {
									"title": "ที่อัพโหลด",
									"normal": "ปกติ",
									"spoiler": "สปอยเลอร์"
								},
								"success": {
									"move": {
										"image": "ย้ายภาพแล้ว!",
										"video": "วีดีโอถูกย้าย!",
										"audio": "ย้ายเสียงแล้ว!"
									},
									"remove": {
										"image": "รูปภาพถูกลบออกจากหมวดหมู่!",
										"video": "วิดีโอถูกลบออกจากหมวดหมู่แล้ว!",
										"audio": "เสียงถูกลบออกจากหมวดหมู่!"
									},
									"download": {
										"image": "อัปโหลดรูปภาพแล้ว!",
										"video": "อัปโหลดวิดีโอแล้ว!",
										"audio": "ดาวน์โหลดไฟล์เสียงแล้ว!"
									}
								},
								"error": {
									"download": {
										"image": "ไม่สามารถอัปโหลดภาพ",
										"video": "ไม่สามารถดาวน์โหลดวิดีโอ",
										"audio": "ไม่สามารถดาวน์โหลดเสียง"
									}
								},
								"controls": {
									"show": "แสดงคำสั่งซื้อ",
									"hide": "ซ่อนคำสั่งซื้อ"
								},
								"placeholder": {
									"image": "ชื่อภาพ",
									"video": "ชื่อวิดีโอ",
									"audio": "ชื่อเสียง"
								}
							},
							"searchItem": {
								"image": "ค้นหารูปภาพหรือหมวดหมู่",
								"video": "ค้นหาวิดีโอหรือหมวดหมู่",
								"audio": "ค้นหาไฟล์เสียงหรือหมวดหมู่"
							}
						};
					case "tr":		// Turkish
						return {
							"tabName": {
								"image": "Resim",
								"video": "Video",
								"audio": "Ses"
							},
							"create": "Oluşturmak",
							"category": {
								"unsorted": "Sıralanmamış",
								"create": "Kategori oluştur",
								"edit": "Kategoriyi düzenle",
								"delete": "Kategoriyi sil",
								"download": "Medyayı indir",
								"placeholder": "Kategori adı",
								"move": "Hareket",
								"moveNext": "Sonra",
								"movePrevious": "Önce",
								"color": "Renk",
								"copyColor": "rengi kopyala",
								"copiedColor": "Renk kopyalandı!",
								"error": {
									"needName": "Ad boş olamaz",
									"invalidNameLength": "Ad en fazla 20 karakter içermelidir",
									"wrongColor": "Renk geçersiz",
									"nameExists": "bu isim zaten var",
									"invalidCategory": "Kategori mevcut değil",
									"download": "Medya indirilemedi"
								},
								"success": {
									"create": "Kategori oluşturuldu!",
									"delete": "Kategori silindi!",
									"edit": "Kategori değiştirildi!",
									"move": "Kategori taşındı!",
									"download": "Medya yüklendi!"
								},
								"emptyHint": "Kategori oluşturmak için sağ tıklayın!"
							},
							"media": {
								"emptyHint": {
									"image": "Favorilerinize eklemek için bir resmin köşesindeki yıldıza tıklayın",
									"video": "Favorilerinize eklemek için bir videonun köşesindeki yıldıza tıklayın",
									"audio": "Favorilerinize eklemek için bir sesin köşesindeki yıldıza tıklayın"
								},
								"addTo": "Ekle",
								"moveTo": "Hareket",
								"removeFrom": "Kategoriden kaldır",
								"upload": {
									"title": "Yükle",
									"normal": "Normal",
									"spoiler": "Bir şeyin önceden reklamı"
								},
								"success": {
									"move": {
										"image": "Resim taşındı!",
										"video": "Video taşındı!",
										"audio": "Ses taşındı!"
									},
									"remove": {
										"image": "Resim kategorilerden kaldırıldı!",
										"video": "Video kategorilerden kaldırıldı!",
										"audio": "Ses kategorilerden kaldırıldı!"
									},
									"download": {
										"image": "Resim yüklendi!",
										"video": "Video yüklendi!",
										"audio": "Ses indirildi!"
									}
								},
								"error": {
									"download": {
										"image": "Resim yüklenemedi",
										"video": "Video indirilemedi",
										"audio": "Ses indirilemedi"
									}
								},
								"controls": {
									"show": "Siparişleri göster",
									"hide": "Siparişleri gizle"
								},
								"placeholder": {
									"image": "Resim adı",
									"video": "video adı",
									"audio": "Ses adı"
								}
							},
							"searchItem": {
								"image": "Resim veya kategori arayın",
								"video": "Videoları veya kategorileri arayın",
								"audio": "Sesleri veya kategorileri arayın"
							}
						};
					case "uk":		// Ukrainian
						return {
							"tabName": {
								"image": "Картина",
								"video": "Відео",
								"audio": "Аудіо"
							},
							"create": "Створити",
							"category": {
								"unsorted": "Не сортується",
								"create": "Створіть категорію",
								"edit": "Редагувати категорію",
								"delete": "Видалити категорію",
								"download": "Завантажити медіафайли",
								"placeholder": "Назва категорії",
								"move": "Рухайся",
								"moveNext": "Після",
								"movePrevious": "Раніше",
								"color": "Колір",
								"copyColor": "Копіювати кольорові",
								"copiedColor": "Колір скопійовано!",
								"error": {
									"needName": "Ім'я не може бути порожнім",
									"invalidNameLength": "Назва повинна містити максимум 20 символів",
									"wrongColor": "Колір недійсний",
									"nameExists": "ця назва вже існує",
									"invalidCategory": "Категорія не існує",
									"download": "Не вдалося завантажити медіафайл"
								},
								"success": {
									"create": "Категорію створено!",
									"delete": "Категорію видалено!",
									"edit": "Категорію змінено!",
									"move": "Категорію переміщено!",
									"download": "ЗМІ завантажено!"
								},
								"emptyHint": "Клацніть правою кнопкою миші, щоб створити категорію!"
							},
							"media": {
								"emptyHint": {
									"image": "Клацніть на зірочку в кутку зображення, щоб помістити його у вибране",
									"video": "Клацніть на зірочку в кутку відео, щоб поставити його у вибране",
									"audio": "Клацніть на зірочку в кутку звукового супроводу, щоб помістити його у вибране"
								},
								"addTo": "Додати",
								"moveTo": "Рухайся",
								"removeFrom": "Вилучити з категорії",
								"upload": {
									"title": "Завантажити",
									"normal": "Звичайний",
									"spoiler": "Спойлер"
								},
								"success": {
									"move": {
										"image": "Зображення переміщено!",
										"video": "Відео переміщено!",
										"audio": "Аудіо переміщено!"
									},
									"remove": {
										"image": "Зображення видалено з категорій!",
										"video": "Відео видалено з категорій!",
										"audio": "Аудіо вилучено з категорій!"
									},
									"download": {
										"image": "Зображення завантажено!",
										"video": "Відео завантажено!",
										"audio": "Аудіо завантажено!"
									}
								},
								"error": {
									"download": {
										"image": "Не вдалося завантажити зображення",
										"video": "Не вдалося завантажити відео",
										"audio": "Не вдалося завантажити аудіо"
									}
								},
								"controls": {
									"show": "Показати замовлення",
									"hide": "Сховати замовлення"
								},
								"placeholder": {
									"image": "Назва зображення",
									"video": "Назва відео",
									"audio": "Назва аудіо"
								}
							},
							"searchItem": {
								"image": "Шукайте зображення або категорії",
								"video": "Шукайте відео або категорії",
								"audio": "Шукайте аудіо чи категорії"
							}
						};
					case "vi":		// Vietnamese
						return {
							"tabName": {
								"image": "Hình ảnh",
								"video": "Video",
								"audio": "Âm thanh"
							},
							"create": "Tạo nên",
							"category": {
								"unsorted": "Không được sắp xếp",
								"create": "Tạo một danh mục",
								"edit": "Chỉnh sửa danh mục",
								"delete": "Xóa danh mục",
								"download": "Завантажити медіафайли",
								"placeholder": "Tên danh mục",
								"move": "Di chuyển",
								"moveNext": "Sau",
								"movePrevious": "Trước",
								"color": "Màu sắc",
								"copyColor": "Sao chép màu",
								"copiedColor": "Đã sao chép màu!",
								"error": {
									"needName": "Tên không được để trống",
									"invalidNameLength": "Tên phải chứa tối đa 20 ký tự",
									"wrongColor": "Màu không hợp lệ",
									"nameExists": "tên này đã tồn tại",
									"invalidCategory": "Danh mục không tồn tại",
									"download": "Не вдалося завантажити медіафайл"
								},
								"success": {
									"create": "Chuyên mục đã được tạo!",
									"delete": "Danh mục đã bị xóa!",
									"edit": "Danh mục đã được thay đổi!",
									"move": "Danh mục đã được di chuyển!",
									"download": "ЗМІ завантажено!"
								},
								"emptyHint": "Nhấp chuột phải để tạo một danh mục!"
							},
							"media": {
								"emptyHint": {
									"image": "Nhấp vào ngôi sao ở góc của hình ảnh để đưa nó vào mục yêu thích của bạn",
									"video": "Nhấp vào ngôi sao ở góc video để đưa video đó vào mục yêu thích của bạn",
									"audio": "Nhấp vào ngôi sao ở góc của âm thanh để đưa nó vào mục yêu thích của bạn"
								},
								"addTo": "Thêm vào",
								"moveTo": "Di chuyển",
								"removeFrom": "Xóa khỏi danh mục",
								"upload": {
									"title": "Tải lên",
									"normal": "Bình thường",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "Hình ảnh đã được di chuyển!",
										"video": "Video đã được chuyển đi!",
										"audio": "Âm thanh đã được di chuyển!"
									},
									"remove": {
										"image": "Hình ảnh đã bị xóa khỏi danh mục!",
										"video": "Video đã bị xóa khỏi danh mục!",
										"audio": "Âm thanh đã bị xóa khỏi danh mục!"
									},
									"download": {
										"image": "Зображення завантажено!",
										"video": "Відео завантажено!",
										"audio": "Аудіо завантажено!"
									}
								},
								"error": {
									"download": {
										"image": "Не вдалося завантажити зображення",
										"video": "Не вдалося завантажити відео",
										"audio": "Не вдалося завантажити аудіо"
									}
								},
								"controls": {
									"show": "Hiển thị đơn đặt hàng",
									"hide": "Ẩn đơn đặt hàng"
								},
								"placeholder": {
									"image": "Tên Hình ảnh",
									"video": "Tên video",
									"audio": "Tên âm thanh"
								}
							},
							"searchItem": {
								"image": "Tìm kiếm hình ảnh hoặc danh mục",
								"video": "Tìm kiếm video hoặc danh mục",
								"audio": "Tìm kiếm âm thanh hoặc danh mục"
							}
						};
					case "zh-CN":	// Chinese (China)
						return {
							"tabName": {
								"image": "图片",
								"video": "视频",
								"audio": "声音的"
							},
							"create": "创造",
							"category": {
								"unsorted": "未排序",
								"create": "创建一个类别",
								"edit": "编辑类别",
								"delete": "删除类别",
								"download": "下载媒体",
								"placeholder": "分类名称",
								"move": "移动",
								"moveNext": "后",
								"movePrevious": "前",
								"color": "颜色",
								"copyColor": "复印颜色",
								"copiedColor": "颜色复制！",
								"error": {
									"needName": "名称不能为空",
									"invalidNameLength": "名称必须最多包含 20 个字符",
									"wrongColor": "颜色无效",
									"nameExists": "这个名字已经存在",
									"invalidCategory": "该类别不存在",
									"download": "无法下载媒体"
								},
								"success": {
									"create": "该类别已创建！",
									"delete": "该分类已被删除！",
									"edit": "类别已更改！",
									"move": "类别已移动！",
									"download": "媒体已上传！"
								},
								"emptyHint": "右键创建一个类别！"
							},
							"media": {
								"emptyHint": {
									"image": "单击图像角落的星星将其放入您的收藏夹",
									"video": "点击视频角落的星星，将其放入您的收藏夹",
									"audio": "单击音频一角的星星将其放入您的收藏夹"
								},
								"addTo": "添加",
								"moveTo": "移动",
								"removeFrom": "从类别中删除",
								"upload": {
									"title": "上传",
									"normal": "普通的",
									"spoiler": "剧透"
								},
								"success": {
									"move": {
										"image": "图片已移动！",
										"video": "视频已移！",
										"audio": "音频已移动！"
									},
									"remove": {
										"image": "该图片已从类别中删除！",
										"video": "该视频已从类别中删除！",
										"audio": "音频已从类别中删除！"
									},
									"download": {
										"image": "图片已上传！",
										"video": "视频已上传！",
										"audio": "音频已下载！"
									}
								},
								"error": {
									"download": {
										"image": "上传图片失败",
										"video": "下载视频失败",
										"audio": "无法下载音频"
									}
								},
								"controls": {
									"show": "显示订单",
									"hide": "隐藏订单"
								},
								"placeholder": {
									"image": "图片名称",
									"video": "视频名称",
									"audio": "音频名称"
								}
							},
							"searchItem": {
								"image": "搜索图像或类别",
								"video": "搜索视频或类别",
								"audio": "搜索音频或类别"
							}
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							"tabName": {
								"image": "圖片",
								"video": "影片",
								"audio": "音訊"
							},
							"create": "創建",
							"category": {
								"unsorted": "未排序",
								"create": "創建一個分類",
								"edit": "編輯分類",
								"delete": "刪除分類",
								"download": "下載媒體",
								"placeholder": "分類名稱",
								"move": "移動",
								"moveNext": "下一個",
								"movePrevious": "上一個",
								"color": "顏色",
								"copyColor": "複製顏色",
								"copiedColor": "顏色已複製！",
								"error": {
									"needName": "名稱不能為空",
									"invalidNameLength": "名稱需少於20個字符",
									"wrongColor": "無效的顏色",
									"nameExists": "這個名稱已經存在",
									"invalidCategory": "該分類不存在",
									"download": "無法下載媒體"
								},
								"success": {
									"create": "該分類已創建！",
									"delete": "該分類已刪除！",
									"edit": "分類已更改！",
									"move": "分類已移動！",
									"download": "媒體已上傳！"
								},
								"emptyHint": "右鍵創建一個新分類！"
							},
							"media": {
								"emptyHint": {
									"image": "點擊圖像角落的星星將其放入您的收藏夾",
									"video": "點擊影片角落的星星將其放入您的收藏夾",
									"audio": "單擊音訊角落的星星將其放入您的收藏夾"
								},
								"addTo": "添加",
								"moveTo": "移動",
								"removeFrom": "從分類中刪除",
								"upload": {
									"title": "上傳",
									"normal": "正常",
									"spoiler": "防雷"
								},
								"success": {
									"move": {
										"image": "圖片已移動！",
										"video": "影片已移動！",
										"audio": "音訊已移動！"
									},
									"remove": {
										"image": "該圖片已從分類中刪除！",
										"video": "該影片已從分類中刪除！",
										"audio": "該音訊已從分類中刪除！"
									},
									"download": {
										"image": "圖片已上傳！",
										"video": "視頻已上傳！",
										"audio": "音頻已下載！"
									}
								},
								"download": {
									"image": "上傳圖片失敗",
									"video": "下載視頻失敗",
									"audio": "無法下載音頻"
								},
								"controls": {
									"show": "顯示控制選單",
									"hide": "隱藏控制選單"
								},
								"placeholder": {
									"image": "圖片名稱",
									"video": "影片名稱",
									"audio": "音訊名稱"
								}
							},
							"searchItem": {
								"image": "搜索圖片或分類",
								"video": "搜索影片或分類",
								"audio": "搜索音訊或分類"
							}
						};
					default:		// English
						return {
							"tabName": {
								"image": "Image",
								"video": "Video",
								"audio": "Audio",
							},
							"create": "Create",
							"category": {
								"unsorted": "Unsorted",
								"create": "Create category",
								"edit": "Edit category",
								"delete": "Delete category",
								"download": "Download medias",
								"placeholder": "Category name",
								"move": "Move",
								"moveNext": "Next",
								"movePrevious": "Previous",
								"color": "Color",
								"copyColor": "Copy color",
								"copiedColor": "Copied color!",
								"error": {
									"needName": "Name cannot be empty",
									"invalidNameLength": "Name must contain less than 20 characters",
									"wrongColor": "Invalid color",
									"nameExists": "Name already exists",
									"invalidCategory": "Category not found",
									"download": "Error while downloading medias!",
								},
								"success": {
									"create": "Category created!",
									"delete": "Category deleted!",
									"edit": "Category edited!",
									"move": "Category moved!",
									"download": "Medias downloaded!",
								},
								"emptyHint": "Right-click to create a category!",
							},
							"media": {
								"emptyHint": {
									"image": "Click on the star in the corner of an image to bookmark it",
									"video": "Click on the star in the corner of a video to bookmark it",
									"audio": "Click on the star in the corner of an audio to bookmark it",
								},
								"addTo": "Add",
								"moveTo": "Move",
								"removeFrom": "Remove from category",
								"upload": {
									"title": "Upload",
									"normal": "Normal",
									"spoiler": "Spoiler"
								},
								"success": {
									"move": {
										"image": "Image moved!",
										"video": "Video moved!",
										"audio": "Audio moved!",
									},
									"remove": {
										"image": "Image removed from categories!",
										"video": "Video removed from categories!",
										"audio": "Audio removed from categories!",
									},
									"download": {
										"image": "Image downloaded!",
										"video": "Video downloaded!",
										"audio": "Audio downloaded!",
									}
								},
								"error": {
									"download": {
										"image": "Failed to download image",
										"video": "Failed to download video",
										"audio": "Failed to download audio",
									}
								},
								"controls": {
									"show": "Show controls",
									"hide": "Hide controls",
								},
								"placeholder": {
									"image": "Image name",
									"video": "Video name",
									"audio": "Audio name",
								},
							},
							"searchItem": {
								"image": "Search for images or categories",
								"video": "Search for videos or categories",
								"audio": "Search for audios or categories",
							},
						};
				}
			}
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();

function getUrlName(url) {
	return url.replace(/\.([^\.]*)$/gm, "").split("/").pop();
}

function getUrlExt(url) {
	return url.match(/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi)[0];
}

// https://stackoverflow.com/a/5306832/13314290
function array_move(arr, old_index, new_index) {
	while (old_index < 0) old_index += arr.length;
	while (new_index < 0) new_index += arr.length;
	if (new_index >= arr.length) {
		let k = new_index - arr.length + 1;
		while (k--) arr.push(undefined);
	}
	arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
};