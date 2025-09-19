# swimming_frontend

这是一个基于 Vue3 + Vite 的前端项目。

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup and Build

```sh
./build.sh
```

## Details
前端共有以下页面：
| 页面名称 | 说明 | 状态 | uri |
| --- | --- | --- | --- |
| 首页 | 展示首页信息 | - | / |
| 新闻页 | 新闻列表 | √ | /news |
| 新闻详情页 | 展示新闻详情 | √ | /news/:id |
| 后端登录页 | 后端管理员登录 | √ | /login |
| 管理页 | 后端管理员管理信息 | - | /manage |
| 等级查询页 | 查询游泳等级信息 | - | /swimlevel |
| 运动员报名页 | 运动员报名参加比赛 | √ | /register/:gameid |
| 404 页面 | 未找到页面 | √ | * |