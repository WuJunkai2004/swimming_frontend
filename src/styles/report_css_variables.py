#/usr/bin python3
"""
扫描 src/* 下所有 *.vue 文件（包括子目录）
获取 css 里面的遍历，判断其是否存在于 src/styles/variables.txt
"""

import os
import re

# 判断是否在主目录
if not os.path.exists('vite.config.js'):
    print("请在项目主目录下运行此脚本")
    exit(1)

# 获取所有 vue 文件名
vue_files = []
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.vue'):
            vue_files.append(os.path.join(root, file))

# 定义正则表达式
pattern = re.compile(r'(?<=var\()[\-A-Za-z0-9_]+?(?=\))')
css_variables = set()
css_from      = dict()

# 扫描所有 vue 文件
for vue_file in vue_files:
    with open(vue_file, 'r', encoding='utf-8') as f:
        content = f.read()
        matches = pattern.findall(content)
        css_variables.update(matches)
        for css in matches:
            if css not in css_from:
                css_from[css] = []
            css_from[css].append(vue_file)

# 获取 src/styles/checked_css_variables.txt
with open("./src/styles/checked_css_variables.txt") as f:
    css_checked = set(f.read().splitlines(keepends=True))

print(f"扫描到 {len(css_variables)} 个 css 变量")

all_check = True

for css in css_variables:
    if css + "\n" not in css_checked:
        all_check = False
        print(f"未检查的 css 变量: {css}")
        for from_file in css_from[css]:
            print(f"  来源: {from_file}")

if not all_check:
    print("请检查以上新增的 css 变量")
    print("如果确认无误，请将其添加到 src/styles/checked_css_variables.txt")
    exit(1)