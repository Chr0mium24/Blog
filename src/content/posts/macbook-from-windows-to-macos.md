---
title: 把Windows系统换回MacOS
published: 2025-09-06
updated: 2025-09-06
description: ''
tags: []
category: 技术
---


链接：https://www.zhihu.com/question/444221321/answer/1728237947



一般苹果安装windows，是使用了bootcamp ,在硬盘上另外划出一个分区安装windows,而原来的macOS还在，只是默认windows分区启动，你只要修改bootcamp 配置为macOS启动就可以了，bootcamp 一般在右下角程序托盘里，如果没有，在程序列表里找找。还有一个临时性的启动切换方法，就是关机状态下按住command再按电源键，会出现启动分区选择界面，左右键选择启动盘即可。如果再也不想在这台电脑上使用windows了，那么在启动到macOS 后，可以用bootcamp 删除并释放合并windows分区到原macOS 分区中，从而恢复到纯粹的macOS 环境。如果想要彻底重新安装macOS,首先确保存在互联网连接环境，然后在断电状态下按住command+R再按电源键，系统会进入重置界面，先重新分配布置硬盘，一般把所有分区都抹掉之后合并建立一个APFS分区，然后选择安装系统，苹果会从官网下载操作系统安装包并重新安装系统，过程中基本不需要人工参与，也不需要单独安装设备驱动，等待就可以了，当然时间有点久。另外补充一个，boot camp在macOS 中现在被叫做“启动转换助理”，在windows 中有没有改名字我就不知道了。