/**
 * 차트 설정 관련 유틸리티 함수들
 *
 * 주요 기능:
 * - 공통 차트 옵션 생성
 * - 날짜 포맷팅
 * - 동적 날짜 표시 간격 계산
 * - 투자자별 색상 매핑
 * - Y축 범위 계산
 */

import { ExcelData } from '@/types/trade';

// ===== 투자자별 색상 매핑 =====

/** 투자자 타입에 따른 색상 매핑 */
export const INVESTOR_COLORS = {
  개인: '#1890ff',
  외국인: '#ff4d4f',
  기관: '#52c41a',
} as const;

// 더 유연한 타입 정의 - 새로운 투자자 타입 추가 가능
export type InvestorType = string;

/**
 * 투자자 타입에 따른 색상을 반환하는 함수
 * @param investorType - 투자자 유형
 * @returns 해당 투자자의 색상 코드
 */
export const getInvestorColor = (investorType: InvestorType): string => {
  return INVESTOR_COLORS[investorType as keyof typeof INVESTOR_COLORS] || INVESTOR_COLORS.개인;
};

// ===== 날짜 관련 유틸리티 =====

/**
 * 날짜를 YYYY/MM/DD 형태로 포맷팅하는 함수
 * @param value - 날짜 문자열
 * @returns 포맷팅된 날짜 문자열
 */
