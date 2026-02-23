import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BirthInputFormProps {
  lang: "en" | "hi";
  onSubmit: (data: { date: string; time: string; location: string }) => void;
}

const labels = {
  en: {
    title: "Enter Birth Details",
    date: "Date of Birth",
    time: "Time of Birth",
    location: "Place of Birth",
    submit: "Get Transit Reading",
    datePlaceholder: "e.g. 15-09-1963",
    timePlaceholder: "e.g. 06:00 AM",
    locationPlaceholder: "e.g. Udaipur, Rajasthan",
  },
  hi: {
    title: "जन्म विवरण दर्ज करें",
    date: "जन्म तिथि",
    time: "जन्म समय",
    location: "जन्म स्थान",
    submit: "गोचर फल देखें",
    datePlaceholder: "जैसे 15-09-1963",
    timePlaceholder: "जैसे 06:00 AM",
    locationPlaceholder: "जैसे उदयपुर, राजस्थान",
  },
};

export default function BirthInputForm({ lang, onSubmit }: BirthInputFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const t = labels[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && time && location) {
      onSubmit({ date, time, location });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-5">
      <h2 className={`text-2xl font-heading font-bold text-center text-secondary ${lang === "hi" ? "font-hindi" : ""}`}>
        {t.title}
      </h2>
      <div className="space-y-2">
        <Label htmlFor="dob" className={lang === "hi" ? "font-hindi" : ""}>{t.date}</Label>
        <Input
          id="dob"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-background border-border"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tob" className={lang === "hi" ? "font-hindi" : ""}>{t.time}</Label>
        <Input
          id="tob"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-background border-border"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pob" className={lang === "hi" ? "font-hindi" : ""}>{t.location}</Label>
        <Input
          id="pob"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t.locationPlaceholder}
          className="bg-background border-border"
          required
        />
      </div>
      <Button type="submit" className="w-full text-base font-semibold" size="lg">
        {lang === "hi" ? <span className="font-hindi">{t.submit}</span> : t.submit}
      </Button>
    </form>
  );
}
