// src/components/SaraswatiMascot.tsx
import React from "react";
import { cn } from "@/lib/utils";

/**
 * SaraswatiMascot — the in-app guide (Saraswati, goddess of knowledge).
 *
 * Mounted on the home hero as the navigation anchor: it introduces the app and
 * offers a short, bilingual prompt into the Prashna AI / Kundli flows.
 *
 * The artwork is served from `public/saraswati.jpg`, so it is cached as a static
 * asset and never bundled into the JS chunk.
 */
export interface SaraswatiMascotProps {
  /** Rendered pixel size of the portrait (square). Default 96. */
  size?: number;
  /** Render the Hindi copy when true, English otherwise. Default false. */
  isHi?: boolean;
  /** Optional guidance line. Passing it shows the speech bubble by default. */
  message?: string;
  /** Force the speech bubble on/off, overriding the message-derived default. */
  showMessage?: boolean;
  className?: string;
}

const DEFAULT_MESSAGE = {
  en: "Ask me anything — I will read your chart and answer directly.",
  hi: "मुझसे कुछ भी पूछें — मैं आपकी कुंडली पढ़कर सीधा उत्तर दूँगी।",
} as const;

export const SARASWATI: React.FC<SaraswatiMascotProps> = ({
  size = 96,
  isHi = false,
  message,
  showMessage,
  className,
}) => {
  const bubble = message ?? (isHi ? DEFAULT_MESSAGE.hi : DEFAULT_MESSAGE.en);
  const withBubble = showMessage ?? message !== undefined;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/saraswati.jpg"
        alt={isHi ? "सरस्वती — ज्ञान की देवी" : "Saraswati — goddess of knowledge"}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full border-2 border-[hsl(var(--auspicious-gold)/0.6)] object-cover shadow-lg shadow-black/20"
      />
      {withBubble && (
        <p
          role="note"
          className={cn(
            "max-w-xs rounded-2xl rounded-bl-none border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium leading-relaxed text-white/90 backdrop-blur-sm",
            isHi && "font-hindi",
          )}
        >
          {bubble}
        </p>
      )}
    </div>
  );
};

export default SARASWATI;
