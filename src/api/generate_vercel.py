#/usr/bin python3
"""
根据json文件，生成Vercel配置文件
"""

import os
import json

# 判断是否在主目录
if not os.path.exists('vite.config.js'):
    print("请在项目主目录下运行此脚本")
    exit(1)

# 读取环境变量
backend_url = os.getenv('BACKEND_URL')
if not backend_url:
    print("错误：环境变量 BACKEND_URL 未设置。")
    exit(1)
while backend_url.endswith('/'):
    backend_url = backend_url[:-1]

# json file path is the same directory as this script
files_dir = os.path.dirname(os.path.abspath(__file__))

# glob all json files in the directory
json_files = [f for f in os.listdir(files_dir) if f.endswith('.json')]
data_list = []

for file_name in json_files:
    file_path = os.path.join(files_dir, file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    data_list.append(data)

# 生成 vercel.json 配置
vercel_config = {
    "rewrites": []
}

for api in data_list:
    vercel_config["rewrites"].append({
        "source": api['url'],
        "destination": f"{backend_url}{api['url']}"
    })

vercel_config["rewrites"].append({
    "source": "/(.*)",
    "destination": "/index.html"
})

# 写入 vercel.json 文件
with open('vercel.json', 'w', encoding='utf-8') as f:
    json.dump(vercel_config, f, indent=2, ensure_ascii=False)