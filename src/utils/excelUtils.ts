import { baseDataBeforeProcess, originalExcelFile } from "@/types/excel";
import { ChartData, ExcelData } from "@/types/trade";
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

export const handleExcel = async (originalExcelFile: File) => {
  // const formData = new FormData();
  // formData.append('file', file);
  const arrayBuffer = await originalExcelFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: originalExcelFile[] = XLSX.utils.sheet_to_json(sheet);

  const baseDataBeforeProcess: baseDataBeforeProcess = {};
  baseDataBeforeProcess.cumulativeStockData = stockDataBeforeCumulateProcess(data);

  // promise로 병렬처리 어떤지 고민
  const graphProcessingData: ExcelData[] = processingExcelData(data, baseDataBeforeProcess.cumulativeStockData);
  const parameter = {
    stockId: "11111",
    processingData: graphProcessingData,
    type: "graph",
  };
  console.log(parameter);
  callPostApi("/api/excel", parameter);

  
  processingExcelData2(data);
};

export const getExcelData = async (excelFile: File) => {
  const originalData = await excelFileToJson(excelFile);
  
  // const filtered = reversedOriginalData.filter(row => {
  //   if(!row.일자){
  //     return false;
  //   }
  //   return Number(row.일자.replaceAll('/', '')) >= 20220609;
  // });
  
  console.debug("originalData:", originalData);
  const baseDataBeforeProcess: baseDataBeforeProcess = {};
  baseDataBeforeProcess.stockListByPeriod = stockDataBeforePeriodProcess(originalData);

  const reversedOriginalData = originalData.reverse(); // reverse 원본배열 변경
  baseDataBeforeProcess.cumulativeStockData = stockDataBeforeCumulateProcess(reversedOriginalData);
  console.log(baseDataBeforeProcess);
  console.debug("baseDataBeforeProcess:", baseDataBeforeProcess);
  const graphProcessingData: ExcelData[] = processingExcelData(reversedOriginalData, baseDataBeforeProcess.cumulativeStockData);
  const parameter = {
    stockId: "11111",
    processingData: graphProcessingData,
    type: "graph",
  };
  console.log(parameter);
  callPostApi("/api/excel", parameter);
  // processingExcelData2(data);
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
export const processingExcelData = (data: originalExcelFile[], cumulativeStockData: baseDataBeforeProcess["cumulativeStockData"]) => {
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

  const result: ExcelData[] = [];
  // const result: ChartData[] = [];

  data.forEach((item, idx) => {
    if (!item.일자) return;
    let sumTotalCollectionVolume = 0;
    if(idx > 1) {
      Object.entries(excelEnum).forEach(([key, value]) => {
        if (value === "TotalForeAndInst") {
          volume.totalForeAndInstCollectionVolume += item.외국인 + item.기관종합;
        } else {
          volume[`${toCamel(value)}CollectionVolume`] += item[key];
          sumTotalCollectionVolume += volume[`${toCamel(value)}CollectionVolume`];
        }
      });
    }

    const dayValue: ExcelData = {
      tradeDate: item.일자,
      endMount: item.종가,
      previousDayComparison: item.__EMPTY,
      tradingVolume: item.거래량,
      tradingVolumeIndiv: item.개인,
      tradingVolumeTotalForeAndInst: item.외국인 + item.기관종합,
      tradingVolumeFore: item.외국인,
      tradingVolumeTotalIns: item.기관종합,
      tradingVolumeFinInv: item.기관,
      tradingVolumeEtc: item.기타,
      tradingVolumeGTrust: item.__EMPTY_1,
      tradingVolumeSTrust: item.__EMPTY_2,
      tradingVolumeBank: item.__EMPTY_3,
      tradingVolumeInsur: item.__EMPTY_4,
      tradingVolumeEtcFin: item.__EMPTY_5,
      tradingVolumePens: item.__EMPTY_6,
      tradingVolumeNat: item.__EMPTY_7,

      indivCollectionVolume: volume.indivCollectionVolume,
      indivDispersionRatio: calcPercent(
        volume.indivCollectionVolume,
        cumulativeStockData.cumulativeIndivMount + cumulativeStockData.maxIndivMount - cumulativeStockData.minIndivMount
      ),
      indivStockMomentum: calcPercent(volume.indivCollectionVolume, sumTotalCollectionVolume),
      totalForeAndInstCollectionVolume: volume.totalForeAndInstCollectionVolume,
      totalForeAndInstDispersionRatio: calcPercent(
        volume.totalForeAndInstCollectionVolume,
        cumulativeStockData.cumulativeTotalForeAndInstMount +
          cumulativeStockData.maxTotalForeAndInstMount -
          cumulativeStockData.minTotalForeAndInstMount
      ),
      totalForeAndInstStockMomentum: calcPercent(volume.totalForeAndInstCollectionVolume, sumTotalCollectionVolume),
      foreCollectionVolume: volume.foreCollectionVolume,
      foreDispersionRatio: calcPercent(
        volume.foreCollectionVolume,
        cumulativeStockData.cumulativeForeMount + cumulativeStockData.maxForeMount - cumulativeStockData.minForeMount
      ),
      foreStockMomentum: calcPercent(volume.foreCollectionVolume, sumTotalCollectionVolume),
      totalInsCollectionVolume: volume.totalInsCollectionVolume,
      totalInsDispersionRatio: calcPercent(
        volume.totalInsCollectionVolume,
        cumulativeStockData.cumulativeTotalInsMount + cumulativeStockData.maxTotalInsMount - cumulativeStockData.minTotalInsMount
      ),
      totalInsStockMomentum: calcPercent(volume.totalInsCollectionVolume, sumTotalCollectionVolume),
      finInvCollectionVolume: volume.finInvCollectionVolume,
      finInvDispersionRatio: calcPercent(
        volume.finInvCollectionVolume,
        cumulativeStockData.cumulativeFinInvMount + cumulativeStockData.maxFinInvMount - cumulativeStockData.minFinInvMount
      ),
      finInvStockMomentum: calcPercent(volume.finInvCollectionVolume, sumTotalCollectionVolume),
      insurCollectionVolume: volume.insurCollectionVolume,
      insurDispersionRatio: calcPercent(
        volume.insurCollectionVolume,
        cumulativeStockData.cumulativeInsurMount + cumulativeStockData.maxInsurMount - cumulativeStockData.minInsurMount
      ),
      insurStockMomentum: calcPercent(volume.insurCollectionVolume, sumTotalCollectionVolume),
      gTrustCollectionVolume: volume.gTrustCollectionVolume,
      gTrustDispersionRatio: calcPercent(
        volume.gTrustCollectionVolume,
        cumulativeStockData.cumulativeTrustMount + cumulativeStockData.maxGTrustMount - cumulativeStockData.minGTrustMount
      ),
      trustStockMomentum: calcPercent(volume.gTrustCollectionVolume, sumTotalCollectionVolume),
      etcFinCollectionVolume: volume.etcFinCollectionVolume,
      etcFinDispersionRatio: calcPercent(
        volume.etcFinCollectionVolume,
        cumulativeStockData.cumulativeEtcFinMount + cumulativeStockData.maxEtcFinMount - cumulativeStockData.minEtcFinMount
      ),
      etcFinStockMomentum: calcPercent(volume.etcFinCollectionVolume, sumTotalCollectionVolume),
      bankCollectionVolume: volume.bankCollectionVolume,
      bankDispersionRatio: calcPercent(
        volume.bankCollectionVolume,
        cumulativeStockData.cumulativeBankMount + cumulativeStockData.maxBankMount - cumulativeStockData.minBankMount
      ),
      bankStockMomentum: calcPercent(volume.bankCollectionVolume, sumTotalCollectionVolume),
      pensCollectionVolume: volume.pensCollectionVolume,
      pensDispersionRatio: calcPercent(
        volume.pensCollectionVolume,
        cumulativeStockData.cumulativePensMount + cumulativeStockData.maxPensMount - cumulativeStockData.minPensMount
      ),
      pensStockMomentum: calcPercent(volume.pensCollectionVolume, sumTotalCollectionVolume),
      sTrustCollectionVolume: volume.sTrustCollectionVolume,
      sTrustDispersionRatio: calcPercent(
        volume.sTrustCollectionVolume,
        cumulativeStockData.cumulativeSTrustMount + cumulativeStockData.maxSTrustMount - cumulativeStockData.minSTrustMount
      ),
      sTrustStockMomentum: calcPercent(volume.sTrustCollectionVolume, sumTotalCollectionVolume),
      natCollectionVolume: volume.natCollectionVolume,
      natDispersionRatio: calcPercent(
        volume.natCollectionVolume,
        cumulativeStockData.cumulativeNatMount + cumulativeStockData.maxNatMount - cumulativeStockData.minNatMount
      ),
      natStockMomentum: calcPercent(volume.natCollectionVolume, sumTotalCollectionVolume),
      etcCollectionVolume: volume.etcCollectionVolume,
      etcDispersionRatio: calcPercent(
        volume.etcCollectionVolume,
        cumulativeStockData.cumulativeEtcMount + cumulativeStockData.maxEtcMount - cumulativeStockData.minEtcMount
      ),
      etcStockMomentum: calcPercent(volume.etcCollectionVolume, sumTotalCollectionVolume),
    };

    // const defaultInfo = {
    //   tradeDate: item.일자,
    //   endMount: item.종가,
    //   previousDayComparison: item.__EMPTY
    // };

    // const dayValue1: ChartData = {
    //   기본 : {
    //     ...defaultInfo,
    //     tradingVolume: item.거래량
    //   },
    //   개인 : {
    //     ...defaultInfo,
    //     tradingVolume: item.개인,
    //     stockCorrelation: 0,
    //     collectionVolume: volume.indivCollectionVolume,
    //     dispersionRatio: calcPercent(
    //     volume.indivCollectionVolume,
    //     cumulativeStockData.cumulativeIndivMount + cumulativeStockData.maxIndivMount - cumulativeStockData.minIndivMount
    //   ) ,
    //     stockMomentum: calcPercent(volume.indivCollectionVolume, sumTotalCollectionVolume),
    //   },
    //   세력합 : {
    //     ...defaultInfo,
    //     tradingVolume: item.외국인 + item.기관종합,
    //     stockCorrelation: ,
    //     collectionVolume: ,
    //     dispersionRatio: ,
    //     stockMomentum: 
    //   },
    //   외국인 : {
    //     ...defaultInfo,
    //     tradingVolume: item.외국인,
    //     stockCorrelation: ,
    //     collectionVolume: ,
    //     dispersionRatio: ,
    //     stockMomentum: 
    //   },
    //   투신_일반 : {
    //     ...defaultInfo,
    //     tradingVolume: item.__EMPTY_1,
    //     stockCorrelation: ,
    //     collectionVolume: ,
    //     dispersionRatio: ,
    //     stockMomentum: 
    //   },
    //   투신_사모 : {
    //     ...defaultInfo,
    //     tradingVolume: item.__EMPTY_2,
    //     stockCorrelation: ,
    //     collectionVolume: ,
    //     dispersionRatio: ,
    //     stockMomentum: 
    //   },
    //   은행 : {
    //     ...defaultInfo,
    //     tradingVolume: item.__EMPTY_3,
    //     stockCorrelation: ,
    //     collectionVolume: ,
    //     dispersionRatio: ,
    //     stockMomentum: 
    //   },
    //   보험 : {
    //     ...defaultInfo,
    //     tradingVolume: item.__EMPTY_4,
    //     stockCorrelation: ,
    //     collectionVolume: ,
    //     dispersionRatio: ,
    //     stockMomentum: 
    //   },
    //   기타금융 : {
    //     ...defaultInfo,
    //     tradingVolume: item.__EMPTY_5,
    //     stockCorrelation: ,
    //     collectionVolume: ,
    //     dispersionRatio: ,
    //     stockMomentum: 
    //   },
    //   연기금 : {
    //     ...defaultInfo,
    //     tradingVolume: item.__EMPTY_6,
    //     stockCorrelation: ,
    //     collectionVolume: ,
    //     dispersionRatio: ,
    //     stockMomentum: 
    //   },
    //   국가매집 : {
    //     ...defaultInfo,
    //     tradingVolume: item.__EMPTY_7,
    //     stockCorrelation: ,
    //     collectionVolume: ,
    //     dispersionRatio: ,
    //     stockMomentum: 
    //   },

    //   기타법인 : {
    //     ...defaultInfo,
    //     tradingVolume: item.기타,
    //     stockCorrelation: ,
    //     collectionVolume: ,
    //     dispersionRatio: ,
    //     stockMomentum: 
    //   }

    //   tradingVolumeTotalForeAndInst: item.외국인 + item.기관종합,
    //   tradingVolumeFore: item.외국인,
    //   tradingVolumeTotalIns: item.기관종합,
    //   tradingVolumeFinInv: item.기관,
    //   tradingVolumeEtc: item.기타,
    //   tradingVolumeGTrust: item.__EMPTY_1,
    //   tradingVolumeSTrust: item.__EMPTY_2,
    //   tradingVolumeBank: item.__EMPTY_3,
    //   tradingVolumeInsur: item.__EMPTY_4,
    //   tradingVolumeEtcFin: item.__EMPTY_5,
    //   tradingVolumePens: item.__EMPTY_6,
    //   tradingVolumeNat: item.__EMPTY_7,

    //   indivCollectionVolume: volume.indivCollectionVolume,
    //   indivDispersionRatio: calcPercent(
    //     volume.indivCollectionVolume,
    //     cumulativeStockData.cumulativeIndivMount + cumulativeStockData.maxIndivMount - cumulativeStockData.minIndivMount
    //   ),
    //   indivStockMomentum: calcPercent(volume.indivCollectionVolume, sumTotalCollectionVolume),
    //   totalForeAndInstCollectionVolume: volume.totalForeAndInstCollectionVolume,
    //   totalForeAndInstDispersionRatio: calcPercent(
    //     volume.totalForeAndInstCollectionVolume,
    //     cumulativeStockData.cumulativeTotalForeAndInstMount +
    //       cumulativeStockData.maxTotalForeAndInstMount -
    //       cumulativeStockData.minTotalForeAndInstMount
    //   ),
    //   totalForeAndInstStockMomentum: calcPercent(volume.totalForeAndInstCollectionVolume, sumTotalCollectionVolume),
    //   foreCollectionVolume: volume.foreCollectionVolume,
    //   foreDispersionRatio: calcPercent(
    //     volume.foreCollectionVolume,
    //     cumulativeStockData.cumulativeForeMount + cumulativeStockData.maxForeMount - cumulativeStockData.minForeMount
    //   ),
    //   foreStockMomentum: calcPercent(volume.foreCollectionVolume, sumTotalCollectionVolume),
    //   totalInsCollectionVolume: volume.totalInsCollectionVolume,
    //   totalInsDispersionRatio: calcPercent(
    //     volume.totalInsCollectionVolume,
    //     cumulativeStockData.cumulativeTotalInsMount + cumulativeStockData.maxTotalInsMount - cumulativeStockData.minTotalInsMount
    //   ),
    //   totalInsStockMomentum: calcPercent(volume.totalInsCollectionVolume, sumTotalCollectionVolume),
    //   finInvCollectionVolume: volume.finInvCollectionVolume,
    //   finInvDispersionRatio: calcPercent(
    //     volume.finInvCollectionVolume,
    //     cumulativeStockData.cumulativeFinInvMount + cumulativeStockData.maxFinInvMount - cumulativeStockData.minFinInvMount
    //   ),
    //   finInvStockMomentum: calcPercent(volume.finInvCollectionVolume, sumTotalCollectionVolume),
    //   insurCollectionVolume: volume.insurCollectionVolume,
    //   insurDispersionRatio: calcPercent(
    //     volume.insurCollectionVolume,
    //     cumulativeStockData.cumulativeInsurMount + cumulativeStockData.maxInsurMount - cumulativeStockData.minInsurMount
    //   ),
    //   insurStockMomentum: calcPercent(volume.insurCollectionVolume, sumTotalCollectionVolume),
    //   gTrustCollectionVolume: volume.gTrustCollectionVolume,
    //   gTrustDispersionRatio: calcPercent(
    //     volume.gTrustCollectionVolume,
    //     cumulativeStockData.cumulativeTrustMount + cumulativeStockData.maxGTrustMount - cumulativeStockData.minGTrustMount
    //   ),
    //   trustStockMomentum: calcPercent(volume.gTrustCollectionVolume, sumTotalCollectionVolume),
    //   etcFinCollectionVolume: volume.etcFinCollectionVolume,
    //   etcFinDispersionRatio: calcPercent(
    //     volume.etcFinCollectionVolume,
    //     cumulativeStockData.cumulativeEtcFinMount + cumulativeStockData.maxEtcFinMount - cumulativeStockData.minEtcFinMount
    //   ),
    //   etcFinStockMomentum: calcPercent(volume.etcFinCollectionVolume, sumTotalCollectionVolume),
    //   bankCollectionVolume: volume.bankCollectionVolume,
    //   bankDispersionRatio: calcPercent(
    //     volume.bankCollectionVolume,
    //     cumulativeStockData.cumulativeBankMount + cumulativeStockData.maxBankMount - cumulativeStockData.minBankMount
    //   ),
    //   bankStockMomentum: calcPercent(volume.bankCollectionVolume, sumTotalCollectionVolume),
    //   pensCollectionVolume: volume.pensCollectionVolume,
    //   pensDispersionRatio: calcPercent(
    //     volume.pensCollectionVolume,
    //     cumulativeStockData.cumulativePensMount + cumulativeStockData.maxPensMount - cumulativeStockData.minPensMount
    //   ),
    //   pensStockMomentum: calcPercent(volume.pensCollectionVolume, sumTotalCollectionVolume),
    //   sTrustCollectionVolume: volume.sTrustCollectionVolume,
    //   sTrustDispersionRatio: calcPercent(
    //     volume.sTrustCollectionVolume,
    //     cumulativeStockData.cumulativeSTrustMount + cumulativeStockData.maxSTrustMount - cumulativeStockData.minSTrustMount
    //   ),
    //   sTrustStockMomentum: calcPercent(volume.sTrustCollectionVolume, sumTotalCollectionVolume),
    //   natCollectionVolume: volume.natCollectionVolume,
    //   natDispersionRatio: calcPercent(
    //     volume.natCollectionVolume,
    //     cumulativeStockData.cumulativeNatMount + cumulativeStockData.maxNatMount - cumulativeStockData.minNatMount
    //   ),
    //   natStockMomentum: calcPercent(volume.natCollectionVolume, sumTotalCollectionVolume),
    //   etcCollectionVolume: volume.etcCollectionVolume,
    //   etcDispersionRatio: calcPercent(
    //     volume.etcCollectionVolume,
    //     cumulativeStockData.cumulativeEtcMount + cumulativeStockData.maxEtcMount - cumulativeStockData.minEtcMount
    //   ),
    //   etcStockMomentum: calcPercent(volume.etcCollectionVolume, sumTotalCollectionVolume),
    // };

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
    if (!item.일자) return;
    if(day < 6 && stockListByPeriod?.week?.length < 5)  {
      stockListByPeriod?.week?.push(item);
    }

    if(week < 5) {
      const weekList = stockListByPeriod[`week${week}`] || []; 
      if(weekList.length < 5) {
        weekList.push(item);
      } else {
        week++;
      }
    }

    if(month < 4) {
      const monthList = stockListByPeriod[`month${month}`] || [];
      if(monthList.length < 30) {
        monthList.push(item);
      } else {
        month++;
      }
    }

    if(quarter < 5) {
      const quarterList = stockListByPeriod[`quarter${quarter}`] || [];
      if(quarterList.length < 90) {
        quarterList.push(item);
      } else {
        quarter++;
      }
    }

  })
  
  return stockListByPeriod;
}
// 수급분석표 로직
export const processingExcelData2 = (data: originalExcelFile) => {

};

const calcPercent = (num1: number, num2: number) => Math.round((num1 / num2) * 100);
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

const initStockListByPeriod = {
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