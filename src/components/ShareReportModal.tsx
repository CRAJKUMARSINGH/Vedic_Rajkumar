import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  title: string;
  shareUrl?: string;
  lang?: 'en' | 'hi';
}

export default function ShareReportModal({ title, shareUrl, lang = 'en' }: Props) {
  const isHi = lang === 'hi';
  const [copied, setCopied] = useState(false);
  const url = shareUrl ?? (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-blue-400 text-blue-700">
          <Share2 className="w-4 h-4 mr-1" />
          {isHi ? 'साझा' : 'Share'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">
            {isHi ? 'रिपोर्ट साझा करें' : 'Share Report'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">{title}</p>

          <div className="flex gap-2">
            <Input value={url} readOnly className="text-xs" />
            <Button size="sm" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`}
              alt="QR code"
              className="rounded border"
              width={160}
              height={160}
            />
            <p className="text-[10px] text-muted-foreground">
              {isHi ? 'फोन पर खोलने के लिए QR स्कैन करें' : 'Scan QR to open on phone'}
            </p>
          </div>

          <Button className="w-full" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            {navigator.share
              ? (isHi ? 'सिस्टम शेयर' : 'System Share')
              : (isHi ? 'लिंक कॉपी करें' : 'Copy Link')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
