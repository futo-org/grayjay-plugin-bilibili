import { createServer } from "node:http"
import { networkInterfaces } from 'os'
import { readFile } from "node:fs/promises"

const PORT = 8080

// Define a map of files to serve
const files = {
    "/build/BiliBiliScript.js": {
        content: await readFile("build/BiliBiliScript.js"),
        type: "application/javascript",
    },
    "/build/BiliBiliScript.ts": {
        content: await readFile("build/BiliBiliScript.ts"),
        type: "application/x-typescript",
    },
    "/build/BiliBiliScript.js.map": {
        content: await readFile("build/BiliBiliScript.js.map"),
        type: "application/json",
    },
    "/build/BiliBiliConfig.json": {
        content: await readFile("build/BiliBiliConfig.json"),
        type: "application/json",
    },
    "/build/BiliBiliIcon.png": {
        content: await readFile("build/BiliBiliIcon.png"),
        type: "image/png",
    },
} as const

function getLocalIPAddress(): string {
    const br = networkInterfaces()
    const network_devices = Object.values(br)
    if (network_devices !== undefined) {
        for (const network_interface of network_devices) {
            if (network_interface === undefined) {
                continue
            }
            for (const { address, family } of network_interface) {
                if (family === "IPv4" && address !== "127.0.0.1") {
                    return address
                }
            }

        }
    }
    throw new Error("panic")
}

createServer((req, res) => {
    const file = (() => {
        switch (req.url) {
            case "/build/BiliBiliScript.js":
                return files[req.url]
            case "/build/BiliBiliScript.ts":
                return files[req.url]
            case "/build/BiliBiliScript.js.map":
                return files[req.url]
            case "/build/BiliBiliConfig.json":
                return files[req.url]
            case "/build/BiliBiliIcon.png":
                return files[req.url]
            default:
                return undefined
        }
    })()

    if (file !== undefined) {
        res.writeHead(200, { "Content-Type": file.type })
        res.end(file.content)
        return
    }

    res.writeHead(404)
    res.end("File not found")
    return
}).listen(PORT, () => {
    console.log(`Server running at http://${getLocalIPAddress()}:${PORT}`)
})