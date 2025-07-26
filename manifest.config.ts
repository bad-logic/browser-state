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
        "debugger"
    ],
    background: {
        "service_worker": "scripts/background.js",
        "type": "module"
    },
    content_scripts: [
        {
            "matches": ["<all_urls>"],
            "js": ["scripts/content.js"]
        }
    ],
    action: {
        "default_popup": "index.html",
        "default_icon": {
            "16": "icons/logo.png",
            "32": "icons/logo.png",
            "48": "icons/logo.png",
            "128": "icons/logo.png"
        },
    },
    "icons": {
        "16": "icons/logo.png",
        "32": "icons/logo.png",
        "48": "icons/logo.png",
        "128": "icons/logo.png"
    },

}))

