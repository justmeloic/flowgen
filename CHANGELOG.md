# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.0.0 (2025-08-24) - Architecture Designer Release

### 🎯 BREAKING CHANGES

- **Complete Application Transformation**: Transformed from general-purpose AI agent interface to specialized Architecture Designer
- **New Core Purpose**: AI-powered architecture solution design and Mermaid diagram generation
- **Updated System Instructions**: Specialized agent instructions for architecture design workflows

### ✨ Features

- **Architecture Design Agent**: Specialized AI agent for system architecture design and consultation
- **Mermaid Diagram Generation**: Real-time generation of comprehensive architecture diagrams
- **Requirements Gathering**: Intelligent questioning system to understand user needs and constraints
- **Pattern Recognition**: Automatic identification of suitable architectural patterns
- **Interactive Diagram Rendering**: Frontend integration for beautiful Mermaid diagram visualization
- **Design Session Continuity**: Persistent design sessions for iterative architecture refinement

### 🔧 Technical Updates

- **Backend API**: Updated from 'AgentChat API' to 'Architecture Designer API'
- **Agent Instructions**: Complete rewrite focused on architecture design methodology
- **Frontend Integration**: Added Mermaid.js for real-time diagram rendering
- **Package Updates**: Updated package names and descriptions across all services
- **Documentation**: Comprehensive documentation updates reflecting new architecture focus

### 📚 Documentation

- **README Updates**: Complete overhaul of project documentation
- **Architecture Diagrams**: New system architecture diagrams and workflow illustrations
- **Use Cases**: Added specific architecture design use cases and examples
- **API Documentation**: Updated API descriptions and endpoint documentation

### Previous Releases

### 0.5.4 (2025-08-08)

### Features

