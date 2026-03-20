---
title: 科研绘图
published: 2026-03-20
updated: 2026-03-20
description: ''
tags: [科研]
category: 经验
---

打美赛期间总结出来的一些科研绘图

### **[draw.io](https://app.diagrams.net/)**

流程图神中神，上限极高，附一张当时画的流程图：

比完赛看到drawio居然有[ai生成流程图的项目](https://github.com/DayuanJiang/next-ai-draw-io)。不过现在的大模型如gemini-3.0-pro已经能直接生成drawio的xml格式文件，可以直接导入drawio，或者先试用nanobanana生成图片后给ai转xml。

要输入公式要开启Extras - Mathematical Typesetting。

* 反引号\`包裹是行内公式，双\$\$包裹是单行公式。
* text一般不要从别的地方复制，会有格式，可以粘贴到浏览器地址栏清除一下格式。

- 遇到不显示公式的情况，可以选中text，点击菜单栏<>查看代码按钮，然后删除html相关样式。
- 遇到有底色的情况时，可以command+E打开style源码面板进行编辑，删除底色样式。

### **代码绘图**

画图和计算脚本一定要分开，计算脚本只导出csv不参与画图，不然每次都要跑一次再画图很蠢。

常见的python绘图库：

* [Seaborn](https://seaborn.pydata.org/)([Matplotlib](https://matplotlib.org/)的封装)
* [Plotly](https://plotly.com/)(网页版图片，可缩放或开关图例)
* [Streamlit](https://streamlit.io/)(可以编辑数据动态出图)
* [Veusz](https://veusz.github.io/)自己可编辑的画图脚本，可以导入csv手动调整图片样式
* 比完赛看到的逆天[数据修正项目](https://www.bilibili.com/video/BV1h1FHzwEfA)

### **svg编辑器**

代码绘图时尽量导出为svg，便于标题等文字的修改和排版

* [svg代码编辑器](https://www.svgviewer.dev/)
* [在线illustrator，有钢笔工具](https://www.vectorpea.com/)

<br />

