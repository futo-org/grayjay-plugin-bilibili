import { describe, test } from "node:test"
import assert from "node:assert"
import "@grayjay/plugin/source.js"
import { get_jwt, get_video_details_json } from "./script.js"

describe("script module", () => {
    test("get jwt", () => {
        const result = get_jwt()
        assert.strictEqual(result.length, 196)
    })
    test("test disable", () => {
        if (source.disable === undefined) {
            throw new Error("Missing disable method")
        }
        source.disable()
    })
    test("get video details", () => {
        const result = get_video_details_json("https://www.bilibili.com/video/BV1ZW4y1Q7Y4")
        assert.strictEqual(164, result[0].data.dash.duration)
        assert.strictEqual("被elo机制制裁的号到底有多难打？", result[1].videoData.title)
    })
})
