import { describe, test } from "node:test"
import assert from "node:assert"
import "@grayjay/plugin/source.js"
import { get_jwt } from "./script.js"

describe("script module", () => {
    test("get jwt", () => {
        const result = get_jwt()
        assert.strictEqual(result.length, 196)
    })
    test("test disable", () => {
        if (source.disable === undefined){
            throw new Error("Missing disable method")
        }
        source.disable()
    })
})
