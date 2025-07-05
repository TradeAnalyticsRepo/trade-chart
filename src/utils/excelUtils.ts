import { baseDataBeforeProcess, originalExcelFile } from "@/types/excel";
import { ChartData, ExcelData, TableData } from "@/types/trade";
import * as XLSX from "xlsx";
import { callPostApi } from "./api";

const excelEnum = Object.freeze({
  개인: "Indiv",
  기관종합: "TotalIns",
  외국인: "Fore",
  기관: "FinInv",
  기타: "Etc",
  __EMPTY_1: "GTrust",
  __EMPTY_2: "STrust",
  __EMPTY_3: "Bank",
  __EMPTY_4: "Insur",
  __EMPTY_5: "EtcFin",
  __EMPTY_6: "Pens",
  __EMPTY_7: "Nat",

  TotalForeAndInst: "TotalForeAndInst",
});

export const getExcelData = async (excelFile: File) => {
  const originalData = await excelFileToJson(excelFile);
  // 명칭줄(첫밴째 인덱스) 제거
  originalData.shift();
  console.log("originalData:", originalData);
  const baseDataBeforeProcess: baseDataBeforeProcess = {};
  // 기간별 데이터 추출
  baseDataBeforeProcess.stockListByPeriod = stockDataBeforePeriodProcess(originalData);
  console.log(baseDataBeforeProcess.stockListByPeriod);
  const tableData:TableData[] = processingExcelDataForCummulativePeriod(baseDataBeforeProcess.stockListByPeriod);
  console.log(tableData);

  const reversedOriginalData = originalData.reverse(); // reverse 원본배열 변경
  const filtered = reversedOriginalData.filter(row => {
    if(!row.일자){
      return false;
    }
    return Number(row.일자.replaceAll('/', '')) >= 20201029;
  });
  // 누적합계, 최고저점, 최고고점 데이터 추출
  baseDataBeforeProcess.cumulativeStockData = stockDataBeforeCumulateProcess(filtered);

  console.debug("baseDataBeforeProcess:", baseDataBeforeProcess);
  // 누적합계, 주가선도 등 데이터 가공작업
  const graphProcessingData: ChartData[] = processingExcelDataForCummulativeGraph(filtered, baseDataBeforeProcess.cumulativeStockData);

  //표에 있는 누적, 상관계수 등을 위함.
  const latestGraphData = graphProcessingData[0]; 

  const cumulativeGraphData = {
    stockId: "11111",
    processingData: graphProcessingData,
    type: "graph",
  };

  const cumulativeLastestData = {
    stockId: "11111",
    processingData: latestGraphData,
    type: "lastest"
  }


  console.log(cumulativeGraphData, cumulativeLastestData);
  // 그래프 json파일 생성
  callPostApi("/api/excel", cumulativeGraphData);
  callPostApi("/api/excel", cumulativeLastestData);
};


export const excelFileToJson = async (excelFile: File): Promise<originalExcelFile[]> => {
  const arrayBuffer = await excelFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
};

export const stockDataBeforeCumulateProcess = (data: originalExcelFile[]): baseDataBeforeProcess["cumulativeStockData"] => {
  const cumulativeStockData = initCumulativeStockData;

  data.forEach((item) => {
    // 투자자별 누적합계, 최저점, 최고점
    Object.keys(excelEnum).forEach((key: string) => {
      if (key === "TotalForeAndInst") {
        // 외국인 + 기관
        const cumulativeMount =
          cumulativeStockData.cumulativeForeMount + cumulativeStockData.cumulativeTotalInsMount;
        cumulativeStockData.cumulativeTotalForeAndInstMount = cumulativeMount;

        if (cumulativeStockData.minTotalForeAndInstMount > cumulativeMount) {
          cumulativeStockData.minTotalForeAndInstMount = cumulativeMount;
        } else if (cumulativeStockData.maxTotalForeAndInstMount < cumulativeMount) {
          cumulativeStockData.maxTotalForeAndInstMount = cumulativeMount;
        }
      } else if (Number(item[key])) {
        const cumulativeKey = `cumulative${excelEnum[key]}Mount`;
        const minKey = `min${excelEnum[key]}Mount`;
        const maxKey = `max${excelEnum[key]}Mount`;

        // [key]누적합계
        const cumulativeMount = cumulativeStockData[cumulativeKey] + Number(item[key]);
        cumulativeStockData[cumulativeKey] = cumulativeMount;

        // [key]min, max
        if (cumulativeStockData[minKey] > cumulativeMount) {
          cumulativeStockData[minKey] = cumulativeMount;
        } else if (cumulativeStockData[maxKey] < cumulativeMount) {
          cumulativeStockData[maxKey] = cumulativeMount;
        }
      }
    });
  });
  return cumulativeStockData;
};

