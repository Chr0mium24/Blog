---
title: pyscript包管理踩坑
published: 2025-09-30
updated: 2025-09-30
description: ''
tags: []
category: 代码
---

关键代码：
```python
outputElement.innerText += '\n正在安装 lcapy...';
await pyodide.runPythonAsync(`
    import micropip
    await micropip.install('lcapy',deps=False)
`);
```

当频繁出现
> ValueError: Can't find a pure Python 3 wheel for 'importlib'.
> See: https://pyodide.org/en/stable/usage/faq.html#why-can-t-micropip-find-a-pure-python-wheel-for-a-package
> You can use await micropip.install(..., keep_going=True) to get a list of all packages with missing wheels.

这类下载不到官方库的抽象问题时，并不要去`keep_going=True`，而是应该自己加载好所有的依赖`await pyodide.loadPackage(["numpy", "scipy", "sympy", "matplotlib", "networkx"])`，忽略原来提供的包依赖`deps=False`。