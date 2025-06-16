# echart 공식문서

[echart 공식문서](https://echarts.apache.org/en/option.html#grid.top)

# 사용자 KEY

1. 한국투자증권 개발자 센터의 안내에 따라 APP_KEY, APP_SECRET 저장
2. 해당 값을 기준으로 token 조회

```ts
const res = await fetch('https://openapi.koreainvestment.com:9443/oauth2/tokenP', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    appkey: process.env.APP_KEY,
    appsecret: process.env.APP_SECRET,
  }),
});
```

---

# 2025. 06. 16

그래프 텍스트 포함 항목 
- 그래프 기준 (시점) 매집수량
- 분산비율
- 상관계수 ?? 
- 주가선도
- 종가 

바 형태 그래프 
- 거래량 

선 그래프 
x축: 일자
y축: 매집수량 

끗!


~~액셀 업로드 전에, 종목코드라던지 회사 이름을 쓸 수 있는 ??? 박스가 필요하다 ??~~

~~종목명을 나타내는 뭔가가 필요하다. JSON 파일 명칭 때문에 ??~~

props로 종목에 대한 정보는 받는다 가정하고 개발 진행하고,나중에 종목 검색 리스트 따로 만들예정 


#### 상관계수, 주가선도 변수명칭 추가
- 상관계수:  `stockCorrelation`
- 주가선도:  `stockMomentum`


---
# 2025.06.03

Token 발급 api는 1일 1번 제한하도록 수정이 필요함.

---