// 수급계산 로직
export const processingExcelDataForCummulativeGraph = (data: originalExcelFile[], cumulativeStockData: baseDataBeforeProcess["cumulativeStockData"]) => {
  let volume = {
    indivCollectionVolume: cumulativeStockData.cumulativeIndivMount - cumulativeStockData.minIndivMount,
    totalForeAndInstCollectionVolume: cumulativeStockData.cumulativeTotalForeAndInstMount - cumulativeStockData.minTotalForeAndInstMount,
    foreCollectionVolume: cumulativeStockData.cumulativeForeMount - cumulativeStockData.minForeMount,
    totalInsCollectionVolume: cumulativeStockData.cumulativeTotalInsMount - cumulativeStockData.minTotalInsMount,
    finInvCollectionVolume: cumulativeStockData.cumulativeFinInvMount - cumulativeStockData.minFinInvMount,
    insurCollectionVolume: cumulativeStockData.cumulativeInsurMount - cumulativeStockData.minInsurMount,
    etcFinCollectionVolume: cumulativeStockData.cumulativeEtcFinMount - cumulativeStockData.minEtcFinMount,
    bankCollectionVolume: cumulativeStockData.cumulativeBankMount - cumulativeStockData.minBankMount,
    pensCollectionVolume: cumulativeStockData.cumulativePensMount - cumulativeStockData.minPensMount,
    gTrustCollectionVolume: cumulativeStockData.cumulativeGTrustMount - cumulativeStockData.minGTrustMount,
    sTrustCollectionVolume: cumulativeStockData.cumulativeSTrustMount - cumulativeStockData.minSTrustMount,
    natCollectionVolume: cumulativeStockData.cumulativeNatMount - cumulativeStockData.minNatMount,
    etcCollectionVolume: cumulativeStockData.cumulativeEtcMount - cumulativeStockData.minEtcMount,
  };

  
  const result: ChartData[] = [];

  data.forEach((item, idx) => {
    let sumTotalCollectionVolume = 0;
    Object.entries(excelEnum).forEach(([key, value]) => {
        if(idx > 0) {
          if (value === "TotalForeAndInst") {
            volume.totalForeAndInstCollectionVolume += item.외국인 + item.기관종합;
          } else {
            volume[`${toCamel(value)}CollectionVolume`] += item[key];
          }
        }
        if(value !== "TotalForeAndInst")
        sumTotalCollectionVolume += volume[`${toCamel(value)}CollectionVolume`];
      });
      if(idx === 0){
        console.log(cumulativeStockData.maxIndivMount, cumulativeStockData.minIndivMount, cumulativeStockData.maxIndivMount - cumulativeStockData.minIndivMount ,sumTotalCollectionVolume);
      }
      

    
    const defaultInfo = {
      tradeDate: item.일자,
      open: item.종가 + item.__EMPTY,
      close: item.종가,
      previousDayComparison: item.__EMPTY
    };

    const dayValue: ChartData = {
      주가 : {
        ...defaultInfo,
        high:0,
        low:0,
        tradingVolume: item.거래량
      },
      개인 : {
        ...defaultInfo,
        tradingVolume: item.개인,
        stockCorrelation: 0,
        collectionVolume: volume.indivCollectionVolume,
        dispersionRatio: calcPercent(volume.indivCollectionVolume, cumulativeStockData.maxIndivMount - cumulativeStockData.minIndivMount),
        stockMomentum: calcPercent(cumulativeStockData.maxIndivMount - cumulativeStockData.minIndivMount, sumTotalCollectionVolume),
      },
      세력합 : {
        ...defaultInfo,
        tradingVolume: item.외국인 + item.기관종합,
        stockCorrelation: 0,
        collectionVolume: volume.totalForeAndInstCollectionVolume,
        dispersionRatio: calcPercent(volume.totalForeAndInstCollectionVolume,cumulativeStockData.cumulativeTotalForeAndInstMount + cumulativeStockData.maxTotalForeAndInstMount - cumulativeStockData.minTotalForeAndInstMount),
        stockMomentum: calcPercent(volume.totalForeAndInstCollectionVolume, sumTotalCollectionVolume),
      },
      외국인 : {
        ...defaultInfo,
        tradingVolume: item.외국인,
        stockCorrelation: 0,
        collectionVolume: volume.foreCollectionVolume,
        dispersionRatio: calcPercent(volume.foreCollectionVolume,cumulativeStockData.cumulativeForeMount + cumulativeStockData.maxForeMount - cumulativeStockData.minForeMount),
        stockMomentum: calcPercent(volume.foreCollectionVolume, sumTotalCollectionVolume),
      },
      투신_일반 : {
        ...defaultInfo,
        tradingVolume: item.__EMPTY_1,
        stockCorrelation: 0,
        collectionVolume: volume.gTrustCollectionVolume,
        dispersionRatio: calcPercent(volume.gTrustCollectionVolume, cumulativeStockData.cumulativeGTrustMount + cumulativeStockData.maxGTrustMount - cumulativeStockData.minGTrustMount),
        stockMomentum: calcPercent(volume.gTrustCollectionVolume, sumTotalCollectionVolume),
      },
      투신_사모 : {
        ...defaultInfo,
        tradingVolume: item.__EMPTY_2,
        stockCorrelation: 0,
        collectionVolume: volume.sTrustCollectionVolume,
        dispersionRatio: calcPercent(volume.sTrustCollectionVolume, cumulativeStockData.cumulativeSTrustMount + cumulativeStockData.maxSTrustMount - cumulativeStockData.minSTrustMount ),
        stockMomentum: calcPercent(volume.sTrustCollectionVolume, sumTotalCollectionVolume),
      },
      은행 : {
        ...defaultInfo,
        tradingVolume: item.__EMPTY_3,
        stockCorrelation: 0,
        collectionVolume: volume.bankCollectionVolume,
        dispersionRatio: calcPercent( volume.bankCollectionVolume, cumulativeStockData.cumulativeBankMount + cumulativeStockData.maxBankMount - cumulativeStockData.minBankMount),
        stockMomentum: calcPercent(volume.bankCollectionVolume, sumTotalCollectionVolume),
      },
      보험 : {
        ...defaultInfo,
        tradingVolume: item.__EMPTY_4,
        stockCorrelation: 0,
        collectionVolume: volume.insurCollectionVolume,
        dispersionRatio: calcPercent(volume.insurCollectionVolume, cumulativeStockData.cumulativeInsurMount + cumulativeStockData.maxInsurMount - cumulativeStockData.minInsurMount),
        stockMomentum: calcPercent(volume.insurCollectionVolume, sumTotalCollectionVolume),
      },
      기타금융 : {
        ...defaultInfo,
        tradingVolume: item.__EMPTY_5,
        stockCorrelation: 0,
        collectionVolume: volume.etcFinCollectionVolume,
        dispersionRatio: calcPercent( volume.etcFinCollectionVolume, cumulativeStockData.cumulativeEtcFinMount + cumulativeStockData.maxEtcFinMount - cumulativeStockData.minEtcFinMount),
        stockMomentum: calcPercent(volume.etcFinCollectionVolume, sumTotalCollectionVolume),
      },
      연기금 : {
        ...defaultInfo,
        tradingVolume: item.__EMPTY_6,
        stockCorrelation: 0,
        collectionVolume: volume.pensCollectionVolume,
        dispersionRatio: calcPercent(volume.pensCollectionVolume, cumulativeStockData.cumulativePensMount + cumulativeStockData.maxPensMount - cumulativeStockData.minPensMount),
        stockMomentum: calcPercent(volume.pensCollectionVolume, sumTotalCollectionVolume),
      },
      국가매집 : {
        ...defaultInfo,
        tradingVolume: item.__EMPTY_7,
        stockCorrelation: 0,
        collectionVolume: volume.natCollectionVolume,
        dispersionRatio: calcPercent(volume.natCollectionVolume, cumulativeStockData.cumulativeNatMount + cumulativeStockData.maxNatMount - cumulativeStockData.minNatMount),
        stockMomentum: calcPercent(volume.natCollectionVolume, sumTotalCollectionVolume),
      },

      기타법인 : {
        ...defaultInfo,
        tradingVolume: item.기타,
        stockCorrelation: 0,
        collectionVolume: volume.etcCollectionVolume,
        dispersionRatio: calcPercent(volume.etcCollectionVolume,cumulativeStockData.cumulativeEtcMount + cumulativeStockData.maxEtcMount - cumulativeStockData.minEtcMount),
        stockMomentum: calcPercent(volume.etcCollectionVolume, sumTotalCollectionVolume),
      }
    };

    result.push(dayValue);
  });

  return result;
};


