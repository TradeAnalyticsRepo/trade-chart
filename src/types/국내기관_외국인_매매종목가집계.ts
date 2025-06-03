interface ForeignInstitutionTotalParams {
  FID_COND_MRKT_DIV_CODE: string; // 시장 구분 코드 (예: 'J' - 코스피, 'Q' - 코스닥)
  FID_INPUT_ISCD: string;         // 종목 코드 (예: '005930' - 삼성전자)
}

interface ForeignInstitutionTotalResponse {
  rt_cd: string;                  // 응답 코드 ('0'이면 성공)
  msg_cd: string;                 // 메시지 코드
  msg1: string;                   // 메시지 내용
  output: {
    iscd_stat_cls_code: string;   // 종목 상태 코드
    stck_shrn_iscd: string;       // 단축 종목 코드
    stck_iscd: string;            // 종목 코드
    prdy_vrss_sign: string;       // 전일 대비 부호
    prdy_vrss: string;            // 전일 대비
    prdy_ctrt: string;            // 전일 대비율
    acml_vol: string;             // 누적 거래량
    acml_tr_pbmn: string;         // 누적 거래 대금
    prdy_vol: string;             // 전일 거래량
    prdy_tr_pbmn: string;         // 전일 거래 대금
    frgn_ntby_qty: string;        // 외국인 순매수 수량
    frgn_ntby_tr_pbmn: string;    // 외국인 순매수 대금
    orgn_ntby_qty: string;        // 기관 순매수 수량
    orgn_ntby_tr_pbmn: string;    // 기관 순매수 대금
    frgn_tr_amo: string;          // 외국인 거래 금액
    orgn_tr_amo: string;          // 기관 거래 금액
    frgn_ntby_tr_amo: string;     // 외국인 순매수 금액
    orgn_ntby_tr_amo: string;     // 기관 순매수 금액
    frgn_rto: string;             // 외국인 보유 비율
    orgn_rto: string;             // 기관 보유 비율
    frgn_ntby_qty_1: string;      // 외국인 순매수 수량 (1일 전)
    orgn_ntby_qty_1: string;      // 기관 순매수 수량 (1일 전)
    frgn_ntby_qty_2: string;      // 외국인 순매수 수량 (2일 전)
    orgn_ntby_qty_2: string;      // 기관 순매수 수량 (2일 전)
    frgn_ntby_qty_3: string;      // 외국인 순매수 수량 (3일 전)
    orgn_ntby_qty_3: string;      // 기관 순매수 수량 (3일 전)
    frgn_ntby_qty_4: string;      // 외국인 순매수 수량 (4일 전)
    orgn_ntby_qty_4: string;      // 기관 순매수 수량 (4일 전)
    frgn_ntby_qty_5: string;      // 외국인 순매수 수량 (5일 전)
    orgn_ntby_qty_5: string;      // 기관 순매수 수량 (5일 전)
    frgn_ntby_qty_6: string;      // 외국인 순매수 수량 (6일 전)
    orgn_ntby_qty_6: string;      // 기관 순매수 수량 (6일 전)
    frgn_ntby_qty_7: string;      // 외국인 순매수 수량 (7일 전)
    orgn_ntby_qty_7: string;      // 기관 순매수 수량 (7일 전)
    frgn_ntby_qty_8: string;      // 외국인 순매수 수량 (8일 전)
    orgn_ntby_qty_8: string;      // 기관 순매수 수량 (8일 전)
    frgn_ntby_qty_9: string;      // 외국인 순매수 수량 (9일 전)
    orgn_ntby_qty_9: string;      // 기관 순매수 수량 (9일 전)
    frgn_ntby_qty_10: string;     // 외국인 순매수 수량 (10일 전)
    orgn_ntby_qty_10: string;     // 기관 순매수 수량 (10일 전)
  };
}
