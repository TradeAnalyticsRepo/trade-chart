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
}

/**
 * 차트 시리즈 데이터를 나타내는 인터페이스
 */
export interface ChartSeries {
  /** 시리즈 이름 */
  name: string;
  /** 차트 타입 (line, bar 등) */
  type: string;
  /** 데이터 배열 */
  data: number[];
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
    color: (params: any) => string;
  };
  /** 투명도 */
  opacity?: number;
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
