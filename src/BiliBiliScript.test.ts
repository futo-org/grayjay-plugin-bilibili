import { describe, test } from "node:test"
import assert from "node:assert"
import "@grayjay/plugin/source.js"
import { getMixinKey, download_mixin_constant, interleave } from "./BiliBiliScript.js"
import { Params } from "./types.js"

/*
function bytesToHex(t: number[]) {
    let e = []
    let n = 0
    for (e = [], n = 0; n < t.length; n++) {
        const tn = t[n]
        if (tn === undefined) {
            throw new Error("tn error")
        }
        e.push((tn >>> 4).toString(16)),
            e.push((15 & tn).toString(16));
    }
    return e.join("")
}
function wordsToBytes(t: number[]): number[] {
    let e = []
    let n = 0
    for (e = [], n = 0; n < 32 * t.length; n += 8) {
        const tnshift = t[n >>> 5]
        if (tnshift === undefined) {
            throw new Error("tn error")
        }
        e.push(tnshift >>> 24 - n % 32 & 255);
    }
    return e
}
function bytesToWords(t: number[]): number[] {
    let e: number[] = []
    let n = 0
    let r = 0
    for (e = [], n = 0, r = 0; n < t.length; n++, r += 8) {
        const tn = t[n]
        if (tn === undefined) {
            throw new Error("tn error")
        }
        e[r >>> 5] |= tn << 24 - r % 32;
    }
    return e
}

function endian(t: any) {
    if (t.constructor == Number)
        return 16711935 & rotl(t, 8) | 4278255360 & rotl(t, 24);
    let e = 0
    for (e = 0; e < t.length; e++) {
        // const te = t[e]
        // if (te === undefined) {
        //     throw new Error("tn error")
        // }
        t[e] = endian(t[e]);
    }
    return t
}
function rotl(t: number, e: number) {
    return t << e | t >>> 32 - e
}
// function rotr(t: number, e: number) {
//     return t << 32 - e | t >>> e
// }

const C = {
    utf8: {
        stringToBytes: function (t: string) {
            return C.bin.stringToBytes(unescape(encodeURIComponent(t)))
        },
        bytesToString: function (t: number[]) {
            return decodeURIComponent(escape(C.bin.bytesToString(t)))
        }
    },
    bin: {
        stringToBytes: function (t: string) {
            let e = []
            let n = 0
            for (e = [], n = 0; n < t.length; n++) {
                e.push(255 & t.charCodeAt(n));
            }
            return e
        },
        bytesToString: function (t: number[]) {
            let e = []
            let n = 0
            for (e = [], n = 0; n < t.length; n++) {
                const tn = t[n]
                if (tn === undefined) {
                    throw new Error("tn error")
                }
                e.push(String.fromCharCode(tn));
            }
            return e.join("")
        }
    }
}

const R = function (t) {
    return null != t && (P(t) || function (t) {
        return "function" == typeof t.readFloatLE && "function" == typeof t.slice && P(t.slice(0, 0))
    }(t) || !!t._isBuffer)
}
function P(t) {
    return !!t.constructor && "function" == typeof t.constructor.isBuffer && t.constructor.isBuffer(t)
}

const _ff = function (t, e, n, r, o, i, a) {
    var c = t + (e & n | ~e & r) + (o >>> 0) + a;
    return (c << i | c >>> 32 - i) + e
}
const _gg = function (t, e, n, r, o, i, a) {
    var c = t + (e & r | n & ~r) + (o >>> 0) + a;
    return (c << i | c >>> 32 - i) + e
}
const _hh = function (t, e, n, r, o, i, a) {
    var c = t + (e ^ n ^ r) + (o >>> 0) + a;
    return (c << i | c >>> 32 - i) + e
}
const _ii = function (t, e, n, r, o, i, a) {
    var c = t + (n ^ (e | ~r)) + (o >>> 0) + a;
    return (c << i | c >>> 32 - i) + e
}

function o(i: string | number[]) {
    i.constructor == String ? i = false && false ? C.bin.stringToBytes(i) : C.utf8.stringToBytes(i) : R(i) ? i = Array.prototype.slice.call(i, 0) : Array.isArray(i) || i.constructor === Uint8Array || (i = i.toString());

    let c, u, s, l, f, p, d
    for (c = bytesToWords(i), u = 8 * i.length, s = 1732584193, l = -271733879, f = -1732584194, p = 271733878, d = 0; d < c.length; d++)
        c[d] = 16711935 & (c[d] << 8 | c[d] >>> 24) | 4278255360 & (c[d] << 24 | c[d] >>> 8);
    c[u >>> 5] |= 128 << u % 32,
        c[14 + (u + 64 >>> 9 << 4)] = u;
    let h = _ff
        , v = _gg
        , y = _hh
        , m = _ii;
    for (d = 0; d < c.length; d += 16) {
        let g = s
            , b = l
            , w = f
            , A = p;
        s = h(s, l, f, p, c[d + 0], 7, -680876936),
            p = h(p, s, l, f, c[d + 1], 12, -389564586),
            f = h(f, p, s, l, c[d + 2], 17, 606105819),
            l = h(l, f, p, s, c[d + 3], 22, -1044525330),
            s = h(s, l, f, p, c[d + 4], 7, -176418897),
            p = h(p, s, l, f, c[d + 5], 12, 1200080426),
            f = h(f, p, s, l, c[d + 6], 17, -1473231341),
            l = h(l, f, p, s, c[d + 7], 22, -45705983),
            s = h(s, l, f, p, c[d + 8], 7, 1770035416),
            p = h(p, s, l, f, c[d + 9], 12, -1958414417),
            f = h(f, p, s, l, c[d + 10], 17, -42063),
            l = h(l, f, p, s, c[d + 11], 22, -1990404162),
            s = h(s, l, f, p, c[d + 12], 7, 1804603682),
            p = h(p, s, l, f, c[d + 13], 12, -40341101),
            f = h(f, p, s, l, c[d + 14], 17, -1502002290),
            s = v(s, l = h(l, f, p, s, c[d + 15], 22, 1236535329), f, p, c[d + 1], 5, -165796510),
            p = v(p, s, l, f, c[d + 6], 9, -1069501632),
            f = v(f, p, s, l, c[d + 11], 14, 643717713),
            l = v(l, f, p, s, c[d + 0], 20, -373897302),
            s = v(s, l, f, p, c[d + 5], 5, -701558691),
            p = v(p, s, l, f, c[d + 10], 9, 38016083),
            f = v(f, p, s, l, c[d + 15], 14, -660478335),
            l = v(l, f, p, s, c[d + 4], 20, -405537848),
            s = v(s, l, f, p, c[d + 9], 5, 568446438),
            p = v(p, s, l, f, c[d + 14], 9, -1019803690),
            f = v(f, p, s, l, c[d + 3], 14, -187363961),
            l = v(l, f, p, s, c[d + 8], 20, 1163531501),
            s = v(s, l, f, p, c[d + 13], 5, -1444681467),
            p = v(p, s, l, f, c[d + 2], 9, -51403784),
            f = v(f, p, s, l, c[d + 7], 14, 1735328473),
            s = y(s, l = v(l, f, p, s, c[d + 12], 20, -1926607734), f, p, c[d + 5], 4, -378558),
            p = y(p, s, l, f, c[d + 8], 11, -2022574463),
            f = y(f, p, s, l, c[d + 11], 16, 1839030562),
            l = y(l, f, p, s, c[d + 14], 23, -35309556),
            s = y(s, l, f, p, c[d + 1], 4, -1530992060),
            p = y(p, s, l, f, c[d + 4], 11, 1272893353),
            f = y(f, p, s, l, c[d + 7], 16, -155497632),
            l = y(l, f, p, s, c[d + 10], 23, -1094730640),
            s = y(s, l, f, p, c[d + 13], 4, 681279174),
            p = y(p, s, l, f, c[d + 0], 11, -358537222),
            f = y(f, p, s, l, c[d + 3], 16, -722521979),
            l = y(l, f, p, s, c[d + 6], 23, 76029189),
            s = y(s, l, f, p, c[d + 9], 4, -640364487),
            p = y(p, s, l, f, c[d + 12], 11, -421815835),
            f = y(f, p, s, l, c[d + 15], 16, 530742520),
            s = m(s, l = y(l, f, p, s, c[d + 2], 23, -995338651), f, p, c[d + 0], 6, -198630844),
            p = m(p, s, l, f, c[d + 7], 10, 1126891415),
            f = m(f, p, s, l, c[d + 14], 15, -1416354905),
            l = m(l, f, p, s, c[d + 5], 21, -57434055),
            s = m(s, l, f, p, c[d + 12], 6, 1700485571),
            p = m(p, s, l, f, c[d + 3], 10, -1894986606),
            f = m(f, p, s, l, c[d + 10], 15, -1051523),
            l = m(l, f, p, s, c[d + 1], 21, -2054922799),
            s = m(s, l, f, p, c[d + 8], 6, 1873313359),
            p = m(p, s, l, f, c[d + 15], 10, -30611744),
            f = m(f, p, s, l, c[d + 6], 15, -1560198380),
            l = m(l, f, p, s, c[d + 13], 21, 1309151649),
            s = m(s, l, f, p, c[d + 4], 6, -145523070),
            p = m(p, s, l, f, c[d + 11], 10, -1120210379),
            f = m(f, p, s, l, c[d + 2], 15, 718787259),
            l = m(l, f, p, s, c[d + 9], 21, -343485551),
            s = s + g >>> 0,
            l = l + b >>> 0,
            f = f + w >>> 0,
            p = p + A >>> 0
    }
    console.log(i)
    return endian([s, l, f, p])
}
*/

