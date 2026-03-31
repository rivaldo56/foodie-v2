import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { menu_id, meal_id, date_time, guests_count, address, special_requests, payment_model } = body;

    // Prepare payload for Django backend
    const payload: any = {
      booking_date: date_time,
      number_of_guests: Number(guests_count),
      service_address: address,
      special_requests: special_requests,
      service_type: menu_id ? 'marketplace' : 'chef_service',
    };

    if (menu_id) {
      payload.v4_menu_id = menu_id;
    } else if (meal_id) {
      // Legacy meal-only booking path: Map to V3 logic
      // In Django V3, we need a chef_id and a list of menu_items
      // We'll let the backend handle the chef assignment if possible, or we might need to find one.
      // For now, assume the backend handles the mapping or requires a chef_id.
      payload.menu_items = [{ menu_item_id: meal_id, quantity: guests_count }];
      
      // Note: If chef_id is missing, the backend might error. 
      // We should ideally pass chef_id if available in the frontend body.
      if (body.chef_id) {
        payload.chef_id = body.chef_id;
      }
    }

    const response = await fetch(`${API_BASE_URL}/bookings/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
        console.error('[api/bookings POST] Django Error:', response.status, result);
        return NextResponse.json(
          { error: result.detail || result.error || 'Failed to create booking' },
          { status: response.status }
        );
    }

    // Map Django response back to what the frontend expects
    return NextResponse.json(
      {
        success: true,
        booking: { id: result.id },
        payment_url: result.authorization_url, // From Paystack/Mpesa initialization
        deposit_amount: result.down_payment_amount,
        chef_queue_count: result.chef_queue_count || 0,
        sla_expires_at: result.sla_expires_at,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('[api/bookings POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
