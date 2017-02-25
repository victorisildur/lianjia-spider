import * as http from 'http';
import * as cheerio from 'cheerio';

/* return {Promise:[string]}: [小区id] */
export const getCommunityIds = (host: string, path: string) => {
	let html = '';
	return new Promise<number[]>((resolve, reject) => {
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
					return m.length > 1 ? m[1] : '';
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
}

/* @return: {Object}小区详情：{xiaoquName: string, houseNum: number, details: [{key, value} ...]
 */
interface CommunityDetail {
	name: string;
	houseNum: number;
	details: [{
		key: string;
		value: string;
	}]
}
export const getCommunityDetail = (host: string, path: string) => {
	let html = '';
	return new Promise<CommunityDetail>((resolve, reject) => {
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
				const name = $('.detailHeader .detailTitle').text();
				let houseNum = -1;
				const details = $('.xiaoquInfo .xiaoquInfoItem'),
					kvs = details.map((i, detail) => {
						let key = $(detail).find('.xiaoquInfoLabel').text(),
							value = $(detail).find('.xiaoquInfoContent').text();
						if (/房屋总数/.test(key)) {
							let m = /(\d+)/.exec(value);
							if (m && m.length > 1)
								houseNum = Number(m[1]);
						}
						return { key, value };
					}).get();
				resolve({
					name,
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