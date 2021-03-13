/**
 * @name GifVideoPlayer
 * @authorId 310450863845933057
 * @source https://github.com/Dastan21/BDAddons/blob/main/plugins/FavoriteImageVideo
 */


class GifVideoPlayer {
    config = {
        info: {
            name: "GifVideoPlayer",
            author: "Dastan21",
            version: "1.0.0",
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
            video.classList.add("gifvideoplayer");
            let parent = video.parentNode;
            try {
                parent.querySelector(".da-metadata").style.display = "none";
            } catch (error) {}
            try {
                parent.querySelector(".da-playCenter").style.display = "none";
            } catch (error) {}
            video.addEventListener("mouseover", event => {
                video.autoplay = true;
                video.loop = true;
            });
            video.addEventListener("mouseout", event => {
                video.autoplay = false;
                video.loop = false;
            });
        });
    }
}