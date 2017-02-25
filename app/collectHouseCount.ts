import { getRegionDetail } from '../module/region';
import { host } from '../config';

const collectHouseCount = (regionName, pageCount) => {
    let dec = Math.floor(pageCount / 10),
        tail = pageCount - 10 * dec,
        totalCnt = 0;


    for (let i = 0; i <= dec; i++) {
        setTimeout(() => {
            getRegionDetail(regionName, {
                pageStart: i * 10,
                pageStep: i === dec ? tail : 10,
                host
            }).then(detail => {
                console.log(detail.houseNum);
            });
        }, i * 200000);
    }
};