import type { RequiredSource, VideoInfoJSON, HomePageJSON, VideoPlayJSON } from "./types.d.ts"

const PLATFORM = "bilibili" as const
const CONTENT_DETAILS_URL_PREFIX = "https://www.bilibili.com/video/" as const
const HOME_URL = "https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd" as const
const SPACE_URL_PREFIX = "https://space.bilibili.com/" as const
const USER_AGENT = "Grayjay" as const

type Settings = unknown

// global (to the file) variable to later access the configuration details of the plugin
// initialized when enabling the plugin
let config: SourceConfig

// Source Methods
const source_temp: RequiredSource = {
    enable(conf: SourceConfig, settings: Settings, savedState?: string) {
        config = conf
        // log(config)
        log(settings)
        log(savedState)
    },
    disable() {
        log("disabling")
    },
    saveState() { return "" },
    getHome() {
        const home = get_home_json()
        const platform_videos = home.data.item.map((item) => {
            const video_id = new PlatformID(PLATFORM, item.bvid, config.id)
            const author_id = new PlatformID(PLATFORM, item.owner.mid.toString(), config.id)
            return new PlatformVideo({
                id: video_id,
                name: item.title,
                url: item.uri,
                thumbnails: new Thumbnails([new Thumbnail(item.pic, 1080)]), // TODO hardcoded 1080
                author: new PlatformAuthorLink(author_id, item.owner.name, `${SPACE_URL_PREFIX}${item.owner.mid}`, item.owner.face, 69), // TODO hardcoded 69
                duration: item.duration,
                viewCount: item.stat.view,
                isLive: false, // TODO hardcoded false
                shareUrl: item.uri,
                uploadDate: item.pubdate
            })
        })
        return new VideoPager(platform_videos, false) // TODO hardcoded
    },
    isChannelUrl(url: string) {
        return url === "a string"
    },
    getChannel(url: string) {
        return new PlatformChannel({
            id: new PlatformID("Vimeo", "an id", config.id),
            name: "a string",
            thumbnail: "a string",
            banner: "a string",
            subscribers: 69,
            description: "a string",
            url: url,
        })
    },
    isContentDetailsUrl(url: string) {
        if (!url.startsWith(CONTENT_DETAILS_URL_PREFIX)) {
            return false
        }
        const content_id = url.slice(CONTENT_DETAILS_URL_PREFIX.length)
        // verify that the content_ID consists of 12 alphanumeric characters
        return /^[a-zA-Z0-9]{12}$/.test(content_id)
    },
    getContentDetails(url: string) {
        const video_ID = url.slice(CONTENT_DETAILS_URL_PREFIX.length)
        const [video_play_details, video_info] = get_video_details_json(url)

        const video_source_info = video_play_details.data.dash.video.find((entry) => {
            return entry.codecid === video_play_details.data.video_codecid
        })

        const audio_source_info = video_play_details.data.dash.audio[0] // TODO hardcoded

        if (video_source_info === undefined || audio_source_info === undefined) {
            throw new ScriptException("can't load content details")
        }
        const name = video_play_details.data.accept_description[video_play_details.data.accept_quality.findIndex((value) => {
            return value === video_source_info.id
        })]
        if (name === undefined) {
            throw new ScriptException("can't load content details")
        }

        const video_url_hostname = new URL(video_source_info.base_url).hostname
        const audio_url_hostname = new URL(audio_source_info.base_url).hostname

        const video_source = new VideoUrlSource({
            width: video_source_info.width,
            height: video_source_info.height,
            container: video_source_info.mime_type,
            codec: video_source_info.codecs,
            name: name,
            bitrate: video_source_info.bandwidth,
            duration: video_play_details.data.dash.duration,
            url: video_source_info.base_url,
            requestModifier: {
                headers: {
                    "Referer": "https://www.bilibili.com",
                    "Host": video_url_hostname,
                    "User-Agent": USER_AGENT
                }
            }
        })
        // For audio:
        const audio_source = new AudioUrlSource({
            container: audio_source_info.mime_type,
            codecs: audio_source_info.codecs,
            name: name,
            bitrate: audio_source_info.bandwidth,
            duration: video_play_details.data.dash.duration,
            url: audio_source_info.base_url,
            language: "Unknown",
            requestModifier: {
                headers: {
                    "Referer": "https://www.bilibili.com",
                    "Host": audio_url_hostname,
                    "User-Agent": USER_AGENT
                }
            }
        })

        const description = video_info.videoData.desc_v2[0]

        if (description === undefined){
            throw new ScriptException("missing description")
        }

        const owner_id = video_info.videoData.owner.mid.toString()

        const platform_video_ID = new PlatformID(PLATFORM, video_ID, config.id)
        const platform_creator_ID = new PlatformID(PLATFORM, owner_id, config.id)
        const details: PlatformContentDetails = new PlatformVideoDetails({
            id: platform_video_ID,
            name: video_info.videoData.title,
            thumbnails: new Thumbnails([new Thumbnail(video_info.videoData.pic, 1080)]), // TODO hardcoded 1080
            author: new PlatformAuthorLink(
                platform_creator_ID,
                video_info.videoData.owner.name,
                `${SPACE_URL_PREFIX}${video_info.videoData.owner.mid}`,
                video_info.videoData.owner.face,
                69 // TODO hardcoded
            ),
            duration: video_play_details.data.dash.duration,
            viewCount: video_info.videoData.stat.view,
            url: url,
            isLive: false, // hardcoded for now
            description: description.raw_text,
            video: new UnMuxVideoSourceDescriptor([video_source], [audio_source]),
            rating: new RatingLikes(video_info.videoData.stat.like),
            shareUrl: url,
            uploadDate: video_info.videoData.pubdate
        })
        return details
    },
}
// assign the methods to the source object
for (const key of Object.keys(source_temp)) {
    // @ts-expect-error TODO make it so that the ts-expect-error is no longer required
    source[key] = source_temp[key]
}

function get_video_details_json(url: string): [VideoPlayJSON, VideoInfoJSON]{
    const video_details_regex = /<script>window\.__playinfo__=(.*?)<\/script><script>window\.__INITIAL_STATE__=(.*?);.*?<\/script>/
    const main_video_html_body = http.GET(url, {}, false).body
    const parsed = main_video_html_body.match(video_details_regex)
    const video_play_json = parsed?.[1]
    if (video_play_json === undefined) {
        throw new ScriptException("missing video details")
    }
    const video_play: VideoPlayJSON = JSON.parse(video_play_json)

    const video_details_json = parsed?.[2]
    if (video_details_json === undefined) {
        throw new ScriptException("missing video details")
    }
    const video_info: VideoInfoJSON = JSON.parse(video_details_json)
    return [video_play, video_info]
}

function get_home_json(): HomePageJSON {
    const home_json = http.GET(HOME_URL, {}, false).body
    const home: HomePageJSON = JSON.parse(home_json)
    return home
}

// export statements removed during build step
export { get_video_details_json }
