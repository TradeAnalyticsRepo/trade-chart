import { TradeData } from '@/types/trade';

/**
 * 종가를 기준으로 가상의 OHLC 데이터 생성
 * @param closePrice - 종가
 * @returns [시가, 고가, 저가, 종가] 배열
 */
const generateOHLC = (closePrice: number): [number, number, number, number] => {
  const volatility = 0.02; // 2% 변동성
  const randomFactor = () => 1 + (Math.random() * 2 - 1) * volatility;

  const high = closePrice * randomFactor();
  const low = closePrice * randomFactor();
  const open = closePrice * randomFactor();

  return [open, Math.max(open, high, closePrice), Math.min(open, low, closePrice), closePrice];
};

/**
 * 날짜 배열 생성
 * @returns YYYY-MM-DD 형식의 날짜 배열
 */
export const generateDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

/**
 * 목업 데이터 생성
 * @param dates - 날짜 배열
 * @returns TradeData 배열
 */
export const generateMockData = (dates: string[]): TradeData[] => {
  const investors = ['개인', '외국인', '기관'];
  const baseConfig = {
    개인: { base: 1000, range: 500 },
    외국인: { base: 2000, range: 1000 },
    기관: { base: 1500, range: 800 },
  };

  const mockData: TradeData[] = [];
  let prevClosePrice = 50000; // 초기 종가

  dates.forEach((date) => {
    investors.forEach((investor) => {
      const config = baseConfig[investor as keyof typeof baseConfig];
      const baseAmount = config.base;
      const range = config.range;

      // 종가 생성 (이전 종가 기준으로 ±5% 변동)
      const priceChange = (Math.random() * 0.1 - 0.05) * prevClosePrice;
      const closePrice = Math.max(prevClosePrice + priceChange, 1000);
      prevClosePrice = closePrice;

      // OHLC 데이터 생성
      const [open, high, low, close] = generateOHLC(closePrice);

      // 거래량 생성
      const volume = baseAmount + Math.random() * range;
      const buyAmount = volume * (0.4 + Math.random() * 0.2);
      const sellAmount = volume - buyAmount;
      const netAmount = buyAmount - sellAmount;

      mockData.push({
        date,
        investor,
        buy_amt: (buyAmount * 100000000).toString(),
        sell_amt: (sellAmount * 100000000).toString(),
        net_amt: (netAmount * 100000000).toString(),
        close_price: close.toString(),
        open_price: open.toString(),
        high_price: high.toString(),
        low_price: low.toString(),
      });
    });
  });

  return mockData;
};
