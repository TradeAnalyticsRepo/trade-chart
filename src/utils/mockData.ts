import { TradeData } from '../types/trade';

// 1년치 날짜 생성 함수
export const generateDates = () => {
  const dates = [];
  const today = new Date();

  // 1년치 날짜 생성 (오늘부터 1년 전까지)
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dates.push(dateStr);
  }

  // 날짜를 오래된 순서대로 정렬
  dates.sort();

  console.log('Generated dates:', {
    count: dates.length,
    first: dates[0],
    last: dates[dates.length - 1],
  });

  return dates;
};

// 가상 데이터 생성 함수
export const generateMockData = (dates: string[]): TradeData[] => {
  const investors = ['개인', '외국인', '기관'];
  const data: TradeData[] = [];

  // 각 투자자별 기본 설정
  const baseConfig = {
    개인: {
      base: 1000, // 기본 1000억
      range: 500, // ±500억 변동
    },
    외국인: {
      base: 1500, // 기본 1500억
      range: 800, // ±800억 변동
    },
    기관: {
      base: 1200, // 기본 1200억
      range: 600, // ±600억 변동
    },
  };

  // 각 날짜에 대해 데이터 생성
  dates.forEach((date, dateIndex) => {
    investors.forEach((investor) => {
      const config = baseConfig[investor as keyof typeof baseConfig];

      // 기본 금액에서 랜덤 변동
      const baseAmount = config.base + (Math.random() * config.range * 2 - config.range);

      // 매수/매도 금액 계산 (억 단위)
      const buyAmount = Math.floor(baseAmount * (0.8 + Math.random() * 0.4));
      const sellAmount = Math.floor(baseAmount * (0.7 + Math.random() * 0.4));
      const netAmount = buyAmount - sellAmount;

      // 종가 계산 (기본값 70000원에서 변동)
      const closePrice = Math.floor(70000 + Math.random() * 10000).toString();

      data.push({
        date,
        investor,
        buy_amt: (buyAmount * 100000000).toString(), // 억 -> 원 변환
        sell_amt: (sellAmount * 100000000).toString(), // 억 -> 원 변환
        net_amt: (netAmount * 100000000).toString(), // 억 -> 원 변환
        close_price: closePrice,
      });
    });
  });

  // 데이터 정렬 (날짜순)
  data.sort((a, b) => a.date.localeCompare(b.date));

  console.log('Generated data:', {
    totalCount: data.length,
    uniqueDates: [...new Set(data.map((item) => item.date))].length,
    sampleData: data.slice(0, 3),
    lastData: data.slice(-3),
  });

  return data;
};
