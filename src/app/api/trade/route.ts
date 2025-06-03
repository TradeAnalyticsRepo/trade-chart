/**
 * Next.js API Routes 기반 프록시 서버 구조
 * 
 * API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/tokenManager';
import axios from 'axios';

export async function GET(req: NextRequest) {
    try {
        const { tokenType, token } = await getToken();
        const { searchParams } = new URL(req.url);

        const FID_COND_MRKT_DIV_CODE = searchParams.get('FID_COND_MRKT_DIV_CODE');
        const FID_INPUT_ISCD = searchParams.get('FID_INPUT_ISCD'); // 종목코드
        const FID_INPUT_DATE_1 = searchParams.get('FID_INPUT_DATE_1');
        const FID_INPUT_DATE_2 = searchParams.get('FID_INPUT_DATE_2');
        const FID_PERIOD_DIV_CODE = searchParams.get('FID_PERIOD_DIV_CODE') ?? 'D'; // 일봉 등
        const FID_ORG_ADJ_PRC = searchParams.get('FID_ORG_ADJ_PRC') ?? '0'; // 수정주가 여부
        

        const result = await axios.get(
            'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice'
            , {
            headers: {
                Authorization: `${tokenType} ${token}`,
                "Content-Type": 'application/json; charset=utf-8',
                tr_id: 'FHKST03010100',
                custtype: 'P',
                appkey: process.env.APP_KEY,
                appsecret: process.env.APP_SECRET,
            },
            params : {
                FID_COND_MRKT_DIV_CODE,
                FID_INPUT_ISCD,
                FID_INPUT_DATE_1,
                FID_INPUT_DATE_2,
                FID_PERIOD_DIV_CODE,
                FID_ORG_ADJ_PRC
            }
        });

        console.log('Get result =>', result.data);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[GET ERROR]", error);
        return NextResponse.json({ error: "GET 요청 실패", message: error.message }, { status: 500 });
    }
}