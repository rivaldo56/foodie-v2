import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access')?.value;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'chef';
  const limit = parseInt(searchParams.get('limit') || '10');

  console.log(`[API] AI Recommendations Feed requested - Type: ${type}, Limit: ${limit}`);

  try {
    // Fetch from Django AI recommendation engine
    const response = await fetch(`${API_BASE_URL}/ai/recommendations/feed/?type=${type}&limit=${limit}`, {
      headers: {
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[API] Error fetching recommendations:', result);
      return NextResponse.json({ error: result.detail || 'Failed to fetch recommendations' }, { status: response.status });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
