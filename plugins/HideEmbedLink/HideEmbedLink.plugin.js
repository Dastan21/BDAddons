/**
 * @name HideEmbedLink
 * @description Removes links for embed messages. Adds a button to force show links of a message.
 * @author Dastan
 * @authorId 310450863845933057
 * @authorLink https://github.com/Dastan21
 * @version 1.3.3
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/HideEmbedLink
 */

const fixList = [
	{
		start: 'https://youtu.be/',
		include: href => 'https://www.youtube.com/watch?v=' + String(href).split('/')?.pop()

	},
]

const ShowIcon = BdApi.React.createElement("path", { fill: "currentColor", d: "M113,37.66667c-75.33333,0 -103.58333,75.33333 -103.58333,75.33333c0,0 28.25,75.33333 103.58333,75.33333c75.33333,0 103.58333,-75.33333 103.58333,-75.33333c0,0 -28.25,-75.33333 -103.58333,-75.33333zM113,65.91667c25.99942,0 47.08333,21.08392 47.08333,47.08333c0,25.99942 -21.08392,47.08333 -47.08333,47.08333c-25.99942,0 -47.08333,-21.08392 -47.08333,-47.08333c0,-25.99942 21.08392,-47.08333 47.08333,-47.08333zM113,84.75c-15.60204,0 -28.25,12.64796 -28.25,28.25c0,15.60204 12.64796,28.25 28.25,28.25c15.60204,0 28.25,-12.64796 28.25,-28.25c0,-15.60204 -12.64796,-28.25 -28.25,-28.25z" });
const HideIcon = BdApi.React.createElement("path", { fill: "currentColor", d: "M37.57471,28.15804c-3.83186,0.00101 -7.28105,2.32361 -8.72295,5.87384c-1.4419,3.55022 -0.58897,7.62011 2.15703,10.29267l16.79183,16.79183c-18.19175,14.60996 -29.9888,32.52303 -35.82747,43.03711c-3.12633,5.63117 -3.02363,12.41043 0.03678,18.07927c10.87625,20.13283 42.14532,66.10058 100.99007,66.10058c19.54493,0 35.83986,-5.13463 49.36394,-12.65365l19.31152,19.31152c2.36186,2.46002 5.8691,3.45098 9.16909,2.5907c3.3,-0.86028 5.87708,-3.43736 6.73736,-6.73736c0.86028,-3.3 -0.13068,-6.80724 -2.5907,-9.16909l-150.66666,-150.66667c-1.77289,-1.82243 -4.20732,-2.8506 -6.74984,-2.85075zM113,37.66667c-11.413,0 -21.60375,1.88068 -30.91683,4.81869l24.11182,24.11182c2.23175,-0.32958 4.47909,-0.6805 6.80501,-0.6805c25.99942,0 47.08333,21.08392 47.08333,47.08333c0,2.32592 -0.35092,4.57326 -0.6805,6.80501l32.29623,32.29623c10.1135,-11.22467 17.51573,-22.61015 21.94157,-30.18115c3.3335,-5.68767 3.32011,-12.67425 0.16553,-18.4655c-11.00808,-20.27408 -42.2439,-65.78792 -100.80615,-65.78792zM73.77002,87.08577l13.77555,13.77556c-1.77707,3.67147 -2.79557,7.77466 -2.79557,12.13867c0,15.60342 12.64658,28.25 28.25,28.25c4.364,0 8.46719,-1.01851 12.13867,-2.79557l13.79395,13.79395c-9.356,6.20362 -21.03043,9.17606 -33.4733,7.24642c-19.75617,-3.06983 -35.88427,-19.19794 -38.9541,-38.9541c-1.92879,-12.43739 1.0665,-24.10096 7.26481,-33.45491z" });

const Icon = (args) => {
	const [show, setShow] = BdApi.React.useState(args[0].message.showLinks);
	return BdApi.React.createElement("div", {
		className: BdApi.findModuleByProps("wrapper", "button", "selected").button,
		onClick: () => {
			setShow(!show);
			args[0].message.showLinks = !args[0].message.showLinks;
			const links = document.querySelectorAll(`#chat-messages-${args[0].message.id} a.embedLink`);
			for (const link of links) {
				if (link.classList.contains("hideLink")) link.classList.remove("hideLink");
				else link.classList.add("hideLink");
			}
		},
	}, BdApi.React.createElement("svg", {
		className: BdApi.findModuleByProps("container", "isHeader", "icon").icon,
		width: "24",
		height: "24",
		viewBox: "0 0 226 226"
	}, show ? HideIcon : ShowIcon));
}

module.exports = class HideEmbedLink {
	start() {
		BdApi.injectCSS("HideEmbedLink", `
		:not(.${BdApi.findModuleByProps("repliedTextContent").repliedTextContent.split(' ')[0]}) > .hideLink {
			display: none;
		}
		`);
		this.unpatchMessageContent = BdApi.monkeyPatch(BdApi.findModule(m => m.type.displayName === "MessageContent"), 'type', {
			after: ({ methodArguments, returnValue }) => {
				if (!methodArguments[0].message.embeds.length) return;
				if (!methodArguments[0].content.length) return;
				returnValue.props.children[0].forEach(m => {
					if (m.props) m.props.className = this.hasEmbed(methodArguments[0].message.embeds, m) ? "embedLink" : "";
				});
				if (methodArguments[0].message.showLinks) return;
				methodArguments[0].message.showLinks = false;
				returnValue.props.children[0].forEach(m => {
					if (m.props && this.hasEmbed(methodArguments[0].message.embeds, m)) m.props.className += " hideLink";
				});
			}
		});
		this.unpatchContextMenu = BdApi.monkeyPatch(BdApi.findModuleByProps("useConnectedUtilitiesProps").default, 'type', {
			after: ({ returnValue }) => {
				const contextMenuIcon = returnValue && returnValue.props && returnValue.props.children && returnValue.props.children.props && returnValue.props.children.props.children[1];
				if (!contextMenuIcon) return;
				this.unpatchContextMenuIcon = BdApi.monkeyPatch(contextMenuIcon, 'type', {
					after: ({ methodArguments, returnValue }) => {
						if (methodArguments[0].message.showLinks === undefined) return;
						returnValue.props.children.unshift(Icon(methodArguments));
					}
				});
			}
		});
	}
	stop() {
		BdApi.clearCSS("HideEmbedLink");
		this.unpatchMessageContent();
		this.unpatchContextMenu();
		if (this.unpatchContextMenuIcon) this.unpatchContextMenuIcon();
	}
	hasEmbed(embeds, m) {
		const embedURLs = embeds.map(e => e.url);
		if (!m.props) return false;
		return m.type && (embedURLs.indexOf(m.props.href) > -1 || this.isValid(m.props.href, embedURLs));
	}
	isValid(href, urls = []) {
		if (!href || !urls?.length) return false
		return fixList.some(l => String(href).startsWith(l.start) && urls.indexOf(l.include(href)) > -1)
	}
}
