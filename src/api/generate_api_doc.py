#/usr/bin python3
"""
根据json文件，生成API接口文档
"""

import os
import json

# 判断是否在主目录
if not os.path.exists('vite.config.js'):
    print("请在项目主目录下运行此脚本")
    exit(1)

# 判断 dist 目录是否存在, 不存在则创建
if not os.path.exists('dist'):
    os.makedirs('dist')

def PrevLevel(url):
    "优先级"
    prev = {
        '/activity': '1',
        '/leader': '2',
        '/player': '3',
        '/admin': '4',
        '/sport': '5',
        '/files': '6',
    }
    for k, v in prev.items():
        url = url.replace(k, v)
    return url


def generator(api_data, api_index):
    """生成markdown格式的API文档"""
    lines = []
    lines.append(f"### {api_index} {api_data['description']}")
    lines.append(f"- 接口: `{api_data['url']}`")
    lines.append(f"- 方法: `{' '.join(api_data['method'])}`")
    if api_data['params']:
        lines.append(f"- 参数:")
        for param, desc in api_data['params'].items():
            lines.append(f"  - `{param}`: {desc}")
    lines.append("- 返回:  ")
    lines.append("")
    lines.append("**成功**:")
    lines.append("```json")
    lines.extend(json.dumps(api_data['response'], indent=2, ensure_ascii=False).splitlines())
    lines.append("```")
    lines.append("**失败**:")
    lines.append("```json")
    lines.extend(json.dumps(api_data['fail'], indent=2, ensure_ascii=False).splitlines())
    lines.append("```")
    lines.append("")

    return lines


# json file path is the same directory as this script
files_dir = os.path.dirname(os.path.abspath(__file__))

# glob all json files in the directory
json_files = [f for f in os.listdir(files_dir) if f.endswith('.json')]
data_list = []

for file_name in json_files:
    file_path = os.path.join(files_dir, file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        api_data = json.load(f)
    data_list.append(api_data)

# sort by PrevLevel
data_list.sort(key=lambda x: PrevLevel(x['url']))

# generate markdown file
markdown_content = ["# API接口文档(自动生成)"]

last_group = ''
group_id = 0
api_id   = 0
for api in data_list:
    group = api['url'].split('/')[1]
    if group != last_group:
        group_id += 1
        api_id = 0
        last_group = group
        markdown_content.append(f"## {group_id}. {group}  ")
    api_id += 1
    markdown_content.extend(generator(api, f"{group_id}.{api_id}"))

# write to file
output_path = os.path.join('dist', './接口文档.auto.md')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(markdown_content))