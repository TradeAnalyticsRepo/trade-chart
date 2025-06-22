import { ToggleButton } from "@/ui/ui";
import { getExcelData, handleExcel } from "@/utils/excelUtils";
import React, { useRef } from "react";

const ExcelUploadButton = () => {
  /** 엑셀 파일 업로드 input 참조 */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 엑셀 파일 업로드 처리 함수
   * @param e - 파일 input change 이벤트
   */
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      //   handleExcel(file);
      const data = await getExcelData(file);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ToggleButton
      onClick={() => {
        fileInputRef.current?.click();
      }}>
      엑셀업로드
      <input
        type='file'
        accept='.xlsx, .xls'
        ref={fileInputRef}
        style={{
          display: "none",
        }}
        onChange={handleExcelUpload}
      />
    </ToggleButton>
  );
};

export default ExcelUploadButton;
