import type { LiveSearchResultsJSON, RequiredSource, VideoInfoJSON, HomePageJSON, VideoPlayJSON, Params, Wbi, SpaceInfoJSON, SearchResultsJSON, SpaceVideosJSON, PlaylistJSON, CommentsJSON, SubCommentsJSON, BiliBiliCommentContext, LivePlayJSON, SpaceSearchResults, SpaceVideos, SpacePostsJSON } from "./types.js"

const PLATFORM = "bilibili" as const
const CONTENT_DETAILS_URL_PREFIX = "https://www.bilibili.com/video/" as const
const LIVE_ROOM_URL_PREFIX = "https://live.bilibili.com/" as const
const HOME_URL = "https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd" as const
const SPACE_URL_PREFIX = "https://space.bilibili.com/" as const
const PLAYLIST_PREFIX = "https://space.bilibili.com/490505561/channel/collectiondetail?sid=" as const
const USER_AGENT = "Grayjay" as const
const REAL_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36" as const
const stats_url_prefix = "https://api.bilibili.com/x/relation/stat?vmid=" as const

type Settings = unknown

// global (to the file) variable to later access the configuration details of the plugin
// initialized when enabling the plugin
// let config: SourceConfig

// Source Methods
const source_temp: RequiredSource = {
    enable(conf: SourceConfig, settings: Settings, savedState?: string) {
        // config = conf
        // log(config)
        if (IS_TESTING) {
            log(conf)
            log(settings)
            log(savedState)
        }
    },
    disable() {
        log("disabling")
    },
    saveState() { return "" },
    getHome() {
        const home = get_home_json()
        const requests = http.batch()
        home.data.item.forEach((item) => {
            requests.GET(stats_url_prefix + item.owner.mid, {}, false)
        })
        const responses = requests.execute()

        const platform_videos = home.data.item.map((item, index) => {
            const response = responses[index]
            if (response === undefined) {
                throw new ScriptException("batching error")
            }
            const video_id = new PlatformID(PLATFORM, item.bvid, plugin.config.id)
            const author_id = new PlatformID(PLATFORM, item.owner.mid.toString(), plugin.config.id)
            return new PlatformVideo({
                id: video_id,
                name: item.title,
                url: item.uri,
                thumbnails: new Thumbnails([new Thumbnail(item.pic, 1080)]), // TODO hardcoded 1080
                author: new PlatformAuthorLink(author_id, item.owner.name, `${SPACE_URL_PREFIX}${item.owner.mid}`, item.owner.face, JSON.parse(response.body).data.follower),
                duration: item.duration,
                viewCount: item.stat.view,
                isLive: false, // TODO hardcoded false
                shareUrl: item.uri,
                uploadDate: item.pubdate
            })
        })
        return new VideoPager(platform_videos, false) // TODO hardcoded
    },
    searchSuggestions(query: string) {
        return [`empathy ${query}`, `${query} empathy`]
    },
    getSearchCapabilities() {
        return new ResultCapabilities([Type.Feed.Videos], [Type.Order.Chronological], [])
    },
    getSearchChannelContentsCapabilities() {
        return new ResultCapabilities([Type.Feed.Videos], [Type.Order.Chronological], [])
    },
    // TODO impliment channel posts
    searchChannelContents(channelUrl: string, query: string, type: FeedType, order: Order, filters: FilterCapability[]) {
        // log(channelUrl)
        log(type)
        log(order)
        log(filters)
        const space_id = parseInt(channelUrl.slice(SPACE_URL_PREFIX.length))
        const space_search_prefix = "https://api.bilibili.com/x/space/wbi/arc/search?"
        const params: Params = {
            // search_type: "bili_user",
            pn: 1,
            ps: 30,
            keyword: query,
            mid: space_id,
            // platform: "web",
            // token: "",
            // web_location: 1550101, // TODO hardcoded
            // current timestamp Math.round(Date.now() / 1e3)
            wts: Math.round(Date.now() / 1e3),
            // device fingerprint values
            dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
            dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
            dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
            dm_img_list: "[]",
        }
        const search_url = space_search_prefix + compute_parameters(params)
        const buvid3 = get_buvid3()
        const results_json = http.GET(search_url, { Cookie: `buvid3=${buvid3}` }, false).body
        // log(results_json)
        const results: SpaceVideos = JSON.parse(results_json)
        const videos = results.data.list.vlist.map((item) => {
            const url = `${CONTENT_DETAILS_URL_PREFIX}${item.bvid}`
            const video_id = new PlatformID(PLATFORM, item.bvid, plugin.config.id)
            const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id)
            // log(item.play)
            return new PlatformVideo({
                id: video_id,
                name: item.title,
                url: url,
                thumbnails: new Thumbnails([new Thumbnail(item.pic, 1080)]), // TODO hardcoded 1080
                author: new PlatformAuthorLink(author_id, "item.author", `${SPACE_URL_PREFIX}${space_id}`, item.pic, 11), // TODO hardcoded 11
                duration: parseInt(item.length), // TODO this doesn't work duration is like "2:54" not a number in seconds
                viewCount: item.play,
                isLive: false, // TODO hardcoded false
                shareUrl: url,
                uploadDate: item.created
            })
        })

        return new VideoPager(videos, false)
    },
    searchChannels(query: string) {
        const space_search_prefix = "https://api.bilibili.com/x/web-interface/wbi/search/type?"
        const params: Params = {
            search_type: "bili_user",
            page: 1,
            page_size: 36,
            keyword: query,
            // mid: space_id,
            // platform: "web",
            // token: "",
            // web_location: 1550101, // TODO hardcoded
            // current timestamp Math.round(Date.now() / 1e3)
            wts: Math.round(Date.now() / 1e3),
            // device fingerprint values
            dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
            dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
            dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
            dm_img_list: "[]",
        }
        const search_url = space_search_prefix + compute_parameters(params)
        const buvid3 = get_buvid3()
        const results_json = http.GET(search_url, { Cookie: `buvid3=${buvid3}` }, false).body
        // log(results_json)
        const results: SpaceSearchResults = JSON.parse(results_json)
        const channels = results.data.result.map((value) => {
            return new PlatformChannel({
                id: new PlatformID(PLATFORM, value.mid.toString(), plugin.config.id),
                name: value.uname,
                thumbnail: `https:${value.upic}`,
                subscribers: value.fans,
                description: value.usign,
                url: `${SPACE_URL_PREFIX}${value.mid}`
            })
        })
        return new ChannelPager(channels, false)
    },
    search(query: string, type: string, order: string, filters: FilterCapability[]) {
        log(type)
        log(order)
        log(filters)
        const video_results = get_video_search_results(query)
        const live_results = get_live_search_results(query)

        const videos = video_results.data.result.map((item) => {
            const url = `${CONTENT_DETAILS_URL_PREFIX}${item.bvid}`
            const video_id = new PlatformID(PLATFORM, item.bvid, plugin.config.id)
            const author_id = new PlatformID(PLATFORM, item.mid.toString(), plugin.config.id)
            // log(item.play)
            return new PlatformVideo({
                id: video_id,
                name: item.title,
                url: url,
                thumbnails: new Thumbnails([new Thumbnail(`https:${item.pic}`, 1080)]), // TODO hardcoded 1080
                author: new PlatformAuthorLink(author_id, item.author, `${SPACE_URL_PREFIX}${item.mid}`, item.upic, 11), // TODO hardcoded 11
                duration: parseInt(item.duration), // TODO this doesn't work duration is like "2:54" not a number in seconds
                viewCount: item.play,
                isLive: false, // TODO hardcoded false
                shareUrl: url,
                uploadDate: item.pubdate
            })
        })
        const live_videos = live_results.data.result.live_room.map((item) => {
            const url = `${LIVE_ROOM_URL_PREFIX}${item.roomid}`
            const video_id = new PlatformID(PLATFORM, item.roomid.toString(), plugin.config.id)
            const author_id = new PlatformID(PLATFORM, item.uid.toString(), plugin.config.id)
            // log(item.play)
            return new PlatformVideo({
                id: video_id,
                name: item.title,
                url: url,
                thumbnails: new Thumbnails([new Thumbnail(`https:${item.user_cover}`, 1080)]), // TODO hardcoded 1080
                author: new PlatformAuthorLink(author_id, item.uname, `${SPACE_URL_PREFIX}${item.uid}`, `https:${item.uface}`, 11), // TODO hardcoded 11
                duration: parseInt(item.live_time), // TODO this doesn't work duration is like "2:54" not a number in seconds
                viewCount: item.watched_show.num,
                isLive: true, // TODO hardcoded true
                shareUrl: url,
                uploadDate: parseInt(item.live_time) // todo fix this
            })
        })

        return new VideoPager(interleave(videos, live_videos), false)
    },
    isChannelUrl(url: string) {
        if (!url.startsWith(SPACE_URL_PREFIX)) {
            return false
        }
        const space_id = url.slice(SPACE_URL_PREFIX.length)
        // verify that the space_id consists only of digits
        if (!/^\d+$/.test(space_id)) {
            return false
        }
        return true
    },
    getChannel(url: string) {
        // log(url)
        const space_id = parseInt(url.slice(SPACE_URL_PREFIX.length))
        const num_fans = get_fan_count(space_id)
        //vmid=24562205
        const info_url_prefix = "https://api.bilibili.com/x/space/wbi/acc/info?"
        const params: Params = {
            mid: space_id,
            // platform: "web",
            // token: "",
            // web_location: 1550101, // TODO hardcoded
            // current timestamp Math.round(Date.now() / 1e3)
            wts: Math.round(Date.now() / 1e3),
            // device fingerprint values
            dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
            dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
            dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
            dm_img_list: "[]",
        }
        const info_url = info_url_prefix + compute_parameters(params)
        const buvid3 = get_buvid3()
        const space_json = http.GET(info_url, { Referer: "https://www.bilibili.com", Host: "api.bilibili.com", "User-Agent": REAL_USER_AGENT, Cookie: `buvid3=${buvid3}` }, false).body
        // log(space_json)
        // log(buvid3)
        // log(info_url)
        const space: SpaceInfoJSON = JSON.parse(space_json)

        // log(space)

        return new PlatformChannel({
            id: new PlatformID(PLATFORM, space_id.toString(), plugin.config.id),
            name: space.data.name,
            thumbnail: space.data.face,
            banner: space.data.top_photo,
            subscribers: num_fans,
            description: space.data.sign,
            url: `${SPACE_URL_PREFIX}${space_id}`,
        })
    },
    // TODO load playlists 
    getChannelContents(url: string, type: FeedType, order: Order, filters: FilterCapability[]) {
        log(type)
        log(order)
        log(filters)
        let buvid3 = get_buvid3()
        const space_id = parseInt(url.slice(SPACE_URL_PREFIX.length))
        const results = load_channel_videos(space_id, buvid3)

        const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id)
        const author = new PlatformAuthorLink(author_id, "a name", `${SPACE_URL_PREFIX}${space_id}`, "https://i1.hdslb.com/bfs/face/ba4811ffcdae8a901b9e313043bc88c8667b9d79.jpg@240w_240h_1c_1s_!web-avatar-space-header.avif", 69) // TODO hardcoded 69 and image url

        const videos = results.data.list.vlist.map((item) => {
            const url = `${CONTENT_DETAILS_URL_PREFIX}${item.bvid}`
            const video_id = new PlatformID(PLATFORM, item.bvid, plugin.config.id)

            // log(item.play)
            return new PlatformVideo({
                id: video_id,
                name: item.title,
                url: url,
                thumbnails: new Thumbnails([new Thumbnail(item.pic, 1080)]), // TODO hardcoded 1080
                author: author,
                duration: parseInt(item.length), // TODO this doesn't work duration is like "2:54" not a number in seconds
                viewCount: item.play,
                isLive: false, // TODO hardcoded false
                shareUrl: url,
                uploadDate: 420 // TODO hardcoded 420
            })
        })

        buvid3 = get_buvid3()

        const cookie_activation_url = "https://api.bilibili.com/x/internal/gaia-gateway/ExClimbWuzhi"
        //const body = `{"{"payload":"{"5062":1712258314864,"39c8":"333.999.fp.risk","920b":"0","df35":"8D8CB6D2-AF0C-53DF-A3FE-611AE8DCFBFC12914infoc","03bf":"https://space.bilibili.com/438074196/dynamic","3c43":{"2673":0,"5766":24,"6527":0,"7003":1,"807e":1,\"b8ce\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36\",\"641c\":0,\"07a4\":\"en-US\",\"1c57\":8,\"0bd0\":8,\"748e\":[2560,1440],\"d61f\":[2560,1386],\"fc9d\":300,\"6aa9\":\"America/Chicago\",\"75b8\":1,\"3b21\":1,\"8a1c\":0,\"d52f\":\"not available\",\"adca\":\"Linux x86_64\",\"80c9\":[[\"PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"Chrome PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"Chromium PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"Microsoft Edge PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"WebKit built-in PDF\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]]],\"13ab\":\"1eiwAAAAAElFTkSuQmCC\",\"bfe9\":\"QDFMhGAYCVjdUkigL2Ffg/2CYKtfwp4HgAAAAASUVORK5CYII=\",\"a3c1\":[\"extensions:ANGLE_instanced_arrays;EXT_blend_minmax;EXT_clip_control;EXT_color_buffer_half_float;EXT_depth_clamp;EXT_disjoint_timer_query;EXT_float_blend;EXT_frag_depth;EXT_polygon_offset_clamp;EXT_shader_texture_lod;EXT_texture_compression_bptc;EXT_texture_compression_rgtc;EXT_texture_filter_anisotropic;EXT_sRGB;KHR_parallel_shader_compile;OES_element_index_uint;OES_fbo_render_mipmap;OES_standard_derivatives;OES_texture_float;OES_texture_float_linear;OES_texture_half_float;OES_texture_half_float_linear;OES_vertex_array_object;WEBGL_blend_func_extended;WEBGL_color_buffer_float;WEBGL_compressed_texture_s3tc;WEBGL_compressed_texture_s3tc_srgb;WEBGL_debug_renderer_info;WEBGL_debug_shaders;WEBGL_depth_texture;WEBGL_draw_buffers;WEBGL_lose_context;WEBGL_multi_draw;WEBGL_polygon_mode\",\"webgl aliased line width range:[1, 2048]\",\"webgl aliased point size range:[1, 2048]\",\"webgl alpha bits:8\",\"webgl antialiasing:yes\",\"webgl blue bits:8\",\"webgl depth bits:24\",\"webgl green bits:8\",\"webgl max anisotropy:16\",\"webgl max combined texture image units:64\",\"webgl max cube map texture size:16384\",\"webgl max fragment uniform vectors:1024\",\"webgl max render buffer size:16384\",\"webgl max texture image units:32\",\"webgl max texture size:16384\",\"webgl max varying vectors:32\",\"webgl max vertex attribs:16\",\"webgl max vertex texture image units:32\",\"webgl max vertex uniform vectors:1024\",\"webgl max viewport dims:[16384, 16384]\",\"webgl red bits:8\",\"webgl renderer:WebKit WebGL\",\"webgl shading language version:WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)\",\"webgl stencil bits:0\",\"webgl vendor:WebKit\",\"webgl version:WebGL 1.0 (OpenGL ES 2.0 Chromium)\",\"webgl unmasked vendor:Google Inc. (AMD)\",\"webgl unmasked renderer:ANGLE (AMD, AMD Custom GPU 0405 (radeonsi vangogh LLVM 15.0.7), OpenGL 4.6)\",\"webgl vertex shader high float precision:23\",\"webgl vertex shader high float precision rangeMin:127\",\"webgl vertex shader high float precision rangeMax:127\",\"webgl vertex shader medium float precision:23\",\"webgl vertex shader medium float precision rangeMin:127\",\"webgl vertex shader medium float precision rangeMax:127\",\"webgl vertex shader low float precision:23\",\"webgl vertex shader low float precision rangeMin:127\",\"webgl vertex shader low float precision rangeMax:127\",\"webgl fragment shader high float precision:23\",\"webgl fragment shader high float precision rangeMin:127\",\"webgl fragment shader high float precision rangeMax:127\",\"webgl fragment shader medium float precision:23\",\"webgl fragment shader medium float precision rangeMin:127\",\"webgl fragment shader medium float precision rangeMax:127\",\"webgl fragment shader low float precision:23\",\"webgl fragment shader low float precision rangeMin:127\",\"webgl fragment shader low float precision rangeMax:127\",\"webgl vertex shader high int precision:0\",\"webgl vertex shader high int precision rangeMin:31\",\"webgl vertex shader high int precision rangeMax:30\",\"webgl vertex shader medium int precision:0\",\"webgl vertex shader medium int precision rangeMin:31\",\"webgl vertex shader medium int precision rangeMax:30\",\"webgl vertex shader low int precision:0\",\"webgl vertex shader low int precision rangeMin:31\",\"webgl vertex shader low int precision rangeMax:30\",\"webgl fragment shader high int precision:0\",\"webgl fragment shader high int precision rangeMin:31\",\"webgl fragment shader high int precision rangeMax:30\",\"webgl fragment shader medium int precision:0\",\"webgl fragment shader medium int precision rangeMin:31\",\"webgl fragment shader medium int precision rangeMax:30\",\"webgl fragment shader low int precision:0\",\"webgl fragment shader low int precision rangeMin:31\",\"webgl fragment shader low int precision rangeMax:30\"],\"6bc5\":\"Google Inc. (AMD)~ANGLE (AMD, AMD Custom GPU 0405 (radeonsi vangogh LLVM 15.0.7), OpenGL 4.6)\",\"ed31\":0,\"72bd\":1,\"097b\":0,\"52cd\":[10,0,0],\"a658\":[\"Arial\",\"Calibri\",\"Cambria\",\"Courier\",\"Courier New\",\"Helvetica\",\"Times\",\"Times New Roman\"],\"d02f\":\"124.04347527516074\"}}"}`
        //const body = JSON.stringify({"payload": "{\"5062\":1712258314864,\"39c8\":\"333.999.fp.risk\",\"920b\":\"0\",\"df35\":\"8D8CB6D2-AF0C-53DF-A3FE-611AE8DCFBFC12914infoc\",\"03bf\":\"https://space.bilibili.com/438074196/dynamic\",\"3c43\":{\"2673\":0,\"5766\":24,\"6527\":0,\"7003\":1,\"807e\":1,\"b8ce\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36\",\"641c\":0,\"07a4\":\"en-US\",\"1c57\":8,\"0bd0\":8,\"748e\":[2560,1440],\"d61f\":[2560,1386],\"fc9d\":300,\"6aa9\":\"America/Chicago\",\"75b8\":1,\"3b21\":1,\"8a1c\":0,\"d52f\":\"not available\",\"adca\":\"Linux x86_64\",\"80c9\":[[\"PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"Chrome PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"Chromium PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"Microsoft Edge PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"WebKit built-in PDF\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]]],\"13ab\":\"1eiwAAAAAElFTkSuQmCC\",\"bfe9\":\"QDFMhGAYCVjdUkigL2Ffg/2CYKtfwp4HgAAAAASUVORK5CYII=\",\"a3c1\":[\"extensions:ANGLE_instanced_arrays;EXT_blend_minmax;EXT_clip_control;EXT_color_buffer_half_float;EXT_depth_clamp;EXT_disjoint_timer_query;EXT_float_blend;EXT_frag_depth;EXT_polygon_offset_clamp;EXT_shader_texture_lod;EXT_texture_compression_bptc;EXT_texture_compression_rgtc;EXT_texture_filter_anisotropic;EXT_sRGB;KHR_parallel_shader_compile;OES_element_index_uint;OES_fbo_render_mipmap;OES_standard_derivatives;OES_texture_float;OES_texture_float_linear;OES_texture_half_float;OES_texture_half_float_linear;OES_vertex_array_object;WEBGL_blend_func_extended;WEBGL_color_buffer_float;WEBGL_compressed_texture_s3tc;WEBGL_compressed_texture_s3tc_srgb;WEBGL_debug_renderer_info;WEBGL_debug_shaders;WEBGL_depth_texture;WEBGL_draw_buffers;WEBGL_lose_context;WEBGL_multi_draw;WEBGL_polygon_mode\",\"webgl aliased line width range:[1, 2048]\",\"webgl aliased point size range:[1, 2048]\",\"webgl alpha bits:8\",\"webgl antialiasing:yes\",\"webgl blue bits:8\",\"webgl depth bits:24\",\"webgl green bits:8\",\"webgl max anisotropy:16\",\"webgl max combined texture image units:64\",\"webgl max cube map texture size:16384\",\"webgl max fragment uniform vectors:1024\",\"webgl max render buffer size:16384\",\"webgl max texture image units:32\",\"webgl max texture size:16384\",\"webgl max varying vectors:32\",\"webgl max vertex attribs:16\",\"webgl max vertex texture image units:32\",\"webgl max vertex uniform vectors:1024\",\"webgl max viewport dims:[16384, 16384]\",\"webgl red bits:8\",\"webgl renderer:WebKit WebGL\",\"webgl shading language version:WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)\",\"webgl stencil bits:0\",\"webgl vendor:WebKit\",\"webgl version:WebGL 1.0 (OpenGL ES 2.0 Chromium)\",\"webgl unmasked vendor:Google Inc. (AMD)\",\"webgl unmasked renderer:ANGLE (AMD, AMD Custom GPU 0405 (radeonsi vangogh LLVM 15.0.7), OpenGL 4.6)\",\"webgl vertex shader high float precision:23\",\"webgl vertex shader high float precision rangeMin:127\",\"webgl vertex shader high float precision rangeMax:127\",\"webgl vertex shader medium float precision:23\",\"webgl vertex shader medium float precision rangeMin:127\",\"webgl vertex shader medium float precision rangeMax:127\",\"webgl vertex shader low float precision:23\",\"webgl vertex shader low float precision rangeMin:127\",\"webgl vertex shader low float precision rangeMax:127\",\"webgl fragment shader high float precision:23\",\"webgl fragment shader high float precision rangeMin:127\",\"webgl fragment shader high float precision rangeMax:127\",\"webgl fragment shader medium float precision:23\",\"webgl fragment shader medium float precision rangeMin:127\",\"webgl fragment shader medium float precision rangeMax:127\",\"webgl fragment shader low float precision:23\",\"webgl fragment shader low float precision rangeMin:127\",\"webgl fragment shader low float precision rangeMax:127\",\"webgl vertex shader high int precision:0\",\"webgl vertex shader high int precision rangeMin:31\",\"webgl vertex shader high int precision rangeMax:30\",\"webgl vertex shader medium int precision:0\",\"webgl vertex shader medium int precision rangeMin:31\",\"webgl vertex shader medium int precision rangeMax:30\",\"webgl vertex shader low int precision:0\",\"webgl vertex shader low int precision rangeMin:31\",\"webgl vertex shader low int precision rangeMax:30\",\"webgl fragment shader high int precision:0\",\"webgl fragment shader high int precision rangeMin:31\",\"webgl fragment shader high int precision rangeMax:30\",\"webgl fragment shader medium int precision:0\",\"webgl fragment shader medium int precision rangeMin:31\",\"webgl fragment shader medium int precision rangeMax:30\",\"webgl fragment shader low int precision:0\",\"webgl fragment shader low int precision rangeMin:31\",\"webgl fragment shader low int precision rangeMax:30\"],\"6bc5\":\"Google Inc. (AMD)~ANGLE (AMD, AMD Custom GPU 0405 (radeonsi vangogh LLVM 15.0.7), OpenGL 4.6)\",\"ed31\":0,\"72bd\":1,\"097b\":0,\"52cd\":[10,0,0],\"a658\":[\"Arial\",\"Calibri\",\"Cambria\",\"Courier\",\"Courier New\",\"Helvetica\",\"Times\",\"Times New Roman\"],\"d02f\":\"124.04347527516074\"}}"})
        const body = JSON.stringify({payload: JSON.stringify({
                "5062": 1712258314864,
                "39c8": "333.999.fp.risk",
                "920b": "0",
                "df35": "8D8CB6D2-AF0C-53DF-A3FE-611AE8DCFBFC12914infoc",
                "03bf": "https: //space.bilibili.com/438074196/dynamic",
                "3c43": {
                    "2673": 0,
                    "5766": 24,
                    "6527": 0,
                    "7003": 1,
                    "807e": 1,
                    "b8ce": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                    "641c": 0,
                    "07a4": "en-US",
                    "1c57": 8,
                    "0bd0": 8,
                    "748e": [
                        2560,
                        1440
                    ],
                    "d61f": [
                        2560,
                        1386
                    ],
                    "fc9d": 300,
                    "6aa9": "America/Chicago",
                    "75b8": 1,
                    "3b21": 1,
                    "8a1c": 0,
                    "d52f": "not available",
                    "adca": "Linux x86_64",
                    "80c9": [
                        [
                            "PDF Viewer",
                            "Portable Document Format",
                            [
                                [
                                    "application/pdf",
                                    "pdf"
                                ],
                                [
                                    "text/pdf",
                                    "pdf"
                                ]
                            ]
                        ],
                        [
                            "Chrome PDF Viewer",
                            "Portable Document Format",
                            [
                                [
                                    "application/pdf",
                                    "pdf"
                                ],
                                [
                                    "text/pdf",
                                    "pdf"
                                ]
                            ]
                        ],
                        [
                            "Chromium PDF Viewer",
                            "Portable Document Format",
                            [
                                [
                                    "application/pdf",
                                    "pdf"
                                ],
                                [
                                    "text/pdf",
                                    "pdf"
                                ]
                            ]
                        ],
                        [
                            "Microsoft Edge PDF Viewer",
                            "Portable Document Format",
                            [
                                [
                                    "application/pdf",
                                    "pdf"
                                ],
                                [
                                    "text/pdf",
                                    "pdf"
                                ]
                            ]
                        ],
                        [
                            "WebKit built-in PDF",
                            "Portable Document Format",
                            [
                                [
                                    "application/pdf",
                                    "pdf"
                                ],
                                [
                                    "text/pdf",
                                    "pdf"
                                ]
                            ]
                        ]
                    ],
                    "13ab": "1eiwAAAAAElFTkSuQmCC",
                    "bfe9": "QDFMhGAYCVjdUkigL2Ffg/2CYKtfwp4HgAAAAASUVORK5CYII=",
                    "a3c1": [
                        "extensions:ANGLE_instanced_arrays;EXT_blend_minmax;EXT_clip_control;EXT_color_buffer_half_float;EXT_depth_clamp;EXT_disjoint_timer_query;EXT_float_blend;EXT_frag_depth;EXT_polygon_offset_clamp;EXT_shader_texture_lod;EXT_texture_compression_bptc;EXT_texture_compression_rgtc;EXT_texture_filter_anisotropic;EXT_sRGB;KHR_parallel_shader_compile;OES_element_index_uint;OES_fbo_render_mipmap;OES_standard_derivatives;OES_texture_float;OES_texture_float_linear;OES_texture_half_float;OES_texture_half_float_linear;OES_vertex_array_object;WEBGL_blend_func_extended;WEBGL_color_buffer_float;WEBGL_compressed_texture_s3tc;WEBGL_compressed_texture_s3tc_srgb;WEBGL_debug_renderer_info;WEBGL_debug_shaders;WEBGL_depth_texture;WEBGL_draw_buffers;WEBGL_lose_context;WEBGL_multi_draw;WEBGL_polygon_mode",
                        "webgl aliased line width range:[1, 2048]",
                        "webgl aliased point size range:[1, 2048]",
                        "webgl alpha bits:8",
                        "webgl antialiasing:yes",
                        "webgl blue bits:8",
                        "webgl depth bits:24",
                        "webgl green bits:8",
                        "webgl max anisotropy:16",
                        "webgl max combined texture image units:64",
                        "webgl max cube map texture size:16384",
                        "webgl max fragment uniform vectors:1024",
                        "webgl max render buffer size:16384",
                        "webgl max texture image units:32",
                        "webgl max texture size:16384",
                        "webgl max varying vectors:32",
                        "webgl max vertex attribs:16",
                        "webgl max vertex texture image units:32",
                        "webgl max vertex uniform vectors:1024",
                        "webgl max viewport dims:[16384, 16384]",
                        "webgl red bits:8",
                        "webgl renderer:WebKit WebGL",
                        "webgl shading language version:WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)",
                        "webgl stencil bits:0",
                        "webgl vendor:WebKit",
                        "webgl version:WebGL 1.0 (OpenGL ES 2.0 Chromium)",
                        "webgl unmasked vendor:Google Inc. (AMD)",
                        "webgl unmasked renderer:ANGLE (AMD, AMD Custom GPU 0405 (radeonsi vangogh LLVM 15.0.7), OpenGL 4.6)",
                        "webgl vertex shader high float precision:23",
                        "webgl vertex shader high float precision rangeMin:127",
                        "webgl vertex shader high float precision rangeMax:127",
                        "webgl vertex shader medium float precision:23",
                        "webgl vertex shader medium float precision rangeMin:127",
                        "webgl vertex shader medium float precision rangeMax:127",
                        "webgl vertex shader low float precision:23",
                        "webgl vertex shader low float precision rangeMin:127",
                        "webgl vertex shader low float precision rangeMax:127",
                        "webgl fragment shader high float precision:23",
                        "webgl fragment shader high float precision rangeMin:127",
                        "webgl fragment shader high float precision rangeMax:127",
                        "webgl fragment shader medium float precision:23",
                        "webgl fragment shader medium float precision rangeMin:127",
                        "webgl fragment shader medium float precision rangeMax:127",
                        "webgl fragment shader low float precision:23",
                        "webgl fragment shader low float precision rangeMin:127",
                        "webgl fragment shader low float precision rangeMax:127",
                        "webgl vertex shader high int precision:0",
                        "webgl vertex shader high int precision rangeMin:31",
                        "webgl vertex shader high int precision rangeMax:30",
                        "webgl vertex shader medium int precision:0",
                        "webgl vertex shader medium int precision rangeMin:31",
                        "webgl vertex shader medium int precision rangeMax:30",
                        "webgl vertex shader low int precision:0",
                        "webgl vertex shader low int precision rangeMin:31",
                        "webgl vertex shader low int precision rangeMax:30",
                        "webgl fragment shader high int precision:0",
                        "webgl fragment shader high int precision rangeMin:31",
                        "webgl fragment shader high int precision rangeMax:30",
                        "webgl fragment shader medium int precision:0",
                        "webgl fragment shader medium int precision rangeMin:31",
                        "webgl fragment shader medium int precision rangeMax:30",
                        "webgl fragment shader low int precision:0",
                        "webgl fragment shader low int precision rangeMin:31",
                        "webgl fragment shader low int precision rangeMax:30"
                    ],
                    "6bc5": "Google Inc. (AMD)~ANGLE (AMD, AMD Custom GPU 0405 (radeonsi vangogh LLVM 15.0.7), OpenGL 4.6)",
                    "ed31": 0,
                    "72bd": 1,
                    "097b": 0,
                    "52cd": [
                        10,
                        0,
                        0
                    ],
                    "a658": [
                        "Arial",
                        "Calibri",
                        "Cambria",
                        "Courier",
                        "Courier New",
                        "Helvetica",
                        "Times",
                        "Times New Roman"
                    ],
                    "d02f": "124.04347527516074"
                }
        })})
        // log(body)
        // log(body.length)
        http.POST(cookie_activation_url, body, { Cookie: `buvid3=${buvid3}`, "User-Agent": USER_AGENT, Host: "api.bilibili.com", "Content-Length": body.length.toString(), "Content-Type": "application/json" }, false)

        const post_results = load_space_posts(space_id, buvid3)

        // log(post_results)

        const posts = post_results.data.items.map((item) => {
            const desc = item.modules.module_dynamic.desc
            const content = desc ? desc.rich_text_nodes.map((node) => {
                switch (node.type) {
                    case "RICH_TEXT_NODE_TYPE_TEXT":
                        return node.text
                    case "RICH_TEXT_NODE_TYPE_TOPIC":
                        return `<a href="${node.jump_url}">${node.text}</a>`
                    case "RICH_TEXT_NODE_TYPE_EMOJI":
                        return node.text
                    case "RICH_TEXT_NODE_TYPE_VIEW_PICTURE":
                        return `<img src="${node.pics[0]?.src}">${node.text}</img>`
                    default:
                        assertNoFallThrough(node)
                        throw new ScriptException(`unhandled type on node ${node}`)
                }
            }).join("") : ""
            const major = item.modules.module_dynamic.major
            const major_links = major ? (() => {
                switch (major.type) {
                    case "MAJOR_TYPE_ARCHIVE":
                        return `<a href="${CONTENT_DETAILS_URL_PREFIX}${major.archive.bvid}">a vod</a>`
                    case "MAJOR_TYPE_DRAW":
                        return `<img src="${major.draw.items[0]?.src}">a pic</img>`
                    default:
                        assertNoFallThrough(major)
                        throw new ScriptException(`unhandled type on major ${major}`)
                }
            })() : ""
            const topic = item.modules.module_dynamic.topic
            const topic_string = topic ? topic?.name + topic?.jump_url : ""
            return new PlatformPostDetails({
                thumbnails: [],
                images: [],
                description: desc ? desc.rich_text_nodes.map((node) => {
                    return node.text
                }).join("") : "", // TODO we should truncate this
                name: "",
                url: `https://t.bilibili.com/${item.id_str}`,
                id: new PlatformID(PLATFORM, item.id_str, plugin.config.id),
                rating: new RatingLikes(item.modules.module_stat.like.count),
                textType: Type.Text.HTML,
                author: author,
                content: content + major_links + topic_string,
                datetime: item.modules.module_author.pub_ts
            })
        })

        return new VideoPager(interleave(videos, posts), false)
    },
    getChannelCapabilities() {
        return new ResultCapabilities([Type.Feed.Videos], [Type.Order.Chronological], [])
    },
    isContentDetailsUrl(url: string) {
        // log(url)
        if (url === "https://live.bilibili.com/26386397") {
            return true
        }
        if (!url.startsWith(CONTENT_DETAILS_URL_PREFIX)) {
            return false
        }
        const content_id = url.slice(CONTENT_DETAILS_URL_PREFIX.length)
        // verify that the content_ID consists of 12 alphanumeric characters
        return /^[a-zA-Z0-9]{12}$/.test(content_id)
    },
    // this doesn't really work. we probably need to use getLiveEvents instead
    // the elements don't get removed for some reason
    // and there is weird height code such that even if we were able to delete the elements the comments
    // likely wouldn't fill the whole screen
    // we should load the chat history from
    // (mobile browser)
    // https://api.live.bilibili.com/AppRoom/msg?room_id=26386397
    // or
    // (desktop browser)
    // https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid=26386397
    // or figure out how to use the websockets to load chat in realtime
    // https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo?id=5050&type=0
    // wss://hw-sg-live-comet-02.chat.bilibili.com/sub
    // 
    getLiveChatWindow(url: string) {
        log("live chatting!!")
        return {
            url,
            removeElements: [".head-info", ".bili-btn-warp", "#app__player-area"]
        }
    },
    getContentDetails(url: string) {
        if (url === "https://live.bilibili.com/26386397") {
            const live_play_prefix = "https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo?protocol=1&format=2&codec=0&room_id="
            const room_id = 26386397
            const json = http.GET(`${live_play_prefix}${room_id}`, {}, false).body
            // log(json)
            const results: LivePlayJSON = JSON.parse(json)
            const codec = results.data.playurl_info.playurl.stream[0]?.format[0]?.codec[0]
            const video_url = `${codec?.url_info[0]?.host}${codec?.base_url}${codec?.url_info[0]?.extra}`
            const source = new HLSSource({
                url: video_url
            })
            // log(video_url)
            // log(results)
            return new PlatformVideoDetails({
                description: "hi test",
                video: new VideoSourceDescriptor([])/* [new HLSSource({
                    url: video_url
                })]*/,
                rating: new RatingLikes(11),
                thumbnails: new Thumbnails([]),
                author: new PlatformAuthorLink(new PlatformID(PLATFORM, "2435267", plugin.config.id), "awgherg", "erbherhe", "ergerger", 11),
                viewCount: 11,
                isLive: true,
                duration: 111,
                shareUrl: "https://live.bilibili.com/26386397",
                uploadDate: 324543634,
                name: "wergberher",
                url: "https://live.bilibili.com/26386397",
                id: new PlatformID(PLATFORM, room_id.toString(), plugin.config.id),
                live: source,
                // hls: source
            })
        }
        const video_id = url.slice(CONTENT_DETAILS_URL_PREFIX.length)
        const [video_info, video_play_details] = get_video_details_json(video_id)

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
            language: Language.UNKNOWN,
            requestModifier: {
                headers: {
                    "Referer": "https://www.bilibili.com",
                    "Host": audio_url_hostname,
                    "User-Agent": USER_AGENT
                }
            }
        })

        const description = video_info.data.View.desc_v2 === null ? { raw_text: "" } : video_info.data.View.desc_v2[0]

        if (description === undefined) {
            throw new ScriptException("missing description")
        }

        const owner_id = video_info.data.View.owner.mid.toString()

        const platform_video_ID = new PlatformID(PLATFORM, video_id, plugin.config.id)
        const platform_creator_ID = new PlatformID(PLATFORM, owner_id, plugin.config.id)
        const details: PlatformContentDetails = new PlatformVideoDetails({
            id: platform_video_ID,
            name: video_info.data.View.title,
            thumbnails: new Thumbnails([new Thumbnail(video_info.data.View.pic, 1080)]), // TODO hardcoded 1080
            author: new PlatformAuthorLink(
                platform_creator_ID,
                video_info.data.View.owner.name,
                `${SPACE_URL_PREFIX}${video_info.data.View.owner.mid}`,
                video_info.data.View.owner.face,
                video_info.data.Card.card.fans
            ),
            duration: video_play_details.data.dash.duration,
            viewCount: video_info.data.View.stat.view,
            url: `${CONTENT_DETAILS_URL_PREFIX}${video_id}`,
            isLive: false, // hardcoded for now
            description: description.raw_text,
            video: new UnMuxVideoSourceDescriptor([video_source], [audio_source]),
            rating: new RatingLikes(video_info.data.View.stat.like),
            shareUrl: `${CONTENT_DETAILS_URL_PREFIX}${video_id}`,
            uploadDate: video_info.data.View.pubdate
        })
        return details
    },
    // TODO when we load comments we actually download all the replies.
    // we should cache them so that when geSubComments is called we don't have to make any networks requests
    getComments(url: string): CommentPager<BiliBiliCommentContext> {
        // log(url)
        const video_id = url.slice(CONTENT_DETAILS_URL_PREFIX.length)
        const video_info = get_video_details_json(video_id)[0]
        // log(video_info.data)
        // log(video_info.data.View.avid)
        const comment_data = get_comments(video_info.data.View.aid).data.replies
        const comments = comment_data.map((data) => {
            const author_id = new PlatformID(PLATFORM, data.member.mid.toString(), plugin.config.id)
            return new PlatformComment<BiliBiliCommentContext>({
                // id: new PlatformID(PLATFORM, data.rpid.toString(), config.id),
                // name: "test", // TODO hardcoded
                // url: "test", // TODO add this
                author: new PlatformAuthorLink(author_id, data.member.uname, `${SPACE_URL_PREFIX}${data.member.mid}`, data.member.avatar, 69), // TODO hardcoded 69
                message: data.content.message,
                rating: new RatingLikes(data.like),
                replyCount: data.replies.length,
                date: data.ctime,
                contextUrl: `${CONTENT_DETAILS_URL_PREFIX}${video_id}`, // TODO hardcoded
                context: { avid: video_info.data.View.aid.toString(), rpid: data.rpid.toString() } // TODO hardcoded
            })
        })
        /*
        log(comments)
        comments = [new PlatformComment({
            author: new PlatformAuthorLink(new PlatformID(PLATFORM, "2457345754", config.id), "data.member.uname", `${SPACE_URL_PREFIX}${2457345754}`, "data.member.avatar", 69), // TODO hardcoded 69
                message: "data.content.message",
                rating: new RatingLikes(1512421),
                replyCount: 1,
                date: 12542134,
                contextUrl: `${CONTENT_DETAILS_URL_PREFIX}${video_id}`, // TODO hardcoded
                context: { avid: 3462457543 } 
        })]*/
        const pager = new CommentPager(comments, false)
        return pager
    },
    getSubComments(comment: PlatformComment<BiliBiliCommentContext>): CommentPager<BiliBiliCommentContext> {
        // console.log("gergerg")
        // log("hi there")
        // log(comment)
        const aid = parseInt(comment.context.avid)
        const rpid = parseInt(comment.context.rpid)
        const comment_data = get_replies(aid, rpid)
        // log(comment_data)
        const comments = comment_data.data.replies.map((data) => {
            if (data.replies.length !== 0) {
                throw new ScriptException("there are sub sub comments!! panic")
            }
            const author_id = new PlatformID(PLATFORM, data.member.mid.toString(), plugin.config.id)
            return new PlatformComment({
                // id: new PlatformID(PLATFORM, data.rpid.toString(), config.id),
                // name: "test", // TODO hardcoded
                // url: "test", // TODO add this
                author: new PlatformAuthorLink(author_id, data.member.uname, `${SPACE_URL_PREFIX}${data.member.mid}`, data.member.avatar, 69), // TODO hardcoded 69
                message: data.content.message,
                rating: new RatingLikes(data.like),
                replyCount: 0,
                date: data.ctime,
                contextUrl: "asdfsd",//comment.contextUrl, // TODO hardcoded
                context: { "avid": aid.toString() } // TODO hardcoded
            })
        })
        // log(comments)
        return new CommentPager(comments, false)
    },
    isPlaylistUrl(url: string) {
        if (!url.startsWith(PLAYLIST_PREFIX)) {
            return false
        }
        /*
        const space_id = url.slice(PLAYLIST_PREFIX.length)
        // verify that the space_id consists only of digits
        if (!/^\d+$/.test(space_id)) {
            return false
        }
        */
        return true
    },
    getPlaylist(url: string) {
        const playlist_id = parseInt(url.slice(PLAYLIST_PREFIX.length))
        const space_id = 490505561
        const playlist_data = load_playlist(space_id, playlist_id)

        const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id)
        const author = new PlatformAuthorLink(author_id, "a name", `${SPACE_URL_PREFIX}${space_id}`, "https://i1.hdslb.com/bfs/face/ba4811ffcdae8a901b9e313043bc88c8667b9d79.jpg@240w_240h_1c_1s_!web-avatar-space-header.avif", 69) // TODO hardcoded 69 and image url and name
        const videos = playlist_data.data.archives.map((video) => {
            const url = `${CONTENT_DETAILS_URL_PREFIX}${video.bvid}`
            const video_id = new PlatformID(PLATFORM, video.bvid, plugin.config.id)
            return new PlatformVideo({
                id: video_id,
                name: video.title,
                url: url,
                thumbnails: new Thumbnails([new Thumbnail(video.pic, 1080)]), // TODO hardcoded 1080
                author,
                duration: parseInt(video.duration), // TODO this doesn't work duration is like "2:54" not a number in seconds
                viewCount: video.stat.view,
                isLive: false, // TODO hardcoded false
                shareUrl: url,
                uploadDate: 420 // TODO hardcoded 420
            })
        })
        // log(playlist_data.data.meta.cover)
        return new PlatformPlaylistDetails({
            id: new PlatformID(PLATFORM, playlist_id.toString(), plugin.config.id),
            name: playlist_data.data.meta.name,
            author,
            url: `${PLAYLIST_PREFIX}${playlist_id}`,
            contents: new VideoPager(videos, false),
            videoCount: 69,
            thumbnail: playlist_data.data.meta.cover // TODO only used when the playlist shows up in as a search result when you view a playlist the thumbnail is taken from the first video i think this is a bug
        })
    }
}
// assign the methods to the source object
for (const key of Object.keys(source_temp)) {
    // @ts-expect-error TODO make it so that the ts-expect-error is no longer required
    source[key] = source_temp[key]
}