const MIXIN_CONSTANT = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52] as const

describe("script module", () => {
    test("test disable", { skip: false }, () => {
        if (source.disable === undefined) {
            throw new Error("Missing disable method")
        }
        source.disable()
    })
    /*
    test("get video details", { skip: true }, () => {
        const result = get_video_details_json("BV1ZW4y1Q7Y4")
        assert.strictEqual(result[0].data.View.title, "被elo机制制裁的号到底有多难打\u{ff1f}",)
        assert.strictEqual(result[1].data.dash.duration, 164)
    })*/
    test("compute hash", { skip: true }, () => {
        {
            // const wts = Math.round(Date.now() / 1e3)
            const wts = 1711726858
            const params: Params = {
                dm_cover_img_str: "QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ",
                dm_img_inter: '{"ds":[{"t":0,"c":"","p":[246,82,82],"s":[56,5149,-1804]}],"wh":[4533,2116,69],"of":[461,922,461]}',
                dm_img_list: "[]",
                dm_img_str: "V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ",
                mid: "1939254464",
                // platform: "web",
                // token: "",
                // web_location: 1550101,
                wts: wts.toString()
            }
            console.log(params)
            // assert.strictEqual(compute_parameters(params), "dm_cover_img_str=QU5HTEUgKEludGVsLCBNZXNhIEludGVsKFIpIEhEIEdyYXBoaWNzIDUyMCAoU0tMIEdUMiksIE9wZW5HTCA0LjYpR29vZ2xlIEluYy4gKEludGVsKQ&dm_img_inter=%7B%22ds%22%3A%5B%7B%22t%22%3A0%2C%22c%22%3A%22%22%2C%22p%22%3A%5B246%2C82%2C82%5D%2C%22s%22%3A%5B56%2C5149%2C-1804%5D%7D%5D%2C%22wh%22%3A%5B4533%2C2116%2C69%5D%2C%22of%22%3A%5B461%2C922%2C461%5D%7D&dm_img_list=%5B%5D&dm_img_str=V2ViR0wgMS4wIChPcGVuR0wgRVMgMi4wIENocm9taXVtKQ&mid=1939254464&platform=web&token=&web_location=1550101&wts=1711726858&w_rid=8b43929329835b4a05707dc89b248ada")

        }
    })
    test("getMixinKey", { skip: true }, () => {
        const wbi_img_key = "7cd084941338484aae1ad9425b84077c"
        const wbi_sub_key = "4932caff0ff746eab6f01bf08b70ac45"
        const mixin_key = getMixinKey(wbi_img_key + wbi_sub_key, download_mixin_constant())
        assert.strictEqual(mixin_key, "ea1db124af3c7062474693fa704f4ff8")
    })
    test("get_mixin_constant", { skip: true }, () => {
        assert.deepStrictEqual(download_mixin_constant(), MIXIN_CONSTANT)
    })
    /*
    test("search", { skip: true }, () => {
        const results = get_video_search_results("empathy")
        const first_video = results.data.result[0]
        if (first_video === undefined) {
            throw new Error("no video results")
        }
        assert.strictEqual(first_video.title, "同理心的力量（The Power of <em class=\"keyword\">Empathy</em>）(真正完整超清版 简体字幕)")
    })*/
    /*
    test("comments", { skip: false }, () => {
        const results = get_comments(1502306778, 1, 1)
        const first_comment = results.data.replies[0]
        if (first_comment === undefined) {
            throw new Error("no comments")
        }
        log(first_comment.content.message)
        log(first_comment.ctime)
        log(new Date(first_comment.ctime * 1000))
        assert.strictEqual(first_comment.rpid, 215041646928)
    })*/
    test("interleave same length", { skip: false }, () => {
        const a = [1, 2, 3]
        const b = ["a", "b", "c"]
        assert.deepStrictEqual(interleave(a, b), [1, "a", 2, "b", 3, "c"])
    })
    test("interleave first longer", { skip: false }, () => {
        const a = [1, 2, 3, 4]
        const b = ["a", "b", "c"]
        assert.deepStrictEqual(interleave(a, b), [1, "a", 2, "b", 3, "c", 4])
    })
    /*
    test("posts", {skip: false}, () => {
        const buvid3 = get_buvid3()

        const cookie_activation_url = "https://api.bilibili.com/x/internal/gaia-gateway/ExClimbWuzhi"
        const body = String.raw`{"{"payload":"{\"5062\":1712258314864,\"39c8\":\"333.999.fp.risk\",\"920b\":\"0\",\"df35\":\"8D8CB6D2-AF0C-53DF-A3FE-611AE8DCFBFC12914infoc\",\"03bf\":\"https://space.bilibili.com/438074196/dynamic\",\"3c43\":{\"2673\":0,\"5766\":24,\"6527\":0,\"7003\":1,\"807e\":1,\"b8ce\":\"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36\",\"641c\":0,\"07a4\":\"en-US\",\"1c57\":8,\"0bd0\":8,\"748e\":[2560,1440],\"d61f\":[2560,1386],\"fc9d\":300,\"6aa9\":\"America/Chicago\",\"75b8\":1,\"3b21\":1,\"8a1c\":0,\"d52f\":\"not available\",\"adca\":\"Linux x86_64\",\"80c9\":[[\"PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"Chrome PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"Chromium PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"Microsoft Edge PDF Viewer\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]],[\"WebKit built-in PDF\",\"Portable Document Format\",[[\"application/pdf\",\"pdf\"],[\"text/pdf\",\"pdf\"]]]],\"13ab\":\"1eiwAAAAAElFTkSuQmCC\",\"bfe9\":\"QDFMhGAYCVjdUkigL2Ffg/2CYKtfwp4HgAAAAASUVORK5CYII=\",\"a3c1\":[\"extensions:ANGLE_instanced_arrays;EXT_blend_minmax;EXT_clip_control;EXT_color_buffer_half_float;EXT_depth_clamp;EXT_disjoint_timer_query;EXT_float_blend;EXT_frag_depth;EXT_polygon_offset_clamp;EXT_shader_texture_lod;EXT_texture_compression_bptc;EXT_texture_compression_rgtc;EXT_texture_filter_anisotropic;EXT_sRGB;KHR_parallel_shader_compile;OES_element_index_uint;OES_fbo_render_mipmap;OES_standard_derivatives;OES_texture_float;OES_texture_float_linear;OES_texture_half_float;OES_texture_half_float_linear;OES_vertex_array_object;WEBGL_blend_func_extended;WEBGL_color_buffer_float;WEBGL_compressed_texture_s3tc;WEBGL_compressed_texture_s3tc_srgb;WEBGL_debug_renderer_info;WEBGL_debug_shaders;WEBGL_depth_texture;WEBGL_draw_buffers;WEBGL_lose_context;WEBGL_multi_draw;WEBGL_polygon_mode\",\"webgl aliased line width range:[1, 2048]\",\"webgl aliased point size range:[1, 2048]\",\"webgl alpha bits:8\",\"webgl antialiasing:yes\",\"webgl blue bits:8\",\"webgl depth bits:24\",\"webgl green bits:8\",\"webgl max anisotropy:16\",\"webgl max combined texture image units:64\",\"webgl max cube map texture size:16384\",\"webgl max fragment uniform vectors:1024\",\"webgl max render buffer size:16384\",\"webgl max texture image units:32\",\"webgl max texture size:16384\",\"webgl max varying vectors:32\",\"webgl max vertex attribs:16\",\"webgl max vertex texture image units:32\",\"webgl max vertex uniform vectors:1024\",\"webgl max viewport dims:[16384, 16384]\",\"webgl red bits:8\",\"webgl renderer:WebKit WebGL\",\"webgl shading language version:WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)\",\"webgl stencil bits:0\",\"webgl vendor:WebKit\",\"webgl version:WebGL 1.0 (OpenGL ES 2.0 Chromium)\",\"webgl unmasked vendor:Google Inc. (AMD)\",\"webgl unmasked renderer:ANGLE (AMD, AMD Custom GPU 0405 (radeonsi vangogh LLVM 15.0.7), OpenGL 4.6)\",\"webgl vertex shader high float precision:23\",\"webgl vertex shader high float precision rangeMin:127\",\"webgl vertex shader high float precision rangeMax:127\",\"webgl vertex shader medium float precision:23\",\"webgl vertex shader medium float precision rangeMin:127\",\"webgl vertex shader medium float precision rangeMax:127\",\"webgl vertex shader low float precision:23\",\"webgl vertex shader low float precision rangeMin:127\",\"webgl vertex shader low float precision rangeMax:127\",\"webgl fragment shader high float precision:23\",\"webgl fragment shader high float precision rangeMin:127\",\"webgl fragment shader high float precision rangeMax:127\",\"webgl fragment shader medium float precision:23\",\"webgl fragment shader medium float precision rangeMin:127\",\"webgl fragment shader medium float precision rangeMax:127\",\"webgl fragment shader low float precision:23\",\"webgl fragment shader low float precision rangeMin:127\",\"webgl fragment shader low float precision rangeMax:127\",\"webgl vertex shader high int precision:0\",\"webgl vertex shader high int precision rangeMin:31\",\"webgl vertex shader high int precision rangeMax:30\",\"webgl vertex shader medium int precision:0\",\"webgl vertex shader medium int precision rangeMin:31\",\"webgl vertex shader medium int precision rangeMax:30\",\"webgl vertex shader low int precision:0\",\"webgl vertex shader low int precision rangeMin:31\",\"webgl vertex shader low int precision rangeMax:30\",\"webgl fragment shader high int precision:0\",\"webgl fragment shader high int precision rangeMin:31\",\"webgl fragment shader high int precision rangeMax:30\",\"webgl fragment shader medium int precision:0\",\"webgl fragment shader medium int precision rangeMin:31\",\"webgl fragment shader medium int precision rangeMax:30\",\"webgl fragment shader low int precision:0\",\"webgl fragment shader low int precision rangeMin:31\",\"webgl fragment shader low int precision rangeMax:30\"],\"6bc5\":\"Google Inc. (AMD)~ANGLE (AMD, AMD Custom GPU 0405 (radeonsi vangogh LLVM 15.0.7), OpenGL 4.6)\",\"ed31\":0,\"72bd\":1,\"097b\":0,\"52cd\":[10,0,0],\"a658\":[\"Arial\",\"Calibri\",\"Cambria\",\"Courier\",\"Courier New\",\"Helvetica\",\"Times\",\"Times New Roman\"],\"d02f\":\"124.04347527516074\"}}"}`
        log(body)
        http.POST(cookie_activation_url, body, { Cookie: `buvid3=${buvid3}`, "User-Agent": "Grayjay", Host: "api.bilibili.com", "Content-Length": "5391", "Content-Type": "application/json" }, false)

        const post_results = load_space_posts(438074196, buvid3)
        console.log(post_results)
    })*/
    /*
        test("load video", () => {
            
            const detail_prefix = "https://api.bilibili.com/x/web-interface/wbi/view/detail?"
            const params2: Params = {
                bvid: "BV1W1421S7SS",
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
            }
            const info_url2 = detail_prefix + compute_parameters(params2)
            const buvid4 = get_buvid4()
            // const buvid3 = "B7C4D1BF-A65F-EBFB-1F66-9BCE95A68FE112460infoc"
            const space_json2 = http.GET(info_url2, { Host: "api.bilibili.com", "User-Agent": "HTTPie",  Referer: "https://space.bilibili.com", Cookie: `buvid4=${buvid4}`  }, false).body
            log(space_json2)
            const res: {data: {View: {cid: number}}} = JSON.parse(space_json2)
            const cid = res.data.View.cid
    
    
            // avid=1101695476&bvid=BV1Aw4m1o7A8&cid=1466542760&web_location=1315873&w_rid=a1b1333d44dc87f7e33c2cfce4eef0f4&wts=1711737467
            const url_prefix = "https://api.bilibili.com/x/player/wbi/playurl?"
            const params: Params = {
                bvid: "BV1W1421S7SS",
                fnval: 4048,
                // fourk: 1,
                // fnver: 0,
                // avid: 1101695476,
                // cid: 1466542760,
                cid,
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
            }
            const info_url = url_prefix + compute_parameters(params)
            // const buvid3 = get_buvid3()
            const space_json = http.GET(info_url, { Host: "api.bilibili.com", "User-Agent": "HTTPie" }, false).body
            log(space_json)
        })*/
})