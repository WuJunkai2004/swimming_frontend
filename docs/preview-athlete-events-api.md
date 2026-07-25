# 运动员报名项目更新接口（待后端实现）

用于 `manage-games.vue` 预览弹窗中对运动员已报名项目进行增删改。

## 更新运动员报名项目

- **Method:** `POST`
- **Path:** `/sport/updateAthleteEvents`
- **Tags:** 比赛报名

### 请求体

Content-Type: `application/json`

```json5
{
  "token": "管理员登录后获取的token",
  "gameId": "c589df2d2f3b48dc849821ab6d5c50b8", // 比赛uuid
  "athleteId": "102300228",                       // 运动员学号
  "athleteName": "张三",                          // 运动员姓名，用于日志/提示
  "events": [                                     // 最终要保留的项目枚举列表
    "MAN_FREESTYLE_50M",
    "WOMAN_BREASTSTROKE_100M"
  ]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `token` | `string` | 是 | 管理员 token，需校验管理员权限 |
| `gameId` | `string` | 是 | 比赛 UUID |
| `athleteId` | `string` | 是 | 运动员学号，用于唯一确定运动员 |
| `athleteName` | `string` | 否 | 运动员姓名，用于前端提示与日志 |
| `events` | `string[]` | 是 | 最终的项目枚举列表；删除某项目即不放入该数组 |

### 后端校验

1. `gameId` 对应的比赛必须存在且未截止（或管理员允许修改）。
2. `events` 中每一项必须是 `ActivityTypesEnum` 的有效枚举名。
3. `events` 必须全部属于该比赛允许的 `allowedEvents`。
4. `events` 数量不得超过该比赛的 `athleteActivityLimit`。
5. 运动员必须在该比赛的报名名单中（通过 `athleteId` + `gameId` 定位）。

### 响应

#### 成功

```json5
{
  "statusCode": 200,
  "message": "成功",
  "data": null
}
```

#### 失败示例

```json5
{
  "statusCode": 433, // 或已有的 REQUEST_PARAMETER_ERROR、FAILED_TO_UPLOAD 等
  "message": "所选项目不在比赛允许范围内",
  "data": null
}
```

### 前端调用方式

接口实现后，运行 `node scripts/gen_serve.js` 重新生成 `src/api/serve.js`，前端即可通过 `sportApi.updateAthleteEvents(payload)` 调用。

在接口未实现前，前端会按上述字段直接调用 `/sport/updateAthleteEvents`，后端可据此实现。
