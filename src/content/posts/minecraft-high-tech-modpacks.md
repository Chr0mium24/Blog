---
title: Minecraft 高版本科技包
published: 2026-09-07
updated: 2026-09-07
description: 模组分类、整合包档案与在成熟包上增删模组的完整记录
tags: [Minecraft]
ai: true
category: 经验
---

整合包动辄装进一两百个模组，按功能分其实只有十来类。类别认清楚之后，包与包的差别就集中在版本与加载器、任务书和社区规模上。文中模组数、下载量与版本号是 2026 年 9 月从 CurseForge、Modrinth 和包文件实测的，过期后以平台页面为准；模组条目的链接指向 MC百科。

---

## 1. 版本兼容与硬件要求

- Forge 与 NeoForge 的模组互不兼容，1.20.1 与 1.21.1 的模组互不兼容。包的加载器与游戏版本决定它能装哪些模组，这是版本选择的第一道限制。
- 内存方面，200 模组左右的包建议分配 6 到 8 GB，400 模组以上建议 10 到 12 GB；1.21.x 需要 Java 21。
- 任务书汉化情况：ATM10 与 ATM10 Lite 的任务书带官方简体中文翻译；CLC 与多数中小型包的任务书为英文。
- 判断一个包的战斗强度，看 Boss、装备强化、魔法类模组的密度，例如是否包含 L_Ender's Cataclysm、Mowzie's Mobs、Apotheosis、Iron's Spells。
- 判断一个包是否活跃，看 CurseForge 的最后更新日期与模组数变化，下载量绝对值说明不了活跃度。

## 2. 模组分类

### 群系与地形

