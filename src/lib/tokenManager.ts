/**
 * Next.js API Routes 기반 프록시 서버 구조
 * 
 * 토큰 캐싱 유틸 -> 백엔드(Next.js API Route, 서버 캐시)
 * Node.js 메모리에 저장하는 방식
 */

let tokenType: string | null = null;
let cachedToken: string | null = null;
let expiresAt: number = 0;

export async function getToken(): Promise<{ tokenType: string | null; token: string | null }> {
    const now = Date.now();
    if (cachedToken && now < expiresAt) return {tokenType: tokenType, token: cachedToken};

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

    tokenType = result.token_type;
    cachedToken = result.access_token;
    const expiresDate = new Date(result.access_token_token_expired);
    expiresAt = expiresDate.getTime();

    return {tokenType: tokenType, token: cachedToken};
}