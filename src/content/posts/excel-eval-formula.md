---
title: Excel计算单元格中算式
published: 2025-08-24
updated: 2025-08-24
description: ''
tags: [Excel]
category: Excel
---

有项目需要在Excel中自动计算`100\*1+300`或者是`100\*1+`这样的式子，由于是计算表达式，很容易想到使用`名称管理器`里面的EVALUATE宏，而且这里的宏不用以xlsm格式保存文件。

但是这个文件有10多个sheet，本来想着写一个宏会自动根据相对位置计算belike：
> =EVALUATE(IF(RIGHT(A1,1)="+",LEFT(A1,LEN(A1)-1),A1))

但是不幸的是，当我保存名称管理器里面的公式，会自动绑定到当前sheet，所以只能使用传统方法，使用`ROW()` `COLUMN()` belike:
> =IF(INDIRECT(ADDRESS(ROW(),COLUMN()-1))="","",EVALUATE(IF(RIGHT(TRIM(INDIRECT(ADDRESS(ROW(),COLUMN()-1))),1)="+",LEFT(TRIM(INDIRECT(ADDRESS(ROW(),COLUMN()-1))),LEN(TRIM(INDIRECT(ADDRESS(ROW(),COLUMN()-1))))-1),TRIM(INDIRECT(ADDRESS(ROW(),COLUMN()-1))))))

然后如果遇到文本型数字，可以选择一列，数据-分列，无脑回车，就转成数字型数字了（仅修改单元格类型没有用）

