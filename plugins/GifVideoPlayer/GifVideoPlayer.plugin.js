/**
 * @name GifVideoPlayer
 * @authorId 310450863845933057
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/GifVideoPlayer
 */


class GifVideoPlayer {
    config = {
        info: {
            name: "GifVideoPlayer",
            author: "Dastan21",
            version: "1.1.0",
            description: "Changes the video player to be like gif (autoplay + loop)"
        }
    };

    getName() { return this.config.info.name; }
    getAuthor() { return this.config.info.author; }
    getDescription() { return this.config.info.description; }
    getVersion() { return this.config.info.version; }

    start() {}
    stop() {}
    load() {}
    observer(e) {
        let videos = document.querySelectorAll('video:not(.gifvideoplayer)');
        videos.forEach(video => {
			video.nextElementSibling.style.display = "none";
            video.classList.add("gifvideoplayer");
            video.parentNode.onmouseover = () => {
				video.loop = true;
                video.play();
            };
			video.parentNode.onmouseout = () => {
                video.loop = false;
				video.pause();
            };
        });
    }
}