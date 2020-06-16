const crypto = require('crypto');

function md5(data) {
  var m = crypto.createHash('md5');
  m.update(data, 'utf8');
  return m.digest('hex');
}

module.exports = md5