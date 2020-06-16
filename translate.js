var fs = require('fs');
var http = require('http');
var qs = require('querystring')
var md5 = require('./MD5')
const CN = require('./cn.json')

// 个人开发者账号
var appid = '20200616000496608';
var key = '7I_4ySbCcCKqdatcAQU_';
var salt = (new Date).getTime();
var from = 'zh';
var to = process.argv.splice(2)[0] || 'en'; // 从命令行获取需要翻译目标语言
var root = JSON.parse(JSON.stringify(CN))
var batchNum = 40 // 单个对象字数过长 --> 切分查询翻译
var target = {}

// 获取百度翻译结果
function fetchData(query, ks) {
  return new Promise((resolve, reject) => {
    var data = {
      q: query,
      appid: appid,
      salt: salt,
      from: from,
      to: to,
      sign: md5(appid + query + salt + key)
    }
    http.get('http://api.fanyi.baidu.com/api/trans/vip/translate?' + qs.stringify(data), (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        error = new Error('请求失败\n' +
          `状态码: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('无效的 content-type.\n' +
          `期望的是 application/json 但接收到的是 ${contentType}`);
      }
      if (error) {
        console.error('error:' + query + error.message);
        // 消费响应的数据来释放内存。
        res.resume();
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData.trans_result)
        } catch (e) {
        }
      });
    }).on('error', (e) => {
      console.error(`出现错误: ${JSON.stringify(e)}`);
    });
  })
}

function hasChildObj(obj) {
  var has = false
  Object.keys(obj).forEach(k => {
    if (typeof obj[k] === 'object') {
      has = true
    }
  })
  return has
}

async function translate(obj, ks) {
  var words = []
  Object.keys(obj).forEach(k => {
    words.push(obj[k])
  })
  var str = words.join('\n')
  // console.log(words, str.length)
  if (str.length < 1000) {
    try {
      var lang = await fetchData(str, ks)
      var index = 0
      Object.keys(obj).forEach(k => {
        obj[k] = lang ? lang[index].dst : ''
        index++
      })
    } catch (e) {
    }
  } else { // 字数过长拆分翻译
    var _words = []
    var _translateWords = []
    // 每40个一组发送请求
    for (var i = 0; i < words.length; i += batchNum) {
      let _wordStr = words.slice(i, i + batchNum).join('\n')
      _words.push(_wordStr);
    }
    // console.log('ks:' + ks, _words, _words.length)
    for (var i = 0; i < _words.length; i++) {
      (function (i) {
        setTimeout(async () => { // console.log('ks:' + ks, _words[i])
          var str = await fetchData(_words[i])
          // console.log('ks:' + ks, str)
          _translateWords.push(...str)
          // console.log('_translateWords:' + ks + ':', _translateWords)

          Object.keys(target[ks]).forEach((_k, idx) => {
            target[ks][_k] = _translateWords[idx] ? _translateWords[idx].dst : ''
          })
        }, (i + 1) * 400);
      })(i)
    }

  }
  target[ks] = obj
}


function deepLoop(obj) {
  var parentKey = ''
  Object.keys(obj).forEach(k => {
    var type = typeof obj[k]
    if (type === 'object' && hasChildObj(obj[k])) {
      Object.keys(obj[k]).forEach(item => {
        if (target[item]) {
          target[`${k}_${item}`] = obj[k][item]
        } else {
          target[item] = obj[k][item]
        }
      })
    } else if (type === 'object' && !hasChildObj(obj[k])) {
      if (target[k]) {
        target[`root_${k}`] = obj[k]
      } else {
        target[k] = obj[k]
      }
    }
  })
}
// 生成语言包
function translateSuccess(obj) {
  Object.keys(obj).forEach(k => {
    var type = typeof obj[k]
    if (type === 'object' && hasChildObj(obj[k])) {
      Object.keys(obj[k]).forEach(item => {
        if (target[`${k}_${item}`]) {
          obj[k][item] = target[`${k}_${item}`]
        } else {
          obj[k][item] = target[item]

        }
      })
    } else if (type === 'object' && !hasChildObj(obj[k])) {
      if (target[`root_${k}`]) {
        obj[k] = target[`root_${k}`]
      } else {
        obj[k] = target[k]
      }
    }
  })

  fs.writeFile(`${to}.json`, JSON.stringify(root), function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("数据写入成功！");
    console.log("--------我是分割线-------------")
    console.log("读取写入的数据！");
  });
}

// 翻译方法
function initTranslate() {
  for (var i = 0; i < Object.keys(target).length; i++) {
    (function (i) {
      setTimeout(async () => {
        translate(target[Object.keys(target)[i]], Object.keys(target)[i])
        console.log(`第${i}个对象`)
        if (i === Object.keys(target).length - 1) {
          // 暂时未做同步处理，等待10s获取所有翻译字段
          setTimeout(() => {
            console.log('completed')
            translateSuccess(root)
          }, 10000)
        }
      }, (i + 1) * 300);
    })(i)
  }
}

// 生成需要翻译的目标文件
deepLoop(root)
initTranslate()