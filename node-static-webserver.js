var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");
/**
 * @constructor
 * @param {string} contentPath - path for virtual host folders
 * @param {number} port - IP port
 * @param {string} address - IP address 
 */
var NodeStaticWebServer = function (contentPath, port, address) {
    this._contentPath = contentPath;
    this._port = port || 80;
    this._address = address;
    var self = this;
    this._server = http.createServer(function (req, res) {
        self._onCreateServer(req, res);
    }).listen(port, address);
    return this._server;
};

NodeStaticWebServer.prototype._onCreateServer = function (request, response) {
    var host = request.headers.host;
    var self = this;
    if (!host) {
        this._httpBadHost(response);
        return;
    }

    var uri = url.parse(request.url).pathname,
        filename = path.join(this._contentPath, uri);

    console.log('访问：%s', filename);
    if (host.substr(0, 4).toLowerCase() === 'www.') {
        this._httpRedirect(response, 'http://' + host.substr(4));
        return;
    }

    this._checkFile(filename, function (filename, stats) {
        self._responseFile(response, filename, stats, request.headers["if-modified-since"]);
    });
};


NodeStaticWebServer.prototype._checkFile = function (filename, callback) {
    fs.stat(filename, function (err, stats) {
        if (!stats) {
            callback();
        } else if (stats.isDirectory()) {
            filename = path.join(filename, 'index.html');
            fs.stat(filename, function (err, stats) {
                if (!stats) {
                    callback();
                } else {
                    callback(filename, stats);
                }
            });
        } else {
            callback(filename, stats);
        }
    });
};

NodeStaticWebServer.prototype._responseFile = function (response, filename, stats, lastModifiedSince) {
    if (!filename) {
        this._httpNotFound(response);
        return;
    }

    var lastModified = stats.mtime.toUTCString();

    if (lastModifiedSince === lastModified) {
        response.writeHead(304, {
            'Last-Modified': lastModified
        });
        response.end();
        return;
    }

    var self = this;

    var readStream = fs.createReadStream(filename);
    readStream.on('open', function () {
        var headers = {
            'Content-Type': self.mime[path.extname(filename)] || 'application/octet-stream',
            'Last-Modified': lastModified,
            'Content-Length': stats.size
        };

        response.writeHead(200, headers);
        readStream.pipe(response);
    });

    readStream.on('error', function (err) {
        response.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        response.write(err + '\n');
        response.end();
    });
};

/**
 * Return error 434
 * @response {object} response - http server response
 */
NodeStaticWebServer.prototype._httpBadHost = function (response) {
    response.writeHead(434, {
        'Content-Type': 'text/plain'
    });
    response.write('Requested host unavailable\n');
    response.end();
};

NodeStaticWebServer.prototype._httpNotFound = function (response) {
    response.writeHead(404, {
        "Content-Type": "text/plain"
    });
    response.write('Not found\n');
    response.end();
};

NodeStaticWebServer.prototype._httpRedirect = function (response, location) {
    response.writeHead(301, {
        'Location': location
    });
    response.end();
};

NodeStaticWebServer.prototype.mime = {
    '.html': 'text/html',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.css': 'text/css',
    '.js': 'text/javascript'
};

module.exports = NodeStaticWebServer;