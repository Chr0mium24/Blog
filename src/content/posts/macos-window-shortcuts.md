---
title: MacOS自定义快捷键打开窗口
published: 2026-04-16
updated: 2026-04-16
description: ''
tags: []
category: 经验
---

微信的cmd+shift+w开关非常爽，于是在想如何给其他软件配置快捷键。

说到快捷键，很容易就想到 skhd；说到窗口，很容易就想到 Yabai。

一开始使用skhd绑定bash，然后用osascript调用窗口，但是这样启动Applescript的AppleEvent的引擎非常慢(开关快一秒了)，远不如Dock.app的command+Tab。

```bash
#!/bin/bash
# 获取 App 名字
APP_NAME="$*"
# 获取当前最前台 App 的名字
ACTIVE_APP=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true')

if [ "$ACTIVE_APP" == "$APP_NAME" ]; then
osascript -e "tell application \"System Events\" to set visible of application process \"$APP_NAME\" to false"
else
open -a "$APP_NAME"
# fi
```

然后现在通过Swift编译二进制文件管理窗口：

```Swift
import Cocoa

guard CommandLine.arguments.count > 1 else { exit(1) }
let targetAppName = CommandLine.arguments[1]
let workspace = NSWorkspace.shared

// 1. 获取当前最前台的 App
if let frontApp = workspace.frontmostApplication, frontApp.localizedName == targetAppName {
    frontApp.hide()
} else {
    if let targetApp = workspace.runningApplications.first(where: { $0.localizedName == targetAppName }) {
        targetApp.activate()
    } else {
        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/open")
        task.arguments = ["-a", targetAppName]
        try? task.run()
    }
}
```

然后在skhd的配置 \~/.config/skhd/skhdrc中调用 ：

```YAML
ctrl + shift - w : ~/.config/skhd/toggle-app WeChat
ctrl + shift - c : ~/.config/skhd/toggle-app "Google Chrome"
ctrl + shift - a : ~/.config/skhd/toggle-app "Ghostty"
```

