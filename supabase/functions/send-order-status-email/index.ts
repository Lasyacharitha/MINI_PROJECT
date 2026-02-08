import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderStatusEmailRequest {
  orderId: string;
  userId: string;
  newStatus: string;
  oldStatus: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, userId, newStatus, oldStatus } = await req.json() as OrderStatusEmailRequest;

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(*)), profiles(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Fetch user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (!profile?.email) {
      throw new Error('User email not found');
    }

    // Format order items for email
    const itemsList = order.order_items
      .map((item: any) => `- ${item.menu_items.name} x ${item.quantity} (₹${(item.price * item.quantity).toFixed(2)})`)
      .join('\n');

    // Create status-specific message
    let statusMessage = '';
    let emailSubject = '';

    switch (newStatus) {
      case 'confirmed':
        statusMessage = 'Your order has been confirmed and will be prepared soon.';
        emailSubject = 'Order Confirmed';
        break;
      case 'preparing':
        statusMessage = 'Your order is now being prepared by our kitchen staff.';
        emailSubject = 'Order Being Prepared';
        break;
      case 'ready':
        statusMessage = 'Your order is ready for pickup! Please come to the canteen counter.';
        emailSubject = 'Order Ready for Pickup';
        break;
      case 'completed':
        statusMessage = 'Your order has been completed. Thank you for your order!';
        emailSubject = 'Order Completed';
        break;
      case 'cancelled':
        statusMessage = 'Your order has been cancelled. If you have any questions, please contact us.';
        emailSubject = 'Order Cancelled';
        break;
      default:
        statusMessage = `Your order status has been updated to: ${newStatus}`;
        emailSubject = 'Order Status Update';
    }

    // Create email HTML content
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #ea580c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .status-badge { display: inline-block; padding: 8px 16px; background-color: #ea580c; color: white; border-radius: 4px; font-weight: bold; text-transform: uppercase; }
    .order-details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e0e0e0; }
    .order-items { margin: 15px 0; }
    .total { font-size: 18px; font-weight: bold; color: #ea580c; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e0e0e0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ SRIT Canteen</h1>
      <p>Order Status Update</p>
    </div>
    <div class="content">
      <h2>Hello!</h2>
      <p>${statusMessage}</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <span class="status-badge">${newStatus}</span>
      </div>

      <div class="order-details">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${orderId.slice(0, 8)}</p>
        <p><strong>Pickup Date:</strong> ${order.pickup_date}</p>
        <p><strong>Pickup Time:</strong> ${order.pickup_time}</p>
        
        <div class="order-items">
          <h4>Items:</h4>
          <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${itemsList}</pre>
        </div>

        ${order.special_instructions ? `<p><strong>Special Instructions:</strong> ${order.special_instructions}</p>` : ''}

        <div class="total">
          Total Amount: ₹${order.total_amount.toFixed(2)}
        </div>
      </div>

      ${newStatus === 'ready' ? `
        <div style="text-align: center;">
          <p style="font-size: 16px; font-weight: bold; color: #ea580c;">
            ⏰ Please collect your order at the canteen counter
          </p>
        </div>
      ` : ''}

      <p style="margin-top: 30px;">
        If you have any questions about your order, please contact the canteen staff.
      </p>
    </div>
    <div class="footer">
      <p>SRIT Canteen Pre-order System</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email using Supabase Auth admin API
    console.log(`Sending order status email to: ${profile.email}`);
    console.log(`Order ID: ${orderId}, New Status: ${newStatus}`);
    
    const { error: emailError } = await supabase.auth.admin.sendEmail({
      email: profile.email,
      subject: `${emailSubject} - SRIT Canteen`,
      html: emailHtml,
    });

    if (emailError) {
      console.error('Email send error:', emailError);
      console.error(`Failed to send email to: ${profile.email}`);
      throw emailError;
    }

    console.log(`✅ Email sent successfully to: ${profile.email}`);
    console.log(`Subject: ${emailSubject} - SRIT Canteen`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        recipient: profile.email,
        status: newStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
