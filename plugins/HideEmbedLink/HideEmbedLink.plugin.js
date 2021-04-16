/**
 * @name HideEmbedLink
 * @description Removes links for embed messages
 * @author Dastan21
 * @authorId 310450863845933057
 * @authorLink https://github.com/Dastan21
 * @version 1.0.0
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/HideEmbedLink
 */


module.exports = class HideEmbedLink {
	start() {
		this.unpatch = BdApi.monkeyPatch(BdApi.findModule(m => m.type.displayName === "MessageContent"), 'type', {
			after: ({ methodArguments, returnValue }) => {
				if (!methodArguments[0].message.embeds.length) return;
				returnValue.props.children[0] = returnValue.props.children[0].filter(m => !(m.props && m.props.href));
			}
		}
		);
	}
	stop() { this.unpatch(); }
}