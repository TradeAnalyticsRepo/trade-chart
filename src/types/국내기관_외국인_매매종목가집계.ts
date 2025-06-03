interface ForeignInstitutionTotalParams {
  FID_COND_MRKT_DIV_CODE: string; // 시장 분류 코드 (예: 'V' - 전체, 'J' - 코스피, 'Q' - 코스닥 등)
  FID_COND_SCR_DIV_CODE: string;  // 조건 화면 분류 코드 (예: '16449' - 기본값으로 사용)
  FID_INPUT_ISCD: string;         // 입력 종목 코드 (예: '0000' 전체, '0001' 코스피, '1001' 코스닥)
  FID_DIV_CLS_CODE: '0' | '1';    // 분류 구분 코드: '0' 수량정렬, '1' 금액정렬
  FID_RANK_SORT_CLS_CODE: '0' | '1'; // 순위 정렬 구분 코드: '0' 순매수 상위, '1' 순매도 상위
  FID_ETC_CLS_CODE: '0' | '1' | '2' | '3'; // 기타 구분: '0' 전체, '1' 외국인, '2' 기관계, '3' 기타
}

interface ForeignInstitutionTotalResponse {
  rt_cd: string;         // 응답 코드 ('0'이면 성공)
  msg_cd: string;        // 메시지 코드
  msg1: string;          // 응답 메시지
  output: {
    hts_kor_isnm: string;        // HTS 한글 종목명
    mksc_shrn_iscd: string;      // 유가증권 단축 종목코드
    ntby_qty: string;            // 순매수 수량
    stck_prpr: string;           // 현재가
    prdy_vrss_sign: string;      // 전일 대비 부호
    prdy_vrss: string;           // 전일 대비
    prdy_ctrt: string;           // 전일 대비율 (%)
    acml_vol: string;            // 누적 거래량

    // 주체별 순매수 수량
    frgn_ntby_qty: string;       // 외국인 순매수 수량
    orgn_ntby_qty: string;       // 기관계 순매수 수량
    ivtr_ntby_qty: string;       // 투자신탁 순매수 수량
    bank_ntby_qty: string;       // 은행 순매수 수량
    insu_ntby_qty: string;       // 보험 순매수 수량
    mrbn_ntby_qty: string;       // 종금 순매수 수량
    fund_ntby_qty: string;       // 기금 순매수 수량
    etc_orgt_ntby_vol: string;   // 기타 단체 순매수 거래량
    etc_corp_ntby_vol: string;   // 기타 법인 순매수 거래량

    // 주체별 순매수 거래대금 (단위: 백만원)
    frgn_ntby_tr_pbmn: string;   // 외국인 순매수 거래 대금
    orgn_ntby_tr_pbmn: string;   // 기관계 순매수 거래 대금
    ivtr_ntby_tr_pbmn: string;   // 투자신탁 순매수 거래 대금
    bank_ntby_tr_pbmn: string;   // 은행 순매수 거래 대금
    insu_ntby_tr_pbmn: string;   // 보험 순매수 거래 대금
    mrbn_ntby_tr_pbmn: string;   // 종금 순매수 거래 대금
    fund_ntby_tr_pbmn: string;   // 기금 순매수 거래 대금
    etc_orgt_ntby_tr_pbmn: string; // 기타 단체 순매수 거래 대금
    etc_corp_ntby_tr_pbmn: string; // 기타 법인 순매수 거래 대금
  } | null;  // 순매수 상세 정보
}
