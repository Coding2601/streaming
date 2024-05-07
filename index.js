const express = require('express');
const fs = require('fs');

const app = express();

const stream = (req, res, file)=>{
    const audioFile = file;
    const stat = fs.statSync(audioFile);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(audioFile, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'audio/mpeg',
        };
        console.log(chunkSize === fileSize)
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mpeg',
        };
        res.writeHead(200, head);
        fs.createReadStream(audioFile).pipe(res);
    }
}

app.get('/stream-audio', (req, res) => {
    fs.readdir('./', (err, files)=>{
        if(err){
            console.error("Error while reading directory ", err);
            return;
        }
        const array = files.filter(file=>file.endsWith('.mp3'));
        console.log('Audio Files are: ');
        array.forEach(file=>{
            console.log(file);
            stream(req, res, file);
        });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
