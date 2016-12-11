#!/usr/bin/env node

'use strict';
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
require('colors');
var program = require('commander');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

var NSWS = require('./node-static-webserver');

// global var

const baseUrl = 'https://movie.douban.com/nowplaying/beijing/';
var output = path.join(__dirname, 'movies');
var currentPageHtml = null;

program
    .version('0.0.1')
    .usage('[options]')
    .option('-p, --parallel <num>', '设置抓取并发连接数，默认值：2', 2)
    .option('-t, --timeout <num>', '自定义连接超时时间(毫秒)。默认值：30000毫秒', 30000)
    .parse(process.argv);

var parallel = parseInt(program.parallel);
var timeout = parseInt(program.timeout);

request = request.defaults({
    timeout: timeout,
    headers: {
        'Referer': 'https://movie.douban.com/'
    }
});

console.log('========== 获取资源站点：%s =========='.green.bold, baseUrl);
console.log('并行连接数：'.green, parallel.toString().green.bold, '      ',
    '连接超时设置：'.green, (timeout / 1000.0).toString().green.bold, '秒'.green);
console.log('影片保存位置: '.green, output.green.bold);

mkdirp.sync(output);

pageExist(function (err, res) {
    if (err !== null || res === false) {
        if (err) {
            console.log('抓取过程终止：%s', err.message);
            return process.exit(1);
        }
        console.log('抓取完毕'.green.bold);
        return process.exit(0); // 不等待未完成的异步请求，直接结束进程
    }

    async.waterfall(
        [parseLinks, getItems],
        function (err) {
            if (err) {
                console.log('抓取过程终止：%s', err.message);
                return process.exit(1);
            }
            console.log('抓取完毕'.green.bold);

            var server = new NSWS(__dirname, 3000, 'localhost');
            console.log('请访问：%s'.green, 'http://localhost:3000/');
            //return process.exit(0); // 不等待未完成的异步请求，直接结束进程
        });
});

function pageExist(callback) {
    let retryCount = 1;
    async.retry(3,
        function (callback) {
            request.get(baseUrl, function (err, res, body) {
                if (err) {
                    if (err.status === 404) {
                        console.error('影片抓取结束, StatusCode:', err.status);
                    } else {
                        retryCount++;
                        console.error('页面获取失败：%s'.red, err.message);
                        console.error('...进行第%d次尝试...'.red, retryCount);
                    }
                    return callback(err);
                }
                currentPageHtml = body;
                callback(null, res);
            });
        },
        function (err, res) {
            if (err) {
                if (err.status === 404) {
                    return callback(null, false);
                }
                return callback(err);
            }
            callback(null, res.statusCode == 200);
        });
}

function parseLinks(next) {
    let $ = cheerio.load(currentPageHtml);
    let links = [],
        titles = [],
        meta = {};

    $('li.list-item', '#nowplaying').each(link_movie_handler);

    function link_movie_handler() {
        titles.push($(this).attr('data-title'));
        links.push({
            subject: $(this).attr('data-subject')
        });
    }

    meta.time = new Date().toLocaleDateString();
    meta.movies = links

    console.log('开始处理以下影片...\n'.green + titles.join('\r\n').yellow);
    next(null, meta);
}

function getItems(meta, next) {
    async.forEachOfLimit(
        meta.movies,
        parallel,
        getItemPage,
        function (err) {
            if (err) {
                if (err.message === 'limit') {
                    return next();
                }
                throw err;
            }

            let metaFilePath = path.join(output, 'meta.json');
            fs.writeFile(metaFilePath, JSON.stringify(meta),
                function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('===== 处理完毕 ====='.green);
                    return next();
                });
        });
}

function getItemPage(link, index, callback) {
    let url = 'https://movie.douban.com/subject/' + link.subject;
    console.log('正在处理影片：' + url);
    let retryCount = 1;
    async.retry(3,
        function () {
            request.get(url, function (err, res, body) {
                if (err) {
                    if (err.status === 404) {
                        console.error('影片抓取结束, StatusCode:', err.status);
                    } else {
                        retryCount++;
                        console.error('页面获取失败：%s'.red, err.message);
                        console.error('...进行第%d次尝试...'.red, retryCount);
                    }
                    return callback(err);
                }

                let $ = cheerio.load(body);
                let title = $("h1 span").first().text();

                link.title = title;
                link.img = $("#mainpic img").attr("src");
                link.info = {};

                $("span", "#info").each(function () {
                    let tc = $(this).attr("class");
                    if (tc === undefined || tc === 'actor') {
                        let key = $(".pl", this).text();
                        let value = $(".attrs", this).text();
                        if (key === '' || value === '')
                            return;

                        link.info[key] = value;
                    } else {

                    }
                });

                console.log(('完成 | ' + title).green);
                return callback();
            });
        },
        function (err, res) {
            if (err) {
                console.error('页面获取失败：%s'.red, err.message);
            }
            return callback();
        });
}