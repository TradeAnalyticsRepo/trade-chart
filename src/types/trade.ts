/**
 * [종목별 일별동향] 컬럼값 기준 타입 명시. 
 * 해당 데이터를 기준으로 차트 생성 
 */
export interface ExcelData  {
  tradeDate: string; // 날짜
  endMount: number; // 종가
  previousDayComparison: number; // 전일 대비
  tradingVolume: number; // 거래량


  // 각각 개인/외국인/기관에 종속되는 데이터(집계 데이터(기준일자 기준))
  indivCollectionVolume: number; // 개인매집수량
  indivDispersionRatio: number; // 개인분산비율 

  totalForeAndInstCollectionVolume: number; // 외국인 + 기관매집수량
  totalForeAndInstDispersionRatio: number; // 외국인 + 기관분산비율 

  foreCollectionVolume: number; // 외국인매집수량
  foreDispersionRatio: number; // 외국인분산비율 

  totalInsCollectionVolume: number; // 기관종합매집수량
  totalInsDispersionRatio: number; // 기관종합분산비율 

  finInvCollectionVolume: number; // 금융투자(기관)매집수량
  finInvDispersionRatio: number; // 금융투자(기관)분산비율 

  insurCollectionVolume: number; // 보험매집수량
  insurDispersionRatio: number; // 보험분산비율 

  trustCollectionVolume: number; // 투신(일반 + 특수)매집수량
  trustDispersionRatio: number; // 투신(일반 + 특수)분산비율 

  etcFinCollectionVolume: number; // 기타금융매집수량
  etcFinDispersionRatio: number; // 기타금융분산비율 

  bankCollectionVolume: number; // 은행매집수량
  bankDispersionRatio: number; // 은행분산비율 

  pensCollectionVolume: number; // 연기금매집수량
  pensDispersionRatio: number; // 연기금분산비율 

  sTrustCollectionVolume: number; // 사모펀드매집수량
  sTrustDispersionRatio: number; // 사모펀드분산비율 

  natCollectionVolume: number; // 국가매집수량
  natDispersionRatio: number; // 국가분산비율 

  etcCollectionVolume: number; // 기타법인매집수량
  etcDispersionRatio: number; // 기타법인분산비율 

}





/**
 * 개별 거래 데이터를 나타내는 인터페이스
 */
export interface TradeData {
  /** 거래 날짜 (YYYY-MM-DD 형식) */
  date: string;
  /** 투자자 유형 (개인, 외국인, 기관) */
  investor: string;
  /** 매수 금액 (원 단위) */
  buy_amt: string;
  /** 매도 금액 (원 단위) */
  sell_amt: string;
  /** 순매수 금액 (원 단위) */
  net_amt: string;
  /** 종가 (원 단위) */
  close_price: string;
  /** 시가 (원 단위) */
  open_price: string;
  /** 고가 (원 단위) */
  high_price: string;
  /** 저가 (원 단위) */
  low_price: string;
}

/**
 * 차트 시리즈 데이터를 나타내는 인터페이스
 */
export interface ChartSeries {
  /** 시리즈 이름 */
  name: string;
  /** 차트 타입 (line, bar, candlestick 등) */
  type: string;
  /** 데이터 배열 (일반 데이터 또는 OHLC 데이터) */
  data: number[] | number[][];
  /** Y축 인덱스 */
  yAxisIndex?: number;
  /** 부드러운 곡선 사용 여부 */
  smooth?: boolean;
  /** 데이터 포인트 표시 여부 */
  showSymbol?: boolean;
  /** 라인 스타일 */
  lineStyle?: {
    width: number;
  };
  /** 영역 스타일 */
  areaStyle?: {
    opacity: number;
  };
  /** 아이템 스타일 */
  itemStyle?: {
    color?: string | ((params: any) => string);
    color0?: string;
    borderColor?: string;
    borderColor0?: string;
  };
  /** 투명도 */
  opacity?: number;
  /** 기본 선택 여부 */
  selected?: boolean;
}

/**
 * 차트 옵션을 나타내는 인터페이스
 */
export interface ChartOption {
  /** 차트 제목 */
  title: {
    text: string;
    left: string;
    textStyle: {
      color: string;
    };
  };
  /** 툴팁 설정 */
  tooltip: {
    trigger: string;
    axisPointer: {
      type: string;
    };
    formatter: (params: any) => string;
  };
  /** 범례 설정 */
  legend: {
    data: string[];
    top: number;
    textStyle: {
      color: string;
    };
  };
  /** 그리드 설정 */
  grid: {
    left: string;
    right: string;
    bottom: string;
    top: string;
    containLabel: boolean;
  };
  /** 데이터 줌 설정 */
  dataZoom: {
    type: string;
    start: number;
    end: number;
    bottom?: number;
  }[];
  /** X축 설정 */
  xAxis: {
    type: string;
    data: string[];
    axisLabel: {
      color: string;
      formatter: (value: string) => string;
      interval: number;
      rotate: number;
    };
  };
  /** Y축 설정 */
  yAxis: {
    type: string;
    name: string;
    position: string;
    offset?: number;
    axisLabel: {
      formatter: string;
      color: string;
    };
    nameTextStyle: {
      color: string;
    };
    splitLine: {
      show?: boolean;
      lineStyle?: {
        color: string;
        opacity: number;
      };
    };
  }[];
  /** 시리즈 데이터 */
  series: ChartSeries[];
}

export interface ApiResponse {
  rt_cd: string;
  output: TradeData[];
}
