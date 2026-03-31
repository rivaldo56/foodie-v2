import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { status?: string };
  try {
    body = await _request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    // Call Django admin booking endpoint
    const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[API] Admin booking update error:', result);
      return NextResponse.json({ error: result.detail || 'Failed to update booking' }, { status: response.status });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API] Unexpected error during admin update:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
