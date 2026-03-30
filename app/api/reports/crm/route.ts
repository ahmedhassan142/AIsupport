// app/api/reports/crm/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server';
import { aiChatbotService } from '@/services/AIchatbotservices';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // ✅ FIX: Await cookies() in Next.js 15
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const report = await aiChatbotService.getCRMReport(startDate, endDate);
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching CRM report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}