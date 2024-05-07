const express = require('express');
const app = express();
const fs = require('fs');

app.get('/', function(req, res){
    res.sendFile(__dirname+ "/index.html");
})

app.get('/audio', function(req, res){
    const range = req.headers.range;
    if(!range){
        res.status(400).send("Requires Range header");
    }
    const audioPath = "./song.mp3";
    const audioSize = fs.statSync(audioPath).size;
    console.log("size of file is:", audioSize);
    const CHUNK_SIZE = 10**6; //1 MB
    const start = Number(range.replace(/\D/g, "")); 
    const end = Math.min(start + CHUNK_SIZE , audioSize-1);
    const contentLength = end-start+1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${audioSize}`,
        "Accept-Ranges": 'bytes',
        "Content-Length": contentLength,
        "Content-Type": "audio/mp4"
    }
    res.writeHead(206,headers);
    const audioStream = fs.createReadStream(audioPath,{start, end});
    audioStream.pipe(res);

})

app.listen(3000, function(){
    console.log("Server is running on port:", 3000);
})