import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

// GET – fetch chef's own availability rules (mapped to ChefEvents)
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/chefs/events/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.detail || 'Failed to fetch availability' }, { status: response.status });
    }

    // Map Django ChefEvent fields back to what the frontend expects for availability rules
    const mappedData = result.map((event: any) => ({
      id: event.id,
      type: event.title, // Map title back to type
      start_at: event.start_time,
      end_at: event.end_time,
      notes: event.description,
      is_all_day: event.is_all_day,
      created_at: event.created_at,
    }));

    return NextResponse.json({ data: mappedData });
  } catch (error) {
    console.error('[api/chef/availability GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST – upsert availability rule (mapped to ChefEvent)
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, start_at, end_at, day_of_week, available_from, available_until, service_type, notes } = body;

    // Map frontend availability to ChefEvent
    // Note: ChefEvent doesn't currently support recurring 'day_of_week'.
    // One-off blocks are mapped directly.
    const payload = {
      title: type || 'Availability Block',
      start_time: start_at || `${new Date().toISOString().split('T')[0]}T${available_from || '09:00'}:00Z`,
      end_time: end_at || `${new Date().toISOString().split('T')[0]}T${available_until || '17:00'}:00Z`,
      description: notes || `Service: ${service_type || 'General'}`,
      is_all_day: false,
    };

    const response = await fetch(`${API_BASE_URL}/chefs/events/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result.detail || 'Failed to create availability' }, { status: response.status });
    }

    // Map back for frontend
    const mappedResult = {
        id: result.id,
        type: result.title,
        start_at: result.start_time,
        end_at: result.end_time,
        notes: result.description,
    };

    return NextResponse.json({ data: mappedResult }, { status: 201 });
  } catch (error) {
    console.error('[api/chef/availability POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE – remove an availability rule by id
export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id param' }, { status: 400 });

    const response = await fetch(`${API_BASE_URL}/chefs/events/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        return NextResponse.json({ error: result.detail || 'Failed to delete availability' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/chef/availability DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
