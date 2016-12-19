# movie-gallery3d

该项目使用 node.js 爬取豆瓣网 (https://movie.douban.com/) 近期上映电影及打分与影评数据，并结合 three.js 以 CSS3 三维动画的形式进行展现。

[Live Demo](https://hanmag.github.io/movie-gallery3d/)

![mg3d.png](https://ooo.0o0.ooo/2016/12/19/5857dc867b8c2.png)

### 环境要求 ###

* WebKit Browser (eg. Chrome)
* Node.js 4.2.1+

### 使用方法 ###

```bash
$ git clone https://github.com/hanmag/movie-gallery3d.git
$ cd movie-gallery3d
$ npm install # 安装npm包依赖

$ node scrapy.js # 运行程序

打开浏览器访问：http://localhost:3000/
```

### 鸣谢 ###

* [jav-scrapy](https://github.com/raawaa/jav-scrapy) : 一个可以爬取 AV 磁力链接或影片封面的小爬虫。
* [node-static-webserver](https://github.com/r1000ru/node-static-webserver) : Web server for virtual hosts and static content.

---------------
仅供娱乐，欢迎加入一起完善！
