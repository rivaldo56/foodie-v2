import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: bookingId } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    // 1. Find the pending assignment for this booking and this chef
    // We can filter by booking_id in the assignments list
    const assignmentsRes = await fetch(`${API_BASE_URL}/bookings/api/assignments/?booking=${bookingId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!assignmentsRes.ok) {
        return NextResponse.json({ error: 'Failed to find booking assignment' }, { status: assignmentsRes.status });
    }

    const assignments = await assignmentsRes.json();
    // In Django, we get a list. Find the one with status 'pending'
    const pendingAssignment = assignments.find((a: any) => a.status === 'pending' && Number(a.booking) === Number(bookingId));

    if (!pendingAssignment) {
        return NextResponse.json({ error: 'No pending assignment found for this booking' }, { status: 404 });
    }

    // 2. Call the respond action on the assignment
    const respondRes = await fetch(`${API_BASE_URL}/bookings/api/assignments/${pendingAssignment.id}/respond/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            response: 'accepted',
            response_time_seconds: body.response_time_seconds || 0,
        }),
    });

    const result = await respondRes.json();

    if (!respondRes.ok) {
        return NextResponse.json({ error: result.detail || 'Failed to accept booking' }, { status: respondRes.status });
    }

    return NextResponse.json({ 
        success: true, 
        booking_id: bookingId, 
        status: 'confirmed',
        message: result.message
    });

  } catch (err: any) {
    console.error('[chef/bookings/accept]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
