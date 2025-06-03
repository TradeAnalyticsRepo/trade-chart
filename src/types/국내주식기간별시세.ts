export interface InquireDailyItemChartPriceParams {
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
    prdy_vrss: string;         // 전일 대비
    prdy_vrss_sign: string;    // 전일 대비 부호
    prdy_ctrt: string;         // 전일 대비율 (%)
    stck_prdy_clpr: string;    // 전일 종가
    acml_vol: string;          // 누적 거래량
    acml_tr_pbmn: string;      // 누적 거래대금
    hts_kor_isnm: string;      // 한글 종목명
    stck_prpr: string;         // 현재가
    stck_shrn_iscd: string;    // 단축 종목코드
    prdy_vol: string;          // 전일 거래량
    stck_mxpr: string;         // 상한가
    stck_llam: string;         // 하한가
    stck_oprc: string;         // 시가
    stck_hgpr: string;         // 고가
    stck_lwpr: string;         // 저가
    stck_prdy_oprc: string;    // 전일 시가
    stck_prdy_hgpr: string;    // 전일 고가
    stck_prdy_lwpr: string;    // 전일 저가
    askp: string;              // 매도호가
    bidp: string;              // 매수호가
    prdy_vrss_vol: string;     // 전일 대비 거래량
    vol_tnrt: string;          // 거래량 회전율
    stck_fcam: string;         // 액면가
    lstn_stcn: string;         // 상장 주식 수
    cpfn: string;              // 자본금
    hts_avls: string;          // 시가총액
    per: string;               // PER (주가수익비율)
    eps: string;               // EPS (주당순이익)
    pbr: string;               // PBR (주가순자산비율)
    itewhol_loan_rmnd_ratem: string; // 융자 잔고 비율
  };
  output2: {
    stck_bsop_date: string;    // 주식 영업일자 (YYYYMMDD)
    stck_clpr: string;         // 종가
    stck_oprc: string;         // 시가
    stck_hgpr: string;         // 고가
    stck_lwpr: string;         // 저가
    acml_vol: string;          // 누적 거래량
    acml_tr_pbmn: string;      // 누적 거래대금
    flng_cls_code: string;     // 락 구분 코드
    prtt_rate: string;         // 분할 비율
    mod_yn: string;            // 데이터 변경 여부
    prdy_vrss_sign: string;    // 전일 대비 부호
    prdy_vrss: string;         // 전일 대비
    revl_issu_reas: string;    // 재평가 사유 코드
  }
}

