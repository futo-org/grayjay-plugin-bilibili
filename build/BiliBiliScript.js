const PLATFORM = "BiliBili";
const CONTENT_DETAIL_URL_REGEX = /^https:\/\/(www\.|live\.|t\.|m\.|)bilibili.com\/(bangumi\/play\/ep|video\/|opus\/|cheese\/play\/ep|)(\d+|[0-9a-zA-Z]{12}|av[0-9]{15})(\/|\?|$)/;
const PLAYLIST_URL_REGEX = /^https:\/\/(www|space)\.bilibili.com\/(\d+|)(bangumi\/play\/ss|cheese\/play\/ss|medialist\/detail\/ml|festival\/|\/channel\/collectiondetail\?sid=|\/channel\/seriesdetail\?sid=|\/favlist\?fid=|watchlater\/)(\d+|[0-9a-zA-Z]+|.*#\/list)(\/|\?|$)/;
const SPACE_URL_REGEX = /^https:\/\/space\.bilibili\.com\/(\d+)(\/|\?|$)/;
const VIDEO_URL_PREFIX = "https://www.bilibili.com/video/";
const LIVE_ROOM_URL_PREFIX = "https://live.bilibili.com/";
const SPACE_URL_PREFIX = "https://space.bilibili.com/";
const COLLECTION_URL_PREFIX = "/channel/collectiondetail?sid=";
const SERIES_URL_PREFIX = "/channel/seriesdetail?sid=";
const SEASON_URL_PREFIX = "https://www.bilibili.com/bangumi/play/ss";
const EPISODE_URL_PREFIX = "https://www.bilibili.com/bangumi/play/ep";
const COURSE_URL_PREFIX = "https://www.bilibili.com/cheese/play/ss";
const COURSE_EPISODE_URL_PREFIX = "https://www.bilibili.com/cheese/play/ep";
const FAVORITES_URL_PREFIX = "https://www.bilibili.com/medialist/detail/ml";
const FESTIVAL_URL_PREFIX = "https://www.bilibili.com/festival/";
const POST_URL_PREFIX = "https://t.bilibili.com/";
const WATCH_LATER_URL = "https://www.bilibili.com/watchlater/#/list";
const PREMIUM_CONTENT_MESSAGE = "本片是大会员专享内容";
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0";
const OS = "Linux x86_64"; // others ["Windows", "MacIntel", "Android", "iOS", "Chromium OS", "Ubuntu", "Linux", "Fedora"]
const WEBGL = "WebGL 1.0";
//TODO i think these are named backwards
const WEBGL_VENDOR = "Intel(R) HD Graphics 400, or similar";
const WEBGL_RENDERER = "Intel";
const post_body_for_ExClimbWuzhi = JSON.stringify({
    payload: JSON.stringify({
        "39c8": "333.1368.fp.risk",
        "3c43": {
            "adca": OS,
            "6bc5": WEBGL_VENDOR,
            // PNG on the triangle rendered by the webgl fingerprint library
            "bfe9": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAJkUlEQVR4Xu3dXYgkVxmA4e/09CAhBAURE0JIFpSwF/EvJAi5sEbIRVBQCKKCXgQFBc1FQFFQmG6TiyASQcEIEfRCRRRURFQU7FHxB1Yzy8yyA7OLm2R1jYkYzSa7JBun5Ouq3q7uru6u6qquOj/vc73MLGztyzlfn1NtBAAcYRz5ewIAwQLgDlZYAJxBsAA4g2ABcAbBAuAMggXAGQQLgDMIFgBnECwAziBYAJxBsAA4g2ABcAbBAuAMggXAGQQLgDMIFgBnECwAziBYAJxBsFC7K7FEXZHIGOnV/sMRNIKF2qXBGojIljGyU/svQLAIFmp3FMvAiET6g43hGUN9CBZqlw2WiPTZGqIuBAu1O4olnnqwiBZqQbBQK51fbchwSziNaKEygoVavRLLoKOfEOb/VIbwqIRgoVZLgsUQHpUQLNTqlVjijn46OP+n7hgjW7X+UgSDYKE2Or8yMtwSLnuwmGdhJQQLtbmSnr8qECxFtFAawUJtSgZLMYRHKQQLtbmSnr8quMIa4iQ8yiBYqMXl5MLz8PxVNljx8nkWQ3gURrBQi8ux9Loi29PBKoh5FgohWKjFy+nAfcVgKaKFpQgWavFS5vxVmRnWFKKFhQgWKtP5VSdz/qpCsBjCg2BhvV5M51ejUFUJlghDeMzHCguVXU4vPNcULMXWELkIFiq7nM6vagwW0QLBQv0upuevNFY1B4toYQYrLFSi86uOyHB+tYZgMYTHBIKFSi5lLjyvI1gM4ZFFsFDJpcz9wTUFi60hriJYWJnOr0bvb1/XljCDTw5BsLC6i7H0NjL3B9e4whohWoFjhYWVvZD5wokGVlgjvEMrYAQLK3th6v5gAyssxetoAkawsJLnYok2p+4PNhQsxdYwUAQLK2k5WEQrUAQLK3k+5/5ggyusEVZagSFYWMnzOfcHWwiWYggfEIKF0nQ7qOevpj8ZbClYXN8JCMFCabYFiyF8OAgWStP5lcjwLaMTq6q2Vlgp5lkBIFgo7b9z7g+2HCxWWgEgWChFt4P6/vbRt+NkI2VBsBRDeI8RLJTiQLAYwnuMYKGU5xbcH7RkhaW4vuMpgoVSHAkW8yxPESwU9mzm/e0Wz7Cy+OTQMwQLhTkYLMUQ3iMEC4X9O/P+dkdWWEPG8Jz7gmChMFeDxRDeHwQLheh2UM9fLTrdbtGnhHmYZ3mAYKEQD4KliJbjCBYKeTbz/qt5p9stX2GNEC2HESwUYmewNJFHhf7+WQzh3UWwsNQ/MuevHJ5hZXES3lEEC0t5GCzF1tBBBAtLPZM5f+XJCmuEaDmGYGEpj4PFSssxBAtLPTP1wj7HPyWcwRDeHQQLC+n8Sr9wInsVx7dgcRLeHQQLCz19JINOLJHnwdLTEX2zKT0eB7sRLCwO1svD6zj+B0vF0jevIlo2I1hYHKxLEk9vAT3cEo5ptK4lWrYiWJjr/EWJNtMLz95vCSdtmetkh0fDPgQLc134T7IdDGqFldgxr5EtHg37ECzMD9a/JoPVTf+k11vCEd0avo6toW0IFuYH65/J/CrAFVZCPzm8gWjZhGAh1/nzEm108l/YZ8UKK9Z3Hzfwj6fRuolo2aKJf3I46MJTMpB0fhXsCmvkf7JljjGEtwHBQq4L5whWljnG/xUbECzk+vsZied9M44VW8Km6dbwVraGbSNYmHH+QKKOmbw/GNg5rHz6yeFxotUmgoUZT+5Lr2tkmxVWDo3WbUSrLQQLsyusvdkLz6ywMo5ky7yVIXwbCBZmg/X47P3BNoLV1MmFVZi38X+nDQQLE879UaLuRnL+ii3hQjvmTq7vNI1gYTJYv5detyPbBKsA/eTwLuZZTSJYmPDU74afDs5ceG5jS+gEjdY7iFZTCBYmPLmTf3+QYC0Qy5bZYgjfBIKFq879SqLOnPuDlYNl8wS9Kl1l3c0qqwkEC+Ng/Vx6nXR+tf4Zlj56WjHHaazuIVZNIVi46omfjedX6w+W4/QA6bsIVdMIFsbB+sn8+4OVt4S+0FC9h1C1hWBh6MyPkve3zzt7FXywdOt3L6FqG8FCEqwfSLS54MJzsMHSFdX7CJUtCBaG/vq92e8fnLfaCuL1MhqqDxIq2xAsJMH6zuL7g8GssHTr92FCZSuCBTnzzfH729ufYRk5kni4imvUkfT195n7iJXNCBbkzGMSbSy58Oz1Cku3fx8hVC4gWJCzj+V/Yeq81ZY3Myzd/n2MULmEYEHOPrr8/qBXKywN1ScIlYsIVuAOvpocZ8j7wlTvVli69bufULmMYAXu4MsBBEtD9QCh8gHBCtzhI8n7271cYenW79OEyicEK3CHXxzPr4oM04uGrdUHS1dUnyFUPmr1uUK7Dh4cH2coGqKif66VBytOz1J9jlj5qpXnCnYYBkvGA3enV1i6/dsmVL4jWAE73DYDkfjq/Mq5YOnTq6H6AqEKBcEK2OHnZSDpF04U3eoV/XMNPFh98xChCk0DzxVsdPBZiTpTr5NxYoWlA/WHCVWoCFagDj7lWLA0VF8iVKEjWIE6eEAGHSNR2Ss3LWwJ++YRQoUEwQrUwf15wTJi0le7WPAlFH3zFUKFSQQrQPuflKgbJ8cZrFthjc5SfY1YYRbBCtD+xyXqpuev1h2sI5EyL+Prm68TKsxHsAJ0+qPj7x9cd7AK6ptvECosR7ACdPo+S4Kln/x9i1ChOIIVmP0PJccZ8j7ta+wclobq24QK5RGswOx/QKJOp7Vg9c13CRVWR7ACc+r94+1gY58S6orq+4QK1RGswJy6t8Fgaah+SKhQH4IVmFPvlbjKu9qLnHQ3Iv3h6u3HxAr1IlgB2X23RJsyXGHlhqeOobuI9Dd/SqiwHgQrIHv3JN8/uI5g6fbvml8QKqwXwQrI3t2z9werHhzV7d+1vyRUaAbBCsjeO5MvnKhjhaVbv1f/mlChWQQrELuRRBs5F57LrrB06/fa3xIqtINgBeLkXcn8atUVVhxL//V/IFRoF8EKxMm3rxYsnVHd8CdCBTsQrECcvGP8halFZli69dPV2I1/JlawB8EKwO5bJDJzLjznzbA0VjefJFSwD8EKwF/eJL0Nke0Cp9T7x/YIFexFsAKwe1wGxiQD97yhu86p3niaUMF+BCsAu7fm3x/Urd/xQ0IFdxAsz514Q/L+9uysKhbp33aWUME9BMtzJ26RXldkW/+hdev35icIFdxFsDz3+E0yiGP5ze1/I1RwH8Hy3InrpXfH08QKfiBYAJxBsAA4g2ABcAbBAuAMggXAGQQLgDMIFgBn/B/aIiC1CbViVwAAAABJRU5ErkJggg=="
                .slice(-50),
            "b8ce": USER_AGENT
        },
    })
});
const WATCH_LATER_ID = "WATCH_LATER";
const local_http = http;
const local_utility = utility;
// TODO review hardcoded values
const HARDCODED_THUMBNAIL_QUALITY = 1080;
const EMPTY_AUTHOR = new PlatformAuthorLink(new PlatformID(PLATFORM, "", plugin.config.id), "", "");
const MISSING_NAME = "";
const HARDCODED_ZERO = 0;
const MISSING_RATING = 0;
const NAME_LOAD_FAILED = "Name Load Failed";
// set missing constants
Type.Order.Chronological = "Latest releases";
Type.Order.Views = "Most played";
Type.Order.Favorites = "Most favorited";
// align with the rest of the plugin use Simplified Chinese
Type.Order.Chronological = "最新发布";
Type.Order.Views = "最多播放";
Type.Order.Favorites = "最多收藏";
/** A local cache of values unique to each plugin instance (some of this data should be saved as state shared among instances) */
let local_storage_cache;
/** State */
let local_state;
//#endregion
//#region source methods
const local_source = {
    enable,
    disable,
    saveState,
    getHome,
    searchSuggestions,
    search,
    getSearchCapabilities,
    isContentDetailsUrl,
    getContentDetails,
    isChannelUrl,
    getChannel,
    getChannelContents,
    getChannelCapabilities,
    searchChannelContents,
    getSearchChannelContentsCapabilities,
    getChannelPlaylists,
    searchChannels,
    getComments,
    getSubComments,
    isPlaylistUrl,
    getPlaylist,
    searchPlaylists,
    getLiveChatWindow,
    getUserPlaylists,
    getUserSubscriptions
};
init_source(local_source);
function init_source(local_source) {
    for (const method_key of Object.keys(local_source)) {
        // @ts-expect-error assign to readonly constant source object
        source[method_key] = local_source[method_key];
    }
}
//#endregion
//#region enable
function enable(conf, settings, savedState) {
    if (IS_TESTING) {
        log("IS_TESTING true");
        log("logging configuration");
        log(conf);
        log("logging settings");
        log(settings);
        log("logging savedState");
        log(savedState);
    }
    if (!savedState) {
        init_local_storage();
    }
    else {
        const state = JSON.parse(savedState);
        init_local_storage(state);
    }
}
function init_session_info() {
    const vendor_and_renderer = WEBGL_VENDOR + WEBGL_RENDERER + "g";
    let dm_cover_img_str = local_utility.toBase64(string_to_bytes(vendor_and_renderer));
    {
        // add missing padding
        const missing_padding = (4 - dm_cover_img_str.length % 4) % 4;
        dm_cover_img_str += "=".repeat(missing_padding);
    }
    // chop the end off
    dm_cover_img_str = dm_cover_img_str.slice(0, dm_cover_img_str.length - 2);
    let dm_img_str = local_utility.toBase64(string_to_bytes(WEBGL));
    {
        // add missing padding
        const missing_padding = (4 - dm_img_str.length % 4) % 4;
        dm_img_str += "=".repeat(missing_padding);
    }
    // chop the end off
    dm_img_str = dm_img_str.slice(0, dm_img_str.length - 2);
    const value_one = get_random_int_inclusive(100, 1000);
    const winWidth = get_random_int_inclusive(50, 5000);
    const winHeight = get_random_int_inclusive(50, 5000);
    const value_two = get_random_int_inclusive(5, 500);
    const wh = [2 * winWidth + 2 * winHeight + 3 * value_two, 4 * winWidth - winHeight + value_two, value_two];
    const dm_img_inter = `{"ds":[],"wh":[${wh[0]},${wh[1]},${wh[2]}],"of":[${value_one},${value_one * 2},${value_one}]}`;
    const b_nut = create_b_nut();
    const requests = [{
            request: mixin_constant_request,
            process: process_mixin_constant
        }, {
            request(builder) { return nav_request(false, builder); },
            process: process_wbi_keys
        }, {
            request: cookie_request,
            process(response) { return JSON.parse(response.body); }
        }];
    const [mixin_constant, { wbi_img_key, wbi_sub_key }, finger_spi_response] = execute_requests(requests);
    const buvid3 = finger_spi_response.data.b_3;
    const buvid4 = finger_spi_response.data.b_4;
    // required to access space posts
    activate_cookies(b_nut, buvid3, buvid4);
    return {
        buvid3,
        buvid4,
        b_nut,
        mixin_key: getMixinKey(wbi_img_key + wbi_sub_key, mixin_constant),
        dm_cover_img_str,
        dm_img_str,
        dm_img_inter
    };
}
function init_local_storage(state) {
    // these caches don't work that well because they aren't shared between plugin instances
    // saveState is what we need
    local_storage_cache = {
        cid_cache: new Map(),
        space_cache: new Map()
    };
    local_state = state === undefined ? init_session_info() : state;
}
function nav_request(useAuthClient, builder) {
    const url = "https://api.bilibili.com/x/web-interface/nav";
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(url, {}, useAuthClient);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function mixin_constant_request(builder) {
    const url = "https://s1.hdslb.com/bfs/seed/laputa-header/bili-header.umd.js";
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(url, {}, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function process_mixin_constant(html) {
    const mixin_constant_regex = /function getPictureHashKey\(e\){var t=\[\];return(.*?)\.forEach\(\(function\(r\){e\.charAt\(r\)&&t\.push\(e\.charAt\(r\)\)}\)\),t\.join\(""\)\.slice\(0,32\)}/;
    const mixin_constant_json = html.body.match(mixin_constant_regex)?.[1];
    if (mixin_constant_json === undefined) {
        throw new ScriptException("failed to acquire mixin_constant");
    }
    const mixin_constant = JSON.parse(mixin_constant_json);
    return mixin_constant;
}
function process_wbi_keys(raw_response) {
    const response = JSON.parse(raw_response.body);
    return {
        wbi_img_key: response.data.wbi_img.img_url.slice(29, 61),
        wbi_sub_key: response.data.wbi_img.sub_url.slice(29, 61)
    };
}
function cookie_request(builder) {
    const finger_spi_url = "https://api.bilibili.com/x/frontend/finger/spi";
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(finger_spi_url, {}, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
/**
 * Activates cookies to be usable to load channel posts
 * @param b_nut
 * @param buvid3
 * @param buvid4
 */
function activate_cookies(b_nut, buvid3, buvid4) {
    const cookie_activation_url = "https://api.bilibili.com/x/internal/gaia-gateway/ExClimbWuzhi";
    const body = post_body_for_ExClimbWuzhi;
    const now = Date.now();
    local_http.POST(cookie_activation_url, body, {
        Cookie: `buvid3=${buvid3}; buvid4=${buvid4}; b_nut=${b_nut}`,
        "User-Agent": USER_AGENT,
        Host: "api.bilibili.com",
        "Content-Length": body.length.toString(),
        "Content-Type": "application/json"
    }, false);
    log(`buvid3=${buvid3}; buvid4=${buvid4}; b_nut=${b_nut}`);
    log_network_call(now);
}
/**
 * https://s1.hdslb.com/bfs/seed/laputa-header/bili-header.umd.js
 * @param e
 * @param encryption_info
 * @returns
 */
function getMixinKey(e, encryption_info) {
    return encryption_info.filter(function (value) {
        return e[value] !== undefined;
    }).map(function (value) {
        return e[value];
    }).join("").slice(0, 32);
}
function create_b_nut() {
    return Math.floor((new Date).getTime() / 1e3);
}
//#endregion
function disable() {
    log("BiliBili log: disabling");
}
function saveState() {
    return JSON.stringify(local_state);
}
//#region home
function getHome() {
    return new HomePager(0, 12);
}
class HomePager extends VideoPager {
    next_page;
    page_size;
    constructor(initial_page, page_size) {
        super(format_home(get_home(initial_page, page_size)), true);
        this.next_page = initial_page + 1;
        this.page_size = page_size;
    }
    nextPage() {
        this.results = format_home(get_home(this.next_page, this.page_size));
        this.hasMore = true;
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return true;
    }
}
/**
 *
 * @param page The page to load (starts at 0)
 * @param page_size
 * @returns
 */
function get_home(page, page_size) {
    const home_api_url = "https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd";
    const fresh_type = "4";
    const feed_version = "V_WATCHLATER_PIP_WINDOW3";
    const params = {
        fresh_idx: page.toString(),
        ps: page_size.toString(),
        fresh_type,
        feed_version,
        fresh_idx_1h: page.toString(),
        brush: page.toString(),
    };
    const url = create_url(home_api_url, params).toString();
    const now = Date.now();
    // use auth client so that logged in users get a personalized home feed
    const home_json = local_http.GET(url, { Referer: "https://www.bilibili.com", Cookie: `buvid3=${local_state.buvid3}` }, true).body;
    log_network_call(now);
    const home_response = JSON.parse(home_json);
    return home_response;
}
function format_home(home) {
    if (home === null) {
        log("BiliBili log: home is null please investigate");
        return [];
    }
    return home.data.item.flatMap(function (item) {
        switch (item.goto) {
            case "ad":
                return [];
            case "av": {
                // update cid cache
                local_storage_cache.cid_cache.set(item.bvid, item.cid);
                const fan_count = local_storage_cache.space_cache.get(item.owner.mid)?.num_fans;
                const video_id = new PlatformID(PLATFORM, item.bvid, plugin.config.id);
                const author_id = new PlatformID(PLATFORM, item.owner.mid.toString(), plugin.config.id);
                return [new PlatformVideo({
                        id: video_id,
                        name: item.title,
                        url: item.uri,
                        thumbnails: new Thumbnails([new Thumbnail(item.pic, HARDCODED_THUMBNAIL_QUALITY)]),
                        author: new PlatformAuthorLink(author_id, item.owner.name, `${SPACE_URL_PREFIX}${item.owner.mid}`, item.owner.face, fan_count),
                        duration: item.duration,
                        viewCount: item.stat.view,
                        isLive: false,
                        shareUrl: item.uri,
                        datetime: item.pubdate
                    })];
            }
            case "live": {
                const fan_count = local_storage_cache.space_cache.get(item.owner.mid)?.num_fans;
                const room_id = new PlatformID(PLATFORM, item.id.toString(), plugin.config.id);
                const author_id = new PlatformID(PLATFORM, item.owner.mid.toString(), plugin.config.id);
                return [new PlatformVideo({
                        id: room_id,
                        name: item.title,
                        url: `${LIVE_ROOM_URL_PREFIX}${item.id}`,
                        thumbnails: new Thumbnails([new Thumbnail(item.pic, HARDCODED_THUMBNAIL_QUALITY)]),
                        author: new PlatformAuthorLink(author_id, item.owner.name, `${SPACE_URL_PREFIX}${item.owner.mid}`, item.owner.face, fan_count),
                        viewCount: item.room_info.watched_show.num,
                        isLive: true,
                        shareUrl: `${LIVE_ROOM_URL_PREFIX}${item.id}`,
                        // TODO load from cache
                        datetime: HARDCODED_ZERO
                    })];
            }
            default:
                throw assert_exhaustive(item, `unhandled type on home page item ${item}`);
        }
    });
}
//#endregion
//#region search
function searchSuggestions(query) {
    return get_suggestions(query);
}
function get_suggestions(query) {
    const suggestions_url = "https://s.search.bilibili.com/main/suggest";
    const params = {
        func: "suggest",
        suggest_type: "accurate",
        sub_type: "tag",
        term: query
    };
    const url = create_url(suggestions_url, params).toString();
    const now = Date.now();
    const suggestions_json = local_http.GET(url, {}, false).body;
    log_network_call(now);
    const suggestions_response = JSON.parse(suggestions_json);
    return suggestions_response.result.tag.map(function (entry) { return entry.term; });
}
function getSearchCapabilities() {
    return new ResultCapabilities([Type.Feed.Mixed], [Type.Order.Chronological, Type.Order.Views, Type.Order.Favorites], 
    // TODO implement category filtering
    [new FilterGroup("期间", // Duration
        [
            new FilterCapability("全部时长", "0", "全部时长"), // full duration
            new FilterCapability("10分钟以下", "1", "10分钟以下"), // Under 10 minutes
            new FilterCapability("10-30分钟", "2", "10-30分钟"), // 10-30 minutes
            new FilterCapability("30-60分钟", "3", "30-60分钟"), // 30-60 minutes
            new FilterCapability("60分钟以上", "4", "60分钟以上"), // More than 60 minutes
        ], false, "DURATION_FILTER")]);
}
function search(query, type, order, filters) {
    if (type === null) {
        type = Type.Feed.Mixed;
    }
    const query_order = (function (order) {
        switch (order) {
            case null:
                return undefined;
            case Type.Order.Chronological:
                return "pubdate";
            case Type.Order.Views:
                return "click";
            case Type.Order.Favorites:
                return "stow";
            default:
                throw new ScriptException(`unhandled feed order ${order}`);
        }
    })(order);
    const duration = (function (filters) {
        if (filters === null) {
            return undefined;
        }
        const filter = filters["DURATION_FILTER"];
        if (filter === undefined) {
            return undefined;
        }
        const value = filter[0];
        if (value === undefined) {
            return undefined;
        }
        switch (value) {
            case "0":
                return undefined;
            case "1":
                return 1;
            case "2":
                return 2;
            case "3":
                return 3;
            case "4":
                return 4;
            default:
                throw new ScriptException(`unhandled feed filter ${filters}`);
        }
    })(filters);
    switch (type) {
        case Type.Feed.Mixed: {
            const live_pager = new SearchPager(query, 1, 42, "live", query_order, duration);
            const video_pager = new SearchPager(query, 1, 42, "video", query_order, duration);
            const movie_pager = new SearchPager(query, 1, 42, "media_ft", query_order, duration);
            const show_pager = new SearchPager(query, 1, 42, "media_bangumi", query_order, duration);
            return new CompositeContentPager([live_pager, video_pager, movie_pager, show_pager]);
        }
        default:
            throw assert_exhaustive(type, "unreachable");
    }
}
class SearchPager extends VideoPager {
    next_page;
    page_size;
    query;
    type;
    order;
    duration;
    /**
     * Whole site search pager supporting many different content types
     * @param query
     * @param initial_page
     * @param page_size
     * @param type
     * @param order
     * @param duration
     */
    constructor(query, initial_page, page_size, type, order, duration) {
        const raw_response = search_request(query, initial_page, page_size, type, order, duration);
        const { search_results, more } = extract_search_results(raw_response, type, initial_page, page_size);
        if (search_results === null) {
            super([], false);
        }
        else {
            super(format_search_results(search_results), more);
        }
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.query = query;
        if (order !== undefined) {
            this.order = order;
        }
        if (duration !== undefined) {
            this.duration = duration;
        }
        this.type = type;
    }
    nextPage() {
        const raw_response = search_request(this.query, this.next_page, this.page_size, this.type, this.order, this.duration);
        const { search_results, more } = extract_search_results(raw_response, this.type, this.next_page, this.page_size);
        if (search_results === null) {
            this.results = [];
            this.hasMore = false;
        }
        else {
            this.results = format_search_results(search_results);
            this.hasMore = more;
        }
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function search_request(query, page, page_size, type, order, duration, builder) {
    const search_prefix = "https://api.bilibili.com/x/web-interface/wbi/search/type";
    let params = {
        search_type: type,
        page: page.toString(),
        page_size: page_size.toString(),
        keyword: query,
    };
    if (order !== undefined) {
        params = { ...params, order };
    }
    if (duration !== undefined) {
        params = { ...params, duration: duration.toString() };
    }
    const search_url = create_signed_url(search_prefix, params).toString();
    const buvid3 = local_state.buvid3;
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(search_url, { "User-Agent": USER_AGENT, Cookie: `buvid3=${buvid3}; buvid4=${local_state.buvid4}; b_nut=${local_state.b_nut}` }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
/**
 *
 * @param raw_response
 * @param type
 * @param page
 * @param page_size
 * @returns SearchResultItems and whether there are more results
 */
function extract_search_results(raw_response, type, page, page_size) {
    if (type === "live") {
        const results = JSON.parse(raw_response.body);
        if ("v_voucher" in results.data) {
            throw new ScriptException("unable to load live video search results");
        }
        return {
            search_results: results.data.result === undefined ? null : results.data.result.live_room,
            more: results.data.pageinfo.live_room.total > page * page_size
        };
    }
    const results = JSON.parse(raw_response.body);
    return {
        search_results: results.data.result === undefined ? null : results.data.result,
        more: results.data.numResults > page * page_size
    };
}
/**
 * Extracts plain text from HTML content using regex with entity handling
 * @param html HTML content to parse
 * @returns Plain text with entities decoded and whitespace normalized
 */
function parseTextFromHtml(html) {
    if (!html?.trim())
        return "";
    try {
        // First, remove HTML tags
        let text = html.replace(/<[^>]*>/g, ' ');
        // Handle common HTML entities
        text = text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&nbsp;/g, ' ');
        // Handle numeric entities (decimal and hex)
        text = text
            .replace(/&#(\d+);/g, (_match, dec) => {
            try {
                return String.fromCharCode(parseInt(dec, 10));
            }
            catch (e) {
                console.error(`Invalid decimal entity: &#${dec};`);
                return '';
            }
        })
            .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => {
            try {
                return String.fromCharCode(parseInt(hex, 16));
            }
            catch (e) {
                console.error(`Invalid hex entity: &#x${hex};`);
                return '';
            }
        });
        // Normalize whitespace
        return text.replace(/\s+/g, ' ').trim();
    }
    catch (error) {
        log("BiliBili log: error parsing html");
        log(error);
        log(html);
        return html;
    }
}
function format_search_results(results) {
    return results.map(function (item) {
        switch (item.type) {
            case "video": {
                const url = `${VIDEO_URL_PREFIX}${item.bvid}`;
                const video_id = new PlatformID(PLATFORM, item.bvid, plugin.config.id);
                const author_id = new PlatformID(PLATFORM, item.mid.toString(), plugin.config.id);
                const duration = parse_minutes_seconds(item.duration);
                return new PlatformVideo({
                    id: video_id,
                    name: parseTextFromHtml(item.title),
                    url: url,
                    thumbnails: new Thumbnails([new Thumbnail(`https:${item.pic}`, HARDCODED_THUMBNAIL_QUALITY)]),
                    author: new PlatformAuthorLink(author_id, item.author, `${SPACE_URL_PREFIX}${item.mid}`, item.upic, local_storage_cache.space_cache.get(item.mid)?.num_fans),
                    duration,
                    viewCount: item.play,
                    isLive: false,
                    shareUrl: url,
                    datetime: item.pubdate
                });
            }
            case "live_room": {
                const url = `${LIVE_ROOM_URL_PREFIX}${item.roomid}`;
                const video_id = new PlatformID(PLATFORM, item.roomid.toString(), plugin.config.id);
                const author_id = new PlatformID(PLATFORM, item.uid.toString(), plugin.config.id);
                return new PlatformVideo({
                    id: video_id,
                    name: parseTextFromHtml(item.title),
                    url: url,
                    thumbnails: new Thumbnails([new Thumbnail(`https:${item.user_cover}`, HARDCODED_THUMBNAIL_QUALITY)]),
                    author: new PlatformAuthorLink(author_id, item.uname, `${SPACE_URL_PREFIX}${item.uid}`, `https:${item.uface}`, local_storage_cache.space_cache.get(item.uid)?.num_fans),
                    viewCount: item.watched_show.num,
                    isLive: true,
                    shareUrl: url,
                    // TODO assumes China timezone
                    datetime: (new Date(`${item.live_time} UTC+8`)).getTime() / 1000
                });
            }
            // TODO once the main search results support playlists courses and shows should return playlists
            case "ketang": {
                const season_id = item.id;
                const course_response = JSON.parse(course_request({ type: "season", id: season_id }).body);
                const season = format_course(season_id, course_response);
                const episode = season.contents.results[0];
                if (episode === undefined) {
                    throw new ScriptException("missing episodes");
                }
                return episode;
            }
            case "media_bangumi": {
                const first_episode = item.eps[0];
                if (first_episode === undefined) {
                    throw new ScriptException("unreachable");
                }
                const url = `${EPISODE_URL_PREFIX}${first_episode.id}`;
                const video_id = new PlatformID(PLATFORM, first_episode.id.toString(), plugin.config.id);
                return new PlatformVideo({
                    id: video_id,
                    name: parseTextFromHtml(item.title),
                    url: url,
                    // TODO figure out if we should include both thumbnails
                    thumbnails: new Thumbnails([
                        new Thumbnail(first_episode.cover, HARDCODED_THUMBNAIL_QUALITY),
                        new Thumbnail(item.cover, HARDCODED_THUMBNAIL_QUALITY)
                    ]),
                    author: EMPTY_AUTHOR,
                    viewCount: HARDCODED_ZERO,
                    isLive: false,
                    shareUrl: url,
                    // TODO assumes China timezone
                    datetime: item.pubtime
                });
            }
            case "media_ft": {
                let first_episode;
                if (item.eps === null) {
                    if (item.ep_size !== 0) {
                        throw new ScriptException("unreachable");
                    }
                    const url = item.url;
                    const { content_id } = parse_content_details_url(url);
                    first_episode = {
                        cover: undefined,
                        id: parseInt(content_id)
                    };
                }
                else {
                    first_episode = item.eps[0];
                }
                if (first_episode === undefined) {
                    throw new ScriptException("unreachable");
                }
                const url = `${EPISODE_URL_PREFIX}${first_episode.id}`;
                const video_id = new PlatformID(PLATFORM, first_episode.id.toString(), plugin.config.id);
                const thumbnails = [new Thumbnail(item.cover, HARDCODED_THUMBNAIL_QUALITY)];
                if (first_episode.cover !== undefined) {
                    thumbnails.push(new Thumbnail(first_episode.cover, HARDCODED_THUMBNAIL_QUALITY));
                }
                return new PlatformVideo({
                    id: video_id,
                    name: parseTextFromHtml(item.title),
                    url: url,
                    // TODO figure out if we should include both thumbnails
                    thumbnails: new Thumbnails(thumbnails),
                    author: EMPTY_AUTHOR,
                    viewCount: HARDCODED_ZERO,
                    isLive: false,
                    shareUrl: url,
                    // TODO assumes China timezone
                    datetime: item.pubtime
                });
            }
            case "bili_user":
                throw new ScriptException("unreachable");
            default:
                throw assert_exhaustive(item, "unreachable");
        }
    });
}
//#endregion
//#region channel
function searchChannels(query) {
    return new SpacePager(query, 1, 36);
}
class SpacePager extends ChannelPager {
    query;
    next_page;
    page_size;
    constructor(query, initial_page, page_size) {
        const raw_response = search_request(query, initial_page, page_size, "bili_user", undefined, undefined);
        const { search_results, more } = extract_search_results(raw_response, "bili_user", initial_page, page_size);
        if (search_results === null) {
            super([], false);
        }
        else {
            super(format_space_results(search_results), more);
        }
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.query = query;
    }
    nextPage() {
        const raw_response = search_request(this.query, this.next_page, this.page_size, "bili_user", undefined, undefined);
        const { search_results, more } = extract_search_results(raw_response, "bili_user", this.next_page, this.page_size);
        if (search_results === null) {
            throw new ScriptException("unreachable");
        }
        this.hasMore = more;
        this.results = format_space_results(search_results);
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function format_space_results(space_search_results) {
    return space_search_results.map(function (result) {
        if (result.type !== "bili_user") {
            throw new ScriptException("unreachable");
        }
        return new PlatformChannel({
            id: new PlatformID(PLATFORM, result.mid.toString(), plugin.config.id),
            name: result.uname,
            thumbnail: `https:${result.upic}`,
            subscribers: result.fans,
            description: result.usign,
            url: `${SPACE_URL_PREFIX}${result.mid}`
        });
    });
}
// example of handled urls
// https://space.bilibili.com/491461718
function isChannelUrl(url) {
    // Some playlist urls are also Space urls
    // for example
    // https://space.bilibili.com/491461718/favlist?fid=3153093518
    if (PLAYLIST_URL_REGEX.test(url)) {
        return false;
    }
    return SPACE_URL_REGEX.test(url);
}
function getChannel(url) {
    const space_id = parse_space_url(url);
    const requests = [{
            request(builder) { return space_request(space_id, builder); },
            process(response) { return JSON.parse(response.body); }
        }, {
            request(builder) { return fan_count_request(space_id, builder); },
            process(response) { return JSON.parse(response.body); }
        }];
    const [space, fan_count_response] = execute_requests(requests);
    if (space.code !== 0) {
        log("BiliBili log: Failed loading space info");
        return new PlatformChannel({
            id: new PlatformID(PLATFORM, space_id.toString(), plugin.config.id),
            name: NAME_LOAD_FAILED,
            thumbnail: "",
            url: `${SPACE_URL_PREFIX}${space_id}`,
        });
    }
    // cache results
    local_storage_cache.space_cache.set(space_id, {
        num_fans: fan_count_response.data.follower,
        name: space.data.name,
        face: space.data.face,
        live_room: space.data.live_room === null ? null : {
            title: space.data.live_room.title,
            roomid: space.data.live_room.roomid,
            live_status: space.data.live_room.liveStatus === 1,
            cover: space.data.live_room.cover, watched_show: {
                num: space.data.live_room.watched_show.num
            }
        }
    });
    const is_default_banner = new RegExp(/cb1c3ef50e22b6096fde67febe863494caefebad/).test(space.data.top_photo);
    const channel = new PlatformChannel({
        id: new PlatformID(PLATFORM, space_id.toString(), plugin.config.id),
        name: space.data.name,
        thumbnail: space.data.face,
        subscribers: fan_count_response.data.follower,
        description: space.data.sign,
        url: `${SPACE_URL_PREFIX}${space_id}`,
    });
    return is_default_banner ? channel : {
        ...channel, banner: space.data.top_photo
    };
}
function parse_space_url(url) {
    const match_results = url.match(SPACE_URL_REGEX);
    if (match_results === null) {
        throw new ScriptException(`malformed space url: ${url}`);
    }
    const maybe_space_id = match_results[1];
    if (maybe_space_id === undefined) {
        throw new ScriptException("unreachable regex error");
    }
    const space_id = parseInt(maybe_space_id);
    return space_id;
}
function fan_count_request(space_id, builder) {
    const space_stat_url_prefix = "https://api.bilibili.com/x/relation/stat";
    const url = create_url(space_stat_url_prefix, {
        vmid: space_id.toString()
    }).toString();
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(url, {}, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function space_request(space_id, builder) {
    const space_stat_url_prefix = "https://api.bilibili.com/x/space/wbi/acc/info";
    const params = {
        mid: space_id.toString(),
    };
    const url = create_signed_url(space_stat_url_prefix, params).toString();
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(url, {
        Referer: "https://space.bilibili.com",
        Host: "api.bilibili.com",
        "User-Agent": USER_AGENT,
        Cookie: `buvid3=${local_state.buvid3}; buvid4=${local_state.buvid4}; b_nut=${local_state.b_nut}`
    }, true);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
//#endregion
//#region channel contents
function getChannelCapabilities() {
    return new ResultCapabilities([
        Type.Feed.Mixed,
        Type.Feed.Live,
        Type.Feed.Videos,
    ], [
        Type.Order.Chronological,
        Type.Order.Favorites,
        Type.Order.Views
    ], []);
}
function getChannelContents(url, type, order, filters) {
    if (type === null) {
        type = Type.Feed.Mixed;
    }
    if (filters !== null) {
        throw new ScriptException("unreachable");
    }
    if (order !== null && type !== Type.Feed.Videos) {
        log("BiliBili log: order only applies to videos");
    }
    const space_id = parse_space_url(url);
    switch (type) {
        case Type.Feed.Videos:
            return new SpaceVideosContentPager(space_id, 1, 25, order === null ? Type.Order.Chronological : order);
        case Type.Feed.Mixed: {
            const posts_pager = new SpacePostsContentPager(space_id);
            const videos_pager = new SpaceVideosContentPager(space_id, 1, 25, order === null ? Type.Order.Chronological : order);
            const live_pager = get_space_live_pager(space_id);
            return new CompositeContentPager([live_pager, videos_pager, posts_pager]);
        }
        case Type.Feed.Live: {
            return get_space_live_pager(space_id);
        }
        default:
            throw assert_exhaustive(type, "unreachable");
    }
}
function get_space_live_pager(space_id) {
    let space_info = local_storage_cache.space_cache.get(space_id);
    if (space_info === undefined) {
        const requests = [{
                request(builder) { return space_request(space_id, builder); },
                process(response) { return JSON.parse(response.body); }
            }, {
                request(builder) { return fan_count_request(space_id, builder); },
                process(response) { return JSON.parse(response.body); }
            }];
        const [space, fan_count_response] = execute_requests(requests);
        if (space.code !== 0) {
            log("BiliBili log: Failed loading space info");
            return new VideoPager([], false);
        }
        space_info = {
            num_fans: fan_count_response.data.follower,
            name: space.data.name,
            face: space.data.face,
            live_room: space.data.live_room === null ? null : {
                title: space.data.live_room.title,
                roomid: space.data.live_room.roomid,
                live_status: space.data.live_room.liveStatus === 1,
                cover: space.data.live_room.cover, watched_show: {
                    num: space.data.live_room.watched_show.num
                }
            }
        };
        // cache results
        local_storage_cache.space_cache.set(space_id, space_info);
    }
    const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
    const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
    const live_room = space_info.live_room !== null
        && space_info.live_room.live_status === true
        ? [new PlatformVideo({
                id: new PlatformID(PLATFORM, space_info.live_room.roomid.toString(), plugin.config.id),
                name: space_info.live_room.title,
                url: `${LIVE_ROOM_URL_PREFIX}${space_info.live_room.roomid}`,
                thumbnails: new Thumbnails([new Thumbnail(space_info.live_room.cover, HARDCODED_THUMBNAIL_QUALITY)]),
                author,
                viewCount: space_info.live_room.watched_show.num,
                isLive: true,
                shareUrl: `${LIVE_ROOM_URL_PREFIX}${space_info.live_room.roomid}`,
                // TODO load from cache. "now" is incorrect but it does result in sorting to the top
                // It would be better however to load the actual stream start time
                datetime: Date.now() / 1000
            })]
        : [];
    return new VideoPager(live_room, false);
}
class SpaceCollectionsContentPager extends PlaylistPager {
    next_page;
    page_size;
    space_info;
    space_id;
    constructor(space_id, initial_page, page_size) {
        let space_info = local_storage_cache.space_cache.get(space_id);
        let space_collections_response;
        if (space_info === undefined) {
            const requests = [
                {
                    request(builder) {
                        return space_collections_request(space_id, initial_page, page_size, builder);
                    },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return space_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return fan_count_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }
            ];
            const results = execute_requests(requests);
            const space = results[1];
            if (space.code !== 0) {
                throw new ScriptException("Failed to load space info");
            }
            space_info = {
                num_fans: results[2].data.follower,
                name: space.data.name,
                face: space.data.face,
                live_room: space.data.live_room === null ? null : {
                    title: space.data.live_room.title,
                    roomid: space.data.live_room.roomid,
                    live_status: space.data.live_room.liveStatus === 1,
                    cover: space.data.live_room.cover, watched_show: {
                        num: space.data.live_room.watched_show.num
                    }
                }
            };
            local_storage_cache.space_cache.set(space_id, space_info);
            space_collections_response = results[0];
        }
        else {
            space_collections_response = JSON.parse(space_collections_request(space_id, initial_page, page_size).body);
        }
        const has_more = space_collections_response.data.items_lists.page.total > initial_page * page_size;
        super(format_space_collections(space_collections_response, space_id, space_info), has_more);
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.space_id = space_id;
        this.space_info = space_info;
    }
    nextPage() {
        const space_collections_response = JSON.parse(space_collections_request(this.space_id, this.next_page, this.page_size).body);
        this.results = format_space_collections(space_collections_response, this.space_id, this.space_info);
        this.hasMore = space_collections_response.data.items_lists.page.total > this.next_page * this.page_size;
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function space_collections_request(space_id, page, page_size, builder) {
    const collection_prefix = "https://api.bilibili.com/x/polymer/web-space/seasons_series_list";
    const params = {
        mid: space_id.toString(),
        page_num: page.toString(),
        page_size: page_size.toString()
    };
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(create_signed_url(collection_prefix, params).toString(), { Cookie: `buvid3=${local_state.buvid3}` }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function format_space_collections(space_collections_response, space_id, space_info) {
    const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
    const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
    return space_collections_response.data.items_lists.seasons_list.map(function (season) {
        return new PlatformPlaylist({
            id: new PlatformID(PLATFORM, season.meta.season_id.toString(), plugin.config.id),
            name: season.meta.name,
            author,
            url: `${SPACE_URL_PREFIX}${space_id}${COLLECTION_URL_PREFIX}${season.meta.season_id}`,
            videoCount: season.meta.total,
            thumbnail: season.meta.cover
        });
    }).concat(space_collections_response.data.items_lists.series_list.map(function (series) {
        return new PlatformPlaylist({
            id: new PlatformID(PLATFORM, series.meta.series_id.toString(), plugin.config.id),
            name: series.meta.name,
            author,
            url: `${SPACE_URL_PREFIX}${space_id}${SERIES_URL_PREFIX}${series.meta.series_id}`,
            videoCount: series.meta.total,
            thumbnail: series.meta.cover
        });
    }));
}
class SpaceBangumiContentPager extends PlaylistPager {
    type;
    next_page;
    page_size;
    space_info;
    space_id;
    /**
     *
     * @param space_id
     * @param initial_page
     * @param page_size
     * @param type i'm not entirely sure what this does i think it's a different type of bangumi
     */
    constructor(space_id, initial_page, page_size, type) {
        let space_info = local_storage_cache.space_cache.get(space_id);
        let space_bangumi_response;
        if (space_info === undefined) {
            const requests = [
                {
                    request(builder) { return space_bangumi_request(space_id, initial_page, page_size, type, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return space_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return fan_count_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }
            ];
            const results = execute_requests(requests);
            const space = results[1];
            if (space.code !== 0) {
                throw new ScriptException("Failed to load space info");
            }
            space_info = {
                num_fans: results[2].data.follower,
                name: space.data.name,
                face: space.data.face,
                live_room: space.data.live_room === null ? null : {
                    title: space.data.live_room.title,
                    roomid: space.data.live_room.roomid,
                    live_status: space.data.live_room.liveStatus === 1,
                    cover: space.data.live_room.cover, watched_show: {
                        num: space.data.live_room.watched_show.num
                    }
                }
            };
            local_storage_cache.space_cache.set(space_id, space_info);
            space_bangumi_response = results[0];
        }
        else {
            space_bangumi_response = JSON.parse(space_bangumi_request(space_id, initial_page, page_size, type).body);
        }
        const has_more = space_bangumi_response.data.total > space_bangumi_response.data.ps * space_bangumi_response.data.pn;
        super(format_space_bangumi(space_bangumi_response, space_id, space_info), has_more);
        this.type = type;
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.space_id = space_id;
        this.space_info = space_info;
    }
    nextPage() {
        const space_bangumi_response = JSON.parse(space_bangumi_request(this.space_id, this.next_page, this.page_size, this.type).body);
        this.results = format_space_bangumi(space_bangumi_response, this.space_id, this.space_info);
        this.hasMore = space_bangumi_response.data.total > space_bangumi_response.data.ps * space_bangumi_response.data.pn;
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function space_bangumi_request(space_id, page, page_size, type, builder) {
    const course_prefix = "https://api.bilibili.com/x/space/bangumi/follow/list";
    const params = {
        vmid: space_id.toString(),
        pn: page.toString(),
        ps: page_size.toString(),
        type: type.toString()
    };
    const url = create_url(course_prefix, params).toString();
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(url, {}, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function format_space_bangumi(space_courses_response, space_id, space_info) {
    const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
    const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
    return space_courses_response.data.list.map(function (season) {
        return new PlatformPlaylist({
            id: new PlatformID(PLATFORM, season.season_id.toString(), plugin.config.id),
            name: season.title,
            author,
            url: `${SEASON_URL_PREFIX}${season.season_id}`,
            videoCount: season.formal_ep_count,
            thumbnail: season.cover,
            thumbnails: new Thumbnails([new Thumbnail(season.cover, HARDCODED_THUMBNAIL_QUALITY)]),
            datetime: new Date(season.publish.release_date).getTime() / 1000
        });
    });
}
class SpaceCoursesContentPager extends PlaylistPager {
    next_page;
    page_size;
    space_info;
    space_id;
    constructor(space_id, initial_page, page_size) {
        let space_info = local_storage_cache.space_cache.get(space_id);
        let space_courses_response;
        if (space_info === undefined) {
            const requests = [
                {
                    request(builder) { return space_courses_request(space_id, initial_page, page_size, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return space_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return fan_count_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }
            ];
            const results = execute_requests(requests);
            const space = results[1];
            if (space.code !== 0) {
                throw new ScriptException("Failed to load space info");
            }
            space_info = {
                num_fans: results[2].data.follower,
                name: space.data.name,
                face: space.data.face,
                live_room: space.data.live_room === null ? null : {
                    title: space.data.live_room.title,
                    roomid: space.data.live_room.roomid,
                    live_status: space.data.live_room.liveStatus === 1,
                    cover: space.data.live_room.cover, watched_show: {
                        num: space.data.live_room.watched_show.num
                    }
                }
            };
            local_storage_cache.space_cache.set(space_id, space_info);
            space_courses_response = results[0];
        }
        else {
            space_courses_response = JSON.parse(space_courses_request(space_id, initial_page, page_size).body);
        }
        const has_more = space_courses_response.data.page.next;
        super(format_space_courses(space_courses_response, space_id, space_info), has_more);
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.space_id = space_id;
        this.space_info = space_info;
    }
    nextPage() {
        const space_courses_response = JSON.parse(space_courses_request(this.space_id, this.next_page, this.page_size).body);
        this.results = format_space_courses(space_courses_response, this.space_id, this.space_info);
        this.hasMore = space_courses_response.data.page.next;
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function space_courses_request(space_id, page, page_size, builder) {
    const course_prefix = "https://api.bilibili.com/pugv/app/web/season/page";
    const params = {
        mid: space_id.toString(),
        pn: page.toString(),
        ps: page_size.toString()
    };
    const url = create_url(course_prefix, params).toString();
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(url, {}, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function format_space_courses(space_courses_response, space_id, space_info) {
    const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
    const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
    return space_courses_response.data.items.map(function (course) {
        return new PlatformPlaylist({
            id: new PlatformID(PLATFORM, course.season_id.toString(), plugin.config.id),
            name: course.title,
            author,
            url: `${COURSE_URL_PREFIX}${course.season_id}`,
            videoCount: course.ep_count,
            thumbnail: course.cover
        });
    });
}
class SpaceVideosContentPager extends VideoPager {
    page_size;
    next_page;
    space_info;
    space_id;
    constructor(space_id, initial_page, page_size, order) {
        let space_info = local_storage_cache.space_cache.get(space_id);
        let space_videos_response;
        if (space_info === undefined) {
            const requests = [{
                    request(builder) {
                        return space_videos_request(space_id, initial_page, page_size, undefined, order, builder);
                    },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return space_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return fan_count_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }];
            const results = execute_requests(requests);
            const space = results[1];
            if (space.code !== 0) {
                throw new ScriptException("Failed to load space info");
            }
            space_info = {
                num_fans: results[2].data.follower,
                name: space.data.name,
                face: space.data.face,
                live_room: space.data.live_room === null ? null : {
                    title: space.data.live_room.title,
                    roomid: space.data.live_room.roomid,
                    live_status: space.data.live_room.liveStatus === 1,
                    cover: space.data.live_room.cover, watched_show: {
                        num: space.data.live_room.watched_show.num
                    }
                }
            };
            local_storage_cache.space_cache.set(space_id, space_info);
            if (results[0].code === -352) {
                throw new ScriptException("rate limited");
            }
            space_videos_response = results[0];
        }
        else {
            const maybe_space_videos_response = JSON.parse(space_videos_request(space_id, initial_page, page_size, undefined, undefined).body);
            if (maybe_space_videos_response.code === -352) {
                throw new ScriptException("rate limited");
            }
            space_videos_response = maybe_space_videos_response;
        }
        const has_more = space_videos_response.data.page.count > initial_page * page_size;
        super(format_space_videos(space_videos_response, space_id, space_info), has_more);
        this.next_page = 2;
        this.space_id = space_id;
        this.page_size = page_size;
        this.space_info = space_info;
    }
    nextPage() {
        const maybe_space_videos_response = JSON.parse(space_videos_request(this.space_id, this.next_page, this.page_size, undefined, undefined).body);
        if (maybe_space_videos_response.code === -352) {
            throw new ScriptException("rate limited");
        }
        const space_search_response = maybe_space_videos_response;
        this.results = format_space_videos(space_search_response, this.space_id, this.space_info);
        this.hasMore = space_search_response.data.page.count > this.next_page * this.page_size;
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function space_videos_request(space_id, page, page_size, keyword, order, builder) {
    const space_contents_search_prefix = "https://api.bilibili.com/x/space/wbi/arc/search";
    let params = {
        mid: space_id.toString(),
        pn: page.toString(),
        ps: page_size.toString()
    };
    if (order !== undefined) {
        params = {
            ...params,
            order: (function (order) {
                switch (order) {
                    case Type.Order.Chronological:
                        return "pubdate";
                    case Type.Order.Favorites:
                        return "stow";
                    case Type.Order.Views:
                        return "click";
                    case "CHRONOLOGICAL":
                        return "pubdate";
                    default:
                        throw new ScriptException(`unhandled ordering ${order}`);
                }
            })(order)
        };
    }
    if (keyword !== undefined) {
        params = { ...params, keyword };
    }
    const url = create_signed_url(space_contents_search_prefix, params).toString();
    const b_nut = local_state.b_nut;
    const buvid4 = local_state.buvid4;
    const buvid3 = local_state.buvid3;
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    // use the authenticated client because BiliBili blocks logged out users
    const result = runner.GET(url, {
        "User-Agent": USER_AGENT,
        Cookie: `buvid3=${buvid3}; buvid4=${buvid4}; b_nut=${b_nut}`,
        Host: "api.bilibili.com",
        Referer: "https://space.bilibili.com"
    }, true);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function format_space_videos(space_videos_response, space_id, space_info) {
    const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
    const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
    return space_videos_response.data.list.vlist.map(function (space_video) {
        const url = `${VIDEO_URL_PREFIX}${space_video.bvid}`;
        const video_id = new PlatformID(PLATFORM, space_video.bvid, plugin.config.id);
        const duration = parse_minutes_seconds(space_video.length);
        return new PlatformVideo({
            id: video_id,
            name: space_video.title,
            url: url,
            thumbnails: new Thumbnails([new Thumbnail(space_video.pic, HARDCODED_THUMBNAIL_QUALITY)]),
            author,
            duration,
            viewCount: space_video.play === "--" ? 0 : space_video.play,
            isLive: false,
            shareUrl: url,
            datetime: space_video.created
        });
    });
}
class SpacePostsContentPager extends ContentPager {
    posts_offset;
    space_info;
    space_id;
    constructor(space_id) {
        let space_info = local_storage_cache.space_cache.get(space_id);
        let space_posts_response;
        if (space_info === undefined) {
            const requests = [
                {
                    request(builder) { return space_posts_request(space_id, undefined, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return space_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return fan_count_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }
            ];
            const results = execute_requests(requests);
            const space = results[1];
            if (space.code !== 0) {
                throw new ScriptException("Failed to load space info");
            }
            space_info = {
                num_fans: results[2].data.follower,
                name: space.data.name,
                face: space.data.face,
                live_room: space.data.live_room === null ? null : {
                    title: space.data.live_room.title,
                    roomid: space.data.live_room.roomid,
                    live_status: space.data.live_room.liveStatus === 1,
                    cover: space.data.live_room.cover, watched_show: {
                        num: space.data.live_room.watched_show.num
                    }
                }
            };
            local_storage_cache.space_cache.set(space_id, space_info);
            space_posts_response = results[0];
        }
        else {
            space_posts_response = JSON.parse(space_posts_request(space_id, undefined).body);
        }
        if (space_posts_response.code === -352) {
            throw new LoginRequiredException("rate limited: login or wait to view more posts");
        }
        const has_more = space_posts_response.data.has_more;
        super(format_space_posts(space_posts_response, space_id, space_info), has_more);
        this.posts_offset = space_posts_response.data.offset;
        this.space_id = space_id;
        this.space_info = space_info;
    }
    nextPage() {
        const space_posts_response = JSON.parse(space_posts_request(this.space_id, this.posts_offset).body);
        if (space_posts_response.code === -352) {
            throw new LoginRequiredException("rate limited: login or wait to view more posts");
        }
        this.results = format_space_posts(space_posts_response, this.space_id, this.space_info);
        this.hasMore = space_posts_response.data.has_more;
        this.posts_offset = space_posts_response.data.offset;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function space_posts_request(space_id, offset, builder) {
    const space_post_feed_prefix = "https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space";
    const params = offset ? {
        host_mid: space_id.toString(),
        offset: offset.toString()
    } : {
        host_mid: space_id.toString()
    };
    const url = create_signed_url(space_post_feed_prefix, params).toString();
    const buvid3 = local_state.buvid3;
    const buvid4 = local_state.buvid4;
    const b_nut = local_state.b_nut;
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    // use the authenticated client because BiliBili blocks logged out users
    const result = runner.GET(url, {
        Host: "api.bilibili.com",
        Cookie: `buvid3=${buvid3}; buvid4=${buvid4}; b_nut=${b_nut}`,
        Referer: "https://space.bilibili.com",
        "User-Agent": USER_AGENT
    }, true);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function format_space_posts(space_posts_response, space_id, space_info) {
    const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
    const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
    return space_posts_response.data.items.flatMap(function (space_post) {
        // ignore video posts (because it creates duplicate items in the combined feed)
        if (space_post.type === "DYNAMIC_TYPE_AV") {
            return [];
        }
        const desc = space_post.modules.module_dynamic.desc;
        const images = [];
        const thumbnails = [];
        const primary_content = desc?.rich_text_nodes.map(function (node) { return format_text_node(node, images, thumbnails); }).join("");
        const major = space_post.modules.module_dynamic.major;
        const major_links = major !== null ? format_major(major, thumbnails, images) : undefined;
        const topic = space_post.modules.module_dynamic.topic;
        const topic_string = topic ? `<a href="${topic?.jump_url}">${topic.name}</a>\n` : undefined;
        const reference = space_post.orig;
        const reference_string = reference ? `<a href="${`${POST_URL_PREFIX}${reference.id_str}`}">${POST_URL_PREFIX}${reference.id_str}</a>` : undefined;
        const content = (primary_content ? primary_content + "\n" : "") + (topic_string ?? "") + (major_links ?? "") + (reference_string ?? "");
        return [new PlatformPostDetails({
                thumbnails,
                images,
                description: content,
                // as far as i can tell posts don't have names
                name: MISSING_NAME,
                url: `${POST_URL_PREFIX}${space_post.id_str}`,
                id: new PlatformID(PLATFORM, space_post.id_str, plugin.config.id),
                rating: new RatingLikes(space_post.modules.module_stat.like.count),
                textType: Type.Text.HTML,
                author,
                content,
                datetime: space_post.modules.module_author.pub_ts
            })];
    });
}
function space_favorites_request(space_id, builder) {
    const favorites_prefix = "https://api.bilibili.com/x/v3/fav/folder/created/list-all";
    const params = {
        up_mid: space_id.toString()
    };
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    // use the authenticated client so logged in users can view their private favorites lists
    const result = runner.GET(create_url(favorites_prefix, params).toString(), { "User-Agent": USER_AGENT }, true);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function format_space_favorites(space_favorites_response, space_id, space_info) {
    const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
    const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
    if (space_favorites_response.data !== null && space_favorites_response.data.list !== null) {
        return space_favorites_response.data.list.map(function (favorite_list) {
            return new PlatformPlaylist({
                id: new PlatformID(PLATFORM, favorite_list.id.toString(), plugin.config.id),
                name: favorite_list.title,
                author,
                url: `${FAVORITES_URL_PREFIX}${favorite_list.id}`,
                videoCount: favorite_list.media_count,
                // thumbnail: TODO MISSING_THUMBNAIL
            });
        });
    }
    return [];
}
// TODO the order and filtering only applies to videos not posts but there is not a way of specifying that
function getSearchChannelContentsCapabilities() {
    // TODO there are filter options but they only show up after a search has been returned
    return new ResultCapabilities([Type.Feed.Mixed], [Type.Order.Chronological, Type.Order.Views, Type.Order.Favorites], []);
}
function searchChannelContents(space_url, query, type, order, filters) {
    if (type === null) {
        type = Type.Feed.Mixed;
    }
    if (order === null) {
        order = Type.Order.Chronological;
    }
    if (filters !== null && Object.keys(filters).length !== 0) {
        throw new ScriptException("unreachable");
    }
    const space_id = parse_space_url(space_url);
    const page_size = 30;
    const initial_page = 1;
    order = order === null ? Type.Order.Chronological : order;
    switch (type) {
        case Type.Feed.Mixed: {
            const posts_pager = new ChannelPostsResultsPager(query, space_id, initial_page, page_size);
            const videos_pager = new ChannelVideoResultsPager(query, space_id, initial_page, page_size, order);
            return new CompositeContentPager([videos_pager, posts_pager]);
        }
        default:
            throw new ScriptException("unreachable");
    }
}
class ChannelPostsResultsPager extends ContentPager {
    next_page;
    page_size;
    space_id;
    query;
    constructor(query, space_id, initial_page, page_size) {
        const response = search_space_posts(query, space_id, initial_page, page_size);
        const more = response.data.total > initial_page * page_size;
        super(format_post_search_result(response), more);
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.space_id = space_id;
        this.query = query;
    }
    nextPage() {
        const response = search_space_posts(this.query, this.space_id, this.next_page, this.page_size);
        this.results = format_post_search_result(response);
        this.hasMore = response.data.total > this.next_page * this.page_size;
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function search_space_posts(query, space_id, page, page_size) {
    const space_contents_search_prefix = "https://api.bilibili.com/x/space/dynamic/search";
    const params = {
        mid: space_id.toString(),
        keyword: query,
        pn: page.toString(),
        ps: page_size.toString(),
    };
    const url = create_url(space_contents_search_prefix, params).toString();
    const now = Date.now();
    const json = local_http.GET(url, {}, false).body;
    log_network_call(now);
    const search_response = JSON.parse(json);
    return search_response;
}
// TODO the post search results are really hard to parse. might be best to just load whole posts
// directly
function format_post_search_result(response) {
    const space_posts_response = response;
    if (space_posts_response.data.cards === null) {
        return [];
    }
    return space_posts_response.data.cards.map(function (card) {
        const post = JSON.parse(card.card);
        const space_id = card.desc.user_profile.info.uid;
        const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
        const author = new PlatformAuthorLink(author_id, card.desc.user_profile.info.uname, `${SPACE_URL_PREFIX}${space_id}`, card.desc.user_profile.info.face, local_storage_cache.space_cache.get(space_id)?.num_fans);
        return new PlatformPost({
            thumbnails: [new Thumbnails([])],
            images: [],
            description: (post.dynamic ?? "") + (post.item?.content ?? "") + (post.item?.description ?? ""),
            // as far as i can tell posts don't have names
            name: MISSING_NAME,
            url: `${POST_URL_PREFIX}${card.desc.dynamic_id_str}`,
            id: new PlatformID(PLATFORM, card.desc.dynamic_id_str, plugin.config.id),
            author,
            datetime: card.desc.timestamp
        });
    });
}
class ChannelVideoResultsPager extends ContentPager {
    next_page;
    page_size;
    space_id;
    query;
    order;
    space_info;
    constructor(query, space_id, initial_page, page_size, order) {
        let space_info = local_storage_cache.space_cache.get(space_id);
        let search_response;
        if (space_info === undefined) {
            const requests = [{
                    request(builder) { return space_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return fan_count_request(space_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) {
                        return space_videos_request(space_id, initial_page, page_size, query, order, builder);
                    },
                    process(response) { return JSON.parse(response.body); }
                }];
            const [space, fan_count_response, local_search_response] = execute_requests(requests);
            if (local_search_response.code === -352) {
                throw new ScriptException("rate limited");
            }
            if (space.code !== 0) {
                throw new ScriptException("Failed to load space info");
            }
            search_response = local_search_response;
            space_info = {
                num_fans: fan_count_response.data.follower,
                name: space.data.name,
                face: space.data.face,
                live_room: space.data.live_room === null ? null : {
                    title: space.data.live_room.title,
                    roomid: space.data.live_room.roomid,
                    live_status: space.data.live_room.liveStatus === 1,
                    cover: space.data.live_room.cover, watched_show: {
                        num: space.data.live_room.watched_show.num
                    }
                }
            };
            local_storage_cache.space_cache.set(space_id, space_info);
        }
        else {
            const local_search_response = JSON.parse(space_videos_request(space_id, initial_page, page_size, query, order).body);
            if (local_search_response.code === -352) {
                throw new ScriptException("rate limited");
            }
            search_response = local_search_response;
        }
        const more = search_response.data.page.count > initial_page * page_size;
        super(format_space_videos(search_response, space_id, space_info), more);
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.space_id = space_id;
        this.query = query;
        this.order = order;
        this.space_info = space_info;
    }
    nextPage() {
        const search_response = JSON.parse(space_videos_request(this.space_id, this.next_page, this.page_size, this.query, this.order).body);
        if (search_response.code === -352) {
            throw new ScriptException("rate limited");
        }
        this.results = format_space_videos(search_response, this.space_id, this.space_info);
        this.hasMore = search_response.data.page.count > this.next_page * this.page_size;
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function getChannelPlaylists(url) {
    const space_id = parse_space_url(url);
    let space_info = local_storage_cache.space_cache.get(space_id);
    let space_favorites_response;
    if (space_info === undefined) {
        const requests = [
            {
                request(builder) { return space_favorites_request(space_id, builder); },
                process(response) { return JSON.parse(response.body); }
            }, {
                request(builder) { return space_request(space_id, builder); },
                process(response) { return JSON.parse(response.body); }
            }, {
                request(builder) { return fan_count_request(space_id, builder); },
                process(response) { return JSON.parse(response.body); }
            }
        ];
        const results = execute_requests(requests);
        const space = results[1];
        if (space.code !== 0) {
            log("BiliBili log: Failed loading space info");
            return new PlaylistPager([], false);
        }
        space_info = {
            num_fans: results[2].data.follower,
            name: space.data.name,
            face: space.data.face,
            live_room: space.data.live_room === null ? null : {
                title: space.data.live_room.title,
                roomid: space.data.live_room.roomid,
                live_status: space.data.live_room.liveStatus === 1,
                cover: space.data.live_room.cover, watched_show: {
                    num: space.data.live_room.watched_show.num
                }
            }
        };
        local_storage_cache.space_cache.set(space_id, space_info);
        space_favorites_response = results[0];
    }
    else {
        space_favorites_response = JSON.parse(space_favorites_request(space_id).body);
    }
    const formatted_favorites = format_space_favorites(space_favorites_response, space_id, space_info);
    const favorites_pager = new PlaylistPager(formatted_favorites, false);
    const collections_pager = new SpaceCollectionsContentPager(space_id, 1, 20);
    const courses_pager = new SpaceCoursesContentPager(space_id, 1, 15);
    const bangumi_pager_1 = new SpaceBangumiContentPager(space_id, 1, 24, 1);
    const bangumi_pager_2 = new SpaceBangumiContentPager(space_id, 1, 24, 2);
    return new CompositePlaylistPager([bangumi_pager_1, bangumi_pager_2, favorites_pager, collections_pager, courses_pager]);
}
//#endregion
//#region content
// examples of handled urls
// https://www.bilibili.com/bangumi/play/ep510760
// https://live.bilibili.com/26386397
// https://www.bilibili.com/video/BV1M84y1d7S1
// https://www.bilibili.com/opus/916396341363474468
// https://t.bilibili.com/915034213991841801
// https://www.bilibili.com/cheese/play/ep1027
function isContentDetailsUrl(url) {
    return CONTENT_DETAIL_URL_REGEX.test(url);
}
function parse_content_details_url(url) {
    const regex_match_result = url.match(CONTENT_DETAIL_URL_REGEX);
    if (regex_match_result === null) {
        throw new ScriptException(`malformed content url: ${url}`);
    }
    const maybe_subdomain = regex_match_result[1];
    if (maybe_subdomain === undefined) {
        throw new ScriptException("unreachable regex error");
    }
    const subdomain = maybe_subdomain;
    const maybe_content_type = regex_match_result[2];
    if (maybe_content_type === undefined) {
        throw new ScriptException("unreachable regex error");
    }
    const content_type = maybe_content_type;
    const maybe_content_id = regex_match_result[3];
    if (maybe_content_id === undefined) {
        throw new ScriptException("unreachable regex error");
    }
    const content_id = maybe_content_id;
    // handle weird url format
    if (content_type === "video/" && /^av[0-9]{15}$/.test(content_id)) {
        const new_url = local_http.GET(url, {}, false).body.match(/<meta data-vue-meta="true" itemprop="url" content="(.*?)">/)?.[1];
        if (new_url === undefined) {
            throw new ScriptException("unreachable regex error");
        }
        return parse_content_details_url(new_url);
    }
    return { subdomain, content_type, content_id };
}
function getContentDetails(url) {
    const { subdomain, content_type, content_id } = parse_content_details_url(url);
    switch (subdomain) {
        case "live.": {
            // TODO this currently parses the html
            // there are however some json apis that could potentially be used instead
            // https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo
            // https://api.live.bilibili.com/room/v1/Room/get_info
            const room_id = parseInt(content_id);
            const response = livestream_process((livestream_request(room_id)));
            const space_id = response.roomInitRes.data.uid;
            let source;
            // Note: while the there is always the http_hls ts option this is currently not usable and 404s
            // even when forcing it on the website live.bilibili.com my changing the return value of hasHLSPlayerSupportStream
            const codec = response.roomInitRes.data.playurl_info.playurl.stream
                .find(function (stream) { return stream.protocol_name === "http_hls"; })?.format
                .find(function (format) { return format.format_name === "fmp4"; })?.codec[0];
            if (codec !== undefined) {
                const url_info = codec.url_info[0];
                const name = response.roomInitRes.data.playurl_info.playurl.g_qn_desc
                    .find(function (item) { return item.qn === codec.current_qn; })?.desc;
                if (url_info === undefined || name === undefined) {
                    throw new ScriptException("unreachable");
                }
                const video_url = `${url_info.host}${codec.base_url}${url_info.extra}`;
                source = new HLSSource({
                    url: video_url,
                    name,
                });
            }
            else {
                const codec = response.roomInitRes.data.playurl_info.playurl.stream
                    .find(function (stream) { return stream.protocol_name === "http_stream"; })?.format
                    .find(function (format) { return format.format_name === "flv"; })?.codec[0];
                if (codec === undefined) {
                    throw new ScriptException("unreachable");
                }
                const name = response.roomInitRes.data.playurl_info.playurl.g_qn_desc
                    .find(function (item) { return item.qn === codec.current_qn; })?.desc;
                let video_url;
                let hostname;
                for (const url_info of codec.url_info) {
                    const url_host = new URL(url_info.host).hostname;
                    const url = `${url_info.host}${codec.base_url}${url_info.extra}`;
                    const now = Date.now();
                    // if this request returns 404 it takes like 6 seconds to do so.
                    // however if we remove the Referer header then it returns 403 quickly
                    // even though the browser uses the Referer header and gets a 404 we might consider leaving it
                    // off to get the 403 quicker. i'm not doing it now because 200 is expected in the
                    // vast majority of cases
                    const code = http.request("HEAD", url, {
                        Referer: "https://live.bilibili.com"
                    }, false).code;
                    log_network_call(now);
                    if (code === 200) {
                        hostname = url_host;
                        video_url = url;
                        break;
                    }
                }
                if (video_url === undefined || hostname === undefined || name === undefined) {
                    throw new ScriptException("unreachable");
                }
                source = new VideoUrlSource({
                    url: video_url,
                    name,
                    width: HARDCODED_ZERO,
                    height: HARDCODED_ZERO,
                    container: "flv",
                    codec: "avc",
                    bitrate: HARDCODED_ZERO,
                    duration: HARDCODED_ZERO,
                });
            }
            // TODO handle the case where the room is inactive
            // response.roomInfoRes.data.live_status !== 1
            return new PlatformVideoDetails({
                description: response.roomInfoRes.data.news_info.content,
                video: new VideoSourceDescriptor([]),
                rating: new RatingLikes(response.roomInfoRes.data.like_info_v3.total_likes),
                thumbnails: new Thumbnails([
                    new Thumbnail(response.roomInfoRes.data.room_info.cover, HARDCODED_THUMBNAIL_QUALITY)
                ]),
                author: new PlatformAuthorLink(new PlatformID(PLATFORM, space_id.toString(), plugin.config.id), response.roomInfoRes.data.anchor_info.base_info.uname, `${SPACE_URL_PREFIX}${space_id}`, response.roomInfoRes.data.anchor_info.base_info.face, response.roomInfoRes.data.anchor_info.relation_info.attention),
                viewCount: response.roomInfoRes.data.watched_show.num,
                isLive: true,
                shareUrl: `${LIVE_ROOM_URL_PREFIX}${room_id}`,
                datetime: response.roomInfoRes.data.room_info.live_start_time,
                name: response.roomInfoRes.data.room_info.title,
                url: `${LIVE_ROOM_URL_PREFIX}${room_id}`,
                id: new PlatformID(PLATFORM, room_id.toString(), plugin.config.id),
                live: source,
            });
        }
        case "t.": {
            const post_id = content_id;
            return get_post(post_id);
        }
        case "www.": return get_video_details(content_type, content_id);
        case "m.": return get_video_details(content_type, content_id);
        case "": return get_video_details(content_type, content_id);
        default:
            throw assert_exhaustive(subdomain, "unreachable");
    }
}
function get_video_details(content_type, content_id) {
    switch (content_type) {
        // TODO as far as i can tell bangumi don't have subtitles
        case "bangumi/play/ep": {
            const episode_id = parseInt(content_id);
            const requests = [{
                    request(builder) { return episode_play_request(episode_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return season_request({ type: "episode", id: episode_id }, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return episode_info_request(episode_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }];
            const [episode_response, season_response, episode_info_response] = execute_requests(requests);
            // region restricted
            if (episode_response.code === -10403) {
                let message = "非常抱歉，根据版权方要求\n";
                message += "您所在的地区无法观看本片";
                throw new UnavailableException(message);
            }
            // premium content
            if ("durl" in episode_response.result.video_info) {
                throw new UnavailableException(PREMIUM_CONTENT_MESSAGE);
            }
            const { video_sources, audio_sources } = format_sources(episode_response.result.video_info);
            const upload_info = episode_info_response.data.related_up[0];
            if (upload_info === undefined) {
                throw new ScriptException("missing upload information");
            }
            const owner_id = upload_info.mid;
            const episode_season_meta = season_response.result.episodes.find(function (episode) { return episode.ep_id === episode_id; });
            if (episode_season_meta === undefined) {
                throw new ScriptException("episode missing from season");
            }
            const platform_video_ID = new PlatformID(PLATFORM, episode_id.toString(), plugin.config.id);
            const platform_creator_ID = new PlatformID(PLATFORM, owner_id.toString(), plugin.config.id);
            const details = new PlatformVideoDetails({
                id: platform_video_ID,
                name: episode_season_meta.long_title,
                thumbnails: new Thumbnails([new Thumbnail(episode_season_meta.cover, HARDCODED_THUMBNAIL_QUALITY)]),
                author: new PlatformAuthorLink(platform_creator_ID, upload_info.uname, `${SPACE_URL_PREFIX}${owner_id}`, upload_info.avatar, local_storage_cache.space_cache.get(owner_id)?.num_fans),
                duration: episode_response.result.video_info.dash.duration,
                viewCount: episode_info_response.data.stat.view,
                url: `${EPISODE_URL_PREFIX}${episode_id}`,
                isLive: false,
                // TODO this will include HTML tags and render poorly
                description: season_response.result.evaluate,
                video: new UnMuxVideoSourceDescriptor(video_sources, audio_sources),
                rating: new RatingLikes(episode_info_response.data.stat.like),
                shareUrl: `${EPISODE_URL_PREFIX}${episode_id}`,
                datetime: episode_season_meta.pub_time
                // the recommendations are other series which in Grayjay are playlists
                // the recommendations section doesn't currently support playlists
                // the implementation would be similar to courses for the playlists 
                // getContentRecommendations
            });
            return details;
        }
        case "cheese/play/ep": {
            const episode_id = parseInt(content_id);
            const requests = [{
                    request(builder) { return course_play_request(episode_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return course_request({ type: "episode", id: episode_id }, builder); },
                    process(response) { return JSON.parse(response.body); }
                }];
            const [episode_play_response, season_response] = execute_requests(requests);
            // premium content
            if (episode_play_response.code === -403) {
                throw new UnavailableException("Purchase Course");
            }
            if ("durl" in episode_play_response.data) {
                throw new UnavailableException(PREMIUM_CONTENT_MESSAGE);
            }
            const { video_sources, audio_sources } = format_sources(episode_play_response.data);
            const upload_info = season_response.data.up_info;
            if (upload_info === undefined) {
                throw new ScriptException("missing upload information");
            }
            const owner_id = upload_info.mid;
            const episode_season_metadata = season_response.data.episodes.find(function (episode) { return episode.id === episode_id; });
            if (episode_season_metadata === undefined) {
                throw new ScriptException("episode missing from season");
            }
            let subtitles = undefined;
            if (bridge.isLoggedIn()) {
                const subtitles_response = JSON.parse(subtitles_request({ aid: episode_season_metadata.aid }, episode_season_metadata.cid).body);
                subtitles = subtitles_response.data.subtitle.subtitles.map(function (subtitle) {
                    const url = `https:${subtitle.subtitle_url}`;
                    return {
                        url,
                        name: subtitle.lan_doc,
                        getSubtitles() {
                            const json = local_http.GET(url, {}, false).body;
                            const response = JSON.parse(json);
                            return convert_subtitles(response, subtitle.lan_doc);
                        },
                        format: "text/vtt",
                    };
                });
            }
            const platform_video_ID = new PlatformID(PLATFORM, episode_id.toString(), plugin.config.id);
            const platform_creator_ID = new PlatformID(PLATFORM, owner_id.toString(), plugin.config.id);
            const platform_video_details_def = {
                id: platform_video_ID,
                name: episode_season_metadata.title,
                thumbnails: new Thumbnails([new Thumbnail(episode_season_metadata.cover, HARDCODED_THUMBNAIL_QUALITY)]),
                author: new PlatformAuthorLink(platform_creator_ID, upload_info.uname, `${SPACE_URL_PREFIX}${owner_id}`, upload_info.avatar, upload_info.follower),
                duration: episode_play_response.data.dash.duration,
                viewCount: episode_season_metadata.play,
                url: `${COURSE_EPISODE_URL_PREFIX}${episode_id}`,
                isLive: false,
                // TODO this will include HTML tags and render poorly
                description: `${season_response.data.title}\n${season_response.data.subtitle}`,
                video: new UnMuxVideoSourceDescriptor(video_sources, audio_sources),
                // TODO figure out a rating to use. courses/course episodes don't have likes
                rating: new RatingLikes(MISSING_RATING),
                shareUrl: `${COURSE_EPISODE_URL_PREFIX}${episode_id}`,
                datetime: episode_season_metadata.release_date,
                // Note Grayjay doesn't support playlists as content recommendations so this does currently do anything
                getContentRecommendations: function () {
                    return new PlaylistPager(season_response.data.recommend_seasons.map((season) => {
                        log("hi");
                        return new PlatformPlaylist({
                            id: new PlatformID(PLATFORM, season.id.toString(), plugin.config.id),
                            name: season.title,
                            thumbnails: new Thumbnails([new Thumbnail(season.cover, HARDCODED_THUMBNAIL_QUALITY)]),
                            author: EMPTY_AUTHOR,
                            url: `${COURSE_URL_PREFIX}${season.id}`,
                            thumbnail: season.cover
                        });
                    }), false);
                }
            };
            const details = new PlatformVideoDetails(subtitles === undefined ? platform_video_details_def : {
                ...platform_video_details_def,
                subtitles
            });
            return details;
        }
        case "opus/": {
            const post_id = content_id;
            return get_post(post_id);
        }
        case "video/": {
            const video_id = content_id;
            let video_info, play_info, subtitle_response;
            if (bridge.isLoggedIn()) {
                [video_info, play_info, subtitle_response] = load_video_details(video_id, true);
            }
            else {
                [video_info, play_info] = load_video_details(video_id);
            }
            // premium content
            if ("durl" in play_info.data) {
                throw new UnavailableException(PREMIUM_CONTENT_MESSAGE);
            }
            const { video_sources, audio_sources } = format_sources(play_info.data);
            const subtitles = subtitle_response?.data.subtitle.subtitles.map(function (subtitle) {
                const url = `https:${subtitle.subtitle_url}`;
                return {
                    url,
                    name: subtitle.lan_doc,
                    getSubtitles() {
                        const json = local_http.GET(url, {}, false).body;
                        const response = JSON.parse(json);
                        return convert_subtitles(response, subtitle.lan_doc);
                    },
                    format: "text/vtt",
                };
            });
            const description = video_info.data.View.desc_v2 === null
                ? { raw_text: "" }
                : video_info.data.View.desc_v2[0];
            if (description === undefined) {
                throw new ScriptException("missing description");
            }
            const owner_id = video_info.data.View.owner.mid.toString();
            const platform_video_ID = new PlatformID(PLATFORM, video_id, plugin.config.id);
            const platform_creator_ID = new PlatformID(PLATFORM, owner_id, plugin.config.id);
            const platform_video_details_def = {
                id: platform_video_ID,
                name: video_info.data.View.title,
                thumbnails: new Thumbnails([
                    new Thumbnail(video_info.data.View.pic, HARDCODED_THUMBNAIL_QUALITY)
                ]),
                author: new PlatformAuthorLink(platform_creator_ID, video_info.data.View.owner.name, `${SPACE_URL_PREFIX}${video_info.data.View.owner.mid}`, video_info.data.View.owner.face, video_info.data.Card.card.fans),
                duration: play_info.data.dash.duration,
                viewCount: video_info.data.View.stat.view,
                url: `${VIDEO_URL_PREFIX}${video_id}`,
                isLive: false,
                description: description.raw_text,
                video: new UnMuxVideoSourceDescriptor(video_sources, audio_sources),
                rating: new RatingLikes(video_info.data.View.stat.like),
                shareUrl: `${VIDEO_URL_PREFIX}${video_id}`,
                datetime: video_info.data.View.pubdate,
                getContentRecommendations: function () {
                    return new VideoPager(video_info.data.Related.map((video) => {
                        return new PlatformVideo({
                            id: new PlatformID(PLATFORM, video.bvid, plugin.config.id),
                            name: video.title,
                            thumbnails: new Thumbnails([new Thumbnail(video.pic, HARDCODED_THUMBNAIL_QUALITY)]),
                            author: new PlatformAuthorLink(new PlatformID(PLATFORM, video.owner.mid.toString(), plugin.config.id), video.owner.name, `${SPACE_URL_PREFIX}${video_info.data.View.owner.mid}`, video.owner.face),
                            datetime: video.pubdate,
                            url: `${VIDEO_URL_PREFIX}${video.bvid}`,
                            duration: video.duration,
                            viewCount: video.stat.view,
                            isLive: false,
                            shareUrl: `${VIDEO_URL_PREFIX}${video.bvid}`,
                        });
                    }), false);
                }
            };
            if (subtitles === undefined) {
                const details = new PlatformVideoDetails(platform_video_details_def);
                return details;
            }
            const details = new PlatformVideoDetails({ ...platform_video_details_def, subtitles });
            return details;
        }
        default:
            throw assert_exhaustive(content_type, "unreachable");
    }
}
function livestream_request(room_id, builder) {
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(`${LIVE_ROOM_URL_PREFIX}${room_id}`, {}, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function livestream_process(raw_live_response) {
    const live_regex = /<script>window\.__NEPTUNE_IS_MY_WAIFU__=({.*?})<\/script>/;
    const match_result = raw_live_response.body.match(live_regex);
    if (match_result === null) {
        throw new ScriptException("unreachable");
    }
    const json = match_result[1];
    if (json === undefined) {
        throw new ScriptException("unreachable");
    }
    const response = JSON.parse(json);
    return response;
}
/**
 * Downloads and formats a post
 * @param post_id
 * @returns
 */
function get_post(post_id) {
    const post_response = download_post(post_id);
    const space_post = post_response.data.item;
    const desc = space_post.modules.module_dynamic.desc;
    const images = [];
    const thumbnails = [];
    const primary_content = desc?.rich_text_nodes
        .map(function (node) { return format_text_node(node, images, thumbnails); })
        .join("");
    const major = space_post.modules.module_dynamic.major;
    const major_links = major !== null ? format_major(major, thumbnails, images) : undefined;
    const topic = space_post.modules.module_dynamic.topic;
    const topic_string = topic ? `<a href="${topic?.jump_url}">${topic.name}</a>\n` : undefined;
    const content = (primary_content ? primary_content + "\n" : "") + (topic_string ?? "") + (major_links ?? "");
    return new PlatformPostDetails({
        thumbnails,
        images,
        description: content,
        name: MISSING_NAME,
        url: `${POST_URL_PREFIX}${space_post.id_str}`,
        id: new PlatformID(PLATFORM, space_post.id_str, plugin.config.id),
        rating: new RatingLikes(space_post.modules.module_stat.like.count),
        textType: Type.Text.HTML,
        author: new PlatformAuthorLink(new PlatformID(PLATFORM, space_post.modules.module_author.mid.toString(), plugin.config.id), space_post.modules.module_author.name, `${SPACE_URL_PREFIX}${space_post.modules.module_author.mid}`, space_post.modules.module_author.face, local_storage_cache.space_cache.get(space_post.modules.module_author.mid)?.num_fans),
        content,
        datetime: space_post.modules.module_author.pub_ts
    });
}
function download_post(post_id) {
    const single_post_prefix = "https://api.bilibili.com/x/polymer/web-dynamic/v1/detail";
    const params = {
        id: post_id
    };
    const url = create_url(single_post_prefix, params).toString();
    const now = Date.now();
    const json = local_http.GET(url, { Cookie: `buvid3=${local_state.buvid3}`, "User-Agent": USER_AGENT, Host: "api.bilibili.com" }, false).body;
    log_network_call(now);
    const post_response = JSON.parse(json);
    return post_response;
}
/**
 * Formats a text node of a post into HTML
 * @param node
 * @param images Output array for images in the post that corresponds to thumbnails
 * @param thumbnails Output array for thumbnails for the images in the post
 * @returns HTML string
 */
function format_text_node(node, images, thumbnails) {
    switch (node.type) {
        case "RICH_TEXT_NODE_TYPE_TEXT":
            return node.text;
        case "RICH_TEXT_NODE_TYPE_TOPIC":
            return `<a href="${node.jump_url}">${node.text}</a>`;
        case "RICH_TEXT_NODE_TYPE_AV":
            return `<a href="https:${node.jump_url}">${node.text}</a>`;
        // TODO handle image emojis
        case "RICH_TEXT_NODE_TYPE_EMOJI":
            return node.text;
        // TODO handle lotteries
        case "RICH_TEXT_NODE_TYPE_LOTTERY":
            return node.text;
        // TODO handle voting
        case "RICH_TEXT_NODE_TYPE_VOTE":
            return node.text;
        case "RICH_TEXT_NODE_TYPE_VIEW_PICTURE": {
            for (const pic of node.pics) {
                images.push(pic.src);
                thumbnails.push(new Thumbnails([new Thumbnail(pic.src, pic.height)]));
            }
            return "";
        }
        case "RICH_TEXT_NODE_TYPE_AT":
            return `<a href="${SPACE_URL_PREFIX}${node.rid}">${node.text}</a>`;
        case "RICH_TEXT_NODE_TYPE_CV":
            return `<a href="https://www.bilibili.com/read/cv${node.rid}">${node.text}</a>`;
        case "RICH_TEXT_NODE_TYPE_WEB":
            return `<a href="${node.jump_url}">${node.text}</a>`;
        case "RICH_TEXT_NODE_TYPE_GOODS":
            return `<a href="${node.jump_url}">${node.text}</a>`;
        case "RICH_TEXT_NODE_TYPE_MAIL":
            return `<a href="mailto:${node.text}">${node.text}</a>`;
        case "RICH_TEXT_NODE_TYPE_BV":
            return `<a href="${VIDEO_URL_PREFIX}${node.rid}">${node.text}</a>`;
        case "RICH_TEXT_NODE_TYPE_OGV_EP":
            return `<a href="https://www.bilibili.com/bangumi/play/${node.rid}">${node.text}</a>`;
        default:
            throw assert_exhaustive(node, `unhandled type on node ${node}`);
    }
}
function format_major(major, thumbnails, images) {
    switch (major.type) {
        case "MAJOR_TYPE_ARCHIVE":
            images.push(major.archive.cover);
            thumbnails.push(new Thumbnails([new Thumbnail(major.archive.cover, HARDCODED_THUMBNAIL_QUALITY)]));
            return `<a href="${VIDEO_URL_PREFIX}${major.archive.bvid}">${major.archive.title}</a>`;
        case "MAJOR_TYPE_DRAW":
            for (const pic of major.draw.items) {
                images.push(pic.src);
                thumbnails.push(new Thumbnails([new Thumbnail(pic.src, HARDCODED_THUMBNAIL_QUALITY)]));
            }
            return undefined;
        case "MAJOR_TYPE_OPUS":
            for (const pic of major.opus.pics) {
                images.push(pic.url);
                thumbnails.push(new Thumbnails([new Thumbnail(pic.url, HARDCODED_THUMBNAIL_QUALITY)]));
            }
            return major.opus.summary.rich_text_nodes.map(function (node) {
                return format_text_node(node, images, thumbnails);
            }).join("");
        case "MAJOR_TYPE_LIVE_RCMD": {
            const live_rcmd = JSON.parse(major.live_rcmd.content);
            images.push(live_rcmd.live_play_info.cover);
            thumbnails.push(new Thumbnails([new Thumbnail(live_rcmd.live_play_info.cover, HARDCODED_THUMBNAIL_QUALITY)]));
            return `<a href="${LIVE_ROOM_URL_PREFIX}${live_rcmd.live_play_info.room_id}">${live_rcmd.live_play_info.title}</a>`;
        }
        case "MAJOR_TYPE_COMMON": {
            images.push(major.common.cover);
            thumbnails.push(new Thumbnails([new Thumbnail(major.common.cover, HARDCODED_THUMBNAIL_QUALITY)]));
            return `<a href="${major.common.jump_url}">${major.common.title}</a>`;
        }
        case "MAJOR_TYPE_ARTICLE": {
            for (const cover of major.article.covers) {
                images.push(cover);
                thumbnails.push(new Thumbnails([new Thumbnail(cover, HARDCODED_THUMBNAIL_QUALITY)]));
            }
            return `<a href="https://www.bilibili.com/read/cv${major.article.id}">${major.article.title}</a>`;
        }
        case "MAJOR_TYPE_COURSES":
            images.push(major.courses.cover);
            thumbnails.push(new Thumbnails([new Thumbnail(major.courses.cover, HARDCODED_THUMBNAIL_QUALITY)]));
            return `<a href="${COURSE_URL_PREFIX}${major.courses.id}">${major.courses.title}</a>`;
        default:
            throw assert_exhaustive(major, `unhandled type on major ${major}`);
    }
}
function episode_play_request(episode_id, builder) {
    const play_url_prefix = "https://api.bilibili.com/pgc/player/web/v2/playurl";
    const params = {
        fnval: "4048",
        ep_id: episode_id.toString()
    };
    const runner = builder === undefined ? local_http : builder;
    const url = create_url(play_url_prefix, params).toString();
    const now = Date.now();
    const result = runner.GET(url, { "User-Agent": USER_AGENT, Host: "api.bilibili.com" }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function season_request(id_obj, builder) {
    const season_prefix = "https://api.bilibili.com/pgc/view/web/season";
    const params = (function (id_obj) {
        switch (id_obj.type) {
            case "season":
                return {
                    season_id: id_obj.id.toString()
                };
            case "episode":
                return {
                    ep_id: id_obj.id.toString()
                };
            default:
                throw assert_exhaustive(id_obj, "unreachable");
        }
    })(id_obj);
    const season_url = create_url(season_prefix, params);
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(season_url.toString(), {}, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function episode_info_request(episode_id, builder) {
    const episode_info_prefix = "https://api.bilibili.com/pgc/season/episode/web/info";
    const info_params = {
        ep_id: episode_id.toString()
    };
    const runner = builder === undefined ? local_http : builder;
    const url = create_url(episode_info_prefix, info_params).toString();
    const now = Date.now();
    const result = runner.GET(url, {}, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function course_play_request(episode_id, builder) {
    const play_url_prefix = "https://api.bilibili.com/pugv/player/web/playurl";
    const params = {
        fnval: "4048",
        ep_id: episode_id.toString()
    };
    const url = create_url(play_url_prefix, params).toString();
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(url, { "User-Agent": USER_AGENT, Host: "api.bilibili.com" }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function course_request(id_obj, builder) {
    const season_prefix = "https://api.bilibili.com/pugv/view/web/season";
    const params = (function (id_obj) {
        switch (id_obj.type) {
            case "season":
                return {
                    season_id: id_obj.id.toString()
                };
            case "episode":
                return {
                    ep_id: id_obj.id.toString()
                };
            default:
                throw assert_exhaustive(id_obj, "unreachable");
        }
    })(id_obj);
    const season_url = create_url(season_prefix, params);
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(season_url.toString(), {}, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function load_video_details(video_id, is_logged_in = false) {
    const cid = local_storage_cache.cid_cache.get(video_id);
    if (cid === undefined) {
        const detail_response = JSON.parse(video_detail_request(video_id).body);
        if (is_logged_in) {
            const requests = [
                {
                    request(builder) {
                        return video_play_request(video_id, detail_response.data.View.cid, builder);
                    },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) {
                        return subtitles_request({ bvid: video_id }, detail_response.data.View.cid, builder);
                    },
                    process(response) { return JSON.parse(response.body); }
                }
            ];
            const [play_response, subtitles_response] = execute_requests(requests);
            return [detail_response, play_response, subtitles_response];
        }
        const play_response = JSON.parse(video_play_request(video_id, detail_response.data.View.cid).body);
        return [detail_response, play_response];
    }
    else {
        if (is_logged_in) {
            const requests = [
                {
                    request(builder) { return video_detail_request(video_id, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return video_play_request(video_id, cid, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return subtitles_request({ bvid: video_id }, cid, builder); },
                    process(response) { return JSON.parse(response.body); }
                }
            ];
            return execute_requests(requests);
        }
        const requests = [
            {
                request(builder) { return video_detail_request(video_id, builder); },
                process(response) { return JSON.parse(response.body); }
            }, {
                request(builder) { return video_play_request(video_id, cid, builder); },
                process(response) { return JSON.parse(response.body); }
            }
        ];
        return execute_requests(requests);
    }
}
function video_detail_request(bvid, builder) {
    const detail_prefix = "https://api.bilibili.com/x/web-interface/wbi/view/detail";
    const params = {
        bvid
    };
    const url = create_signed_url(detail_prefix, params);
    const buvid3 = local_state.buvid3;
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(url.toString(), {
        Host: "api.bilibili.com",
        "User-Agent": USER_AGENT,
        Referer: "https://www.bilibili.com",
        Cookie: `buvid3=${buvid3}`
    }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function video_play_request(bvid, cid, builder) {
    const play_prefix = "https://api.bilibili.com/x/player/wbi/playurl";
    const params = {
        bvid,
        fnval: "4048",
        cid: cid.toString(),
    };
    const url = create_signed_url(play_prefix, params);
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    // use the authenticated client to get higher resolution videos for logged in users
    const result = runner.GET(url.toString(), { "User-Agent": USER_AGENT }, true);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function subtitles_request(id, cid, builder) {
    const subtitles_prefix = "https://api.bilibili.com/x/player/wbi/v2";
    const params = "bvid" in id ? {
        bvid: id.bvid,
        cid: cid.toString(),
    } : {
        aid: id.aid.toString(),
        cid: cid.toString(),
    };
    const url = create_signed_url(subtitles_prefix, params);
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    // use the authenticated client because login is required to view subtitles
    const result = runner.GET(url.toString(), { "User-Agent": USER_AGENT }, true);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function format_sources(play_data) {
    const video_sources = play_data.dash.video.map(function (video) {
        const name = play_data.accept_description[play_data.accept_quality.findIndex(function (value) {
            return value === video.id;
        })];
        const [initStart, initEnd] = video.segment_base.initialization.split("-").map(function (val) { return parseInt(val); });
        const [indexStart, indexEnd] = video.segment_base.index_range.split("-").map(function (val) { return parseInt(val); });
        if (name === undefined || initStart === undefined || initEnd === undefined || indexStart === undefined || indexEnd === undefined) {
            throw new ScriptException("can't load content details");
        }
        const video_url_hostname = new URL(video.base_url).hostname;
        return new VideoUrlRangeSource({
            width: video.width,
            height: video.height,
            container: video.mime_type,
            codec: video.codecs,
            name: name,
            bitrate: video.bandwidth,
            duration: play_data.dash.duration,
            url: video.base_url,
            itagId: video.id,
            initStart,
            initEnd,
            indexStart,
            indexEnd,
            requestModifier: {
                headers: {
                    "Referer": "https://www.bilibili.com",
                    "Host": video_url_hostname,
                    "User-Agent": USER_AGENT
                }
            }
        });
    });
    const audio_sources = play_data.dash.audio.map(function (audio) {
        const audio_url_hostname = new URL(audio.base_url).hostname;
        const [initStart, initEnd] = audio.segment_base.initialization.split("-").map(function (val) { return parseInt(val); });
        const [indexStart, indexEnd] = audio.segment_base.index_range.split("-").map(function (val) { return parseInt(val); });
        if (initStart === undefined || initEnd === undefined || indexStart === undefined || indexEnd === undefined) {
            throw new ScriptException("can't load content details");
        }
        return new AudioUrlRangeSource({
            container: audio.mime_type,
            codec: audio.codecs,
            name: `${audio.codecs} at ${audio.bandwidth}`,
            bitrate: audio.bandwidth,
            duration: play_data.dash.duration,
            url: audio.base_url,
            language: Language.UNKNOWN,
            itagId: audio.id,
            initStart,
            initEnd,
            indexStart,
            indexEnd,
            audioChannels: 2,
            requestModifier: {
                headers: {
                    "Referer": "https://www.bilibili.com",
                    "Host": audio_url_hostname,
                    "User-Agent": USER_AGENT
                }
            }
        });
    });
    return { audio_sources, video_sources };
}
//#endregion
//#region playlists
// examples of handled urls
// https://www.bilibili.com/bangumi/play/ss2843
// https://www.bilibili.com/cheese/play/ss74
// https://space.bilibili.com/323588182/channel/collectiondetail?sid=2050037
// https://space.bilibili.com/323588182/channel/seriesdetail?sid=3810720
// https://space.bilibili.com/491461718/favlist?fid=3153093518
// https://www.bilibili.com/medialist/detail/ml3153093518
// https://www.bilibili.com/festival/2022bnj
// https://www.bilibili.com/watchlater/#/list or https://www.bilibili.com/watchlater/?spm_id_from=333.999.0.0#/list
function isPlaylistUrl(url) {
    return PLAYLIST_URL_REGEX.test(url);
}
function searchPlaylists(query) {
    return new BangumiPager(query, 1, 12);
}
class BangumiPager extends PlaylistPager {
    query;
    next_page;
    page_size;
    constructor(query, initial_page, page_size) {
        const requests = [{
                request(builder) { return search_request(query, initial_page, page_size, "media_bangumi", undefined, undefined, builder); },
                process(response) { return extract_search_results(response, "media_bangumi", initial_page, page_size); }
            },
            {
                request(builder) { return search_request(query, initial_page, page_size, "media_ft", undefined, undefined, builder); },
                process(response) { return extract_search_results(response, "media_ft", initial_page, page_size); }
            },];
        const results = execute_requests(requests);
        const shows = results[0].search_results;
        const movies = results[1].search_results;
        if (movies === null && shows === null) {
            super([], false);
        }
        else {
            super(format_bangumi_search(shows, movies), results[0].more || results[1].more);
        }
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.query = query;
    }
    nextPage() {
        const requests = [{
                request: (builder) => { return search_request(this.query, this.next_page, this.page_size, "media_bangumi", undefined, undefined, builder); },
                process: (response) => { return extract_search_results(response, "media_bangumi", this.next_page, this.page_size); }
            },
            {
                request: (builder) => { return search_request(this.query, this.next_page, this.page_size, "media_ft", undefined, undefined, builder); },
                process: (response) => { return extract_search_results(response, "media_ft", this.next_page, this.page_size); }
            },];
        const results = execute_requests(requests);
        const shows = results[0].search_results;
        const movies = results[1].search_results;
        this.hasMore = results[0].more || results[1].more;
        this.results = format_bangumi_search(shows, movies);
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function format_bangumi_search(shows, movies) {
    return interleave_two(shows ?? [], movies ?? []).map(function (item) {
        if (item.type === "ketang" || item.type === "video" || item.type === "live_room" || item.type === "bili_user") {
            throw new ScriptException("unreachable");
        }
        return new PlatformPlaylist({
            id: new PlatformID(PLATFORM, item.season_id.toString(), plugin.config.id),
            name: item.title,
            author: EMPTY_AUTHOR,
            url: `${SEASON_URL_PREFIX}${item.season_id}`,
            videoCount: item.ep_size === 0 ? 1 : item.ep_size,
            thumbnail: item.cover,
            datetime: item.pubtime,
        });
    });
}
function getPlaylist(url) {
    const regex_match_result = url.match(PLAYLIST_URL_REGEX);
    if (regex_match_result === null) {
        throw new ScriptException(`malformed space url: ${url}`);
    }
    const maybe_playlist_type = regex_match_result[3];
    if (maybe_playlist_type === undefined) {
        throw new ScriptException("unreachable regex error");
    }
    const playlist_type = maybe_playlist_type;
    const maybe_playlist_id = regex_match_result[4];
    if (maybe_playlist_id === undefined) {
        throw new ScriptException("unreachable regex error");
    }
    switch (playlist_type) {
        case "/channel/collectiondetail?sid=": {
            const maybe_space_id = regex_match_result[2];
            if (maybe_space_id === undefined) {
                throw new ScriptException("unreachable regex error");
            }
            const space_id = parseInt(maybe_space_id);
            const collection_id = parseInt(maybe_playlist_id);
            const page_size = 30;
            const initial_page = 1;
            let collection_response;
            let space_info = local_storage_cache.space_cache.get(space_id);
            if (space_info === undefined) {
                const requests = [{
                        request(builder) { return space_request(space_id, builder); },
                        process(response) { return JSON.parse(response.body); }
                    }, {
                        request(builder) { return fan_count_request(space_id, builder); },
                        process(response) { return JSON.parse(response.body); }
                    }, {
                        request(builder) { return collection_request(space_id, collection_id, initial_page, page_size, builder); },
                        process(response) { return JSON.parse(response.body); }
                    }];
                const results = execute_requests(requests);
                const [space, fan_info] = [results[0], results[1]];
                if (space.code !== 0) {
                    throw new ScriptException("Failed to load space info");
                }
                collection_response = results[2];
                space_info =
                    space_info = {
                        num_fans: fan_info.data.follower,
                        name: space.data.name,
                        face: space.data.face,
                        live_room: space.data.live_room === null ? null : {
                            title: space.data.live_room.title,
                            roomid: space.data.live_room.roomid,
                            live_status: space.data.live_room.liveStatus === 1,
                            cover: space.data.live_room.cover, watched_show: {
                                num: space.data.live_room.watched_show.num
                            }
                        }
                    };
                local_storage_cache.space_cache.set(space_id, space_info);
            }
            else {
                const raw_response = collection_request(space_id, collection_id, initial_page, page_size);
                collection_response = JSON.parse(raw_response.body);
            }
            const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
            const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
            const contents = new CollectionContentsPager(space_id, author, collection_id, collection_response, initial_page, page_size);
            return new PlatformPlaylistDetails({
                id: new PlatformID(PLATFORM, collection_id.toString(), plugin.config.id),
                name: collection_response.data.meta.name,
                author,
                url: `${SPACE_URL_PREFIX}${space_id}${COLLECTION_URL_PREFIX}${collection_id}`,
                contents,
                videoCount: collection_response.data.meta.total,
            });
        }
        case "bangumi/play/ss": {
            const season_id = parseInt(maybe_playlist_id);
            const season_response = JSON.parse(season_request({ id: season_id, type: "season" }).body);
            return format_season(season_id, season_response);
        }
        case "/channel/seriesdetail?sid=": {
            const maybe_space_id = regex_match_result[2];
            if (maybe_space_id === undefined) {
                throw new ScriptException("unreachable regex error");
            }
            const space_id = parseInt(maybe_space_id);
            const series_id = parseInt(maybe_playlist_id);
            const initial_page = 1;
            const page_size = 30;
            let series_response;
            let space_info = local_storage_cache.space_cache.get(space_id);
            if (space_info === undefined) {
                const requests = [{
                        request(builder) { return space_request(space_id, builder); },
                        process(response) { return JSON.parse(response.body); }
                    }, {
                        request(builder) { return fan_count_request(space_id, builder); },
                        process(response) { return JSON.parse(response.body); }
                    }, {
                        request(builder) { return series_request(space_id, series_id, initial_page, page_size, builder); },
                        process(response) { return JSON.parse(response.body); }
                    }];
                const results = execute_requests(requests);
                const [space, fan_info] = [results[0], results[1]];
                if (space.code !== 0) {
                    throw new ScriptException("Failed to load space info");
                }
                series_response = results[2];
                space_info =
                    space_info = {
                        num_fans: fan_info.data.follower,
                        name: space.data.name,
                        face: space.data.face,
                        live_room: space.data.live_room === null ? null : {
                            title: space.data.live_room.title,
                            roomid: space.data.live_room.roomid,
                            live_status: space.data.live_room.liveStatus === 1,
                            cover: space.data.live_room.cover, watched_show: {
                                num: space.data.live_room.watched_show.num
                            }
                        }
                    };
                local_storage_cache.space_cache.set(space_id, space_info);
            }
            else {
                const raw_response = series_request(space_id, series_id, initial_page, page_size);
                series_response = JSON.parse(raw_response.body);
            }
            const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
            const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
            return new PlatformPlaylistDetails({
                id: new PlatformID(PLATFORM, series_id.toString(), plugin.config.id),
                name: MISSING_NAME,
                author,
                url: `${SPACE_URL_PREFIX}${space_id}${SERIES_URL_PREFIX}${series_id}`,
                contents: new SeriesContentsPager(space_id, author, series_id, series_response, initial_page, page_size),
                videoCount: series_response.data.page.total
            });
        }
        case "cheese/play/ss": {
            const season_id = parseInt(maybe_playlist_id);
            const course_response = JSON.parse(course_request({ type: "season", id: season_id }).body);
            return format_course(season_id, course_response);
        }
        case "medialist/detail/ml": {
            const favorites_id = parseInt(maybe_playlist_id);
            return format_favorites(load_favorites(favorites_id, 1, 20));
        }
        case "/favlist?fid=": {
            const favorites_id = parseInt(maybe_playlist_id);
            return format_favorites(load_favorites(favorites_id, 1, 20));
        }
        case "festival/": {
            const festival_id = maybe_playlist_id;
            return format_festival(festival_id, festival_parse(festival_request(festival_id)));
        }
        case "watchlater/": {
            if (!bridge.isLoggedIn()) {
                throw new LoginRequiredException("Login to view watch later");
            }
            const requests = [
                {
                    request(builder) { return nav_request(true, builder); },
                    process(response) { return JSON.parse(response.body); }
                }, {
                    request(builder) { return watch_later_request(true, builder); },
                    process(response) { return JSON.parse(response.body); }
                }
            ];
            const [nav_response, watch_later_response] = execute_requests(requests);
            const videos = watch_later_response.data.list.map(function (video) {
                const url = `${VIDEO_URL_PREFIX}${video.bvid}`;
                // update cid cache
                local_storage_cache.cid_cache.set(video.bvid, video.cid);
                const video_id = new PlatformID(PLATFORM, video.bvid.toString(), plugin.config.id);
                const author = new PlatformAuthorLink(new PlatformID(PLATFORM, video.owner.mid.toString(), plugin.config.id), video.owner.name, `${SPACE_URL_PREFIX}${video.owner.mid}`, video.owner.face, local_storage_cache.space_cache.get(video.owner.mid)?.num_fans);
                return new PlatformVideo({
                    id: video_id,
                    name: video.title,
                    url: url,
                    thumbnails: new Thumbnails([new Thumbnail(video.pic, HARDCODED_THUMBNAIL_QUALITY)]),
                    author,
                    duration: video.duration,
                    viewCount: video.stat.view,
                    isLive: false,
                    shareUrl: url,
                    datetime: video.pubdate
                });
            });
            const first_video = watch_later_response.data.list[0];
            if (first_video === undefined) {
                throw new ScriptException("unreachable");
            }
            const author = new PlatformAuthorLink(new PlatformID(PLATFORM, nav_response.data.mid.toString(), plugin.config.id), nav_response.data.uname, `${SPACE_URL_PREFIX}${nav_response.data.mid}`, nav_response.data.face, local_storage_cache.space_cache.get(nav_response.data.mid)?.num_fans);
            return new PlatformPlaylistDetails({
                id: new PlatformID(PLATFORM, WATCH_LATER_ID, plugin.config.id),
                name: "稍后再看", // Watch Later
                author,
                url: WATCH_LATER_URL,
                contents: new VideoPager(videos, false),
                videoCount: watch_later_response.data.count,
            });
        }
        default:
            throw assert_exhaustive(playlist_type, "unreachable");
    }
}
class CollectionContentsPager extends VideoPager {
    space_id;
    author;
    collection_id;
    next_page;
    page_size;
    constructor(space_id, author, collection_id, collection_response, initial_page, page_size) {
        const more = collection_response.data.meta.total > initial_page * page_size;
        super(format_collection(author, collection_response), more);
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.author = author;
        this.collection_id = collection_id;
        this.space_id = space_id;
    }
    nextPage() {
        const raw_response = collection_request(this.space_id, this.collection_id, this.next_page, this.page_size);
        const collection_response = JSON.parse(raw_response.body);
        this.hasMore = collection_response.data.meta.total > this.next_page * this.page_size;
        this.results = format_collection(this.author, collection_response);
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function format_collection(author, collection_response) {
    const videos = collection_response.data.archives.map(function (video) {
        const url = `${VIDEO_URL_PREFIX}${video.bvid}`;
        const video_id = new PlatformID(PLATFORM, video.bvid, plugin.config.id);
        return new PlatformVideo({
            id: video_id,
            name: video.title,
            url: url,
            thumbnails: new Thumbnails([new Thumbnail(video.pic, HARDCODED_THUMBNAIL_QUALITY)]),
            author,
            duration: video.duration,
            viewCount: video.stat.view,
            isLive: false,
            shareUrl: url,
            datetime: video.pubdate
        });
    });
    return videos;
}
function collection_request(space_id, collection_id, page, page_size, builder) {
    const collection_prefix = "https://api.bilibili.com/x/polymer/web-space/seasons_archives_list";
    const params = {
        mid: space_id.toString(),
        season_id: collection_id.toString(),
        page_num: page.toString(),
        page_size: page_size.toString()
    };
    const playlist_url = create_url(collection_prefix, params);
    const buvid3 = local_state.buvid3;
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(playlist_url.toString(), { Cookie: `buvid3=${buvid3}` }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function format_season(season_id, season_response) {
    const episodes = season_response.result.episodes.map(function (episode) {
        const url = `${EPISODE_URL_PREFIX}${episode.ep_id}`;
        const video_id = new PlatformID(PLATFORM, episode.ep_id.toString(), plugin.config.id);
        // update cid cache
        local_storage_cache.cid_cache.set(episode.bvid, episode.cid);
        return new PlatformVideo({
            id: video_id,
            name: episode.long_title,
            url: url,
            thumbnails: new Thumbnails([new Thumbnail(episode.cover, HARDCODED_THUMBNAIL_QUALITY)]),
            author: EMPTY_AUTHOR,
            duration: episode.duration / 1000,
            viewCount: season_response.result.stat.views,
            isLive: false,
            shareUrl: url,
            datetime: episode.pub_time
        });
    });
    return new PlatformPlaylistDetails({
        id: new PlatformID(PLATFORM, season_id.toString(), plugin.config.id),
        name: season_response.result.title,
        author: EMPTY_AUTHOR,
        url: `${SEASON_URL_PREFIX}${season_id}`,
        contents: new VideoPager(episodes, false),
        videoCount: season_response.result.episodes.length,
    });
}
class SeriesContentsPager extends VideoPager {
    space_id;
    author;
    series_id;
    next_page;
    page_size;
    constructor(space_id, author, series_id, initial_series_response, initial_page, page_size) {
        const more = initial_series_response.data.page.total > initial_page * page_size;
        super(format_series(author, initial_series_response), more);
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.author = author;
        this.series_id = series_id;
        this.space_id = space_id;
    }
    nextPage() {
        const raw_response = series_request(this.space_id, this.series_id, this.next_page, this.page_size);
        const series_response = JSON.parse(raw_response.body);
        this.hasMore = series_response.data.page.total > this.next_page * this.page_size;
        this.results = format_series(this.author, series_response);
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function format_series(author, series_response) {
    const videos = series_response.data.archives.map(function (video) {
        const url = `${VIDEO_URL_PREFIX}${video.bvid}`;
        const video_id = new PlatformID(PLATFORM, video.bvid, plugin.config.id);
        return new PlatformVideo({
            id: video_id,
            name: video.title,
            url: url,
            thumbnails: new Thumbnails([new Thumbnail(video.pic, HARDCODED_THUMBNAIL_QUALITY)]),
            author,
            duration: video.duration,
            viewCount: video.stat.view,
            isLive: false,
            shareUrl: url,
            datetime: video.pubdate
        });
    });
    return videos;
}
function series_request(space_id, series_id, page, page_size, builder) {
    const series_prefix = "https://api.bilibili.com/x/series/archives";
    const params = {
        mid: space_id.toString(),
        series_id: series_id.toString(),
        page_num: page.toString(),
        page_size: page_size.toString()
    };
    const playlist_url = create_url(series_prefix, params);
    const buvid3 = local_state.buvid3;
    const now = Date.now();
    const runner = builder === undefined ? local_http : builder;
    const result = runner.GET(playlist_url.toString(), { Cookie: `buvid3=${buvid3}` }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function format_course(season_id, course_response) {
    const author = new PlatformAuthorLink(new PlatformID(PLATFORM, course_response.data.up_info.mid.toString(), plugin.config.id), course_response.data.up_info.uname, `${SPACE_URL_PREFIX}${course_response.data.up_info.mid}`, course_response.data.up_info.avatar, course_response.data.up_info.follower);
    const episodes = course_response.data.episodes.map(function (episode) {
        const url = `${COURSE_EPISODE_URL_PREFIX}${episode.id}`;
        const video_id = new PlatformID(PLATFORM, episode.id.toString(), plugin.config.id);
        return new PlatformVideo({
            id: video_id,
            name: episode.title,
            url: url,
            thumbnails: new Thumbnails([new Thumbnail(episode.cover, HARDCODED_THUMBNAIL_QUALITY)]),
            author,
            // TODO missing duration
            // duration:
            viewCount: episode.play,
            isLive: false,
            shareUrl: url,
            datetime: episode.release_date
        });
    });
    return new PlatformPlaylistDetails({
        id: new PlatformID(PLATFORM, season_id.toString(), plugin.config.id),
        name: course_response.data.title,
        author,
        url: `${COURSE_URL_PREFIX}${season_id}`,
        contents: new VideoPager(episodes, false),
        videoCount: course_response.data.ep_count,
    });
}
function load_favorites(favorites_id, page, page_size) {
    const series_prefix = "https://api.bilibili.com/x/v3/fav/resource/list";
    const params = {
        media_id: favorites_id.toString(),
        pn: page.toString(),
        ps: page_size.toString()
    };
    const url = create_url(series_prefix, params);
    const buvid3 = local_state.buvid3;
    const now = Date.now();
    // use the authenticated client so logged in users can view their private favorites lists
    const json = local_http.GET(url.toString(), { Cookie: `buvid3=${buvid3}` }, true).body;
    log_network_call(now);
    const results = JSON.parse(json);
    return results;
}
function format_favorites(response) {
    const favorites_id = response.data.info.id;
    return new PlatformPlaylistDetails({
        id: new PlatformID(PLATFORM, favorites_id.toString(), plugin.config.id),
        name: response.data.info.title,
        author: new PlatformAuthorLink(new PlatformID(PLATFORM, response.data.info.upper.mid.toString(), plugin.config.id), response.data.info.upper.name, `${SPACE_URL_PREFIX}${response.data.info.upper.mid}`, response.data.info.upper.face, local_storage_cache.space_cache.get(response.data.info.upper.mid)?.num_fans),
        url: `${FAVORITES_URL_PREFIX}${favorites_id}`,
        contents: new FavoritesContentsPager(favorites_id, response, 1, 20),
        videoCount: response.data.info.media_count,
    });
}
class FavoritesContentsPager extends VideoPager {
    favorites_id;
    next_page;
    page_size;
    constructor(favorites_id, favorites_response, initial_page, page_size) {
        const more = favorites_response.data.has_more;
        super(format_favorites_videos(favorites_response), more);
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.favorites_id = favorites_id;
    }
    nextPage() {
        const favorites_response = load_favorites(this.favorites_id, this.next_page, this.page_size);
        this.hasMore = favorites_response.data.has_more;
        this.results = format_favorites_videos(favorites_response);
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function format_favorites_videos(favorites_response) {
    const videos = favorites_response.data.medias.map(function (video) {
        const url = `${VIDEO_URL_PREFIX}${video.bvid}`;
        const video_id = new PlatformID(PLATFORM, video.bvid, plugin.config.id);
        return new PlatformVideo({
            id: video_id,
            name: video.title,
            url: url,
            thumbnails: new Thumbnails([new Thumbnail(video.cover, HARDCODED_THUMBNAIL_QUALITY)]),
            author: new PlatformAuthorLink(new PlatformID(PLATFORM, video.upper.mid.toString(), plugin.config.id), video.upper.name, `${SPACE_URL_PREFIX}${video.upper.mid}`, video.upper.face, local_storage_cache.space_cache.get(video.upper.mid)?.num_fans),
            duration: video.duration,
            viewCount: video.cnt_info.play,
            isLive: false,
            shareUrl: url,
            datetime: video.pubtime
        });
    });
    return videos;
}
function festival_request(festival_id, builder) {
    const festival_url = `${FESTIVAL_URL_PREFIX}${festival_id}`;
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(festival_url.toString(), {}, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function festival_parse(festival_html) {
    const festival_html_regex = /<script>window\.__INITIAL_STATE__=({.*?});\(function\(\){var s;\(s=document\.currentScript\|\|document\.scripts\[document\.scripts\.length-1\]\)\.parentNode\.removeChild\(s\);}\(\)\);<\/script>/;
    const match_result = festival_html.body.match(festival_html_regex);
    if (match_result === null) {
        throw new ScriptException("unreachable");
    }
    const json = match_result[1];
    if (json === undefined) {
        throw new ScriptException("unreachable");
    }
    const results = JSON.parse(json);
    return results;
}
function format_festival(festival_id, festival_response) {
    const episodes = festival_response.sectionEpisodes.map(function (episode) {
        const url = `${VIDEO_URL_PREFIX}${episode.bvid}`;
        const video_id = new PlatformID(PLATFORM, episode.bvid, plugin.config.id);
        // cache cids
        local_storage_cache.cid_cache.set(episode.bvid, episode.cid);
        return new PlatformVideo({
            id: video_id,
            name: episode.title,
            url: url,
            thumbnails: new Thumbnails([new Thumbnail(episode.cover, HARDCODED_THUMBNAIL_QUALITY)]),
            author: new PlatformAuthorLink(new PlatformID(PLATFORM, episode.author.mid.toString(), plugin.config.id), episode.author.name, `${SPACE_URL_PREFIX}${episode.author.mid}`, episode.author.face, local_storage_cache.space_cache.get(episode.author.mid)?.num_fans),
            // TODO potentially load this some other way
            // duration: episode.duration / 1000,
            // TODO load this some other way
            viewCount: 0,
            isLive: false,
            shareUrl: url,
            // TODO load this some other way
            datetime: HARDCODED_ZERO
        });
    });
    return new PlatformPlaylistDetails({
        id: new PlatformID(PLATFORM, festival_id.toString(), plugin.config.id),
        name: festival_response.title,
        author: EMPTY_AUTHOR,
        url: `${FESTIVAL_URL_PREFIX}${festival_id}`,
        contents: new VideoPager(episodes, false),
        videoCount: festival_response.sectionEpisodes.length,
    });
}
function watch_later_request(logged_in, builder) {
    const watch_later_url = "https://api.bilibili.com/x/v2/history/toview/web";
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    // use the authenticated client because watch later is only available when logged in
    const result = runner.GET(watch_later_url, {}, logged_in);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
//#endregion
//#region comments
// TODO when we load comments we actually download all the replies.
// we should cache them so that when getSubComments is called we don't have to make any networks requests
function getComments(url) {
    const { subdomain, content_type, content_id } = parse_content_details_url(url);
    const reduced_subdomain = subdomain === "m." || subdomain === "" ? "www." : subdomain;
    if (reduced_subdomain === "live.") {
        return new CommentPager([], false);
    }
    const [oid, type, context_url] = (function () {
        switch (reduced_subdomain) {
            case "t.": {
                const post_id = content_id;
                const post_response = download_post(post_id);
                return [parseInt(post_response.data.item.basic.comment_id_str), 11, `${POST_URL_PREFIX}${post_id}`];
            }
            case "www.":
                switch (content_type) {
                    case "bangumi/play/ep": {
                        const episode_id = parseInt(content_id);
                        const season_response = JSON.parse(season_request({ id: episode_id, type: "episode" }).body);
                        const episode_info = season_response.result.episodes.find(function (episode) { return episode.ep_id === episode_id; });
                        if (episode_info === undefined) {
                            throw new ScriptException("season missing episode");
                        }
                        return [episode_info.aid, 1, `${EPISODE_URL_PREFIX}${episode_id}`];
                    }
                    case "cheese/play/ep": {
                        const episode_id = parseInt(content_id);
                        return [episode_id, 33, `${COURSE_EPISODE_URL_PREFIX}${episode_id}`];
                    }
                    case "opus/": {
                        const post_id = content_id;
                        const post_response = download_post(post_id);
                        return [parseInt(post_response.data.item.basic.comment_id_str), 11, `${POST_URL_PREFIX}${post_id}`];
                    }
                    case "video/": {
                        const video_id = content_id;
                        const video_info = JSON.parse(video_detail_request(video_id).body);
                        return [video_info.data.View.aid, 1, `${VIDEO_URL_PREFIX}${video_id}`];
                    }
                    default:
                        throw assert_exhaustive(content_type, "unreachable");
                }
            default:
                throw assert_exhaustive(reduced_subdomain, "unreachable");
        }
    })();
    const pager = new BiliBiliCommentPager(context_url, oid, type, 1);
    return pager;
}
class BiliBiliCommentPager extends CommentPager {
    type;
    oid;
    context_url;
    next_page;
    constructor(context_url, oid, type, initial_page) {
        const comments_response = get_comments(oid, type, initial_page);
        switch (comments_response.code) {
            case -404:
                super([], false);
                break;
            case 0: {
                const more = !comments_response.data.cursor.is_end;
                super(format_comments(comments_response, context_url, oid, type, initial_page === 1), more);
                break;
            }
            default:
                throw assert_exhaustive(comments_response, "unreachable");
        }
        this.next_page = initial_page + 1;
        this.oid = oid;
        this.type = type;
        this.context_url = context_url;
    }
    nextPage() {
        const comments_response = get_comments(this.oid, this.type, this.next_page);
        switch (comments_response.code) {
            case -404:
                this.hasMore = false;
                this.results = [];
                break;
            case 0:
                this.hasMore = !comments_response.data.cursor.is_end;
                this.results = format_comments(comments_response, this.context_url, this.oid, this.type, this.next_page === 1);
                break;
            default:
                throw assert_exhaustive(comments_response, "unreachable");
        }
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function get_comments(oid, type, page) {
    const comments_preix = "https://api.bilibili.com/x/v2/reply/wbi/main";
    const params = {
        type: type.toString(),
        mode: "3",
        pagination_str: JSON.stringify({
            offset: JSON.stringify({
                type: 1,
                direction: 1,
                data: {
                    pn: page
                }
            })
        }),
        oid: oid.toString()
    };
    const comment_url = create_signed_url(comments_preix, params).toString();
    const now = Date.now();
    const json = local_http.GET(comment_url, {}, false).body;
    log_network_call(now);
    const results = JSON.parse(json);
    return results;
}
/**
 * Converts raw comment data into a Grayjay PlatformComments
 * @param comments_response
 * @param context_url
 * @param oid
 * @param type
 * @param include_pinned_comment
 * @returns
 */
function format_comments(comments_response, context_url, oid, type, include_pinned_comment) {
    if (comments_response.code === -404) {
        return [];
    }
    const replies = comments_response.data.replies;
    if (include_pinned_comment && comments_response.data.top.upper !== null) {
        replies.unshift(comments_response.data.top.upper);
    }
    const comments = replies.map(function (data) {
        const author_id = new PlatformID(PLATFORM, data.member.mid.toString(), plugin.config.id);
        return new PlatformComment({
            author: new PlatformAuthorLink(author_id, data.member.uname, `${SPACE_URL_PREFIX}${data.member.mid}`, data.member.avatar, local_storage_cache.space_cache.get(data.member.mid)?.num_fans),
            message: data.content.message,
            rating: new RatingLikes(data.like),
            replyCount: data.rcount,
            date: data.ctime,
            contextUrl: context_url,
            context: {
                oid: oid.toString(), rpid: data.rpid.toString(), type: (function (type) {
                    switch (type) {
                        case 1:
                            return "1";
                        case 33:
                            return "33";
                        case 11:
                            return "11";
                        default:
                            throw assert_exhaustive(type, "unreachable");
                    }
                })(type)
            }
        });
    });
    return comments;
}
function getSubComments(parent_comment) {
    const oid = parseInt(parent_comment.context.oid);
    const rpid = parseInt(parent_comment.context.rpid);
    const type = parent_comment.context.type;
    return new SubCommentPager(rpid, oid, type, parent_comment.contextUrl, 1, 20);
}
class SubCommentPager extends CommentPager {
    type;
    oid;
    root;
    context_url;
    next_page;
    page_size;
    constructor(root, oid, type, context_url, initial_page, page_size) {
        const replies_response = get_replies(oid, root, type, initial_page, page_size);
        const more = replies_response.data.page.count > initial_page * page_size;
        super(format_replies(replies_response, type, oid, context_url), more);
        this.next_page = initial_page + 1;
        this.oid = oid;
        this.type = type;
        this.root = root;
        this.context_url = context_url;
        this.page_size = page_size;
    }
    nextPage() {
        const replies_response = get_replies(this.oid, this.root, this.type, this.next_page, this.page_size);
        this.hasMore = replies_response.data.page.count > this.next_page * this.page_size;
        this.results = format_replies(replies_response, this.type, this.oid, this.context_url);
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
/**
 *
 * @param oid The root context for the comments (the aid for bangumi and videos, the episode id for courses, and basic->comment_id_str for posts
 * @param root_rpid The parent comment id
 * @param type The type of base content to retrieve replies about (33 for courses and 1 for everything else)
 * @param page
 * @param page_size
 * @returns
 */
function get_replies(oid, root_rpid, type, page, page_size) {
    const thread_prefix = "https://api.bilibili.com/x/v2/reply/reply";
    const params = {
        type: type,
        pn: page.toString(),
        ps: page_size.toString(),
        oid: oid.toString(),
        root: root_rpid.toString()
    };
    const url = create_url(thread_prefix, params).toString();
    const now = Date.now();
    const json = local_http.GET(url, { "User-Agent": USER_AGENT }, false).body;
    log_network_call(now);
    const results = JSON.parse(json);
    return results;
}
/**
 * Converts raw subcomment data into a Grayjay PlatformComments
 * @param comment_data
 * @param type
 * @param oid
 * @param context_url
 * @returns
 */
function format_replies(comment_data, type, oid, context_url) {
    const comments = comment_data.data.replies.map(function (comment) {
        if (comment.replies.length !== 0) {
            // these could be supported but as far as we understand they do not exist on BiliBili
            throw new ScriptException("unsupported sub sub comments");
        }
        const author_id = new PlatformID(PLATFORM, comment.member.mid.toString(), plugin.config.id);
        return new PlatformComment({
            author: new PlatformAuthorLink(author_id, comment.member.uname, `${SPACE_URL_PREFIX}${comment.member.mid}`, comment.member.avatar, local_storage_cache.space_cache.get(comment.member.mid)?.num_fans),
            message: comment.content.message,
            rating: new RatingLikes(comment.like),
            // as far as we know BiliBili doesn't support subsubcomments
            replyCount: 0,
            date: comment.ctime,
            contextUrl: context_url,
            context: { oid: oid.toString(), rpid: comment.rpid.toString(), type }
        });
    });
    return comments;
}
/**
 * this doesn't really work. we probably need to use getLiveEvents instead
 * the elements don't get removed for some reason
 * and there is weird height code such that even if we were able to delete the elements the comments
 * likely wouldn't fill the whole screen
 * we should load the chat history from
 * (mobile browser)
 * https://api.live.bilibili.com/AppRoom/msg?room_id=26386397
 * or
 * (desktop browser)
 * https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid=26386397
 * or figure out how to use the websockets to load chat in realtime
 * https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo?id=5050&type=0
 * wss://hw-sg-live-comet-02.chat.bilibili.com/sub
 * @param url
 * @returns
 */
function getLiveChatWindow(url) {
    log("BiliBili log: live chatting");
    return {
        url,
        removeElements: [".head-info", ".bili-btn-warp", "#app__player-area"]
    };
}
//#endregion
//#region user
function getUserSubscriptions() {
    if (!bridge.isLoggedIn()) {
        throw new ScriptException("unreachable");
    }
    const nav_response = JSON.parse(nav_request(true).body);
    const subscriptions = [];
    let total = Number.MAX_SAFE_INTEGER;
    let page = 1;
    const page_size = 20;
    while (total > page * page_size) {
        const subscriptions_response = JSON.parse(user_subscriptions_request(nav_response.data.mid, 1, 20).body);
        total = subscriptions_response.data.total;
        subscriptions.push(...subscriptions_response.data.list.map(function (subscription) { return `${SPACE_URL_PREFIX}${subscription.mid}`; }));
        page += 1;
    }
    return subscriptions;
}
function user_subscriptions_request(mid, page, page_size, builder) {
    const following_url = "https://api.bilibili.com/x/relation/followings";
    const params = {
        vmid: mid.toString(),
        pn: page.toString(),
        ps: page_size.toString()
    };
    const runner = builder === undefined ? local_http : builder;
    const url = create_url(following_url, params).toString();
    const now = Date.now();
    // use the authenticated client so logged in users can view their subscriptions even if they are private
    const result = runner.GET(url, {}, true);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function getUserPlaylists() {
    if (!bridge.isLoggedIn()) {
        throw new ScriptException("unreachable");
    }
    const requests = [
        {
            request(builder) { return nav_request(true, builder); },
            process(response) { return JSON.parse(response.body); }
        }, {
            request(builder) { return watch_later_request(true, builder); },
            process(response) { return JSON.parse(response.body); }
        }
    ];
    const [nav_response, watch_later_response] = execute_requests(requests);
    const favorites_response = JSON.parse(space_favorites_request(nav_response.data.mid).body);
    const playlists = favorites_response.data?.list?.map(function (list) {
        return `${FAVORITES_URL_PREFIX}${list.id}`;
    }) ?? [];
    if (watch_later_response.data.count > 0) {
        playlists.push(WATCH_LATER_URL);
    }
    return playlists;
}
//#endregion
//#region utilities
// TODO this structure isn't ideal because each pager will make http requests
// it would be ideal if all of those http requests were combined into a single batch request
// we could still reuse the code somehow but it will be trickier
class CompositeContentPager extends ContentPager {
    pagers;
    constructor(pagers) {
        const results = interleave(pagers.map((pager) => pager.results));
        const no_more_results = pagers.every((pager) => !pager.hasMore);
        super(results, !no_more_results);
        this.pagers = pagers;
    }
    nextPage() {
        this.pagers = this.pagers.flatMap((pager) => {
            if (pager.hasMore) {
                pager.nextPage();
                return pager;
            }
            return [];
        });
        const results = interleave(this.pagers.map((pager) => pager.results));
        const no_more_results = this.pagers.every((pager) => !pager.hasMore);
        this.results = results;
        this.hasMore = !no_more_results;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
class CompositePlaylistPager extends PlaylistPager {
    pagers;
    constructor(pagers) {
        const results = interleave(pagers.map((pager) => pager.results));
        const no_more_results = pagers.every((pager) => !pager.hasMore);
        super(results, !no_more_results);
        this.pagers = pagers;
    }
    nextPage() {
        this.pagers = this.pagers.flatMap((pager) => {
            if (pager.hasMore) {
                pager.nextPage();
                return pager;
            }
            return [];
        });
        const results = interleave(this.pagers.map((pager) => pager.results));
        const no_more_results = this.pagers.every((pager) => !pager.hasMore);
        this.results = results;
        this.hasMore = !no_more_results;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function log_passthrough(value) {
    log(value);
    return value;
}
function assert_exhaustive(value, exception_message) {
    log(["BiliBili log:", value]);
    if (exception_message !== undefined) {
        return new ScriptException(exception_message);
    }
    return;
}
function string_to_bytes(str) {
    const result = [];
    for (let i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i));
    }
    return new Uint8Array(result);
}
function get_random_int_inclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}
/**
 * Parses a time in minutes and seconds into a unix epoch timestamp
 * @param minutes_seconds "20:45"
 * @returns
 */
function parse_minutes_seconds(minutes_seconds) {
    const parsed_length = minutes_seconds.match(/^(\d+):(\d+)/);
    if (parsed_length === null) {
        throw new ScriptException("unreachable regex error");
    }
    const minutes = parsed_length[1];
    const seconds = parsed_length[2];
    if (minutes === undefined || seconds === undefined) {
        throw new ScriptException("unreachable regex error");
    }
    const duration = parseInt(minutes) * 60 + parseInt(seconds);
    return duration;
}
/**
 * Converts subtitle data to the WebVTT format
 * @param subtitles_data
 * @param name
 * @returns
 */
function convert_subtitles(subtitles_data, name) {
    let text = `WEBVTT ${name}\n`;
    text += "\n";
    for (const item of subtitles_data.body) {
        text += `${item.sid}\n`;
        text += `${seconds_to_WebVTT_timestamp(item.from)} --> ${seconds_to_WebVTT_timestamp(item.to)}\n`;
        text += `${item.content}\n`;
        text += "\n";
    }
    return text;
}
/**
 * Converts seconds to the timestamp format used in WebVTT
 * @param seconds
 * @returns
 */
function seconds_to_WebVTT_timestamp(seconds) {
    return new Date(seconds * 1000).toISOString().substring(11, 23);
}
function interleave(arrays) {
    const maxLength = Math.max(...arrays.map(arr => arr.length));
    const result = [];
    for (let i = 0; i < maxLength; i++) {
        arrays.forEach((array) => {
            if (i < array.length) {
                const val = array[i];
                if (val === undefined) {
                    throw new ScriptException("unreachable");
                }
                result.push(val);
            }
        });
    }
    return result;
}
/**
 * Interleaves two arrays starting with values from the longer array or from a if a and b are the same length
 * @param a
 * @param b
 * @returns
 */
function interleave_two(a, b) {
    const [first, second] = b.length > a.length ? [b, a] : [a, b];
    return first.flatMap(function (a_value, index) {
        const b_value = second[index];
        if (second[index] === undefined) {
            return a_value;
        }
        return b_value !== undefined ? [a_value, b_value] : a_value;
    });
}
function assert_never(value) {
    log(value);
}
function log_network_call(before_run_timestamp) {
    log(`BiliBili log: made 1 network request taking ${Date.now() - before_run_timestamp} milliseconds`);
}
function create_signed_url(base_url, params, special_params) {
    const augmented_params = special_params === undefined ? {
        ...params,
        // timestamp
        wts: Math.round(Date.now() / 1e3).toString(),
        // device fingerprint values
        dm_img_inter: local_state.dm_img_inter,
        dm_img_str: local_state.dm_img_str,
        dm_cover_img_str: local_state.dm_cover_img_str,
        dm_img_list: "[]",
    } : {
        ...params,
        // timestamp
        wts: special_params.wts.toString(),
        // device fingerprint values
        dm_img_inter: special_params.dm_img_inter,
        dm_img_str: special_params.dm_img_str,
        dm_cover_img_str: special_params.dm_cover_img_str,
        dm_img_list: special_params.dm_img_list,
    };
    const sorted_query_string = Object
        .entries(augmented_params)
        .sort(function (a, b) { return a[0].localeCompare(b[0]); })
        .map(function ([name, value]) {
        return `${name}=${encodeURIComponent(value)}`;
    })
        .join("&");
    const w_rid = local_utility.md5String(sorted_query_string + local_state.mixin_key);
    return new URL(`${base_url}?${sorted_query_string}&w_rid=${w_rid}`);
}
function create_url(base_url, params) {
    const url = new URL(base_url);
    for (const [name, value] of Object.entries(params)) {
        url.searchParams.set(name, value);
    }
    return url;
}
/**
 * Execute requests in parallel processes each of the results and return a tuple of results
 * @param requests
 * @returns
 */
function execute_requests(requests) {
    const batch = local_http.batch();
    for (const request of requests) {
        if (request !== undefined) {
            request.request(batch);
        }
    }
    const now = Date.now();
    const responses = batch.execute();
    log(`BiliBili log: made ${responses.length} network request(s) in parallel taking ${Date.now() - now} milliseconds`);
    switch (requests.length) {
        case 2: {
            const response_0 = responses[0];
            const response_1 = responses[1];
            if (response_0 === undefined || response_1 === undefined) {
                throw new ScriptException("unreachable");
            }
            return [requests[0].process(response_0), requests[1].process(response_1)];
        }
        case 3: {
            const response_0 = responses[0];
            const response_1 = responses[1];
            const response_2 = responses[2];
            if (response_0 === undefined || response_1 === undefined || response_2 === undefined) {
                throw new ScriptException("unreachable");
            }
            return [requests[0].process(response_0), requests[1].process(response_1), requests[2].process(response_2)];
        }
        case 4: {
            const response_0 = responses[0];
            const response_1 = responses[1];
            const response_2 = responses[2];
            const response_3 = responses[3];
            if (response_0 === undefined || response_1 === undefined || response_2 === undefined || response_3 === undefined) {
                throw new ScriptException("unreachable");
            }
            return [
                requests[0].process(response_0),
                requests[1].process(response_1),
                requests[2].process(response_2),
                requests[3].process(response_3)
            ];
        }
        case 5: {
            let next_response = 0;
            let result_0;
            let result_1;
            let result_2;
            let result_3;
            let result_4;
            if (requests[0] === undefined) {
                result_0 = undefined;
            }
            else {
                const response = responses[next_response];
                if (response === undefined) {
                    throw new ScriptException("unreachable");
                }
                result_0 = requests[0].process(response);
                next_response += 1;
            }
            if (requests[1] === undefined) {
                result_1 = undefined;
            }
            else {
                const response = responses[next_response];
                if (response === undefined) {
                    throw new ScriptException("unreachable");
                }
                result_1 = requests[1].process(response);
                next_response += 1;
            }
            if (requests[2] === undefined) {
                result_2 = undefined;
            }
            else {
                const response = responses[next_response];
                if (response === undefined) {
                    throw new ScriptException("unreachable");
                }
                result_2 = requests[2].process(response);
                next_response += 1;
            }
            if (requests[3] === undefined) {
                result_3 = undefined;
            }
            else {
                const response = responses[next_response];
                if (response === undefined) {
                    throw new ScriptException("unreachable");
                }
                result_3 = requests[3].process(response);
                next_response += 1;
            }
            if (requests[4] === undefined) {
                result_4 = undefined;
            }
            else {
                const response = responses[next_response];
                if (response === undefined) {
                    throw new ScriptException("unreachable");
                }
                result_4 = requests[4].process(response);
                next_response += 1;
            }
            return [result_0, result_1, result_2, result_3, result_4];
        }
        case 6: {
            const response_0 = responses[0];
            const response_1 = responses[1];
            const response_2 = responses[2];
            const response_3 = responses[3];
            const response_4 = responses[4];
            const response_5 = responses[5];
            if (response_0 === undefined || response_1 === undefined || response_2 === undefined || response_3 === undefined || response_4 === undefined || response_5 === undefined) {
                throw new ScriptException("unreachable");
            }
            return [
                requests[0].process(response_0),
                requests[1].process(response_1),
                requests[2].process(response_2),
                requests[3].process(response_3),
                requests[4].process(response_4),
                requests[5].process(response_5)
            ];
        }
        case 7: {
            const response_0 = responses[0];
            const response_1 = responses[1];
            const response_2 = responses[2];
            const response_3 = responses[3];
            const response_4 = responses[4];
            const response_5 = responses[5];
            const response_6 = responses[6];
            if (response_0 === undefined || response_1 === undefined || response_2 === undefined || response_3 === undefined || response_4 === undefined || response_5 === undefined || response_6 === undefined) {
                throw new ScriptException("unreachable");
            }
            return [
                requests[0].process(response_0),
                requests[1].process(response_1),
                requests[2].process(response_2),
                requests[3].process(response_3),
                requests[4].process(response_4),
                requests[5].process(response_5),
                requests[6].process(response_6)
            ];
        }
        default:
            throw assert_exhaustive(requests, "unreachable");
    }
}
//#endregion
console.log(assert_never, log_passthrough);
// export {};
// export statements are removed during build step
// used for unit testing in BiliBiliScript.test.ts
// export { interleave_two, getMixinKey, mixin_constant_request, process_mixin_constant, load_video_details, create_signed_url, nav_request, process_wbi_keys, init_local_storage, log_passthrough, assert_never }
//# sourceMappingURL=BiliBiliScript.js.map