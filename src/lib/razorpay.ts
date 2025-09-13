// Razorpay utility functions
export interface PaymentDetails {
  amount: number;
  currency: string;
  productId: string;
  productTitle: string;
  sellerName: string;
  buyerEmail: string;
  buyerName: string;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Razorpay configuration
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RH3WBrKkiZPWP5';

// Function to load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Function to create Razorpay order
export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  try {
    // In a real application, this should be done on your backend
    // For demo purposes, we'll create a mock order
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: orderId,
      amount: amount * 100, // Razorpay expects amount in paisa
      currency,
      status: 'created'
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Function to initiate payment
export const initiatePayment = async (paymentDetails: PaymentDetails): Promise<RazorpayResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay script failed to load');
      }

      console.log('Starting payment for:', paymentDetails);

      // Simplified Razorpay options without order creation (for testing)
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(paymentDetails.amount * 100), // Convert to paisa
        currency: paymentDetails.currency,
        name: 'Student Store',
        description: `Purchase: ${paymentDetails.productTitle}`,
        prefill: {
          name: paymentDetails.buyerName,
          email: paymentDetails.buyerEmail,
        },
        notes: {
          product_id: paymentDetails.productId,
          seller_name: paymentDetails.sellerName,
        },
        theme: {
          color: '#3B82F6',
        },
        handler: function (response: any) {
          console.log('Payment successful:', response);
          // Create a mock response with the structure we expect
          const mockResponse: RazorpayResponse = {
            razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
            razorpay_order_id: response.razorpay_order_id || `order_${Date.now()}`,
            razorpay_signature: response.razorpay_signature || 'test_signature'
          };
          resolve(mockResponse);
        },
        modal: {
          ondismiss: function () {
            console.log('Payment cancelled by user');
            reject(new Error('Payment was cancelled by user'));
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      
      // Add error handler
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        reject(new Error(`Payment failed: ${response.error.description || 'Unknown error'}`));
      });
      
      // Ensure proper z-index and no conflicts
      razorpay.open();
      
      // Debug: Check if Razorpay modal is opened
      console.log('Razorpay modal opened successfully');
      
      // Ensure the modal is clickable by removing any interfering overlays
      setTimeout(() => {
        const razorpayModal = document.querySelector('.razorpay-checkout-frame');
        if (razorpayModal) {
          console.log('Razorpay modal found in DOM');
          // Ensure it has proper z-index
          (razorpayModal as HTMLElement).style.zIndex = '999999';
          (razorpayModal as HTMLElement).style.pointerEvents = 'auto';
        } else {
          console.warn('Razorpay modal not found in DOM');
        }
      }, 500);
    } catch (error) {
      console.error('Error initiating payment:', error);
      reject(error);
    }
  });
};

// Function to verify payment (should be done on backend in production)
export const verifyPayment = async (paymentResponse: RazorpayResponse) => {
  try {
    // In production, this should be done on your backend with proper signature verification
    console.log('Payment verification:', paymentResponse);
    
    // Mock verification - always returns success for demo
    return {
      success: true,
      payment_id: paymentResponse.razorpay_payment_id,
      order_id: paymentResponse.razorpay_order_id,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};