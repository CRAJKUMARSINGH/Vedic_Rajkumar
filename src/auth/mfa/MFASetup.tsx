import React, { useState } from 'react';
import { useUser } from '@clerk/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Smartphone, Check } from 'lucide-react';

export const MFASetup: React.FC = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const setupTOTP = async () => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totp = await (user as any)?.createTOTP?.();
      if (totp?.qrCode) {
        setQrCode(totp.qrCode);
      }
    } catch (err) {
      console.error('Failed to setup TOTP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isMFAEnabled = (user as unknown as { twoFactorEnabled?: boolean })?.twoFactorEnabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isMFAEnabled ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span>MFA is enabled</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Smartphone className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Authenticator App</p>
                <p className="text-sm text-muted-foreground">
                  Use Google Authenticator or similar
                </p>
              </div>
            </div>
            {qrCode ? (
              <div className="flex flex-col items-center">
                <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48" />
                <p className="text-sm text-muted-foreground mt-2">
                  Scan with your authenticator app
                </p>
              </div>
            ) : (
              <Button onClick={setupTOTP} disabled={isLoading}>
                {isLoading ? 'Setting up...' : 'Enable 2FA'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
