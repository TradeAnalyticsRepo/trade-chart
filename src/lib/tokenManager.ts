/**
 * Next.js API Routes 기반 프록시 서버 구조
 * 
 * 토큰 캐싱 유틸 -> 파일 시스템을 사용한 토큰 저장
 * 1일 1회 발급 제한
 */

import fs from 'fs/promises';
import path from 'path';

const TOKEN_FILE = path.join(process.cwd(), 'token.json');

interface TokenData {
    tokenType: string;
    token: string;
    expiresAt: number;
    lastTokenDate: string;
}

export async function fetchNewToken() {
    console.log('새로운 토큰 발급');
    const res = await fetch("https://openapi.koreainvestment.com:9443/oauth2/tokenP", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            "grant_type": "client_credentials",
            "appkey": process.env.APP_KEY,
            "appsecret": process.env.APP_SECRET
        })
    });

    const result = await res.json();
    console.log('token result =>', result);
    return result;
}

export async function getToken(): Promise<{ tokenType: string; token: string }> {
    try {
        // 파일에서 토큰 조회
        const tokenData = await fs.readFile(TOKEN_FILE, 'utf-8');
        const data: TokenData = JSON.parse(tokenData);
        
        const now = Date.now();
        const today = new Date().toISOString().split('T')[0];
        
        // 토큰이 유효하고 오늘 발급된 것인지 확인
        if (data.token && now < data.expiresAt && data.lastTokenDate === today) {
            console.log('캐시된 토큰 사용');
            return { tokenType: data.tokenType, token: data.token };
        }
        
        // 오늘 이미 토큰을 발급받았다면 에러
        if (data.lastTokenDate === today) {
            console.log('오늘은 이미 토큰을 발급받았습니다.');
            throw new Error('오늘은 이미 토큰을 발급받았습니다.');
        }
        
        // 새 토큰 발급
        const newToken = await fetchNewToken();
        
        // 파일에 저장
        await fs.writeFile(TOKEN_FILE, JSON.stringify({
            tokenType: newToken.token_type,
            token: newToken.access_token,
            expiresAt: new Date(newToken.access_token_token_expired).getTime(),
            lastTokenDate: today
        }));
        
        return { tokenType: newToken.token_type, token: newToken.access_token };
    } catch (error) {
        // 파일이 없거나 읽기 실패한 경우 새 토큰 발급
        if (error instanceof Error && error.message === '오늘은 이미 토큰을 발급받았습니다.') {
            throw error;
        }

        console.log('토큰 파일이 없거나 읽기 실패, 새로운 토큰 발급');
        const newToken = await fetchNewToken();
        const today = new Date().toISOString().split('T')[0];
        
        // 파일에 저장
        await fs.writeFile(TOKEN_FILE, JSON.stringify({
            tokenType: newToken.token_type,
            token: newToken.access_token,
            expiresAt: new Date(newToken.access_token_token_expired).getTime(),
            lastTokenDate: today
        }));
        
        return { tokenType: newToken.token_type, token: newToken.access_token };
    }
}