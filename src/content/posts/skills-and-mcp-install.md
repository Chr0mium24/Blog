---
title: skills and mcp install
published: 2026-03-24
updated: 2026-03-24
description: ''
tags: []
category: ''
---

先去 skills.sh 搜，因为它同时解决“发现”和“安装”。实际工作流可以固定成：

 



  npx skills find react performance

  npx skills add vercel-labs/agent-skills\@vercel-react-best-practices

  npx skills check

  npx skills update



  如果 skills.sh 没找到，再去 skillsmp.com 做长尾搜索。skillsmp 更像 GitHub 聚合目录，找到以后通常回源仓库自己拉：



  git clone https\://github.com/\<owner>/\<repo>.git /tmp/\<repo>

  cp -r /tmp/\<repo>/\<skill-dir> \~/.codex/skills/
