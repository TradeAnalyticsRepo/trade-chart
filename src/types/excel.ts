export interface excelFile {
    개인: number; 
    거래량: number;
    기관: number;
    기관종합: number;
    기타: number;
    외국인: number;
    일자: string;          // "2025/06/05"
    전일대비: string;       // "▲" "▼"
    종가: number;
    __EMPTY: number;      // 금융투자
    __EMPTY_1: number;    // 투신(일반)
    __EMPTY_2: number;    // 투신(사모)
    __EMPTY_3: number;    // 은행
    __EMPTY_4: number;    // 보험
    __EMPTY_5: number;    // 기타금융
    __EMPTY_6: number;    // 연기금
    __EMPTY_7: number;    // 국가지방
    __rowNum__: number;   // indicator
}