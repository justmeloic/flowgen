# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.5.5](https://github.com/justmeloic/flowgen/compare/v0.5.4...v0.5.5) (2025-08-26)


### Features

* add cloud platform-specific architecture guidance ([e64c3f4](https://github.com/justmeloic/flowgen/commit/e64c3f419e0aecad7346a93b58fdfed52b4c3910))
* add expand button to agent replies ([2dbe868](https://github.com/justmeloic/flowgen/commit/2dbe868d31ef6a9be4badcd11e4fb7925830781e))
* add general platform agnostic as an option ([9e7ceca](https://github.com/justmeloic/flowgen/commit/9e7ceca5dccc1bb9e880bd59cbd228aef2bc1e2b))
* add general platform agnostic as an option ([4af224b](https://github.com/justmeloic/flowgen/commit/4af224b46f21af09ab73a29f338f36fdcef5ec1e))
* **backend:** integrate Gemini Pro for Mermaid diagram tool, add system instruction, sanitize Mermaid output; keep output schema stable; add google-genai dep ([83760f2](https://github.com/justmeloic/flowgen/commit/83760f2aa58c6846f20f87839d2908a352aae2a0))
* enhance diagram panel UI with improved spacing and dark theme code view ([2f3754e](https://github.com/justmeloic/flowgen/commit/2f3754e5ee63b11833a3f96e56cba70aeb18f63e))
* fix audio recording functionality and improve file upload handling ([0b8006c](https://github.com/justmeloic/flowgen/commit/0b8006cccfab5588248aa42fdcf5c7272708442c))
* **frontend:** hide top chat button when sidebar is expanded and persist sidebar state\n\n- Broadcast typed sidebarToggled events\n- Listen in chat page and hide duplicate button when expanded\n- Persist isCollapsed to localStorage with safe hydration\n- Add events.d.ts for typed CustomEvent detail\n- Add focus-visible ring for a11y on top button ([527f947](https://github.com/justmeloic/flowgen/commit/527f947fcd362ee221ca012a7b082a7d0acf54f9))
* **frontend:** replace model selector with new conversation button ([b9bde98](https://github.com/justmeloic/flowgen/commit/b9bde98bb842a1fb5ad17d239df1f4a4dd7d8745))
* improve diagram modal UX, centering, and blur effects ([5ca5db4](https://github.com/justmeloic/flowgen/commit/5ca5db49564927c129c68f37bcdfa5cb22f8a296))
* made the unexpand button fix ([4064b35](https://github.com/justmeloic/flowgen/commit/4064b3556a3ef67fa7a4ec48daa4692a4f7230df))
* remove authentication system ([0c2b3d7](https://github.com/justmeloic/flowgen/commit/0c2b3d74b325dac651f5f60222a1341eb1b15f01))
* remove google search tool and implement diagram generation functionality ([fdf89f3](https://github.com/justmeloic/flowgen/commit/fdf89f301d79cb02f4bf2d6b847338562dac4010))
* transform to Architecture Designer ([fa26753](https://github.com/justmeloic/flowgen/commit/fa267538d01ccb3f05ab7fabb558bf773eaf1165))
* **ui:** Modernize documentation page color theme ([65ac0bc](https://github.com/justmeloic/flowgen/commit/65ac0bc4b21069d951970d0b1e3af347123ee481))
* **ui:** redesign diagram panel as centered modal with improved UX ([10324ab](https://github.com/justmeloic/flowgen/commit/10324ab72fcb357967532a17101b994c2ac24875))


### Bug Fixes

* center diagram in panel and improve PNG export resolution ([c49670c](https://github.com/justmeloic/flowgen/commit/c49670c22bafad1d3fc02f5eb4b77ff3559defe7))
* enhance Mermaid diagram rendering and error handling ([a5d3792](https://github.com/justmeloic/flowgen/commit/a5d379238fa6cfa827258f86defeba7eecb85298))
* update postprocessing/sanitization of diagram ([5d17f18](https://github.com/justmeloic/flowgen/commit/5d17f18a5db7b321e4702a943c96d88b0bea22c2))