// starts with the longer array or a if they are the same length
function interleave<T, U>(a: T[], b: U[]): Array<T | U> {
    const [first, second] = b.length > a.length ? [b, a] : [a, b]
    return first.flatMap((a_value, index) => {
        const b_value = second[index]
        if (second[index] === undefined) {
            return a_value
        }
        return b_value !== undefined ? [a_value, b_value] : a_value
    })
}

function assertNoFallThrough(value: never) {
    log(value)
}

/*
class BCommentPager extends CommentPager {
    constructor(results: PlatformComment[], hasMore: boolean) {
        super(results, hasMore)
    }

    override nextPage() {
        return new BCommentPager([], false, {test: "a data"})
    }
}
*/

// function get_comment_context_url

function get_replies(avid: number, rpid: number) {
    const thread_prefix = "https://api.bilibili.com/x/v2/reply/reply?type=1&"
    const json = http.GET(`${thread_prefix}oid=${avid}&root=${rpid}`, {}, false).body

    const results: SubCommentsJSON = JSON.parse(json)
    return results
}


function get_comments(avid: number) {
    // log(avid)
    const comments_preix = "https://api.bilibili.com/x/v2/reply/wbi/main?"
    const params: Params = {
        type: 1,
        mode: 2,
        // pagination_str: "%7B%22offset%22:%22%22%7D",
        // pagination_str: '{"offset":""}',
        // pagination_str: JSON.stringify({offset:{type:1,direction:1,data:{}}}),
        // pagination_str: `{"offset":"{\\"type\\":1,\\"direction\\":1,\\"data\\":{\\"pn\\":0}}"}`,
        pagination_str: `{"offset":"{\\"type\\":3,\\"direction\\":1,\\"Data\\":{\\"cursor\\":764}}"}`,
        // plat: 1,
        // seek_rpid: "",
        // web_location: 1315875,
        oid: avid,
        // pn: 1,
        // ps: 25,
        // keyword: search_term,
        // web_location: 1430654, // TODO hardcoded
        // current timestamp Math.round(Date.now() / 1e3)
        wts: Math.round(Date.now() / 1e3),
        // device fingerprint values
        // dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        // dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        // dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        // dm_img_list: "[]",
    }
    const comment_url = comments_preix + compute_parameters(params)
    // log(comment_url)
    // const buvid3 = get_buvid3()
    // const results: SpaceVideosJSON = JSON.parse(http.GET(space_search_url, { "User-Agent": USER_AGENT, Cookie: `buvid3=${buvid3}` }, false).body)
    const json = http.GET(comment_url, {}, false).body
    // log(json.length)
    // log(json.slice(0,10000))

    const results: CommentsJSON = JSON.parse(json)
    return results
}

