---
title: Win11重装工具
published: 2026-01-23
updated: 2026-01-23
description: ''
tags: [统计，数学]
category: 代码
---

# 好用软件合集

* 工具箱

[Cencrack工具箱：盗版软件合集](http://cencrack.com/?post=18)

[图吧工具箱：计算机测试软件合集](https://www.tbtool.cn/)

[PowerToys：Windows系统增强工具](https://github.com/microsoft/PowerToys/releases) 

* 美化类

[yasb：窗口美化工具](https://github.com/amnweb/yasb/wiki/Installation)

[TranslucentTB：任务栏透明工具](https://github.com/TranslucentTB/TranslucentTB/releases/tag/2025.1)

[ExplorerPatcher：win11恢复win10菜单和任务栏（安装后右键任务栏-属性，进行设置）](https://github.com/valinet/ExplorerPatcher/releases/tag/26100.4946.69.6_7384790)

* 软件类

[Local Send：局域网传文件](https://localsend.org/download)

[Geek ：软件卸载工具](https://geekuninstaller.com/download)

[Everything：文件查找工具](https://www.voidtools.com/)

[冲突窗口：猫猫](https://github.com/clash-download/clash-for-windows/releases)

[Bandzip6：老版本无广告解压文件](https://www.bandisoft.com/bandizip/old/6/)

[Snipaste：好用的截图贴图软件（windows自带截图win+shift+s）](https://zh.snipaste.com/)

[audiorelay：跨端传音频](https://audiorelay.net/downloads)

* 小工具

[ContextMenuManager：右键菜单管理](https://github.com/BluePointLilac/ContextMenuManager/releases/tag/3.3.3.1)

[RedDot：中英文输入法切换](https://github.com/Autumn-one/RedDot)

# win11激活 

## 用户设置

* win11 跳过用户激活： 在激活页面shift+F10 打开 cmd，输入以下命令

```PowerShell
start ms-cxh:localonly
```

* win11 关闭用户密码：ctrl + alt + del 打开安全选项界面，然后选择更改密码，密码留空

- win11 关闭自动更新：打开powershell，输入以下命令后，去设置的更新中将会有521周后更新的选项

```PowerShell
New-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" -Name "FlightSettingsMaxPauseDays" -Value 3650 -PropertyType DWORD -Force
```

# 开发环境

先在powershell中以管理员身份运行以下脚本，避免后续脚本无法正常运行

```PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```

### 安装winget：[官方文档](https://learn.microsoft.com/zh-cn/windows/package-manager/winget/)

win11自带winget，如果msstore源没有正常配置，可以运行下面命令进行重置

```PowerShell
winget source reset msstore

#如果需要更换国内源：
winget source remove winget
winget source add winget https://mirrors.ustc.edu.cn/winget-source
winget source reset --force
winget source update
```

### 安装wsl：[官方教程](https://learn.microsoft.com/zh-cn/windows/wsl/install)

输入下面命令安装wsl功能后重启

```PowerShell
wsl --install
# 重启后输入：
wsl --list --online  #查看发行版
wsl --install -d <DistroName># 安装指定版本 要设置密码

#如果忘记密码，可以管理员运行powershell
 wsl.exe --user root
 #然后修改指定用户密码
 passwd <username>
```

#### Ubuntu apt换源：[USTC换源文档](https://mirrors.ustc.edu.cn/help/ubuntu.html#__tabbed_4_4)

[USTC换源文件生成器](https://mirrors.ustc.edu.cn/repogen/)

替换/etc/apt/sources.list

### 安装C/C++编译器

```PowerShell
winget install MSYS2.MSYS2 #这步是在下载linux的windows中间层
#然后在开始菜单中搜索 MSYS2 MSYS 打开窗口后输入
pacman -S --needed mingw-w64-ucrt-x86_64-toolchain
#随后按两次回车：安装所有包、确认安装
#安装完成后根据安装位置，运行下面命令，添加环境变量
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\msys64\ucrt64\bin", "Machine")
```

### 安装git

```PowerShell
winget install Git.Git
```

### 安装uv：[官方配置文档](https://docs.astral.sh/uv/concepts/configuration-files/)

```PowerShell
winget install --id=astral-sh.uv -e
# uv换源
# 方法一：临时换源
export UV_DEFAULT_INDEX="https://mirrors.aliyun.com/pypi/simple"
# 方法二：修改配置
# 如果在本地配置pyproject.toml，写入如下配置
[[tool.uv.index]]
url = "https://mirrors.ustc.edu.cn/pypi/simple"
default = true
# 如果在全局配置uv.toml（Linux和MacOS一般是~/.config/uv/uv.toml，Windows一般是%APPDATA%/uv/uv.toml，路径不存在手动创建即可），写入如下配置
[[index]]
url = "https://mirrors.ustc.edu.cn/pypi/simple"
default = true
```