export const formatDate = (value: string): string => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}/${month}/${day}`;
};

/**
 * 줌 레벨에 따른 동적 날짜 표시 간격을 계산하는 함수
 * @param index - 데이터 인덱스
 * @param totalDataCount - 전체 데이터 개수
 * @param zoomStart - 줌 시작 위치
 * @param zoomEnd - 줌 끝 위치
 * @returns 해당 인덱스의 날짜를 표시할지 여부
 */
export const calculateDateInterval = (index: number, totalDataCount: number, zoomStart: number = 0, zoomEnd: number = 100): boolean => {
  // ===== 동적 날짜 표시 간격 계산 =====

  /** 현재 표시되는 데이터 개수를 추정 (줌 레벨에 따라) */
  const zoomRange = zoomEnd - zoomStart;
  const estimatedVisibleCount = Math.ceil((zoomRange / 100) * totalDataCount);

  // ===== 줌 레벨에 따른 날짜 표시 간격 조정 =====

  /** 최초 로드 시 (전체 데이터 보기) - 마지막과 최신 일자는 항상 표시 */
  if (zoomRange >= 95) {
    // 전체 데이터가 보일 때는 간격을 더 크게
    if (index % 50 === 0 || index === 0 || index === totalDataCount - 1) {
      return true;
    }
    return false;
  }

  /** 확대된 상태에 따라 간격 조정 */
  if (estimatedVisibleCount <= 15) {
    // 15개 이하일 때 (매우 확대된 상태) - 모든 날짜 표시
    return true;
  } else if (estimatedVisibleCount <= 30) {
    // 30개 이하일 때 - 3개마다 표시
    return index % 3 === 0;
  } else if (estimatedVisibleCount <= 60) {
    // 60개 이하일 때 - 5개마다 표시
    return index % 5 === 0;
  } else if (estimatedVisibleCount <= 120) {
    // 120개 이하일 때 - 10개마다 표시
    return index % 10 === 0;
  } else if (estimatedVisibleCount <= 300) {
    // 300개 이하일 때 - 20개마다 표시
    return index % 20 === 0;
  } else {
    // 300개 초과일 때 - 50개마다 표시하되, 마지막과 최신 일자는 항상 표시
    return index % 50 === 0 || index === 0 || index === totalDataCount - 1;
  }
};

// ===== Y축 범위 계산 =====

/**
 * 데이터 배열에서 Y축 범위를 계산하는 함수
 * @param dataArray - 계산할 데이터 배열들
 * @param padding - 여백 비율 (기본값: 0.1 = 10%)
 * @returns Y축 최소값과 최대값 객체
 */
export const calculateYAxisRange = (dataArray: number[][], padding: number = 0.1): { min: number; max: number } => {
  /** 모든 데이터를 합친 배열 */
  const allData = dataArray.flat();

  /** 전체 데이터 중 최소값 */
  const minValue = Math.min(...allData);

  /** 전체 데이터 중 최대값 */
  const maxValue = Math.max(...allData);

  /** 값의 범위 (최대값 - 최소값) */
  const valueRange = maxValue - minValue;

  /** Y축 최소값 (실제 최소값보다 padding% 작게) */
  const yAxisMin = Math.floor(minValue - valueRange * padding);

  /** Y축 최대값 (실제 최대값보다 padding% 크게) */
  const yAxisMax = Math.ceil(maxValue + valueRange * padding);

  return { min: yAxisMin, max: yAxisMax };
};

// ===== 공통 차트 옵션 =====

/**
 * 공통 차트 옵션을 생성하는 함수
 * @param title - 차트 제목
 * @param dates - X축 날짜 배열
 * @param zoomStart - 줌 시작 위치
 * @param zoomEnd - 줌 끝 위치
 * @param yAxisRange - Y축 범위
 * @param legendData - 범례 데이터 (선택사항)
 * @param options - 추가 옵션들
 * @returns 공통 차트 옵션 객체
 */
export const createCommonChartOptions = (
  title: string,
  dates: string[],
  zoomStart: number = 0,
  zoomEnd: number = 100,
  yAxisRange: { min: number; max: number },
  legendData?: string[],
  options?: {
    showSlider?: boolean; // 슬라이더 표시 여부 (기본값: true)
    showInsideZoom?: boolean; // 마우스 휠 줌 표시 여부 (기본값: true)
    gridTop?: string; // 그리드 상단 여백 (기본값: legendData ? '20%' : '15%')
    gridBottom?: string; // 그리드 하단 여백 (기본값: '15%')
    gridLeft?: string; // 그리드 좌측 여백 (기본값: '5%')
    gridRight?: string; // 그리드 우측 여백 (기본값: '8%')
    xAxisRotate?: number; // X축 라벨 회전 각도 (기본값: 45)
    xAxisMargin?: number; // X축 라벨 여백 (기본값: 15)
    yAxisMargin?: number; // Y축 라벨 여백 (기본값: 20)
    yAxisPadding?: number[]; // Y축 이름 패딩 (기본값: [0, 0, 0, 40])
    tooltipBackgroundColor?: string; // 툴팁 배경색 (기본값: 'rgba(0, 0, 0, 0.8)')
    tooltipBorderColor?: string; // 툴팁 테두리색 (기본값: 'rgba(255, 255, 255, 0.2)')
    tooltipTextColor?: string; // 툴팁 텍스트색 (기본값: '#fff')
    axisLineColor?: string; // 축선 색상 (기본값: '#fff')
    splitLineColor?: string; // 격자선 색상 (기본값: 'rgba(255, 255, 255, 0.1)')
    axisPointerColor?: string; // 축 포인터 색상 (기본값: 'rgba(255, 255, 255, 0.2)')
    sliderHeight?: number; // 슬라이더 높이 (기본값: 20)
    sliderBottom?: string; // 슬라이더 하단 위치 (기본값: '5%')
    sliderBorderColor?: string; // 슬라이더 테두리색 (기본값: 'rgba(255, 255, 255, 0.2)')
    sliderFillerColor?: string; // 슬라이더 채우기색 (기본값: 'rgba(255, 255, 255, 0.1)')
    sliderHandleColor?: string; // 슬라이더 핸들 색상 (기본값: INVESTOR_COLORS.개인)
    sliderTextColor?: string; // 슬라이더 텍스트색 (기본값: '#fff')
    legendTop?: number; // 범례 상단 위치 (기본값: 30)
    legendTextColor?: string; // 범례 텍스트색 (기본값: '#fff')
    titleTextColor?: string; // 제목 텍스트색 (기본값: 'var(--foreground)')
    titleLeft?: string; // 제목 좌측 정렬 (기본값: 'center')
    backgroundColor?: string; // 차트 배경색 (기본값: 'transparent')
  }
) => {
  // ===== 기본값 설정 =====
  const {
    showSlider = true,
    showInsideZoom = true,
    gridTop = legendData ? '20%' : '15%',
    gridBottom = '15%',
    gridLeft = '5%',
    gridRight = '8%',
    xAxisRotate = 45,
    xAxisMargin = 15,
    yAxisMargin = 20,
    yAxisPadding = [0, 0, 0, 40],
    tooltipBackgroundColor = 'rgba(0, 0, 0, 0.8)',
    tooltipBorderColor = 'rgba(255, 255, 255, 0.2)',
    tooltipTextColor = '#fff',
    axisLineColor = '#fff',
    splitLineColor = 'rgba(255, 255, 255, 0.1)',
    axisPointerColor = 'rgba(255, 255, 255, 0.2)',
    sliderHeight = 20,
    sliderBottom = '5%',
    sliderBorderColor = 'rgba(255, 255, 255, 0.2)',
    sliderFillerColor = 'rgba(255, 255, 255, 0.1)',
    sliderHandleColor = INVESTOR_COLORS.개인,
    sliderTextColor = '#fff',
    legendTop = 30,
    legendTextColor = '#fff',
    titleTextColor = 'var(--foreground)',
    titleLeft = 'center',
    backgroundColor = 'transparent',
  } = options || {};

  // ===== 줌 기능 설정 =====
  const dataZoom = [];

  if (showInsideZoom) {
    dataZoom.push({
      type: 'inside' as const, // 마우스 휠로 줌
      start: zoomStart,
      end: zoomEnd,
    });
  }

  if (showSlider) {
    dataZoom.push({
      type: 'slider' as const, // 하단 슬라이더로 줌
      start: zoomStart,
      end: zoomEnd,
      bottom: sliderBottom,
      height: sliderHeight,
      borderColor: sliderBorderColor,
      fillerColor: sliderFillerColor,
      handleStyle: {
        color: sliderHandleColor,
      },
      textStyle: {
        color: sliderTextColor,
      },
    });
  }

  const baseOptions = {
    // ===== 차트 제목 =====
    title: {
      text: title,
      left: titleLeft as any,
      textStyle: {
        color: titleTextColor,
      },
    },

    // ===== 차트 배경 =====
    backgroundColor,

    // ===== 그리드 설정 =====
    grid: {
      left: gridLeft,
      right: gridRight,
      bottom: gridBottom,
      top: gridTop, // legend가 있으면 공간 확보
    },

    // ===== 줌 기능 설정 =====
    dataZoom,

    // ===== X축 설정 =====
    xAxis: {
      type: 'category' as const,
      data: dates,
      axisLabel: {
        color: axisLineColor,
        formatter: formatDate,
        interval: (index: number) => calculateDateInterval(index, dates.length, zoomStart, zoomEnd),
        rotate: xAxisRotate, // 날짜 라벨 회전
        margin: xAxisMargin,
      },
      axisLine: {
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisTick: {
        show: false,
      },
    },

    // ===== Y축 설정 =====
    yAxis: {
      type: 'value' as const,
      name: '매집수량',
      position: 'left' as const,
      min: yAxisRange.min,
      max: yAxisRange.max,
      axisLabel: {
        formatter: '{value}',
        color: axisLineColor,
        margin: yAxisMargin,
      },
      nameTextStyle: {
        color: axisLineColor,
        padding: yAxisPadding,
      },
      splitLine: {
        lineStyle: {
          color: splitLineColor,
        },
      },
    },

    // ===== 툴팁 기본 설정 =====
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: {
        type: 'cross' as const,
        lineStyle: {
          color: axisPointerColor,
        },
      },
      backgroundColor: tooltipBackgroundColor,
      borderColor: tooltipBorderColor,
      textStyle: {
        color: tooltipTextColor,
      },
    },
  };

  // ===== 범례가 있는 경우 추가 =====
  if (legendData) {
    return {
      ...baseOptions,
      legend: {
        data: legendData,
        top: legendTop,
        textStyle: {
          color: legendTextColor,
        },
        selected: legendData.reduce((acc, item) => {
          acc[item] = true;
          return acc;
        }, {} as Record<string, boolean>),
      },
    };
  }

  return baseOptions;
};

// ===== 투자자별 데이터 추출 =====

/**
 * 투자자 타입에 따른 매집수량 데이터를 추출하는 함수
 * @param sortedData - 정렬된 Excel 데이터
 * @param investorType - 투자자 유형
 * @returns 해당 투자자의 매집수량 배열
 */
export const extractInvestorData = (sortedData: ExcelData[], investorType: InvestorType): number[] => {
  switch (investorType) {
    case '개인':
      return sortedData.map((item) => item.indivCollectionVolume);
    case '외국인':
      return sortedData.map((item) => item.foreCollectionVolume);
    case '기관':
      return sortedData.map((item) => item.totalInsCollectionVolume);
    // 새로운 투자자 타입 추가 시 여기에 case 추가
    // case '새로운투자자':
    //   return sortedData.map((item) => item.newInvestorCollectionVolume);
    default:
      // 기본값으로 개인 데이터 반환 (또는 에러 처리)
      console.warn(`Unknown investor type: ${investorType}, using 개인 data as fallback`);
      return sortedData.map((item) => item.indivCollectionVolume);
  }
};

/**
 * 투자자 타입에 따른 분산비율을 추출하는 함수
 * @param data - Excel 데이터 항목
 * @param investorType - 투자자 유형
 * @returns 해당 투자자의 분산비율
 */
export const extractDispersionRatio = (data: ExcelData, investorType: InvestorType): number => {
  switch (investorType) {
    case '개인':
      return data.indivDispersionRatio;
    case '외국인':
      return data.foreDispersionRatio;
    case '기관':
      return data.totalInsDispersionRatio;
    // 새로운 투자자 타입 추가 시 여기에 case 추가
    // case '새로운투자자':
    //   return data.newInvestorDispersionRatio;
    default:
      // 기본값으로 개인 분산비율 반환 (또는 에러 처리)
      console.warn(`Unknown investor type: ${investorType}, using 개인 dispersion ratio as fallback`);
      return data.indivDispersionRatio;
  }
};

// ===== 시리즈 생성 =====

/**
 * 라인 차트 시리즈를 생성하는 함수
 * @param name - 시리즈 이름
 * @param data - 시리즈 데이터
 * @param color - 라인 색상
 * @returns ECharts 시리즈 객체
 */
export const createLineSeries = (name: string, data: number[], color: string) => ({
  name,
  type: 'line' as const,
  data,
  smooth: true,
  showSymbol: false,
  lineStyle: {
    width: 2,
    color,
  },
  areaStyle: {
    opacity: 0.1,
    color,
  },
});
