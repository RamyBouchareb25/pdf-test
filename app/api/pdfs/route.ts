import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    
    // Read all files in the public directory
    const files = fs.readdirSync(publicDir);
    
    // Filter only PDF files
    const pdfFiles = files.filter(file => 
      path.extname(file).toLowerCase() === '.pdf'
    );
    
    if (pdfFiles.length === 0) {
      return NextResponse.json(
        { message: 'No PDF files found' },
        { status: 404 }
      );
    }
    
    // Get the requested PDF file from query parameter
    const url = new URL(request.url);
    const fileName = url.searchParams.get('file');
    
    if (fileName) {
      // Return specific PDF file
      if (!pdfFiles.includes(fileName)) {
        return NextResponse.json(
          { message: 'PDF file not found' },
          { status: 404 }
        );
      }
      
      const filePath = path.join(publicDir, fileName);
      const fileBuffer = fs.readFileSync(filePath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${fileName}"`,
        },
      });
    } else {
      // Return list of all PDF files
      const pdfList = pdfFiles.map(file => ({
        name: file,
        url: `/api/pdfs?file=${encodeURIComponent(file)}`,
        downloadUrl: `/${file}` // Direct access to public folder
      }));
      
      return NextResponse.json({
        pdfs: pdfList,
        count: pdfFiles.length
      });
    }
    
  } catch (error) {
    console.error('Error handling PDF request:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
