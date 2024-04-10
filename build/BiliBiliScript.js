// TODO this is needed for tests to run :(
// import { ChannelPager, VideoPager } from "@grayjay/plugin/source.js"
const PLATFORM = "BiliBili";
const CONTENT_DETAIL_URL_REGEX = /^https:\/\/(www|live|t)\.bilibili.com\/(bangumi\/play\/ep|video\/|opus\/|cheese\/play\/ep|)(\d+|[0-9a-zA-Z]{12})(\/|\?|$)/;
const PLAYLIST_URL_REGEX = /^https:\/\/(www|space)\.bilibili.com\/(\d+|)(bangumi\/play\/ss|cheese\/play\/ss|medialist\/detail\/ml|festival\/|\/channel\/collectiondetail\?sid=|\/channel\/seriesdetail\?sid=|\/favlist\?fid=)(\d+|[0-9a-zA-Z]+)(\/|\?|$)/;
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
const GRAYJAY_USER_AGENT = "Grayjay";
const CHROME_USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
const local_http = http;
// TODO review hardcoded values
const HARDCODED_THUMBNAIL_QUALITY = 1080;
const EMPTY_AUTHOR = new PlatformAuthorLink(new PlatformID(PLATFORM, "", plugin.config.id), "", "");
const MISSING_NAME = "";
const MISSING_THUMBNAIL = "";
const HARDCODED_ZERO = 0;
// TODO we might need to create id prefixes
// There are a lot of number ids and the different types probably overlap
// TODO i have case statements where the same thing happens inside. these should be combined with case match || match: < I don't think this actually works :(
// TODO move optional parameters to the end of functions
// TODO currently for movies and shows the author object is essentially blank
// TODO split out the regex matching code into functions so it can be tested more easily
let local_storage_cache;
// set missing constants
Type.Order.Chronological = "Latest releases";
Type.Order.Views = "Most played";
Type.Order.Favorites = "Most favorited";
Type.Feed.Shows = "SHOWS";
Type.Feed.Posts = "POSTS";
Type.Feed.Movies = "MOVIES";
// align with the rest of the plugin use Simplified Chinese
Type.Order.Chronological = "最新发布";
Type.Order.Views = "最多播放";
Type.Order.Favorites = "最多收藏";
// Source Methods
source.enable = function enable(conf, settings, savedState) {
    if (IS_TESTING) {
        log("IS_TESTING true");
        log("logging configuration");
        log(conf);
        log("logging settings");
        log(settings);
        log("logging savedState");
        log(savedState);
    }
    const { wbi_img_key, wbi_sub_key } = download_wbi_keys();
    const b_nut = create_b_nut();
    const { buvid3, buvid4 } = download_and_activate_buvid3_and_buvid4(b_nut);
    // these caches don't work that well because they aren't shared between plugin instances
    local_storage_cache = {
        buvid3,
        buvid4,
        b_nut,
        cid_cache: new Map(),
        space_cache: new Map(),
        mixin_key: getMixinKey(wbi_img_key + wbi_sub_key, download_mixin_constant())
    };
};
source.disable = function disable() {
    log("BiliBili log: disabling");
};
source.saveState = function saveState() { return ""; };
// TODO there is additional content on the home page that we can consider loading in the future 
source.getHome = function getHome() {
    // load 12 videos at a time some of them are ads and not shown
    return new HomePager(0, 12);
};
source.searchSuggestions = function searchSuggestions(query) {
    return get_suggestions(query);
};
source.searchChannels = function searchChannels(query) {
    // the default page size on BiliBili is 36
    return new SpacePager(query, 1, 36);
};
// example of handled urls
// https://space.bilibili.com/491461718
source.isChannelUrl = function isChannelUrl(url) {
    // Some playlist urls are also Space urls
    if (PLAYLIST_URL_REGEX.test(url)) {
        return false;
    }
    return SPACE_URL_REGEX.test(url);
};
source.getChannel = function getChannel(url) {
    const match_results = url.match(SPACE_URL_REGEX);
    if (match_results === null) {
        throw new ScriptException(`malformed space url: ${url}`);
    }
    const maybe_space_id = match_results[1];
    if (maybe_space_id === undefined) {
        throw new ScriptException("unreachable regex error");
    }
    const space_id = parseInt(maybe_space_id);
    const requests = [{
            request(builder) { return space_request(space_id, builder); },
            process(response) { return JSON.parse(response.body); }
        }, {
            request(builder) { return fan_count_request(space_id, builder); },
            process(response) { return JSON.parse(response.body); }
        }];
    const [space, fan_count_response] = execute_requests(requests);
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
    return new PlatformChannel({
        id: new PlatformID(PLATFORM, space_id.toString(), plugin.config.id),
        name: space.data.name,
        thumbnail: space.data.face,
        banner: space.data.top_photo,
        subscribers: fan_count_response.data.follower,
        description: space.data.sign,
        url: `${SPACE_URL_PREFIX}${space_id}`,
    });
};
// TODO implement this once it's used
source.getChannelCapabilities = function getChannelCapabilities() {
    return new ResultCapabilities([], [], []);
};
// TODO handle different capabilities onces it's implemented
source.getChannelContents = function getChannelContents(url, type, order, filters) {
    // there isn't a way for the user to change these
    log(["BiliBili log:", type]);
    log(["BiliBili log:", order]);
    log(["BiliBili log:", filters]);
    const match_results = url.match(SPACE_URL_REGEX);
    if (match_results === null) {
        throw new ScriptException(`malformed space url: ${url}`);
    }
    const maybe_space_id = match_results[1];
    if (maybe_space_id === undefined) {
        throw new ScriptException("unreachable regex error");
    }
    const space_id = parseInt(maybe_space_id);
    return new SpaceContentsPager(space_id);
};
// examples of handled urls
// https://www.bilibili.com/bangumi/play/ep510760
// https://live.bilibili.com/26386397
// https://www.bilibili.com/video/BV1M84y1d7S1
// https://www.bilibili.com/opus/916396341363474468
// https://t.bilibili.com/915034213991841801
// https://www.bilibili.com/cheese/play/ep1027
source.isContentDetailsUrl = function isContentDetailsUrl(url) {
    return CONTENT_DETAIL_URL_REGEX.test(url);
};
// examples of handled urls
// https://www.bilibili.com/bangumi/play/ss2843
// https://www.bilibili.com/cheese/play/ss74
// https://space.bilibili.com/323588182/channel/collectiondetail?sid=2050037
// https://space.bilibili.com/323588182/channel/seriesdetail?sid=3810720
// https://space.bilibili.com/491461718/favlist?fid=3153093518
// https://www.bilibili.com/medialist/detail/ml3153093518
// https://www.bilibili.com/festival/2022bnj
source.isPlaylistUrl = function isPlaylistUrl(url) {
    return PLAYLIST_URL_REGEX.test(url);
};
source.searchPlaylists = function searchPlaylists(query) {
    return new BangumiPager(query, 1, 12);
};
source.getPlaylist = function getPlaylist(url) {
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
                thumbnail: collection_response.data.meta.cover
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
                videoCount: series_response.data.page.total,
                thumbnail: MISSING_THUMBNAIL
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
            return format_festival(festival_id, load_festival(festival_id));
        }
        default:
            throw assert_no_fall_through(playlist_type, "unreachable");
    }
};
// TODO handle content that requires logging in, requires a premium subscription, or is restricted in the region
// TODO consider switching from like rating to 0-10 scale rating for bangumi
source.getContentDetails = function getContentDetails(url) {
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
    switch (subdomain) {
        case "live": {
            // TODO this currently parses the html
            // there are however some json apis that could potentially be used instead
            // https://api.live.bilibili.com/xlive/web-room/v2/index/getRoomPlayInfo
            // https://api.live.bilibili.com/room/v1/Room/get_info
            const room_id = parseInt(maybe_content_id);
            const response = livestream_process((livestream_request(room_id)));
            const space_id = response.roomInitRes.data.uid;
            let source;
            // Note: while the there is always the http_hls ts option this is currently not usable and 404s
            // even when forcing it on the website live.bilibili.com my changing the return value of hasHLSPlayerSupportStream
            const codec = response.roomInitRes.data.playurl_info.playurl.stream
                .find((stream) => stream.protocol_name === "http_hls")?.format
                .find((format) => format.format_name === "fmp4")?.codec[0];
            if (codec !== undefined) {
                const url_info = codec.url_info[0];
                const name = response.roomInitRes.data.playurl_info.playurl.g_qn_desc
                    .find((item) => item.qn === codec.current_qn)?.desc;
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
                    .find((stream) => stream.protocol_name === "http_stream")?.format
                    .find((format) => format.format_name === "flv")?.codec[0];
                const url_info = codec?.url_info[0];
                if (url_info === undefined || codec === undefined) {
                    throw new ScriptException("unreachable");
                }
                const name = response.roomInitRes.data.playurl_info.playurl.g_qn_desc
                    .find((item) => item.qn === codec.current_qn)?.desc;
                if (name === undefined) {
                    throw new ScriptException("unreachable");
                }
                const video_url = `${url_info.host}${codec.base_url}${url_info.extra}`;
                source = new VideoUrlSource({
                    url: video_url,
                    name,
                    width: HARDCODED_ZERO,
                    height: HARDCODED_ZERO,
                    container: "flv",
                    codec: "avc",
                    bitrate: HARDCODED_ZERO,
                    duration: HARDCODED_ZERO,
                    requestModifier: {
                        headers: {
                            "User-Agent": GRAYJAY_USER_AGENT,
                            Host: new URL(url_info.host).hostname
                        }
                    }
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
                uploadDate: response.roomInfoRes.data.room_info.live_start_time,
                name: response.roomInfoRes.data.room_info.title,
                url: `${LIVE_ROOM_URL_PREFIX}${room_id}`,
                id: new PlatformID(PLATFORM, room_id.toString(), plugin.config.id),
                live: source,
            });
        }
        case "t": {
            const post_id = maybe_content_id;
            const post_response = download_post(post_id);
            const space_post = post_response.data.item;
            const desc = space_post.modules.module_dynamic.desc;
            const images = [];
            const thumbnails = [];
            const primary_content = desc?.rich_text_nodes
                .map((node) => { return format_text_node(node, images); })
                .join("");
            const major = space_post.modules.module_dynamic.major;
            const major_links = major !== null ? format_major(major, thumbnails, images) : undefined;
            const topic = space_post.modules.module_dynamic.topic;
            const topic_string = topic ? `<a href="${topic?.jump_url}">${topic.name}</a>` : undefined;
            const content = (primary_content ?? "") + (topic_string ?? "") + (major_links ?? "");
            return new PlatformPostDetails({
                // TODO currently there is a bug where this property is impossible to use
                thumbnails: [],
                // TODO there is a bug that means that these images do not display
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
        case "www":
            switch (content_type) {
                // TODO this is so similar to normal videos should we combine them
                case "bangumi/play/ep": {
                    const episode_id = parseInt(maybe_content_id);
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
                    const video_sources = episode_response.result.video_info.dash.video.map((video) => {
                        const name = episode_response.result.video_info.accept_description[episode_response.result.video_info.accept_quality.findIndex((value) => {
                            return value === video.id;
                        })];
                        if (name === undefined) {
                            throw new ScriptException("can't load content details");
                        }
                        const video_url_hostname = new URL(video.base_url).hostname;
                        return new VideoUrlSource({
                            width: video.width,
                            height: video.height,
                            container: video.mime_type,
                            codec: video.codecs,
                            name: name,
                            bitrate: video.bandwidth,
                            duration: episode_response.result.video_info.dash.duration,
                            url: video.base_url,
                            requestModifier: {
                                headers: {
                                    "Referer": "https://www.bilibili.com",
                                    "Host": video_url_hostname,
                                    "User-Agent": GRAYJAY_USER_AGENT
                                }
                            }
                        });
                    });
                    const audio_sources = episode_response.result.video_info.dash.audio.map((audio) => {
                        const audio_url_hostname = new URL(audio.base_url).hostname;
                        return new AudioUrlSource({
                            container: audio.mime_type,
                            codecs: audio.codecs,
                            name: `${audio.codecs} at ${audio.bandwidth}`,
                            bitrate: audio.bandwidth,
                            duration: episode_response.result.video_info.dash.duration,
                            url: audio.base_url,
                            language: Language.UNKNOWN,
                            requestModifier: {
                                headers: {
                                    "Referer": "https://www.bilibili.com",
                                    "Host": audio_url_hostname,
                                    "User-Agent": GRAYJAY_USER_AGENT
                                }
                            }
                        });
                    });
                    const upload_info = episode_info_response.data.related_up[0];
                    if (upload_info === undefined) {
                        throw new ScriptException("missing upload information");
                    }
                    const owner_id = upload_info.mid;
                    const episode_season_meta = season_response.result.episodes.find((episode) => episode.ep_id === episode_id);
                    if (episode_season_meta === undefined) {
                        throw new ScriptException("episode missing from season");
                    }
                    const platform_video_ID = new PlatformID(PLATFORM, episode_id.toString(), plugin.config.id);
                    const platform_creator_ID = new PlatformID(PLATFORM, owner_id.toString(), plugin.config.id);
                    const details = new PlatformVideoDetails({
                        id: platform_video_ID,
                        name: episode_season_meta.long_title ?? "",
                        thumbnails: new Thumbnails([new Thumbnail("video_info.data.View.pic", 1080)]), // TODO hardcoded 1080
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
                        uploadDate: episode_season_meta.pub_time
                    });
                    return details;
                }
                case "cheese/play/ep": {
                    // TODO there are some videos that don't have dash sections. in those cases we need to use the durl section
                    const episode_id = parseInt(maybe_content_id);
                    const batch = local_http.batch();
                    const play_url_prefix = "https://api.bilibili.com/pugv/player/web/playurl";
                    const params = {
                        fnval: "4048",
                        ep_id: episode_id.toString()
                    };
                    batch.GET(create_url(play_url_prefix, params).toString(), { "User-Agent": GRAYJAY_USER_AGENT, Host: "api.bilibili.com" }, false);
                    course_request({ type: "episode", id: episode_id }, batch);
                    const now = Date.now();
                    const [play_json, season_json] = batch.execute();
                    log(`BiliBili log: making 2 network requests in parallel took ${Date.now() - now} milliseconds`);
                    if (play_json === undefined || season_json === undefined) {
                        throw new ScriptException("unreachable");
                    }
                    const episode_response = JSON.parse(play_json.body);
                    const season_response = JSON.parse(season_json.body);
                    const video_sources = episode_response.data.dash.video.map((video) => {
                        const name = episode_response.data.accept_description[episode_response.data.accept_quality.findIndex((value) => {
                            return value === video.id;
                        })];
                        if (name === undefined) {
                            throw new ScriptException("can't load content details");
                        }
                        const video_url_hostname = new URL(video.base_url).hostname;
                        return new VideoUrlSource({
                            width: video.width,
                            height: video.height,
                            container: video.mime_type,
                            codec: video.codecs,
                            name: name,
                            bitrate: video.bandwidth,
                            duration: episode_response.data.dash.duration,
                            url: video.base_url,
                            requestModifier: {
                                headers: {
                                    "Referer": "https://www.bilibili.com",
                                    "Host": video_url_hostname,
                                    "User-Agent": GRAYJAY_USER_AGENT
                                }
                            }
                        });
                    });
                    const audio_sources = episode_response.data.dash.audio.map((audio) => {
                        const audio_url_hostname = new URL(audio.base_url).hostname;
                        return new AudioUrlSource({
                            container: audio.mime_type,
                            codecs: audio.codecs,
                            name: `${audio.codecs} at ${audio.bandwidth}`,
                            bitrate: audio.bandwidth,
                            duration: episode_response.data.dash.duration,
                            url: audio.base_url,
                            language: Language.UNKNOWN,
                            requestModifier: {
                                headers: {
                                    "Referer": "https://www.bilibili.com",
                                    "Host": audio_url_hostname,
                                    "User-Agent": GRAYJAY_USER_AGENT
                                }
                            }
                        });
                    });
                    const upload_info = season_response.data.up_info;
                    if (upload_info === undefined) {
                        throw new ScriptException("missing upload information");
                    }
                    const owner_id = upload_info.mid;
                    const episode_season_meta = season_response.data.episodes.find((episode) => episode.id === episode_id);
                    if (episode_season_meta === undefined) {
                        throw new ScriptException("episode missing from season");
                    }
                    const platform_video_ID = new PlatformID(PLATFORM, episode_id.toString(), plugin.config.id);
                    const platform_creator_ID = new PlatformID(PLATFORM, owner_id.toString(), plugin.config.id);
                    const details = new PlatformVideoDetails({
                        id: platform_video_ID,
                        name: episode_season_meta.title,
                        thumbnails: new Thumbnails([new Thumbnail(episode_season_meta.cover, 1080)]), // TODO hardcoded 1080
                        author: new PlatformAuthorLink(platform_creator_ID, upload_info.uname, `${SPACE_URL_PREFIX}${owner_id}`, upload_info.avatar, upload_info.follower),
                        duration: episode_response.data.dash.duration,
                        viewCount: episode_season_meta.play,
                        url: `${COURSE_EPISODE_URL_PREFIX}${episode_id}`,
                        isLive: false,
                        // TODO this will include HTML tags and render poorly
                        description: `${season_response.data.title}\n${season_response.data.subtitle}`,
                        video: new UnMuxVideoSourceDescriptor(video_sources, audio_sources),
                        // TODO figure out a rating to use. courses/course episodes don't have likes
                        rating: new RatingLikes(0),
                        shareUrl: `${COURSE_EPISODE_URL_PREFIX}${episode_id}`,
                        uploadDate: episode_season_meta.release_date
                    });
                    return details;
                }
                // TODO copied from case "t" above
                case "opus/": {
                    const post_id = maybe_content_id;
                    const post_response = download_post(post_id);
                    const space_post = post_response.data.item;
                    const desc = space_post.modules.module_dynamic.desc;
                    const images = [];
                    const thumbnails = [];
                    const primary_content = desc?.rich_text_nodes.map((node) => {
                        return format_text_node(node, images);
                    }).join("");
                    const major = space_post.modules.module_dynamic.major;
                    const major_links = major ? (() => {
                        switch (major.type) {
                            case "MAJOR_TYPE_ARCHIVE":
                                thumbnails.push(new Thumbnail(major.archive.cover, 1080)); // TODO hardcoded 1080
                                return `<a href="${VIDEO_URL_PREFIX}${major.archive.bvid}">${major.archive.title}</a>`;
                            case "MAJOR_TYPE_DRAW":
                                major.draw.items.forEach((pic) => {
                                    images.push(pic.src);
                                });
                                return undefined;
                            case "MAJOR_TYPE_OPUS":
                                major.opus.pics.forEach((pic) => {
                                    images.push(pic.url);
                                });
                                return major.opus.summary.rich_text_nodes.map((node) => {
                                    return format_text_node(node, images);
                                }).join("");
                            case "MAJOR_TYPE_LIVE_RCMD": {
                                const live_rcmd = JSON.parse(major.live_rcmd.content);
                                thumbnails.push(new Thumbnail(live_rcmd.live_play_info.cover, 1080)); // TODO hardcoded 1080
                                return `<a href="${LIVE_ROOM_URL_PREFIX}${live_rcmd.live_play_info.room_id}">${live_rcmd.live_play_info.title}</a>`;
                            }
                            case "MAJOR_TYPE_COMMON": {
                                thumbnails.push(new Thumbnail(major.common.cover, 1080)); // TODO hardcoded 1080
                                return `<a href="${major.common.jump_url}">${major.common.title}</a>`;
                            }
                            case "MAJOR_TYPE_ARTICLE": {
                                major.article.covers.forEach((cover) => {
                                    thumbnails.push(new Thumbnail(cover, 1080)); // TODO hardcoded 1080
                                });
                                return `<a href="https://www.bilibili.com/read/cv${major.article.id}">${major.article.title}</a>`;
                            }
                            default:
                                throw assert_no_fall_through(major, `unhandled type on major ${major}`);
                        }
                    })() : undefined;
                    const topic = space_post.modules.module_dynamic.topic;
                    const topic_string = topic ? `<a href="${topic?.jump_url}">${topic.name}</a>` : undefined;
                    const content = (primary_content ?? "") + (topic_string ?? "") + (major_links ?? "");
                    return new PlatformPostDetails({
                        // TODO currently there is a bug where this property is impossible to use
                        thumbnails: [],
                        // TODO there is a bug that means that these images do not display
                        images,
                        description: content,
                        // as far as i can tell posts don't have names
                        name: "",
                        url: `${POST_URL_PREFIX}${space_post.id_str}`,
                        id: new PlatformID(PLATFORM, space_post.id_str, plugin.config.id),
                        rating: new RatingLikes(space_post.modules.module_stat.like.count),
                        textType: Type.Text.HTML,
                        author: new PlatformAuthorLink(new PlatformID(PLATFORM, space_post.modules.module_author.mid.toString(), plugin.config.id), space_post.modules.module_author.name, `${SPACE_URL_PREFIX}${space_post.modules.module_author.mid}`, space_post.modules.module_author.face, local_storage_cache.space_cache.get(space_post.modules.module_author.mid)?.num_fans),
                        content,
                        datetime: space_post.modules.module_author.pub_ts
                    });
                }
                case "video/": {
                    const video_id = maybe_content_id;
                    const [video_info, episode_response] = get_video_details_json(video_id);
                    const video_sources = episode_response.data.dash.video.map((video) => {
                        const name = episode_response.data.accept_description[episode_response.data.accept_quality.findIndex((value) => {
                            return value === video.id;
                        })];
                        if (name === undefined) {
                            throw new ScriptException("can't load content details");
                        }
                        const video_url_hostname = new URL(video.base_url).hostname;
                        return new VideoUrlSource({
                            width: video.width,
                            height: video.height,
                            container: video.mime_type,
                            codec: video.codecs,
                            name,
                            bitrate: video.bandwidth,
                            duration: episode_response.data.dash.duration,
                            url: video.base_url,
                            requestModifier: {
                                headers: {
                                    "Referer": "https://www.bilibili.com",
                                    "Host": video_url_hostname,
                                    "User-Agent": GRAYJAY_USER_AGENT
                                }
                            }
                        });
                    });
                    const audio_sources = episode_response.data.dash.audio.map((audio) => {
                        const audio_url_hostname = new URL(audio.base_url).hostname;
                        return new AudioUrlSource({
                            container: audio.mime_type,
                            codecs: audio.codecs,
                            name: `${audio.codecs} at ${audio.bandwidth}`,
                            bitrate: audio.bandwidth,
                            duration: episode_response.data.dash.duration,
                            url: audio.base_url,
                            language: Language.UNKNOWN,
                            requestModifier: {
                                headers: {
                                    "Referer": "https://www.bilibili.com",
                                    "Host": audio_url_hostname,
                                    "User-Agent": GRAYJAY_USER_AGENT
                                }
                            }
                        });
                    });
                    const description = video_info.data.View.desc_v2 === null ? { raw_text: "" } : video_info.data.View.desc_v2[0];
                    if (description === undefined) {
                        throw new ScriptException("missing description");
                    }
                    const owner_id = video_info.data.View.owner.mid.toString();
                    const platform_video_ID = new PlatformID(PLATFORM, video_id, plugin.config.id);
                    const platform_creator_ID = new PlatformID(PLATFORM, owner_id, plugin.config.id);
                    const details = new PlatformVideoDetails({
                        id: platform_video_ID,
                        name: video_info.data.View.title,
                        thumbnails: new Thumbnails([new Thumbnail(video_info.data.View.pic, 1080)]), // TODO hardcoded 1080
                        author: new PlatformAuthorLink(platform_creator_ID, video_info.data.View.owner.name, `${SPACE_URL_PREFIX}${video_info.data.View.owner.mid}`, video_info.data.View.owner.face, video_info.data.Card.card.fans),
                        duration: episode_response.data.dash.duration,
                        viewCount: video_info.data.View.stat.view,
                        url: `${VIDEO_URL_PREFIX}${video_id}`,
                        isLive: false, // hardcoded for now
                        description: description.raw_text,
                        video: new UnMuxVideoSourceDescriptor(video_sources, audio_sources),
                        rating: new RatingLikes(video_info.data.View.stat.like),
                        shareUrl: `${VIDEO_URL_PREFIX}${video_id}`,
                        uploadDate: video_info.data.View.pubdate
                    });
                    return details;
                }
                default:
                    throw assert_no_fall_through(content_type, "unreachable");
            }
        default:
            throw assert_no_fall_through(subdomain, "unreachable");
    }
};
// TODO when we load comments we actually download all the replies.
// we should cache them so that when getSubComments is called we don't have to make any networks requests
source.getComments = getComments;
function getComments(url) {
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
    if (subdomain === "live") {
        return new CommentPager([], false);
    }
    const [oid, type, context_url] = (() => {
        switch (subdomain) {
            // TODO this code is the same as the code for loading channel contents
            // we should merge some of it. maybe just the major handling
            case "t": {
                const post_id = maybe_content_id;
                const post_response = download_post(post_id);
                return [parseInt(post_response.data.item.basic.comment_id_str), 1, `${POST_URL_PREFIX}${post_id}`];
            }
            case "www":
                switch (content_type) {
                    // TODO this is so similar to normal videos should we combine them
                    case "bangumi/play/ep": {
                        const episode_id = parseInt(maybe_content_id);
                        const season_response = JSON.parse(season_request({ id: episode_id, type: "episode" }).body);
                        const episode_info = season_response.result.episodes.find((episode) => episode.ep_id === episode_id);
                        if (episode_info === undefined) {
                            throw new ScriptException("season missing episode");
                        }
                        return [episode_info.aid, 1, `${EPISODE_URL_PREFIX}${episode_id}`];
                    }
                    case "cheese/play/ep": {
                        const episode_id = parseInt(maybe_content_id);
                        return [episode_id, 33, `${COURSE_EPISODE_URL_PREFIX}${episode_id}`];
                    }
                    // TODO copied from case "t" above
                    case "opus/": {
                        const post_id = maybe_content_id;
                        const post_response = download_post(post_id);
                        return [parseInt(post_response.data.item.basic.comment_id_str), 1, `${POST_URL_PREFIX}${post_id}`];
                    }
                    case "video/": {
                        const video_id = maybe_content_id;
                        const video_info = get_video_details_json(video_id)[0];
                        return [video_info.data.View.aid, 1, `${VIDEO_URL_PREFIX}${video_id}`];
                    }
                    default:
                        throw assert_no_fall_through(content_type, "unreachable");
                }
            default:
                throw assert_no_fall_through(subdomain, "unreachable");
        }
    })();
    const pager = new BiliBiliCommentPager(context_url, oid, type, 1);
    return pager;
}
source.getSubComments = getSubComments;
function getSubComments(parent_comment) {
    const oid = parseInt(parent_comment.context.oid);
    const rpid = parseInt(parent_comment.context.rpid);
    const type = parent_comment.context.type;
    return new SubCommentPager(rpid, oid, type, parent_comment.contextUrl, 1, 20);
}
// TODO the order and filtering only applies to videos not posts but there is not a way of specifying that
source.getSearchChannelContentsCapabilities = function getSearchChannelContentsCapabilities() {
    log("BiliBili log: getting space capabilities");
    // TODO there are filter options but they only show up after a search has been returned
    return new ResultCapabilities([Type.Feed.Videos, "POSTS"], [Type.Order.Chronological, Type.Order.Views, Type.Order.Favorites], [new FilterGroup("Additional Content", [
            new FilterCapability("Live Rooms", "0", "Live Rooms"),
            new FilterCapability("Posts", "1", "Posts")
        ], false, "ADDITIONAL_CONTENT")]);
};
source.searchChannelContents = function searchChannelContents(space_url, query, type, order, filters) {
    log(["BiliBili log:", type]);
    log(["BiliBili log:", order]);
    log(["BiliBili log:", filters]);
    const match_results = space_url.match(SPACE_URL_REGEX);
    if (match_results === null) {
        throw new ScriptException(`malformed space url: ${space_url}`);
    }
    const maybe_space_id = match_results[1];
    if (maybe_space_id === undefined) {
        throw new ScriptException("unreachable regex error");
    }
    const space_id = parseInt(maybe_space_id);
    switch (type) {
        case "POSTS":
            log("BiliBili log: ordering posts is not supported");
            log(`BiliBili log: order ${order} ignored`);
            return new ChannelPostsResultsPager(query, space_id, 1, 30);
        case Type.Feed.Videos:
            return new ChannelVideoResultsPager(query, space_id, 1, 30, order);
        case null:
            switch (filters["ADDITIONAL_CONTENT"]?.[0]) {
                case "post":
                    return new ChannelPostsResultsPager(query, space_id, 1, 30);
                default:
                    return new ChannelVideoResultsPager(query, space_id, 1, 30, order);
            }
        default:
            throw new ScriptException(`unhandled feed type ${type}`);
    }
};
source.getSearchCapabilities = function getSearchCapabilities() {
    return new ResultCapabilities([Type.Feed.Videos, Type.Feed.Live, "MOVIES", "SHOWS"], [Type.Order.Chronological, Type.Order.Views, Type.Order.Favorites], 
    // TODO implement category filtering
    [new FilterGroup("期间", // Duration
        [
            new FilterCapability("全部时长", "0", "全部时长"), // full duration
            new FilterCapability("10分钟以下", "1", "10分钟以下"), // Under 10 minutes
            new FilterCapability("10-30分钟", "2", "10-30分钟"), // 10-30 minutes
            new FilterCapability("30-60分钟", "3", "30-60分钟"), // 30-60 minutes
            new FilterCapability("60分钟以上", "4", "60分钟以上"), // More than 60 minutes
        ], false, "DURATION_FILTER"),
        new FilterGroup("Additional Content", [
            new FilterCapability("Live Rooms", "live", "Live Rooms"),
            new FilterCapability("Posts", "post", "Posts"),
            new FilterCapability("Shows", "show", "Shows"),
            new FilterCapability("Movies", "movie", "Movies")
        ], false, "ADDITIONAL_CONTENT")]);
};
source.search = function search(query, type, order, filters) {
    log(["BiliBili log:", type]);
    log(["BiliBili log:", order]);
    log(["BiliBili log:", filters]);
    const query_type = ((type) => {
        switch (type) {
            case "LIVE":
                return "live";
            case "SHOWS":
                return "media_bangumi";
            case "MOVIES":
                return "media_ft";
            case "VIDEOS":
                return "video";
            case null:
                switch (filters["ADDITIONAL_CONTENT"]?.[0]) {
                    case "live":
                        return "live";
                    case "show":
                        return "media_bangumi";
                    case "movie":
                        return "media_ft";
                    default:
                        return "video";
                }
            default:
                throw new ScriptException(`unhandled feed type ${type}`);
        }
    })(type);
    const query_order = ((order) => {
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
    const duration = ((filters) => {
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
    return new SearchPager(query, 1, 42, query_type, query_order, duration);
};
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
source.getLiveChatWindow = function getLiveChatWindow(url) {
    log("BiliBili log: live chatting!!");
    return {
        url,
        removeElements: [".head-info", ".bili-btn-warp", "#app__player-area"]
    };
};
if (IS_TESTING) {
    const assert_source = {
        enable: source.enable,
        disable: source.disable,
        saveState: source.saveState,
        getHome: source.getHome,
        searchSuggestions: source.searchSuggestions,
        search: source.search,
        getSearchCapabilities: source.getSearchCapabilities,
        isContentDetailsUrl: source.isContentDetailsUrl,
        getContentDetails: source.getContentDetails,
        isChannelUrl: source.isChannelUrl,
        getChannel: source.getChannel,
        getChannelContents: source.getChannelContents,
        getChannelCapabilities: source.getChannelCapabilities,
        searchChannelContents: source.searchChannelContents,
        getSearchChannelContentsCapabilities: source.getSearchChannelContentsCapabilities,
        searchChannels: source.searchChannels,
        getComments: getComments,
        getSubComments: getSubComments,
        isPlaylistUrl: source.isPlaylistUrl,
        getPlaylist: source.getPlaylist,
        searchPlaylists: source.searchPlaylists,
        getLiveChatWindow: source.getLiveChatWindow
    };
    if (source.getComments === undefined) {
        assert_never(source.getComments);
    }
    if (source.getSubComments === undefined) {
        assert_never(source.getSubComments);
    }
    log(assert_source);
}
function assert_never(value) {
    log(value);
}
class SearchPager extends VideoPager {
    next_page;
    page_size;
    query;
    type;
    order;
    duration;
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
        const now = Date.now();
        const raw_response = search_request(this.query, this.next_page, this.page_size, this.type, this.order, this.duration);
        log_network_call(now);
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
function format_comments(comments_response, context_url, oid, type, include_pinned_comment) {
    const comment_data = comments_response.data;
    const comments = (include_pinned_comment && comment_data.top.upper !== null
        ? [comment_data.top.upper].concat(comment_data.replies)
        : comment_data.replies).map((data) => {
        const author_id = new PlatformID(PLATFORM, data.member.mid.toString(), plugin.config.id);
        return new PlatformComment({
            author: new PlatformAuthorLink(author_id, data.member.uname, `${SPACE_URL_PREFIX}${data.member.mid}`, data.member.avatar, local_storage_cache.space_cache.get(data.member.mid)?.num_fans),
            message: data.content.message,
            rating: new RatingLikes(data.like),
            replyCount: data.rcount,
            date: data.ctime,
            contextUrl: context_url,
            context: {
                oid: oid.toString(), rpid: data.rpid.toString(), type: ((type) => {
                    switch (type) {
                        case 1:
                            return "1";
                        case 33:
                            return "33";
                        default:
                            throw assert_no_fall_through(type, "unreachable");
                    }
                })(type)
            }
        });
    });
    return comments;
}
function format_replies(comment_data, type, oid, context_url) {
    const comments = comment_data.data.replies.map((comment) => {
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
class BiliBiliCommentPager extends CommentPager {
    type;
    oid;
    context_url;
    next_page;
    constructor(context_url, oid, type, initial_page) {
        const comments_response = get_comments(oid, type, initial_page);
        const more = !comments_response.data.cursor.is_end;
        super(format_comments(comments_response, context_url, oid, type, initial_page === 1), more);
        this.next_page = initial_page + 1;
        this.oid = oid;
        this.type = type;
        this.context_url = context_url;
    }
    nextPage() {
        const comment_response = get_comments(this.oid, this.type, this.next_page);
        this.hasMore = !comment_response.data.cursor.is_end;
        this.results = format_comments(comment_response, this.context_url, this.oid, this.type, this.next_page === 1);
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
// images in an output array for images
function format_text_node(node, images) {
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
            node.pics.forEach((pic) => {
                images.push(pic.src);
            });
            return;
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
            throw assert_no_fall_through(node, `unhandled type on node ${node}`);
    }
}
// starts with the longer array or a if they are the same length
function interleave(a, b) {
    const [first, second] = b.length > a.length ? [b, a] : [a, b];
    return first.flatMap((a_value, index) => {
        const b_value = second[index];
        if (second[index] === undefined) {
            return a_value;
        }
        return b_value !== undefined ? [a_value, b_value] : a_value;
    });
}
function assert_no_fall_through(value, exception_message) {
    log(["BiliBili log:", value]);
    if (exception_message !== undefined) {
        return new ScriptException(exception_message);
    }
    return;
}
// function get_comment_context_url
// type is 33 for courses and 1 for everything else
// oid for episodes and videos is the aid
// oid for courses is the episode id
// oid for posts is the comment_id_str under basic
function get_replies(oid, root_rpid, type, page, page_size) {
    const thread_prefix = "https://api.bilibili.com/x/v2/reply/reply";
    const params = {
        type: type,
        pn: page.toString(),
        ps: page_size.toString(),
        oid: oid.toString(),
        root: root_rpid.toString()
    };
    const url = create_signed_url(thread_prefix, params).toString();
    const now = Date.now();
    const json = local_http.GET(url, {}, false).body;
    log(`BiliBili log: making 1 network request took ${Date.now() - now} milliseconds`);
    const results = JSON.parse(json);
    return results;
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
    log(`BiliBili log: making 1 network request took ${Date.now() - now} milliseconds`);
    const results = JSON.parse(json);
    return results;
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
    const videos = favorites_response.data.medias.map((video) => {
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
            uploadDate: video.pubtime
        });
    });
    return videos;
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
        thumbnail: response.data.info.cover
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
    const buvid3 = local_storage_cache.buvid3;
    const now = Date.now();
    const json = local_http.GET(url.toString(), { Cookie: `buvid3=${buvid3}` }, false).body;
    log_network_call(now);
    const results = JSON.parse(json);
    return results;
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
    const live_regex = /<script>window\.__NEPTUNE_IS_MY_WAIFU__=(.*?)<\/script>/;
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
function download_post(post_id) {
    const single_post_prefix = "https://api.bilibili.com/x/polymer/web-dynamic/v1/detail";
    const params = {
        id: post_id
    };
    const url = create_signed_url(single_post_prefix, params).toString();
    const now = Date.now();
    const json = local_http.GET(url, { Cookie: `buvid3=${local_storage_cache.buvid3}` }, false).body;
    log(`BiliBili log: making 1 network request took ${Date.now() - now} milliseconds`);
    const post_response = JSON.parse(json);
    return post_response;
}
function format_bangumi_search(shows, movies) {
    return interleave(shows ?? [], movies ?? []).map((item) => {
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
            datetime: item.pubtime
        });
    });
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
class SeriesContentsPager extends VideoPager {
    space_id;
    author;
    series_id;
    next_page;
    page_size;
    constructor(space_id, author, series_id, series_response, initial_page, page_size) {
        const more = series_response.data.page.total > initial_page * page_size;
        super(format_series(author, series_response), more);
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
    const videos = series_response.data.archives.map((video) => {
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
            uploadDate: video.pubdate
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
    const buvid3 = local_storage_cache.buvid3;
    const now = Date.now();
    const runner = builder === undefined ? local_http : builder;
    const result = runner.GET(playlist_url.toString(), { Cookie: `buvid3=${buvid3}` }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
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
    const videos = collection_response.data.archives.map((video) => {
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
            uploadDate: video.pubdate
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
    const buvid3 = local_storage_cache.buvid3;
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(playlist_url.toString(), { Cookie: `buvid3=${buvid3}` }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
function format_festival(festival_id, festival_response) {
    // TODO decide how to handle
    const author = new PlatformAuthorLink(new PlatformID(PLATFORM, "festival_response.data.up_info.mid.toString()", plugin.config.id), "festival_response.data.up_info.uname", `${SPACE_URL_PREFIX}${"festival_response.data.up_info.mid"}`, "festival_response.data.up_info.avatar", 3534);
    const episodes = festival_response.sectionEpisodes.map((episode) => {
        const url = `${VIDEO_URL_PREFIX}${episode.bvid}`;
        const video_id = new PlatformID(PLATFORM, episode.bvid, plugin.config.id);
        // cache cids
        local_storage_cache.cid_cache.set(episode.bvid, episode.cid);
        return new PlatformVideo({
            id: video_id,
            name: episode.title,
            url: url,
            thumbnails: new Thumbnails([new Thumbnail(episode.cover, 1080)]), // TODO hardcoded 1080
            author: new PlatformAuthorLink(new PlatformID(PLATFORM, "festival_response.data.up_info.mid.toString()", plugin.config.id), "festival_response.data.up_info.uname", `${SPACE_URL_PREFIX}${"festival_response.data.up_info.mid"}`, "festival_response.data.up_info.avatar", 3534),
            // TODO potentially load this some other way
            // duration: episode.duration / 1000,
            // TODO load this some other way
            viewCount: 0,
            isLive: false,
            shareUrl: url,
            // TODO load this some other way
            // uploadDate: episode.release_date
        });
    });
    return new PlatformPlaylistDetails({
        id: new PlatformID(PLATFORM, festival_id.toString(), plugin.config.id),
        name: festival_response.title,
        author,
        url: `${FESTIVAL_URL_PREFIX}${festival_id}`,
        contents: new VideoPager(episodes, false),
        videoCount: festival_response.sectionEpisodes.length,
        // TODO only used when the playlist shows up in as a search result when you view a playlist the thumbnail is taken from the first video i think this is a bug
        thumbnail: festival_response.themeConfig.page_bg_img
    });
}
/*
function festival_request(festival_id: string, op: BatchBuilder): BatchBuilder
function festival_request(festival_id: string, op: HTTP): BridgeHttpResponse
function festival_request(festival_id: string, op: BatchBuilder | HTTP): BatchBuilder | BridgeHttpResponse {
    const festival_url = `${FESTIVAL_URL_PREFIX}${festival_id}`
    return op.GET(festival_url.toString(), {}, false)
}

function festival_parse(festival_html: BridgeHttpResponse): FestivalResponse {
    const festival_html_regex = /<script>window\.__INITIAL_STATE__=(.*?);\(function\(\){var s;\(s=document\.currentScript\|\|document\.scripts\[document\.scripts\.length-1\]\)\.parentNode\.removeChild\(s\);}\(\)\);<\/script>/
    const match_result = festival_html.body.match(festival_html_regex)
    if (match_result === null) {
        throw new ScriptException("unreachable")
    }
    const json = match_result[1]
    if (json === undefined) {
        throw new ScriptException("unreachable")
    }
    const results: FestivalResponse = JSON.parse(json)
    return results
}
*/
function load_festival(festival_id) {
    const festival_html_regex = /<script>window\.__INITIAL_STATE__=(.*?);\(function\(\){var s;\(s=document\.currentScript\|\|document\.scripts\[document\.scripts\.length-1\]\)\.parentNode\.removeChild\(s\);}\(\)\);<\/script>/;
    const festival_url = `${FESTIVAL_URL_PREFIX}${festival_id}`;
    const now = Date.now();
    const festival_html = local_http.GET(festival_url.toString(), {}, false).body;
    log_network_call(now);
    const match_result = festival_html.match(festival_html_regex);
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
function execute_requests(requests) {
    const batch = local_http.batch();
    requests.forEach((request) => {
        if (request !== undefined) {
            request.request(batch);
        }
    });
    const now = Date.now();
    const responses = batch.execute();
    log(`BiliBili log: made ${responses.length} network request(s) in parallel taking ${Date.now() - now} milliseconds`);
    switch (requests.length) {
        case 1: {
            const response_0 = responses[0];
            if (response_0 === undefined) {
                throw new ScriptException("unreachable");
            }
            return requests[0].process(response_0);
        }
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
        default:
            throw assert_no_fall_through(requests, "unreachable");
    }
}
function format_course(season_id, course_response) {
    const author = new PlatformAuthorLink(new PlatformID(PLATFORM, course_response.data.up_info.mid.toString(), plugin.config.id), course_response.data.up_info.uname, `${SPACE_URL_PREFIX}${course_response.data.up_info.mid}`, course_response.data.up_info.avatar, course_response.data.up_info.follower);
    const episodes = course_response.data.episodes.map((episode) => {
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
            uploadDate: episode.release_date
        });
    });
    return new PlatformPlaylistDetails({
        id: new PlatformID(PLATFORM, season_id.toString(), plugin.config.id),
        name: course_response.data.title,
        author,
        url: `${COURSE_URL_PREFIX}${season_id}`,
        contents: new VideoPager(episodes, false),
        videoCount: course_response.data.ep_count,
        thumbnail: course_response.data.cover
    });
}
function course_request(id_obj, builder) {
    const season_prefix = "https://api.bilibili.com/pugv/view/web/season";
    const params = ((id_obj) => {
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
                throw assert_no_fall_through(id_obj, "unreachable");
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
function format_season(season_id, season_response) {
    const episodes = season_response.result.episodes.map((episode) => {
        const url = `${EPISODE_URL_PREFIX}${episode.ep_id}`;
        const video_id = new PlatformID(PLATFORM, episode.ep_id.toString(), plugin.config.id);
        // update cache
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
            uploadDate: episode.pub_time
        });
    });
    return new PlatformPlaylistDetails({
        id: new PlatformID(PLATFORM, season_id.toString(), plugin.config.id),
        name: season_response.result.title,
        author: EMPTY_AUTHOR,
        url: `${SEASON_URL_PREFIX}${season_id}`,
        contents: new VideoPager(episodes, false),
        videoCount: season_response.result.total,
        thumbnail: season_response.result.cover
    });
}
function episode_info_request(episode_id, builder) {
    const episode_info_prefix = "https://api.bilibili.com/pgc/season/episode/web/info";
    const info_params = {
        ep_id: episode_id.toString()
    };
    const runner = builder === undefined ? local_http : builder;
    return runner.GET(create_url(episode_info_prefix, info_params).toString(), {}, false);
}
function episode_play_request(episode_id, builder) {
    const play_url_prefix = "https://api.bilibili.com/pgc/player/web/v2/playurl";
    const params = {
        fnval: "4048",
        ep_id: episode_id.toString()
    };
    const runner = builder === undefined ? local_http : builder;
    return runner.GET(create_url(play_url_prefix, params).toString(), { "User-Agent": GRAYJAY_USER_AGENT, Host: "api.bilibili.com" }, false);
}
function season_request(id_obj, builder) {
    const season_prefix = "https://api.bilibili.com/pgc/view/web/season";
    const params = ((id_obj) => {
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
                throw assert_no_fall_through(id_obj, "unreachable");
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
function format_major(major, thumbnails, images) {
    switch (major.type) {
        case "MAJOR_TYPE_ARCHIVE":
            thumbnails.push(new Thumbnail(major.archive.cover, 1080)); // TODO hardcoded 1080
            return `<a href="${VIDEO_URL_PREFIX}${major.archive.bvid}">${major.archive.title}</a>`;
        case "MAJOR_TYPE_DRAW":
            major.draw.items.forEach((pic) => {
                images.push(pic.src);
            });
            return undefined;
        case "MAJOR_TYPE_OPUS":
            major.opus.pics.forEach((pic) => {
                images.push(pic.url);
            });
            return major.opus.summary.rich_text_nodes.map((node) => {
                return format_text_node(node, images);
            }).join("");
        case "MAJOR_TYPE_LIVE_RCMD": {
            const live_rcmd = JSON.parse(major.live_rcmd.content);
            thumbnails.push(new Thumbnail(live_rcmd.live_play_info.cover, 1080)); // TODO hardcoded 1080
            return `<a href="${LIVE_ROOM_URL_PREFIX}${live_rcmd.live_play_info.room_id}">${live_rcmd.live_play_info.title}</a>`;
        }
        case "MAJOR_TYPE_COMMON": {
            thumbnails.push(new Thumbnail(major.common.cover, 1080)); // TODO hardcoded 1080
            return `<a href="${major.common.jump_url}">${major.common.title}</a>`;
        }
        case "MAJOR_TYPE_ARTICLE": {
            major.article.covers.forEach((cover) => {
                thumbnails.push(new Thumbnail(cover, 1080)); // TODO hardcoded 1080
            });
            return `<a href="https://www.bilibili.com/read/cv${major.article.id}">${major.article.title}</a>`;
        }
        default:
            throw assert_no_fall_through(major, `unhandled type on major ${major}`);
    }
}
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
function format_space_contents(space_id, space_videos_response, space_posts_response, space_courses_response, space_collections_response, space_favorites_response) {
    const space_info = local_storage_cache.space_cache.get(space_id);
    if (space_info === undefined) {
        throw new ScriptException("unreachable");
    }
    const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
    const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
    const results = [];
    // TODO this currently creates a videos tab that shows videos then posts then playlists
    // we might prefer for the results to be mixed up
    if (space_videos_response !== undefined) {
        const live_room = space_videos_response.data.page.pn === 1
            && space_info.live_room !== null
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
                    // TODO load from cache uploadDate:
                })]
            : [];
        results.push(...live_room);
        results.push(...space_videos_response.data.list.vlist.map((space_video) => {
            const url = `${VIDEO_URL_PREFIX}${space_video.bvid}`;
            const video_id = new PlatformID(PLATFORM, space_video.bvid, plugin.config.id);
            return new PlatformVideo({
                id: video_id,
                name: space_video.title,
                url: url,
                thumbnails: new Thumbnails([new Thumbnail(space_video.pic, HARDCODED_THUMBNAIL_QUALITY)]),
                author: author,
                duration: parse_minutes_seconds(space_video.length),
                viewCount: space_video.play,
                isLive: false,
                shareUrl: url,
                uploadDate: space_video.created
            });
        }));
    }
    if (space_posts_response !== undefined) {
        results.push(...space_posts_response.data.items.map((space_post) => {
            const desc = space_post.modules.module_dynamic.desc;
            const images = [];
            const thumbnails = [];
            const primary_content = desc?.rich_text_nodes.map((node) => { return format_text_node(node, images); }).join("");
            const major = space_post.modules.module_dynamic.major;
            const major_links = major !== null ? format_major(major, thumbnails, images) : undefined;
            const topic = space_post.modules.module_dynamic.topic;
            const topic_string = topic ? `<a href="${topic?.jump_url}">${topic.name}</a>` : undefined;
            const content = (primary_content ?? "") + (topic_string ?? "") + (major_links ?? "");
            return new PlatformPostDetails({
                // TODO currently there is a bug where this property is impossible to use
                thumbnails: [],
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
            });
        }));
    }
    if (space_courses_response !== undefined) {
        results.push(...space_courses_response.data.items.map((course) => {
            return new PlatformPlaylist({
                id: new PlatformID(PLATFORM, course.season_id.toString(), plugin.config.id),
                name: course.title,
                author,
                url: `${COURSE_URL_PREFIX}${course.season_id}`,
                videoCount: course.ep_count,
                thumbnail: course.cover
            });
        }));
    }
    if (space_collections_response !== undefined) {
        results.push(...space_collections_response.data.items_lists.seasons_list.map((season) => {
            return new PlatformPlaylist({
                id: new PlatformID(PLATFORM, season.meta.season_id.toString(), plugin.config.id),
                name: season.meta.name,
                author,
                url: `${SPACE_URL_PREFIX}${space_id}${COLLECTION_URL_PREFIX}${season.meta.season_id}`,
                videoCount: season.meta.total,
                thumbnail: season.meta.cover
            });
        }).concat(space_collections_response.data.items_lists.series_list.map((series) => {
            return new PlatformPlaylist({
                id: new PlatformID(PLATFORM, series.meta.series_id.toString(), plugin.config.id),
                name: series.meta.name,
                author,
                url: `${SPACE_URL_PREFIX}${space_id}${SERIES_URL_PREFIX}${series.meta.series_id}`,
                videoCount: series.meta.total,
                thumbnail: series.meta.cover
            });
        })));
    }
    if (space_favorites_response !== undefined) {
        if (space_favorites_response.data !== null && space_favorites_response.data.list !== null) {
            results.push(...space_favorites_response.data.list.map((favorite_list) => {
                return new PlatformPlaylist({
                    id: new PlatformID(PLATFORM, favorite_list.id.toString(), plugin.config.id),
                    name: favorite_list.title,
                    author,
                    url: `${FAVORITES_URL_PREFIX}${favorite_list.id}`,
                    videoCount: favorite_list.media_count,
                    thumbnail: MISSING_THUMBNAIL
                });
            }));
        }
    }
    return results;
}
function space_videos_request(space_id, page, page_size, query, order, builder) {
    const space_contents_search_prefix = "https://api.bilibili.com/x/space/wbi/arc/search";
    let params = {
        mid: space_id.toString(),
        pn: page.toString(),
        ps: page_size.toString()
    };
    if (order !== undefined) {
        params = {
            ...params,
            order: ((order) => {
                switch (order) {
                    case Type.Order.Chronological:
                        return "pubdate";
                    case Type.Order.Favorites:
                        return "stow";
                    case Type.Order.Views:
                        return "click";
                    case null:
                        return "pubdate";
                    default:
                        throw new ScriptException(`unhandled ordering ${order}`);
                }
            })(order)
        };
    }
    if (query !== undefined) {
        params = { ...params, query, };
    }
    const url = create_signed_url(space_contents_search_prefix, params).toString();
    const b_nut = local_storage_cache.b_nut;
    // const b_nut = create_b_nut()
    log(url);
    log(`buvid3=${local_storage_cache.buvid3};`);
    log(`buvid4=${local_storage_cache.buvid4};`);
    log(`b_nut=${b_nut};`);
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(url, {
        "User-Agent": GRAYJAY_USER_AGENT,
        Cookie: `buvid4=${local_storage_cache.buvid4}; b_nut=${b_nut}`,
        // Cookie: `buvid3=${local_storage_cache.buvid3}`,
        // Cookie: `buvid4=${local_storage_cache.buvid4}; b_nut=${b_nut}; buvid3=${local_storage_cache.buvid3}`,
        Host: "api.bilibili.com",
        Referer: "https://space.bilibili.com"
    }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
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
    // const b_nut = local_storage_cache.b_nut
    // const b_nut = create_b_nut()
    log(url);
    log(`buvid3=${local_storage_cache.buvid3};`);
    log(`buvid4=${local_storage_cache.buvid4};`);
    // log(`b_nut=${b_nut};`)
    const runner = builder === undefined ? local_http : builder;
    return runner.GET(url, {
        Host: "api.bilibili.com",
        Cookie: `buvid3=${local_storage_cache.buvid3}`,
        Referer: "https://space.bilibili.com",
        "User-Agent": GRAYJAY_USER_AGENT
    }, false);
}
function space_courses_request(space_id, page, page_size, builder) {
    const course_prefix = "https://api.bilibili.com/pugv/app/web/season/page";
    const params = {
        mid: space_id.toString(),
        pn: page.toString(),
        ps: page_size.toString()
    };
    return builder.GET(create_url(course_prefix, params).toString(), {}, false);
}
function space_collections_request(space_id, page, page_size, builder) {
    const collection_prefix = "https://api.bilibili.com/x/polymer/web-space/seasons_series_list";
    const params = {
        mid: space_id.toString(),
        page_num: page.toString(),
        page_size: page_size.toString()
    };
    return builder.GET(create_signed_url(collection_prefix, params).toString(), { Cookie: `buvid3=${local_storage_cache.buvid3}` }, false);
}
function space_favorites_request(space_id, builder) {
    const favorites_prefix = "https://api.bilibili.com/x/v3/fav/folder/created/list-all";
    const params = {
        up_mid: space_id.toString()
    };
    return builder.GET(create_url(favorites_prefix, params).toString(), { "User-Agent": GRAYJAY_USER_AGENT }, false);
}
/*
// warning: makes up to 5 network requests in parallel
function get_space_contents(space_id: number, download_options: SpaceDownloadOption[]): Array<{
    response: SpaceVideosSearchResponse
    type: "videos"
} | {
    response: SpacePostsResponse
    type: "posts"
} | {
    response: SpaceCoursesResponse
    type: "courses"
} | {
    response: SpaceCollectionsResponse
    type: "collections"
} | {
    response: SpaceFavoritesResponse
    type: "favorites"
}> {
    // TODO if we can get cid caching working then use this api to load the cids for all videos and cache them
    // https://api.bilibili.com/x/v3/fav/resource/infos
    // it's used when viewing a favorites list
    const batch = http.batch()
    download_options.forEach((download_option) => {
        switch (download_option.type) {
            case "videos": {
                const space_contents_search_prefix = "https://api.bilibili.com/x/space/wbi/arc/search"
                const params: Params = {
                    mid: space_id.toString(),
                    pn: download_option.page.toString(),//"1",
                    ps: download_option.page_size.toString()//"25",
                }
                const url = create_signed_url(space_contents_search_prefix, params).toString()
                const b_nut = local_storage_cache.b_nut
                log(url)
                log(`buvid3=${local_storage_cache.buvid3};`)
                log(`buvid4=${local_storage_cache.buvid4};`)
                log(`b_nut=${b_nut};`)
                batch.GET(
                    url,
                    {
                        "User-Agent": GRAYJAY_USER_AGENT,
                        Cookie: `buvid4=${local_storage_cache.buvid4}; b_nut=${b_nut}`,
                        // Cookie: `buvid3=${local_storage_cache.buvid3}`,
                        Host: "api.bilibili.com",
                        Referer: "https://space.bilibili.com"
                    },
                    false)
                break
            }
            case "posts": {
                const space_post_feed_prefix = "https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space"
                const params: Params = download_option.offset ? {
                    host_mid: space_id.toString(),
                    offset: download_option.offset.toString()
                } : {
                    host_mid: space_id.toString()
                }
                batch.GET(
                    create_url(space_post_feed_prefix, params).toString(),
                    { Host: "api.bilibili.com", Cookie: `buvid3=${local_storage_cache.buvid3}`, "User-Agent": GRAYJAY_USER_AGENT },
                    false)
                break
            }
            case "courses": {
                const course_prefix = "https://api.bilibili.com/pugv/app/web/season/page"
                const params: Params = {
                    mid: space_id.toString(),
                    pn: download_option.page.toString(),//"1",
                    ps: download_option.page_size.toString()//"15"
                }
                batch.GET(create_url(course_prefix, params).toString(), {}, false)
                break
            }
            case "collections": {
                const collection_prefix = "https://api.bilibili.com/x/polymer/web-space/seasons_series_list"
                const params: Params = {
                    mid: space_id.toString(),
                    page_num: download_option.page.toString(),//"1",
                    page_size: download_option.page_size.toString()//"20"
                }
                batch.GET(
                    create_signed_url(collection_prefix, params).toString(),
                    { Cookie: `buvid3=${local_storage_cache.buvid3}` },
                    false)
                break
            }
            // note there is another section on the page https://space.bilibili.com/<space_id>/favlist
            // that has the users collected playlists. those are playlists created by others that the user has saved
            // we won't load these into the feed because they aren't their playlists
            // TODO we download everything every time. we should cache the result and use it
            case "favorites": {
                const favorites_prefix = "https://api.bilibili.com/x/v3/fav/folder/created/list-all"
                const params: Params = {
                    up_mid: space_id.toString()
                }
                batch.GET(
                    create_url(favorites_prefix, params).toString(),
                    { "User-Agent": GRAYJAY_USER_AGENT },
                    false
                )
                break
            }
            default:
                assert_no_fall_through(download_option)
                break
        }
    })

    const now = Date.now()
    const results = batch.execute()
    log(`BiliBili log: making ${results.length} network request(s) in parallel took ${Date.now() - now} milliseconds`)

    return download_options.map((download_option, index) => {
        switch (download_option.type) {
            case "videos": {
                const result = results[index]
                if (result === undefined) {
                    throw new ScriptException("unreachable")
                }
                return { response: JSON.parse(result.body), type: "videos" }
            }
            case "posts": {
                const result = results[index]
                if (result === undefined) {
                    throw new ScriptException("unreachable")
                }
                return { response: JSON.parse(result.body), type: "posts" }
            }
            case "courses": {
                const result = results[index]
                if (result === undefined) {
                    throw new ScriptException("unreachable")
                }
                return { response: JSON.parse(result.body), type: "courses" }
            }
            case "collections": {
                const result = results[index]
                if (result === undefined) {
                    throw new ScriptException("unreachable")
                }
                return { response: JSON.parse(result.body), type: "collections" }
            }
            case "favorites": {
                const result = results[index]
                if (result === undefined) {
                    throw new ScriptException("unreachable")
                }
                const response: SpaceFavoritesResponse = JSON.parse(result.body)
                if (response.data === null || response.data.list === null) {
                    return { response, type: "favorites" }
                }
                response.data.list = response.data.list.slice(download_option.page * download_option.page_size, download_option.page * download_option.page_size + download_option.page_size)
                return { response, type: "favorites" }
            }
            default:
                throw assert_no_fall_through(download_option, "unreachable")
        }
    })
}*/
function format_search_results(results) {
    return results.map((item) => {
        switch (item.type) {
            case "video": {
                const url = `${VIDEO_URL_PREFIX}${item.bvid}`;
                const video_id = new PlatformID(PLATFORM, item.bvid, plugin.config.id);
                const author_id = new PlatformID(PLATFORM, item.mid.toString(), plugin.config.id);
                const parsed_length = item.duration.match(/^(\d+):(\d+)/);
                if (parsed_length === null) {
                    throw new ScriptException("unreachable regex error");
                }
                const minutes = parsed_length[1];
                const seconds = parsed_length[2];
                if (minutes === undefined || seconds === undefined) {
                    throw new ScriptException("unreachable regex error");
                }
                const duration = parseInt(minutes) * 60 + parseInt(seconds);
                return new PlatformVideo({
                    id: video_id,
                    name: item.title,
                    url: url,
                    thumbnails: new Thumbnails([new Thumbnail(`https:${item.pic}`, 1080)]), // TODO hardcoded 1080
                    author: new PlatformAuthorLink(author_id, item.author, `${SPACE_URL_PREFIX}${item.mid}`, item.upic, local_storage_cache.space_cache.get(item.mid)?.num_fans),
                    duration,
                    viewCount: item.play,
                    isLive: false,
                    shareUrl: url,
                    uploadDate: item.pubdate
                });
            }
            case "live_room": {
                const url = `${LIVE_ROOM_URL_PREFIX}${item.roomid}`;
                const video_id = new PlatformID(PLATFORM, item.roomid.toString(), plugin.config.id);
                const author_id = new PlatformID(PLATFORM, item.uid.toString(), plugin.config.id);
                return new PlatformVideo({
                    id: video_id,
                    name: item.title,
                    url: url,
                    thumbnails: new Thumbnails([new Thumbnail(`https:${item.user_cover}`, 1080)]), // TODO hardcoded 1080
                    author: new PlatformAuthorLink(author_id, item.uname, `${SPACE_URL_PREFIX}${item.uid}`, `https:${item.uface}`, local_storage_cache.space_cache.get(item.uid)?.num_fans),
                    viewCount: item.watched_show.num,
                    isLive: true,
                    shareUrl: url,
                    // TODO assumes China timezone
                    uploadDate: (new Date(`${item.live_time} UTC+8`)).getTime() / 1000
                });
            }
            // TODO there are search result options for bangumi and courses. they show up with playlist metadata
            // we either need to load the first episode to display in the search results
            // or we need to be able to put playlists in search results
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
            // TODO this is duplicated below
            case "media_bangumi": {
                const first_episode = item.eps[0];
                if (first_episode === undefined) {
                    throw new ScriptException("unreachable");
                }
                const url = `${EPISODE_URL_PREFIX}${first_episode.id}`;
                const video_id = new PlatformID(PLATFORM, first_episode.id.toString(), plugin.config.id);
                const author_id = new PlatformID(PLATFORM, "item.uid.toString()", plugin.config.id);
                return new PlatformVideo({
                    id: video_id,
                    name: item.title,
                    url: url,
                    // TODO figure out if we should include both thumbnails
                    thumbnails: new Thumbnails([new Thumbnail(first_episode.cover, 1080), new Thumbnail(item.cover, 1080)]), // TODO hardcoded 1080
                    // TODO figure out what to do about bangumi authors
                    author: new PlatformAuthorLink(author_id, "item.uname", `${SPACE_URL_PREFIX}${"item.uid"}`, `https:${"item.uface"}`, 11),
                    // TODO hardcoded 0
                    viewCount: 0,
                    isLive: false,
                    shareUrl: url,
                    // TODO assumes China timezone
                    uploadDate: item.pubtime
                });
            }
            case "media_ft": {
                let first_episode;
                if (item.eps === null) {
                    if (item.ep_size !== 0) {
                        throw new ScriptException("unreachable");
                    }
                    // TODO copied from get content detail url parsing
                    const url = item.url;
                    const regex_match_result = url.match(CONTENT_DETAIL_URL_REGEX);
                    if (regex_match_result === null) {
                        throw new ScriptException(`malformed content url: ${url}`);
                    }
                    const maybe_content_id = regex_match_result[3];
                    if (maybe_content_id === undefined) {
                        throw new ScriptException("unreachable regex error");
                    }
                    first_episode = {
                        cover: undefined,
                        id: parseInt(maybe_content_id)
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
                const author_id = new PlatformID(PLATFORM, "item.uid.toString()", plugin.config.id);
                const thumbnails = [new Thumbnail(item.cover, 1080)];
                if (first_episode.cover !== undefined) {
                    thumbnails.push(new Thumbnail(first_episode.cover, 1080));
                }
                return new PlatformVideo({
                    id: video_id,
                    name: item.title,
                    url: url,
                    // TODO figure out if we should include both thumbnails
                    thumbnails: new Thumbnails(thumbnails), // TODO hardcoded 1080
                    // TODO figure out what to do about bangumi authors
                    author: new PlatformAuthorLink(author_id, "item.uname", `${SPACE_URL_PREFIX}${"item.uid"}`, `https:${"item.uface"}`, 11),
                    // TODO hardcoded 0
                    viewCount: 0,
                    isLive: false,
                    shareUrl: url,
                    // TODO assumes China timezone
                    uploadDate: item.pubtime
                });
            }
            case "bili_user":
                throw new ScriptException("unreachable");
            default:
                throw assert_no_fall_through(item, "unreachable");
        }
    });
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
    const buvid3 = local_storage_cache.buvid3;
    const runner = builder === undefined ? local_http : builder;
    const now = Date.now();
    const result = runner.GET(search_url, { "User-Agent": GRAYJAY_USER_AGENT, Cookie: `buvid3=${buvid3}` }, false);
    if (builder === undefined) {
        log_network_call(now);
    }
    return result;
}
// results and whether or not there are more results
function extract_search_results(raw_response, type, page, page_size) {
    if (type === "live") {
        const results = JSON.parse(raw_response.body);
        return {
            search_results: results.data.result.live_room,
            more: results.data.pageinfo.live_room.total > page * page_size
        };
    }
    const results = JSON.parse(raw_response.body);
    return {
        search_results: results.data.result,
        more: results.data.numResults > page * page_size
    };
}
function get_video_details_json(video_id) {
    // const cid = local_storage_cache.cid_cache.get(video_id)
    const detail_prefix = "https://api.bilibili.com/x/web-interface/wbi/view/detail";
    const params2 = {
        bvid: video_id
    };
    const info_url2 = create_signed_url(detail_prefix, params2);
    const buvid3 = local_storage_cache.buvid3;
    const url_prefix = "https://api.bilibili.com/x/player/wbi/playurl";
    const cid = local_storage_cache.cid_cache.get(video_id);
    // TODO there is duplicated code here for whether or not the cid is cached.
    // if it is we want to run the requests in parallel
    if (cid === undefined) {
        const detail_now = Date.now();
        const video_details_json = local_http.GET(info_url2.toString(), {
            Host: "api.bilibili.com",
            "User-Agent": CHROME_USER_AGENT,
            Referer: "https://www.bilibili.com",
            Cookie: `buvid3=${buvid3}`
        }, false).body;
        log(`BiliBili log: making 1 network request took ${Date.now() - detail_now} milliseconds`);
        const video_info = JSON.parse(video_details_json);
        const params = {
            bvid: video_id,
            fnval: "4048",
            cid: video_info.data.View.cid.toString(),
        };
        const info_url = create_signed_url(url_prefix, params);
        const play_now = Date.now();
        const video_play_json = local_http.GET(info_url.toString(), { "User-Agent": GRAYJAY_USER_AGENT }, false).body;
        log(`BiliBili log: making 1 network request took ${Date.now() - play_now} milliseconds`);
        const video_play = JSON.parse(video_play_json);
        return [video_info, video_play];
    }
    else {
        const batch = local_http.batch();
        batch.GET(info_url2.toString(), { Host: "api.bilibili.com", "User-Agent": CHROME_USER_AGENT, Referer: "https://www.bilibili.com", Cookie: `buvid3=${buvid3}` }, false);
        const params = {
            bvid: video_id,
            fnval: "4048",
            cid: cid.toString(),
        };
        const info_url = create_signed_url(url_prefix, params);
        batch.GET(info_url.toString(), { "User-Agent": GRAYJAY_USER_AGENT }, false);
        const now = Date.now();
        const [video_details_json, video_play_json] = batch.execute();
        log(`BiliBili log: making 2 network requests in parallel took ${Date.now() - now} milliseconds`);
        if (video_details_json === undefined || video_play_json === undefined) {
            throw new ScriptException("unreachable");
        }
        const video_info = JSON.parse(video_details_json.body);
        const video_play = JSON.parse(video_play_json.body);
        return [video_info, video_play];
    }
    // TODO subtitiles require login
    // https://api.bilibili.com/x/player/wbi/v2?aid=1402475665&cid=1487515536&isGaiaAvoided=false&web_location=1315873&w_rid=d0f2a387c3d7e19eb66f681e81b0385d&wts=1712248112
}
function fan_count_request(space_id, builder) {
    const space_stat_url_prefix = "https://api.bilibili.com/x/relation/stat";
    const url = create_url(space_stat_url_prefix, {
        vmid: space_id.toString()
    }).toString();
    return builder.GET(url, {}, false);
}
function space_request(space_id, builder) {
    const space_stat_url_prefix = "https://api.bilibili.com/x/space/wbi/acc/info";
    const params = {
        mid: space_id.toString(),
    };
    const url = create_signed_url(space_stat_url_prefix, params).toString();
    return builder.GET(url, {
        Referer: "https://www.bilibili.com",
        Host: "api.bilibili.com",
        "User-Agent": CHROME_USER_AGENT,
        Cookie: `buvid3=${local_storage_cache.buvid3}`
    }, false);
}
/*
function get_channel(space_id: number): [SpaceResponse, number] {
    const space_info_url_prefix = "https://api.bilibili.com/x/space/wbi/acc/info"
    const params: Params = {
        mid: space_id.toString(),
    }
    const batch = local_http.batch()
    batch.GET(
        create_signed_url(space_info_url_prefix, params).toString(),
        {
            Referer: "https://www.bilibili.com",
            Host: "api.bilibili.com",
            "User-Agent": CHROME_USER_AGENT,
            Cookie: `buvid3=${local_storage_cache.buvid3}`
        },
        false)
    batch.GET(
        create_url(
            "https://api.bilibili.com/x/relation/stat",
            { vmid: space_id.toString() }).toString(),
        {},
        false)
    const now = Date.now()
    const [space_result, stat_result] = batch.execute()
    log(`BiliBili log: making 2 network requests in parallel took ${Date.now() - now} milliseconds`)
    if (space_result === undefined || stat_result === undefined) {
        throw new ScriptException("unreachable")
    }
    const space: SpaceResponse = JSON.parse(space_result.body)
    const stats: { data: { follower: number } } = JSON.parse(stat_result.body)

    return [space, stats.data.follower]
}*/
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
class SpaceContentsPager extends ContentPager {
    page_size;
    next_page;
    posts_offset;
    space_id;
    has_more = {
        videos: false,
        posts: false,
        courses: false,
        collections: false,
        favorites: false
    };
    constructor(space_id) {
        const initial_page = 1;
        const page_size = {
            videos: 25,
            courses: 2,
            collections: 2,
            favorites: 2
        };
        const requests = [
            {
                request(builder) {
                    return space_videos_request(space_id, initial_page, page_size.videos, undefined, undefined, builder);
                },
                process(response) { return JSON.parse(response.body); }
            },
            {
                request(builder) { return space_posts_request(space_id, undefined, builder); },
                process(response) { return JSON.parse(response.body); }
            },
            {
                request(builder) { return space_courses_request(space_id, initial_page, page_size.courses, builder); },
                process(response) { return JSON.parse(response.body); }
            },
            {
                request(builder) {
                    return space_collections_request(space_id, initial_page, page_size.collections, builder);
                },
                process(response) { return JSON.parse(response.body); }
            },
            {
                request(builder) { return space_favorites_request(space_id, builder); },
                process(raw_response) {
                    const response = JSON.parse(raw_response.body);
                    if (response.data === null || response.data.list === null) {
                        return response;
                    }
                    response.data.list = response.data.list.slice(initial_page * page_size.favorites, initial_page * page_size.favorites + page_size.favorites);
                    return response;
                }
            }
        ];
        const contents = execute_requests(requests);
        const has_more = {
            videos: contents[0].data.page.count > initial_page * page_size.videos,
            posts: contents[1].data.has_more,
            courses: contents[2].data.page.next,
            collections: contents[3].data.items_lists.page.total > initial_page * page_size.collections,
            favorites: contents[4].data ? contents[4].data.count > initial_page * page_size.favorites : false
        };
        super(format_space_contents(space_id, contents[0], contents[1], contents[2], contents[3], contents[4]), has_more.videos || has_more.posts || has_more.courses || has_more.collections || has_more.favorites);
        this.next_page = 2;
        this.has_more = has_more;
        this.posts_offset = contents[1].data.offset;
        this.space_id = space_id;
        this.page_size = page_size;
    }
    nextPage() {
        const requests = [
            this.has_more.videos ? {
                request: (builder) => {
                    return space_videos_request(this.space_id, this.next_page, this.page_size.videos, undefined, undefined, builder);
                },
                process(response) { return JSON.parse(response.body); }
            } : undefined,
            this.has_more.posts ? {
                request: (builder) => { return space_posts_request(this.space_id, this.posts_offset, builder); },
                process(response) { return JSON.parse(response.body); }
            } : undefined,
            this.has_more.courses ? {
                request: (builder) => { return space_courses_request(this.space_id, this.next_page, this.page_size.courses, builder); },
                process(response) { return JSON.parse(response.body); }
            } : undefined,
            this.has_more.collections ? {
                request: (builder) => { return space_collections_request(this.space_id, this.next_page, this.page_size.collections, builder); },
                process(response) { return JSON.parse(response.body); }
            } : undefined,
            this.has_more.favorites ? {
                request: (builder) => { return space_favorites_request(this.space_id, builder); },
                process: (raw_response) => {
                    const response = JSON.parse(raw_response.body);
                    if (response.data === null || response.data.list === null) {
                        return response;
                    }
                    response.data.list = response.data.list.slice(this.next_page * this.page_size.favorites, this.next_page * this.page_size.favorites + this.page_size.favorites);
                    return response;
                }
            } : undefined
        ];
        const contents = execute_requests(requests);
        if (contents[0] !== undefined) {
            this.has_more.videos = contents[0].data.page.count > this.next_page * this.page_size.videos;
        }
        if (contents[1] !== undefined) {
            this.has_more.posts = contents[1].data.has_more;
            this.posts_offset = contents[1].data.offset;
        }
        if (contents[2] !== undefined) {
            this.has_more.courses = contents[2].data.page.next;
        }
        if (contents[3] !== undefined) {
            this.has_more.collections = contents[3].data.items_lists.page.total > this.next_page * this.page_size.collections;
        }
        if (contents[4] !== undefined) {
            this.has_more.favorites = contents[4].data ? contents[4].data.count > this.next_page * this.page_size.favorites : false;
        }
        this.results = format_space_contents(this.space_id, contents[0], contents[1], contents[2], contents[3], contents[4]);
        this.hasMore = this.has_more.videos || this.has_more.posts || this.has_more.courses || this.has_more.collections || this.has_more.favorites;
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
function format_space_results(space_search_results) {
    return space_search_results.map((result) => {
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
function format_space_videos(space_videos_response, space_id) {
    // TODO we should combine the get_channel network requests with the search in a single batch
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
    const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
    const author = new PlatformAuthorLink(author_id, space_info.name, `${SPACE_URL_PREFIX}${space_id}`, space_info.face, space_info.num_fans);
    return space_videos_response.data.list.vlist.map((space_video) => {
        const url = `${VIDEO_URL_PREFIX}${space_video.bvid}`;
        const video_id = new PlatformID(PLATFORM, space_video.bvid, plugin.config.id);
        const parsed_length = space_video.length.match(/^(\d+):(\d+)/);
        if (parsed_length === null) {
            throw new ScriptException("unreachable regex error");
        }
        const minutes = parsed_length[1];
        const seconds = parsed_length[2];
        if (minutes === undefined || seconds === undefined) {
            throw new ScriptException("unreachable regex error");
        }
        const duration = parseInt(minutes) * 60 + parseInt(seconds);
        return new PlatformVideo({
            id: video_id,
            name: space_video.title,
            url: url,
            thumbnails: new Thumbnails([new Thumbnail(space_video.pic, 1080)]), // TODO hardcoded 1080
            author,
            duration: duration,
            viewCount: space_video.play,
            isLive: false,
            shareUrl: url,
            uploadDate: space_video.created
        });
    });
}
/*
function search_space_videos(query: string, space_id: number, page: number, page_size: number, order: Order | null): SpaceVideosSearchResponse {
    const space_contents_search_prefix = "https://api.bilibili.com/x/space/wbi/arc/search"
    const params: Params = {
        mid: space_id.toString(),
        order: ((order): OrderOptions => {
            switch (order) {
                case Type.Order.Chronological:
                    return "pubdate"
                case Type.Order.Favorites:
                    return "stow"
                case Type.Order.Views:
                    return "click"
                case null:
                    return "pubdate"
                default:
                    throw new ScriptException(`unhandled ordering ${order}`)
            }
        })(order),
        query,
        pn: page.toString(),
        ps: page_size.toString(),
    }
    const url = create_signed_url(space_contents_search_prefix, params).toString()

    const json = http.GET(
        url,
        {
            "User-Agent": GRAYJAY_USER_AGENT,
            Cookie: `buvid3=${local_storage_cache.buvid3}`,
            Host: "api.bilibili.com"
        },
        false).body
    const search_response: SpaceVideosSearchResponse = JSON.parse(json)
    return search_response
}
*/
function search_space_posts(query, space_id, page, page_size) {
    const space_contents_search_prefix = "https://api.bilibili.com/x/space/dynamic/search";
    const params = {
        mid: space_id.toString(),
        keyword: query,
        pn: page.toString(),
        ps: page_size.toString(),
    };
    const url = create_url(space_contents_search_prefix, params).toString();
    const json = local_http.GET(url, {}, false).body;
    const search_response = JSON.parse(json);
    return search_response;
}
// TODO the post search results are really hard to parse. might be best to just load whole posts
// directly
function format_space_posts(response) {
    const space_posts_response = response;
    if (space_posts_response.data.cards === null) {
        return [];
    }
    return space_posts_response.data.cards.map((card) => {
        const post = JSON.parse(card.card);
        const space_id = card.desc.user_profile.info.uid;
        const author_id = new PlatformID(PLATFORM, space_id.toString(), plugin.config.id);
        const author = new PlatformAuthorLink(author_id, card.desc.user_profile.info.uname, `${SPACE_URL_PREFIX}${space_id}`, card.desc.user_profile.info.face, local_storage_cache.space_cache.get(space_id)?.num_fans);
        return new PlatformPost({
            // TODO currently there is a bug where this property is impossible to use
            thumbnails: [],
            images: [],
            description: post.item?.content ?? post.item?.description ?? "",
            // as far as i can tell posts don't have names
            name: "",
            url: `${POST_URL_PREFIX}${card.desc.dynamic_id_str}`,
            id: new PlatformID(PLATFORM, card.desc.dynamic_id_str, plugin.config.id),
            author,
            datetime: card.desc.timestamp
        });
    });
}
class ChannelPostsResultsPager extends ContentPager {
    next_page;
    page_size;
    space_id;
    query;
    constructor(query, space_id, initial_page, page_size) {
        const response = search_space_posts(query, space_id, initial_page, page_size);
        const more = response.data.total > initial_page * page_size;
        super(format_space_posts(response), more);
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.space_id = space_id;
        this.query = query;
    }
    nextPage() {
        const response = search_space_posts(this.query, this.space_id, this.next_page, this.page_size);
        this.results = format_space_posts(response);
        this.hasMore = response.data.total > this.next_page * this.page_size;
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
}
class ChannelVideoResultsPager extends ContentPager {
    next_page;
    page_size;
    space_id;
    query;
    order;
    constructor(query, space_id, initial_page, page_size, order) {
        const response = JSON.parse(space_videos_request(space_id, initial_page, page_size, query, order).body);
        const more = response.data.page.count > initial_page * page_size;
        super(format_space_videos(response, space_id), more);
        this.next_page = initial_page + 1;
        this.page_size = page_size;
        this.space_id = space_id;
        this.query = query;
        this.order = order;
    }
    nextPage() {
        const response_body = space_videos_request(this.space_id, this.next_page, this.page_size, this.query, this.order).body;
        const response = JSON.parse(response_body);
        this.results = format_space_videos(response, this.space_id);
        this.hasMore = response.data.page.count > this.next_page * this.page_size;
        this.next_page += 1;
        return this;
    }
    hasMorePagers() {
        return this.hasMore;
    }
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
    return suggestions_response.result.tag.map((entry) => entry.term);
}
class HomePager extends ContentPager {
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
function format_home(home) {
    return home.data.item.flatMap((item) => {
        switch (item.goto) {
            case "ad":
                return [];
            case "av": {
                // cache cid
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
                        uploadDate: item.pubdate
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
                        thumbnails: new Thumbnails([new Thumbnail(item.pic, 1080)]), // TODO hardcoded 1080
                        author: new PlatformAuthorLink(author_id, item.owner.name, `${SPACE_URL_PREFIX}${item.owner.mid}`, item.owner.face, fan_count),
                        viewCount: item.room_info.watched_show.num,
                        isLive: true,
                        shareUrl: `${LIVE_ROOM_URL_PREFIX}${item.id}`,
                        // TODO load from cache uploadDate:
                    })];
            }
            default:
                throw assert_no_fall_through(item, `unhandled type on home page item ${item}`);
        }
    });
}
// page starts at 0
// warning: makes a network request
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
    const home_json = local_http.GET(url, { Referer: "https://www.bilibili.com", Cookie: `buvid3=${local_storage_cache.buvid3}` }, false).body;
    log_network_call(now);
    const home_response = JSON.parse(home_json);
    return home_response;
}
function log_network_call(before_run_timestamp) {
    log(`BiliBili log: made 1 network request taking ${Date.now() - before_run_timestamp} milliseconds`);
}
function create_signed_url(base_url, params) {
    const augmented_params = {
        ...params,
        // timestamp
        wts: Math.round(Date.now() / 1e3).toString(),
        // device fingerprint values
        dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
        dm_img_inter: `{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}`,
        dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
        dm_img_list: "[]",
    };
    const sorted_query_string = Object.entries(augmented_params).sort((a, b) => a[0].localeCompare(b[0])).map(([name, value]) => {
        return `${name}=${encodeURIComponent(value)}`;
    }).join("&");
    const w_rid = md5(sorted_query_string + local_storage_cache.mixin_key);
    return new URL(`${base_url}?${sorted_query_string}&w_rid=${w_rid}`);
}
function create_url(base_url, params) {
    const url = new URL(base_url);
    Object.entries(params).forEach(([name, value]) => {
        url.searchParams.set(name, value);
    });
    return url;
}
// "https://s1.hdslb.com/bfs/seed/laputa-header/bili-header.umd.js"
function getMixinKey(e, encryption_info) {
    return encryption_info.filter((value) => {
        return e[value] !== undefined;
    }).map((value) => {
        return e[value];
    }).join("").slice(0, 32);
}
function download_mixin_constant() {
    const url = "https://s1.hdslb.com/bfs/seed/laputa-header/bili-header.umd.js";
    const mixin_constant_regex = /function getMixinKey\(e\){var t=\[\];return(.*?)\.forEach\(\(function\(r\){e\.charAt\(r\)&&t\.push\(e\.charAt\(r\)\)}\)\),t\.join\(""\)\.slice\(0,32\)}/;
    const now = Date.now();
    const html = local_http.GET(url, {}, false).body;
    log(`BiliBili log: making 1 network request took ${Date.now() - now} milliseconds`);
    const mixin_constant_json = html.match(mixin_constant_regex)?.[1];
    if (mixin_constant_json === undefined) {
        throw new ScriptException("failed to acquire mixin_constant");
    }
    return JSON.parse(mixin_constant_json);
}
function download_wbi_keys() {
    const url = "https://api.bilibili.com/x/web-interface/nav";
    const now = Date.now();
    const wbi_json = local_http.GET(url, {}, false).body;
    log(`BiliBili log: making 1 network request took ${Date.now() - now} milliseconds`);
    const res = JSON.parse(wbi_json);
    return {
        wbi_img_key: res.data.wbi_img.img_url.slice(29, 61),
        wbi_sub_key: res.data.wbi_img.sub_url.slice(29, 61)
    };
}
function create_b_nut() {
    return Math.floor((new Date).getTime() / 1e3);
}
// TODO buvid4 is working along with b_nut. we should switch everything from buvid3 to buvid4 plus b_nut
// this will make things simpler
function download_and_activate_buvid3_and_buvid4(b_nut) {
    // download a buvid3
    const finger_spi_url = "https://api.bilibili.com/x/frontend/finger/spi";
    const now = Date.now();
    const json = local_http.GET(finger_spi_url, {}, false).body;
    log(`BiliBili log: making 1 network request took ${Date.now() - now} milliseconds`);
    const finger_spi_response = JSON.parse(json);
    const buvid3 = finger_spi_response.data.b_3;
    const buvid4 = finger_spi_response.data.b_4;
    {
        // activate the cookie
        const cookie_activation_url = "https://api.bilibili.com/x/internal/gaia-gateway/ExClimbWuzhi";
        const now = Date.now();
        local_http.POST(cookie_activation_url, post_body_for_ExClimbWuzhi, {
            Cookie: `buvid3=${buvid3}; buvid4=${buvid4}; ${b_nut}`,
            "User-Agent": GRAYJAY_USER_AGENT,
            Host: "api.bilibili.com",
            "Content-Length": post_body_for_ExClimbWuzhi.length.toString(),
            "Content-Type": "application/json"
        }, false);
        log(`BiliBili log: making 1 network request took ${Date.now() - now} milliseconds`);
    }
    return { buvid3, buvid4 };
}
const post_body_for_ExClimbWuzhi = JSON.stringify({
    payload: JSON.stringify({
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
    })
});
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
//# sourceMappingURL=http://localhost:8080/BiliBiliScript.js.map