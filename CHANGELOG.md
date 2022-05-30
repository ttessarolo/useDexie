# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.2.3](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.2.2%0Dv1.2.3) (2022-05-30)


### Others

* change transaction type to rw? ([f434b8e](https://github.com/ttessarolo/useDexie/commits/f434b8e78b27b9aa8c71ba23a11188886b8e5a31))

### [1.2.2](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.2.1%0Dv1.2.2) (2021-03-05)


### Bug Fixes

* dont'close DB on unmount (cleanup fails) + docs review ([5be79ca](https://github.com/ttessarolo/useDexie/commits/5be79ca3429367881064f1a9db3ddad87a6af607))

### [1.2.1](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.2.0%0Dv1.2.1) (2021-02-15)


### Bug Fixes

* useDexieMonotir clear interval ref to clear on freq = null ([6f8880a](https://github.com/ttessarolo/useDexie/commits/6f8880a41a2e376dd35ee3973faeb7531a2e9d80))

## [1.2.0](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.1.0%0Dv1.2.0) (2020-12-17)


### Features

* implemented useDexieMonitor hook to live monitor db stats and performance ([3cf44d1](https://github.com/ttessarolo/useDexie/commits/3cf44d1b6ef9c82ef632053a9999f9df9fab8611))

## [1.1.0](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.16%0Dv1.1.0) (2020-12-05)


### Features

* documentation is done ([207ffe2](https://github.com/ttessarolo/useDexie/commits/207ffe2a7b0bfbc52a21e1348149375f650b78f0))

### [1.0.16](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.15%0Dv1.0.16) (2020-12-03)


### Styling

* updated Docs ([c696eef](https://github.com/ttessarolo/useDexie/commits/c696eeff520b4452dff6b0164243c4f17c2fda2f))

### [1.0.15](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.14%0Dv1.0.15) (2020-12-02)


### Docs

* updated docs ([772beda](https://github.com/ttessarolo/useDexie/commits/772bedadd98cad9106bbb17dce80986ecab1a6d2))

### [1.0.14](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.13%0Dv1.0.14) (2020-12-02)


### Docs

* updated Docs ([9909364](https://github.com/ttessarolo/useDexie/commits/99093642faacb2dfbda67f12662077f05a8c1bcd))

### [1.0.13](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.12%0Dv1.0.13) (2020-12-02)


### Others

* updated Docs + Added useDexiePutItems hoow, Fix: reverse order for orderBy and filter ([ffb5789](https://github.com/ttessarolo/useDexie/commits/ffb5789bb186e60cae75128ce2c694e4e2142021))

### [1.0.12](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.11%0Dv1.0.12) (2020-12-01)


### Docs

* updated docs ([eb60bfb](https://github.com/ttessarolo/useDexie/commits/eb60bfbfadd117f21098c2d1fba34cee24b069e4))

### [1.0.11](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.10%0Dv1.0.11) (2020-12-01)


### Docs

* updated docs ([85de822](https://github.com/ttessarolo/useDexie/commits/85de822fb81179bac1cf3f6b6cf6fd1a33663156))

### [1.0.10](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.9%0Dv1.0.10) (2020-12-01)


### Docs

* updated Docs ([c94b551](https://github.com/ttessarolo/useDexie/commits/c94b5511a8fca783fe0d9625e7b3d3f1f69e4d5a))

### [1.0.9](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.8%0Dv1.0.9) (2020-11-28)


### Others

* updated docs ([3f3b6a7](https://github.com/ttessarolo/useDexie/commits/3f3b6a740f749e6d834d51f4725d5c6d9b076ba6))

### [1.0.8](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.7%0Dv1.0.8) (2020-11-28)


### Others

* updated Docs ([034abdf](https://github.com/ttessarolo/useDexie/commits/034abdfa426df9ed00fc9d6596fdf676c78c63f2))

### [1.0.7](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.6%0Dv1.0.7) (2020-11-27)


### Docs

* updated Docs ([b30998f](https://github.com/ttessarolo/useDexie/commits/b30998fe1b7a19f33274a619260a623f1fe315eb))

### [1.0.6](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.5%0Dv1.0.6) (2020-11-26)


### Bug Fixes

* check if db.isOpen() before transaction, if close -> db.open() ([4e548b9](https://github.com/ttessarolo/useDexie/commits/4e548b96250f11378de3dc1955dee2d8b024a1f7))

### [1.0.5](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.4%0Dv1.0.5) (2020-11-17)


### Performance Improvements

* simplified Transaction and Query without internal hooks + get rid of tx wait ([3a3b0df](https://github.com/ttessarolo/useDexie/commits/3a3b0df25f755d586fac366b40f81f1f19c8300a))

### [1.0.4](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.3%0Dv1.0.4) (2020-11-17)


### Bug Fixes

* param value in or operator for composeWhere ([1f4dbeb](https://github.com/ttessarolo/useDexie/commits/1f4dbeb58e3be261fc85a3bdfc4029ae2560483b))

### [1.0.3](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.2%0Dv1.0.3) (2020-11-16)


### Bug Fixes

* dBDispatcher subscribtion + get rid of eval ([fc2e3aa](https://github.com/ttessarolo/useDexie/commits/fc2e3aaa0d9e36b8623a15a5c7a9f5a50be4d72f))

### [1.0.2](https://bitbucket.org/ttessarolo/useDexie/branches/compare/v1.0.1%0Dv1.0.2) (2020-11-16)


### Others

* fix bugs + updated docs ([ff72ed3](https://github.com/ttessarolo/useDexie/commits/ff72ed3e7b1f91abdb04d83a9f0d6d57d8ff06e5))
