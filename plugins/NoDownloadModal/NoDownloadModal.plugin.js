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

	return class NoDownloadModal {
		constructor() { this._config = config; }
		getName() { return config.info.name }
		getAuthor() { return config.info.authors.map(a => a.name).join(", ") }
		getDescription() { return config.info.description }
		getVersion() { return config.info.version }
		load() { }
		start() {
			const SuspiciousDownload = BdApi.findAllModules(m => m?.isSuspiciousDownload).find(m => m?.__esModule)
			BdApi.Patcher.after("suspicious-download", SuspiciousDownload, "isSuspiciousDownload", () => null)
		}
		stop() {
			BdApi.Patcher.unpatchAll("suspicious-download")
		}
	}
})();