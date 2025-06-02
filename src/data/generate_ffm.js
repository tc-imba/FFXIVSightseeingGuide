const xlsx = require("node-xlsx");
const path = require("path");
const fs = require('fs');
const _ = require("lodash");

const ff14json = require("./ff14.json");
const ffmdata = xlsx.parse(fs.readFileSync(`${__dirname}/data.xlsx`))[0];

const data = {};
let entry = 0;
for (let i = 0; i < ff14json.length; ++i) {
    const row = ff14json[i];
    for (let j = 0; j < row.items.length; ++j) {
        data[parseInt(row.items[j].id)] = row.items[j];
        entry++;
    }
}
// console.log(data);
const weatherMap = _.invert({
    ClearSkies: "碧空",
    FairSkies: "晴朗",
    Clouds: "阴云",
    Fog: "薄雾",
    Wind: "微风",
    Gales: "强风",
    Rain: "小雨",
    Showers: "暴雨",
    Thunder: "打雷",
    EurekaPagosThunder: "暴雷",
    Thunderstorms: "雷雨",
    DustStorms: "扬沙",
    HeatWaves: "热浪",
    Snow: "小雪",
    Blizzards: "暴雪",
    Gloom: "妖雾",
    UmbralWind: "灵风",
    UmbralStatic: "灵电",
    MoonDust: "月尘",
    AstromagneticStorm: "磁暴",
});
const actionMap = _.invert({
    Comfort: "安慰",
    Farewell: "道别",
    Nod: "点头",
    Happy: "高兴",
    Encourage: "鼓励",
    Welcome: "欢迎",
    Panic: "慌张",
    Wave: "挥手",
    Psych: "激励",
    Surprise: "惊讶",
    Affirm: "肯定",
    Clap: "拍手",
    Pray: "祈福",
    Stretch: "伸展",
    Think: "思考",
    Shrug: "耸肩",
    Salute: "行礼",
    Lookout: "张望",
    Beckon: "招手",
    Shock: "震惊",
    Point: "指向",
    Question: "质疑",
    Respect: "致敬",
});

let zone = "";

for (let i = 0; i < entry; i++) {
    const row = ffmdata.data[i + 1];
    const originalId = parseInt(row[8].slice(-2));
    const obj = data[originalId];

    console.log(row);
    // console.log(obj);

    obj.weathers = _.map(row[6].split("或"), x => `weather.${weatherMap[x]}`);
    obj.action = `action.${actionMap[row[7]]}`;
    const startTime = Math.round(row[4] * 24);
    const endTime = Math.round(row[5] * 24);
    obj.time = _.range(startTime, endTime);
    obj.timestr = `${startTime.toString().padStart(2, "0")}:00~${endTime.toString().padStart(2, "0")}:00`;
    obj.startHour = startTime;
    obj.endHour = endTime;

    if (row[0]) {
        zone = row[0];
    }
    obj.zone = zone;
    obj.zoneId = row[1]
    obj.name = row[2] || "";

    console.log(obj);
    // break;
}

const sortedData = _.sortBy(data, "id");
const finalData = [{
    "groupName": "1~80",
    "items": sortedData,
}];
let json = JSON.stringify(finalData, null, 2);
fs.writeFileSync(`${__dirname}/ffm.json`, json);

// console.log(ffmdata);

