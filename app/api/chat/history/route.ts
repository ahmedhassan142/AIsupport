// app/api/chat/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Conversation } from '@/models/Conversation';
import { connectDB } from '@/lib/db/mongoose';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    
    if (conversationId) {
      const conversation = await Conversation.findOne({ conversationId });
      return NextResponse.json(conversation);
    }
    
    const conversations = await Conversation.find()
      .sort({ lastActivityAt: -1 })
      .limit(50);
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}