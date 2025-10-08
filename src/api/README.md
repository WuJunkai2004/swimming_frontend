## API 测试
### 本目录下的json文件均为 API 测试相关
基本结构如下
```json5
{
  "url": "sport/preview",
  "description": "Get sport preview data",
  "params": {
    "gameId": "比赛ID，用于获取指定比赛的预览数据"
  },
  "method": [
    "GET",
    "POST"
  ],
  "response": {
    //The response data
  },
  "fail": {
    //The fail response data
  }
}
```
### 文档生成器说明
文档生成器需要在主目录下运行
```bash
python3 src/api/generate_apidoc.py
```

生成的文件会放置在 `dist/接口文档.auto.md` 中

### vercel.json 生成器说明
vercel.json 生成器需要在主目录下运行
```bash
python3 src/api/generate_vercel.py
```

生成的文件会放置在 `vercel.json` 中