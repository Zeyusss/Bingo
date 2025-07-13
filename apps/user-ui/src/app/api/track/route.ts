import { NextRequest, NextResponse } from 'next/server';
import { sendKafkaEvent } from '../../../actions/track-user';

export async function POST(req: NextRequest) {
  try {
    const eventData = await req.json();
    await sendKafkaEvent(eventData);
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json({ status: 'error', error: error?.toString() }, { status: 500 });
  }
} 