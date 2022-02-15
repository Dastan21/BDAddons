/**
 * @name NoDownloadModal
 * @description Doesn't show the suspicious download modal.
 * @author Dastan
 * @authorId 310450863845933057
 * @authorLink https://github.com/Dastan21
 * @version 1.0.0
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/NoDownloadModal
 */

const NoDownloadModal = (() => {
	const config = {
		info: {
			name: "NoDownloadModal",
			authors: [{ name: "Dastan", github_username: "Dastan21", discord_id: "310450863845933057" }],
			description: "Doesn't show the suspicious download modal.",
			version: "1.0.0",
			github: "https://github.com/Dastan21/BDAddons/tree/main/plugins/NoDownloadModal",
			github_raw: "https://github.com/Dastan21/BDAddons/blob/main/plugins/NoDownloadModal/NoDownloadModal.plugin.js"
		}
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
			const { WebpackModules, PluginUpdater, Patcher } = Api;

			const Clickable = WebpackModules.getByDisplayName("Clickable");

			return class NoDownloadModal extends Plugin {

				onStart() {
					PluginUpdater.checkForUpdate(
						this.getName(),
						this.getVersion(),
						"https://raw.githubusercontent.com/Dastan21/BDAddons/main/plugins/NoDownloadModal/NoDownloadModal.plugin.js"
					);
					this.patchClickable();
				}
				onStop() {
					Patcher.unpatchAll();
				}

				async patchClickable() {
					Patcher.after(Clickable.prototype, "render", (_, [props], ret) => {
						if (ret.props.children.props.target === "_blank") ret.props.children.props.onClick = void 0
					});
				}
			};
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();