import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Upload, Loader2, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentCode {
  name: string;
  address: string;
  qrCode: string;
  isActive: boolean;
}

interface PaymentSettings {
  _id?: string;
  upiEnabled: boolean;
  upiAddress: string;
  upiQrCode: string;
  upiName: string;
  codePaymentEnabled: boolean;
  paymentCodes: PaymentCode[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PaymentManagement() {
  const { token } = useAuth();
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    upiEnabled: true,
    upiAddress: "",
    upiName: "Vasstra Payments",
    codePaymentEnabled: true,
  });
  const [paymentCodes, setPaymentCodes] = useState<PaymentCode[]>([]);
  const [qrCodePreview, setQrCodePreview] = useState<string>("");
  const [newPaymentCode, setNewPaymentCode] = useState({
    name: "phonepe" as const,
    address: "",
    qrCode: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/payment-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment settings');
      }

      const data = await response.json();
      if (data.paymentSettings) {
        setPaymentSettings(data.paymentSettings);
        setFormData({
          upiEnabled: data.paymentSettings.upiEnabled,
          upiAddress: data.paymentSettings.upiAddress,
          upiName: data.paymentSettings.upiName,
          codePaymentEnabled: data.paymentSettings.codePaymentEnabled,
        });
        setPaymentCodes(data.paymentSettings.paymentCodes || []);
        if (data.paymentSettings.upiQrCode) {
          setQrCodePreview(data.paymentSettings.upiQrCode);
        }
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast({
        title: "Error",
        description: "Failed to load payment settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>, isCodeQr = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        if (isCodeQr) {
          setNewPaymentCode(prev => ({ ...prev, qrCode: base64String }));
        } else {
          setQrCodePreview(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPaymentCode = () => {
    if (!newPaymentCode.address.trim()) {
      toast({
        title: "Error",
        description: "Please enter payment address",
        variant: "destructive",
      });
      return;
    }

    const codeExists = paymentCodes.some(code => code.name === newPaymentCode.name);
    if (codeExists) {
      toast({
        title: "Error",
        description: "This payment method already exists",
        variant: "destructive",
      });
      return;
    }

    setPaymentCodes([
      ...paymentCodes,
      {
        name: newPaymentCode.name,
        address: newPaymentCode.address,
        qrCode: newPaymentCode.qrCode,
        isActive: true,
      },
    ]);

    setNewPaymentCode({
      name: "phonepe",
      address: "",
      qrCode: "",
    });

    if (codeFileInputRef.current) {
      codeFileInputRef.current.value = "";
    }

    toast({
      title: "Success",
      description: "Payment method added",
    });
  };

  const handleRemovePaymentCode = (index: number) => {
    setPaymentCodes(paymentCodes.filter((_, i) => i !== index));
  };

  const handleTogglePaymentCode = (index: number) => {
    setPaymentCodes(paymentCodes.map((code, i) =>
      i === index ? { ...code, isActive: !code.isActive } : code
    ));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate that at least UPI or Code payment is enabled
      if (!formData.upiEnabled && !formData.codePaymentEnabled) {
        toast({
          title: "Error",
          description: "Enable at least one payment method",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Validate UPI settings if enabled
      if (formData.upiEnabled && !formData.upiAddress.trim()) {
        toast({
          title: "Error",
          description: "Please enter UPI address if UPI is enabled",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Validate payment codes if enabled
      if (formData.codePaymentEnabled && paymentCodes.filter((code) => code.isActive).length === 0) {
        toast({
          title: "Error",
          description: "Add at least one active payment code if code payments are enabled",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const dataToSend = {
        upiEnabled: formData.upiEnabled,
        upiAddress: formData.upiAddress,
        upiName: formData.upiName,
        upiQrCode: qrCodePreview,
        codePaymentEnabled: formData.codePaymentEnabled,
        paymentCodes: paymentCodes,
      };

      const response = await fetch(`${API_URL}/admin/payment-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save payment settings');
      }

      setPaymentSettings(responseData.paymentSettings);

      toast({
        title: "Success",
        description: "Payment settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save payment settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        <h2 className="text-2xl font-bold">Payment Settings</h2>
      </div>

      {/* UPI Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>UPI Payment Settings</CardTitle>
          <CardDescription>Configure UPI payment options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable UPI Payments</Label>
              <p className="text-sm text-muted-foreground mt-1">Allow customers to pay via UPI</p>
            </div>
            <Switch
              checked={formData.upiEnabled}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, upiEnabled: checked }))
              }
            />
          </div>

          {formData.upiEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="upi-name">UPI Account Name</Label>
                <Input
                  id="upi-name"
                  placeholder="e.g., Vasstra Payments"
                  value={formData.upiName}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, upiName: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upi-address">UPI Address (UPI ID)</Label>
                <Input
                  id="upi-address"
                  placeholder="e.g., yourname@upi"
                  value={formData.upiAddress}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, upiAddress: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Enter your UPI ID in format: yourname@bankname (e.g., vasstra@okhdfcbank)
                </p>
              </div>

              <div className="space-y-2">
                <Label>UPI QR Code</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  {qrCodePreview ? (
                    <div className="space-y-2">
                      <img
                        src={qrCodePreview}
                        alt="UPI QR Code Preview"
                        className="w-40 h-40 mx-auto rounded"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change QR Code
                      </Button>
                    </div>
                  ) : (
                    <button
                      className="w-full text-center"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload QR code</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQrCodeUpload}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Codes (Phone Pay, Paytm, etc.) */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Codes</CardTitle>
          <CardDescription>Add payment methods like Phone Pay, Google Pay, Paytm, etc.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-base font-medium">Enable Code Payments</Label>
              <p className="text-sm text-muted-foreground mt-1">Allow code-based payment methods</p>
            </div>
            <Switch
              checked={formData.codePaymentEnabled}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, codePaymentEnabled: checked }))
              }
            />
          </div>

          {formData.codePaymentEnabled && (
            <>
              {/* Add New Payment Code */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <h3 className="font-semibold">Add Payment Method</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code-type">Payment Method Type</Label>
                    <Select
                      value={newPaymentCode.name}
                      onValueChange={(value: any) =>
                        setNewPaymentCode(prev => ({ ...prev, name: value }))
                      }
                    >
                      <SelectTrigger id="code-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phonepe">Phone Pay</SelectItem>
                        <SelectItem value="paytm">Paytm</SelectItem>
                        <SelectItem value="googlepay">Google Pay</SelectItem>
                        <SelectItem value="amazon_pay">Amazon Pay</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code-address">Payment Address / ID</Label>
                    <Input
                      id="code-address"
                      placeholder="e.g., yourphone@phonepe or mobile number"
                      value={newPaymentCode.address}
                      onChange={(e) =>
                        setNewPaymentCode(prev => ({ ...prev, address: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>QR Code (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-muted/50">
                    <button
                      className="w-full"
                      onClick={() => codeFileInputRef.current?.click()}
                    >
                      {newPaymentCode.qrCode ? (
                        <div className="space-y-2">
                          <img
                            src={newPaymentCode.qrCode}
                            alt="QR Preview"
                            className="w-24 h-24 mx-auto rounded"
                          />
                          <p className="text-xs">Click to change</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-sm">Click to upload QR code</p>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    ref={codeFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleQrCodeUpload(e, true)}
                  />
                </div>

                <Button
                  onClick={handleAddPaymentCode}
                  className="w-full"
                >
                  Add Payment Method
                </Button>
              </div>

              {/* List of Payment Codes */}
              {paymentCodes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Added Payment Methods</h3>
                  <div className="space-y-2">
                    {paymentCodes.map((code, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 flex items-start justify-between gap-4"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium capitalize">
                              {code.name.replace('_', ' ')}
                            </h4>
                            <Switch
                              checked={code.isActive}
                              onCheckedChange={() => handleTogglePaymentCode(index)}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">{code.address}</p>
                          {code.qrCode && (
                            <img
                              src={code.qrCode}
                              alt={code.name}
                              className="w-20 h-20 rounded border"
                            />
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemovePaymentCode(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full md:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}
