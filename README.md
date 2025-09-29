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
| 关于我们 | 展示关于我们信息 | - | /introduction |
| 新闻页 | 新闻列表 | √ | /activity |
| 新闻详情页 | 展示新闻详情 | √ | /activity/:id |
| 等级查询页 | 查询游泳等级信息 | √ | /swimlevel |
| 运动员报名页 | 运动员报名参加比赛 | √ | /register/:gameid |
| 领导/负责人展示页 | 展示领导/负责人信息 | √ | /leaders |
| 优秀运动员展示页 | 展示优秀运动员信息 | √ | /excellence |
| 404 页面 | 未找到页面 | √ | * |
| 管理登录页 | 后端管理员登录 | √ | /login |
| 管理页 | 后端管理员管理信息 | - | /manage |


### 管理页面
管理页面在一个框架内，包含以下子页面：
| 页面名称 | 状态 | uri |
| --- | --- | --- |
| 发布比赛 |   | #/publish-game |
| 管理比赛 |   | #/manage-game |
| 发布新闻 | - | #/publish-news |
| 管理新闻 | √ | #/manage-news |
| 管理运动员 | √ | #/manage-athletes |
| 管理领导/负责人 | √ | #/manage-leaders |
| 管理管理员 |   | #/manage-admins |