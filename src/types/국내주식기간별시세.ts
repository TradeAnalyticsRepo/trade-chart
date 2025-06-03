interface InquireDailyItemChartPriceParams {
  FID_COND_MRKT_DIV_CODE: 'J' | 'NX' | 'UN'; // J:KRX 코스피 , NX:NXT 코넥스, UN:통합 
  FID_INPUT_ISCD: string;                  // 종목 코드 (6자리)
  FID_INPUT_DATE_1: string;                // 조회 시작일 (YYYYMMDD)
  FID_INPUT_DATE_2: string;                // 조회 종료일 (YYYYMMDD)
  FID_PERIOD_DIV_CODE: 'D' | 'W' | 'M';    // 기간 구분 코드: 'D' (일), 'W' (주), 'M' (월)
  FID_ORG_ADJ_PRC: '0' | '1';              // 수정주가 여부: '0' (수정주가), '1' (원주가)
}


interface InquireDailyItemChartPriceResponse {
  rt_cd: string;      // 응답 코드 ('0'이면 성공)
  msg_cd: string;     // 메시지 코드
  msg1: string;       // 메시지 내용
  output: {
    // 기타 메타 정보
  };
  output2: DailyPriceData[]; // 일별 시세 데이터 배열
}

interface DailyPriceData {
  stck_bsop_date: string; // 거래일자 (YYYYMMDD)
  stck_oprc: string;      // 시가
  stck_hgpr: string;      // 고가
  stck_lwpr: string;      // 저가
  stck_clpr: string;      // 종가
  acml_vol: string;       // 누적 거래량
  acml_tr_pbmn: string;   // 누적 거래 대금
  prdy_vrss: string;      // 전일 대비
  prdy_vrss_sign: string; // 전일 대비 부호
  prdy_ctrt: string;      // 전일 대비율
  hts_frgn_ehrt: string;  // 외국인 보유 비율
  flng_cls_code: string;  // 결산 구분 코드
}
