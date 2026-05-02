# OpenAPI definition

- **OpenAPI Version:** `3.1.0`
- **API Version:** `v0`

## Servers

- **URL:** `http://124.220.58.44:10086`
  - **Description:** Generated server url

## Operations

### 运动员报名

- **Method:** `POST`
- **Path:** `/sport/register`
- **Tags:** 比赛报名

运动员提交报名信息参加比赛，包含姓名、学号、学院、项目等信息

#### Request Body

##### Content-Type: application/json

- **`academicNumber` (required)**

  `string`

- **`college` (required)**

  `string`

- **`competitionId` (required)**

  `string`

- **`name` (required)**

  `string`

- **`sportType` (required)**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`group`**

  `string`, possible values: `"A", "B"`

**Example:**

```json
{
  "name": "",
  "academicNumber": "",
  "sportType": "MAN_FREESTYLE_50M",
  "college": "",
  "competitionId": "",
  "group": "A"
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 预览报名信息

- **Method:** `POST`
- **Path:** `/sport/preview`
- **Tags:** 比赛报名

管理员预览指定比赛的报名情况，包括各学院报名人数统计

#### Request Body

##### Content-Type: application/json

- **`gameId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 导出报名信息

- **Method:** `POST`
- **Path:** `/sport/export`
- **Tags:** 比赛报名

将比赛报名信息导出为Excel文件，方便管理员进行数据处理

#### Request Body

##### Content-Type: application/json

- **`gameId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": ""
}
```

#### Responses

##### Status: 200 OK

### 上传比赛数据

- **Method:** `POST`
- **Path:** `/api/volunteer/uploadData`
- **Tags:** 志愿者管理

志愿者根据职位权限上传比赛相关数据，包括成绩、犯规记录等。不同职位拥有不同的数据上传权限

#### Parameters

##### `type` required

- **In:** `query`

志愿者职位类型，包括：EXECUTIVE\_PRESIDENT(执行总裁)、STARTER(发令员)、TIMER(计时员)、TECHNICAL\_INSPECTION\_OF\_SWIMMING\_IN(游尽技术检查员)、REINTAKE\_INSPECTION(转身检查)、REBORN\_INSPECTOR(转身检查长)、OTHER(其他)

`string`, possible values: `"EXECUTIVE_PRESIDENT", "STARTER", "TIMER", "TECHNICAL_INSPECTION_OF_SWIMMING_IN", "REINTAKE_INSPECTION", "REBORN_INSPECTOR", "OTHER"`

#### Request Body

##### Content-Type: application/json

- **`gameId` (required)**

  `string`

- **`id` (required)**

  `string`

- **`token` (required)**

  `string`

- **`data`**

  `object`

  - **`achievements`**

    `number`, format: `double`

  - **`foulDescription`**

    `string`

  - **`foulOrNot`**

    `boolean`

  - **`foulReason`**

    `string`, possible values: `"FALSE_START", "ILLEGAL_START_POSITION", "START_BEFORE_SIGNAL", "MORE_THAN_15_METERS_INTO_THE_WATER", "FREESTYLE_SWIM_IN_VIOLATION_BODY_TOTALLY_SUBMERGED", "FREESTYLE_DID_NOT_TOUCH_WALL", "BACKSTROKE_SWIM_IN_VIOLATION_SUPINE_POSITION", "BACKSTROKE_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BACKSTROKE_TURN_NOT_ON_BACK_AFTER_LEAVE_WALL", "BACKSTROKE_TURN_NOT_INITIATED_IMMEDIATELY", "BACKSTROKE_FINISH_NOT_ON_BACK", "BREASTSTROKE_LONG_SWIM_BACK_TO_SHOULDER", "BREASTSTROKE_LONG_SWIM_BITE_LEGS_OVER_1_TIME", "BREASTSTROKE_LONG_SWIM_HEAD_EXPOSED", "BREASTSTROKE_HANDS_NOT_PUSHED_FROM_BREAST", "BREASTSTROKE_ELBOWS_NOT_UNDER_WATER", "BREASTSTROKE_HANDS_BEYOND_HIP_LINE", "BREASTSTROKE_HEAD_NOT_EXPOSED_EACH_CYCLE", "BREASTSTROKE_FEET_NOT_TURNED_OUT", "BREASTSTROKE_DOWNWARD_BUTTERFLY_KICK", "BREASTSTROKE_SWIM_IN_VIOLATION_BODY_MUST_SUPINE", "BREASTSTROKE_SWIM_IN_VIOLATION_ACTION_CYCLE_NOT_ONE_HAND_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_DIFFERENT", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_SWITCH_POSITION", "BREASTSTROKE_SWIM_IN_VIOLATION_ELBOW_OUT_OF_WATER", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_HANDS_NOT_EXTENDED_FROM_CHEST", "BREASTSTROKE_SWIM_IN_VIOLATION_RISE_OR_DEPRESSION_AFTER_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_EXTENDED_FROM_WATER", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_BOTH_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_SUPINE_POSITION", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_ACTION_DIFFERENT", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_SWITCH_SWIM", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_BUTTERFLY_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BUTTERFLY_MORE_THAN_ONE_ARM_PULL_UNDERWATER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_MIXED_TECHNIQUE", "MEDLEY_RELAY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "MEDLEY_FREESTYLE_KICK_BEFORE_RETURN_PRONE", "FREESTYLE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "FREESTYLE_TURNING_VIOLATION_HEAD_NOT_LEAVE_WATER", "BACKSTROKE_TURNING_VIOLATION_DOUBLE_ARM_SWIM", "BACKSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BACKSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BOTH_HANDS_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BREASTSTROKE_TURNING_VIOLATION_DOUBLE_LEG_SWIM", "BREASTSTROKE_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "BUTTERFLY_TURNING_VIOLATION_SUPINE_POSITION", "BUTTERFLY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SWIM_HAND_UNDER_WATER", "BUTTERFLY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "MEDLEY_TURNING_VIOLATION_SUPINE_POSITION", "MEDLEY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "MEDLEY_TURNING_VIOLATION_FREESTYLE_ROLL_FLIP", "INCOMPLETE_DISTANCE", "LANE_DEVIATION", "INTERFERENCE", "LANE_ROPE_PULLING", "WALKING_ON_BOTTOM", "STANDING_ON_BOTTOM", "FINISH_NO_TOUCH", "FINISH_SINGLE_ARM_SWIM", "FINISH_SUPINE_POSITION", "RELAY_EARLY_TAKEOFF", "RELAY_ILLEGAL_ENTRY", "RELAY_ORDER_VIOLATION", "RELAY_NOT_IN_ORDER_LISTED", "RELAY_EXCHANGE_NOT_FROM_PLATFORM", "RELAY_REENTERED_WATER_BEFORE_FINISH", "FAILED_LEAVE_POOL_SOON_AFTER_FINISH", "PACE_MAKING_DEVICE_OR_PLAN", "UNAUTHORIZED_ENTRY_DURING_RACE", "ILLEGAL_SWIMMEAR", "ILLEGAL_EQUIPMENT", "ADVERTISING_VIOLATION", "DELAY_OF_GAME", "DISOBEDIENCE", "MISCONDUCT", "CALL_ROOM_ABSENCE", "UNAUTHORIZED_ENTRY", "ANY_BODY_TOUCH_BOTTOM", "BREASTSTROKE_SWIM_IN_VIOLATION_MAX_TURN_ANGLE_NOT_REACH_90_DEGREES", "FREESTYLE_SWIM_IN_NOT_PRONE", "NO_FOUL", "ABSTAIN", "OTHER_FOUL"`

**Example:**

```json
{
  "token": "",
  "id": "",
  "gameId": "",
  "data": {
    "foulOrNot": true,
    "foulReason": "FALSE_START",
    "foulDescription": "",
    "achievements": 1
  }
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 执行总裁更新结果

- **Method:** `POST`
- **Path:** `/api/volunteer/updateResult`
- **Tags:** 志愿者管理

执行总裁对比赛结果进行更新操作，可修改各道次的成绩、犯规状态等数据

#### Request Body

##### Content-Type: application/json

- **`data`**

  `array`

  **Items:**

  - **`achievements`**

    `number`, format: `double`

  - **`foulDescription`**

    `string`

  - **`foulOrNot`**

    `boolean`

  - **`foulReson`**

    `string`, possible values: `"FALSE_START", "ILLEGAL_START_POSITION", "START_BEFORE_SIGNAL", "MORE_THAN_15_METERS_INTO_THE_WATER", "FREESTYLE_SWIM_IN_VIOLATION_BODY_TOTALLY_SUBMERGED", "FREESTYLE_DID_NOT_TOUCH_WALL", "BACKSTROKE_SWIM_IN_VIOLATION_SUPINE_POSITION", "BACKSTROKE_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BACKSTROKE_TURN_NOT_ON_BACK_AFTER_LEAVE_WALL", "BACKSTROKE_TURN_NOT_INITIATED_IMMEDIATELY", "BACKSTROKE_FINISH_NOT_ON_BACK", "BREASTSTROKE_LONG_SWIM_BACK_TO_SHOULDER", "BREASTSTROKE_LONG_SWIM_BITE_LEGS_OVER_1_TIME", "BREASTSTROKE_LONG_SWIM_HEAD_EXPOSED", "BREASTSTROKE_HANDS_NOT_PUSHED_FROM_BREAST", "BREASTSTROKE_ELBOWS_NOT_UNDER_WATER", "BREASTSTROKE_HANDS_BEYOND_HIP_LINE", "BREASTSTROKE_HEAD_NOT_EXPOSED_EACH_CYCLE", "BREASTSTROKE_FEET_NOT_TURNED_OUT", "BREASTSTROKE_DOWNWARD_BUTTERFLY_KICK", "BREASTSTROKE_SWIM_IN_VIOLATION_BODY_MUST_SUPINE", "BREASTSTROKE_SWIM_IN_VIOLATION_ACTION_CYCLE_NOT_ONE_HAND_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_DIFFERENT", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_SWITCH_POSITION", "BREASTSTROKE_SWIM_IN_VIOLATION_ELBOW_OUT_OF_WATER", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_HANDS_NOT_EXTENDED_FROM_CHEST", "BREASTSTROKE_SWIM_IN_VIOLATION_RISE_OR_DEPRESSION_AFTER_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_EXTENDED_FROM_WATER", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_BOTH_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_SUPINE_POSITION", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_ACTION_DIFFERENT", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_SWITCH_SWIM", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_BUTTERFLY_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BUTTERFLY_MORE_THAN_ONE_ARM_PULL_UNDERWATER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_MIXED_TECHNIQUE", "MEDLEY_RELAY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "MEDLEY_FREESTYLE_KICK_BEFORE_RETURN_PRONE", "FREESTYLE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "FREESTYLE_TURNING_VIOLATION_HEAD_NOT_LEAVE_WATER", "BACKSTROKE_TURNING_VIOLATION_DOUBLE_ARM_SWIM", "BACKSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BACKSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BOTH_HANDS_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BREASTSTROKE_TURNING_VIOLATION_DOUBLE_LEG_SWIM", "BREASTSTROKE_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "BUTTERFLY_TURNING_VIOLATION_SUPINE_POSITION", "BUTTERFLY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SWIM_HAND_UNDER_WATER", "BUTTERFLY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "MEDLEY_TURNING_VIOLATION_SUPINE_POSITION", "MEDLEY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "MEDLEY_TURNING_VIOLATION_FREESTYLE_ROLL_FLIP", "INCOMPLETE_DISTANCE", "LANE_DEVIATION", "INTERFERENCE", "LANE_ROPE_PULLING", "WALKING_ON_BOTTOM", "STANDING_ON_BOTTOM", "FINISH_NO_TOUCH", "FINISH_SINGLE_ARM_SWIM", "FINISH_SUPINE_POSITION", "RELAY_EARLY_TAKEOFF", "RELAY_ILLEGAL_ENTRY", "RELAY_ORDER_VIOLATION", "RELAY_NOT_IN_ORDER_LISTED", "RELAY_EXCHANGE_NOT_FROM_PLATFORM", "RELAY_REENTERED_WATER_BEFORE_FINISH", "FAILED_LEAVE_POOL_SOON_AFTER_FINISH", "PACE_MAKING_DEVICE_OR_PLAN", "UNAUTHORIZED_ENTRY_DURING_RACE", "ILLEGAL_SWIMMEAR", "ILLEGAL_EQUIPMENT", "ADVERTISING_VIOLATION", "DELAY_OF_GAME", "DISOBEDIENCE", "MISCONDUCT", "CALL_ROOM_ABSENCE", "UNAUTHORIZED_ENTRY", "ANY_BODY_TOUCH_BOTTOM", "BREASTSTROKE_SWIM_IN_VIOLATION_MAX_TURN_ANGLE_NOT_REACH_90_DEGREES", "FREESTYLE_SWIM_IN_NOT_PRONE", "NO_FOUL", "ABSTAIN", "OTHER_FOUL"`

  - **`name`**

    `string`

- **`gameId`**

  `string`

- **`group`**

  `integer`, format: `int32`

- **`marked`**

  `integer`, format: `int32`

- **`program`**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`time`**

  `string`, possible values: `"MORNING", "AFTERNOON", "EVENING"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "time": "MORNING",
  "program": "MAN_FREESTYLE_50M",
  "marked": 1,
  "group": 1,
  "data": [
    {
      "name": "",
      "achievements": 1,
      "foulOrNot": true,
      "foulReson": "FALSE_START",
      "foulDescription": ""
    }
  ]
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 执行总裁审核结果

- **Method:** `POST`
- **Path:** `/api/volunteer/reviewResult`
- **Tags:** 志愿者管理

执行总裁查看并审核当前比赛项目的结果数据，确认各项成绩和犯规记录是否正确

#### Request Body

##### Content-Type: application/json

- **`gameId`**

  `string`

- **`group`**

  `integer`, format: `int32`

- **`marked`**

  `integer`, format: `int32`

- **`program`**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`time`**

  `string`, possible values: `"MORNING", "AFTERNOON", "EVENING"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "time": "MORNING",
  "program": "MAN_FREESTYLE_50M",
  "marked": 1,
  "group": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 志愿者登录

- **Method:** `POST`
- **Path:** `/api/volunteer/login`
- **Tags:** 志愿者管理

志愿者通过姓名、学号、职位和比赛ID进行登录，登录成功后返回token用于后续操作

#### Request Body

##### Content-Type: application/json

- **`gameId`**

  `string`

- **`name`**

  `string`

- **`position`**

  `string`, possible values: `"EXECUTIVE_PRESIDENT", "STARTER", "TIMER", "TECHNICAL_INSPECTION_OF_SWIMMING_IN", "REINTAKE_INSPECTION", "REBORN_INSPECTOR", "OTHER"`

- **`road`**

  `array`

  **Items:**

  `integer`, format: `int32`

- **`studentNumber`**

  `string`

**Example:**

