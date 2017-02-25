import { getCommunityDetail, getCommunityIds } from './community';

interface Option {
    pageStart: number;
    pageStep: number;
    host: string;
}
interface RegionDetail {
    houseNum: number;
}

export const getRegionDetail = (regionName: string, option: Option) => {
    const {pageStart, pageStep, host} = option;
    return new Promise<RegionDetail>((resolve, reject) => {
        let communityPages = [];
        for (let page = pageStart; page < pageStart + pageStep; page++) {
            communityPages.push(
                getCommunityIds(host, `/xiaoqu/${regionName}/pg${page}/`)
                    .then(ids => {
                        return Promise.all(ids.map(id => {
                            return getCommunityDetail(host, `/xiaoqu/${id}/`);
                        }));
                    }).then(commDetails => {
                        let pageSum = 0;
                        commDetails.forEach(commDetail => {
                            pageSum += commDetail.houseNum;
                        });
                        return pageSum;
                    })
            )
        }
        Promise.all(communityPages)
            .then(pageSums => {
                const regionSum = pageSums.reduce((prev, curr) => {
                    return prev + curr;
                });
                resolve({
                    houseNum: regionSum
                });
            });
    })
};

