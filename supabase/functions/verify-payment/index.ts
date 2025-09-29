import { corsHeaders } from '../_shared/cors.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY environment variable is required')
}

interface VerifyPaymentRequest {
  reference: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Verifying payment')
    
    const { reference }: VerifyPaymentRequest = await req.json()

    if (!reference) {
      console.error('Missing payment reference')
      return new Response(
        JSON.stringify({ error: 'Payment reference is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Verifying payment with reference: ${reference}`)

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const verificationData = await paystackResponse.json()
    console.log('Paystack verification response:', verificationData)

    if (!paystackResponse.ok || !verificationData.status) {
      console.error('Payment verification failed:', verificationData)
      return new Response(
        JSON.stringify({ 
          status: 'failed', 
          message: verificationData.message || 'Payment verification failed' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const paymentData = verificationData.data

    if (paymentData.status !== 'success') {
      console.error('Payment was not successful:', paymentData.status)
      return new Response(
        JSON.stringify({ 
          status: 'failed', 
          message: `Payment ${paymentData.status}` 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract order data from metadata
    const orderData = JSON.parse(paymentData.metadata.order_data)
    console.log('Creating order with data:', orderData)

    // Create order in database using fetch API
    const orderResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...orderData,
        payment_status: 'paid',
        payment_method: 'paystack'
      })
    })

    if (!orderResponse.ok) {
      console.error('Failed to create order:', await orderResponse.text())
      return new Response(
        JSON.stringify({ 
          status: 'failed', 
          message: 'Failed to create order' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const order = await orderResponse.json()
    console.log('Order created successfully:', order[0]?.id)

    // Clear user's cart
    const cartResponse = await fetch(`${SUPABASE_URL}/rest/v1/shopping_cart?user_id=eq.${orderData.customer_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      }
    })

    if (!cartResponse.ok) {
      console.error('Failed to clear cart:', await cartResponse.text())
      // Don't fail the whole process for cart clearing
    }

    console.log('Payment verification completed successfully')

    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Payment verified and order created',
        order_id: order[0]?.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    
    return new Response(
      JSON.stringify({ 
        status: 'failed',
        message: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})