export const stockDataBeforePeriodProcess = (data: originalExcelFile[]): baseDataBeforeProcess["stockListByPeriod"] => {
  let day = 1, week = 1, month = 1, quarter = 1, year = 1;

  /**
   * 기간별 list 잘라서 넣어주기
   */
  const stockListByPeriod = initStockListByPeriod;
  data.forEach((item) => {
    if(day < 6 && stockListByPeriod?.week?.length < 5)  {
      stockListByPeriod?.week?.push(item);
    }

    if(week < 5) {
      const weekList = stockListByPeriod[`week${week}`] || []; 
      if(weekList.length < 5) {
        weekList.push(item);
      } else {
        const nextweek = stockListByPeriod[`week${++week}`] || [];
        nextweek.push(item);
      }
    }

    if(month < 4) {
      const monthList = stockListByPeriod[`month${month}`] || [];
      if(monthList.length < 30) {
        monthList.push(item);
      } else {
        const nextMonth = stockListByPeriod[`month${++month}`] || [];
        nextMonth.push(item);
      }
    }

    if(quarter < 5) {
      const quarterList = stockListByPeriod[`quarter${quarter}`] || [];
      if(quarterList.length < 90) {
        quarterList.push(item);
      } else {
        const nextQuarter = stockListByPeriod[`quarter${++quarter}`] || [];
        nextQuarter.push(item);
      }
    }
    
    const yearList = stockListByPeriod[`year${year}`] || [];
    if(yearList.length < 365){
      yearList.push(item);
    } else {
      const nextYear = stockListByPeriod[`year${++year}`] || [];
      nextYear.push(item);
    }

  })
  
  return stockListByPeriod;
}
// 수급분석표 로직
export const processingExcelDataForCummulativePeriod = (stockList : baseDataBeforeProcess["stockListByPeriod"]) : TableData[] => {
  const result: TableData[] = [];
  const keys = Object.keys(stockList ?? {});
  keys.forEach(key => {
    if(key === 'week') {
      stockList[key].forEach(data => {
        result.push({
          tradeDateNm: data.일자,
          avgMount: data.종가,
          tradingVolume: data.거래량,

          tradingVolumeIndiv: data.개인,
          tradingVolumeTotalForeAndInst: data.외국인 + data.기관종합,
          tradingVolumeFore: data.외국인,
          tradingVolumeTotalIns: data.기관종합,
          tradingVolumeFinInv: data.기관,
          tradingVolumeEtc: data.기타,
          tradingVolumeGTrust: data.__EMPTY_1,
          tradingVolumeSTrust: data.__EMPTY_2,
          tradingVolumeBank: data.__EMPTY_3,
          tradingVolumeInsur: data.__EMPTY_4,
          tradingVolumeEtcFin: data.__EMPTY_5,
          tradingVolumePens: data.__EMPTY_6,
          tradingVolumeNat: data.__EMPTY_7,
        })
      });
    } else {
      let cumulativeData = {
        avgMount: 0,
        tradingVolume: 0,

        tradingVolumeIndiv: 0,
        tradingVolumeTotalForeAndInst: 0,
        tradingVolumeFore: 0,
        tradingVolumeTotalIns: 0,
        tradingVolumeFinInv: 0,
        tradingVolumeEtc: 0,
        tradingVolumeGTrust: 0,
        tradingVolumeSTrust: 0,
        tradingVolumeBank: 0,
        tradingVolumeInsur: 0,
        tradingVolumeEtcFin: 0,
        tradingVolumePens: 0,
        tradingVolumeNat: 0,
      }
      stockList[key].forEach((data: originalExcelFile, idx: number) => {
        cumulativeData.avgMount += data.종가;
        cumulativeData.tradingVolume += data.거래량;

        cumulativeData.tradingVolumeIndiv += data.개인;
        cumulativeData.tradingVolumeTotalForeAndInst += data.외국인 + data.기관종합;
        cumulativeData.tradingVolumeFore += data.외국인;
        cumulativeData.tradingVolumeTotalIns += data.기관종합;
        cumulativeData.tradingVolumeFinInv += data.기관;
        cumulativeData.tradingVolumeEtc += data.기타;
        cumulativeData.tradingVolumeGTrust += data.__EMPTY_1;
        cumulativeData.tradingVolumeSTrust += data.__EMPTY_2;
        cumulativeData.tradingVolumeBank += data.__EMPTY_3;
        cumulativeData.tradingVolumeInsur += data.__EMPTY_4;
        cumulativeData.tradingVolumeEtcFin += data.__EMPTY_5;
        cumulativeData.tradingVolumePens += data.__EMPTY_6;
        cumulativeData.tradingVolumeNat += data.__EMPTY_7;
        
        if(idx + 1 === stockList[key].length) {
          result.push({
            tradeDateNm: data.일자,
            avgMount: Math.floor(cumulativeData.avgMount / idx + 1),
            ...cumulativeData
          });
        }
      })
    }
  })

  return result;
};

