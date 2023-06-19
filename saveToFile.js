const fs = require('fs');

const loggerMiddleware = async function(req, res, next) {
        fs.appendFile("./requests.txt", JSON.stringify({
            'Time': new Date().toLocaleDateString(),
            'HTTP method': req.method,
            'Address': req.protocol + '://' + req.get('host') + req.originalUrl
        }) + '\r\n',
        (error) => {
            if(error) throw error;
            console.log('Data saved to file!')
        });
        res.end()
}

module.exports = loggerMiddleware;