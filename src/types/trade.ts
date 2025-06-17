/**
 * [종목별 일별동향] 컬럼값 기준 타입 명시.
 * 해당 데이터를 기준으로 차트 생성
 */
export interface ExcelData {
  // 개인, 외국인, 기관 등 변수명 재통일할것. ex) indiv + Volume, indiv + CollectionVolume

  tradingVolumeTotalForeAndInst: number;
  tradingVolumeIndiv: number;
  tradingVolumeFore: number;
  tradingVolumeTotalIns: number;
  tradingVolumeFinInv: number;
  tradingVolumeEtc: number;
  tradingVolumeTrust: number;
  tradingVolumeSTrust: number;
  tradingVolumeBank: number;
  tradingVolumeInsur: number;
  tradingVolumeEtcFin: number;
  tradingVolumePens: number;
  tradingVolumeNat: number;

  /** 거래 날짜 */
  tradeDate: string;
  /** 종가 */
  endMount: number;
  /** 전일 대비 */
  previousDayComparison: number;
  /** 거래량 */
  tradingVolume: number;

  /** 주가선도 */
  stockMomentum: number;
  /** 상관계수 */
  stockCorrelation: number;

  /** 개인매집수량 */
  indivCollectionVolume: number;
  /** 개인분산비율 */
  indivDispersionRatio: number;
  /** 개인주가선도 */
  indivStockMomentum: number;

 /** 외국인 + 기관매집수량 */
  totalForeAndInstCollectionVolume: number;
  /** 외국인 + 기관분산비율 */
  totalForeAndInstDispersionRatio: number;
  /** 외국인 + 기관주가선도 */
  totalForeAndInstStockMomentum: number;

  /** 외국인매집수량 */
  foreCollectionVolume: number;
  /** 외국인분산비율 */
  foreDispersionRatio: number;
  /** 외국인주가선도 */
  foreStockMomentum: number;

  /** 기관종합매집수량 */
  totalInsCollectionVolume: number;
  /** 기관종합분산비율 */
  totalInsDispersionRatio: number;
  /** 기관종합주가선도 */
  totalInsStockMomentum: number;

  /** 금융투자(기관)매집수량 */
  finInvCollectionVolume: number;
  /** 금융투자(기관)분산비율 */
  finInvDispersionRatio: number;
  /** 금융투자(기관)주가선도 */
  finInvStockMomentum: number;

  /** 보험매집수량 */
  insurCollectionVolume: number;
  /** 보험분산비율 */
  insurDispersionRatio: number;
  /** 보험주가선도 */
  insurStockMomentum: number;

  /** 투신(일반 + 특수)매집수량 */
  trustCollectionVolume: number;
  /** 투신(일반 + 특수)분산비율 */
  trustDispersionRatio: number;
  /** 투신(일반 + 특수)주가선도 */
  trustStockMomentum: number;

  /** 기타금융매집수량 */
  etcFinCollectionVolume: number;
  /** 기타금융분산비율 */
  etcFinDispersionRatio: number;
  /** 기타금융주가선도 */
  etcFinStockMomentum: number;

  /** 은행매집수량 */
  bankCollectionVolume: number;
  /** 은행분산비율 */
  bankDispersionRatio: number;
  /** 은행주가선도 */
  bankStockMomentum: number;

  /** 연기금매집수량 */
  pensCollectionVolume: number;
  /** 연기금분산비율 */
  pensDispersionRatio: number;
  /** 연기금주가선도 */
  pensStockMomentum: number;

  /** 사모펀드매집수량 */
  sTrustCollectionVolume: number;
  /** 사모펀드분산비율 */
  sTrustDispersionRatio: number;
  /** 사모펀드주가선도 */
  sTrustStockMomentum: number;

  /** 국가매집수량 */
  natCollectionVolume: number;
  /** 국가분산비율 */
  natDispersionRatio: number;
  /** 국가주가선도 */
  natStockMomentum: number;

  /** 기타법인매집수량 */
  etcCollectionVolume: number;
  /** 기타법인분산비율 */
  etcDispersionRatio: number;
  /** 기타법인주가선도 */
  etcStockMomentum: number;
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
