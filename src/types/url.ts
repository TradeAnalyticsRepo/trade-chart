import { AxiosHeaders } from "axios";

export const BASE_URL = 'https://openapi.koreainvestment.com:9443';

export enum KIS_URL {
    국내기관_외국인_매매종목가집계 = '/uapi/domestic-stock/v1/quotations/foreign-institution-total',
    국내주식기간별시세 = '/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice'
}

export interface KisRequestHeaders extends AxiosHeaders {
  'Content-Type': string;
  Authorization: string;
  appkey: string; // 앱키 
  appsecret: string; // 앱시크릿키
  tr_id: string; // 거래ID 예: 'FHKST03010100'
  tr_cont: string; // 거래연속여부
  custtype: string; // 고객구분 예: 'P' 개인, 'B' 기관
}
