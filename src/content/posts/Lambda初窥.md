---
title: Lambda初窥
published: 2025-03-13
updated: 2025-03-13
description: ''
image: ''
tags: []
category: '代码'
draft: false 
---
```python
ZERO = lambda f:lambda x:x
SUC = lambda church:lambda f:lambda x:church(f)(f(x))

to_int = lambda n:n(lambda x:x+1)(0)
to_church = lambda n:ZERO if n==0 else SUC(to_church(n-1))

ONE = to_church(1)
TWO = to_church(2)
THREE = to_church(3)
FOUR = to_church(4)
FIVE = to_church(5)
SIX = to_church(6)
SEVEN = to_church(7

ADD = lambda m:lambda n:lambda f:lambda x:m(f)(n(f)(x))
ADD_1 = lambda m:lambda n:m(SUC)(n)
MUL = lambda m:lambda n:lambda f:lambda x:m(lambda x1:n(f)(x1))(x)
POW = lambda m:lambda n:n(MUL(m))(ONE) #POW(m)(n) = m^n

PAIR = lambda x:lambda y:lambda f:f(x)(y)
FST = lambda p: p(lambda x: lambda y: x)
LST = lambda p: p(lambda x: lambda y: y)
PHI = lambda p: PAIR(LST(p))(SUC(LST(p)))
PRED = lambda n:FST(n(PHI)(PAIR(ZERO)(ZERO)))
SUB = lambda m: lambda n: n(PRED)(m)

PAIR = lambda x:lambda y:lambda f:f(x)(y)
FST = lambda p: p(lambda x: lambda y: x)
LST = lambda p: p(lambda x: lambda y: y)
PHI = lambda p: PAIR(LST(p))(SUC(LST(p)))
PRED = lambda n:FST(n(PHI)(PAIR(ZERO)(ZERO)))
SUB = lambda m: lambda n: n(PRED)(m)

IS_ZERO = lambda n:n(lambda x:FALSE)(TRUE)
LTE = lambda m:lambda n:IS_ZERO(SUB(m)(n))
GT = lambda m:lambda n:NOT(LTE(m)(n))
EQ = lambda m:lambda n:AND(LTE(m)(n))(LTE(n)(m))
GTE = lambda m:lambda n:OR(GT(m)(n))(EQ(m)(n))
LT = lambda m:lambda n:NOT(GTE(m)(n))

I = lambda x:x
W = lambda f:lambda x:f(x)(x)
Y = lambda f:f
```
参考资料：
- [wiki](https://zh.wikipedia.org/wiki/%CE%9B%E6%BC%94%E7%AE%97)
- [Y combinator](https://matt.might.net/articles/python-church-y-combinator/)