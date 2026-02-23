interface LanguageToggleProps {
  lang: "en" | "hi";
  onChange: (lang: "en" | "hi") => void;
}

export default function LanguageToggle({ lang, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-full p-1">
      <button
        onClick={() => onChange("en")}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
          lang === "en" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        English
      </button>
      <button
        onClick={() => onChange("hi")}
        className={`px-3 py-1 rounded-full text-sm font-semibold font-hindi transition-all ${
          lang === "hi" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