```json
{
  "name": "",
  "position": "EXECUTIVE_PRESIDENT",
  "studentNumber": "",
  "road": [
    1
  ],
  "gameId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取比赛列表

- **Method:** `POST`
- **Path:** `/api/volunteer/getCompetitionList`
- **Tags:** 志愿者管理

根据比赛ID、时间段和标记状态获取对应的比赛列表信息，用于志愿者查看需要处理的比赛项目

#### Request Body

##### Content-Type: application/json

- **`gameId`**

  `string`

- **`marked`**

  `integer`, format: `int32`

- **`time`**

  `string`, possible values: `"MORNING", "AFTERNOON", "EVENING"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "time": "MORNING",
  "marked": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 执行总裁确认结果

- **Method:** `POST`
- **Path:** `/api/volunteer/confirmResult`
- **Tags:** 志愿者管理

执行总裁确认比赛结果无误后，提交最终结果确认，确认后结果将生效并不可再修改

#### Request Body

##### Content-Type: application/json

- **`gameId`**

  `string`

- **`group`**

  `integer`, format: `int32`

- **`marked`**

  `integer`, format: `int32`

- **`program`**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`time`**

  `string`, possible values: `"MORNING", "AFTERNOON", "EVENING"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "time": "MORNING",
  "program": "MAN_FREESTYLE_50M",
  "marked": 1,
  "group": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 按道次录入成绩

- **Method:** `POST`
- **Path:** `/api/funVolunteer/uploadResult`
- **Tags:** fun-volunteer-controller

志愿者按道次录入成绩

#### Parameters

##### `dto`

- **In:** `query`

token+比赛id+道数+成绩

#### Request Body

##### Content-Type: application/json

- **`eventId` (required)**

  `integer`, format: `int64`

- **`isValid` (required)**

  `boolean`

- **`road` (required)**

  `integer`, format: `int32`

- **`token` (required)**

  `string`

- **`invalidReason`**

  `string`

- **`invalidType`**

  `string`, possible values: `"FALSE_START", "ILLEGAL_START_POSITION", "START_BEFORE_SIGNAL", "MORE_THAN_15_METERS_INTO_THE_WATER", "FREESTYLE_SWIM_IN_VIOLATION_BODY_TOTALLY_SUBMERGED", "FREESTYLE_DID_NOT_TOUCH_WALL", "BACKSTROKE_SWIM_IN_VIOLATION_SUPINE_POSITION", "BACKSTROKE_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BACKSTROKE_TURN_NOT_ON_BACK_AFTER_LEAVE_WALL", "BACKSTROKE_TURN_NOT_INITIATED_IMMEDIATELY", "BACKSTROKE_FINISH_NOT_ON_BACK", "BREASTSTROKE_LONG_SWIM_BACK_TO_SHOULDER", "BREASTSTROKE_LONG_SWIM_BITE_LEGS_OVER_1_TIME", "BREASTSTROKE_LONG_SWIM_HEAD_EXPOSED", "BREASTSTROKE_HANDS_NOT_PUSHED_FROM_BREAST", "BREASTSTROKE_ELBOWS_NOT_UNDER_WATER", "BREASTSTROKE_HANDS_BEYOND_HIP_LINE", "BREASTSTROKE_HEAD_NOT_EXPOSED_EACH_CYCLE", "BREASTSTROKE_FEET_NOT_TURNED_OUT", "BREASTSTROKE_DOWNWARD_BUTTERFLY_KICK", "BREASTSTROKE_SWIM_IN_VIOLATION_BODY_MUST_SUPINE", "BREASTSTROKE_SWIM_IN_VIOLATION_ACTION_CYCLE_NOT_ONE_HAND_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_DIFFERENT", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_SWITCH_POSITION", "BREASTSTROKE_SWIM_IN_VIOLATION_ELBOW_OUT_OF_WATER", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_HANDS_NOT_EXTENDED_FROM_CHEST", "BREASTSTROKE_SWIM_IN_VIOLATION_RISE_OR_DEPRESSION_AFTER_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_EXTENDED_FROM_WATER", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_BOTH_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_SUPINE_POSITION", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_ACTION_DIFFERENT", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_SWITCH_SWIM", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_BUTTERFLY_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BUTTERFLY_MORE_THAN_ONE_ARM_PULL_UNDERWATER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_MIXED_TECHNIQUE", "MEDLEY_RELAY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "MEDLEY_FREESTYLE_KICK_BEFORE_RETURN_PRONE", "FREESTYLE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "FREESTYLE_TURNING_VIOLATION_HEAD_NOT_LEAVE_WATER", "BACKSTROKE_TURNING_VIOLATION_DOUBLE_ARM_SWIM", "BACKSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BACKSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BOTH_HANDS_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BREASTSTROKE_TURNING_VIOLATION_DOUBLE_LEG_SWIM", "BREASTSTROKE_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "BUTTERFLY_TURNING_VIOLATION_SUPINE_POSITION", "BUTTERFLY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SWIM_HAND_UNDER_WATER", "BUTTERFLY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "MEDLEY_TURNING_VIOLATION_SUPINE_POSITION", "MEDLEY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "MEDLEY_TURNING_VIOLATION_FREESTYLE_ROLL_FLIP", "INCOMPLETE_DISTANCE", "LANE_DEVIATION", "INTERFERENCE", "LANE_ROPE_PULLING", "WALKING_ON_BOTTOM", "STANDING_ON_BOTTOM", "FINISH_NO_TOUCH", "FINISH_SINGLE_ARM_SWIM", "FINISH_SUPINE_POSITION", "RELAY_EARLY_TAKEOFF", "RELAY_ILLEGAL_ENTRY", "RELAY_ORDER_VIOLATION", "RELAY_NOT_IN_ORDER_LISTED", "RELAY_EXCHANGE_NOT_FROM_PLATFORM", "RELAY_REENTERED_WATER_BEFORE_FINISH", "FAILED_LEAVE_POOL_SOON_AFTER_FINISH", "PACE_MAKING_DEVICE_OR_PLAN", "UNAUTHORIZED_ENTRY_DURING_RACE", "ILLEGAL_SWIMMEAR", "ILLEGAL_EQUIPMENT", "ADVERTISING_VIOLATION", "DELAY_OF_GAME", "DISOBEDIENCE", "MISCONDUCT", "CALL_ROOM_ABSENCE", "UNAUTHORIZED_ENTRY", "ANY_BODY_TOUCH_BOTTOM", "BREASTSTROKE_SWIM_IN_VIOLATION_MAX_TURN_ANGLE_NOT_REACH_90_DEGREES", "FREESTYLE_SWIM_IN_NOT_PRONE", "NO_FOUL", "ABSTAIN", "OTHER_FOUL"`

- **`rawScore`**

  `number`

**Example:**

