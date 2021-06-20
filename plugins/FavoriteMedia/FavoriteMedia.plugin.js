/**
 * @name FavoriteMediaV1
 * @authorId 310450863845933057
 * @source https://github.com/Dastan21/BDAddons/tree/main/plugins/FavoriteMediaV1
 */

const { PluginUpdater } = ZLibrary;

class FavoriteMediaV1 {

	config = {
		info: {
			name: "FavoriteMediaV1",
			author: "Dastan21",
			version: "1.5.0",
			description: "Adds media tabs, on the GIF/Emojis panel, to post favorited medias such as images, videos and audios."
		}
	};

	getName() { return this.config.info.name; }
	getAuthor() { return this.config.info.author; }
	getDescription() { return this.config.info.description; }
	getVersion() { return this.config.info.version; }

	start() {
		if (BdApi.loadData("FavoriteMedia", "image").medias === undefined) {
			BdApi.showConfirmationModal("FavoriteMedia has been completely redone!",
			[
				"This version of the plugin is outdated and deprecated! Please use the new plugin FavoriteMedia (ask Dastan#8746).",
				"But before updating, your medias lists have to be migrated, just click on 'Migrate' then you can replace the new plugin. This takes a few seconds..."
			],
			{
				danger: false,
				confirmText: "Migrate",
				cancelText: "Skip",
				onConfirm: () => this.migrate_medias()
			}
			);
		}
	}
	stop() {
	}
	load() {
	}
	async migrate_medias() {
		const images = await Promise.all(BdApi.loadData(this.getName(), "image").map(i => this.get_dimensions(i))).then(res => res.filter(res => res !== undefined)).catch(console.error);
		const videos = await Promise.all(BdApi.loadData(this.getName(), "video").map(v => this.get_dimensions(v.url, v.poster))).then(res => res.filter(res => res !== undefined)).catch(console.error);
		const audios = BdApi.loadData(this.getName(), "audio").map(a => ({ url: a, name: a.split('/').pop().split('.').shift(), ext: "." + a.split('.').pop() }));
		
		this.delete_data();

		this.save_date("image", images);
		this.save_date("video", videos);
		this.save_date("audio", audios);

		BdApi.alert("FavoriteMedia", "Medias migrated successfully!");
	}
	get_dimensions(url, poster) {
		return new Promise((resolve, _) => {
			const img = new Image();
	
			img.onload = () => {
				const res = {
					url: url,
					poster: poster,
					width: img.width,
					height: img.height,
					name: url.replace(/\.([^\.]*)$/gm, "").split("/").pop()
				};
				!poster ? delete res.poster : null;
				resolve(res);
			}

			img.onerror = () => resolve(undefined);
	
			img.src = poster || url;
		});
	}
	delete_data() {
		const data = ["image", "video", "audio", "enableButtons", "enableVideoAutoplayOnHover", "settings", "enableVideoAutoplayOnRightClick", "currentVersionInfo"];
		for (const d of data) {
			BdApi.deleteData(this.getName(), d);
		}
	}
	save_date(type, data) {
		BdApi.saveData(this.getName(), type, { medias: data });
	}
}