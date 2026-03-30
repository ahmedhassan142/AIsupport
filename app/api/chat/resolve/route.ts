// app/api/chat/resolve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { aiChatbotService } from '@/services/AIchatbotservices';
import { cookies } from 'next/headers';

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { conversationId, satisfactionScore } = await req.json();
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }
    
    const result = await aiChatbotService.resolveConversation(conversationId, satisfactionScore);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error resolving conversation:', error);
    return NextResponse.json(
      { error: 'Failed to resolve conversation' },
      { status: 500 }
    );
  }
}