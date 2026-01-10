import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Truck, Shield, CreditCard, CheckCircle2, Loader2, X, DollarSign } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, totalSavings, clearCart } = useCart();
  const { addOrder } = useOrders();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [codTransactionId, setCodTransactionId] = useState("");
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
    discountValue: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [isLoadingPaymentSettings, setIsLoadingPaymentSettings] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch payment settings on component mount
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/payment-settings`);
        if (response.ok) {
          const data = await response.json();
          setPaymentSettings(data.paymentSettings);
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
      } finally {
        setIsLoadingPaymentSettings(false);
      }
    };

    fetchPaymentSettings();
  }, []);

  const shippingCost = subtotal >= 999 ? 0 : 99;
  const discountAmount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await fetch(
        `${API_URL}/coupons/validate/${encodeURIComponent(couponCode.toUpperCase())}?orderAmount=${subtotal}`,
        {
          method: 'GET',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Invalid coupon code");
        return;
      }

      setAppliedCoupon({
        code: data.coupon.code,
        discount: data.coupon.discount,
        discountType: data.coupon.discountType,
        discountValue: data.coupon.discountValue,
      });

      toast.success(`Coupon ${data.coupon.code} applied! You saved ₹${data.coupon.discount}`);
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate transaction ID for COD and UPI
    if (paymentMethod === "cod" && !codTransactionId.trim()) {
      toast.error("Please enter transaction ID for COD payment");
      return;
    }

    if (paymentMethod === "upi" && !upiTransactionId.trim()) {
      toast.error("Please enter transaction ID for UPI payment");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData(e.currentTarget);
      const shippingAddress = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        pincode: formData.get("pincode") as string,
      };

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create order on backend
      const paymentDetails = paymentMethod === "cod" ? { transactionId: codTransactionId } :
                            paymentMethod === "upi" ? { transactionId: upiTransactionId } :
                            undefined;

      const newOrderId = await addOrder({
        items: [...items],
        subtotal,
        shipping: shippingCost,
        total,
        totalAmount: total,
        shippingAddress,
        paymentDetails,
      }, paymentMethod);

      setOrderId(newOrderId);
      setIsProcessing(false);
      setOrderComplete(true);
      clearCart();
      setCodTransactionId("");
      setUpiTransactionId("");
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error('Error placing order:', error);
      setIsProcessing(false);
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center py-16">
              <h1 className="font-display text-2xl font-bold mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart before checking out.
              </p>
              <Button asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (orderComplete) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center py-16">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-4">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-2">
                Thank you for your order. We've sent a confirmation email with order details.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Order #{orderId}
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/orders">View Order History</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | Vasstra - Secure Payment</title>
        <meta name="description" content="Complete your order securely at Vasstra. Free shipping on orders above ₹999." />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Checkout</span>
          </nav>
        </div>

        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left - Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Contact Information */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Contact Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="+91 98765 43210" required />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Shipping Address</h2>
                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="First name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Last name" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="Street address" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                      <Input id="apartment" placeholder="Apartment, suite, etc." />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="City" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="State" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">PIN Code</Label>
                        <Input id="pincode" placeholder="PIN code" required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Promo Code</h2>
                  <div className="space-y-4">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div>
                          <p className="font-semibold text-green-600">{appliedCoupon.code}</p>
                          <p className="text-sm text-green-600">
                            Discount: ₹{appliedCoupon.discount}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleApplyCoupon();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim()}
                        >
                          {isValidatingCoupon && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="font-display text-xl font-semibold mb-6">Payment Method</h2>
                  <RadioGroup value={paymentMethod} onValueChange={(value) => {
                    setPaymentMethod(value);
                    if (value !== "cod") {
                      setCodTransactionId("");
                    }
                    if (value !== "upi") {
                      setUpiTransactionId("");
                    }
                  }}>
                    <div className="space-y-3">
                      <label
                        htmlFor="card"
                        className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="card" id="card" />
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="font-medium">Credit / Debit Card</span>
                          <p className="text-sm text-muted-foreground">Pay securely with your card</p>
                        </div>
                      </label>
                      <label
                        htmlFor="upi"
                        className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="upi" id="upi" />
                        <div className="h-5 w-5 flex items-center justify-center text-muted-foreground font-bold text-xs">
                          UPI
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">UPI Payment</span>
                          <p className="text-sm text-muted-foreground">Pay with Google Pay, PhonePe, Paytm</p>
                        </div>
                      </label>
                      <label
                        htmlFor="netbanking"
                        className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === "netbanking" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="netbanking" id="netbanking" />
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="font-medium">Net Banking</span>
                          <p className="text-sm text-muted-foreground">All major banks supported</p>
                        </div>
                      </label>
                      <label
                        htmlFor="cod"
                        className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value="cod" id="cod" />
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="font-medium">Cash on Delivery (COD)</span>
                          <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  {/* COD Details */}
                  {paymentMethod === "cod" && (
                    <div className="mt-6 pt-6 border-t border-border space-y-4">
                      <h3 className="font-semibold">Cash on Delivery Details</h3>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-sm text-foreground mb-3">
                          After placing your order, scan the QR code or use the payment details provided to complete the payment.
                        </p>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="transaction-id">Transaction ID / Payment Reference</Label>
                            <Input
                              id="transaction-id"
                              placeholder="Enter transaction ID after payment (e.g., TXN123456789)"
                              value={codTransactionId}
                              onChange={(e) => setCodTransactionId(e.target.value)}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              This helps us confirm your payment when the delivery partner arrives
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Details */}
                  {paymentMethod === "upi" && (
                    <div className="mt-6 pt-6 border-t border-border space-y-4">
                      <h3 className="font-semibold">UPI Payment</h3>
                      {paymentSettings?.upiEnabled ? (
                        <>
                          {paymentSettings?.upiQrCode && (
                            <div className="flex flex-col items-center">
                              <img
                                src={paymentSettings.upiQrCode}
                                alt="UPI QR Code"
                                className="w-48 h-48 border-2 border-border rounded-lg p-2 bg-white"
                              />
                              <p className="text-xs text-muted-foreground mt-3">
                                Scan this QR code with any UPI app
                              </p>
                            </div>
                          )}
                          {paymentSettings?.upiAddress && (
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                              <p className="text-xs text-muted-foreground mb-1">UPI Address</p>
                              <p className="font-mono text-sm font-semibold break-all">
                                {paymentSettings.upiAddress}
                              </p>
                            </div>
                          )}
                          {paymentSettings?.paymentCodes && paymentSettings.paymentCodes.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold">Other Payment Methods:</p>
                              <div className="grid grid-cols-1 gap-2">
                                {paymentSettings.paymentCodes.filter((code: any) => code.isActive).map((code: any, index: number) => (
                                  <div key={index} className="border border-border rounded-lg p-3">
                                    <p className="text-sm font-medium capitalize mb-1">
                                      {code.name.replace('_', ' ')}
                                    </p>
                                    {code.qrCode && (
                                      <img
                                        src={code.qrCode}
                                        alt={code.name}
                                        className="w-24 h-24 mx-auto border border-border rounded p-1 bg-white mb-2"
                                      />
                                    )}
                                    {code.address && (
                                      <p className="text-xs text-muted-foreground text-center break-all">
                                        {code.address}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
                            <p className="text-sm text-foreground">
                              After scanning and paying via UPI, enter your transaction ID below:
                            </p>
                            <div className="space-y-2">
                              <Label htmlFor="upi-transaction-id">Transaction ID / Reference</Label>
                              <Input
                                id="upi-transaction-id"
                                placeholder="Enter UPI transaction ID (e.g., UPI123456789)"
                                value={upiTransactionId}
                                onChange={(e) => setUpiTransactionId(e.target.value)}
                                className="font-mono text-sm"
                              />
                              <p className="text-xs text-muted-foreground">
                                You can find this in your UPI app payment confirmation
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                          <p className="text-sm text-foreground">
                            UPI payment is currently not available. Please choose another payment method.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                  <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.size}`} className="flex gap-3">
                        <div className="relative w-16 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                          {item.size && (
                            <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                          )}
                          <p className="text-sm font-semibold text-primary mt-1">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Savings</span>
                        <span>-₹{totalSavings.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shippingCost === 0 ? "text-green-600" : ""}>
                        {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-display text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      <span>Fast Delivery</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Pay ₹${total.toLocaleString()}`}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    By placing this order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
