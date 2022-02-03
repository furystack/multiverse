# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [1.3.1](https://github.com/furystack/multiverse/compare/@worker/media-encoder@1.3.0...@worker/media-encoder@1.3.1) (2022-02-03)

**Note:** Version bump only for package @worker/media-encoder






## [1.3.0](https://github.com/furystack/multiverse/compare/@worker/media-encoder@1.2.4...@worker/media-encoder@1.3.0) (2021-11-17)


### 🚀 What's new

* **@service/media:** Display episodes on Series screen ([b3a8433](https://github.com/furystack/multiverse/commit/b3a84331ae52f625bd1b9899df4741487941e117))




### [1.2.4](https://github.com/furystack/multiverse/compare/@worker/media-encoder@1.2.3...@worker/media-encoder@1.2.4) (2021-11-09)

**Note:** Version bump only for package @worker/media-encoder






### [1.2.3](https://github.com/furystack/multiverse/compare/@worker/media-encoder@1.2.2...@worker/media-encoder@1.2.3) (2021-11-09)

**Note:** Version bump only for package @worker/media-encoder






### [1.2.2](https://github.com/furystack/multiverse/compare/@worker/media-encoder@1.2.1...@worker/media-encoder@1.2.2) (2021-10-15)

**Note:** Version bump only for package @worker/media-encoder






### [1.2.1](https://github.com/furystack/multiverse/compare/@worker/media-encoder@1.2.0...@worker/media-encoder@1.2.1) (2021-10-05)

**Note:** Version bump only for package @worker/media-encoder






## 1.2.0 (2021-09-16)


### 🚀 What's new

* **encode-task:** subtitle mapping ([8b5cd57](https://github.com/furystack/multiverse/commit/8b5cd57846993de815774926838c1a0277db7835))
* **encoder:** updated progress page, task details, fixes on worker stability and requeue ([fe7daf0](https://github.com/furystack/multiverse/commit/fe7daf02be7a0f3d77a54c6673d2f8ea06d04fa6))
* **media-encoder:** improved logging ([abe5207](https://github.com/furystack/multiverse/commit/abe5207c5095f2d4b8232d0aab37cc176df0d37b))
* **media-encoder:** retry on connection failure ([8d5ca24](https://github.com/furystack/multiverse/commit/8d5ca2439f7d5a0e4e83e36121532e279b870661))
* **media-encoder:** save run log on task finialize ([179dadf](https://github.com/furystack/multiverse/commit/179dadf3836e9a6a2704e39a0a9d8faf5a925256))
* **media-encoder:** warns on failed chunk uploads ([eeeaed1](https://github.com/furystack/multiverse/commit/eeeaed12fbee4d4586455870dcee232edc98710f))
* **media:** encoding progress overview ([f75a6b2](https://github.com/furystack/multiverse/commit/f75a6b2f5795104fa87e5cf87c107ae618d46d97))
* **media:** encoding, audio, etc... ([6c8a08c](https://github.com/furystack/multiverse/commit/6c8a08c3784ab2d4f8a001c38246933f75cca57b))
* **project:** updated dependencies, cleaned up worker log, added polling to media lib watcher ([4c4338c](https://github.com/furystack/multiverse/commit/4c4338c6792e5ccf4f0f7a4602df4009a1a46184))
* **services:** existsAsync wrapper for access, removed existsSync calls ([d9d5fe1](https://github.com/furystack/multiverse/commit/d9d5fe12a71b65cd7b9d73dedf1f438a6591b0b5))
* **sites:** proxy & rules ([c195817](https://github.com/furystack/multiverse/commit/c19581720f8c411466d9eed564d082fd99516047))


### 🐛 Bug Fixes

* **chunk-uploader:** fixed upload on no progress info ([5a716e8](https://github.com/furystack/multiverse/commit/5a716e842ef5afdd2c592a9894c89ff9741afd44))
* **media-encoder:** audio tracks ([be44410](https://github.com/furystack/multiverse/commit/be444102140231ab224db6a69ed60a33d7a7d933))
* **media-encoder:** await chunk uploader to finish ([61f0ef0](https://github.com/furystack/multiverse/commit/61f0ef0857180b192ffc9499eac24917312a4296))
* **media-encoder:** finialize url ([7904ac0](https://github.com/furystack/multiverse/commit/7904ac07463f51df2bf9cd179ccc376151cd0f07))
* **media-encoder:** logger injectable ([b0172cb](https://github.com/furystack/multiverse/commit/b0172cb0952583bf3008ffff0fc824168fe00174))
* **media-encoder:** prefetch before consume ([9ec63b9](https://github.com/furystack/multiverse/commit/9ec63b9f26e83a554e2ad946a75d831bd036f565))
* **media-encoder:** temp dir check before taking task ([de97af7](https://github.com/furystack/multiverse/commit/de97af78a4350602a9120c8219ccb5a6d50734ae))
* **media-encoder:** try to destroy form after upload ([f3c922f](https://github.com/furystack/multiverse/commit/f3c922fdb0236cdc97996b891f728c4b5ad08962))
* **media-encoder:** upload retries and worker fixes ([061d82a](https://github.com/furystack/multiverse/commit/061d82a899f89613fcefe97a373966bf9c81f4c7))
* **media-encoder:** upload retry method ([e70e285](https://github.com/furystack/multiverse/commit/e70e285011fafa4e1126a885582b83af7befbd05))
* **media-encoder:** warn count, rabbit listener connection close on dispose ([3d14023](https://github.com/furystack/multiverse/commit/3d1402312cbe6d2321ff3f44e16ed1fd97545f8f))




## 1.1.0 (2021-07-30)


### 🚀 What's new

* **encode-task:** subtitle mapping ([8b5cd57](https://github.com/furystack/multiverse/commit/8b5cd57846993de815774926838c1a0277db7835))
* **encoder:** updated progress page, task details, fixes on worker stability and requeue ([fe7daf0](https://github.com/furystack/multiverse/commit/fe7daf02be7a0f3d77a54c6673d2f8ea06d04fa6))
* **media-encoder:** improved logging ([abe5207](https://github.com/furystack/multiverse/commit/abe5207c5095f2d4b8232d0aab37cc176df0d37b))
* **media-encoder:** retry on connection failure ([8d5ca24](https://github.com/furystack/multiverse/commit/8d5ca2439f7d5a0e4e83e36121532e279b870661))
* **media-encoder:** save run log on task finialize ([179dadf](https://github.com/furystack/multiverse/commit/179dadf3836e9a6a2704e39a0a9d8faf5a925256))
* **media-encoder:** warns on failed chunk uploads ([eeeaed1](https://github.com/furystack/multiverse/commit/eeeaed12fbee4d4586455870dcee232edc98710f))
* **media:** encoding progress overview ([f75a6b2](https://github.com/furystack/multiverse/commit/f75a6b2f5795104fa87e5cf87c107ae618d46d97))
* **media:** encoding, audio, etc... ([6c8a08c](https://github.com/furystack/multiverse/commit/6c8a08c3784ab2d4f8a001c38246933f75cca57b))
* **project:** updated dependencies, cleaned up worker log, added polling to media lib watcher ([4c4338c](https://github.com/furystack/multiverse/commit/4c4338c6792e5ccf4f0f7a4602df4009a1a46184))
* **services:** existsAsync wrapper for access, removed existsSync calls ([d9d5fe1](https://github.com/furystack/multiverse/commit/d9d5fe12a71b65cd7b9d73dedf1f438a6591b0b5))
* **sites:** proxy & rules ([c195817](https://github.com/furystack/multiverse/commit/c19581720f8c411466d9eed564d082fd99516047))


### 🐛 Bug Fixes

* **chunk-uploader:** fixed upload on no progress info ([5a716e8](https://github.com/furystack/multiverse/commit/5a716e842ef5afdd2c592a9894c89ff9741afd44))
* **media-encoder:** audio tracks ([be44410](https://github.com/furystack/multiverse/commit/be444102140231ab224db6a69ed60a33d7a7d933))
* **media-encoder:** await chunk uploader to finish ([61f0ef0](https://github.com/furystack/multiverse/commit/61f0ef0857180b192ffc9499eac24917312a4296))
* **media-encoder:** finialize url ([7904ac0](https://github.com/furystack/multiverse/commit/7904ac07463f51df2bf9cd179ccc376151cd0f07))
* **media-encoder:** logger injectable ([b0172cb](https://github.com/furystack/multiverse/commit/b0172cb0952583bf3008ffff0fc824168fe00174))
* **media-encoder:** prefetch before consume ([9ec63b9](https://github.com/furystack/multiverse/commit/9ec63b9f26e83a554e2ad946a75d831bd036f565))
* **media-encoder:** temp dir check before taking task ([de97af7](https://github.com/furystack/multiverse/commit/de97af78a4350602a9120c8219ccb5a6d50734ae))
* **media-encoder:** try to destroy form after upload ([f3c922f](https://github.com/furystack/multiverse/commit/f3c922fdb0236cdc97996b891f728c4b5ad08962))
* **media-encoder:** upload retries and worker fixes ([061d82a](https://github.com/furystack/multiverse/commit/061d82a899f89613fcefe97a373966bf9c81f4c7))
* **media-encoder:** upload retry method ([e70e285](https://github.com/furystack/multiverse/commit/e70e285011fafa4e1126a885582b83af7befbd05))
* **media-encoder:** warn count, rabbit listener connection close on dispose ([3d14023](https://github.com/furystack/multiverse/commit/3d1402312cbe6d2321ff3f44e16ed1fd97545f8f))