const calcPercent = (num1: number, num2: number) => Math.round((num1 / num2) * 100) || 0;
const toCamel = (str: string) => str[0].toLowerCase() + str.slice(1);


const initCumulativeStockData = {
  cumulativeIndivMount: 0,
  minIndivMount: 0,
  maxIndivMount: 0,

  cumulativeForeMount: 0,
  minForeMount: 0,
  maxForeMount: 0,

  cumulativeFinInvMount: 0,
  minFinInvMount: 0,
  maxFinInvMount: 0,

  cumulativeInsurMount: 0,
  minInsurMount: 0,
  maxInsurMount: 0,

  cumulativeTrustMount: 0,
  minTrustMount: 0,
  maxTrustMount: 0,

  cumulativeEtcFinMount: 0,
  minEtcFinMount: 0,
  maxEtcFinMount: 0,

  cumulativeBankMount: 0,
  minBankMount: 0,
  maxBankMount: 0,

  cumulativePensMount: 0,
  minPensMount: 0,
  maxPensMount: 0,

  cumulativeSTrustMount: 0,
  minSTrustMount: 0,
  maxSTrustMount: 0,

  cumulativeNatMount: 0,
  minNatMount: 0,
  maxNatMount: 0,

  cumulativeEtcMount: 0,
  minEtcMount: 0,
  maxEtcMount: 0,

  cumulativeTotalForeAndInstMount: 0,
  minTotalForeAndInstMount: 0,
  maxTotalForeAndInstMount: 0,

  cumulativeTotalInsMount: 0,
  minTotalInsMount: 0,
  maxTotalInsMount: 0,

  cumulativeGTrustMount: 0,
  minGTrustMount: 0,
  maxGTrustMount: 0,
}

