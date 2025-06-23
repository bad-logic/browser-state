import {defineManifest} from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest(async () => ({
    manifest_version: 3,
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    permissions: [
        "activeTab",
        "storage",
        "webNavigation",
        "webRequest",
        "debugger"
        // "webRequestBlocking",
    ],
    background: {
        "service_worker": "background.js",
        "type": "module"
    },
    content_scripts: [
        {
            "matches": ["<all_urls>"],
            "js": ["content.js"]
        }
    ],
    action: {
        "default_popup": "index.html"
    },
    host_permissions: [
        "http://*/",
        "https://*/"
    ]
}))

