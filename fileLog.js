const fs = require('fs');
const util = require('util');
const path = require('path');

exports.fileLog = function (msg) {
  let log_file_stream = fs.createWriteStream(path.resolve(__dirname, './debug.log'), {flags : 'w'});
  let log_stdout = process.stdout;
  let d = new Date,
    dformat = [d.getMonth()+1,
               d.getDate(),
               d.getFullYear()].join('-')+' '+
              [d.getHours().toString().padStart(2, '0'),
               d.getMinutes().toString().padStart(2, '0'),
               d.getSeconds().toString().padStart(2, '0')].join(':');

  // this uses backtick notation to allow variables to be printed when surrounded with ${}
  log_file_stream.write(`[${dformat}] ` + util.format(msg) + '\n');
  log_stdout.write(`[${dformat}] ` + util.format(msg) + '\n');
}
