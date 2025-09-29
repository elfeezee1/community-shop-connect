import { corsHeaders } from '../_shared/cors.ts'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY')

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY environment variable is required')
}

interface PaymentRequest {
  amount: number
  email: string
  reference: string
  orderData: any
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Processing payment request')
    
    const { amount, email, reference, orderData }: PaymentRequest = await req.json()

    // Input validation
    if (!amount || !email || !reference || !orderData) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('Invalid email format')
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate amount
    if (amount <= 0 || amount > 10000000) { // Max 100,000 NGN in kobo
      console.error('Invalid amount')
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Initializing payment for ${email}, amount: ${amount} kobo`)

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        email,
        reference,
        callback_url: `${req.headers.get('origin')}/payment/callback`,
        metadata: {
          order_data: JSON.stringify(orderData)
        }
      }),
    })

    const responseData = await paystackResponse.json()
    console.log('Paystack response:', responseData)

    if (!paystackResponse.ok) {
      console.error('Paystack error:', responseData)
      return new Response(
        JSON.stringify({ error: 'Payment initialization failed', details: responseData.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!responseData.status) {
      console.error('Paystack initialization failed:', responseData)
      return new Response(
        JSON.stringify({ error: 'Payment initialization failed', details: responseData.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Payment initialized successfully')
    
    return new Response(
      JSON.stringify(responseData.data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})