---
title: 丝之歌 macOS(arm) mod 安装教程
published: 2025-09-15
updated: 2025-09-15
description: ''
tags: [丝之歌]
category: 游戏
---

arm版BepInEx下载(Github [issue 链接](https://github.com/BepInEx/BepInEx/issues/899) )

> You can build the Apple Silicon version yourself, it's based on existing pull requests from here https://github.com/Krakazybik/BepInEx/tree/feat/harmony-v-2-15-0. Build commands:
> ```bash
>  export GITHUB_TOKEN=ghp_xxx
>  ./build.sh --target=Pack --doorstop_run=17548755183
> ```
> Alternatively, you can use the version I built, at your own risk.
[BepInEx_macos_arm64_5.4.23.3.zip](https://github.com/user-attachments/files/22302507/BepInEx_macos_arm64_5.4.23.3.zip)

下载zip后解压4个文件到Hollow Knight Silksong.app的同目录(`$GamePath`)，给权限：

```bash
chmod +x run_bepinex.sh libdoorstop.dylib
sudo xattr -r -d com.apple.quarantine libdoorstop.dylib
```

然后在Steam设置丝之歌启动项，将下面命令的目录设定为上文的`$GamePath`:

```bash
/usr/bin/arch -arm64 /bin/bash "/Users/cr/Library/Application Support/Steam/steamapps/common/Hollow Knight Silksong/run_bepinex.sh" %command%
```

启动游戏后，BepInEx文件夹下为产生一堆文件，即为初始化成功，然后去网上下载mod，将dll文件放在加到`BepInEx/pligins`下即可。

