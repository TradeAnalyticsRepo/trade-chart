import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest, res: NextResponse) {
   try {
    const body = await req.json(); 
    const { stockId, processingData, type } = body;

    if (!stockId || !processingData || !type) {
      return NextResponse.json({ message: '필수 항목 누락' }, { status: 400 });
    }

    const fileName = `${stockId}_${type}.json`;
    const filePath = path.join(process.cwd(), 'excel', fileName);

    fs.writeFileSync(filePath, JSON.stringify(processingData, null, 2), 'utf-8');

    return NextResponse.json({ message: '저장 완료', filePath: `/${fileName}` });
  } catch (error) {
    console.error('파일 저장 오류:', error);
    return NextResponse.json({ message: '서버 오류' }, { status: 500 });
  }
}