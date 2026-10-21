import { NextRequest, NextResponse } from 'next/server';
import { guardCheckout } from '@/lib/checkout-guard';
import { PrecheckoutRequestSchema } from '@/lib/schemas';
export async function POST(request:NextRequest) {
  try {
    const store=request.nextUrl.searchParams.get('store');
    if(!store)return NextResponse.json({error:'Store ID is required'},{status:400});
    const body=PrecheckoutRequestSchema.parse(await request.json());
    const guard=await guardCheckout(request,store,body.products);
    if(!guard.ok)return NextResponse.json({error:guard.error,linkAccount:'/link-account'},{status:guard.status});
    return NextResponse.json({error:'Use the identified Cloudy checkout to verify your account.'},{status:409});
  }catch{return NextResponse.json({error:'Invalid checkout request.'},{status:400});}
}