function load_playlist(space_id: number, playlist_id: number) {
    const playlist_prefix = "https://api.bilibili.com/x/polymer/web-space/seasons_archives_list?"
    /*
    const params: Params = {
        mid: space_id,
        season_id: playlist_id,
        // ps: 25,
        // keyword: search_term,
        // web_location: 1430654, // TODO hardcoded
        // current timestamp Math.round(Date.now() / 1e3)
        wts: Math.round(Date.now() / 1e3),
        // device fingerprint values
        dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        dm_img_list: "[]",
    }
    */
    const playlist_url = `${playlist_prefix}mid=${space_id}&season_id=${playlist_id}`
    const buvid3 = get_buvid3()
    const results: PlaylistJSON = JSON.parse(http.GET(playlist_url, { Cookie: `buvid3=${buvid3}` }, false).body)
    // const results: SpaceVideosJSON = JSON.parse(http.GET(playlist_url, { "User-Agent": USER_AGENT, Cookie: `buvid3=${buvid3}` }, false).body)
    return results
}

function load_space_posts(space_id: number, buvid3: string): SpacePostsJSON {
    const space_search_url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${space_id}`
    /*
        const params: Params = {
            host_mid: space_id,
            // platform: "web",
            // token: "",
            // web_location: 1550101, // TODO hardcoded
            // current timestamp Math.round(Date.now() / 1e3)
            wts: Math.round(Date.now() / 1e3),
            // device fingerprint values
            dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
            dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
            dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
            dm_img_list: "[]",
        }
        const space_search_url = space_posts_prefix + compute_parameters(params)
        log(space_search_url)
        */
    const json = http.GET(space_search_url, { Host: "api.bilibili.com", Cookie: `buvid3=${buvid3}`, "User-Agent": USER_AGENT }, false).body
    log(json)
    const results: SpacePostsJSON = JSON.parse(json)
    // log(buvid3)
    // log(space_id)
    // log(results)
    return results
}

function load_channel_videos(space_id: number, buvid3: string): SpaceVideosJSON {
    const space_search_prefix = "https://api.bilibili.com/x/space/wbi/arc/search?"
    const params: Params = {
        mid: space_id,
        pn: 1,
        ps: 25,
        // keyword: search_term,
        // web_location: 1430654, // TODO hardcoded
        // current timestamp Math.round(Date.now() / 1e3)
        wts: Math.round(Date.now() / 1e3),
        // device fingerprint values
        dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        dm_img_list: "[]",
    }
    const space_search_url = space_search_prefix + compute_parameters(params)

    const results: SpaceVideosJSON = JSON.parse(http.GET(space_search_url, { "User-Agent": USER_AGENT, Cookie: `buvid3=${buvid3}` }, false).body)
    return results
}

function get_live_search_results(search_term: string): LiveSearchResultsJSON {
    const search_prefix = "https://api.bilibili.com/x/web-interface/wbi/search/type?"
    const params: Params = {
        search_type: "live",
        page: 1,
        page_size: 42,
        keyword: search_term,
        // web_location: 1430654, // TODO hardcoded
        // current timestamp Math.round(Date.now() / 1e3)
        wts: Math.round(Date.now() / 1e3),
        // device fingerprint values
        dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        dm_img_list: "[]",
    }
    const search_url = search_prefix + compute_parameters(params)
    const buvid3 = get_buvid3()
    const search_results: LiveSearchResultsJSON = JSON.parse(http.GET(search_url, { "User-Agent": USER_AGENT, Cookie: `buvid3=${buvid3}` }, false).body)
    // const search_results: SearchResultsJSON = JSON.parse(http.GET(search_url, { Cookie: `buvid3=${buvid3}` }, false).body)
    // log(search_results)
    return search_results
}

function get_video_search_results(search_term: string): SearchResultsJSON {
    const search_prefix = "https://api.bilibili.com/x/web-interface/wbi/search/type?"
    const params: Params = {
        search_type: "video",
        page: 1,
        page_size: 42,
        keyword: search_term,
        // web_location: 1430654, // TODO hardcoded
        // current timestamp Math.round(Date.now() / 1e3)
        wts: Math.round(Date.now() / 1e3),
        // device fingerprint values
        dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        dm_img_list: "[]",
    }
    const search_url = search_prefix + compute_parameters(params)
    const buvid3 = get_buvid3()
    const search_results: SearchResultsJSON = JSON.parse(http.GET(search_url, { "User-Agent": USER_AGENT, Cookie: `buvid3=${buvid3}` }, false).body)
    // const search_results: SearchResultsJSON = JSON.parse(http.GET(search_url, { Cookie: `buvid3=${buvid3}` }, false).body)
    // log(search_results)
    return search_results
}

/*
function old_get_search_results(search_term: string): OldSearchResultsJSON{
    const search_prefix = "https://api.bilibili.com/x/web-interface/wbi/search/all/v2?"
    const params: Params = {
        page: 1,
        page_size: 42,
        keyword: search_term,
        web_location: 1430654, // TODO hardcoded
        // current timestamp Math.round(Date.now() / 1e3)
        wts: Math.round(Date.now() / 1e3),
        // device fingerprint values
        dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        dm_img_list: "[]",
    }
    const search_url = search_prefix + compute_parameters(params)
    const buvid3 = get_buvid3()
    const search_results: OldSearchResultsJSON = JSON.parse(http.GET(search_url, { "User-Agent": USER_AGENT, Cookie: `buvid3=${buvid3}` }, false).body)
    return search_results
}*/

function get_video_details_json(video_id: string): [VideoInfoJSON, VideoPlayJSON] {
    const detail_prefix = "https://api.bilibili.com/x/web-interface/wbi/view/detail?"
    const params2: Params = {
        bvid: video_id,
        // fnval: 4048,
        // fourk: 1,
        // fnver: 0,
        // avid: 1101695476,
        // cid: 1466542760,
        // platform: "web",
        // token: "",
        // web_location: 1315873, // TODO hardcoded
        // current timestamp Math.round(Date.now() / 1e3)
        wts: Math.round(Date.now() / 1e3),
        // device fingerprint values
        dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        dm_img_list: "[]",
    }
    const info_url2 = detail_prefix + compute_parameters(params2)
    // log(info_url2)
    // const buvid4 = encodeURIComponent(get_buvid4())
    const buvid3 = get_buvid3()
    // const buvid3 = "B7C4D1BF-A65F-EBFB-1F66-9BCE95A68FE112460infoc"
    const video_details_json = http.GET(info_url2, { Host: "api.bilibili.com", "User-Agent": REAL_USER_AGENT, Referer: "https://www.bilibili.com", Cookie: `buvid3=${buvid3}` }, false).body
    // log(buvid3)
    // log(info_url2)

    const video_info: VideoInfoJSON = JSON.parse(video_details_json)
    // log(video_info)
    // const res: { data: { View: { cid: number } } } = JSON.parse(space_json2)
    // const cid = res.data.View.cid

    // const video_details_regex = /<script>window\.__playinfo__=(.*?)<\/script><script>window\.__INITIAL_STATE__=(.*?);.*?<\/script>/
    // const main_video_html_body = http.GET(url, {}, false).body
    // const parsed = main_video_html_body.match(video_details_regex)
    // const video_play_json = parsed?.[1]
    // if (video_play_json === undefined) {
    //     throw new ScriptException("missing video details")
    // }


    // const video_details_json = parsed?.[2]
    // if (video_details_json === undefined) {
    //     throw new ScriptException("missing video details")
    // }

    // log(video_info)


    // TODO subtitiles require login
    // https://api.bilibili.com/x/player/wbi/v2?aid=1402475665&cid=1487515536&isGaiaAvoided=false&web_location=1315873&w_rid=d0f2a387c3d7e19eb66f681e81b0385d&wts=1712248112

    const url_prefix = "https://api.bilibili.com/x/player/wbi/playurl?"
    const params: Params = {
        bvid: video_id,
        fnval: 4048,
        // fourk: 1,
        // fnver: 0,
        // avid: 1101695476,
        // cid: 1466542760,
        cid: video_info.data.View.cid,
        // platform: "web",
        // token: "",
        // web_location: 1315873, // TODO hardcoded
        // current timestamp Math.round(Date.now() / 1e3)
        wts: Math.round(Date.now() / 1e3),
        // device fingerprint values
        dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        dm_img_list: "[]",
    }
    const info_url = url_prefix + compute_parameters(params)
    // const buvid3 = get_buvid3()
    const video_play_json = http.GET(info_url, { "User-Agent": USER_AGENT }, false).body
    // const video_play_json = http.GET(info_url, { }, false).body

    const video_play: VideoPlayJSON = JSON.parse(video_play_json)


    // log(video_play)
    return [video_info, video_play]
}

function get_fan_count(space_id: number): number {
    const stats: { data: { follower: number } } = JSON.parse(http.GET(stats_url_prefix + space_id, {}, false).body)
    return stats.data.follower
}

function get_home_json(): HomePageJSON {
    const home_json = http.GET(`${HOME_URL}?ps=12&fresh_idx=0`, {}, false).body // grab the first 12
    const home: HomePageJSON = JSON.parse(home_json)
    return home
}

// "https://s1.hdslb.com/bfs/seed/laputa-header/bili-header.umd.js"
function getMixinKey(e: string, encryption_info: readonly number[]) {
    return encryption_info.filter((value) => {
        return e[value] !== undefined
    }).map((value) => {
        return e[value]
    }).join("").slice(0, 32)
}

function get_mixin_constant(): readonly number[] {
    const url = "https://s1.hdslb.com/bfs/seed/laputa-header/bili-header.umd.js"
    const mixin_constant_regex = /function getMixinKey\(e\){var t=\[\];return(.*?)\.forEach\(\(function\(r\){e\.charAt\(r\)&&t\.push\(e\.charAt\(r\)\)}\)\),t\.join\(""\)\.slice\(0,32\)}/
    const mixin_constant_json = http.GET(url, {}, false).body.match(mixin_constant_regex)?.[1]
    if (mixin_constant_json === undefined) {
        throw new ScriptException("failed to acquire mixin_constant")
    }
    return JSON.parse(mixin_constant_json)
}

function get_wbi_keys(): Wbi {
    const url = "https://api.bilibili.com/x/web-interface/nav"
    const wbi_json = http.GET(url, {}, false).body
    const res: { data: { wbi_img: { img_url: string, sub_url: string } } } = JSON.parse(wbi_json)

    return {
        wbi_img_key: res.data.wbi_img.img_url.slice(29, 61),
        wbi_sub_key: res.data.wbi_img.sub_url.slice(29, 61)
    }
}

function compute_parameters(params: Params) {
    const { wbi_img_key, wbi_sub_key } = get_wbi_keys()

    const constant = getMixinKey(wbi_img_key + wbi_sub_key, get_mixin_constant())

    const merged = Object.entries(params).sort((a, b) => a[0].localeCompare(b[0])).map((entry) => {
        return `${entry[0]}=${encodeURIComponent(entry[1])}`
    }).join("&")
    const w_rid = md5(merged + constant)
    return `${merged}&w_rid=${w_rid}`
}

// TODO migrate to buvid4
// they seems slightly more involved to use. you can't simply include it with the Cookie header
// the browser does something else before using it that like enables it to work
function get_buvid3() {
    const url = "https://api.bilibili.com/x/frontend/finger/spi"
    const buvid3_object: { data: { b_3: string } } = JSON.parse(http.GET(url, { Host: "api.bilibili.com", Referer: "https://www.bilibili.com", "User-Agent": USER_AGENT }, false).body)
    return buvid3_object.data.b_3
}

function md5(input: string): string {
    return MD5.generate(input)
}

// https://cdn.jsdelivr.net/npm/md5-js-tools@1.0.2/lib/md5.min.js
// @ts-expect-error TODO write our own Typescript implementation
// eslint-disable-next-line
var MD5: { generate?: any }; (() => { var r = { d: (n, t) => { for (var e in t) r.o(t, e) && !r.o(n, e) && Object.defineProperty(n, e, { enumerable: !0, get: t[e] }) }, o: (r, n) => Object.prototype.hasOwnProperty.call(r, n), r: r => { "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(r, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(r, "__esModule", { value: !0 }) } }, n = {}; (() => { r.r(n), r.d(n, { MD5: () => d, generate: () => e }); var t = function (r) { r = r.replace(/\r\n/g, "\n"); for (var n = "", t = 0; t < r.length; t++) { var e = r.charCodeAt(t); e < 128 ? n += String.fromCharCode(e) : e > 127 && e < 2048 ? (n += String.fromCharCode(e >> 6 | 192), n += String.fromCharCode(63 & e | 128)) : (n += String.fromCharCode(e >> 12 | 224), n += String.fromCharCode(e >> 6 & 63 | 128), n += String.fromCharCode(63 & e | 128)) } return n }; function e(r) { var n, e, o, d, l, C, h, v, S, m; for (n = function (r) { for (var n, t = r.length, e = t + 8, o = 16 * ((e - e % 64) / 64 + 1), u = Array(o - 1), a = 0, f = 0; f < t;)a = f % 4 * 8, u[n = (f - f % 4) / 4] = u[n] | r.charCodeAt(f) << a, f++; return a = f % 4 * 8, u[n = (f - f % 4) / 4] = u[n] | 128 << a, u[o - 2] = t << 3, u[o - 1] = t >>> 29, u }(t(r)), h = 1732584193, v = 4023233417, S = 2562383102, m = 271733878, e = 0; e < n.length; e += 16)o = h, d = v, l = S, C = m, h = a(h, v, S, m, n[e + 0], 7, 3614090360), m = a(m, h, v, S, n[e + 1], 12, 3905402710), S = a(S, m, h, v, n[e + 2], 17, 606105819), v = a(v, S, m, h, n[e + 3], 22, 3250441966), h = a(h, v, S, m, n[e + 4], 7, 4118548399), m = a(m, h, v, S, n[e + 5], 12, 1200080426), S = a(S, m, h, v, n[e + 6], 17, 2821735955), v = a(v, S, m, h, n[e + 7], 22, 4249261313), h = a(h, v, S, m, n[e + 8], 7, 1770035416), m = a(m, h, v, S, n[e + 9], 12, 2336552879), S = a(S, m, h, v, n[e + 10], 17, 4294925233), v = a(v, S, m, h, n[e + 11], 22, 2304563134), h = a(h, v, S, m, n[e + 12], 7, 1804603682), m = a(m, h, v, S, n[e + 13], 12, 4254626195), S = a(S, m, h, v, n[e + 14], 17, 2792965006), h = f(h, v = a(v, S, m, h, n[e + 15], 22, 1236535329), S, m, n[e + 1], 5, 4129170786), m = f(m, h, v, S, n[e + 6], 9, 3225465664), S = f(S, m, h, v, n[e + 11], 14, 643717713), v = f(v, S, m, h, n[e + 0], 20, 3921069994), h = f(h, v, S, m, n[e + 5], 5, 3593408605), m = f(m, h, v, S, n[e + 10], 9, 38016083), S = f(S, m, h, v, n[e + 15], 14, 3634488961), v = f(v, S, m, h, n[e + 4], 20, 3889429448), h = f(h, v, S, m, n[e + 9], 5, 568446438), m = f(m, h, v, S, n[e + 14], 9, 3275163606), S = f(S, m, h, v, n[e + 3], 14, 4107603335), v = f(v, S, m, h, n[e + 8], 20, 1163531501), h = f(h, v, S, m, n[e + 13], 5, 2850285829), m = f(m, h, v, S, n[e + 2], 9, 4243563512), S = f(S, m, h, v, n[e + 7], 14, 1735328473), h = i(h, v = f(v, S, m, h, n[e + 12], 20, 2368359562), S, m, n[e + 5], 4, 4294588738), m = i(m, h, v, S, n[e + 8], 11, 2272392833), S = i(S, m, h, v, n[e + 11], 16, 1839030562), v = i(v, S, m, h, n[e + 14], 23, 4259657740), h = i(h, v, S, m, n[e + 1], 4, 2763975236), m = i(m, h, v, S, n[e + 4], 11, 1272893353), S = i(S, m, h, v, n[e + 7], 16, 4139469664), v = i(v, S, m, h, n[e + 10], 23, 3200236656), h = i(h, v, S, m, n[e + 13], 4, 681279174), m = i(m, h, v, S, n[e + 0], 11, 3936430074), S = i(S, m, h, v, n[e + 3], 16, 3572445317), v = i(v, S, m, h, n[e + 6], 23, 76029189), h = i(h, v, S, m, n[e + 9], 4, 3654602809), m = i(m, h, v, S, n[e + 12], 11, 3873151461), S = i(S, m, h, v, n[e + 15], 16, 530742520), h = c(h, v = i(v, S, m, h, n[e + 2], 23, 3299628645), S, m, n[e + 0], 6, 4096336452), m = c(m, h, v, S, n[e + 7], 10, 1126891415), S = c(S, m, h, v, n[e + 14], 15, 2878612391), v = c(v, S, m, h, n[e + 5], 21, 4237533241), h = c(h, v, S, m, n[e + 12], 6, 1700485571), m = c(m, h, v, S, n[e + 3], 10, 2399980690), S = c(S, m, h, v, n[e + 10], 15, 4293915773), v = c(v, S, m, h, n[e + 1], 21, 2240044497), h = c(h, v, S, m, n[e + 8], 6, 1873313359), m = c(m, h, v, S, n[e + 15], 10, 4264355552), S = c(S, m, h, v, n[e + 6], 15, 2734768916), v = c(v, S, m, h, n[e + 13], 21, 1309151649), h = c(h, v, S, m, n[e + 4], 6, 4149444226), m = c(m, h, v, S, n[e + 11], 10, 3174756917), S = c(S, m, h, v, n[e + 2], 15, 718787259), v = c(v, S, m, h, n[e + 9], 21, 3951481745), h = u(h, o), v = u(v, d), S = u(S, l), m = u(m, C); return g(h) + g(v) + g(S) + g(m) } function o(r, n) { return r << n | r >>> 32 - n } function u(r, n) { var t, e, o, u, a; return o = 2147483648 & r, u = 2147483648 & n, a = (1073741823 & r) + (1073741823 & n), (t = 1073741824 & r) & (e = 1073741824 & n) ? 2147483648 ^ a ^ o ^ u : t | e ? 1073741824 & a ? 3221225472 ^ a ^ o ^ u : 1073741824 ^ a ^ o ^ u : a ^ o ^ u } function a(r, n, t, e, a, f, i) { return r = u(r, u(u(function (r, n, t) { return r & n | ~r & t }(n, t, e), a), i)), u(o(r, f), n) } function f(r, n, t, e, a, f, i) { return r = u(r, u(u(function (r, n, t) { return r & t | n & ~t }(n, t, e), a), i)), u(o(r, f), n) } function i(r, n, t, e, a, f, i) { return r = u(r, u(u(function (r, n, t) { return r ^ n ^ t }(n, t, e), a), i)), u(o(r, f), n) } function c(r, n, t, e, a, f, i) { return r = u(r, u(u(function (r, n, t) { return n ^ (r | ~t) }(n, t, e), a), i)), u(o(r, f), n) } function g(r) { var n, t = "", e = ""; for (n = 0; n <= 3; n++)t += (e = "0" + (r >>> 8 * n & 255).toString(16)).substr(e.length - 2, 2); return t } var d = { generate: e } })(), MD5 = n })();

// export statements removed during build step
export { get_video_details_json, compute_parameters, getMixinKey, get_mixin_constant, get_wbi_keys, get_video_search_results, get_comments, interleave, get_buvid3, load_space_posts }