```json
{
  "token": "",
  "eventId": 1,
  "road": 1,
  "rawScore": 1,
  "isValid": true,
  "invalidType": "FALSE_START",
  "invalidReason": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 执行总裁查看成绩

- **Method:** `POST`
- **Path:** `/api/funVolunteer/reviewResults`
- **Tags:** fun-volunteer-controller

执行总裁查看成绩

#### Parameters

##### `dto`

- **In:** `query`

token+项目id

#### Request Body

##### Content-Type: application/json

- **`eventId` (required)**

  `integer`, format: `int64`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "eventId": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 登录

- **Method:** `POST`
- **Path:** `/api/funVolunteer/login`
- **Tags:** fun-volunteer-controller

志愿者登录

#### Parameters

##### `dto`

- **In:** `query`

登录信息

#### Request Body

##### Content-Type: application/json

- **`competitionId` (required)**

  `string`

- **`name` (required)**

  `string`

- **`password` (required)**

  `string`

- **`studentNumber` (required)**

  `string`

**Example:**

```json
{
  "competitionId": "",
  "name": "",
  "studentNumber": "",
  "password": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取可录入项目列表

- **Method:** `POST`
- **Path:** `/api/funVolunteer/getEventList`
- **Tags:** fun-volunteer-controller

志愿者获取可录入项目列表

#### Parameters

##### `dto`

- **In:** `query`

token+比赛id

#### Request Body

##### Content-Type: application/json

- **`competitionId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "competitionId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 执行总裁确认成绩

- **Method:** `POST`
- **Path:** `/api/funVolunteer/confirmResults`
- **Tags:** fun-volunteer-controller

执行总裁确认成绩

#### Parameters

##### `dto`

- **In:** `query`

token+项目id

#### Request Body

##### Content-Type: application/json

- **`eventId` (required)**

  `integer`, format: `int64`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "eventId": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 上传手写签名

- **Method:** `POST`
- **Path:** `/api/contract/uploadSignature`
- **Tags:** 校友电子合同签署接口

校友上传手写签名（SVG格式），用于合同或同意书的签署

#### Request Body

##### Content-Type: application/json

- **`signature` (required)**

  `string`

- **`token` (required)**

  `string`

- **`type` (required)**

  `string`, possible values: `"CONTRACT", "CONSENT"`

**Example:**

```json
{
  "token": "",
  "signature": "",
  "type": "CONTRACT"
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 上传合同/同意书信息

- **Method:** `POST`
- **Path:** `/api/contract/uploadInfo`
- **Tags:** 校友电子合同签署接口

校友上传合同或同意书的详细信息，包括个人资料和合同相关内容

#### Parameters

##### `type` required

- **In:** `query`

合同类型枚举

`string`, possible values: `"CONTRACT", "CONSENT"`

#### Request Body

##### Content-Type: application/json

**Example:**

```json
{}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 查询签名状态

- **Method:** `POST`
- **Path:** `/api/contract/isSignature`
- **Tags:** 校友电子合同签署接口

用户查询是否已完成签名，返回签名状态及相关信息

#### Request Body

##### Content-Type: application/json

- **`token`**

  `string`

**Example:**

```json
{
  "token": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取签名图片

- **Method:** `POST`
- **Path:** `/api/contract/getSignature`
- **Tags:** 校友电子合同签署接口

校友或管理员获取已上传的手写签名SVG图片

#### Parameters

##### `uuid` required

- **In:** `query`

签名唯一标识UUID

`string`

##### `hash` required

- **In:** `query`

签名SHA-512哈希值

`string`

#### Request Body

##### Content-Type: application/json

**One of:**

- **`name` (required)**

  `string`

- **`token` (required)**

  `string`

- **`type` (required)**

  `string`

**All of:**

- **`name` (required)**

  `string`

- **`token` (required)**

  `string`

- **`type` (required)**

  `string`

**All of:**

- **`name` (required)**

  `string`

- **`token` (required)**

  `string`

- **`type` (required)**

  `string`

* **`address`**

  `string`

* **`addressForService`**

  `string`

* **`contactPhone`**

  `string`

* **`contract`**

  `string`

* **`identityNumber`**

  `string`

* **`phone`**

  `string`

* **`signingAddress`**

  `string`

**Example:**

```json
{
  "token": "",
  "name": "",
  "type": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

`string`

**Example:**

```json
""
```

### 获取合同资源

- **Method:** `POST`
- **Path:** `/api/contract/getContractResource`
- **Tags:** 校友电子合同签署接口

获取孙克双老师的手写签名(SVG格式)或协会公章电子版(WebP格式)

#### Parameters

##### `type` required

- **In:** `query`

资源类型：SIGNATURE(签名)/OFFICIAL\_SEAL(公章)

`string`

#### Request Body

##### Content-Type: application/json

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

`string`, format: `byte`

**Example:**

```json
""
```

### 下载合同PDF

- **Method:** `POST`
- **Path:** `/api/contract/download`
- **Tags:** 校友电子合同签署接口

下载已生成的合同PDF文件，包含签名和公章

#### Parameters

##### `type` required

- **In:** `query`

合同类型

`string`

#### Request Body

##### Content-Type: application/json

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

`string`, format: `byte`

**Example:**

```json
""
```

### 更新优秀运动员信息

- **Method:** `POST`
- **Path:** `/alumnus/updateInfo`
- **Tags:** 优秀运动员管理

更新优秀运动员的个人介绍等详细信息，需要登录token

#### Request Body

##### Content-Type: application/json

- **`password`**

  `string`

- **`token`**

  `string`

- **`username`**

  `string`

**Example:**

```json
{
  "username": "",
  "password": "",
  "token": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 优秀运动员登录

- **Method:** `POST`
- **Path:** `/alumnus/login`
- **Tags:** 优秀运动员管理

优秀运动员通过学号和姓名登录系统

#### Request Body

##### Content-Type: application/json

- **`password`**

  `string`

- **`token`**

  `string`

- **`username`**

  `string`

**Example:**

```json
{
  "username": "",
  "password": "",
  "token": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 发表评论

- **Method:** `POST`
- **Path:** `/alumnus/discuss`
- **Tags:** 优秀运动员管理

优秀运动员发表评论，进行校友间的交流互动，需要登录token

#### Request Body

##### Content-Type: application/json

- **`discussionAlumnusId` (required)**

  `integer`, format: `int64`

- **`token` (required)**

  `string`

- **`content`**

  `string`

**Example:**

```json
{
  "token": "",
  "content": "",
  "discussionAlumnusId": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 恢复删除新闻

- **Method:** `POST`
- **Path:** `/admin/withdrawNews`
- **Tags:** 管理员后台

恢复已逻辑删除的新闻，将deleted字段恢复为true，新闻重新在前端显示

#### Request Body

##### Content-Type: application/json

- **`id` (required)**

  `integer`, format: `int32`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "id": 1,
  "token": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 添加比赛志愿者

- **Method:** `POST`
- **Path:** `/admin/uploadVolunteer`
- **Tags:** 管理员后台

为指定比赛添加志愿者，配置志愿者的职位和权限

#### Request Body

##### Content-Type: application/json

- **`data`**

  `array`

  **Items:**

  - **`name`**

    `string`

  - **`password`**

    `string`

  - **`position`**

    `string`, possible values: `"EXECUTIVE_PRESIDENT", "STARTER", "TIMER", "TECHNICAL_INSPECTION_OF_SWIMMING_IN", "REINTAKE_INSPECTION", "REBORN_INSPECTOR", "OTHER"`

  - **`road`**

    `integer`, format: `int32`

  - **`studentNumber`**

    `string`

- **`gameId`**

  `string`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "data": [
    {
      "name": "",
      "studentNumber": "",
      "position": "EXECUTIVE_PRESIDENT",
      "password": "",
      "road": 1
    }
  ]
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 上传新闻视频

- **Method:** `POST`
- **Path:** `/admin/uploadVideo`
- **Tags:** 管理员后台

上传新闻中使用的视频资源

#### Parameters

##### `uploadVideoVo` required

- **In:** `query`

视频上传信息，包含token和视频文件

- **`file`**

  `string`, format: `binary`

- **`token`**

  `string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 发布新闻

- **Method:** `POST`
- **Path:** `/admin/uploadNews`
- **Tags:** 管理员后台

发布新的新闻活动，包含标题、内容、作者等信息

#### Request Body

##### Content-Type: application/json

- **`content`**

  `array`

  **Items:**

  - **`data`**

    `string`

  - **`preview`**

    `string`

  - **`type`**

    `string`

  - **`url`**

    `string`

- **`title`**

  `string`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "title": "",
  "content": [
    {
      "type": "",
      "data": "",
      "url": "",
      "preview": ""
    }
  ]
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 上传新闻图片

- **Method:** `POST`
- **Path:** `/admin/uploadImage`
- **Tags:** 管理员后台

上传新闻中使用的图片资源

#### Parameters

##### `vo` required

- **In:** `query`

图片上传信息，包含token和图片文件

- **`file` (required)**

  `string`, format: `binary`

- **`token` (required)**

  `string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 更新新闻发布时间

- **Method:** `POST`
- **Path:** `/admin/updatePublishTime`
- **Tags:** 管理员后台

修改已发布新闻的发布时间，会影响新闻的排序显示

#### Request Body

##### Content-Type: application/json

- **`newsId` (required)**

  `string`

- **`token` (required)**

  `string`

- **`publishTime`**

  `string`, format: `date`

**Example:**

```json
{
  "token": "",
  "newsId": "",
  "publishTime": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 更新管理员信息

- **Method:** `POST`
- **Path:** `/admin/updateAdmin`
- **Tags:** 管理员后台

更新指定管理员的账号信息，包括用户名和密码

#### Request Body

##### Content-Type: application/json

- **`adminName` (required)**

  `string`

- **`id` (required)**

  `string`

- **`password` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "id": "",
  "adminName": "",
  "password": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 发布比赛报名

- **Method:** `POST`
- **Path:** `/admin/postSignUpList`
- **Tags:** 管理员后台

发布新的比赛活动，配置报名时间、允许报名的学院和项目等

#### Request Body

##### Content-Type: application/json

- **`activityTypes` (required)**

  `array`

  **Items:**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`athleteActivityLimits` (required)**

  `integer`, format: `int32`

- **`athleteList` (required)**

  `array`

  **Items:**

  - **`academicNumber`**

    `string`

  - **`college`**

    `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

  - **`name`**

    `string`

- **`competitionName` (required)**

  `string`

- **`endTime` (required)**

  `string`, format: `date`

- **`token` (required)**

  `string`

- **`collegeActivityLimits`**

  `integer`, format: `int32`

- **`colleges`**

  `array`

  **Items:**

  `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

- **`leaderPhone`**

  `string`

- **`sameActivityMaxLimit`**

  `integer`, format: `int32`

- **`startTime`**

  `string`, format: `date`

**Example:**

```json
{
  "token": "",
  "athleteList": [
    {
      "name": "",
      "academicNumber": "",
      "college": "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION"
    }
  ],
  "activityTypes": [
    "MAN_FREESTYLE_50M"
  ],
  "colleges": [
    "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION"
  ],
  "collegeActivityLimits": 1,
  "athleteActivityLimits": 1,
  "sameActivityMaxLimit": 1,
  "competitionName": "",
  "leaderPhone": "",
  "startTime": "",
  "endTime": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 管理员登录

- **Method:** `POST`
- **Path:** `/admin/login`
- **Tags:** 管理员后台

管理员登录接口，验证账号密码并返回token，同时记录登录IP用于安全审计

#### Request Body

##### Content-Type: application/json

- **`ip`**

  `string`

- **`loginType`**

  `string`

- **`password`**

  `string`

- **`userName`**

  `string`

**Example:**

```json
{
  "loginType": "",
  "userName": "",
  "password": "",
  "ip": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取参赛运动员列表

- **Method:** `POST`
- **Path:** `/admin/getParticipatAthleteList`
- **Tags:** 管理员后台

获取指定比赛的所有参赛运动员列表，用于比赛管理和成绩录入

#### Request Body

##### Content-Type: application/json

- **`event`**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`gameId`**

  `string`

- **`group`**

  `string`, possible values: `"A", "B"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "event": "MAN_FREESTYLE_50M",
  "group": "A"
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取校友签名情况

- **Method:** `POST`
- **Path:** `/admin/getAlumnusSignatureStatus`
- **Tags:** 管理员后台

管理员查询校友电子合同的签署状态

#### Request Body

##### Content-Type: application/json

- **`limit`**

  `integer`, format: `int32`

- **`page`**

  `integer`, format: `int32`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "page": 1,
  "limit": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取管理员列表

- **Method:** `POST`
- **Path:** `/admin/getAdminList`
- **Tags:** 管理员后台

获取系统中所有管理员的列表信息，用于管理员账号管理

#### Request Body

##### Content-Type: application/json

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 更新参赛队伍

- **Method:** `POST`
- **Path:** `/admin/fun/updateTeam`
- **Tags:** 趣味运动会管理员相关接口

管理员更新参赛队伍

#### Parameters

##### `dto`

- **In:** `query`

管理员token+比赛ID

#### Request Body

##### Content-Type: application/json

- **`college` (required)**

  `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

- **`token` (required)**

  `string`

- **`competitionId`**

  `string`

- **`eventId`**

  `string`

- **`id`**

  `integer`, format: `int64`

- **`members`**

  `array`

  **Items:**

  - **`college` (required)**

    `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

  - **`name` (required)**

    `string`

  - **`studentNumber` (required)**

    `string`

- **`teamId`**

  `string`

**Example:**

```json
{
  "token": "",
  "competitionId": "",
  "eventId": "",
  "teamId": "",
  "college": "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION",
  "members": [
    {
      "studentNumber": "",
      "name": "",
      "college": "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION"
    }
  ],
  "id": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 管理员修改成绩

- **Method:** `POST`
- **Path:** `/admin/fun/updateResult`
- **Tags:** 趣味运动会管理员相关接口

管理员修改成绩

#### Parameters

##### `dto`

- **In:** `query`

管理员token+结果ID+得分+是否有效

#### Request Body

##### Content-Type: application/json

- **`isValid` (required)**

  `boolean`

- **`rawScore` (required)**

  `string`

- **`resultId` (required)**

  `integer`, format: `int64`

- **`token` (required)**

  `string`

- **`invalidReason`**

  `string`

- **`invalidType`**

  `string`, possible values: `"FALSE_START", "ILLEGAL_START_POSITION", "START_BEFORE_SIGNAL", "MORE_THAN_15_METERS_INTO_THE_WATER", "FREESTYLE_SWIM_IN_VIOLATION_BODY_TOTALLY_SUBMERGED", "FREESTYLE_DID_NOT_TOUCH_WALL", "BACKSTROKE_SWIM_IN_VIOLATION_SUPINE_POSITION", "BACKSTROKE_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BACKSTROKE_TURN_NOT_ON_BACK_AFTER_LEAVE_WALL", "BACKSTROKE_TURN_NOT_INITIATED_IMMEDIATELY", "BACKSTROKE_FINISH_NOT_ON_BACK", "BREASTSTROKE_LONG_SWIM_BACK_TO_SHOULDER", "BREASTSTROKE_LONG_SWIM_BITE_LEGS_OVER_1_TIME", "BREASTSTROKE_LONG_SWIM_HEAD_EXPOSED", "BREASTSTROKE_HANDS_NOT_PUSHED_FROM_BREAST", "BREASTSTROKE_ELBOWS_NOT_UNDER_WATER", "BREASTSTROKE_HANDS_BEYOND_HIP_LINE", "BREASTSTROKE_HEAD_NOT_EXPOSED_EACH_CYCLE", "BREASTSTROKE_FEET_NOT_TURNED_OUT", "BREASTSTROKE_DOWNWARD_BUTTERFLY_KICK", "BREASTSTROKE_SWIM_IN_VIOLATION_BODY_MUST_SUPINE", "BREASTSTROKE_SWIM_IN_VIOLATION_ACTION_CYCLE_NOT_ONE_HAND_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_DIFFERENT", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_SWITCH_POSITION", "BREASTSTROKE_SWIM_IN_VIOLATION_ELBOW_OUT_OF_WATER", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_HANDS_NOT_EXTENDED_FROM_CHEST", "BREASTSTROKE_SWIM_IN_VIOLATION_RISE_OR_DEPRESSION_AFTER_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_EXTENDED_FROM_WATER", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_BOTH_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_SUPINE_POSITION", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_ACTION_DIFFERENT", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_SWITCH_SWIM", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_BUTTERFLY_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BUTTERFLY_MORE_THAN_ONE_ARM_PULL_UNDERWATER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_MIXED_TECHNIQUE", "MEDLEY_RELAY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "MEDLEY_FREESTYLE_KICK_BEFORE_RETURN_PRONE", "FREESTYLE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "FREESTYLE_TURNING_VIOLATION_HEAD_NOT_LEAVE_WATER", "BACKSTROKE_TURNING_VIOLATION_DOUBLE_ARM_SWIM", "BACKSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BACKSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BOTH_HANDS_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BREASTSTROKE_TURNING_VIOLATION_DOUBLE_LEG_SWIM", "BREASTSTROKE_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "BUTTERFLY_TURNING_VIOLATION_SUPINE_POSITION", "BUTTERFLY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SWIM_HAND_UNDER_WATER", "BUTTERFLY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "MEDLEY_TURNING_VIOLATION_SUPINE_POSITION", "MEDLEY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "MEDLEY_TURNING_VIOLATION_FREESTYLE_ROLL_FLIP", "INCOMPLETE_DISTANCE", "LANE_DEVIATION", "INTERFERENCE", "LANE_ROPE_PULLING", "WALKING_ON_BOTTOM", "STANDING_ON_BOTTOM", "FINISH_NO_TOUCH", "FINISH_SINGLE_ARM_SWIM", "FINISH_SUPINE_POSITION", "RELAY_EARLY_TAKEOFF", "RELAY_ILLEGAL_ENTRY", "RELAY_ORDER_VIOLATION", "RELAY_NOT_IN_ORDER_LISTED", "RELAY_EXCHANGE_NOT_FROM_PLATFORM", "RELAY_REENTERED_WATER_BEFORE_FINISH", "FAILED_LEAVE_POOL_SOON_AFTER_FINISH", "PACE_MAKING_DEVICE_OR_PLAN", "UNAUTHORIZED_ENTRY_DURING_RACE", "ILLEGAL_SWIMMEAR", "ILLEGAL_EQUIPMENT", "ADVERTISING_VIOLATION", "DELAY_OF_GAME", "DISOBEDIENCE", "MISCONDUCT", "CALL_ROOM_ABSENCE", "UNAUTHORIZED_ENTRY", "ANY_BODY_TOUCH_BOTTOM", "BREASTSTROKE_SWIM_IN_VIOLATION_MAX_TURN_ANGLE_NOT_REACH_90_DEGREES", "FREESTYLE_SWIM_IN_NOT_PRONE", "NO_FOUL", "ABSTAIN", "OTHER_FOUL"`

**Example:**

```json
{
  "token": "",
  "resultId": 1,
  "rawScore": "",
  "isValid": true,
  "invalidType": "FALSE_START",
  "invalidReason": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 更新活动

- **Method:** `POST`
- **Path:** `/admin/fun/updateGame`
- **Tags:** 趣味运动会管理员相关接口

管理员更新活动

#### Parameters

##### `dto`

- **In:** `query`

活动信息

#### Request Body

##### Content-Type: application/json

- **`competitionId`**

  `string`

- **`endTime`**

  `string`, format: `date`

- **`gameName`**

  `string`

- **`startTime`**

  `string`, format: `date`

- **`status`**

  `string`, possible values: `"REGISTRATION_IN", "COMPETITION_NOT_START", "COMPETITION_IN_PROGRESS", "COMPETITION_FINISHED"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameName": "",
  "startTime": "",
  "endTime": "",
  "status": "REGISTRATION_IN",
  "competitionId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 更新比赛单项

- **Method:** `POST`
- **Path:** `/admin/fun/updateEvent`
- **Tags:** 趣味运动会管理员相关接口

管理员更新比赛单项

#### Parameters

##### `dto`

- **In:** `query`

项目信息

#### Request Body

##### Content-Type: application/json

- **`competitionId` (required)**

  `string`

- **`eventName` (required)**

  `string`

- **`rules` (required)**

  `string`

- **`sortDirection` (required)**

  `integer`, format: `int32`

- **`sortOrder` (required)**

  `integer`, format: `int32`

- **`token` (required)**

  `string`

- **`unit` (required)**

  `string`

- **`eventId`**

  `integer`, format: `int64`

- **`id`**

  `integer`, format: `int64`

**Example:**

```json
{
  "token": "",
  "competitionId": "",
  "eventName": "",
  "rules": "",
  "unit": "",
  "sortDirection": 1,
  "sortOrder": 1,
  "id": 1,
  "eventId": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 志愿者管理

- **Method:** `POST`
- **Path:** `/admin/fun/importVolunteers`
- **Tags:** 趣味运动会管理员相关接口

管理员管理志愿者

#### Parameters

##### `dto`

- **In:** `query`

管理员token+比赛ID

#### Request Body

##### Content-Type: application/json

- **`competitionId` (required)**

  `string`

- **`token` (required)**

  `string`

- **`volunteers`**

  `array`

  **Items:**

  - **`name`**

    `string`

  - **`password`**

    `string`

  - **`position`**

    `string`, possible values: `"EXECUTIVE_PRESIDENT", "STARTER", "TIMER", "TECHNICAL_INSPECTION_OF_SWIMMING_IN", "REINTAKE_INSPECTION", "REBORN_INSPECTOR", "OTHER"`

  - **`road`**

    `integer`, format: `int32`

  - **`studentNumber`**

    `string`

**Example:**

```json
{
  "token": "",
  "competitionId": "",
  "volunteers": [
    {
      "name": "",
      "studentNumber": "",
      "position": "EXECUTIVE_PRESIDENT",
      "password": "",
      "road": 1
    }
  ]
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取参赛队伍列表

- **Method:** `POST`
- **Path:** `/admin/fun/getTeamList`
- **Tags:** 趣味运动会管理员相关接口

管理员获取参赛队伍列表

#### Parameters

##### `dto`

- **In:** `query`

管理员token+比赛ID

#### Request Body

##### Content-Type: application/json

- **`eventId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "eventId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 管理员管理成绩

- **Method:** `POST`
- **Path:** `/admin/fun/getResults`
- **Tags:** 趣味运动会管理员相关接口

管理员管理成绩

#### Parameters

##### `dto`

- **In:** `query`

管理员token+比赛ID

#### Request Body

##### Content-Type: application/json

- **`eventId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "eventId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取活动列表

- **Method:** `POST`
- **Path:** `/admin/fun/getGameList`
- **Tags:** 趣味运动会管理员相关接口

管理员获取活动列表

#### Parameters

##### `dto`

- **In:** `query`

管理员token+分页信息

#### Request Body

##### Content-Type: application/json

- **`page`**

  `integer`, format: `int32`

- **`size`**

  `integer`, format: `int32`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "page": 1,
  "size": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取比赛单项列表

- **Method:** `POST`
- **Path:** `/admin/fun/getEventList`
- **Tags:** 趣味运动会管理员相关接口

管理员获取比赛单项列表

#### Parameters

##### `dto`

- **In:** `query`

管理员token+比赛ID

#### Request Body

##### Content-Type: application/json

- **`competitionId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "competitionId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 删除参赛队伍

- **Method:** `POST`
- **Path:** `/admin/fun/deleteTeam`
- **Tags:** 趣味运动会管理员相关接口

管理员删除参赛队伍

#### Parameters

##### `dto`

- **In:** `query`

管理员token+比赛ID

#### Request Body

##### Content-Type: application/json

- **`teamId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "teamId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 删除活动

- **Method:** `POST`
- **Path:** `/admin/fun/deleteGame`
- **Tags:** 趣味运动会管理员相关接口

管理员删除活动

#### Parameters

##### `dto`

- **In:** `query`

活动id+token

#### Request Body

##### Content-Type: application/json

- **`competitionId`**

  `string`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "competitionId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 删除比赛单项

- **Method:** `POST`
- **Path:** `/admin/fun/deleteEvent`
- **Tags:** 趣味运动会管理员相关接口

管理员删除比赛单项

#### Parameters

##### `dto`

- **In:** `query`

项目id+token

#### Request Body

##### Content-Type: application/json

- **`eventId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "eventId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 录入参赛队伍

- **Method:** `POST`
- **Path:** `/admin/fun/createTeam`
- **Tags:** 趣味运动会管理员相关接口

管理员录入参赛队伍

#### Parameters

##### `dto`

- **In:** `query`

管理员token+比赛ID

#### Request Body

##### Content-Type: application/json

- **`college` (required)**

  `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

- **`token` (required)**

  `string`

- **`competitionId`**

  `string`

- **`eventId`**

  `string`

- **`id`**

  `integer`, format: `int64`

- **`members`**

  `array`

  **Items:**

  - **`college` (required)**

    `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

  - **`name` (required)**

    `string`

  - **`studentNumber` (required)**

    `string`

- **`teamId`**

  `string`

**Example:**

```json
{
  "token": "",
  "competitionId": "",
  "eventId": "",
  "teamId": "",
  "college": "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION",
  "members": [
    {
      "studentNumber": "",
      "name": "",
      "college": "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION"
    }
  ],
  "id": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 创建活动

- **Method:** `POST`
- **Path:** `/admin/fun/createGame`
- **Tags:** 趣味运动会管理员相关接口

管理员创建活动

#### Parameters

##### `dto`

- **In:** `query`

活动信息

#### Request Body

##### Content-Type: application/json

- **`competitionId`**

  `string`

- **`endTime`**

  `string`, format: `date`

- **`gameName`**

  `string`

- **`startTime`**

  `string`, format: `date`

- **`status`**

  `string`, possible values: `"REGISTRATION_IN", "COMPETITION_NOT_START", "COMPETITION_IN_PROGRESS", "COMPETITION_FINISHED"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameName": "",
  "startTime": "",
  "endTime": "",
  "status": "REGISTRATION_IN",
  "competitionId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 创建比赛单项

- **Method:** `POST`
- **Path:** `/admin/fun/createEvent`
- **Tags:** 趣味运动会管理员相关接口

管理员创建比赛单项

#### Parameters

##### `dto`

- **In:** `query`

项目信息

#### Request Body

##### Content-Type: application/json

- **`competitionId` (required)**

  `string`

- **`eventName` (required)**

  `string`

- **`rules` (required)**

  `string`

- **`sortDirection` (required)**

  `integer`, format: `int32`

- **`sortOrder` (required)**

  `integer`, format: `int32`

- **`token` (required)**

  `string`

- **`unit` (required)**

  `string`

- **`eventId`**

  `integer`, format: `int64`

- **`id`**

  `integer`, format: `int64`

**Example:**

```json
{
  "token": "",
  "competitionId": "",
  "eventName": "",
  "rules": "",
  "unit": "",
  "sortDirection": 1,
  "sortOrder": 1,
  "id": 1,
  "eventId": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 道次分配

- **Method:** `POST`
- **Path:** `/admin/fun/assignRoad`
- **Tags:** 趣味运动会管理员相关接口

管理员道次分配

#### Parameters

##### `dto`

- **In:** `query`

管理员token+比赛ID

#### Request Body

##### Content-Type: application/json

- **`eventId` (required)**

  `string`

- **`token` (required)**

  `string`

- **`teamRoads`**

  `array`

  **Items:**

  - **`road` (required)**

    `integer`, format: `int32`

  - **`teamId` (required)**

    `integer`, format: `int64`

**Example:**

```json
{
  "token": "",
  "eventId": "",
  "teamRoads": [
    {
      "teamId": 1,
      "road": 1
    }
  ]
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 删除新闻

- **Method:** `POST`
- **Path:** `/admin/deleteNews`
- **Tags:** 管理员后台

逻辑删除新闻，将deleted字段设置为false，新闻在前端不再显示但数据保留

#### Request Body

##### Content-Type: application/json

- **`id` (required)**

  `integer`, format: `int32`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "id": 1,
  "token": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 删除领导

- **Method:** `POST`
- **Path:** `/admin/deleteLeader`
- **Tags:** 管理员后台

删除指定领导的信息

#### Request Body

##### Content-Type: application/json

- **`id` (required)**

  `integer`, format: `int32`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "id": 1,
  "token": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 删除优秀运动员

- **Method:** `POST`
- **Path:** `/admin/deleteAlumnus`
- **Tags:** 管理员后台

删除指定优秀运动员的信息

#### Request Body

##### Content-Type: application/json

- **`id` (required)**

  `integer`, format: `int32`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "id": 1,
  "token": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 删除管理员

- **Method:** `POST`
- **Path:** `/admin/deleteAdmin`
- **Tags:** 管理员后台

删除指定的管理员账号，不能删除自己

#### Request Body

##### Content-Type: application/json

- **`adminId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "adminId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 确认比赛报名

- **Method:** `POST`
- **Path:** `/admin/confirmSignUp`
- **Tags:** 管理员后台

确认报名截止，将比赛状态更新为'比赛未开始'，之后不再接受新的报名

#### Request Body

##### Content-Type: application/json

- **`gameId`**

  `string`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 安排比赛日程

- **Method:** `POST`
- **Path:** `/admin/arrangeProgram`
- **Tags:** 管理员后台

为已确认报名的比赛安排具体的比赛时间、场次、组别等

#### Request Body

##### Content-Type: application/json

- **`data`**

  `array`

  **Items:**

  - **`group`**

    `integer`, format: `int32`

  - **`name`**

    `string`

  - **`road`**

    `integer`, format: `int32`

  - **`studentNumber`**

    `string`

- **`date`**

  `string`, format: `date`

- **`event`**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`gameId`**

  `string`

- **`group`**

  `string`, possible values: `"A", "B"`

- **`marked`**

  `string`

- **`time`**

  `string`, possible values: `"MORNING", "AFTERNOON", "EVENING"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "event": "MAN_FREESTYLE_50M",
  "date": "",
  "time": "MORNING",
  "marked": "",
  "group": "A",
  "data": [
    {
      "name": "",
      "studentNumber": "",
      "road": 1,
      "group": 1
    }
  ]
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 添加领导

- **Method:** `POST`
- **Path:** `/admin/addLeader`
- **Tags:** 管理员后台

添加游泳协会领导信息，包括姓名、职位、介绍等

#### Request Body

##### Content-Type: application/json

- **`token` (required)**

  `string`

- **`age`**

  `integer`, format: `int32`

- **`imgUrl`**

  `string`

- **`introduction`**

  `string`

- **`name`**

  `string`

- **`position`**

  `string`

**Example:**

```json
{
  "token": "",
  "name": "",
  "age": 1,
  "introduction": "",
  "position": "",
  "imgUrl": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 添加优秀运动员

- **Method:** `POST`
- **Path:** `/admin/addAlumnus`
- **Tags:** 管理员后台

添加优秀运动员(校友)信息，用于校友风采展示

#### Request Body

##### Content-Type: application/json

- **`token` (required)**

  `string`

- **`age`**

  `integer`, format: `int32`

- **`grade`**

  `string`

- **`id`**

  `string`

- **`imgUrl`**

  `string`

- **`introduction`**

  `string`

- **`name`**

  `string`

- **`password`**

  `string`

- **`whetherInSchool`**

  `boolean`

**Example:**

```json
{
  "token": "",
  "name": "",
  "age": 1,
  "grade": "",
  "introduction": "",
  "whetherInSchool": true,
  "password": "",
  "imgUrl": "",
  "id": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 添加管理员

- **Method:** `POST`
- **Path:** `/admin/addAdmin`
- **Tags:** 管理员后台

添加新的管理员账号，需要指定用户名和密码

#### Request Body

##### Content-Type: application/json

- **`adminName` (required)**

  `string`

- **`password` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "adminName": "",
  "password": ""
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取新闻列表

- **Method:** `GET`
- **Path:** `/activity/getNewsList`
- **Tags:** 新闻活动

分页获取已发布的新闻活动列表

#### Parameters

##### `page`

- **In:** `query`

当前页码，默认为1

`integer`, format: `int32`, default: `1`

##### `limit`

- **In:** `query`

每页数量，默认为10

`integer`, format: `int32`, default: `10`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取新闻列表(管理员)

- **Method:** `POST`
- **Path:** `/activity/getNewsList`
- **Tags:** 新闻活动

管理员获取新闻列表，支持查询已删除的新闻，用于内容管理

#### Request Body

##### Content-Type: application/json

- **`token` (required)**

  `string`

- **`limit`**

  `integer`, format: `int32`

- **`page`**

  `integer`, format: `int32`

**Example:**

```json
{
  "token": "",
  "page": 1,
  "limit": 1
}
```

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取可报名比赛列表

- **Method:** `GET`
- **Path:** `/sport/getGameList`
- **Tags:** 比赛报名

获取当前开放报名的所有比赛列表

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取比赛信息

- **Method:** `GET`
- **Path:** `/sport/getGameInfo`
- **Tags:** 比赛报名

根据比赛ID获取比赛的详细配置信息，包括允许报名的学院、项目等

#### Parameters

##### `game` required

- **In:** `query`

比赛ID

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取学院列表

- **Method:** `GET`
- **Path:** `/register/getCollegeDetail`
- **Tags:** 报名辅助

获取所有可报名的学院列表，用于报名时选择所属学院

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取领导列表

- **Method:** `GET`
- **Path:** `/leader/getLeaderList`
- **Tags:** 领导信息

获取游泳协会所有领导的列表信息，包括姓名、职位、介绍等

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取领导详情

- **Method:** `GET`
- **Path:** `/leader/getLeaderDetail`
- **Tags:** 领导信息

根据ID获取领导的详细个人信息

#### Parameters

##### `id` required

- **In:** `query`

领导ID

`integer`, format: `int32`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 运动员登录

- **Method:** `GET`
- **Path:** `/athlete/login`
- **Tags:** 运动员认证

运动员登录接口（待实现）

#### Responses

##### Status: 200 OK

### 获取SessionId

- **Method:** `GET`
- **Path:** `/athlete/getSessionId`
- **Tags:** 运动员认证

根据微信登录code获取SessionId，用于后续身份验证

#### Parameters

##### `code` required

- **In:** `query`

微信登录凭证code

`string`

##### `s` required

- **In:** `query`

额外参数，用于扩展

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 公众查询活动列表

- **Method:** `GET`
- **Path:** `/api/funGame/list`
- **Tags:** fun-public-controller

#### Parameters

##### `page`

- **In:** `query`

`integer`, format: `int32`, default: `1`

##### `size`

- **In:** `query`

`integer`, format: `int32`, default: `10`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 公众查询总积分排名

- **Method:** `GET`
- **Path:** `/api/funGame/getTotalPoints`
- **Tags:** fun-public-controller

#### Parameters

##### `competitionId` required

- **In:** `query`

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 公众查询单项成绩

- **Method:** `GET`
- **Path:** `/api/funGame/getEventResults`
- **Tags:** fun-public-controller

#### Parameters

##### `competitionId` required

- **In:** `query`

`string`

##### `eventId` required

- **In:** `query`

`integer`, format: `int64`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 公众查询活动详情

- **Method:** `GET`
- **Path:** `/api/funGame/detail`
- **Tags:** fun-public-controller

#### Parameters

##### `competitionId` required

- **In:** `query`

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取合同/同意书模板

- **Method:** `GET`
- **Path:** `/api/contract/template`
- **Tags:** 校友电子合同签署接口

校友获取合同或同意书的HTML模板，用于展示合同内容

#### Parameters

##### `type` required

- **In:** `query`

合同类型

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: text/html;charset=UTF-8

`string`

**Example:**

```json
""
```

### 校验合同有效性

- **Method:** `GET`
- **Path:** `/api/contract/check`
- **Tags:** 校友电子合同签署接口

通过二维码扫描校验合同是否有效，返回HTML页面显示校验结果

#### Parameters

##### `uuid` required

- **In:** `query`

签名UUID

`string`

##### `type` required

- **In:** `query`

合同类型

`string`, possible values: `"CONTRACT", "CONSENT"`

##### `signature` required

- **In:** `query`

签名哈希值

`string`

##### `id` required

- **In:** `query`

校友ID

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

`string`

**Example:**

```json
""
```

### 查询比赛结果

- **Method:** `GET`
- **Path:** `/api/competition/result`
- **Tags:** 比赛信息查询接口

根据比赛ID、场次、项目、项次和组别查询具体的比赛成绩

#### Parameters

##### `competitionId` required

- **In:** `query`

比赛ID，唯一标识一场比赛

`string`

##### `time` required

- **In:** `query`

场次，如预赛、决赛等

`string`

##### `program` required

- **In:** `query`

比赛项目，如自由泳、蛙泳等

`string`

##### `marked` required

- **In:** `query`

第几项，表示项目中的具体小项序号

`integer`, format: `int32`

##### `group` required

- **In:** `query`

组别，如第几组或年龄组别

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 根据志愿者学号获取比赛列表

- **Method:** `GET`
- **Path:** `/api/competition/queryCompetition`
- **Tags:** 比赛信息查询接口

查询指定学号的志愿者所参与的所有比赛信息

#### Parameters

##### `studentNumber` required

- **In:** `query`

志愿者学号

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 分页获取比赛列表

- **Method:** `GET`
- **Path:** `/api/competition/list`
- **Tags:** 比赛信息查询接口

分页查询所有比赛信息，返回比赛列表及总数

#### Parameters

##### `page`

- **In:** `query`

当前页码，默认为1

`integer`, format: `int32`, default: `1`

##### `size`

- **In:** `query`

每页大小，默认为10

`integer`, format: `int32`, default: `10`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取比赛日程

- **Method:** `GET`
- **Path:** `/api/competition/getGameSchedule`
- **Tags:** 比赛信息查询接口

根据比赛ID查询该比赛的详细日程安排

#### Parameters

##### `id` required

- **In:** `query`

比赛ID，用于唯一标识一场比赛

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取全部比赛列表

- **Method:** `GET`
- **Path:** `/api/competition/getCompetitionList`
- **Tags:** 比赛信息查询接口

查询所有比赛的基本信息列表，不分页

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取评论列表

- **Method:** `GET`
- **Path:** `/alumnus/getDiscussionList`
- **Tags:** 优秀运动员管理

根据优秀运动员ID获取其评论列表，支持分页

#### Parameters

##### `page`

- **In:** `query`

当前页码，默认为1

`integer`, format: `int32`, default: `1`

##### `limit`

- **In:** `query`

每页数量，默认为10

`integer`, format: `int32`, default: `10`

##### `id` required

- **In:** `query`

优秀运动员ID

`integer`, format: `int64`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取优秀运动员列表

- **Method:** `GET`
- **Path:** `/alumnus/getAlumnusList`
- **Tags:** 优秀运动员管理

分页获取优秀运动员列表，展示校友风采

#### Parameters

##### `page`

- **In:** `query`

当前页码，默认为1

`integer`, format: `int32`, default: `1`

##### `limit`

- **In:** `query`

每页数量，默认为10

`integer`, format: `int32`, default: `10`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取优秀运动员详情

- **Method:** `GET`
- **Path:** `/alumnus/getAlumnusDetail`
- **Tags:** 优秀运动员管理

根据ID获取优秀运动员的详细信息

#### Parameters

##### `id` required

- **In:** `query`

优秀运动员ID

`integer`, format: `int64`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取视频

- **Method:** `GET`
- **Path:** `/activity/getVideo`
- **Tags:** 新闻活动

根据UUID获取新闻中的视频资源

#### Parameters

##### `uuid` required

- **In:** `query`

视频UUID

`string`

##### `type` required

- **In:** `query`

视频类型/格式

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

`string`, format: `byte`

**Example:**

```json
""
```

### 获取新闻详情

- **Method:** `GET`
- **Path:** `/activity/getNewsDetail`
- **Tags:** 新闻活动

根据ID获取新闻活动的详细内容

#### Parameters

##### `id` required

- **In:** `query`

新闻ID

`integer`, format: `int32`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

**Example:**

```json
{}
```

### 获取图片

- **Method:** `GET`
- **Path:** `/activity/getImage`
- **Tags:** 新闻活动

根据UUID获取新闻中的图片资源

#### Parameters

##### `uuid` required

- **In:** `query`

图片UUID

`string`

##### `type` required

- **In:** `query`

图片类型/格式

`string`

#### Responses

##### Status: 200 OK

###### Content-Type: \*/\*

`string`, format: `byte`

**Example:**

```json
""
```

## Schemas

### AthleteRegisterVo

- **Type:**`object`

报名信息，包含姓名、学号、学院、项目、比赛ID等

- **`academicNumber` (required)**

  `string`

- **`college` (required)**

  `string`

- **`competitionId` (required)**

  `string`

- **`name` (required)**

  `string`

- **`sportType` (required)**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`group`**

  `string`, possible values: `"A", "B"`

**Example:**

```json
{
  "name": "",
  "academicNumber": "",
  "sportType": "MAN_FREESTYLE_50M",
  "college": "",
  "competitionId": "",
  "group": "A"
}
```

### PreviewRegisterInformationVo

- **Type:**`object`

导出请求参数，包含token和比赛ID

- **`gameId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": ""
}
```

### VolunteerUploadDataDto

- **Type:**`object`

* **`achievements`**

  `number`, format: `double`

* **`foulDescription`**

  `string`

* **`foulOrNot`**

  `boolean`

* **`foulReason`**

  `string`, possible values: `"FALSE_START", "ILLEGAL_START_POSITION", "START_BEFORE_SIGNAL", "MORE_THAN_15_METERS_INTO_THE_WATER", "FREESTYLE_SWIM_IN_VIOLATION_BODY_TOTALLY_SUBMERGED", "FREESTYLE_DID_NOT_TOUCH_WALL", "BACKSTROKE_SWIM_IN_VIOLATION_SUPINE_POSITION", "BACKSTROKE_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BACKSTROKE_TURN_NOT_ON_BACK_AFTER_LEAVE_WALL", "BACKSTROKE_TURN_NOT_INITIATED_IMMEDIATELY", "BACKSTROKE_FINISH_NOT_ON_BACK", "BREASTSTROKE_LONG_SWIM_BACK_TO_SHOULDER", "BREASTSTROKE_LONG_SWIM_BITE_LEGS_OVER_1_TIME", "BREASTSTROKE_LONG_SWIM_HEAD_EXPOSED", "BREASTSTROKE_HANDS_NOT_PUSHED_FROM_BREAST", "BREASTSTROKE_ELBOWS_NOT_UNDER_WATER", "BREASTSTROKE_HANDS_BEYOND_HIP_LINE", "BREASTSTROKE_HEAD_NOT_EXPOSED_EACH_CYCLE", "BREASTSTROKE_FEET_NOT_TURNED_OUT", "BREASTSTROKE_DOWNWARD_BUTTERFLY_KICK", "BREASTSTROKE_SWIM_IN_VIOLATION_BODY_MUST_SUPINE", "BREASTSTROKE_SWIM_IN_VIOLATION_ACTION_CYCLE_NOT_ONE_HAND_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_DIFFERENT", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_SWITCH_POSITION", "BREASTSTROKE_SWIM_IN_VIOLATION_ELBOW_OUT_OF_WATER", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_HANDS_NOT_EXTENDED_FROM_CHEST", "BREASTSTROKE_SWIM_IN_VIOLATION_RISE_OR_DEPRESSION_AFTER_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_EXTENDED_FROM_WATER", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_BOTH_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_SUPINE_POSITION", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_ACTION_DIFFERENT", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_SWITCH_SWIM", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_BUTTERFLY_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BUTTERFLY_MORE_THAN_ONE_ARM_PULL_UNDERWATER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_MIXED_TECHNIQUE", "MEDLEY_RELAY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "MEDLEY_FREESTYLE_KICK_BEFORE_RETURN_PRONE", "FREESTYLE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "FREESTYLE_TURNING_VIOLATION_HEAD_NOT_LEAVE_WATER", "BACKSTROKE_TURNING_VIOLATION_DOUBLE_ARM_SWIM", "BACKSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BACKSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BOTH_HANDS_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BREASTSTROKE_TURNING_VIOLATION_DOUBLE_LEG_SWIM", "BREASTSTROKE_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "BUTTERFLY_TURNING_VIOLATION_SUPINE_POSITION", "BUTTERFLY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SWIM_HAND_UNDER_WATER", "BUTTERFLY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "MEDLEY_TURNING_VIOLATION_SUPINE_POSITION", "MEDLEY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "MEDLEY_TURNING_VIOLATION_FREESTYLE_ROLL_FLIP", "INCOMPLETE_DISTANCE", "LANE_DEVIATION", "INTERFERENCE", "LANE_ROPE_PULLING", "WALKING_ON_BOTTOM", "STANDING_ON_BOTTOM", "FINISH_NO_TOUCH", "FINISH_SINGLE_ARM_SWIM", "FINISH_SUPINE_POSITION", "RELAY_EARLY_TAKEOFF", "RELAY_ILLEGAL_ENTRY", "RELAY_ORDER_VIOLATION", "RELAY_NOT_IN_ORDER_LISTED", "RELAY_EXCHANGE_NOT_FROM_PLATFORM", "RELAY_REENTERED_WATER_BEFORE_FINISH", "FAILED_LEAVE_POOL_SOON_AFTER_FINISH", "PACE_MAKING_DEVICE_OR_PLAN", "UNAUTHORIZED_ENTRY_DURING_RACE", "ILLEGAL_SWIMMEAR", "ILLEGAL_EQUIPMENT", "ADVERTISING_VIOLATION", "DELAY_OF_GAME", "DISOBEDIENCE", "MISCONDUCT", "CALL_ROOM_ABSENCE", "UNAUTHORIZED_ENTRY", "ANY_BODY_TOUCH_BOTTOM", "BREASTSTROKE_SWIM_IN_VIOLATION_MAX_TURN_ANGLE_NOT_REACH_90_DEGREES", "FREESTYLE_SWIM_IN_NOT_PRONE", "NO_FOUL", "ABSTAIN", "OTHER_FOUL"`

**Example:**

```json
{
  "foulOrNot": true,
  "foulReason": "FALSE_START",
  "foulDescription": "",
  "achievements": 1
}
```

### VolunteerUploadDto

- **Type:**`object`

上传数据详情，包含token、记录ID、比赛ID和具体数据内容

- **`gameId` (required)**

  `string`

- **`id` (required)**

  `string`

- **`token` (required)**

  `string`

- **`data`**

  `object`

  - **`achievements`**

    `number`, format: `double`

  - **`foulDescription`**

    `string`

  - **`foulOrNot`**

    `boolean`

  - **`foulReason`**

    `string`, possible values: `"FALSE_START", "ILLEGAL_START_POSITION", "START_BEFORE_SIGNAL", "MORE_THAN_15_METERS_INTO_THE_WATER", "FREESTYLE_SWIM_IN_VIOLATION_BODY_TOTALLY_SUBMERGED", "FREESTYLE_DID_NOT_TOUCH_WALL", "BACKSTROKE_SWIM_IN_VIOLATION_SUPINE_POSITION", "BACKSTROKE_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BACKSTROKE_TURN_NOT_ON_BACK_AFTER_LEAVE_WALL", "BACKSTROKE_TURN_NOT_INITIATED_IMMEDIATELY", "BACKSTROKE_FINISH_NOT_ON_BACK", "BREASTSTROKE_LONG_SWIM_BACK_TO_SHOULDER", "BREASTSTROKE_LONG_SWIM_BITE_LEGS_OVER_1_TIME", "BREASTSTROKE_LONG_SWIM_HEAD_EXPOSED", "BREASTSTROKE_HANDS_NOT_PUSHED_FROM_BREAST", "BREASTSTROKE_ELBOWS_NOT_UNDER_WATER", "BREASTSTROKE_HANDS_BEYOND_HIP_LINE", "BREASTSTROKE_HEAD_NOT_EXPOSED_EACH_CYCLE", "BREASTSTROKE_FEET_NOT_TURNED_OUT", "BREASTSTROKE_DOWNWARD_BUTTERFLY_KICK", "BREASTSTROKE_SWIM_IN_VIOLATION_BODY_MUST_SUPINE", "BREASTSTROKE_SWIM_IN_VIOLATION_ACTION_CYCLE_NOT_ONE_HAND_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_DIFFERENT", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_SWITCH_POSITION", "BREASTSTROKE_SWIM_IN_VIOLATION_ELBOW_OUT_OF_WATER", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_HANDS_NOT_EXTENDED_FROM_CHEST", "BREASTSTROKE_SWIM_IN_VIOLATION_RISE_OR_DEPRESSION_AFTER_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_EXTENDED_FROM_WATER", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_BOTH_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_SUPINE_POSITION", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_ACTION_DIFFERENT", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_SWITCH_SWIM", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_BUTTERFLY_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BUTTERFLY_MORE_THAN_ONE_ARM_PULL_UNDERWATER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_MIXED_TECHNIQUE", "MEDLEY_RELAY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "MEDLEY_FREESTYLE_KICK_BEFORE_RETURN_PRONE", "FREESTYLE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "FREESTYLE_TURNING_VIOLATION_HEAD_NOT_LEAVE_WATER", "BACKSTROKE_TURNING_VIOLATION_DOUBLE_ARM_SWIM", "BACKSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BACKSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BOTH_HANDS_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BREASTSTROKE_TURNING_VIOLATION_DOUBLE_LEG_SWIM", "BREASTSTROKE_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "BUTTERFLY_TURNING_VIOLATION_SUPINE_POSITION", "BUTTERFLY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SWIM_HAND_UNDER_WATER", "BUTTERFLY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "MEDLEY_TURNING_VIOLATION_SUPINE_POSITION", "MEDLEY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "MEDLEY_TURNING_VIOLATION_FREESTYLE_ROLL_FLIP", "INCOMPLETE_DISTANCE", "LANE_DEVIATION", "INTERFERENCE", "LANE_ROPE_PULLING", "WALKING_ON_BOTTOM", "STANDING_ON_BOTTOM", "FINISH_NO_TOUCH", "FINISH_SINGLE_ARM_SWIM", "FINISH_SUPINE_POSITION", "RELAY_EARLY_TAKEOFF", "RELAY_ILLEGAL_ENTRY", "RELAY_ORDER_VIOLATION", "RELAY_NOT_IN_ORDER_LISTED", "RELAY_EXCHANGE_NOT_FROM_PLATFORM", "RELAY_REENTERED_WATER_BEFORE_FINISH", "FAILED_LEAVE_POOL_SOON_AFTER_FINISH", "PACE_MAKING_DEVICE_OR_PLAN", "UNAUTHORIZED_ENTRY_DURING_RACE", "ILLEGAL_SWIMMEAR", "ILLEGAL_EQUIPMENT", "ADVERTISING_VIOLATION", "DELAY_OF_GAME", "DISOBEDIENCE", "MISCONDUCT", "CALL_ROOM_ABSENCE", "UNAUTHORIZED_ENTRY", "ANY_BODY_TOUCH_BOTTOM", "BREASTSTROKE_SWIM_IN_VIOLATION_MAX_TURN_ANGLE_NOT_REACH_90_DEGREES", "FREESTYLE_SWIM_IN_NOT_PRONE", "NO_FOUL", "ABSTAIN", "OTHER_FOUL"`

**Example:**

```json
{
  "token": "",
  "id": "",
  "gameId": "",
  "data": {
    "foulOrNot": true,
    "foulReason": "FALSE_START",
    "foulDescription": "",
    "achievements": 1
  }
}
```

### ExecutivePresidentUpdateResultDataDto

- **Type:**`object`

* **`achievements`**

  `number`, format: `double`

* **`foulDescription`**

  `string`

* **`foulOrNot`**

  `boolean`

* **`foulReson`**

  `string`, possible values: `"FALSE_START", "ILLEGAL_START_POSITION", "START_BEFORE_SIGNAL", "MORE_THAN_15_METERS_INTO_THE_WATER", "FREESTYLE_SWIM_IN_VIOLATION_BODY_TOTALLY_SUBMERGED", "FREESTYLE_DID_NOT_TOUCH_WALL", "BACKSTROKE_SWIM_IN_VIOLATION_SUPINE_POSITION", "BACKSTROKE_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BACKSTROKE_TURN_NOT_ON_BACK_AFTER_LEAVE_WALL", "BACKSTROKE_TURN_NOT_INITIATED_IMMEDIATELY", "BACKSTROKE_FINISH_NOT_ON_BACK", "BREASTSTROKE_LONG_SWIM_BACK_TO_SHOULDER", "BREASTSTROKE_LONG_SWIM_BITE_LEGS_OVER_1_TIME", "BREASTSTROKE_LONG_SWIM_HEAD_EXPOSED", "BREASTSTROKE_HANDS_NOT_PUSHED_FROM_BREAST", "BREASTSTROKE_ELBOWS_NOT_UNDER_WATER", "BREASTSTROKE_HANDS_BEYOND_HIP_LINE", "BREASTSTROKE_HEAD_NOT_EXPOSED_EACH_CYCLE", "BREASTSTROKE_FEET_NOT_TURNED_OUT", "BREASTSTROKE_DOWNWARD_BUTTERFLY_KICK", "BREASTSTROKE_SWIM_IN_VIOLATION_BODY_MUST_SUPINE", "BREASTSTROKE_SWIM_IN_VIOLATION_ACTION_CYCLE_NOT_ONE_HAND_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_DIFFERENT", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_SWITCH_POSITION", "BREASTSTROKE_SWIM_IN_VIOLATION_ELBOW_OUT_OF_WATER", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_HANDS_NOT_EXTENDED_FROM_CHEST", "BREASTSTROKE_SWIM_IN_VIOLATION_RISE_OR_DEPRESSION_AFTER_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_EXTENDED_FROM_WATER", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_BOTH_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_SUPINE_POSITION", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_ACTION_DIFFERENT", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_SWITCH_SWIM", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_BUTTERFLY_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BUTTERFLY_MORE_THAN_ONE_ARM_PULL_UNDERWATER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_MIXED_TECHNIQUE", "MEDLEY_RELAY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "MEDLEY_FREESTYLE_KICK_BEFORE_RETURN_PRONE", "FREESTYLE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "FREESTYLE_TURNING_VIOLATION_HEAD_NOT_LEAVE_WATER", "BACKSTROKE_TURNING_VIOLATION_DOUBLE_ARM_SWIM", "BACKSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BACKSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BOTH_HANDS_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BREASTSTROKE_TURNING_VIOLATION_DOUBLE_LEG_SWIM", "BREASTSTROKE_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "BUTTERFLY_TURNING_VIOLATION_SUPINE_POSITION", "BUTTERFLY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SWIM_HAND_UNDER_WATER", "BUTTERFLY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "MEDLEY_TURNING_VIOLATION_SUPINE_POSITION", "MEDLEY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "MEDLEY_TURNING_VIOLATION_FREESTYLE_ROLL_FLIP", "INCOMPLETE_DISTANCE", "LANE_DEVIATION", "INTERFERENCE", "LANE_ROPE_PULLING", "WALKING_ON_BOTTOM", "STANDING_ON_BOTTOM", "FINISH_NO_TOUCH", "FINISH_SINGLE_ARM_SWIM", "FINISH_SUPINE_POSITION", "RELAY_EARLY_TAKEOFF", "RELAY_ILLEGAL_ENTRY", "RELAY_ORDER_VIOLATION", "RELAY_NOT_IN_ORDER_LISTED", "RELAY_EXCHANGE_NOT_FROM_PLATFORM", "RELAY_REENTERED_WATER_BEFORE_FINISH", "FAILED_LEAVE_POOL_SOON_AFTER_FINISH", "PACE_MAKING_DEVICE_OR_PLAN", "UNAUTHORIZED_ENTRY_DURING_RACE", "ILLEGAL_SWIMMEAR", "ILLEGAL_EQUIPMENT", "ADVERTISING_VIOLATION", "DELAY_OF_GAME", "DISOBEDIENCE", "MISCONDUCT", "CALL_ROOM_ABSENCE", "UNAUTHORIZED_ENTRY", "ANY_BODY_TOUCH_BOTTOM", "BREASTSTROKE_SWIM_IN_VIOLATION_MAX_TURN_ANGLE_NOT_REACH_90_DEGREES", "FREESTYLE_SWIM_IN_NOT_PRONE", "NO_FOUL", "ABSTAIN", "OTHER_FOUL"`

* **`name`**

  `string`

**Example:**

```json
{
  "name": "",
  "achievements": 1,
  "foulOrNot": true,
  "foulReson": "FALSE_START",
  "foulDescription": ""
}
```

### ExecutivePresidentUpdateResultDto

- **Type:**`object`

更新结果请求参数，包含token、比赛ID、时间段、项目、标记、组别和需要更新的数据列表

- **`data`**

  `array`

  **Items:**

  - **`achievements`**

    `number`, format: `double`

  - **`foulDescription`**

    `string`

  - **`foulOrNot`**

    `boolean`

  - **`foulReson`**

    `string`, possible values: `"FALSE_START", "ILLEGAL_START_POSITION", "START_BEFORE_SIGNAL", "MORE_THAN_15_METERS_INTO_THE_WATER", "FREESTYLE_SWIM_IN_VIOLATION_BODY_TOTALLY_SUBMERGED", "FREESTYLE_DID_NOT_TOUCH_WALL", "BACKSTROKE_SWIM_IN_VIOLATION_SUPINE_POSITION", "BACKSTROKE_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BACKSTROKE_TURN_NOT_ON_BACK_AFTER_LEAVE_WALL", "BACKSTROKE_TURN_NOT_INITIATED_IMMEDIATELY", "BACKSTROKE_FINISH_NOT_ON_BACK", "BREASTSTROKE_LONG_SWIM_BACK_TO_SHOULDER", "BREASTSTROKE_LONG_SWIM_BITE_LEGS_OVER_1_TIME", "BREASTSTROKE_LONG_SWIM_HEAD_EXPOSED", "BREASTSTROKE_HANDS_NOT_PUSHED_FROM_BREAST", "BREASTSTROKE_ELBOWS_NOT_UNDER_WATER", "BREASTSTROKE_HANDS_BEYOND_HIP_LINE", "BREASTSTROKE_HEAD_NOT_EXPOSED_EACH_CYCLE", "BREASTSTROKE_FEET_NOT_TURNED_OUT", "BREASTSTROKE_DOWNWARD_BUTTERFLY_KICK", "BREASTSTROKE_SWIM_IN_VIOLATION_BODY_MUST_SUPINE", "BREASTSTROKE_SWIM_IN_VIOLATION_ACTION_CYCLE_NOT_ONE_HAND_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_DIFFERENT", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_SWITCH_POSITION", "BREASTSTROKE_SWIM_IN_VIOLATION_ELBOW_OUT_OF_WATER", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_HANDS_NOT_EXTENDED_FROM_CHEST", "BREASTSTROKE_SWIM_IN_VIOLATION_RISE_OR_DEPRESSION_AFTER_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_EXTENDED_FROM_WATER", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_BOTH_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_SUPINE_POSITION", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_ACTION_DIFFERENT", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_SWITCH_SWIM", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_BUTTERFLY_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BUTTERFLY_MORE_THAN_ONE_ARM_PULL_UNDERWATER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_MIXED_TECHNIQUE", "MEDLEY_RELAY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "MEDLEY_FREESTYLE_KICK_BEFORE_RETURN_PRONE", "FREESTYLE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "FREESTYLE_TURNING_VIOLATION_HEAD_NOT_LEAVE_WATER", "BACKSTROKE_TURNING_VIOLATION_DOUBLE_ARM_SWIM", "BACKSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BACKSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BOTH_HANDS_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BREASTSTROKE_TURNING_VIOLATION_DOUBLE_LEG_SWIM", "BREASTSTROKE_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "BUTTERFLY_TURNING_VIOLATION_SUPINE_POSITION", "BUTTERFLY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SWIM_HAND_UNDER_WATER", "BUTTERFLY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "MEDLEY_TURNING_VIOLATION_SUPINE_POSITION", "MEDLEY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "MEDLEY_TURNING_VIOLATION_FREESTYLE_ROLL_FLIP", "INCOMPLETE_DISTANCE", "LANE_DEVIATION", "INTERFERENCE", "LANE_ROPE_PULLING", "WALKING_ON_BOTTOM", "STANDING_ON_BOTTOM", "FINISH_NO_TOUCH", "FINISH_SINGLE_ARM_SWIM", "FINISH_SUPINE_POSITION", "RELAY_EARLY_TAKEOFF", "RELAY_ILLEGAL_ENTRY", "RELAY_ORDER_VIOLATION", "RELAY_NOT_IN_ORDER_LISTED", "RELAY_EXCHANGE_NOT_FROM_PLATFORM", "RELAY_REENTERED_WATER_BEFORE_FINISH", "FAILED_LEAVE_POOL_SOON_AFTER_FINISH", "PACE_MAKING_DEVICE_OR_PLAN", "UNAUTHORIZED_ENTRY_DURING_RACE", "ILLEGAL_SWIMMEAR", "ILLEGAL_EQUIPMENT", "ADVERTISING_VIOLATION", "DELAY_OF_GAME", "DISOBEDIENCE", "MISCONDUCT", "CALL_ROOM_ABSENCE", "UNAUTHORIZED_ENTRY", "ANY_BODY_TOUCH_BOTTOM", "BREASTSTROKE_SWIM_IN_VIOLATION_MAX_TURN_ANGLE_NOT_REACH_90_DEGREES", "FREESTYLE_SWIM_IN_NOT_PRONE", "NO_FOUL", "ABSTAIN", "OTHER_FOUL"`

  - **`name`**

    `string`

- **`gameId`**

  `string`

- **`group`**

  `integer`, format: `int32`

- **`marked`**

  `integer`, format: `int32`

- **`program`**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`time`**

  `string`, possible values: `"MORNING", "AFTERNOON", "EVENING"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "time": "MORNING",
  "program": "MAN_FREESTYLE_50M",
  "marked": 1,
  "group": 1,
  "data": [
    {
      "name": "",
      "achievements": 1,
      "foulOrNot": true,
      "foulReson": "FALSE_START",
      "foulDescription": ""
    }
  ]
}
```

### ExecutivePresidentViewResDto

- **Type:**`object`

审核结果请求参数，包含token、比赛ID、时间段、项目、标记和组别信息

- **`gameId`**

  `string`

- **`group`**

  `integer`, format: `int32`

- **`marked`**

  `integer`, format: `int32`

- **`program`**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`time`**

  `string`, possible values: `"MORNING", "AFTERNOON", "EVENING"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "time": "MORNING",
  "program": "MAN_FREESTYLE_50M",
  "marked": 1,
  "group": 1
}
```

### VolunteerLoginDTO

- **Type:**`object`

志愿者登录信息，包含姓名、学号、职位、负责道次和比赛ID

- **`gameId`**

  `string`

- **`name`**

  `string`

- **`position`**

  `string`, possible values: `"EXECUTIVE_PRESIDENT", "STARTER", "TIMER", "TECHNICAL_INSPECTION_OF_SWIMMING_IN", "REINTAKE_INSPECTION", "REBORN_INSPECTOR", "OTHER"`

- **`road`**

  `array`

  **Items:**

  `integer`, format: `int32`

- **`studentNumber`**

  `string`

**Example:**

```json
{
  "name": "",
  "position": "EXECUTIVE_PRESIDENT",
  "studentNumber": "",
  "road": [
    1
  ],
  "gameId": ""
}
```

### VolunteerGetCompetitionListDTO

- **Type:**`object`

获取比赛列表请求参数，包含token、比赛ID、时间段和标记状态

- **`gameId`**

  `string`

- **`marked`**

  `integer`, format: `int32`

- **`time`**

  `string`, possible values: `"MORNING", "AFTERNOON", "EVENING"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "time": "MORNING",
  "marked": 1
}
```

### ExecutivePresidentConfirmResultDto

- **Type:**`object`

确认结果请求参数，包含token、比赛ID、时间段、项目、标记和组别信息

- **`gameId`**

  `string`

- **`group`**

  `integer`, format: `int32`

- **`marked`**

  `integer`, format: `int32`

- **`program`**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`time`**

  `string`, possible values: `"MORNING", "AFTERNOON", "EVENING"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "time": "MORNING",
  "program": "MAN_FREESTYLE_50M",
  "marked": 1,
  "group": 1
}
```

### FunVolunteerUploadResultDto

- **Type:**`object`

token+比赛id+道数+成绩

- **`eventId` (required)**

  `integer`, format: `int64`

- **`isValid` (required)**

  `boolean`

- **`road` (required)**

  `integer`, format: `int32`

- **`token` (required)**

  `string`

- **`invalidReason`**

  `string`

- **`invalidType`**

  `string`, possible values: `"FALSE_START", "ILLEGAL_START_POSITION", "START_BEFORE_SIGNAL", "MORE_THAN_15_METERS_INTO_THE_WATER", "FREESTYLE_SWIM_IN_VIOLATION_BODY_TOTALLY_SUBMERGED", "FREESTYLE_DID_NOT_TOUCH_WALL", "BACKSTROKE_SWIM_IN_VIOLATION_SUPINE_POSITION", "BACKSTROKE_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BACKSTROKE_TURN_NOT_ON_BACK_AFTER_LEAVE_WALL", "BACKSTROKE_TURN_NOT_INITIATED_IMMEDIATELY", "BACKSTROKE_FINISH_NOT_ON_BACK", "BREASTSTROKE_LONG_SWIM_BACK_TO_SHOULDER", "BREASTSTROKE_LONG_SWIM_BITE_LEGS_OVER_1_TIME", "BREASTSTROKE_LONG_SWIM_HEAD_EXPOSED", "BREASTSTROKE_HANDS_NOT_PUSHED_FROM_BREAST", "BREASTSTROKE_ELBOWS_NOT_UNDER_WATER", "BREASTSTROKE_HANDS_BEYOND_HIP_LINE", "BREASTSTROKE_HEAD_NOT_EXPOSED_EACH_CYCLE", "BREASTSTROKE_FEET_NOT_TURNED_OUT", "BREASTSTROKE_DOWNWARD_BUTTERFLY_KICK", "BREASTSTROKE_SWIM_IN_VIOLATION_BODY_MUST_SUPINE", "BREASTSTROKE_SWIM_IN_VIOLATION_ACTION_CYCLE_NOT_ONE_HAND_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_DIFFERENT", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_SWITCH_POSITION", "BREASTSTROKE_SWIM_IN_VIOLATION_ELBOW_OUT_OF_WATER", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_HANDS_NOT_EXTENDED_FROM_CHEST", "BREASTSTROKE_SWIM_IN_VIOLATION_RISE_OR_DEPRESSION_AFTER_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_EXTENDED_FROM_WATER", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_BOTH_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_SUPINE_POSITION", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_ACTION_DIFFERENT", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_SWITCH_SWIM", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_BUTTERFLY_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BUTTERFLY_MORE_THAN_ONE_ARM_PULL_UNDERWATER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_MIXED_TECHNIQUE", "MEDLEY_RELAY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "MEDLEY_FREESTYLE_KICK_BEFORE_RETURN_PRONE", "FREESTYLE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "FREESTYLE_TURNING_VIOLATION_HEAD_NOT_LEAVE_WATER", "BACKSTROKE_TURNING_VIOLATION_DOUBLE_ARM_SWIM", "BACKSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BACKSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BOTH_HANDS_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BREASTSTROKE_TURNING_VIOLATION_DOUBLE_LEG_SWIM", "BREASTSTROKE_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "BUTTERFLY_TURNING_VIOLATION_SUPINE_POSITION", "BUTTERFLY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SWIM_HAND_UNDER_WATER", "BUTTERFLY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "MEDLEY_TURNING_VIOLATION_SUPINE_POSITION", "MEDLEY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "MEDLEY_TURNING_VIOLATION_FREESTYLE_ROLL_FLIP", "INCOMPLETE_DISTANCE", "LANE_DEVIATION", "INTERFERENCE", "LANE_ROPE_PULLING", "WALKING_ON_BOTTOM", "STANDING_ON_BOTTOM", "FINISH_NO_TOUCH", "FINISH_SINGLE_ARM_SWIM", "FINISH_SUPINE_POSITION", "RELAY_EARLY_TAKEOFF", "RELAY_ILLEGAL_ENTRY", "RELAY_ORDER_VIOLATION", "RELAY_NOT_IN_ORDER_LISTED", "RELAY_EXCHANGE_NOT_FROM_PLATFORM", "RELAY_REENTERED_WATER_BEFORE_FINISH", "FAILED_LEAVE_POOL_SOON_AFTER_FINISH", "PACE_MAKING_DEVICE_OR_PLAN", "UNAUTHORIZED_ENTRY_DURING_RACE", "ILLEGAL_SWIMMEAR", "ILLEGAL_EQUIPMENT", "ADVERTISING_VIOLATION", "DELAY_OF_GAME", "DISOBEDIENCE", "MISCONDUCT", "CALL_ROOM_ABSENCE", "UNAUTHORIZED_ENTRY", "ANY_BODY_TOUCH_BOTTOM", "BREASTSTROKE_SWIM_IN_VIOLATION_MAX_TURN_ANGLE_NOT_REACH_90_DEGREES", "FREESTYLE_SWIM_IN_NOT_PRONE", "NO_FOUL", "ABSTAIN", "OTHER_FOUL"`

- **`rawScore`**

  `number`

**Example:**

```json
{
  "token": "",
  "eventId": 1,
  "road": 1,
  "rawScore": 1,
  "isValid": true,
  "invalidType": "FALSE_START",
  "invalidReason": ""
}
```

### FunVolunteerReviewResDto

- **Type:**`object`

token+项目id

- **`eventId` (required)**

  `integer`, format: `int64`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "eventId": 1
}
```

### FunVolunteerLoginDto

- **Type:**`object`

登录信息

- **`competitionId` (required)**

  `string`

- **`name` (required)**

  `string`

- **`password` (required)**

  `string`

- **`studentNumber` (required)**

  `string`

**Example:**

```json
{
  "competitionId": "",
  "name": "",
  "studentNumber": "",
  "password": ""
}
```

### FunVolunteerEventListDto

- **Type:**`object`

token+比赛id

- **`competitionId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "competitionId": ""
}
```

### FunVolunteerConfirmResDto

- **Type:**`object`

token+项目id

- **`eventId` (required)**

  `integer`, format: `int64`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "eventId": 1
}
```

### UploadSignatureDto

- **Type:**`object`

* **`signature` (required)**

  `string`

* **`token` (required)**

  `string`

* **`type` (required)**

  `string`, possible values: `"CONTRACT", "CONSENT"`

**Example:**

```json
{
  "token": "",
  "signature": "",
  "type": "CONTRACT"
}
```

### IsSignatureDto

- **Type:**`object`

* **`token`**

  `string`

**Example:**

```json
{
  "token": ""
}
```

### BaseUploadInfoDto

- **Type:**`object`

* **`name` (required)**

  `string`

* **`token` (required)**

  `string`

* **`type` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "name": "",
  "type": ""
}
```

### ConsentUploadInfoDto

- **Type:**

**Example:**

### ContractUploadInfoDto

- **Type:**

**Example:**

### GetContractResourceDto

- **Type:**`object`

* **`token` (required)**

  `string`

**Example:**

```json
{
  "token": ""
}
```

### AlumnusLoginVo

- **Type:**`object`

登录信息，包含学号和姓名

- **`password`**

  `string`

- **`token`**

  `string`

- **`username`**

  `string`

**Example:**

```json
{
  "username": "",
  "password": "",
  "token": ""
}
```

### AlumnusDiscussionVo

- **Type:**`object`

评论信息，包含token和评论内容

- **`discussionAlumnusId` (required)**

  `integer`, format: `int64`

- **`token` (required)**

  `string`

- **`content`**

  `string`

**Example:**

```json
{
  "token": "",
  "content": "",
  "discussionAlumnusId": 1
}
```

### DeleteNewsVo

- **Type:**`object`

删除请求参数，包含token和运动员ID

- **`id` (required)**

  `integer`, format: `int32`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "id": 1,
  "token": ""
}
```

### UploaadVolunteerDto

- **Type:**`object`

志愿者信息，包含token、比赛ID、姓名、学号、职位等

- **`data`**

  `array`

  **Items:**

  - **`name`**

    `string`

  - **`password`**

    `string`

  - **`position`**

    `string`, possible values: `"EXECUTIVE_PRESIDENT", "STARTER", "TIMER", "TECHNICAL_INSPECTION_OF_SWIMMING_IN", "REINTAKE_INSPECTION", "REBORN_INSPECTOR", "OTHER"`

  - **`road`**

    `integer`, format: `int32`

  - **`studentNumber`**

    `string`

- **`gameId`**

  `string`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "data": [
    {
      "name": "",
      "studentNumber": "",
      "position": "EXECUTIVE_PRESIDENT",
      "password": "",
      "road": 1
    }
  ]
}
```

### VolunteerDto

- **Type:**`object`

* **`name`**

  `string`

* **`password`**

  `string`

* **`position`**

  `string`, possible values: `"EXECUTIVE_PRESIDENT", "STARTER", "TIMER", "TECHNICAL_INSPECTION_OF_SWIMMING_IN", "REINTAKE_INSPECTION", "REBORN_INSPECTOR", "OTHER"`

* **`road`**

  `integer`, format: `int32`

* **`studentNumber`**

  `string`

**Example:**

```json
{
  "name": "",
  "studentNumber": "",
  "position": "EXECUTIVE_PRESIDENT",
  "password": "",
  "road": 1
}
```

### UploadVideoVo

- **Type:**`object`

* **`file`**

  `string`, format: `binary`

* **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "file": "@filename"
}
```

### NewsDetail

- **Type:**`object`

* **`data`**

  `string`

* **`preview`**

  `string`

* **`type`**

  `string`

* **`url`**

  `string`

**Example:**

```json
{
  "type": "",
  "data": "",
  "url": "",
  "preview": ""
}
```

### UploadNewsVo

- **Type:**`object`

新闻信息，包含token、标题、内容、作者等

- **`content`**

  `array`

  **Items:**

  - **`data`**

    `string`

  - **`preview`**

    `string`

  - **`type`**

    `string`

  - **`url`**

    `string`

- **`title`**

  `string`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "title": "",
  "content": [
    {
      "type": "",
      "data": "",
      "url": "",
      "preview": ""
    }
  ]
}
```

### UploadImageVo

- **Type:**`object`

* **`file` (required)**

  `string`, format: `binary`

* **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "file": "@filename"
}
```

### UpdatePublishTimeVo

- **Type:**`object`

时间更新信息，包含token、新闻ID和新发布时间

- **`newsId` (required)**

  `string`

- **`token` (required)**

  `string`

- **`publishTime`**

  `string`, format: `date`

**Example:**

```json
{
  "token": "",
  "newsId": "",
  "publishTime": ""
}
```

### UpdateAdminVo

- **Type:**`object`

更新请求参数，包含token、管理员ID、新用户名和密码

- **`adminName` (required)**

  `string`

- **`id` (required)**

  `string`

- **`password` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "id": "",
  "adminName": "",
  "password": ""
}
```

### AthleteList

- **Type:**`object`

* **`academicNumber`**

  `string`

* **`college`**

  `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

* **`name`**

  `string`

**Example:**

```json
{
  "name": "",
  "academicNumber": "",
  "college": "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION"
}
```

### ManagerUploadRegisterVo

- **Type:**`object`

比赛配置信息，包含token、比赛名称、时间、报名限制等

- **`activityTypes` (required)**

  `array`

  **Items:**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`athleteActivityLimits` (required)**

  `integer`, format: `int32`

- **`athleteList` (required)**

  `array`

  **Items:**

  - **`academicNumber`**

    `string`

  - **`college`**

    `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

  - **`name`**

    `string`

- **`competitionName` (required)**

  `string`

- **`endTime` (required)**

  `string`, format: `date`

- **`token` (required)**

  `string`

- **`collegeActivityLimits`**

  `integer`, format: `int32`

- **`colleges`**

  `array`

  **Items:**

  `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

- **`leaderPhone`**

  `string`

- **`sameActivityMaxLimit`**

  `integer`, format: `int32`

- **`startTime`**

  `string`, format: `date`

**Example:**

```json
{
  "token": "",
  "athleteList": [
    {
      "name": "",
      "academicNumber": "",
      "college": "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION"
    }
  ],
  "activityTypes": [
    "MAN_FREESTYLE_50M"
  ],
  "colleges": [
    "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION"
  ],
  "collegeActivityLimits": 1,
  "athleteActivityLimits": 1,
  "sameActivityMaxLimit": 1,
  "competitionName": "",
  "leaderPhone": "",
  "startTime": "",
  "endTime": ""
}
```

### ManagerLoginVo

- **Type:**`object`

登录信息，包含用户名和密码

- **`ip`**

  `string`

- **`loginType`**

  `string`

- **`password`**

  `string`

- **`userName`**

  `string`

**Example:**

```json
{
  "loginType": "",
  "userName": "",
  "password": "",
  "ip": ""
}
```

### GetParticipatAthleteListVo

- **Type:**`object`

查询参数，包含token和比赛ID

- **`event`**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`gameId`**

  `string`

- **`group`**

  `string`, possible values: `"A", "B"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "event": "MAN_FREESTYLE_50M",
  "group": "A"
}
```

### ManagerGetSignUpListVo

- **Type:**`object`

查询参数，包含token、分页信息等

- **`limit`**

  `integer`, format: `int32`

- **`page`**

  `integer`, format: `int32`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "page": 1,
  "limit": 1
}
```

### GetManagerListVo

- **Type:**`object`

查询请求参数，包含token

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": ""
}
```

### FunTeamDto

- **Type:**`object`

管理员token+比赛ID

- **`college` (required)**

  `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

- **`token` (required)**

  `string`

- **`competitionId`**

  `string`

- **`eventId`**

  `string`

- **`id`**

  `integer`, format: `int64`

- **`members`**

  `array`

  **Items:**

  - **`college` (required)**

    `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

  - **`name` (required)**

    `string`

  - **`studentNumber` (required)**

    `string`

- **`teamId`**

  `string`

**Example:**

```json
{
  "token": "",
  "competitionId": "",
  "eventId": "",
  "teamId": "",
  "college": "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION",
  "members": [
    {
      "studentNumber": "",
      "name": "",
      "college": "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION"
    }
  ],
  "id": 1
}
```

### FunTeamMember

- **Type:**`object`

* **`college` (required)**

  `string`, possible values: `"SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MECHANICAL_ENGINEERING_AND_AUTOMATION", "SCHOOL_OF_MATHEMATICS_AND_STATISTICS", "SCHOOL_OF_CHEMICAL_ENGINEERING", "SCHOOL_OF_CIVIL_ENGINEERING", "SCHOOL_OF_ENVIRONMENTAL_AND_SAFETY_ENGINEERING", "SCHOOL_OF_ECONOMICS_AND_MANAGEMENT", "SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING", "SCHOOL_OF_FOREIGN_CHINESE_LANGUAGES", "SCHOOL_OF_COMPUTER_AND_BIG_DATA_INCLUDE_SCHOOL_OF_SOFTWARE_INCLUDE_SCHOOL_OF_ARTIFICIAL_INTELLIGENCE", "SCHOOL_OF_PHYSICS_AND_INFORMATION_ENGINEERING_AND_SCHOOL_OF_MICROELECTRONICS", "SCHOOL_OF_CHEMISTRY", "SCHOOL_OF_ARCHITECTURE_AND_URBAN_RURAL_PLANNING", "ZIJIN_ADDRESS_AND_SCHOOL_OF_MINING", "XIAMEN_ACADEMY_OF_ARTS_AND_CRAFTS", "SCHOOL_OF_MATERIALS_SCIENCE_AND_ENGINEERING", "SCHOOL_OF_LAW", "ZHICHENG_COLLEGE", "SCHOOL_OF_ADVANCED_MANUFACTURING_AND_OCEAN_COLLEGE", "SCHOOL_OF_CONTINUING_EDUCATION", "SCHOOL_OF_MARXISM", "FACULTY_OF_HUMANITIES_AND_SOCIAL_SCIENCES", "MAYNOOTH_INTERNATIONAL_SCHOOL_OF_ENGINEERING", "MEDICAL_COLLEGE_OF_FZU", "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE", "INTERDISCIPLINARY_RESEARCH_INSTITUTE_OF_MEDICINE_AND_ENGINEERING", "DEPARTMENT_OF_PHYSICAL_EDUCATION_AND_RESEARCH"`

* **`name` (required)**

  `string`

* **`studentNumber` (required)**

  `string`

**Example:**

```json
{
  "studentNumber": "",
  "name": "",
  "college": "SCHOOL_OF_ELECTRICAL_ENGINEERING_AND_AUTOMATION"
}
```

### FunUpdateResultDto

- **Type:**`object`

管理员token+结果ID+得分+是否有效

- **`isValid` (required)**

  `boolean`

- **`rawScore` (required)**

  `string`

- **`resultId` (required)**

  `integer`, format: `int64`

- **`token` (required)**

  `string`

- **`invalidReason`**

  `string`

- **`invalidType`**

  `string`, possible values: `"FALSE_START", "ILLEGAL_START_POSITION", "START_BEFORE_SIGNAL", "MORE_THAN_15_METERS_INTO_THE_WATER", "FREESTYLE_SWIM_IN_VIOLATION_BODY_TOTALLY_SUBMERGED", "FREESTYLE_DID_NOT_TOUCH_WALL", "BACKSTROKE_SWIM_IN_VIOLATION_SUPINE_POSITION", "BACKSTROKE_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BACKSTROKE_TURN_NOT_ON_BACK_AFTER_LEAVE_WALL", "BACKSTROKE_TURN_NOT_INITIATED_IMMEDIATELY", "BACKSTROKE_FINISH_NOT_ON_BACK", "BREASTSTROKE_LONG_SWIM_BACK_TO_SHOULDER", "BREASTSTROKE_LONG_SWIM_BITE_LEGS_OVER_1_TIME", "BREASTSTROKE_LONG_SWIM_HEAD_EXPOSED", "BREASTSTROKE_HANDS_NOT_PUSHED_FROM_BREAST", "BREASTSTROKE_ELBOWS_NOT_UNDER_WATER", "BREASTSTROKE_HANDS_BEYOND_HIP_LINE", "BREASTSTROKE_HEAD_NOT_EXPOSED_EACH_CYCLE", "BREASTSTROKE_FEET_NOT_TURNED_OUT", "BREASTSTROKE_DOWNWARD_BUTTERFLY_KICK", "BREASTSTROKE_SWIM_IN_VIOLATION_BODY_MUST_SUPINE", "BREASTSTROKE_SWIM_IN_VIOLATION_ACTION_CYCLE_NOT_ONE_HAND_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_DIFFERENT", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_SWITCH_POSITION", "BREASTSTROKE_SWIM_IN_VIOLATION_ELBOW_OUT_OF_WATER", "BREASTSTROKE_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_ACTION_NOT_SAME_LEVEL", "BREASTSTROKE_SWIM_IN_VIOLATION_HANDS_NOT_EXTENDED_FROM_CHEST", "BREASTSTROKE_SWIM_IN_VIOLATION_RISE_OR_DEPRESSION_AFTER_ONE_LEG", "BREASTSTROKE_SWIM_IN_VIOLATION_LEGS_NOT_EXTENDED_FROM_WATER", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_BOTH_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BOTH_ARMS_SHOULDER_NOT_SHOULDER_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_SUPINE_POSITION", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_ACTION_DIFFERENT", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_SWITCH_SWIM", "BUTTERFLY_SWIM_IN_VIOLATION_LEGS_BUTTERFLY_ACTION", "BUTTERFLY_SWIM_IN_VIOLATION_BODY_TOTALLY_UNDER_WATER", "BUTTERFLY_MORE_THAN_ONE_ARM_PULL_UNDERWATER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "INDIVIDUAL_MEDLEY_SWIM_IN_VIOLATION_MIXED_TECHNIQUE", "MEDLEY_RELAY_SWIM_IN_VIOLATION_NOT_FOLLOW_ORDER", "MEDLEY_FREESTYLE_KICK_BEFORE_RETURN_PRONE", "FREESTYLE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "FREESTYLE_TURNING_VIOLATION_HEAD_NOT_LEAVE_WATER", "BACKSTROKE_TURNING_VIOLATION_DOUBLE_ARM_SWIM", "BACKSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BACKSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BOTH_HANDS_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "BREASTSTROKE_TURNING_VIOLATION_SUPINE_POSITION", "BREASTSTROKE_TURNING_VIOLATION_DOUBLE_LEG_SWIM", "BREASTSTROKE_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "BUTTERFLY_TURNING_VIOLATION_SUPINE_POSITION", "BUTTERFLY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "BUTTERFLY_TURNING_VIOLATION_SWIM_HAND_UNDER_WATER", "BUTTERFLY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_BODY_NOT_TOUCH_POOL", "MEDLEY_TURNING_VIOLATION_HEAD_NOT_EXPOSED_WATER", "MEDLEY_TURNING_VIOLATION_SUPINE_POSITION", "MEDLEY_TURNING_VIOLATION_SINGLE_ARM_SWIM", "MEDLEY_TURNING_VIOLATION_FREESTYLE_ROLL_FLIP", "INCOMPLETE_DISTANCE", "LANE_DEVIATION", "INTERFERENCE", "LANE_ROPE_PULLING", "WALKING_ON_BOTTOM", "STANDING_ON_BOTTOM", "FINISH_NO_TOUCH", "FINISH_SINGLE_ARM_SWIM", "FINISH_SUPINE_POSITION", "RELAY_EARLY_TAKEOFF", "RELAY_ILLEGAL_ENTRY", "RELAY_ORDER_VIOLATION", "RELAY_NOT_IN_ORDER_LISTED", "RELAY_EXCHANGE_NOT_FROM_PLATFORM", "RELAY_REENTERED_WATER_BEFORE_FINISH", "FAILED_LEAVE_POOL_SOON_AFTER_FINISH", "PACE_MAKING_DEVICE_OR_PLAN", "UNAUTHORIZED_ENTRY_DURING_RACE", "ILLEGAL_SWIMMEAR", "ILLEGAL_EQUIPMENT", "ADVERTISING_VIOLATION", "DELAY_OF_GAME", "DISOBEDIENCE", "MISCONDUCT", "CALL_ROOM_ABSENCE", "UNAUTHORIZED_ENTRY", "ANY_BODY_TOUCH_BOTTOM", "BREASTSTROKE_SWIM_IN_VIOLATION_MAX_TURN_ANGLE_NOT_REACH_90_DEGREES", "FREESTYLE_SWIM_IN_NOT_PRONE", "NO_FOUL", "ABSTAIN", "OTHER_FOUL"`

**Example:**

```json
{
  "token": "",
  "resultId": 1,
  "rawScore": "",
  "isValid": true,
  "invalidType": "FALSE_START",
  "invalidReason": ""
}
```

### FunGameCreateDto

- **Type:**`object`

活动信息

- **`competitionId`**

  `string`

- **`endTime`**

  `string`, format: `date`

- **`gameName`**

  `string`

- **`startTime`**

  `string`, format: `date`

- **`status`**

  `string`, possible values: `"REGISTRATION_IN", "COMPETITION_NOT_START", "COMPETITION_IN_PROGRESS", "COMPETITION_FINISHED"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameName": "",
  "startTime": "",
  "endTime": "",
  "status": "REGISTRATION_IN",
  "competitionId": ""
}
```

### FunCreateEventDto

- **Type:**`object`

项目信息

- **`competitionId` (required)**

  `string`

- **`eventName` (required)**

  `string`

- **`rules` (required)**

  `string`

- **`sortDirection` (required)**

  `integer`, format: `int32`

- **`sortOrder` (required)**

  `integer`, format: `int32`

- **`token` (required)**

  `string`

- **`unit` (required)**

  `string`

- **`eventId`**

  `integer`, format: `int64`

- **`id`**

  `integer`, format: `int64`

**Example:**

```json
{
  "token": "",
  "competitionId": "",
  "eventName": "",
  "rules": "",
  "unit": "",
  "sortDirection": 1,
  "sortOrder": 1,
  "id": 1,
  "eventId": 1
}
```

### FunImportVolunteersDto

- **Type:**`object`

管理员token+比赛ID

- **`competitionId` (required)**

  `string`

- **`token` (required)**

  `string`

- **`volunteers`**

  `array`

  **Items:**

  - **`name`**

    `string`

  - **`password`**

    `string`

  - **`position`**

    `string`, possible values: `"EXECUTIVE_PRESIDENT", "STARTER", "TIMER", "TECHNICAL_INSPECTION_OF_SWIMMING_IN", "REINTAKE_INSPECTION", "REBORN_INSPECTOR", "OTHER"`

  - **`road`**

    `integer`, format: `int32`

  - **`studentNumber`**

    `string`

**Example:**

```json
{
  "token": "",
  "competitionId": "",
  "volunteers": [
    {
      "name": "",
      "studentNumber": "",
      "position": "EXECUTIVE_PRESIDENT",
      "password": "",
      "road": 1
    }
  ]
}
```

### FunGetTeamListDto

- **Type:**`object`

管理员token+比赛ID

- **`eventId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "eventId": ""
}
```

### FunDeleteEventDto

- **Type:**`object`

项目id+token

- **`eventId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "eventId": ""
}
```

### FunGameGameListDto

- **Type:**`object`

管理员token+分页信息

- **`page`**

  `integer`, format: `int32`

- **`size`**

  `integer`, format: `int32`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "page": 1,
  "size": 1
}
```

### FunGetEventListDto

- **Type:**`object`

管理员token+比赛ID

- **`competitionId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "competitionId": ""
}
```

### FunDeleteTeamDto

- **Type:**`object`

管理员token+比赛ID

- **`teamId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "teamId": ""
}
```

### FunGameDeleteDto

- **Type:**`object`

活动id+token

- **`competitionId`**

  `string`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "competitionId": ""
}
```

