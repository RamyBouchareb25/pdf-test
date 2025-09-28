import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const fileName = url.searchParams.get('file');
    
    if (!fileName) {
      return NextResponse.json(
        { message: 'File parameter is required' },
        { status: 400 }
      );
    }
    
    const publicDir = path.join(process.cwd(), 'public');
    
    // Read all files in the public directory
    const files = fs.readdirSync(publicDir);
    
    // Filter only PDF files
    const pdfFiles = files.filter(file => 
      path.extname(file).toLowerCase() === '.pdf'
    );
    
    // Check if the requested file is a PDF and exists
    if (!pdfFiles.includes(fileName)) {
      return NextResponse.json(
        { message: 'PDF file not found' },
        { status: 404 }
      );
    }
    
    const filePath = path.join(publicDir, fileName);
    
    // Check if file exists (extra safety check)
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Return the file with download headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('Error handling PDF download:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
