const target = require('./pt.json')
console.log(JSON.stringify(target))
var fs = require('fs');
fs.writeFile(`target.js`, JSON.parse(JSON.stringify(target)), function (err) {
  if (err) {
    return console.error(err);
  }
  console.log("数据写入成功！");
  console.log("--------我是分割线-------------")
  console.log("读取写入的数据！");
});