---
title: 某图书管理系统的分析
published: 2025-04-01
updated: 2025-04-01
description: ''
image: ''
tags: []
category: '代码'
draft: false 
---

只做了读，预订还没折腾，cookie的自动化获取有、麻烦

```python
import requests
import json
from datetime import datetime
import pytz
IC_COOKIE = ""
def timestamp_to_gmt8_time_of_day(timestamp_ms):
    """
    将毫秒级时间戳转化为 GMT+08:00 时区一天里的几点。

    Args:
        timestamp_ms: 毫秒级时间戳。

    Returns:
        一个字符串，表示 GMT+08:00 时区一天里的几点，格式为 "HH:MM:SS"。
        如果输入不是数字或无法转换，则返回 None。
    """
    try:
        # 将毫秒转换为秒
        timestamp_sec = timestamp_ms / 1000.0
        # 创建 UTC 时间的 datetime 对象
        utc_datetime = datetime.utcfromtimestamp(timestamp_sec)
        # 获取 GMT+08:00 时区
        gmt8_tz = pytz.timezone('Etc/GMT-8')  # 注意：pytz 中 GMT+08:00 可能表示为 'Etc/GMT-8' 或 'Asia/Shanghai' 等
        # 将 UTC 时间转换为 GMT+08:00 时间
        gmt8_datetime = utc_datetime.replace(tzinfo=pytz.utc).astimezone(gmt8_tz)
        # 格式化为一天里的时间
        time_of_day = gmt8_datetime.strftime('%H:%M:%S')
        return time_of_day
    except (TypeError, ValueError):
        return None
        
def fetch_room_reservations(date,kind):
    """
    Fetches room reservation data from the given URL and extracts occupied times.

    Args:
        url (str): The URL to fetch the reservation data from.

    Returns:
        dict: A dictionary where keys are room names and values are lists of
              occupied time slots (start and end times in milliseconds).
    """
    kindid = {
        "oldlib_quietroom":101766982,
        "oldlib_groupstudyroom":101420505,
        "newlib_quietroom":101505911,
        "newlib_groupstudyroom":100462149,
    }[kind]
    url = f"https://librooms.cuhk.edu.cn/ic-web/reserve?sysKind=1&resvDates={date}&page=1&pageSize=30&kindIds={kindid}&labId="
    try:
        headers={'Cookie':'ic-cookie=IC_COOKIE'}
        response = requests.get(url,headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()
        if data.get("code") == 0 and data.get("message") == "查询成功":
            reservations = {}
            for room in data['data']:
                room_name = room['roomSn']
                for reserve in room['resvInfo']:
                    if not reservations.get(room_name):
                        reservations[room_name]=[]
                    reservations[room_name].append({'startTime':timestamp_to_gmt8_time_of_day(reserve['startTime']),'endTime':timestamp_to_gmt8_time_of_day(reserve['endTime'])})
            return reservations
        else:
            print(f"Error: {data.get('message')}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None
    except json.JSONDecodeError:
        print("Error decoding JSON response.")
        return None
```
