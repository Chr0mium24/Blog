---
title: Python的类和属性
published: 2025-12-07
updated: 2025-12-07
description: ''
tags: []
category: 代码
---

# 类

实例可以是一个类，所有type的实例都是类。

object是type的实例（object是一个类），type是object的子类（object是所有类的父类）

```python
isinstance(object, type) # True
issubclass(type, object) # True
type(object) # True
type(type) # True
type.mro() # (type, object)
object.mro() # (object,)

if isinstance(obj, type): #isinstance 支持继承传递
  print(f"{obj}是一个类")
# 如果obj的mro最后两项是type,object 那它是一个元类
```

class是一个语法糖，等价于

My_class=type(name,mro,class_dict)

`My_class = type("My_class",(object,),{...})`

`MyMeta = type("MyMeta",(type,object),{...}) `

```python
# 类的 dict (在类定义结束时就有了) 
class MyMeta(type):
    def __new__(cls, name, bases, attrs):
        print(f"1. 元类正在创建类 {name}")
        print(f"2. 传入的 attrs (即未来的类dict): {attrs.keys()}")
        # 此时 object.__new__ 还没运行
        return super().__new__(cls, name, bases, attrs)

class Person(metaclass=MyMeta):
    species = "Human"  # 进类的 dict
    def __init__(self, name):
        self.name = name # 进实例的 dict

print(f"3. 类创建完毕，查看 Person.__dict__: {Person.__dict__}")
# --- 实例的 dict (实例化时由 object.__new__ 产生) ---
print("4. 开始实例化...")
p = Person("Jack") # 触发 object.__new__
print(f"5. 实例 dict: {p.__dict__}")
```

# 属性

所有函数都有`__get__`方法，用于返回bound method

当你执行 `obj.func` 时，Python 内部逻辑（`__getattribute__`）是这样：

1. **数据描述符优先**：如果类里有 `func` 且它有 `__set__` 和 `__get__`（比如 `@property`），那就用类的。
   * *注：普通函数只有 `__get__`，没有 `__set__`，所以不属于这一条。*
2. **实例字典**：如果在 `obj.__dict__` 里找到了 `func`，**直接返回这个值**。
   * **关键点**：哪怕这个值是个函数，有`__get__`，也直接返回。
3. **非数据描述符：如果实例里没找到，去类里找。如果类里找到了 `func` 且它有 `__get__`，**这时候才触发绑定，返回 `Bound Method`。
4. **类字典（无描述符）**：如果类里有，但没 `__get__`，直接返回。

# 多继承

以下是手工计算 C3 MRO 的标准公式和步骤。

### 1. 核心公式

假设类 C 继承自父类 B\_1, B\_2, ..., B\_n，即 `class C(B1, B2, ...):`。

**L(C) 表示类 C 的 MRO 列表**，公式如下：

L(C) = [C] + \\text{merge}(L(B\_1), L(B\_2), ..., L(B\_n), [B\_1, B\_2, ..., B\_n])

**公式解读：**

1. **[C]**：C 永远在最前面。
2. **L(B\_n)**：父类们的 MRO 列表。
3. **[B\_1, ..., B\_n]**：父类在定义时的**原始顺序列表**（这一项非常重要，保证了局部优先顺序）。

### 2. merge 操作的规则（关键！）

`merge` 函数会对传入的一组列表进行操作。**规则：** 检查**第一个列表**的**头元素**（Head），看它是否出现在**其他任何列表**的**尾部**（Tail）。

* **头元素（Head）**：列表的第一个元素。
* **尾部（Tail）**：列表中除了第一个元素以外的所有元素。

**逻辑流程：**

1. 取出第一个列表的头元素 `H`。
2. 检查 `H` 是否出现在**其他**列表的**尾部**中？
   * **如果没有出现**（即 `H` 是合法的）：将 `H` 提取出来放入结果列表，并从**所有**包含 `H` 的列表中删除它。然后重新开始第一步。
   * **如果出现了**（即 `H` 被后面的列表“阻塞”了）：跳过当前列表，尝试下一个列表的头元素。
3. 重复上述步骤，直到所有列表为空。
4. 如果无法提取任何元素（死锁），则抛出 `TypeError`（无法创建一致的 MRO）。

```
class X: pass
class Y: pass
class Z: pass
class A(X, Y): pass
class B(Y, Z): pass
class M(B, A, Z): pass
```

**计算 ​L(M)：**L(M) = [M] + \\text{merge}(L(B), L(A), L(Z), [B, A, Z])

已知：L(B) = [B, Y, Z]L(A) = [A, X, Y]L(Z) = [Z]

L(M) = [M] + \\text{merge}([B, Y, Z], [A, X, Y], [Z], [B, A, Z])

1. **检查 ​`B`**：不在其他尾部 (`[X, Y]`, `[]`, `[A, Z]`)。**提取 B**。
   * `merge([Y, Z], [A, X, Y], [Z], [A, Z])`
2. **检查 ​`Y`**：在 `[A, X, Y]` 的尾部吗？**是！**（被 X 挡住了）。**跳过 ​`Y`**。
3. **检查 ​`A`** (list2 的头)：不在其他尾部 (`[Z]`, `[]`, `[Z]`)。**提取 A**。
   * `merge([Y, Z], [X, Y], [Z], [Z])`
4. **检查 ​`Y`** (list1 的头)：在 `[X, Y]` 尾部吗？**是！**。**跳过 ​`Y`**。
5. **检查 ​`X`** (list2 的头)：不在其他尾部。**提取 X**。
   * `merge([Y, Z], [Y], [Z], [Z])`
6. **检查 ​`Y`** (list1 的头)：不在其他尾部（list2 只有 Y，那是头，不是尾）。**提取 Y**。
   * `merge([Z], [], [Z], [Z])`
7. **检查 ​`Z`**：**提取 Z**。

**最终结果：** `M -> B -> A -> X -> Y -> Z`

