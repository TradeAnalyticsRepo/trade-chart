import { baseDataBeforeProcess, originalExcelFile } from "@/types/excel";
import { ExcelData } from "@/types/trade";
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

  Trust: "Trust",
  TotalForeAndInst: "TotalForeAndInst",
});

export const handleExcel = async (originalExcelFile: File) => {
  console.log(originalExcelFile);
  // const formData = new FormData();
  // formData.append('file', file);
  const arrayBuffer = await originalExcelFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data: originalExcelFile[] = XLSX.utils.sheet_to_json(sheet);

  console.log(data);

  const baseDataBeforeProcess: baseDataBeforeProcess = stockDataBeforeProcess(data);

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

export const stockDataBeforeProcess = (data: originalExcelFile[]): baseDataBeforeProcess => {
  const baseDataBeforeProcess: baseDataBeforeProcess = {
    cumulativeStockData: {
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
    },

    stockListByPeriod: {
      weekList: [],
      week1List: [],
      week2List: [],
      week3List: [],
      week4List: [],
      quarter1List: [],
      quarter2List: [],
      quarter3List: [],
      quarter4List: [],
      year1List: [],
      year2List: [],
      year3List: [],
      year4List: [],
      year5List: [],
      year6List: [],
      year7List: [],
      year8List: [],
      year9List: [],
      year10List: [],
    },
  };

  data.forEach((item) => {
    /**
     * 투자자별 누적합계, 최저점, 최고점
     */
    Object.keys(excelEnum).forEach((key: string) => {
      if (key === "TotalForeAndInst") {
        // 외국인 + 기관
        const cumulativeMount =
          baseDataBeforeProcess.cumulativeStockData.cumulativeForeMount + baseDataBeforeProcess.cumulativeStockData.cumulativeTotalInsMount;
        baseDataBeforeProcess.cumulativeStockData.cumulativeTotalForeAndInstMount = cumulativeMount;

        if (baseDataBeforeProcess.cumulativeStockData.minTotalForeAndInstMount > cumulativeMount) {
          baseDataBeforeProcess.cumulativeStockData.minTotalForeAndInstMount = cumulativeMount;
        } else if (baseDataBeforeProcess.cumulativeStockData.maxTotalForeAndInstMount < cumulativeMount) {
          baseDataBeforeProcess.cumulativeStockData.maxTotalForeAndInstMount = cumulativeMount;
        }
      } else if (key === "Trust") {
        // 투신 -> (일반 + 특수)
        const cumulativeMount =
          baseDataBeforeProcess.cumulativeStockData.cumulativeGTrustMount + baseDataBeforeProcess.cumulativeStockData.cumulativeSTrustMount;
        baseDataBeforeProcess.cumulativeStockData.cumulativeTrustMount = cumulativeMount;

        if (baseDataBeforeProcess.cumulativeStockData.minTrustMount > cumulativeMount) {
          baseDataBeforeProcess.cumulativeStockData.minTrustMount = cumulativeMount;
        } else if (baseDataBeforeProcess.cumulativeStockData.maxTrustMount < cumulativeMount) {
          baseDataBeforeProcess.cumulativeStockData.maxTrustMount = cumulativeMount;
        }
      } else if (Number(item[key])) {
        const cumulativeKey = `cumulative${excelEnum[key]}Mount`;
        const minKey = `min${excelEnum[key]}Mount`;
        const maxKey = `max${excelEnum[key]}Mount`;

        // [key]누적합계
        const cumulativeMount = baseDataBeforeProcess.cumulativeStockData[cumulativeKey] + Number(item[key]);
        baseDataBeforeProcess.cumulativeStockData[cumulativeKey] = cumulativeMount;

        // [key]min, max
        if (baseDataBeforeProcess.cumulativeStockData[minKey] > cumulativeMount) {
          baseDataBeforeProcess.cumulativeStockData[minKey] = cumulativeMount;
        } else if (baseDataBeforeProcess.cumulativeStockData[maxKey] < cumulativeMount) {
          baseDataBeforeProcess.cumulativeStockData[maxKey] = cumulativeMount;
        }
      }
    });
    /**
     * TODO 기간별 list 잘라서 넣어주기
     */
  });
  console.log(baseDataBeforeProcess);
  return baseDataBeforeProcess;
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
    trustCollectionVolume: cumulativeStockData.cumulativeTrustMount - cumulativeStockData.minTrustMount,
    etcFinCollectionVolume: cumulativeStockData.cumulativeEtcFinMount - cumulativeStockData.minEtcFinMount,
    bankCollectionVolume: cumulativeStockData.cumulativeBankMount - cumulativeStockData.minBankMount,
    pensCollectionVolume: cumulativeStockData.cumulativePensMount - cumulativeStockData.minPensMount,
    gTrustCollectionVolume: cumulativeStockData.cumulativeGTrustMount - cumulativeStockData.minGTrustMount,
    sTrustCollectionVolume: cumulativeStockData.cumulativeSTrustMount - cumulativeStockData.minSTrustMount,
    natCollectionVolume: cumulativeStockData.cumulativeNatMount - cumulativeStockData.minNatMount,
    etcCollectionVolume: cumulativeStockData.cumulativeEtcMount - cumulativeStockData.minEtcMount,
  };

  const result: ExcelData[] = [];

  data.forEach((item) => {
    if (!item.일자) return;
    let sumTotalCollectionVolume = 0;
    Object.entries(excelEnum).forEach(([key, value]) => {
      if (value === "Trust") {
        volume.trustCollectionVolume += item.__EMPTY_1 + item.__EMPTY_2;
      } else if (value === "TotalForeAndInst") {
        volume.totalForeAndInstCollectionVolume += item.외국인 + item.기관종합;
      } else {
        volume[`${toCamel(value)}CollectionVolume`] += item[key];
        sumTotalCollectionVolume += volume[`${toCamel(value)}CollectionVolume`];
      }
    });

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
      tradingVolumeTrust: item.__EMPTY_1 + item.__EMPTY_2,
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
      trustCollectionVolume: volume.trustCollectionVolume,
      trustDispersionRatio: calcPercent(
        volume.trustCollectionVolume,
        cumulativeStockData.cumulativeTrustMount + cumulativeStockData.maxTrustMount - cumulativeStockData.minTrustMount
      ),
      trustStockMomentum: calcPercent(volume.trustCollectionVolume, sumTotalCollectionVolume),
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

    result.push(dayValue);
  });

  return result;
};

// 수급분석표 로직
export const processingExcelData2 = (data: originalExcelFile) => {};

const calcPercent = (num1: number, num2: number) => Math.round((num1 / num2) * 100);
const toCamel = (str: string) => str[0].toLowerCase() + str.slice(1);