### FunAssignRoadDto

- **Type:**`object`

管理员token+比赛ID

- **`eventId` (required)**

  `string`

- **`token` (required)**

  `string`

- **`teamRoads`**

  `array`

  **Items:**

  - **`road` (required)**

    `integer`, format: `int32`

  - **`teamId` (required)**

    `integer`, format: `int64`

**Example:**

```json
{
  "token": "",
  "eventId": "",
  "teamRoads": [
    {
      "teamId": 1,
      "road": 1
    }
  ]
}
```

### TeamRoad

- **Type:**`object`

* **`road` (required)**

  `integer`, format: `int32`

* **`teamId` (required)**

  `integer`, format: `int64`

**Example:**

```json
{
  "teamId": 1,
  "road": 1
}
```

### DeleteAdminVo

- **Type:**`object`

删除请求参数，包含token和目标管理员ID

- **`adminId` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "adminId": ""
}
```

### ConfirmSignUpVo

- **Type:**`object`

确认参数，包含token和比赛ID

- **`gameId`**

  `string`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": ""
}
```

### ArrangeProgramDataVo

- **Type:**`object`

* **`group`**

  `integer`, format: `int32`

* **`name`**

  `string`

* **`road`**

  `integer`, format: `int32`

* **`studentNumber`**

  `string`

