export const BASE_URL = 'https://openapi.koreainvestment.com:9443';

export enum URL {
    국내기관_외국인_매매종목가집계 = '/uapi/domestic-stock/v1/quotations/foreign-institution-total',
    국내주식기간별시세 = '/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice'
}


interface KisRequestHeaders {
  'Content-Type': 'application/json';
  Authorization: `Bearer ${string}`;
  appKey: string; // 앱키 
  appSecret: string; // 앱시크릿키
  tr_id: string; // 거래ID 예: 'FHKST03010100'
}
