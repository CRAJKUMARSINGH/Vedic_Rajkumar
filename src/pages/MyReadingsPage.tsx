import { useState, useCallback } from "react";
import { useUser } from "@clerk/react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Trash2, Star, Calendar, MapPin, Clock, Plus, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Reading {
  id: string;
  title: string | null;
  birth_date: string;
  birth_time: string | null;
  birth_location: string | null;
  chart_type: string;
  notes: string | null;
  results: Record<string, unknown> | null;
  created_at: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchReadings(): Promise<Reading[]> {
  const res = await fetch(`${BASE}/api/readings`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load readings");
  return res.json();
}

async function deleteReading(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/readings/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete reading");
}

const chartTypeLabel: Record<string, string> = {
  transit: "Transit",
  natal: "Natal Chart",
  dasha: "Dasha",
  matching: "Match Making",
  divisional: "Divisional",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ReadingCard({ reading, onDelete }: { reading: Reading; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);
  const label = chartTypeLabel[reading.chart_type] ?? reading.chart_type;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative rounded-2xl border border-amber-200/30 bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-base leading-tight text-foreground truncate">
              {reading.title || reading.birth_location || "Unnamed Reading"}
            </h3>
            <Badge variant="secondary" className="shrink-0 text-xs bg-amber-100 text-amber-800 border-0">
              {label}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
            {reading.birth_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {reading.birth_date}
              </span>
            )}
            {reading.birth_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {reading.birth_time}
              </span>
            )}
            {reading.birth_location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {reading.birth_location}
              </span>
            )}
          </div>

          {reading.notes && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{reading.notes}</p>
          )}

          <p className="mt-3 text-xs text-muted-foreground/70">
            Saved {formatDate(reading.created_at)}
          </p>
        </div>

        <div className="shrink-0">
          {confirming ? (
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-3 text-xs"
                onClick={() => onDelete(reading.id)}
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MyReadingsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: readings, isLoading, isError } = useQuery<Reading[]>({
    queryKey: ["my-readings"],
    queryFn: fetchReadings,
    enabled: isLoaded && isSignedIn === true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReading,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-readings"] });
      toast({ title: "Reading deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete", variant: "destructive" });
    },
  });

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-5xl">⭐</div>
        <h1 className="text-2xl font-bold text-foreground">Sign in to view your readings</h1>
        <p className="text-muted-foreground max-w-sm">
          Create an account to save and revisit your Vedic astrology readings from any device.
        </p>
        <Button onClick={() => navigate(`${BASE}/sign-in`)} className="gap-2">
          <LogIn className="h-4 w-4" />
          Sign In
        </Button>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-amber-600" />
              My Saved Readings
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user?.firstName ? `${user.firstName}'s` : "Your"} personal Vedic astrology archive
            </p>
          </div>
          <Button asChild size="sm" className="gap-1.5 shrink-0">
            <Link to="/">
              <Plus className="h-4 w-4" />
              New Reading
            </Link>
          </Button>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-destructive font-medium">Failed to load readings</p>
            <p className="text-sm text-muted-foreground mt-1">
              Make sure the Supabase <code className="text-xs bg-muted px-1 rounded">saved_readings</code> table exists. See setup instructions below.
            </p>
          </div>
        )}

        {!isLoading && !isError && readings?.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Star className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">No readings saved yet</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Run a transit or birth chart reading and click "Save Reading" to archive it here.
            </p>
            <Button asChild variant="outline">
              <Link to="/">Start a Reading</Link>
            </Button>
          </div>
        )}

        {!isLoading && readings && readings.length > 0 && (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {readings.map((r) => (
                <ReadingCard key={r.id} reading={r} onDelete={handleDelete} />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Supabase setup note */}
        {isError && (
          <details className="mt-6 rounded-xl border p-4 text-sm">
            <summary className="font-medium cursor-pointer">Database setup instructions</summary>
            <p className="mt-3 text-muted-foreground mb-2">
              Run this SQL in your Supabase SQL Editor to create the <code>saved_readings</code> table:
            </p>
            <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap">
{`CREATE TABLE IF NOT EXISTS saved_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  birth_date TEXT NOT NULL,
  birth_time TEXT,
  birth_location TEXT,
  chart_type TEXT DEFAULT 'transit',
  notes TEXT,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_readings_user_id_idx
  ON saved_readings(user_id);`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