**Example:**

```json
{
  "name": "",
  "studentNumber": "",
  "road": 1,
  "group": 1
}
```

### ArrangeProgramVo

- **Type:**`object`

日程安排信息，包含token、比赛ID、时间、项目等

- **`data`**

  `array`

  **Items:**

  - **`group`**

    `integer`, format: `int32`

  - **`name`**

    `string`

  - **`road`**

    `integer`, format: `int32`

  - **`studentNumber`**

    `string`

- **`date`**

  `string`, format: `date`

- **`event`**

  `string`, possible values: `"MAN_FREESTYLE_50M", "WOMAN_FREESTYLE_50M", "MAN_FREESTYLE_100M", "WOMAN_FREESTYLE_100M", "MAN_FREESTYLE_200M", "WOMAN_FREESTYLE_200M", "MAN_FREESTYLE_400M", "WOMAN_FREESTYLE_400M", "MAN_FREESTYLE_800M", "WOMAN_FREESTYLE_800M", "MAN_FREESTYLE_1500M", "WOMAN_FREESTYLE_1500M", "MAN_BREASTSTROKE_50M", "WOMAN_BREASTSTROKE_50M", "MAN_BREASTSTROKE_100M", "WOMAN_BREASTSTROKE_100M", "MAN_BREASTSTROKE_200M", "WOMAN_BREASTSTROKE_200M", "MAN_BUTTERFLY_50M", "WOMAN_BUTTERFLY_50M", "MAN_BUTTERFLY_100M", "WOMAN_BUTTERFLY_100M", "MAN_BUTTERFLY_200M", "WOMAN_BUTTERFLY_200M", "MAN_BACKSTROKE_50M", "WOMAN_BACKSTROKE_50M", "MAN_BACKSTROKE_100M", "WOMAN_BACKSTROKE_100M", "MAN_BACKSTROKE_200M", "WOMAN_BACKSTROKE_200M", "MAN_MEDLEY_200M", "WOMAN_MEDLEY_200M", "MAN_MEDLEY_400M", "WOMAN_MEDLEY_400M", "MENS_RELAY_FREESTYLE_50M4_100M", "WOMEN_RELAY_FREESTYLE_4_100M", "MENS_RELAY_FREESTYLE_4_200M", "WOMEN_RELAY_FREESTYLE_4_200M", "MANS_RELAY_MEDLEY_4_100M", "WOMEN_RELAY_MEDLEY_4_100M", "MAN_AND_WOMEN_RELAY_MEDLEY_4_100M", "MANS_FREESTYLE_FREESTYLE_50_100M", "WOMEN_FREESTYLE_50_100M", "MANS_AND_WOMEN_FREESTYLE_50_100M", "MANS_RELAY_MEDLEY_4_50M", "WOMEN_RELAY_MEDLEY_4_50M", "MAN_AND_WOMAN_RELAY_MEDLEY_4_50M"`

