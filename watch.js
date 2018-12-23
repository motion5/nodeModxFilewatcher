const https = require('https');
const fs = require('fs');
// just extracted this function to another file to make this one more concise - this just logs to a file instead of stdout
const fileLog = require('./fileLog.js').fileLog;

// the directory to watch files in - currently set to local of project but realisitcally could watch any if the user running node (set up in supervisor) had the correct permissions
const watchDir = './tmp';
var failedRequests = 0;

// the endpoint that runs the script to read the messages in modx
const endpoint = 'https://www.softcat.com/pippa-process-message-endpoint?key=32r79fhh4f9h4f8h94j9xfm93n2fjx98j';

// here i am just providing an example string response you could return from the endpoint to ensure it ran successfully - guess it could be a key you put that the snippet could return?
var webpageContentMatch = 'processPippaMessage run successfully - podcast published';

var onNewMessage = () => {
  if (failedRequests < 10) {
    https.get(endpoint, (res) => {

      if (res.statusCode !== 200) {
        fileLog('Unexpected status code: ' + res.statusCode);
      }

      // array to store chunks of buffer data
      const chunks = [];

      // the data event returns stream binary data so this arrow function just 
      // pushes that data to an array which we parse using the buffer object in the end event below
      res.on('data', chunk => chunks.push(chunk));
      
      res.on('end', () => {
        // response now just equals the returned webpage content§
        let response = Buffer.concat(chunks).toString();
        
        console.log(response); // DEBUG

        if (response.match(webpageContentMatch)) { 
          fileLog('Received expected response from endpoint');
        } else {
          failedRequests++;
          // wait 5 seconds
          setTimeout(onNewMessage, 5000);
        }
      });

    }).on('error', (e) => {
      fileLog(e);
      failedRequests++;
      // wait 5 seconds
      setTimeout(onNewMessage, 5000);
    });
  } else {
    fileLog('email sent to alert of 10 failed attempts');

    // TODO: send an email notifying failed
  }
};

// watch file dir for changes
fs.watch(watchDir, {}, (eventType, filename) => {
  
  if (filename) {
    console.log(filename);
    // if file matches modx msg type run new message handler
    // this is searching for files with names like the ones saved using message queue files in modx: messageName.class.msg.php
    if (filename.match(/.*\.class\.msg\.php/)) {
      //onNewMessage();//DEBUG
      setTimeout(onNewMessage, 5000);
    }
  }
});
