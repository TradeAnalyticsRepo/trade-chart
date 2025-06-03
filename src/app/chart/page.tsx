'use client';

import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { TradeData } from '@/types/trade';
import { fetchTradeData, getApi } from '@/utils/api';
import { createChartOption, createChartSeries } from '@/utils/chartUtils';
import { log } from 'console';

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

const ChartControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  justify-content: center;
`;

const ControlButton = styled.button`
  padding: 0.7rem 1.5rem;
  border: 1px solid var(--foreground);
  border-radius: 8px;
  background: transparent;
  color: var(--foreground);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--foreground);
    color: var(--background);
    transform: translateY(-2px);
  }
`;

const AllChartsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
  const [data, setData] = useState<TradeData[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState('개인');
  const [showVolume, setShowVolume] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        getApi();
        setData(tradeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('데이터 조회 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getChartOption = (investor: string, showVolume: boolean = false) => {
    const dates = [...new Set(data.map((item) => item.date))];
    const investorData = data.filter((item) => item.investor === investor);

    // OHLC 데이터 생성
    const ohlcData = investorData.map((item) => [Number(item.open_price), Number(item.high_price), Number(item.low_price), Number(item.close_price)]);

    // 종가 데이터 (선 그래프용)
    const closePrices = investorData.map((item) => Number(item.close_price));
    const netAmounts = investorData.map((item) => Number(item.net_amt) / 100000000);
    const volumes = investorData.map((item) => (Number(item.buy_amt) + Number(item.sell_amt)) / 100000000);

    // Y축 최소/최대값 계산 (종가 기준)
    const minPrice = Math.min(...closePrices);
    const maxPrice = Math.max(...closePrices);
    const priceRange = maxPrice - minPrice;
    const yAxisMin = Math.floor(minPrice - priceRange * 0.1);
    const yAxisMax = Math.ceil(maxPrice + priceRange * 0.1);

    const series = showVolume
      ? [
          {
            name: '거래량',
            type: 'bar',
            data: volumes,
            itemStyle: {
              color: (params: any) => (netAmounts[params.dataIndex] >= 0 ? '#ff4d4f' : '#52c41a'),
            },
            opacity: 0.6,
          },
        ]
      : [
          {
            name: '주가',
            type: 'candlestick',
            data: ohlcData,
            itemStyle: {
              color: '#ff4d4f',
              color0: '#52c41a',
              borderColor: '#ff4d4f',
              borderColor0: '#52c41a',
            },
          },
          {
            name: '종가',
            type: 'line',
            data: closePrices,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              width: 2,
              color: '#1890ff',
            },
            z: 1,
          },
          createChartSeries('순매수', 'line', netAmounts, 1, {
            areaStyle: { opacity: 0.1 },
          }),
        ];

    return {
      ...createChartOption(showVolume ? `${investor} 거래량` : `${investor} 투자자 순매수 현황`, dates, series),
      backgroundColor: 'transparent',
      grid: {
        left: '5%',
        right: '8%',
        bottom: showVolume ? '15%' : '25%',
        top: '15%',
        containLabel: true,
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          bottom: showVolume ? 0 : '10%',
          height: 20,
          borderColor: 'transparent',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          fillerColor: 'rgba(255, 255, 255, 0.1)',
          handleStyle: {
            color: '#fff',
            borderColor: '#fff',
          },
          moveHandleStyle: {
            color: '#fff',
            borderColor: '#fff',
          },
          selectedDataBackground: {
            lineStyle: {
              color: '#fff',
            },
            areaStyle: {
              color: '#fff',
              opacity: 0.1,
            },
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

            const prevDate = new Date(dates[dates.indexOf(value) - 1] || '');
            const showYear = !prevDate || prevDate.getFullYear() !== year || prevDate.getMonth() !== date.getMonth();

            return showYear ? `${year}/${month}/${day}` : `${month}/${day}`;
          },
          interval: Math.floor(dates.length / 20),
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
      yAxis: showVolume
        ? [
            {
              type: 'value',
              name: '거래량(억원)',
              position: 'left',
              axisLabel: {
                formatter: '{value}억',
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
          ]
        : [
            {
              type: 'value',
              name: '종가(원)',
              position: 'left',
              min: yAxisMin,
              max: yAxisMax,
              axisLabel: {
                formatter: (value: number) => {
                  if (value >= 100000000) {
                    return (value / 100000000).toFixed(1) + '억';
                  } else if (value >= 10000) {
                    return (value / 10000).toFixed(0) + '만';
                  }
                  return value.toLocaleString();
                },
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
            {
              type: 'value',
              name: '순매수(억원)',
              position: 'right',
              offset: 80,
              axisLabel: {
                formatter: '{value}억',
                color: '#fff',
                margin: 20,
              },
              nameTextStyle: {
                color: '#fff',
                padding: [0, 40, 0, 0],
              },
              splitLine: {
                show: false,
              },
            },
          ],
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
          const date = new Date(params[0].axisValue);
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          let result = `${formattedDate}<br/>`;

          if (!showVolume) {
            // 캔들 데이터 포맷팅
            const candleData = params[0].data;
            result += `시가: ${Number(candleData[0]).toLocaleString()}원<br/>`;
            result += `고가: ${Number(candleData[1]).toLocaleString()}원<br/>`;
            result += `저가: ${Number(candleData[2]).toLocaleString()}원<br/>`;
            result += `종가: ${Number(candleData[3]).toLocaleString()}원<br/>`;

            // 순매수 데이터 포맷팅
            params.slice(2).forEach((param: any) => {
              const value = Number(param.value).toLocaleString();
              result += `${param.seriesName}: ${value}억원<br/>`;
            });
          } else {
            // 거래량 데이터 포맷팅
            params.forEach((param: any) => {
              const value = Number(param.value).toLocaleString();
              result += `${param.seriesName}: ${value}억원<br/>`;
            });
          }

          return result;
        },
      },
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

  return (
    <ChartContainer>
      <ChartTitle>투자자별 순매수 현황</ChartTitle>

      {/* 전체 차트 섹션 */}
      <ChartSection>
        <SectionTitle>전체 투자자 현황</SectionTitle>
        <AllChartsContainer>
          {['개인', '외국인', '기관'].map((investor) => (
            <InvestorChartContainer key={investor}>
              <ChartLabel>
                <ChartIndicator color='#1890ff' />
                {investor} 투자자
              </ChartLabel>
              <ChartWrapper>
                <ReactECharts
                  option={getChartOption(investor)}
                  style={{ height: '300px', width: '100%' }}
                />
              </ChartWrapper>
              <ChartLabel>
                <ChartIndicator color='#52c41a' />
                {investor} 거래량
              </ChartLabel>
              <ChartWrapper>
                <ReactECharts
                  option={getChartOption(investor, true)}
                  style={{ height: '200px', width: '100%' }}
                />
              </ChartWrapper>
            </InvestorChartContainer>
          ))}
        </AllChartsContainer>
      </ChartSection>

      {/* 개별 차트 섹션 */}
      <ChartSection>
        <SectionTitle>상세 투자자 현황</SectionTitle>
        <ChartControls>
          {['개인', '외국인', '기관'].map((investor) => (
            <ControlButton
              key={investor}
              onClick={() => setSelectedInvestor(investor)}
              style={{
                backgroundColor: selectedInvestor === investor ? 'var(--foreground)' : 'transparent',
                color: selectedInvestor === investor ? 'var(--background)' : 'var(--foreground)',
              }}>
              {investor}
            </ControlButton>
          ))}
        </ChartControls>
        <InvestorChartContainer>
          <ChartLabel>
            <ChartIndicator color='#1890ff' />
            {selectedInvestor} 투자자 주가 및 순매수
          </ChartLabel>
          <ChartWrapper>
            <ReactECharts
              option={getChartOption(selectedInvestor)}
              style={{ height: '400px', width: '100%' }}
            />
          </ChartWrapper>
          <ChartLabel>
            <ChartIndicator color='#52c41a' />
            {selectedInvestor} 투자자 거래량
          </ChartLabel>
          <ChartWrapper>
            <ReactECharts
              option={getChartOption(selectedInvestor, true)}
              style={{ height: '200px', width: '100%' }}
            />
          </ChartWrapper>
        </InvestorChartContainer>
      </ChartSection>
    </ChartContainer>
  );
}
