import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Call Django confirm-satisfaction endpoint
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/confirm-satisfaction/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[API] Error confirming satisfaction:', result);
      return NextResponse.json({ error: result.detail || 'Failed to confirm booking' }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      booking: result,
      message: 'Booking confirmed and escrow released'
    });
  } catch (err) {
    console.error('[API] Unexpected error during confirmation:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
