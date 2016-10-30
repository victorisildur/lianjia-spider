const http = require('http');
const cheerio = require('cheerio');



/* return {Promise:[string]}: [小区id] */
const getXiaoquIds = (host, path) => {
    let html = '';
    return new Promise((resolve, reject) => {
	http.get({
	    host: host,
	    path: path,
	    port: 80,
	    headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
	    }
	}, res => {
	    res.on('data', data => {
		html += data;
	    });
	    res.on('end', data => {
		const $ = cheerio.load(html);
		const titles = $('ul.listContent li.clear .title a');
		const xiaoquIds = titles.map((i, title) => {
		    let href = $(title).attr('href');
		    let m = /\/(\d+)\/$/.exec(href);
		    return m.length > 1? m[1]: '';
		}).get();
		resolve(xiaoquIds);
	    });
	    res.on('error', e => {
		console.error('xiaoqu PATH: ' + path + ' 获取失败');
		reject();
	    });
	}).on('error', e => {
	    console.error('xiaoqu PATH:' + path + ' 获取失败');
	    reject();
	});
    });
};

/* @return: {Object}小区详情：{xiaoquName: string, houseNum: number, details: [{key, value} ...]
 */
const getXiaoquDetail = (host, path) => {
    let html = '';
    return new Promise((resolve, reject) => {
	http.get({
	    host: host,
	    path: path,
	    port: 80,
	    headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36'
	    }
	}, res => {
	    res.on('data', data => {
		html += data;
	    });
	    res.on('end', data => {
		const $ = cheerio.load(html);
		const xiaoquName = $('.detailHeader .detailTitle').text();
		let houseNum = -1;
		const details = $('.xiaoquInfo .xiaoquInfoItem'),
		      kvs = details.map((i, detail) => {
			  let key = $(detail).find('.xiaoquInfoLabel').text(),
			      value = $(detail).find('.xiaoquInfoContent').text();
			  if (/房屋总数/.test(key)) {
			      let m = /(\d+)/.exec(value);
			      if (m && m.length>1)
				  houseNum = m[1] - 0;
			  }
			  return {key, value};
		      }).get();
		resolve({
		    xiaoquName,
		    houseNum,
		    details: kvs
		});
	    });
	    res.on('error', e => {
		console.error('detail PATH: ' + path + ' 获取失败');
		reject();
	    });
	}).on('error', e => {
	    console.error('detail PATH: ' + path + ' 获取失败');
	    reject();
	});
    });
};

const host = 'hz.lianjia.com';

let sum = 0;

const getQuInfo = (quName, pageStart, pageStep) => {
    let pages = [];
    for (let i = pageStart; i<pageStart + pageStep; i++) {
	pages.push(i);
    }
    
    pages.forEach(page => {
	// 所有页
	getXiaoquIds(host, '/xiaoqu/' + quName + '/pg' + page + '/')
	    .then(ids => {
		// 这一页所有小区id
		ids.forEach(id => {
		    // 小区id详情
		    getXiaoquDetail(host, '/xiaoqu/' + id + '/').then(detail => {
			sum += detail.houseNum;
			console.info(`page${page} 小区: ${detail.xiaoquName}, \t\t\t\t房屋数量: ${detail.houseNum}, \t\t\t总数: ${sum}`);
		    });
		});
	    });
    });
};

const main = (quName, pageCount) => {
    let dec = Math.floor(pageCount/10),
	tail = pageCount - 10 * dec;
    for (let i=0; i<=dec; i++ ) {
	setTimeout(() => {
	    getQuInfo(quName, i*10, i===dec? tail: 10);
	}, i*200000);
    }
};



main('xiaoshan', 15);
