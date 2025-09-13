import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, User, Mail, MessageSquare } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  seller_name?: string;
  seller_college?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onPayment: (buyerDetails: BuyerDetails) => void;
  isProcessing: boolean;
}

export interface BuyerDetails {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  product,
  onPayment,
  isProcessing
}) => {
  const [buyerDetails, setBuyerDetails] = useState<BuyerDetails>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (field: keyof BuyerDetails, value: string) => {
    console.log('Input change:', field, value); // Debug log
    setBuyerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyerDetails(prev => ({ ...prev, name: e.target.value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyerDetails(prev => ({ ...prev, email: e.target.value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyerDetails(prev => ({ ...prev, phone: e.target.value }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBuyerDetails(prev => ({ ...prev, message: e.target.value }));
  };

  const handleSubmit = () => {
    if (!buyerDetails.name || !buyerDetails.email || !buyerDetails.phone) {
      alert('Please fill in all required fields');
      return;
    }
    onPayment(buyerDetails);
  };

  const handleClose = () => {
    setBuyerDetails({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    onClose();
  };

  if (!product) return null;

  // Debug: Log current state
  console.log('PaymentModal buyerDetails:', buyerDetails);
  console.log('PaymentModal isProcessing:', isProcessing);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] flex flex-col" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-5 h-5" />
            Complete Purchase
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Product Summary */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <h3 className="font-semibold text-lg mb-3 line-clamp-2">{product.title}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Price:</span>
                <span className="text-xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Seller:</span>
                <span className="text-sm font-medium">{product.seller_name || 'Anonymous'}</span>
              </div>
              {product.seller_college && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">College:</span>
                  <span className="text-sm">{product.seller_college}</span>
                </div>
              )}
            </div>
          </div>

          {/* Buyer Details Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buyer-name" className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <input
                id="buyer-name"
                type="text"
                placeholder="Enter your full name"
                value={buyerDetails.name}
                onChange={handleNameChange}
                disabled={isProcessing}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer-email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <input
                id="buyer-email"
                type="email"
                placeholder="Enter your email"
                value={buyerDetails.email}
                onChange={handleEmailChange}
                disabled={isProcessing}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer-phone" className="text-sm font-medium">Phone Number *</Label>
              <input
                id="buyer-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={buyerDetails.phone}
                onChange={handlePhoneChange}
                disabled={isProcessing}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyer-message" className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                Message to Seller (Optional)
              </Label>
              <textarea
                id="buyer-message"
                placeholder="Any specific requirements or questions..."
                rows={2}
                value={buyerDetails.message}
                onChange={handleMessageChange}
                disabled={isProcessing}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4" />
              Payment Information
            </h4>
            <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
              <li>• Secure payment powered by Razorpay</li>
              <li>• Supports UPI, Cards, Net Banking</li>
              <li>• Your payment is protected</li>
            </ul>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="pt-4 border-t bg-background">
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-10"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 h-10 font-medium"
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ₹${product.price.toLocaleString()}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};