- **`gameId`**

  `string`

- **`group`**

  `string`, possible values: `"A", "B"`

- **`marked`**

  `string`

- **`time`**

  `string`, possible values: `"MORNING", "AFTERNOON", "EVENING"`

- **`token`**

  `string`

**Example:**

```json
{
  "token": "",
  "gameId": "",
  "event": "MAN_FREESTYLE_50M",
  "date": "",
  "time": "MORNING",
  "marked": "",
  "group": "A",
  "data": [
    {
      "name": "",
      "studentNumber": "",
      "road": 1,
      "group": 1
    }
  ]
}
```

### AddLeaderVo

- **Type:**`object`

领导信息，包含token、姓名、年龄、职位、介绍等

- **`token` (required)**

  `string`

- **`age`**

  `integer`, format: `int32`

- **`imgUrl`**

  `string`

- **`introduction`**

  `string`

- **`name`**

  `string`

- **`position`**

  `string`

**Example:**

```json
{
  "token": "",
  "name": "",
  "age": 1,
  "introduction": "",
  "position": "",
  "imgUrl": ""
}
```

### AddAlumnusVo

- **Type:**`object`

运动员信息，包含token、姓名、年龄、级别、介绍等

- **`token` (required)**

  `string`

- **`age`**

  `integer`, format: `int32`

- **`grade`**

  `string`

- **`id`**

  `string`

- **`imgUrl`**

  `string`

- **`introduction`**

  `string`

- **`name`**

  `string`

- **`password`**

  `string`

- **`whetherInSchool`**

  `boolean`

**Example:**

```json
{
  "token": "",
  "name": "",
  "age": 1,
  "grade": "",
  "introduction": "",
  "whetherInSchool": true,
  "password": "",
  "imgUrl": "",
  "id": ""
}
```

### AddAdminVo

- **Type:**`object`

添加请求参数，包含token、用户名和密码

- **`adminName` (required)**

  `string`

- **`password` (required)**

  `string`

- **`token` (required)**

  `string`

**Example:**

```json
{
  "token": "",
  "adminName": "",
  "password": ""
}
```

### DeletedNewsListVo

- **Type:**`object`

查询条件，包含token和是否包含已删除新闻

- **`token` (required)**

  `string`

- **`limit`**

  `integer`, format: `int32`

- **`page`**

  `integer`, format: `int32`

**Example:**

```json
{
  "token": "",
  "page": 1,
  "limit": 1
}
```
