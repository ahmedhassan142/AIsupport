// app/api/chat/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { aiChatbotService } from '@/services/AIchatbotservices';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { message, conversationId, customerInfo } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Process message with AI
    const result = await aiChatbotService.processMessage(
      message,
      conversationId,
      customerInfo || { name: 'Customer' }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}