'use client';

import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { TradeData } from '@/types/trade';
import { generateDates, generateMockData } from '@/utils/mockData';
import { createChartOption, createChartSeries } from '@/utils/chartUtils';

const ChartContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--background);
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ChartWrapper = styled.div`
  width: 100%;
  background-color: var(--background);
  border: 1px solid var(--foreground);
  border-radius: 8px;
  padding: 1rem;
  min-height: 600px;
`;

const ChartTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--foreground);
  font-size: 1.5rem;
  font-weight: 600;
`;

const ChartControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
`;

const ControlButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid var(--foreground);
  border-radius: 4px;
  background: transparent;
  color: var(--foreground);
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: var(--foreground);
    color: var(--background);
  }
`;

/**
 * 투자자별 순매수 현황을 보여주는 차트 컴포넌트
 */
export default function ChartPage() {
  const [data, setData] = useState<TradeData[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState('개인');
  const [showVolume, setShowVolume] = useState(true);

  useEffect(() => {
    const dates = generateDates();
    const mockData = generateMockData(dates);
    setData(mockData);
  }, []);

  const getChartOption = () => {
    const dates = [...new Set(data.map((item) => item.date))];
    const investorData = data.filter((item) => item.investor === selectedInvestor);

    const netAmounts = investorData.map((item) => Number(item.net_amt) / 100000000);
    const volumes = investorData.map((item) => (Number(item.buy_amt) + Number(item.sell_amt)) / 100000000);
    const closePrices = investorData.map((item) => Number(item.close_price));

    const series = [
      createChartSeries('순매수', 'line', netAmounts, 0, {
        areaStyle: { opacity: 0.1 },
      }),
      createChartSeries('종가', 'line', closePrices, 1),
      createChartSeries('거래량', 'bar', volumes, 2, {
        itemStyle: {
          color: (params: any) => (netAmounts[params.dataIndex] >= 0 ? '#ff4d4f' : '#52c41a'),
        },
        opacity: 0.6,
      }),
    ];

    return createChartOption(`${selectedInvestor} 투자자 순매수 현황`, dates, series);
  };

  return (
    <ChartContainer>
      <ChartTitle>투자자별 순매수 현황</ChartTitle>
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
        <ControlButton
          onClick={() => setShowVolume(!showVolume)}
          style={{
            backgroundColor: showVolume ? 'var(--foreground)' : 'transparent',
            color: showVolume ? 'var(--background)' : 'var(--foreground)',
          }}>
          거래량
        </ControlButton>
      </ChartControls>
      <ChartWrapper>
        <ReactECharts
          option={getChartOption()}
          style={{ height: '600px', width: '100%' }}
        />
      </ChartWrapper>
    </ChartContainer>
  );
}
