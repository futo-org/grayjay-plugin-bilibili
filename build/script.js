const PLATFORM = "bilibili";
const CONTENT_DETAILS_URL_PREFIX = "https://www.bilibili.com/video/";
const HOME_URL = "https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd";
const SPACE_URL_PREFIX = "https://space.bilibili.com/";
const USER_AGENT = "Grayjay";
const REAL_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
// const USER_AGENT = "HTTPie" as const
const stats_url_prefix = "https://api.bilibili.com/x/relation/stat?vmid=";
// global (to the file) variable to later access the configuration details of the plugin
// initialized when enabling the plugin
let config;
// Source Methods
const source_temp = {
    enable(conf, settings, savedState) {
        config = conf;
        // log(config)
        log(settings);
        log(savedState);
    },
    disable() {
        log("disabling");
    },
    saveState() { return ""; },
    getHome() {
        const home = get_home_json();
        const requests = http.batch();
        home.data.item.forEach((item) => {
            requests.GET(stats_url_prefix + item.owner.mid, {}, false);
        });
        const responses = requests.execute();
        const platform_videos = home.data.item.map((item, index) => {
            const response = responses[index];
            if (response === undefined) {
                throw new ScriptException("batching error");
            }
            const video_id = new PlatformID(PLATFORM, item.bvid, config.id);
            const author_id = new PlatformID(PLATFORM, item.owner.mid.toString(), config.id);
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
            });
        });
        return new VideoPager(platform_videos, false); // TODO hardcoded
    },
    isChannelUrl(url) {
        if (!url.startsWith(SPACE_URL_PREFIX)) {
            return false;
        }
        const space_id = url.slice(SPACE_URL_PREFIX.length);
        // verify that the space_id consists only of digits
        if (!/^\d+$/.test(space_id)) {
            return false;
        }
        return true;
    },
    getChannel(url) {
        // log(url)
        const space_id = parseInt(url.slice(SPACE_URL_PREFIX.length));
        const num_fans = get_fan_count(space_id);
        //vmid=24562205
        const info_url_prefix = "https://api.bilibili.com/x/space/wbi/acc/info?";
        const params = {
            mid: space_id,
            platform: "web",
            token: "",
            web_location: 1550101, // TODO hardcoded
            // current timestamp Math.round(Date.now() / 1e3)
            wts: Math.round(Date.now() / 1e3),
            // device fingerprint values
            dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
            dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
            dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
            dm_img_list: "[]",
        };
        const info_url = info_url_prefix + compute_parameters(params);
        const buvid3 = get_buvid3();
        const space_json = http.GET(info_url, { Referer: "https://www.bilibili.com", Host: "api.bilibili.com", "User-Agent": REAL_USER_AGENT, Cookie: `buvid3=${buvid3}` }, false).body;
        // log(space_json)
        log(buvid3);
        log(info_url);
        const space = JSON.parse(space_json);
        return new PlatformChannel({
            id: new PlatformID(PLATFORM, space_id.toString(), config.id),
            name: space.data.name,
            thumbnail: space.data.face,
            banner: space.data.top_photo,
            subscribers: num_fans,
            description: space.data.sign,
            url: url,
        });
    },
    isContentDetailsUrl(url) {
        if (!url.startsWith(CONTENT_DETAILS_URL_PREFIX)) {
            return false;
        }
        const content_id = url.slice(CONTENT_DETAILS_URL_PREFIX.length);
        // verify that the content_ID consists of 12 alphanumeric characters
        return /^[a-zA-Z0-9]{12}$/.test(content_id);
    },
    getContentDetails(url) {
        const video_id = url.slice(CONTENT_DETAILS_URL_PREFIX.length);
        const [video_info, video_play_details] = get_video_details_json(video_id);
        const video_source_info = video_play_details.data.dash.video.find((entry) => {
            return entry.codecid === video_play_details.data.video_codecid;
        });
        const audio_source_info = video_play_details.data.dash.audio[0]; // TODO hardcoded
        if (video_source_info === undefined || audio_source_info === undefined) {
            throw new ScriptException("can't load content details");
        }
        const name = video_play_details.data.accept_description[video_play_details.data.accept_quality.findIndex((value) => {
            return value === video_source_info.id;
        })];
        if (name === undefined) {
            throw new ScriptException("can't load content details");
        }
        const video_url_hostname = new URL(video_source_info.base_url).hostname;
        const audio_url_hostname = new URL(audio_source_info.base_url).hostname;
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
        });
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
        });
        const description = video_info.data.View.desc_v2 === null ? { raw_text: "" } : video_info.data.View.desc_v2[0];
        if (description === undefined) {
            throw new ScriptException("missing description");
        }
        const owner_id = video_info.data.View.owner.mid.toString();
        const platform_video_ID = new PlatformID(PLATFORM, video_id, config.id);
        const platform_creator_ID = new PlatformID(PLATFORM, owner_id, config.id);
        const details = new PlatformVideoDetails({
            id: platform_video_ID,
            name: video_info.data.View.title,
            thumbnails: new Thumbnails([new Thumbnail(video_info.data.View.pic, 1080)]), // TODO hardcoded 1080
            author: new PlatformAuthorLink(platform_creator_ID, video_info.data.View.owner.name, `${SPACE_URL_PREFIX}${video_info.data.View.owner.mid}`, video_info.data.View.owner.face, video_info.data.Card.card.fans),
            duration: video_play_details.data.dash.duration,
            viewCount: video_info.data.View.stat.view,
            url: url,
            isLive: false, // hardcoded for now
            description: description.raw_text,
            video: new UnMuxVideoSourceDescriptor([video_source], [audio_source]),
            rating: new RatingLikes(video_info.data.View.stat.like),
            shareUrl: url,
            uploadDate: video_info.data.View.pubdate
        });
        return details;
    },
};
// assign the methods to the source object
for (const key of Object.keys(source_temp)) {
    // @ts-expect-error TODO make it so that the ts-expect-error is no longer required
    source[key] = source_temp[key];
}
function get_video_details_json(video_id) {
    const detail_prefix = "https://api.bilibili.com/x/web-interface/wbi/view/detail?";
    const params2 = {
        bvid: video_id,
        // fnval: 4048,
        // fourk: 1,
        // fnver: 0,
        // avid: 1101695476,
        // cid: 1466542760,
        platform: "web",
        token: "",
        web_location: 1315873, // TODO hardcoded
        // current timestamp Math.round(Date.now() / 1e3)
        wts: Math.round(Date.now() / 1e3),
        // device fingerprint values
        dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        dm_img_list: "[]",
    };
    const info_url2 = detail_prefix + compute_parameters(params2);
    // log(info_url2)
    // const buvid4 = encodeURIComponent(get_buvid4())
    const buvid3 = get_buvid3();
    // const buvid3 = "B7C4D1BF-A65F-EBFB-1F66-9BCE95A68FE112460infoc"
    const video_details_json = http.GET(info_url2, { Host: "api.bilibili.com", "User-Agent": USER_AGENT, Referer: "https://www.bilibili.com", Cookie: `buvid3=${buvid3}` }, false).body;
    // log(buvid3)
    // log(info_url2)
    const video_info = JSON.parse(video_details_json);
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
    const url_prefix = "https://api.bilibili.com/x/player/wbi/playurl?";
    const params = {
        bvid: video_id,
        fnval: 4048,
        // fourk: 1,
        // fnver: 0,
        // avid: 1101695476,
        // cid: 1466542760,
        cid: video_info.data.View.cid,
        platform: "web",
        token: "",
        web_location: 1315873, // TODO hardcoded
        // current timestamp Math.round(Date.now() / 1e3)
        wts: Math.round(Date.now() / 1e3),
        // device fingerprint values
        dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        dm_img_list: "[]",
    };
    const info_url = url_prefix + compute_parameters(params);
    // const buvid3 = get_buvid3()
    const video_play_json = http.GET(info_url, { "User-Agent": USER_AGENT }, false).body;
    // const video_play_json = http.GET(info_url, { }, false).body
    const video_play = JSON.parse(video_play_json);
    // log(video_play)
    return [video_info, video_play];
}
function get_fan_count(space_id) {
    const stats = JSON.parse(http.GET(stats_url_prefix + space_id, {}, false).body);
    return stats.data.follower;
}
function get_home_json() {
    const home_json = http.GET(HOME_URL, {}, false).body;
    const home = JSON.parse(home_json);
    return home;
}
function getMixinKey(e, encryption_info) {
    return encryption_info.filter((value) => {
        return e[value] !== undefined;
    }).map((value) => {
        return e[value];
    }).join("").slice(0, 32);
}
function get_mixin_constant() {
    const url = "https://s1.hdslb.com/bfs/seed/laputa-header/bili-header.umd.js";
    const mixin_constant_regex = /function getMixinKey\(e\){var t=\[\];return(.*?)\.forEach\(\(function\(r\){e\.charAt\(r\)&&t\.push\(e\.charAt\(r\)\)}\)\),t\.join\(""\)\.slice\(0,32\)}/;
    const mixin_constant_json = http.GET(url, {}, false).body.match(mixin_constant_regex)?.[1];
    if (mixin_constant_json === undefined) {
        throw new ScriptException("failed to acquire mixin_constant");
    }
    return JSON.parse(mixin_constant_json);
}
function get_wbi_keys() {
    const url = "https://api.bilibili.com/x/web-interface/nav";
    const wbi_json = http.GET(url, {}, false).body;
    const res = JSON.parse(wbi_json);
    return {
        wbi_img_key: res.data.wbi_img.img_url.slice(29, 61),
        wbi_sub_key: res.data.wbi_img.sub_url.slice(29, 61)
    };
}
function compute_parameters(params) {
    const { wbi_img_key, wbi_sub_key } = get_wbi_keys();
    const constant = getMixinKey(wbi_img_key + wbi_sub_key, get_mixin_constant());
    const merged = Object.entries(params).sort((a, b) => a[0].localeCompare(b[0])).map((entry) => {
        return `${entry[0]}=${encodeURIComponent(entry[1])}`;
    }).join("&");
    const w_rid = md5(merged + constant);
    return `${merged}&w_rid=${w_rid}`;
}
// TODO migrate to buvid4
// they seems slightly more involved to use. you can't simply include it with the Cookie header
// the browser does something else before using it that like enables it to work
function get_buvid3() {
    const url = "https://api.bilibili.com/x/frontend/finger/spi";
    const buvid3_object = JSON.parse(http.GET(url, { Host: "api.bilibili.com", Referer: "https://www.bilibili.com", "User-Agent": USER_AGENT }, false).body);
    return buvid3_object.data.b_3;
}
function md5(input) {
    return MD5.generate(input);
}
// https://cdn.jsdelivr.net/npm/md5-js-tools@1.0.2/lib/md5.min.js
// @ts-expect-error TODO write our own Typescript implementation
// eslint-disable-next-line
var MD5;
(() => { var r = { d: (n, t) => { for (var e in t)
        r.o(t, e) && !r.o(n, e) && Object.defineProperty(n, e, { enumerable: !0, get: t[e] }); }, o: (r, n) => Object.prototype.hasOwnProperty.call(r, n), r: r => { "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(r, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(r, "__esModule", { value: !0 }); } }, n = {}; (() => { r.r(n), r.d(n, { MD5: () => d, generate: () => e }); var t = function (r) { r = r.replace(/\r\n/g, "\n"); for (var n = "", t = 0; t < r.length; t++) {
    var e = r.charCodeAt(t);
    e < 128 ? n += String.fromCharCode(e) : e > 127 && e < 2048 ? (n += String.fromCharCode(e >> 6 | 192), n += String.fromCharCode(63 & e | 128)) : (n += String.fromCharCode(e >> 12 | 224), n += String.fromCharCode(e >> 6 & 63 | 128), n += String.fromCharCode(63 & e | 128));
} return n; }; function e(r) { var n, e, o, d, l, C, h, v, S, m; for (n = function (r) { for (var n, t = r.length, e = t + 8, o = 16 * ((e - e % 64) / 64 + 1), u = Array(o - 1), a = 0, f = 0; f < t;)
    a = f % 4 * 8, u[n = (f - f % 4) / 4] = u[n] | r.charCodeAt(f) << a, f++; return a = f % 4 * 8, u[n = (f - f % 4) / 4] = u[n] | 128 << a, u[o - 2] = t << 3, u[o - 1] = t >>> 29, u; }(t(r)), h = 1732584193, v = 4023233417, S = 2562383102, m = 271733878, e = 0; e < n.length; e += 16)
    o = h, d = v, l = S, C = m, h = a(h, v, S, m, n[e + 0], 7, 3614090360), m = a(m, h, v, S, n[e + 1], 12, 3905402710), S = a(S, m, h, v, n[e + 2], 17, 606105819), v = a(v, S, m, h, n[e + 3], 22, 3250441966), h = a(h, v, S, m, n[e + 4], 7, 4118548399), m = a(m, h, v, S, n[e + 5], 12, 1200080426), S = a(S, m, h, v, n[e + 6], 17, 2821735955), v = a(v, S, m, h, n[e + 7], 22, 4249261313), h = a(h, v, S, m, n[e + 8], 7, 1770035416), m = a(m, h, v, S, n[e + 9], 12, 2336552879), S = a(S, m, h, v, n[e + 10], 17, 4294925233), v = a(v, S, m, h, n[e + 11], 22, 2304563134), h = a(h, v, S, m, n[e + 12], 7, 1804603682), m = a(m, h, v, S, n[e + 13], 12, 4254626195), S = a(S, m, h, v, n[e + 14], 17, 2792965006), h = f(h, v = a(v, S, m, h, n[e + 15], 22, 1236535329), S, m, n[e + 1], 5, 4129170786), m = f(m, h, v, S, n[e + 6], 9, 3225465664), S = f(S, m, h, v, n[e + 11], 14, 643717713), v = f(v, S, m, h, n[e + 0], 20, 3921069994), h = f(h, v, S, m, n[e + 5], 5, 3593408605), m = f(m, h, v, S, n[e + 10], 9, 38016083), S = f(S, m, h, v, n[e + 15], 14, 3634488961), v = f(v, S, m, h, n[e + 4], 20, 3889429448), h = f(h, v, S, m, n[e + 9], 5, 568446438), m = f(m, h, v, S, n[e + 14], 9, 3275163606), S = f(S, m, h, v, n[e + 3], 14, 4107603335), v = f(v, S, m, h, n[e + 8], 20, 1163531501), h = f(h, v, S, m, n[e + 13], 5, 2850285829), m = f(m, h, v, S, n[e + 2], 9, 4243563512), S = f(S, m, h, v, n[e + 7], 14, 1735328473), h = i(h, v = f(v, S, m, h, n[e + 12], 20, 2368359562), S, m, n[e + 5], 4, 4294588738), m = i(m, h, v, S, n[e + 8], 11, 2272392833), S = i(S, m, h, v, n[e + 11], 16, 1839030562), v = i(v, S, m, h, n[e + 14], 23, 4259657740), h = i(h, v, S, m, n[e + 1], 4, 2763975236), m = i(m, h, v, S, n[e + 4], 11, 1272893353), S = i(S, m, h, v, n[e + 7], 16, 4139469664), v = i(v, S, m, h, n[e + 10], 23, 3200236656), h = i(h, v, S, m, n[e + 13], 4, 681279174), m = i(m, h, v, S, n[e + 0], 11, 3936430074), S = i(S, m, h, v, n[e + 3], 16, 3572445317), v = i(v, S, m, h, n[e + 6], 23, 76029189), h = i(h, v, S, m, n[e + 9], 4, 3654602809), m = i(m, h, v, S, n[e + 12], 11, 3873151461), S = i(S, m, h, v, n[e + 15], 16, 530742520), h = c(h, v = i(v, S, m, h, n[e + 2], 23, 3299628645), S, m, n[e + 0], 6, 4096336452), m = c(m, h, v, S, n[e + 7], 10, 1126891415), S = c(S, m, h, v, n[e + 14], 15, 2878612391), v = c(v, S, m, h, n[e + 5], 21, 4237533241), h = c(h, v, S, m, n[e + 12], 6, 1700485571), m = c(m, h, v, S, n[e + 3], 10, 2399980690), S = c(S, m, h, v, n[e + 10], 15, 4293915773), v = c(v, S, m, h, n[e + 1], 21, 2240044497), h = c(h, v, S, m, n[e + 8], 6, 1873313359), m = c(m, h, v, S, n[e + 15], 10, 4264355552), S = c(S, m, h, v, n[e + 6], 15, 2734768916), v = c(v, S, m, h, n[e + 13], 21, 1309151649), h = c(h, v, S, m, n[e + 4], 6, 4149444226), m = c(m, h, v, S, n[e + 11], 10, 3174756917), S = c(S, m, h, v, n[e + 2], 15, 718787259), v = c(v, S, m, h, n[e + 9], 21, 3951481745), h = u(h, o), v = u(v, d), S = u(S, l), m = u(m, C); return g(h) + g(v) + g(S) + g(m); } function o(r, n) { return r << n | r >>> 32 - n; } function u(r, n) { var t, e, o, u, a; return o = 2147483648 & r, u = 2147483648 & n, a = (1073741823 & r) + (1073741823 & n), (t = 1073741824 & r) & (e = 1073741824 & n) ? 2147483648 ^ a ^ o ^ u : t | e ? 1073741824 & a ? 3221225472 ^ a ^ o ^ u : 1073741824 ^ a ^ o ^ u : a ^ o ^ u; } function a(r, n, t, e, a, f, i) { return r = u(r, u(u(function (r, n, t) { return r & n | ~r & t; }(n, t, e), a), i)), u(o(r, f), n); } function f(r, n, t, e, a, f, i) { return r = u(r, u(u(function (r, n, t) { return r & t | n & ~t; }(n, t, e), a), i)), u(o(r, f), n); } function i(r, n, t, e, a, f, i) { return r = u(r, u(u(function (r, n, t) { return r ^ n ^ t; }(n, t, e), a), i)), u(o(r, f), n); } function c(r, n, t, e, a, f, i) { return r = u(r, u(u(function (r, n, t) { return n ^ (r | ~t); }(n, t, e), a), i)), u(o(r, f), n); } function g(r) { var n, t = "", e = ""; for (n = 0; n <= 3; n++)
    t += (e = "0" + (r >>> 8 * n & 255).toString(16)).substr(e.length - 2, 2); return t; } var d = { generate: e }; })(), MD5 = n; })();
// export statements removed during build step
//# sourceMappingURL=http://localhost:8080/script.js.map