- [Terralith](https://www.mcmod.cn/class/4557.html)：用原版方块添加了九十几个新群系，峡谷、浮空岛都有。
- [超多生物群系（Biomes O' Plenty）](https://www.mcmod.cn/class/108.html)：添加了大量主世界与下界新群系及配套动植物。
- [我们走过的生物群系（Oh The Biomes We've Gone）](https://www.mcmod.cn/class/15810.html)：添加 50 多个魔幻写实群系，附带新生物与结构。
- [未至之地（Regions Unexplored）](https://www.mcmod.cn/class/9118.html)：在主世界、下界与末地添加大量新群系。
- [Tectonic](https://www.mcmod.cn/class/8005.html)：改造世界生成规律，塑造更壮美的地形，不更换群系。
- [William Wythers' Overhauled Overworld](https://www.mcmod.cn/class/4595.html)：重塑原版群系与地形，使主世界更贴近现实。
- [TerraBlender](https://www.mcmod.cn/class/5489.html)：以兼容方式向新版地形系统注册群系的库，1.20.x 的群系模组需要它。
- [Biolith](https://www.mcmod.cn/class/16550.html)：1.21 起替代 TerraBlender 的群系注册库。

### 结构

- [YUNG's API](https://www.mcmod.cn/class/3372.html)：YUNG 系列结构模组共用的前置。系列本体是 Better Dungeons、Better Strongholds、Better Mineshafts、Better Nether Fortresses、Better Desert Temples、Better Jungle Temples、Better Ocean Monuments、Better Witch Huts、Extras，各改一类原版结构。
- [Lithostitched](https://www.mcmod.cn/class/15187.html)：提供世界生成配置与兼容性增强，1.21 的 YUNG 系列需要它。
- [城镇与塔楼（Towns and Towers）](https://www.mcmod.cn/class/7000.html)：扩展村庄更新，添加新村庄、前哨站与船只。
- [CTOV](https://www.mcmod.cn/class/6943.html)：全称 ChoiceTheorem's Overhauled Village，添加大量改进的村庄与掠夺者前哨站。
- [Structory](https://www.mcmod.cn/class/6793.html)：添加废墟、小屋、墓地、船只等小型结构。
- [Structory: Towers](https://www.mcmod.cn/class/10163.html)：Structory 扩展，添加群系主题的塔楼。
- [地牢浮现之时（When Dungeons Arise）](https://www.mcmod.cn/class/3607.html)：添加大量随机生成的宏伟结构，战利品丰厚。
- [Dungeon Crawl](https://www.mcmod.cn/class/3105.html)：添加随机生成的多层地牢。

### 科技·动能

- [机械动力（Create）](https://www.mcmod.cn/class/2021.html)
- [机械动力：创想附加（Create Crafts & Additions）](https://www.mcmod.cn/class/3437.html)：添加电动马达与交流发电机，桥接动能与电能。
- [机械动力：附魔工业（Create: Enchantment Industry）](https://www.mcmod.cn/class/7892.html)：为机械动力提供自动化附魔与经验处理。
- [机械动力：超级管道（Create: Hypertubes）](https://www.mcmod.cn/class/20226.html)：用超级管道做基地内快速交通。
- [机械动力：汽鸣铁道（Create: Steam 'n' Rails）](https://www.mcmod.cn/class/8230.html)：扩展铁路与蒸汽系统。

### 科技·工业

- [通用机械（Mekanism）](https://www.mcmod.cn/class/187.html)
- [工业先锋（Industrial Foregoing）](https://www.mcmod.cn/class/979.html)
- [沉浸工程（Immersive Engineering）](https://www.mcmod.cn/class/463.html)
- [Powah!](https://www.mcmod.cn/class/2365.html)：添加多种能量生产、存储与运输方式。
- [Oritech](https://www.mcmod.cn/class/15500.html)：较新的开源科技模组，添加风格统一的机器与工具。
- [RF工具箱（RFTools）](https://www.mcmod.cn/class/397.html)：集物流、显示、监控、安全于一体的实用科技模组。
- [XyCraft](https://www.mcmod.cn/class/216.html)：以 Xychorium 晶体为主的科技模组，附带装饰建材。
- [极限反应堆（Extreme Reactors）](https://www.mcmod.cn/class/814.html)：建造大型多方块反应堆来发电。
- [现代工业化（Modern Industrialization）](https://www.mcmod.cn/class/3472.html)：独立科技模组，最终目标是完全自动化生产。
- [格雷科技现代版（GregTech CEu Modern）](https://www.mcmod.cn/class/12850.html)：基于社区版的大型科技模组，专家级流程，上手门槛最高，是 Monifactory 的核心。

### 科技·数字物流

- [应用能源 2（AE2）](https://www.mcmod.cn/class/260.html)
- [精致存储（Refined Storage）](https://www.mcmod.cn/class/691.html)
- [AE2扩展（ExtendedAE）](https://www.mcmod.cn/class/11534.html)：解决原版应用能源 2 的使用痛点。
- [MEGA存储单元（MEGA Cells）](https://www.mcmod.cn/class/6792.html)：添加 1M 至 256M 的大容量存储元件。
- [应用通量（Applied Flux）](https://www.mcmod.cn/class/13416.html)：在 ME 网络中存储与传输能量。
- [高级AE（AdvancedAE）](https://www.mcmod.cn/class/16225.html)：添加高级样板供应器与量子计算机。
- [应用能源：通用机械附属（Applied Mekanistics）](https://www.mcmod.cn/class/6055.html)：与应用能源 2 官方联动，在 ME 网络中存储化学品。
- [功能性存储（Functional Storage）](https://www.mcmod.cn/class/5350.html)：储物抽屉的替代品，更多功能。
- [精妙存储（Sophisticated Storage）](https://www.mcmod.cn/class/6711.html)：多种桶、箱子与潜影箱，支持升级定制。
- [模块化路由器（Modular Routers）](https://www.mcmod.cn/class/892.html)：物品路由器，装上模块即可完成分类与分发。
- [LaserIO](https://www.mcmod.cn/class/6488.html)：同一面传输物品、流体、能量与红石信号。

### 资源自动化

- [神秘农业（Mystical Agriculture）](https://www.mcmod.cn/class/929.html)：添加精华种子，用种植作物的方式获取矿物等资源。
- [植物盆栽（Botany Pots）](https://www.mcmod.cn/class/3499.html)：可种植作物并支持自动化的盆栽。
- [植树盆栽（Botany Trees）](https://www.mcmod.cn/class/3491.html)：植物盆栽附属，在盆中种植各类树木。
- [矿莓重制版（Oreberries Replanted）](https://www.mcmod.cn/class/5206.html)：种植并收割矿莓灌木获取矿物。
- [资源蜜蜂（Productive Bees）](https://www.mcmod.cn/class/2502.html)：让蜜蜂自动化产出铁、钻石等矿物。
- [Productive Trees](https://www.mcmod.cn/class/14560.html)：受林业启发，添加新树种与树木育种系统。
- [模块化蜜蜂（Modular Bees）](https://www.mcmod.cn/class/24263.html)：为资源蜜蜂添加模块化蜂箱等多方块结构。
- [敌对神经网络（Hostile Neural Networks）](https://www.mcmod.cn/class/5461.html)：用数据模型模拟刷怪，生成怪物掉落物。
- [刷怪塔实用设备（Mob Grinding Utils）](https://www.mcmod.cn/class/817.html)：刷怪农场用的模块化方块与升级组件。

### 任务

- [FTB任务（FTB Quests）](https://www.mcmod.cn/class/1423.html)：现代整合包任务书的事实标准，基于团队系统。
- [更好的进度（Better Advancements）](https://www.mcmod.cn/class/1530.html)：改进进度系统的界面与体验。
- [GuideME](https://www.mcmod.cn/class/18414.html)：基于 Markdown 的模组指南书框架。
- [帕秋莉手册（Patchouli）](https://www.mcmod.cn/class/1388.html)：为模组提供数据驱动的游戏内手册。

### 战斗与魔法

- [灾变（L_Ender's Cataclysm）](https://www.mcmod.cn/class/5214.html)：添加困难地牢、挑战性 Boss 和强力装备。
- [Mowzie的生物（Mowzie's Mobs）](https://www.mcmod.cn/class/984.html)：添加多种动画独特的奇幻生物与 Boss。
- [暮色森林（Twilight Forest）](https://www.mcmod.cn/class/61.html)：永恒之夜笼罩的大型冒险森林维度。
- [神化（Apotheosis）](https://www.mcmod.cn/class/1708.html)：通过附魔、药水、刷怪笼等模块大幅增强游戏深度。
- [新生魔艺（Ars Nouveau）](https://www.mcmod.cn/class/3468.html)：自由构建法术的魔法系统与配套设备。
- [Iron的法术与魔法书（Iron's Spells 'n Spellbooks）](https://www.mcmod.cn/class/10175.html)：添加百余个法术、法术书与巫师装备。
- [神秘学（Occultism）](https://www.mcmod.cn/class/3986.html)：召唤魔灵协助自动化生产的仪式魔法。
- [灵灾（Malum）](https://www.mcmod.cn/class/4712.html)：以精魂魔法为核心的黑魔法内容。
- [Theurgy](https://www.mcmod.cn/class/4691.html)：平衡取向的炼金术系统与坩埚加工。
- [植物魔法（Botania）](https://www.mcmod.cn/class/332.html)：基于魔力系统的魔法植物与装置。
- [永恒之门（Gateways to Eternity）](https://www.mcmod.cn/class/7522.html)：召唤波次敌人的传送门挑战。

### 维度

- [Ad Astra](https://www.mcmod.cn/class/7395.html)：添加火箭、太空服与多个可探索星球。
- [天境（The Aether）](https://www.mcmod.cn/class/94.html)：经典的天空岛屿冒险维度。
- [深入天境（Deep Aether）](https://www.mcmod.cn/class/10145.html)：为天境添加大量可探索内容。
- [天境：新生代（Aether Redux）](https://www.mcmod.cn/class/10575.html)：从多方面改进并扩展天境。
- [Alex 的洞穴（Alex's Caves）](https://www.mcmod.cn/class/12592.html)：添加六种罕见独特的洞穴生物群系。
- [永恒星光（Eternal Starlight）](https://www.mcmod.cn/class/15980.html)：充满魔法与未知的星光维度。
- [蜜蜂领域（The Bumblezone）](https://www.mcmod.cn/class/2489.html)：充满蜜蜂与蜂蜜的主题维度。
- [深暗之园（The Undergarden）](https://www.mcmod.cn/class/2870.html)：地下深处的荒芜洞穴维度。
- [空无之景（Nullscape）](https://www.mcmod.cn/class/5555.html)：重构末地世界生成，保留荒芜风格。

### 装饰

- [Chipped](https://www.mcmod.cn/class/4726.html)：2000 多种原版风格的方块装饰变种。
- [Rechiseled](https://www.mcmod.cn/class/7032.html)：雕凿方块获得装饰变种。
- [Macaw 的门（Macaw's Doors）](https://www.mcmod.cn/class/2574.html)：Macaw's 系列之一，多种新门；系列还有围栏、家具、桥梁等。
- [框架方块（FramedBlocks）](https://www.mcmod.cn/class/5918.html)：可自定义替换纹理的框架方块。
- [锦致装饰（Supplementaries）](https://www.mcmod.cn/class/3555.html)：大量与原版玩法互动的补充性小物件。
- [精巧手艺（Handcrafted）](https://www.mcmod.cn/class/9261.html)：250 多种家具与装饰方块。

### 性能与体验

- [钠（Sodium）](https://www.mcmod.cn/class/2785.html)
- [Embeddium](https://www.mcmod.cn/class/12028.html)：钠在 Forge 端的分支， Forge 端渲染优化。
- [现代化修复（ModernFix）](https://www.mcmod.cn/class/8714.html)：多合一优化，提速启动、减少内存占用。
- [铁氧体磁芯（FerriteCore）](https://www.mcmod.cn/class/3888.html)：减少游戏内存占用。
- [ImmediatelyFast](https://www.mcmod.cn/class/7948.html)：优化即时模式渲染，提升帧率。
- [ServerCore](https://www.mcmod.cn/class/6542.html)：优化服务器性能，减少延迟与卡顿。
- [Iris Shaders](https://www.mcmod.cn/class/3697.html)：光影加载器，兼容 OptiFine 光影包。
- [JEI物品管理器（Just Enough Items）](https://www.mcmod.cn/class/459.html)
- [EMI](https://www.mcmod.cn/class/6630.html)：物品与配方管理器，支持配方树与快速合成，JEI 的现代替代。
- [玉（Jade）](https://www.mcmod.cn/class/3482.html)：准视方块显示名称与状态信息。
- [旅行地图（JourneyMap）](https://www.mcmod.cn/class/198.html)
- [Xaero的小地图（Xaero's Minimap）](https://www.mcmod.cn/class/1701.html)：原版风格小地图，与 JourneyMap 二选一。
- [传送石碑（Waystones）](https://www.mcmod.cn/class/1339.html)：传送网络，免长途跋涉。
- [连锁破坏（FTB Ultimine）](https://www.mcmod.cn/class/3004.html)：按住按键连锁采集方块或作物。
- [鼠标手势（Mouse Tweaks）](https://www.mcmod.cn/class/1162.html)：鼠标拖动与滚轮快速移动物品。

### 作者胶水

- [KubeJS](https://www.mcmod.cn/class/2450.html)：用 JavaScript 脚本修改配方、物品与游戏内容，包文件夹里的 kubejs 目录来自它。
- [FTB Library](https://www.mcmod.cn/class/3184.html)：FTB 系列模组共用的基础库。

## 3. 整合包档案

### 3.1 社区成熟的包

- **ATM10**：1.21.1 NeoForge，485 个模组，约 2100 万下载。地形与科技全覆盖：Terralith、我们走过的生物群系、未至之地、城镇与塔楼、十个 YUNG 模组，通用机械、应用能源 2、神秘农业、资源蜜蜂都在列。任务书成熟，官方简体中文。2026 年 8 月更新 v8.0。短板是模组数量带来的性能开销与学习成本。
- **ATM10 Lite**：1.21.1 NeoForge，206 个模组，13.4 万下载。保留通用机械与应用能源 2 全套、工业先锋、Powah、XyCraft，战斗模组几乎移除，任务约 3000 个分 27 章带官方中文，世界生成维持原版，补 18 个地形与资源模组后总数约 224 个，详见第 4 节。
- **CLC（Create Lets Create）**：1.20.1 Forge 主线，250 余个模组，5.2 万下载。地形与结构改造在同类中完成度最高，含 Alex 的洞穴。机械动力深度主导，通用机械与应用能源 2 覆盖浅。任务超 1000 条逐条讲解但为英文，终局有一个强制 Boss 战。单人作者，2026 年 8 月更新。1.21.1 分支停在 v4，落后主线。下载时选不带 Official Server 字样的文件。
- **Monifactory**：1.20.1 Forge，221 个模组，41 万下载。GregTech 加 Thermal 加应用能源 2 的重工业路线，官方玩法以和平模式为主，资源靠微量挖掘机与怪物模拟无限产出，世界生成用 William Wythers' 加 Lost Cities，后者可删。
- **SteamPunk [LPS]**：1.20.1 Forge，331 个模组，290 万下载。定制蒸汽朋克城市世界生成，机械动力主导，任务 1000 以上，战斗内容少。
- **Craftoria**：1.21.1 NeoForge，500 余个模组，276 万下载。Tectonic 加超多生物群系，任务 2000 以上，社区规模仅次于 ATM10，模组数超出预算。
- **FTB Evolution**：1.21.1 NeoForge，516 个模组，36.5 万下载。FTB 官方出品，Terralith 与 YUNG 结构齐备，科技含通用机械、沉浸工程、现代工业化、RF工具箱、Ender IO，玩家评价 Boss 威胁极低。2026 年 7 月更新。
- **ATM9**：1.20.1 Forge，400 余个模组，千万级下载。上一代全景包，科技含 Thermal、GregTech、通用机械、机械动力。有 No Frills 精简分支，未验证。
- **BMC4（Better MC Forge）**：1.20.1 Forge，约 250 个模组，1820 万下载。超多生物群系加 Geophilic 世界生成与天境，地牢结构极多；工业科技模组接近于零，含灾变与 Mowzie's 的 Boss 内容。纯探索向。

### 3.2 规模较小或较新的包

- **Catalyst: Ascendance**：1.20.1 Forge，约 170 个模组，CurseForge 494 下载加 Modrinth 约 500。通用机械、应用能源 2、工业先锋、神秘农业、植物盆栽加 Terralith、超多生物群系与 YUNG，模组构成与 200 模组目标最接近；缺完整任务书证据。2026 年 6 月更新。
- **BUGE Craft S2**：1.20.1 Forge，模组数特大，73 下载。机械动力全家桶加通用机械、应用能源 2、Thermal、沉浸工程、精致存储，地形含 Terralith、YUNG 与 Ad Astra，用 FTB 任务。内容匹配度高但下载量极小。
- **Technic Revival**：1.21.1 NeoForge，191 个模组，386 下载。机械动力、通用机械、应用能源 2、精致存储、Oritech、Powah、神秘农业，科技与种矿路线匹配，地形较弱。2026 年 2 月更新。
- **The Devils Pack**：1.21.1，模组数未查明，社区小。Tectonic、Terralith 与 YUNG 全套加资源蜜蜂、Productive Trees，机械动力主导；任务书情况不明。
- **Mattock**：1.21.1 NeoForge，113 个模组，18 下载。Tekkit 与 Yogbox 的现代复刻：Ender IO、BuildCraft、通用机械、神秘农业，超多生物群系加 YUNG 与 MineColonies。2026 年 8 月 15 日发布。
- **Benjamin 2.0**：1.21.1 NeoForge，251 个模组，约 1 下载。机械动力、通用机械、应用能源 2、GregTech、工业先锋、神秘农业加 Terralith 与 YUNG，用 FTB 任务。纸面配置最全，2026 年 9 月刚发布。
- **The Great Tangle**：1.21.1 NeoForge，442 个模组，84 下载。以 Cobblemon 宝可梦为主题的 ATM 式全家桶，用 FTB 任务。想玩宝可梦时才需要考虑。
- **Archimedes the Owl**：1.20.1，模组数未查明，社区小。种植盆栽、养蜂、神秘农业三条资源路线并行，配 YUNG 结构。
- **Sourceworks**：1.21.1 NeoForge，127 个模组，社区小。Terralith 与 YUNG 全套，任务书 449 个任务分 15 章完成度高；缺少自动资源路线。
- **Verdant Idea**：1.20.1 Forge，105 个模组，15 万下载。主题是修复荒废世界，神秘农业、AgriCraft、资源蜜蜂加工业先锋、PneumaticCraft、Thermal、通用机械、应用能源 2，300 余任务，魔法比重高。开局前提与常规包相反。
- **NewPath Beyond Lands**：1.21.1 NeoForge，模组数未查明，中等社区。Tectonic 加 BYG 与 YUNG、Structory，探索为主，科技是配菜。
- **Legend Infinity**：1.21.1，模组数未查明。应用能源 2、通用机械、Ender IO 加神秘农业的无限资源线；Boss 与战斗内容比重大。
- **Bee Master**：1.21.1 NeoForge，175 个模组，899 下载。养蜂主题包，应用能源 2 加 Resourceful Bees；没有通用机械。

### 3.3 已排除的包及原因

- **The Pineapple**——作者定位为杂烩水槽，魔法与 Boss 内容比重大，2025 年 5 月起停更。
- **CreateCraft Client**——2025 年 10 月起停更，下载量为零。
- **Create Live 5**——拆包确认是空岛玩法，且只有机械动力一条科技线。
- **Create & things**——Create Live 5 的非空岛版本，仅 1400 下载。
- **Technical Electrical**——含机械动力、通用机械、沉浸工程，但世界生成是原版，任务书无证据。
- **Create Mystical Bee's / EclipseS / Project ASGARD**——魔法与 Boss 比重高，社区规模小。
- **Kitchen Accessories**——1.20.1，机械动力为主，页面状态异常，资料少。
- **Create Modernized**——约 200 下载，发布时间太短。
- **Hives & Colonies**——108 个模组的早期 alpha，MineColonies 加魔法向。
- **Create Chronicles: Bosses and Beyond**——Boss 战是主打内容，与低战斗需求相反。

## 4. ATM10 Lite 增补清单

底座文件为 `All The Mods 10 LITE-1.1.0.zip`，拆包结果：206 个模组，NeoForge 21.1.247，任务约 3000 个分 27 章，科技含通用机械全套、应用能源 2 全套、工业先锋、Powah、XyCraft、RFTools，战斗模组仅剩神化与永恒之门少量，资源线已有矿莓、GeOre 与敌对神经网络，内置 Complementary 光影、Iris 与钠。

- **核心**，8 个，是地形生效的骨架：Terralith 2.6.2、TerraBlender 4.1.0.8、Biolith 3.0.14、我们走过的生物群系 2.6.0、未至之地 0.6.2、城镇与塔楼 1.13.11、Lithostitched 1.8.0-beta6、YUNG's API 5.1.8。
- **结构选装**：YUNG's Better Dungeons 5.1.4、Better Strongholds 5.1.3、Better Mineshafts 5.1.1、Better Nether Fortresses 3.1.5、Better Desert Temples 4.1.5、Better Jungle Temples 3.1.2、Better Ocean Monuments 4.1.2、Better Witch Huts 4.1.1、Extras 5.1.1；Structory 1.3.17、Structory: Towers 1.0.17；CTOV 在 Modrinth 搜索 CTOV 取 1.21.1 NeoForge 版。
- **资源**，二选一：资源蜜蜂 13.13.0 加 Productive Trees 0.7.0，或神秘农业 8.0.28 加植物盆栽 21.1.44 与植树盆栽 21.1.7。
- **可选**：机械动力 6.0.10。

合计增加约 18 个模组，总数约 224。补装的地形模组只对新建世界生效，旧世界的地形不变。验证命令：`/locate biome terralith:emerald_peaks` 与 `/locate biome biomeswevegone:...`。

依赖关系：我们走过的生物群系与未至之地在 1.20.x 用 TerraBlender 注册群系，1.21 起改用 Biolith；YUNG 结构系列需要 YUNG's API 与 Lithostitched；神秘农业依赖 Cucumber Library 与 Placebo，这两者在 ATM10 Lite 内已有。

## 5. ATM10 Lite 删模组注意事项

删除模组前，先在任务书里搜索该模组的物品 ID。任务书是纯文本 snbt 文件，位于 `config/ftbquests/quests/chapters/`，任何编辑器都能检索。被主线任务引用的模组删除后会卡进度。

- 不能删的：Iron's Spells，主线 allthemodium 章引用 6 处、护甲线共 106 处；All the Wizard Gear，主线引用 15 处；Iron's Gems 'n Jewelry 与 Iron's Lib。Apotheosis 生态，主线引用 2 处，删除会断 3 个任务。
- 可以安全删的，任务零断裂：Malum、Relics、Artifacts、Reliquified Artifacts、Baubley Heart Canisters。
- 需要权衡的：Occultism 删除断 2 个任务，Potions Master 断 1 个。
- 删除模组时同步删除 `overrides/kubejs/server_scripts/mods/` 下的同名脚本；任务章节 snbt 文件可以保留，只会显示缺失图标，不影响游玩。
- 删除会导致包损坏的：Rhino、KubeJS、Bookshelf、Balm、Cloth Config、Cucumber Library、Placebo 等依赖链模组；通用机械与应用能源 2 等科技核心；Allthemodium、ATO、AllTheTweaks；FTB 全家；敌对神经网络，现成的无限资源线。

## 6. 在既有包上增删模组的方法

1. 拆包检查四个位置：manifest.json 记录模组数量、游戏版本与加载器；modlist.html 是完整模组清单；kubejs 目录存放作者改写的配方脚本；config/ftbquests 目录存放任务书文本。
2. 按第 2 节的分类给底座包画类别矩阵，找出缺失的类别。
3. 世界生成类属于纯增量，放入模组 jar 并新建世界即可生效；科技与资源类先核对依赖链再装入。
4. 删除模组前先在任务书里搜索该模组的模组 ID，被主线引用的不能删。
5. 新建世界后用 `/locate biome` 与 `/locate structure` 命令确认新群系与结构生成。
6. 查询某个模组在指定版本的可用性：Modrinth API 地址 `project/{slug}/version?game_versions=["1.21.1"]&loaders=["neoforge"]`。

## 7. 数据来源

- CurseForge 下载量与更新记录：cfwidget.com 提供程序化查询接口。
- 模组版本与依赖：Modrinth API，开放接口，可按游戏版本与加载器过滤。
- 模组中文资料与链接：MC百科（mcmod.cn），本笔记第 2 节全部链接实测可访问。
- 完整模组清单：ModpackIndex、minecraft-guides.com、modpacks.ch 等第三方站点，页面依赖 JavaScript 渲染，需浏览器抓取。
- 最可靠的验证方式是拆包：zip 内的 manifest.json、modlist.html 与 overrides 目录比任何网页描述都准确。
- 本笔记对应的精简版博客：同目录 `2026-minecraft-modpacks.md`。