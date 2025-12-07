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

