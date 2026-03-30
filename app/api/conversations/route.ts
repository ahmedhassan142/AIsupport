// app/api/conversations/route.ts - UPDATED
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
    const status = searchParams.get('status');
    
    if (status === 'active') {
      const conversations = await aiChatbotService.getActiveConversations();
      return NextResponse.json(conversations);
    }
    
    const conversations = await aiChatbotService.getAllConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    // ✅ FIX: Await cookies() in Next.js 15
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { conversationId, satisfactionScore } = await req.json();
    const result = await aiChatbotService.resolveConversation(conversationId, satisfactionScore);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}