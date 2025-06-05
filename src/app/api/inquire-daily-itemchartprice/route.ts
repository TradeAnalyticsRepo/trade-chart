/**
 * Next.js API Routes 기반 프록시 서버 구조
 * 
 * API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken,  } from '@/lib/tokenManager';
import axios from 'axios';
import { BASE_URL, KIS_URL, KisRequestHeaders } from '@/types/url';
import { InquireDailyItemChartPriceParams, InquireDailyItemChartPriceResponse } from '@/types/국내주식기간별시세';

/**
 * 국내주식기간별시세
 * @link https://apiportal.koreainvestment.com/apiservice-apiservice?/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice
 */
export async function GET(req: NextRequest): Promise<NextResponse<InquireDailyItemChartPriceResponse>> {
    try {
        const { tokenType, token } = await getToken();
        const { searchParams } = new URL(req.url);
        
        const params =  {
            FID_COND_MRKT_DIV_CODE: searchParams.get('FID_COND_MRKT_DIV_CODE') ?? 'J',
            FID_INPUT_ISCD: searchParams.get('FID_INPUT_ISCD') ?? '',
            FID_INPUT_DATE_1: searchParams.get('FID_INPUT_DATE_1') ?? '',
            FID_INPUT_DATE_2: searchParams.get('FID_INPUT_DATE_2') ?? '',
            FID_PERIOD_DIV_CODE: searchParams.get('FID_PERIOD_DIV_CODE') ?? 'D',
            FID_ORG_ADJ_PRC: searchParams.get('FID_ORG_ADJ_PRC') ?? '0',
        } as InquireDailyItemChartPriceParams
        
        console.log(`URL : ${BASE_URL}${KIS_URL.국내주식기간별시세}`)
        const result = await axios.get(
            `${BASE_URL}${KIS_URL.국내주식기간별시세}`
            , {
            headers: {
                Authorization: `${tokenType} ${token}`,
                "Content-Type": 'application/json; charset=utf-8',
                tr_id: 'FHKST03010100',
                custtype: 'P',
                tr_cont: 'N',
                appkey: process.env.APP_KEY,
                appsecret: process.env.APP_SECRET,
            } as KisRequestHeaders,
            params
        });

        // console.log('Get result =>', result.data);
        return NextResponse.json(result.data);
    } catch (error: any) {
        console.error("[GET ERROR]", error);
        // return NextResponse.json({ error: "GET 요청 실패", message: error.message }, { status: 500 });
        return NextResponse.json({
            rt_cd: '999',
            msg_cd: '999',
            msg1: 'GET 요청 실패',
            output: null,
            output2: null
        }, { status: 500 });
    }
}