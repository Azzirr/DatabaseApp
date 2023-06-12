const fs = require('fs');

const save = function(requestData, requestStart){
        fs.appendFile("./requests.txt", JSON.stringify({
            'Time': Date.now() - requestStart,
            'HTTP method': requestData.method,
            'Address': requestData.protocol + '://' + requestData.get('host') + requestData.originalUrl
        }) + '\r\n',
        (error) => {
            if(error) throw error;
            console.log('Data saved to file!')
        });
}

module.exports = save;