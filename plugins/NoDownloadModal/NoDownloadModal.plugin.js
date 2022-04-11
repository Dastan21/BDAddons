/**
 * @name NoDownloadModal
 * @description Doesn't show the suspicious download modal.
 * @author Dastan
 * @authorId 310450863845933057
 * @authorLink https://github.com/Dastan21
 * @version 1.0.0
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/NoDownloadModal
 */

module.exports = class NoDownloadModal {
	load() {}
	start() {
		const SuspiciousDownload = BdApi.findAllModules(m => m?.isSuspiciousDownload).find(m => m?.__esModule)
		BdApi.Patcher.after("suspicious-download", SuspiciousDownload, "isSuspiciousDownload", () => null)
	}
	stop() {
		BdApi.Patcher.unpatchAll("suspicious-download")
	}
}