/**
 * Next.js API Routes 기반 프록시 서버 구조
 * 
 * API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/tokenManager';
import axios from 'axios';
import { BASE_URL, KIS_URL, KisRequestHeaders } from '@/types/url';


/**
 * 국내기관_외국인_매매종목가집계
 * @link https://apiportal.koreainvestment.com/apiservice-apiservice?/uapi/domestic-stock/v1/quotations/foreign-institution-total
 */
export async function GET(req: NextRequest): Promise<NextResponse<ForeignInstitutionTotalResponse>> {
    try {
        const { tokenType, token } = await getToken();
        const { searchParams } = new URL(req.url);
        
        const url = `${BASE_URL}${KIS_URL.국내기관_외국인_매매종목가집계}`
        const params =  {
            FID_COND_MRKT_DIV_CODE: searchParams.get('FID_COND_MRKT_DIV_CODE') ?? 'J',
            FID_INPUT_ISCD: searchParams.get('FID_INPUT_ISCD') ?? '0000',
        } as ForeignInstitutionTotalParams
        
        console.log(`URL :`, url)
        console.log(`URL :`, params)

        const result = await axios.get(
            url
            , {
            headers: {
                Authorization: `${tokenType} ${token}`,
                "Content-Type": 'application/json; charset=utf-8',
                tr_id: 'FHPTJ04400000',
                custtype: 'P',
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
        }, { status: 500 });
    }
}