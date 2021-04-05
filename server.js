const headers = require("./cors");
const http = require('http');
const fs = require("fs");
http.createServer(function(req, res) {
  if(req.method === "GET") {
    fs.readFile("data.txt", function(err, data) {
      if(err) {
        console.log(err);
        res.writeHead(404, headers);
        res.end();
      }
      res.writeHead(200, headers);
      res.write(data);
      res.end();
    });
  } else if(req.method === "POST") {
    var chunks = [];
    req.on("data", function(chunk) {
      chunks.push(chunk);
    });
    req.on("end", function() {
      var finalData = Buffer.concat(chunks);
      // Write finalData to file
      fs.writeFile("data.txt", finalData, function() {
      });
    });
  }
}).listen(8080, "127.0.0.1");