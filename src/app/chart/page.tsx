'use client';

import ReactECharts from 'echarts-for-react';
import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { ExcelData, TradeData } from '@/types/trade';
import { fetchTradeData, getApi } from '@/utils/api';
import { createChartSeries } from '@/utils/chartUtils';
import { handleExcel } from '@/utils/excelUtils';
import axios from 'axios';
import { json } from 'stream/consumers';

const ToggleButton = styled.button`
  width: 80px;
`;

const ChartContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--background);
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const ChartWrapper = styled.div`
  width: 100%;
  background-color: var(--background);
  border: 1px solid var(--foreground);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ChartTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--foreground);
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const AllChartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ChartSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h2`
  color: var(--foreground);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  padding: 0 1rem;
  border-left: 4px solid var(--foreground);
`;

const InvestorChartContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
`;

const ChartLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--foreground);
  font-size: 1.1rem;
  font-weight: 500;
`;

const ChartIndicator = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`;

/**
 * 투자자별 순매수 현황을 보여주는 차트 컴포넌트
 */
export default function ChartPage() {
  const [jsonData, setJsonData] = useState<ExcelData[]>([]);
  const [showVolume, setShowVolume] = useState<boolean>(false);
  const [data, setData] = useState<TradeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toggleTradeMountChart, setToggleTradeMountChart] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);

        const formattedStartDate = startDate.toISOString().slice(0, 10).replace(/-/g, '');
        const formattedEndDate = endDate.toISOString().slice(0, 10).replace(/-/g, '');

        const tradeData = await fetchTradeData(formattedStartDate, formattedEndDate);
        console.debug('tradeData:', tradeData);

        getApi();
        setData(tradeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('데이터 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const getJsonData = async () => {
      let res = await axios.get(`/api/excel?stockId=11111&type=graph`);
      res = await res.data;

      const excelData: ExcelData[] = res.data;

      setJsonData(excelData);
    };

    getJsonData();
    fetchData();
  }, []);
  const getTestChart = (investor: string, showVolume: boolean = false) => {
    // ExcelData를 날짜순으로 정렬 (최신이 뒤로)
    const sortedData = jsonData.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));
    const dates = sortedData.map((item) => item.tradeDate);

    console.debug('dates length:', dates.length);
    console.debug('last date:', dates[dates.length - 1]);

    // 개인 매집수량 데이터
    const collectionData = sortedData.map((item) => item.indivCollectionVolume);

    // Y축 최소/최대값 계산
    const minValue = Math.min(...collectionData);
    const maxValue = Math.max(...collectionData);
    const valueRange = maxValue - minValue;
    const yAxisMin = Math.floor(minValue - valueRange * 0.1);
    const yAxisMax = Math.ceil(maxValue + valueRange * 0.1);

    // 최초 줌 상태를 전체 데이터로 설정
    const zoomStart = 0;
    const zoomEnd = 100;

    const series = [
      {
        name: '개인 매집수량',
        type: 'line',
        data: collectionData,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#1890ff',
        },
        areaStyle: {
          opacity: 0.1,
          color: '#1890ff',
        },
      },
    ];

    return {
      title: {
        text: '개인 투자자 매집수량',
        left: 'center',
        textStyle: {
          color: 'var(--foreground)',
        },
      },
      backgroundColor: 'transparent',
      grid: {
        left: '5%',
        right: '8%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
      dataZoom: [
        {
          type: 'inside',
          start: zoomStart,
          end: zoomEnd,
        },
        {
          type: 'slider',
          start: zoomStart,
          end: zoomEnd,
          bottom: '5%',
          height: 20,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          fillerColor: 'rgba(255, 255, 255, 0.1)',
          handleStyle: {
            color: '#1890ff',
          },
          textStyle: {
            color: '#fff',
          },
        },
      ],
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          color: '#fff',
          formatter: (value: string) => {
            const date = new Date(value);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            return `${year}/${month}/${day}`;
          },
          interval: (index: number, value: string) => {
            // 전체 데이터 개수
            const totalDataCount = dates.length;

            // 현재 표시되는 데이터 개수를 추정 (줌 레벨에 따라)
            const zoomRange = zoomEnd - zoomStart;
            const estimatedVisibleCount = Math.ceil((zoomRange / 100) * totalDataCount);

            // 최초 로드 시 (전체 데이터 보기) - 마지막과 최신 일자는 항상 표시
            if (zoomRange >= 95) {
              // 전체 데이터가 보일 때는 간격을 더 크게
              if (index % 50 === 0 || index === 0 || index === totalDataCount - 1) {
                return true;
              }
              return false;
            }

            // 확대된 상태에 따라 간격 조정
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
          },
          rotate: 45,
          margin: 15,
        },
        axisLine: {
          lineStyle: {
            color: '#fff',
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        name: '매집수량',
        position: 'left',
        min: yAxisMin,
        max: yAxisMax,
        axisLabel: {
          formatter: '{value}',
          color: '#fff',
          margin: 20,
        },
        nameTextStyle: {
          color: '#fff',
          padding: [0, 0, 0, 40],
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textStyle: {
          color: '#fff',
        },
        formatter: (params: any) => {
          const date = params[0].axisValue;
          const dataIndex = dates.indexOf(date);
          const data = sortedData[dataIndex];

          let result = `${date}<br/>`;
          result += `매집수량: ${Number(params[0].value).toLocaleString()}<br/>`;
          result += `종가: ${Number(data.endMount).toLocaleString()}원<br/>`;
          result += `전일대비: ${data.previousDayComparison}%<br/>`;

          return result;
        },
      },
      series: series,
    };
  };

  if (isLoading) {
    return (
      <ChartContainer>
        <ChartTitle>데이터를 불러오는 중...</ChartTitle>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer>
        <ChartTitle>오류 발생</ChartTitle>
        <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
      </ChartContainer>
    );
  }

  // 엑셀업로드 버튼 클릭 시 엑셀데이터 업로드
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      handleExcel(file);
    } catch (err) {}
  };

  return (
    <ChartContainer>
      {/* <ChartTitle>투자자별 순매수 현황</ChartTitle> */}
      <ToggleButton
        onClick={() => {
          setToggleTradeMountChart(!toggleTradeMountChart);
        }}>
        거래량
      </ToggleButton>
      <ToggleButton
        onClick={() => {
          fileInputRef.current?.click();
        }}>
        엑셀업로드
        <input
          type='file'
          accept='.xlsx, .xls'
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleExcelUpload}
        />
      </ToggleButton>

      {/* 전체 차트 섹션 */}
      <ChartSection>
        {/* <SectionTitle>전체 투자자 현황</SectionTitle> */}
        <AllChartsContainer>
          <InvestorChartContainer key={''}>
            <ChartLabel>
              <ChartIndicator color='#1890ff' />
              개인 투자자
            </ChartLabel>
            <ChartWrapper>
              <ReactECharts
                option={getTestChart('개인', false)}
                style={{ height: '300px', width: '100%' }}
              />

              {/* {toggleTradeMountChart && (
                <ReactECharts
                  option={getChartOption(investor, true)}
                  style={{ height: '200px', width: '100%' }}
                />
              )} */}
            </ChartWrapper>
          </InvestorChartContainer>
        </AllChartsContainer>
      </ChartSection>
    </ChartContainer>
  );
}
