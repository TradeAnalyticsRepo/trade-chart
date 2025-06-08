import { baseDataBeforeProcess, originalExcelFile } from '@/types/excel';
import { ExcelData } from '@/types/trade';
import * as XLSX from 'xlsx';

const excelEnum = Object.freeze({
    '개인': 'Indiv',
    '기관종합': 'TotalIns',
    '외국인': 'Fore',
    '기관': 'FinInv',
    '기타': 'Etc',
    '__EMPTY_1': 'GTrust',
    '__EMPTY_2': 'STrust',
    '__EMPTY_3': 'Bank',
    '__EMPTY_4': 'Insur',
    '__EMPTY_5': 'EtcFin',
    '__EMPTY_6': 'Pens',
    '__EMPTY_7': 'Nat',

    'Trust' : 'Trust',
    'TotalForeAndInst' : 'TotalForeAndInst',
})

export const handleExcel = async (originalExcelFile: File) => {
    console.log(originalExcelFile);
    // const formData = new FormData();
    // formData.append('file', file);
    const arrayBuffer = await originalExcelFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(data);

    const baseDataBeforeProcess:baseDataBeforeProcess = stockDataBeforeProcess(data);
    
    // promise로 병렬처리 어떤지 고민
    processingExcelData(data, baseDataBeforeProcess.cumulativeStockData);
    processingExcelData2(data);
  
}

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
            maxGTrustMount: 0
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
            year10List: []
        }
    }

    data.forEach(item => {
        /**
         * 투자자별 누적합계, 최저점, 최고점 
         */
        Object.keys(excelEnum).forEach((key:string) => {
            if(key === 'TotalForeAndInst') { // 외국인 + 기관
                const cumulativeMount = baseDataBeforeProcess.cumulativeStockData.cumulativeForeMount + baseDataBeforeProcess.cumulativeStockData.cumulativeTotalInsMount;
                baseDataBeforeProcess.cumulativeStockData.cumulativeTotalForeAndInstMount = cumulativeMount;

                if(baseDataBeforeProcess.cumulativeStockData.minTotalForeAndInstMount > cumulativeMount) {
                    baseDataBeforeProcess.cumulativeStockData.minTotalForeAndInstMount = cumulativeMount;
                } else if(baseDataBeforeProcess.cumulativeStockData.maxTotalForeAndInstMount < cumulativeMount) {
                    baseDataBeforeProcess.cumulativeStockData.maxTotalForeAndInstMount = cumulativeMount;
                }
            } else if( key === 'Trust') { // 투신 -> (일반 + 특수)
                const cumulativeMount = baseDataBeforeProcess.cumulativeStockData.cumulativeGTrustMount + baseDataBeforeProcess.cumulativeStockData.cumulativeSTrustMount;
                baseDataBeforeProcess.cumulativeStockData.cumulativeTrustMount = cumulativeMount;

                if(baseDataBeforeProcess.cumulativeStockData.minTrustMount > cumulativeMount) {
                    baseDataBeforeProcess.cumulativeStockData.minTrustMount = cumulativeMount;
                } else if(baseDataBeforeProcess.cumulativeStockData.maxTrustMount < cumulativeMount) {
                    baseDataBeforeProcess.cumulativeStockData.maxTrustMount = cumulativeMount;
                }
            } else if(Number(item[key])) {
                const cumulativeKey = `cumulative${excelEnum[key]}Mount`;
                const minKey = `min${excelEnum[key]}Mount`;
                const maxKey = `max${excelEnum[key]}Mount`;

                // [key]누적합계
                const cumulativeMount = baseDataBeforeProcess.cumulativeStockData[cumulativeKey] + Number(item[key]);
                baseDataBeforeProcess.cumulativeStockData[cumulativeKey] = cumulativeMount;

                // [key]min, max 
                if(baseDataBeforeProcess.cumulativeStockData[minKey] > cumulativeMount) {
                    baseDataBeforeProcess.cumulativeStockData[minKey] = cumulativeMount;
                } else if(baseDataBeforeProcess.cumulativeStockData[maxKey] < cumulativeMount) {
                    baseDataBeforeProcess.cumulativeStockData[maxKey] = cumulativeMount;
                }
            }
        })
        /**
         * TODO 기간별 list 잘라서 넣어주기
         */
    });
    console.log(baseDataBeforeProcess);
    return baseDataBeforeProcess;
}


// 수급계산 로직
export const processingExcelData = (data: originalExcelFile[], cumulativeStockData: baseDataBeforeProcess["cumulativeStockData"]) => {
    let indivCollectionVolume = cumulativeStockData.cumulativeIndivMount - cumulativeStockData.minIndivMount;
    let totalForeAndInstCollectionVolume = cumulativeStockData.cumulativeTotalForeAndInstMount;
    let foreCollectionVolume = cumulativeStockData.cumulativeForeMount;
    let finInvCollectionVolume = cumulativeStockData.cumulativeFinInvMount;
    let insurCollectionVolume = cumulativeStockData.cumulativeInsurMount;
    let trustCollectionVolume = cumulativeStockData.cumulativeTrustMount;
    let etcFinCollectionVolume = cumulativeStockData.cumulativeEtcFinMount;
    let bankCollectionVolume = cumulativeStockData.cumulativeBankMount;
    let pensCollectionVolume = cumulativeStockData. cumulativePensMount;
    let sTrustCollectionVolume = cumulativeStockData.cumulativeSTrustMount;
    let natCollectionVolume = cumulativeStockData.cumulativeNatMount;
    let etcCollectionVolume = cumulativeStockData.cumulativeEtcMount;

    const result: ExcelData[] = [

    ]

    data.forEach(item => {
        if(!item.일자) return;
        indivCollectionVolume -= item.개인


        const data:ExcelData = {
            tradeDate: '',
            endMount: 0,
            previousDayComparison: 0,
            tradingVolume: 0,
            indivCollectionVolume: indivCollectionVolume,
            indivDispersionRatio: indivCollectionVolume / ( cumulativeStockData.maxIndivMount - cumulativeStockData.minIndivMount ),
            totalForeAndInstCollectionVolume: 0,
            totalForeAndInstDispersionRatio: 0,
            foreCollectionVolume: 0,
            foreDispersionRatio: 0,
            totalInsCollectionVolume: 0,
            totalInsDispersionRatio: 0,
            finInvCollectionVolume: 0,
            finInvDispersionRatio: 0,
            insurCollectionVolume: 0,
            insurDispersionRatio: 0,
            trustCollectionVolume: 0,
            trustDispersionRatio: 0,
            etcFinCollectionVolume: 0,
            etcFinDispersionRatio: 0,
            bankCollectionVolume: 0,
            bankDispersionRatio: 0,
            pensCollectionVolume: 0,
            pensDispersionRatio: 0,
            sTrustCollectionVolume: 0,
            sTrustDispersionRatio: 0,
            natCollectionVolume: 0,
            natDispersionRatio: 0,
            etcCollectionVolume: 0,
            etcDispersionRatio: 0
        };

        result.push(data);
    });

    console.log(result);

}

// 수급분석표 로직
export const processingExcelData2 = (data: originalExcelFile) => {
    
}