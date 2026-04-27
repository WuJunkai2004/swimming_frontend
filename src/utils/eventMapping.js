// 原始映射
const eventMap = {
  MAN_FREESTYLE_50M: "男子50米自由泳",
  WOMAN_FREESTYLE_50M: "女子50米自由泳",
  MAN_FREESTYLE_100M: "男子100米自由泳",
  WOMAN_FREESTYLE_100M: "女子100米自由泳",
  MAN_FREESTYLE_200M: "男子200米自由泳",
  WOMAN_FREESTYLE_200M: "女子200米自由泳",
  MAN_FREESTYLE_400M: "男子400米自由泳",
  WOMAN_FREESTYLE_400M: "女子400米自由泳",
  MAN_FREESTYLE_800M: "男子800米自由泳",
  WOMAN_FREESTYLE_800M: "女子800米自由泳",
  MAN_FREESTYLE_1500M: "男子1500米自由泳",
  WOMAN_FREESTYLE_1500M: "女子1500米自由泳",
  MAN_BREASTSTROKE_50M: "男子50米蛙泳",
  WOMAN_BREASTSTROKE_50M: "女子50米蛙泳",
  MAN_BREASTSTROKE_100M: "男子100米蛙泳",
  WOMAN_BREASTSTROKE_100M: "女子100米蛙泳",
  MAN_BREASTSTROKE_200M: "男子200米蛙泳",
  WOMAN_BREASTSTROKE_200M: "女子200米蛙泳",
  MAN_BUTTERFLY_50M: "男子50米蝴蝶泳",
  WOMAN_BUTTERFLY_50M: "女子50米蝴蝶泳",
  MAN_BUTTERFLY_100M: "男子100米蝴蝶泳",
  WOMAN_BUTTERFLY_100M: "女子100米蝴蝶泳",
  MAN_BUTTERFLY_200M: "男子200米蝴蝶泳",
  WOMAN_BUTTERFLY_200M: "女子200米蝴蝶泳",
  MAN_BACKSTROKE_50M: "男子50米仰泳",
  WOMAN_BACKSTROKE_50M: "女子50米仰泳",
  MAN_BACKSTROKE_100M: "男子100米仰泳",
  WOMAN_BACKSTROKE_100M: "女子100米仰泳",
  MAN_BACKSTROKE_200M: "男子200米仰泳",
  WOMAN_BACKSTROKE_200M: "女子200米仰泳",
  MAN_MEDLEY_200M: "男子200米混合泳",
  WOMAN_MEDLEY_200M: "女子200米混合泳",
  MAN_MEDLEY_400M: "男子400米混合泳",
  WOMAN_MEDLEY_400M: "女子400米混合泳",
  MENS_RELAY_FREESTYLE_50M4_100M: "男子4×100米自由泳接力",
  WOMEN_RELAY_FREESTYLE_4_100M: "女子4×100米自由泳接力",
  MENS_RELAY_FREESTYLE_4_200M: "男子4×200米自由泳接力",
  WOMEN_RELAY_FREESTYLE_4_200M: "女子4×200米自由泳接力",
  MANS_RELAY_MEDLEY_4_100M: "男子4×100米混合泳接力",
  WOMEN_RELAY_MEDLEY_4_100M: "女子4×100米混合泳接力",
  MAN_AND_WOMEN_RELAY_MEDLEY_4_100M: "男女4×100米混合泳接力",
  // 为适应福州大学每年振奋杯，需要增加非奥运标准项目的接力
  MANS_FREESTYLE_FREESTYLE_50_100M: "男子4×50米自由泳接力",
  WOMEN_FREESTYLE_50_100M: "女子4×50米自由泳接力",
  MANS_AND_WOMEN_FREESTYLE_50_100M: "男女4×50米自由泳接力",
  MANS_RELAY_MEDLEY_4_50M: "男子4×50米混合泳接力",
  WOMEN_RELAY_MEDLEY_4_50M: "女子4×50米混合泳接力",
  MAN_AND_WOMAN_RELAY_MEDLEY_4_50M: "男女4×50米混合泳接力"
}

// 只有枚举字符串
const eventEnum = Object.keys(eventMap);

// 只有项目名字
const eventName = Object.values(eventMap);

// 反映射
const eventEnumMap = Object.fromEntries(
  Object.entries(eventMap).map(([key, value]) => [value, key])
);

export function useEventEnum() {
  return {
    eventMap,   // enum -> name mapping
    eventEnum,  // only enum string
    eventName,  // only name string
    eventEnumMap // name -> enum mapping
  }
}
