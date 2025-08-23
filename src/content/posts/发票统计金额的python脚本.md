---
title: 发票统计金额的python脚本
published: 2025-04-09
updated: 2025-04-09
description: ''
image: ''
tags: []
category: '写码'
draft: false 
---

```python
import os
import re

def sum_numbers_in_filenames(directory):
    """
    计算给定目录中所有文件名中包含的数字之和。

    Args:
        directory (str): 目录路径。

    Returns:
        float: 所有文件名中包含的数字之和。
    """
    total_sum = 0
    try:
        filenames = os.listdir(directory)
        for filename in filenames:
            # 使用正则表达式查找文件名中的所有数字
            numbers = re.findall(r'\\d+\\.?\\d*', filename)
            for number in numbers:
                try:
                    total_sum += float(number)
                except ValueError:
                    print(f"警告：无法将 '{number}' 转换为数字。")
    except FileNotFoundError:
        print(f"错误：目录 '{directory}' 不存在。")
    except Exception as e:
        print(f"发生错误：{e}")

    return total_sum

# 示例用法
directory_path = "./"  # 将此路径替换为你的目录路径
result = sum_numbers_in_filenames(directory_path)
print(f"文件名中包含的数字之和：{result}")
```

<!-- more -->
