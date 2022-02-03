# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [1.2.6](https://github.com/furystack/multiverse/compare/@common/service-utils@1.2.5...@common/service-utils@1.2.6) (2022-02-03)

**Note:** Version bump only for package @common/service-utils






### [1.2.5](https://github.com/furystack/multiverse/compare/@common/service-utils@1.2.4...@common/service-utils@1.2.5) (2021-11-17)

**Note:** Version bump only for package @common/service-utils






### [1.2.4](https://github.com/furystack/multiverse/compare/@common/service-utils@1.2.3...@common/service-utils@1.2.4) (2021-11-09)


### 🐛 Bug Fixes

* **@service/media,@service/auth:** move files from temp ([752e0bd](https://github.com/furystack/multiverse/commit/752e0bdf70364021af986d419665db36e56b456d))




### [1.2.3](https://github.com/furystack/multiverse/compare/@common/service-utils@1.2.2...@common/service-utils@1.2.3) (2021-11-09)

**Note:** Version bump only for package @common/service-utils






### [1.2.2](https://github.com/furystack/multiverse/compare/@common/service-utils@1.2.1...@common/service-utils@1.2.2) (2021-10-15)

**Note:** Version bump only for package @common/service-utils






### [1.2.1](https://github.com/furystack/multiverse/compare/@common/service-utils@1.2.0...@common/service-utils@1.2.1) (2021-10-05)

**Note:** Version bump only for package @common/service-utils






## 1.2.0 (2021-09-16)


### 🚀 What's new

* **avatars:** fallback, fetch on 3rd party registration ([f74be3e](https://github.com/furystack/multiverse/commit/f74be3e57e2dbefef7abd5cb1383d5336a73e652))
* **common:** DB logger ([752011f](https://github.com/furystack/multiverse/commit/752011fb0efa73a828ef6e2a5612f04b60e14a86))
* **common:** DB Logger AppName ([1d562fb](https://github.com/furystack/multiverse/commit/1d562fba58e8d05b92b0ee00b365849f220f3a94))
* **logg-r:** log entries from repository ([6baed01](https://github.com/furystack/multiverse/commit/6baed01618721030af0d0174f773262e736ecc2f))
* **profile:** Upload Avatar Image ([#12](https://github.com/furystack/multiverse/issues/12)) ([2705244](https://github.com/furystack/multiverse/commit/2705244f3670f46f2529adc61156c8593e14fd6a))
* **project:** slack logging ([d9a0817](https://github.com/furystack/multiverse/commit/d9a08174e29fe767f3c37747a4f962083748ba7c))
* **project:** slack messaging improvements ([bc56407](https://github.com/furystack/multiverse/commit/bc564075f2cefe984de0a37bd7cb043b7a3e0cbf))
* **project:** updated dependencies, cleaned up worker log, added polling to media lib watcher ([4c4338c](https://github.com/furystack/multiverse/commit/4c4338c6792e5ccf4f0f7a4602df4009a1a46184))
* **service-utils:** wired exit-handler on sigterm ([c5e4ded](https://github.com/furystack/multiverse/commit/c5e4ded5fa85a483c6e038091bc9f455d02d488d))
* **services:** custom shutdown handler ([3d94c34](https://github.com/furystack/multiverse/commit/3d94c34dd4cbb5e0959018a724c91aef744f3cf4))
* **services:** existsAsync wrapper for access, removed existsSync calls ([d9d5fe1](https://github.com/furystack/multiverse/commit/d9d5fe12a71b65cd7b9d73dedf1f438a6591b0b5))
* **shutdown:** improved shutdown messages ([95a32ec](https://github.com/furystack/multiverse/commit/95a32ec86cd86bec21b54675d35b68195eacaab7))
* **wrap-r:** sys log ([771d8c3](https://github.com/furystack/multiverse/commit/771d8c30dfee89cfaae86bebbe29f0f492fd8d7c))
* **xpense:** service skeleton, UI stub ([#6](https://github.com/furystack/multiverse/issues/6)) ([672a179](https://github.com/furystack/multiverse/commit/672a17962a58641713651b0078a9fbcf05efc658))


### 🐛 Bug Fixes

* **common:** namespace casing ([b5f932e](https://github.com/furystack/multiverse/commit/b5f932e13fbdb4870baec1521a501b42f52b07e4))
* **mongo:** added useUnifiedTopology ([cd7f080](https://github.com/furystack/multiverse/commit/cd7f08079ed76b84693882fe9287cb32edf062d5))
* **service-utils:** remove event listeners on exit ([2330e3f](https://github.com/furystack/multiverse/commit/2330e3f834450abe4eadc2c0be0dc2abc4162fa8))
* **service-utils:** removed sigkill ([1e5e059](https://github.com/furystack/multiverse/commit/1e5e05919efe789f01c1feccf5973e6327bec0c5))
* **service-utils:** Slack logger as Singleton ([27bbb18](https://github.com/furystack/multiverse/commit/27bbb18fbe9cf6a0205f9998f9a67162bfd261d2))
* **slack-logger:** await send slack message ([70cf414](https://github.com/furystack/multiverse/commit/70cf414006a3a206fc74bd5e852dc6a8087923a4))
* **slack-logger:** Log level as String ([3393428](https://github.com/furystack/multiverse/commit/3393428cf906f910916b09020c3b5d89f93f30c1))




## 1.1.0 (2021-07-30)


### 🚀 What's new

* **avatars:** fallback, fetch on 3rd party registration ([f74be3e](https://github.com/furystack/multiverse/commit/f74be3e57e2dbefef7abd5cb1383d5336a73e652))
* **common:** DB logger ([752011f](https://github.com/furystack/multiverse/commit/752011fb0efa73a828ef6e2a5612f04b60e14a86))
* **common:** DB Logger AppName ([1d562fb](https://github.com/furystack/multiverse/commit/1d562fba58e8d05b92b0ee00b365849f220f3a94))
* **logg-r:** log entries from repository ([6baed01](https://github.com/furystack/multiverse/commit/6baed01618721030af0d0174f773262e736ecc2f))
* **profile:** Upload Avatar Image ([#12](https://github.com/furystack/multiverse/issues/12)) ([2705244](https://github.com/furystack/multiverse/commit/2705244f3670f46f2529adc61156c8593e14fd6a))
* **project:** slack logging ([d9a0817](https://github.com/furystack/multiverse/commit/d9a08174e29fe767f3c37747a4f962083748ba7c))
* **project:** slack messaging improvements ([bc56407](https://github.com/furystack/multiverse/commit/bc564075f2cefe984de0a37bd7cb043b7a3e0cbf))
* **project:** updated dependencies, cleaned up worker log, added polling to media lib watcher ([4c4338c](https://github.com/furystack/multiverse/commit/4c4338c6792e5ccf4f0f7a4602df4009a1a46184))
* **service-utils:** wired exit-handler on sigterm ([c5e4ded](https://github.com/furystack/multiverse/commit/c5e4ded5fa85a483c6e038091bc9f455d02d488d))
* **services:** custom shutdown handler ([3d94c34](https://github.com/furystack/multiverse/commit/3d94c34dd4cbb5e0959018a724c91aef744f3cf4))
* **services:** existsAsync wrapper for access, removed existsSync calls ([d9d5fe1](https://github.com/furystack/multiverse/commit/d9d5fe12a71b65cd7b9d73dedf1f438a6591b0b5))
* **shutdown:** improved shutdown messages ([95a32ec](https://github.com/furystack/multiverse/commit/95a32ec86cd86bec21b54675d35b68195eacaab7))
* **wrap-r:** sys log ([771d8c3](https://github.com/furystack/multiverse/commit/771d8c30dfee89cfaae86bebbe29f0f492fd8d7c))
* **xpense:** service skeleton, UI stub ([#6](https://github.com/furystack/multiverse/issues/6)) ([672a179](https://github.com/furystack/multiverse/commit/672a17962a58641713651b0078a9fbcf05efc658))


### 🐛 Bug Fixes

* **common:** namespace casing ([b5f932e](https://github.com/furystack/multiverse/commit/b5f932e13fbdb4870baec1521a501b42f52b07e4))
* **mongo:** added useUnifiedTopology ([cd7f080](https://github.com/furystack/multiverse/commit/cd7f08079ed76b84693882fe9287cb32edf062d5))
* **service-utils:** remove event listeners on exit ([2330e3f](https://github.com/furystack/multiverse/commit/2330e3f834450abe4eadc2c0be0dc2abc4162fa8))
* **service-utils:** removed sigkill ([1e5e059](https://github.com/furystack/multiverse/commit/1e5e05919efe789f01c1feccf5973e6327bec0c5))
* **service-utils:** Slack logger as Singleton ([27bbb18](https://github.com/furystack/multiverse/commit/27bbb18fbe9cf6a0205f9998f9a67162bfd261d2))
* **slack-logger:** await send slack message ([70cf414](https://github.com/furystack/multiverse/commit/70cf414006a3a206fc74bd5e852dc6a8087923a4))
* **slack-logger:** Log level as String ([3393428](https://github.com/furystack/multiverse/commit/3393428cf906f910916b09020c3b5d89f93f30c1))
