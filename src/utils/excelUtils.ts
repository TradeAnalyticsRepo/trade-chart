import { excelFile } from '@/types/excel';
import * as XLSX from 'xlsx';

export const handleExcel = async (excelFile: File) => {
    console.log(excelFile);
    // const formData = new FormData();
    // formData.append('file', file);
  const arrayBuffer = await excelFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  // promise로 병렬처리 어떤지 고민
  processingExcelData(data);
  processingExcelData2(data);
  
}

// 수급표 로직
export const processingExcelData = (data: excelFile) => {

}

// 수급계산
export const processingExcelData2 = (data: excelFile) => {

}