const initStockListByPeriod: {
  week: originalExcelFile[],
  week1: originalExcelFile[],
  week2: originalExcelFile[],
  week3: originalExcelFile[],
  week4: originalExcelFile[],
  month1: originalExcelFile[],
  month2: originalExcelFile[],
  month3: originalExcelFile[],
  quarter1: originalExcelFile[],
  quarter2: originalExcelFile[],
  quarter3: originalExcelFile[],
  quarter4: originalExcelFile[],
  year1: originalExcelFile[],
  year2: originalExcelFile[],
  year3: originalExcelFile[],
  year4: originalExcelFile[],
  year5: originalExcelFile[],
  year6: originalExcelFile[],
  year7: originalExcelFile[],
  year8: originalExcelFile[],
  year9: originalExcelFile[],
  year10: originalExcelFile[],
} = {
  week: [],
  week1: [],
  week2: [],
  week3: [],
  week4: [],
  month1: [],
  month2: [],
  month3: [],
  quarter1: [],
  quarter2: [],
  quarter3: [],
  quarter4: [],
  year1: [],
  year2: [],
  year3: [],
  year4: [],
  year5: [],
  year6: [],
  year7: [],
  year8: [],
  year9: [],
  year10: [],
}

/** 상관계수 */
function pearsonCorrelation(x, y) {
  if (x.length !== y.length) {
    throw new Error("두 배열의 길이는 같아야 합니다.");
  }

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0);
  const sumY2 = y.reduce((acc, val) => acc + val * val, 0);

  const numerator = (n * sumXY) - (sumX * sumY);
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  if (denominator === 0) return 0; // 상수 배열일 경우

  return numerator / denominator;
}