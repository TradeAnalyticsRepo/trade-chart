import axios from 'axios';
import { ApiResponse, TradeData } from '@/types/trade';
import { generateDates, generateMockData } from './mockData';

// const BASE_URL = '/api/trade';



export const getApi = async () => {
  const res = await axios.get('/api/trade', {
    params: {
      FID_COND_MRKT_DIV_CODE: 'J',
      FID_INPUT_ISCD: '005930', // 삼성전자
      FID_INPUT_DATE_1: '20250101',
      FID_INPUT_DATE_2: '20250501',
      FID_PERIOD_DIV_CODE: 'D',
      FID_ORG_ADJ_PRC: '1'
    },
  });

  console.log('📈 차트 데이터:', res.data);
};
/**
 * API 응답 데이터를 TradeData 형식으로 변환
 * @param response - API 응답 데이터
 * @returns 변환된 TradeData 배열
 */
export const transformApiResponse = (response: ApiResponse): TradeData[] => {
  if (response.rt_cd !== '0') {
    throw new Error('API 응답 오류');
  }
  return response.output;
};

/**
 * 투자자별 거래 데이터를 가져오는 함수
 * @param startDate - 시작 날짜 (YYYYMMDD)
 * @param endDate - 종료 날짜 (YYYYMMDD)
 * @returns Promise<TradeData[]>
 */
export const fetchTradeData = async (startDate: string, endDate: string): Promise<TradeData[]> => {
  try {
    // 실제 API 호출 대신 목업 데이터 생성
    const dates = generateDates();
    const mockData = generateMockData(dates);

    // API 응답 형식으로 변환
    const mockResponse: ApiResponse = {
      rt_cd: '0',
      output: mockData,
    };

    // 실제 API 호출처럼 지연 시간 추가
    await new Promise((resolve) => setTimeout(resolve, 500));

    return transformApiResponse(mockResponse);
  } catch (error) {
    console.error('데이터 조회 중 오류 발생:', error);
    throw error;
  }
};
