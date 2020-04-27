
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

const port = (function () {
    const arg = process.argv[2];
    if(arg !== undefined) {
        return parseInt(arg);
    }

    const env = process.env.PORT;
    if(env !== null && env !== undefined && env !== "") {
        return env;
    }

    return 5500;
})(); 

app.listen(port, () => {
    console.log("listening on port " + port)
})