import React, { useEffect, useMemo, useState } from "react";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AdBanner, AdItem } from "../components/ads/AdBanner";
import { AdModal } from "../components/ads/AdModal";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { useTelegram } from "../hooks/useTelegram";

const taskTypes = [
  "multiple_choice",
  "fill_in_the_blank",
  "short_translation",
  "mini_dialog"
] as const;

type Task = {
  id: string;
  type: typeof taskTypes[number];
  prompt: string;
  options?: string[];
  answer: string;
  explanation_de: string;
  hint?: string;
  tags: string[];
};

const TrainingPage: React.FC = () => {
  const { user, vip, monetization, refresh } = useApp();
  const { initData, webApp } = useTelegram();
  const [task, setTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [adModal, setAdModal] = useState<AdItem | undefined>();
  const [taskCounter, setTaskCounter] = useState(0);

  const bannerAd = useMemo(() => ads.find((ad) => ad.type === "BANNER"), [ads]);
  const fullAd = useMemo(() => ads.find((ad) => ad.type === "FULLSCREEN"), [ads]);

  const loadAds = async () => {
    if (!monetization?.adsEnabled || vip) return;
    const response = await api.ads(initData);
    setAds((response.ads as AdItem[]) ?? []);
  };

  const loadTask = async () => {
    setError(null);
    setFeedback(null);
    setAnswer("");
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    try {
      const response = await api.generateTask(
        {
          level: user?.level ?? "A1",
          goal: user?.goal ?? "grammar",
          taskType,
          context: ""
        },
        initData
      );
      setTask(response.task as Task);
      setTaskCounter((prev) => prev + 1);
      if (!vip && monetization?.adsEnabled && taskCounter > 0 && fullAd) {
        const interval = monetization.adsInterval ?? 3;
        if (taskCounter % interval === 0) {
          setAdModal(fullAd);
        }
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden");
    }
  };

  const submitAnswer = async () => {
    if (!task) return;
    const isCorrect = answer.trim().toLowerCase() === task.answer.trim().toLowerCase();
    setFeedback(isCorrect ? "Richtig!" : "Nicht ganz. Versuch es nochmal.");
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(isCorrect ? "medium" : "light");
    }
    await api.submitAnswer(
      {
        taskType: mapTaskType(task.type),
        success: isCorrect,
        tags: task.tags
      },
      initData
    );
  };

  useEffect(() => {
    void loadTask();
    void loadAds();
  }, []);

  return (
    <ScreenContainer title="Training" subtitle="Interaktive Übungen von DeepSeek">
      {task && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge>{task.type.replace(/_/g, " ")}</Badge>
            <span className="text-xs text-slate-400">Level {user?.level ?? "A1"}</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {task.prompt}
          </h2>

          {task.options && (
            <div className="flex flex-col gap-2">
              {task.options.map((option) => (
                <Button
                  key={option}
                  variant={answer === option ? "primary" : "secondary"}
                  onClick={() => setAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {!task.options && (
            <textarea
              className="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Deine Antwort..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          )}

          {task.hint && <p className="text-xs text-slate-400">Hinweis: {task.hint}</p>}

          {feedback && (
            <Card className="bg-brand-50">
              <p className="text-sm font-semibold text-brand-700">{feedback}</p>
              <p className="mt-1 text-xs text-slate-500">{task.explanation_de}</p>
              {!vip && (
                <p className="mt-2 text-xs text-slate-400">
                  Upgrade auf VIP für ausführliche Erklärungen (DE + RU).
                </p>
              )}
            </Card>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={submitAnswer} disabled={!answer}>
              Antwort prüfen
            </Button>
            <Button variant="ghost" onClick={loadTask}>
              Nächste Aufgabe
            </Button>
          </div>
        </Card>
      )}

      {!vip && bannerAd && <AdBanner ad={bannerAd} />}

      <AdModal ad={adModal} onClose={() => setAdModal(undefined)} />
    </ScreenContainer>
  );
};

const mapTaskType = (type: Task["type"]) => {
  switch (type) {
    case "multiple_choice":
      return "MULTIPLE_CHOICE";
    case "fill_in_the_blank":
      return "FILL_BLANK";
    case "short_translation":
      return "SHORT_TRANSLATION";
    case "mini_dialog":
      return "MINI_DIALOG";
    default:
      return "MULTIPLE_CHOICE";
  }
};

export default TrainingPage;