- Add 'New Conversation' button to sidebar for fresh conversation starts ([6cf4e73](https://github.com/justmeloic/agent-interface/commit/6cf4e7361235f5f987f9b7d62c2a88117086c193))
- add authenticated URL fall back instead of gutils URI ([7bccc34](https://github.com/justmeloic/agent-interface/commit/7bccc343a1b73b2942cd6c1d9a7141ddc2c729f4))
- add CN Railway CBA testdata and reference documents ([ef5a5ca](https://github.com/justmeloic/agent-interface/commit/ef5a5ca61cd2893b1ac4646ebe7f051955513034))
- add CN Railway internal terminology glossary to agent instructions ([014fa58](https://github.com/justmeloic/agent-interface/commit/014fa58c2536e6a4fa47d171dfb0e96ec26e75fb))
- add standard release support! ([c7bc421](https://github.com/justmeloic/agent-interface/commit/c7bc42162b4248951a7f9f2c6b3647c4d0a369b9))
- Add support for comma-separated citations in chat interface ([d83c4ed](https://github.com/justmeloic/agent-interface/commit/d83c4ed632982fba940688ef26ad098a44fa7e49))
- add TCRC Traffic Coordinator addenda to all Yard Coordinator entries ([268225b](https://github.com/justmeloic/agent-interface/commit/268225bcdf2fb017559ae7e55830477d5aeec2ed))
- add testdata files and update Agreement_Mapping_with_Filenames.csv with Yard Coordinator entries for all territories ([ab5e5c1](https://github.com/justmeloic/agent-interface/commit/ab5e5c1d89f45ec6c7bc340468776e56c657ac05))
- add version displace and version bump ([5ad5274](https://github.com/justmeloic/agent-interface/commit/5ad527492f79c3273fefddaba73f93f1b0a3ddac))
- better styling for tehme-toggle + gunicorn deps ([7204881](https://github.com/justmeloic/agent-interface/commit/7204881e5b01b36d428ff83d7b3563a72a236e62))
- chat homepage + doc page ([0ab68a8](https://github.com/justmeloic/agent-interface/commit/0ab68a81aed408395f12f096667b6f7b5957ae45))
- client-side authentication ([6bc107d](https://github.com/justmeloic/agent-interface/commit/6bc107dc44f3dee89e2f489bf8efb72b360de145))
- **deploy:** add gunicorn multiworker for prod serving ([251bc04](https://github.com/justmeloic/agent-interface/commit/251bc049c5d27508092ab1334b8144c52b461da5))
- **deploy:** include why explicitly install python3.11-venv on host machine ([44763b9](https://github.com/justmeloic/agent-interface/commit/44763b94dc87e114a66aa5b02c71d36cd01c2a17))
- **deploy:** Optimize for Raspberry Pi 5 deployment ([99ebd5d](https://github.com/justmeloic/agent-interface/commit/99ebd5dae62818f4b1bf25b57d5ef379200e1cbf))
- document processing instead of semantic search ([a43eef5](https://github.com/justmeloic/agent-interface/commit/a43eef53b74c963cd8a1b18e9d89cde0605f5267))
- final deploy script ([ef3c974](https://github.com/justmeloic/agent-interface/commit/ef3c974713cb8923bd438f9dfbc63ce56d99fb25))
- fuzzy role and territory matching ([0135c70](https://github.com/justmeloic/agent-interface/commit/0135c705c8944b25f87ca95bafe38fe02d935f66))
- gunicorn for multi-worker deployment ([380e823](https://github.com/justmeloic/agent-interface/commit/380e8232a8ac2def4a9e0bca64f46e114cfbada7))
- hideable reference panel ([ff5bdc6](https://github.com/justmeloic/agent-interface/commit/ff5bdc667403fef917d9068659bd24a67ef4cfe4))
- implement chat history persistence and request cancellation ([9b13e37](https://github.com/justmeloic/agent-interface/commit/9b13e377914d18fba2e3b8f038292584a6c8546d))
- implement comprehensive dark mode theme with improved UI styling ([e22899d](https://github.com/justmeloic/agent-interface/commit/e22899d4578a4c87d42d7836424d9b10392eb5a2)), closes [#1b1c1](https://github.com/justmeloic/agent-interface/issues/1b1c1) [#282a2](https://github.com/justmeloic/agent-interface/issues/282a2)
- implement cursive typewriter animation with minimal styling ([2b7fd09](https://github.com/justmeloic/agent-interface/commit/2b7fd09d36fbddf5db343ce5614f0f3638ad793c))
- implement interactive citation system with tooltips ([39f2141](https://github.com/justmeloic/agent-interface/commit/39f2141782b67c77ed261d4db653e84b8c51e6c6))
- Implement multi-model conversation continuity with seamless model switching ([62105b6](https://github.com/justmeloic/agent-interface/commit/62105b6161769af23dcef6b2a38e0ec63fcc137f))
- implement multi-model support for backend ([fe341bc](https://github.com/justmeloic/agent-interface/commit/fe341bcbb8b3b842305126b2e9218aba2ae5ecb2))
- Improve agent response format and reasoning ([fe4dc76](https://github.com/justmeloic/agent-interface/commit/fe4dc762207b8f9b7b1741911d959a770cd9a431))
- improve dark mode styling and centralize types ([d541f9a](https://github.com/justmeloic/agent-interface/commit/d541f9ae1dde8ea2a946fa848d94629fa7a5ed14))
- license header on source code ([ab3eae7](https://github.com/justmeloic/agent-interface/commit/ab3eae7acbb05315e9a86aef92cd754b550069fe))
- loading animation for agent avatar ([ae69a33](https://github.com/justmeloic/agent-interface/commit/ae69a33ce9d5df162d0a491d0974fef12fc58c0c))
- modular staticfrontend registered ([49aa00d](https://github.com/justmeloic/agent-interface/commit/49aa00d2560a4e8f2241fa07d9db1655b19d9dab))
- multi CORs ([d95149f](https://github.com/justmeloic/agent-interface/commit/d95149f6b2c4874368a627b89ff974ac1ca2d094))
- multi-worker serving with gunicorn ([d623fe7](https://github.com/justmeloic/agent-interface/commit/d623fe7cb9e33a416eb02a5caea3af3476c76d57))
- new gemini logo ([a126abe](https://github.com/justmeloic/agent-interface/commit/a126abe4ee178a67b98ab0db9a4e8d9d7287f6c4))
- optional name ([363f653](https://github.com/justmeloic/agent-interface/commit/363f653a5ded9a40c7b66c9482e3f4e64ef6f8ff))
- parallel document processing ([4f02508](https://github.com/justmeloic/agent-interface/commit/4f0250859cfe20caa0aeb1d3f61a2af1ecffb66c))
- port issues ([06efee7](https://github.com/justmeloic/agent-interface/commit/06efee72a131ba57cc05b4b46c424b2722cb4e6a))
- replaced the client-side authentication with a more secure server-side implementation ([7dd15d9](https://github.com/justmeloic/agent-interface/commit/7dd15d99c28040352e24151b4a1d47e1dc25edcb))
- server restart button 💥 ([f3e4410](https://github.com/justmeloic/agent-interface/commit/f3e44100c651db05d35d0f1d765426989ad6c5f5))
- Standardize logging and restructure API routes ([423904a](https://github.com/justmeloic/agent-interface/commit/423904a7d684a9c74ba220b69179f32fce53d165))
- Standardize logging using loguru ([b57a4ca](https://github.com/justmeloic/agent-interface/commit/b57a4caeffe178e284a2f12cf6aaeca8df72fa18))
- tooltip warming for server restart ([1043b53](https://github.com/justmeloic/agent-interface/commit/1043b53352845f12d3b7aa39dc760f6afc23e14e))
- update UI components styling ([65e340b](https://github.com/justmeloic/agent-interface/commit/65e340be5aa343d96ebbda5e2685b1f641beb785))
- updated deploy script ([4d4270b](https://github.com/justmeloic/agent-interface/commit/4d4270b5e8e0d98554c5b539e77c6b148d13655a))
- updated env files ([e553261](https://github.com/justmeloic/agent-interface/commit/e553261d6e039fe25b21098a928ffa67e3073c3b))
- updated reference panel ([4b6b8d2](https://github.com/justmeloic/agent-interface/commit/4b6b8d23a2d976bc0dfd55a5ee7735bc8a2b827e))
- using the setting model version for doc understanding & agent ([5005b11](https://github.com/justmeloic/agent-interface/commit/5005b11aa8a3c1b506da53bd17332aa7dcedf07c))
- variable ports ([c8bb4c7](https://github.com/justmeloic/agent-interface/commit/c8bb4c7ea47a7cd60ce53a0ffd1d3caa7fca3693))
- vm build and deployment scripts ([059545a](https://github.com/justmeloic/agent-interface/commit/059545ae733ce022d2ec6a6bbd0917bb0fd0a029))
- wrap text in input field and growing input box ([b51fafd](https://github.com/justmeloic/agent-interface/commit/b51fafda85482abc644d27e257e4e014c55608d5))

### Bug Fixes

- add gunicorn vs uvicorn deploy option ([0f7af4c](https://github.com/justmeloic/agent-interface/commit/0f7af4c38fd8c47aeb3a965233fb0dc0e74036b0))
- added logo locally so the rendering works offline ([b7dfe0a](https://github.com/justmeloic/agent-interface/commit/b7dfe0a9feff9037845669c2a30b344bd968399b))
- correct production IP/port binding ([7a63082](https://github.com/justmeloic/agent-interface/commit/7a6308202765f33b2cbb0ddb414b685fcf398444))
- decoupled build script to build and build-to-local sync isolated deployment env was failing to cp over static build ([03f0f32](https://github.com/justmeloic/agent-interface/commit/03f0f32149d38f93c0cf40bdf49924364d7a0392))
- implement conversation memory for role/territory persistence ([ca0fbf8](https://github.com/justmeloic/agent-interface/commit/ca0fbf89f796dd9f665f6dd728837635d884ba8c))
- improve deployment reliability by clearing all caches ([b5e93a9](https://github.com/justmeloic/agent-interface/commit/b5e93a9463ca3f1a952742c0ce1ebfc542f20a12))
- Improve license header management script with safer removal logic ([1a124e5](https://github.com/justmeloic/agent-interface/commit/1a124e539b59c627d9a9265a872e27bd0ae5807a))
- loading without SSE ([28b98e5](https://github.com/justmeloic/agent-interface/commit/28b98e589677b8a0932c677a429f12c388afc3ea))
- login data models modularized ([ed774a0](https://github.com/justmeloic/agent-interface/commit/ed774a0a5f28fb1b734c79cb4fd447237989435c))
- make login back statically styled ([fd0e35c](https://github.com/justmeloic/agent-interface/commit/fd0e35cceedb0d8781174aa68ab2b89e6511840e))
- moved global styling ([f7cae79](https://github.com/justmeloic/agent-interface/commit/f7cae793e5abb64386dbafe392383cddd241eced))
- only relying on adk for session management ([7c407b6](https://github.com/justmeloic/agent-interface/commit/7c407b613aafc9c7fdbd4391e71e8bcd1c5468fa))
- prevent agent from re-asking for role/territory when already provided ([87fd269](https://github.com/justmeloic/agent-interface/commit/87fd2692d83b8a27cadb4771cd4838cba8231b0e))
- prevent agent from re-asking role/territory on follow-up questions ([3499de8](https://github.com/justmeloic/agent-interface/commit/3499de8633bc8eb82fbd55a4a80bb549149da558))
- reformatted uv dependencies ([2dc0274](https://github.com/justmeloic/agent-interface/commit/2dc0274625fc5a8785d29d02db35d37bc71a15ff))
- remove multi-worker setup ([20eb304](https://github.com/justmeloic/agent-interface/commit/20eb3042c8f9258578c49a23551bdc2c960e2a0f))
- remove prod server reload ([e92f09a](https://github.com/justmeloic/agent-interface/commit/e92f09a08fa72705292940112c8b71bf3974390c))
- removed client side sessionID creation ([8e4e108](https://github.com/justmeloic/agent-interface/commit/8e4e10891981eaafb6230d48f9bc7b4bf3832a58))
- removed per-request authentication, leaving only session-level. ([a9e510a](https://github.com/justmeloic/agent-interface/commit/a9e510a57cf42ce5ae51595d4d3b623729bca6e2))
- removed root mapping ([8d10b6a](https://github.com/justmeloic/agent-interface/commit/8d10b6a4c1f93ec2dc79da1d8fef9077b6eb2e78))
- root tools ([4932de3](https://github.com/justmeloic/agent-interface/commit/4932de3e89e002d04d90865e30aeefaa65e6c63a))
- signed url error display ([bdd02bc](https://github.com/justmeloic/agent-interface/commit/bdd02bcb6b5afd7f1cd4df19d41d70665eab3c93))
- toast display ([ef3af9c](https://github.com/justmeloic/agent-interface/commit/ef3af9c3eb08b02ed5e9d29dede21591f24d8757))
- update yard mapping ([c3ba1b5](https://github.com/justmeloic/agent-interface/commit/c3ba1b55856c960e3a59c71580b60309bf37253d))
- updated port config and docs ([53a0e69](https://github.com/justmeloic/agent-interface/commit/53a0e69b3cefcf218ecb8921f6a142d611a67264))
- using one agent architecture to get around adk delegation issues ([7669b8d](https://github.com/justmeloic/agent-interface/commit/7669b8d3a62aa518acd9fcffe23311b82e08b733))
- view doc links ([bc88439](https://github.com/justmeloic/agent-interface/commit/bc884393193250245af860fde464e351c9ca3f01))
