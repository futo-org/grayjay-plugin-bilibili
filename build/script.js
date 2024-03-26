const PLATFORM = "bilibili";
// global (to the file) variable to later access the configuration details of the plugin
// initialized when enabling the plugin
let config;
// Source Methods
const source_temp = {
    enable: function (conf, settings, savedState) {
        config = conf;
        // log(config)
        log(settings);
        log(savedState);
    },
    disable: function () {
        // console.log("disabling")
    },
    saveState: function () { return undefined; },
    isChannelUrl: function (url) {
        return false;
    },
    getChannel: function (url) {
        return new PlatformChannel({
            id: new PlatformID("Vimeo", "an id", config.id),
            name: "a string",
            thumbnail: "a string",
            banner: "a string",
            subscribers: 69,
            description: "a string",
            url: "a string",
        });
    },
    isContentDetailsUrl: function (url) {
        return false;
    },
    getContentDetails: function (url) {
        const platform_video_ID = new PlatformID(PLATFORM, "video_ID", config.id);
        const platform_creator_ID = new PlatformID(PLATFORM, "owner_ID", config.id);
        const details = new PlatformVideoDetails({
            id: platform_video_ID,
            name: "a string",
            //thumbnails: new Thumbnails(video_info.pictures.s,
            author: new PlatformAuthorLink(platform_creator_ID, "a string", "a string", "a string", 69),
            duration: 69,
            viewCount: 69,
            url: "a string",
            isLive: false, // hardcoded for now
            description: "a string",
            video: new VideoSourceDescriptor([new DashSource({
                    url: "a string"
                })]),
            rating: new RatingLikes(69),
            shareUrl: "a string",
            uploadDate: 69
        });
        return details;
    }
};
// assign the methods to the source object
for (const key of Object.keys(source_temp)) {
    // @ts-expect-error TODO make it so that the ts-expect-error is no longer required
    source[key] = source_temp[key];
}
function get_jwt() {
    const authentication_url = "https://vimeo.com/_next/viewer";
    const authentication_response_json = http.GET(authentication_url, new Map(), false).body;
    const authentication_response = JSON.parse(authentication_response_json);
    return authentication_response.jwt;
}
// export statements removed during build step
//# sourceMappingURL=script.js.map