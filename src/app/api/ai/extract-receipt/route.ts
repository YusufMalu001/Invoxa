export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Call AIService to structure the data
    const prompt = `Extract the following details from this OCR text:
Vendor name, Total amount (number), Date (YYYY-MM-DD), and guess the Category.
Return ONLY valid JSON with keys: vendor, amount, date, category, confidence.
Text: ${text}`;

    const structuredData = await aiService.extractJSON<{
      vendor: string;
      amount: number;
      date: string;
      category: string;
      confidence: number;
    }>(prompt);

    return NextResponse.json(structuredData);
  } catch (error) {
    console.error('OCR Extraction error:', error);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
