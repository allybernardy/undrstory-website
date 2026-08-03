// This file should be placed at: functions/create-checkout-session.js in your repo

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, email, company, moment } = JSON.parse(event.body);

    // Validate required fields
    if (!name || !email || !company || !moment) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'the canopy walk',
              description: 'two-hour strategic advisory session with written read',
              images: ['https://undrstory.ink/canopy-walk.jpg']
            },
            unit_amount: 50000 // $500 in cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: 'https://undrstory.ink/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://undrstory.ink/book',
      customer_email: email,
      metadata: {
        name,
        email,
        company,
        moment
      },
      billing_address_collection: 'auto'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id })
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
};
