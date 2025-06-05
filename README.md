# echart 공식문서 

[echart 공식문서](https://echarts.apache.org/en/option.html#grid.top)

# 사용자 KEY 

1. 한국투자증권 개발자 센터의 안내에 따라 APP_KEY, APP_SECRET 저장
2. 해당 값을 기준으로 token 조회 

```ts
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

```

---

# 2025.06.03

Token 발급 api는 1일 1번 제한하도록 수정이 필요함. 
