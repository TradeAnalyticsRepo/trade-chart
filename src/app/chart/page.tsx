"use client";

import ReactECharts from "echarts-for-react";
import { useEffect, useRef, useState } from "react";
import { ExcelData, TradeData } from "@/types/trade";
import {
  createCommonChartOptions,
  createLineSeries,
  calculateYAxisRange,
  extractInvestorData,
  extractDispersionRatio,
  getInvestorColor,
  InvestorType,
  INVESTOR_COLORS,
} from "@/utils/chartConfig";
import axios from "axios";
import {
  AllChartsContainer,
  ChartContainer,
  ChartIndicator,
  ChartLabel,
  ChartSection,
  ChartTitle,
  ChartWrapper,
  InvestorChartContainer,
  ToggleButton,
} from "@/ui/ui";
import ExcelUploadButton from "@/components/ExcelUploadButton";

// ===== 스타일 컴포넌트 =====

/**
 * 투자자별 순매수 현황을 보여주는 차트 컴포넌트
 *
 * 주요 기능:
 * - 개인/외국인/기관 투자자 매집수량 통합 차트
 * - 각 투자자별 개별 차트
 * - 동적 줌 및 날짜 표시 간격 조정
 * - ECharts legend를 통한 그래프 온오프 기능
 */
export default function ChartPage() {
  // ===== 상태 관리 =====

  /** Excel에서 가져온 투자자별 매집수량 데이터 */
  const [jsonData, setJsonData] = useState<ExcelData[]>([]);

  /** 데이터 로딩 상태 */
  const [isLoading, setIsLoading] = useState(false);

  /** 에러 메시지 */
  const [error, setError] = useState<string | null>(null);

  // ===== 데이터 로딩 =====

  useEffect(() => {
    /**
     * Excel 데이터를 API에서 가져오는 함수
     * 차트용 데이터를 가져옴
     */
    const getJsonData = async () => {
      let res = await axios.get(`/api/excel?stockId=11111&type=graph`);
      res = await res.data;

      const excelData: ExcelData[] = res.data;

      console.log(excelData);
      setJsonData(excelData);
    };
    getJsonData();
  }, []);

  // ===== 데이터 전처리 =====

  /**
   * 공통 데이터 전처리 함수
   * @returns 정렬된 데이터와 날짜 배열
   */
  const getProcessedData = () => {
    /** 날짜순으로 정렬된 데이터 (최신이 뒤로) */
    // const sortedData = jsonData.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));
    const sortedData = jsonData;

    /** 차트 X축에 사용할 날짜 배열 */
    const dates = sortedData.map((item) => item.tradeDate).sort((a, b) => a.localeCompare(b));

    console.debug("dates length:", dates.length);
    console.debug("last date:", dates[dates.length - 1]);

    return {
      sortedData,
      dates,
    };
  };

  // ===== 투자자별 차트 설정 =====

  /** 투자자별 차트 설정 배열 */
  const investorChartConfigs = [
    {
      key: "통합",
      label: "개인/외국인/기관 투자자",
      color: INVESTOR_COLORS.개인,
      types: ["개인", "외국인", "기관"] as InvestorType[],
      title: "개인/외국인/기관 투자자 매집수량",
      height: "300px",
    },
    {
      key: "개인",
      label: "개인 투자자",
      color: INVESTOR_COLORS.개인,
      types: ["개인"] as InvestorType[],
      title: "개인 투자자 매집수량",
      height: "250px",
    },
    {
      key: "외국인",
      label: "외국인 투자자",
      color: INVESTOR_COLORS.외국인,
      types: ["외국인"] as InvestorType[],
      title: "외국인 투자자 매집수량",
      height: "250px",
    },
    {
      key: "기관",
      label: "기관 투자자",
      color: INVESTOR_COLORS.기관,
      types: ["기관"] as InvestorType[],
      title: "기관 투자자 매집수량",
      height: "250px",
    },
  ];

  // ===== 차트 생성 함수들 =====

  /**
   * 통합 차트 생성 함수
   * 개별 투자자 차트와 통합 차트를 모두 처리할 수 있는 범용 함수
   *
   * @param investorTypes - 표시할 투자자 유형 배열 (빈 배열이면 모든 투자자 표시)
   * @param title - 차트 제목
   * @param height - 차트 높이 (기본값: '250px')
   * @returns ECharts 옵션 객체
   */
  const createInvestorChart = (investorTypes: InvestorType[] = [], title: string = "투자자 매집수량", height: string = "250px") => {
    const { sortedData, dates } = getProcessedData();

    // ===== 투자자별 매집수량 데이터 추출 =====

    /** 표시할 투자자 유형 결정 (빈 배열이면 모든 투자자) */
    const typesToShow: InvestorType[] = investorTypes.length > 0 ? investorTypes : ["개인", "외국인", "기관"];

    /** 각 투자자별 데이터 배열 */
    const allData = typesToShow.map((type) => extractInvestorData(sortedData, type));

    // ===== Y축 범위 계산 =====

    /** Y축 범위 계산 */
    const yAxisRange = calculateYAxisRange(allData);

    // ===== 줌 설정 =====

    /** 줌 시작 위치 (0 = 전체 데이터 시작) */
    const zoomStart = 0;

    /** 줌 끝 위치 (100 = 전체 데이터 끝) */
    const zoomEnd = 100;

    // ===== 차트 시리즈 데이터 =====

    /** 차트에 표시할 시리즈 배열 */
    const series = typesToShow.map((type) => createLineSeries(`${type} 매집수량`, extractInvestorData(sortedData, type), getInvestorColor(type)));

    // ===== 범례 데이터 =====

    /** 범례 데이터 (개별 차트일 때는 범례 없음) */
    const legendData = typesToShow.length > 1 ? typesToShow.map((type) => `${type} 매집수량`) : undefined;

    // ===== 공통 차트 옵션 생성 =====

    /** 기본 차트 옵션 */
    const baseOptions = createCommonChartOptions(title, dates, zoomStart, zoomEnd, yAxisRange, legendData, {
      showSlider: false, // 슬라이더 숨기기 (마우스 휠 줌만 사용)
      showInsideZoom: true, // 마우스 휠 줌 활성화
      gridBottom: "25%", // 슬라이더 없을 때 하단 여백 늘리기
    });

    // ===== 툴팁 커스터마이징 =====

    /** 커스텀 툴팁 포맷터 */
    const customTooltipFormatter = (params: any) => {
      const date = params[0].axisValue;
      const dataIndex = dates.indexOf(date);
      const data = sortedData[dataIndex];

      let result = `${date}<br/>`;

      // ===== 각 투자자별 정보 추가 =====
      params.forEach((param: any) => {
        const seriesName = param.seriesName;
        const investorType = seriesName.replace(" 매집수량", "");

        result += `${seriesName}: ${Number(param.value).toLocaleString()}<br/>`;

        /** 투자자 타입에 따른 분산비율 추출 */
        const dispersionRatio = extractDispersionRatio(data, investorType);
        result += `${investorType} 분산비율: ${dispersionRatio}%<br/>`;
      });

      /** 공통 정보 */
      result += `종가: ${Number(data.endMount).toLocaleString()}원<br/>`;
      result += `전일대비: ${data.previousDayComparison}%<br/>`;

      return result;
    };

    // ===== 최종 차트 옵션 반환 =====
    return {
      ...baseOptions,
      tooltip: {
        ...baseOptions.tooltip,
        formatter: customTooltipFormatter,
      },
      series,
    };
  };

  // ===== 로딩 상태 처리 =====

  if (isLoading) {
    return (
      <ChartContainer>
        <ChartTitle>데이터를 불러오는 중...</ChartTitle>
      </ChartContainer>
    );
  }

  // ===== 에러 상태 처리 =====

  if (error) {
    return (
      <ChartContainer>
        <ChartTitle>오류 발생</ChartTitle>
        <div
          style={{
            color: "red",
            textAlign: "center",
          }}>
          {error}
        </div>
      </ChartContainer>
    );
  }

  // ===== 이벤트 핸들러 =====

  // ===== 렌더링 =====

  return (
    <ChartContainer>
      <ExcelUploadButton />
      {/* ===== 차트 섹션 ===== */}
      <ChartSection>
        <AllChartsContainer>
          {investorChartConfigs.map((config) => (
            <InvestorChartContainer key={config.key}>
              <ChartLabel>
                <ChartIndicator color={config.color} />
                {config.label}
              </ChartLabel>
              <ChartWrapper>
                <ReactECharts
                  option={createInvestorChart(config.types, config.title, config.height)}
                  style={{
                    height: config.height,
                    width: "100%",
                  }}
                />
              </ChartWrapper>
            </InvestorChartContainer>
          ))}
        </AllChartsContainer>
      </ChartSection>
    </ChartContainer>
  );
}
