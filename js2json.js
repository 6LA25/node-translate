const CN = require('./cn.js')
var fs = require('fs');
fs.writeFile(`target.json`, JSON.stringify(CN), function (err) {
  if (err) {
    return console.error(err);
  }
  console.log("数据写入成功！");
  console.log("--------我是分割线-------------")
  console.log("读取写入的数据！");
});