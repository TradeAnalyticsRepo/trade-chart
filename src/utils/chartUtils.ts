import { ChartOption, ChartSeries } from '@/types/trade';

/**
 * 날짜를 MM/DD 형식으로 변환
 * @param dateString - 변환할 날짜 문자열 (YYYY-MM-DD 형식)
 * @returns MM/DD 형식의 날짜 문자열
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 * @param dateString - 변환할 날짜 문자열
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * 차트 시리즈 데이터 생성
 * @param name - 시리즈 이름
 * @param type - 차트 타입
 * @param data - 데이터 배열
 * @param yAxisIndex - Y축 인덱스
 * @param options - 추가 옵션
 * @returns 차트 시리즈 객체
 */
export const createChartSeries = (
  name: string,
  type: string,
  data: number[],
  yAxisIndex?: number,
  options: Partial<ChartSeries> = {}
): ChartSeries => ({
  name,
  type,
  data,
  yAxisIndex,
  smooth: true,
  showSymbol: false,
  lineStyle: {
    width: 2,
  },
  ...options,
});

/**
 * 차트 기본 옵션 생성
 * @param title - 차트 제목
 * @param dates - 날짜 배열
 * @param series - 시리즈 데이터 배열
 * @returns 차트 옵션 객체
 */

// export const createChartOption = (title: string, dates: string[], series: ChartSeries[]): ChartOption => ({
//   title: {
//     text: title,
//     left: 'center',
//     textStyle: {
//       color: 'var(--foreground)',
//     },
//   },
//   tooltip: {
//     trigger: 'axis',
//     axisPointer: {
//       type: 'cross',
//     },
//     formatter: (params: any) => {
//       const date = new Date(params[0].axisValue);
//       const formattedDate = formatFullDate(date.toISOString());
//       let result = `${formattedDate}<br/>`;
//       params.forEach((param: any) => {
//         const value = Number(param.value).toLocaleString();
//         const unit = param.seriesName === '종가' ? '원' : '억원';
//         result += `${param.seriesName}: ${value}${unit}<br/>`;
//       });
//       return result;
//     },
//   },
//   legend: {
//     data: series.map((s) => s.name),
//     top: 30,
//     textStyle: {
//       color: 'var(--foreground)',
//     },
//   },
//   grid: {
//     left: '3%',
//     right: '4%',
//     bottom: '15%',
//     top: '15%',
//     containLabel: true,
//   },
//   dataZoom: [
//     {
//       type: 'inside',
//       start: 0,
//       end: 100,
//     },
//     {
//       type: 'slider',
//       start: 0,
//       end: 100,
//       bottom: 0,
//     },
//   ],
//   xAxis: {
//     type: 'category',
//     data: dates,
//     axisLabel: {
//       color: 'var(--foreground)',
//       formatter: formatDate,
//       interval: Math.floor(dates.length / 20),
//       rotate: 45,
//     },
//   },
//   yAxis: [
//     {
//       type: 'value',
//       name: '순매수(억원)',
//       position: 'left',
//       axisLabel: {
//         formatter: '{value}억',
//         color: 'var(--foreground)',
//       },
//       nameTextStyle: {
//         color: 'var(--foreground)',
//       },
//       splitLine: {
//         lineStyle: {
//           color: 'var(--foreground)',
//           opacity: 0.1,
//         },
//       },
//     },
//     {
//       type: 'value',
//       name: '종가(원)',
//       position: 'right',
//       offset: 80,
//       axisLabel: {
//         formatter: '{value}원',
//         color: 'var(--foreground)',
//       },
//       nameTextStyle: {
//         color: 'var(--foreground)',
//       },
//       splitLine: {
//         show: false,
//       },
//     },
//     {
//       type: 'value',
//       name: '거래량(억원)',
//       position: 'right',
//       axisLabel: {
//         formatter: '{value}억',
//         color: 'var(--foreground)',
//       },
//       nameTextStyle: {
//         color: 'var(--foreground)',
//       },
//       splitLine: {
//         show: false,
//       },
//     },
//   ],
//   series,
// });
