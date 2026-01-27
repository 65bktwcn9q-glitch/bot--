import React, { useEffect, useState } from "react";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";

const HistoryPage: React.FC = () => {
  const { initData } = useTelegram();
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<{ accuracy: number; weakTopics: string[] }>({
    accuracy: 0,
    weakTopics: []
  });

  useEffect(() => {
    const load = async () => {
      const response = await api.history(initData);
      setLogs((response.logs as any[]) ?? []);
      setStats((response.stats as any) ?? { accuracy: 0, weakTopics: [] });
    };
    void load();
  }, []);

  return (
    <ScreenContainer title="Historie" subtitle="Deine letzten Trainings">
      <Card className="space-y-2">
        <h3 className="text-lg font-semibold">Statistik</h3>
        <p className="text-sm text-slate-500">Genauigkeit: {stats.accuracy}%</p>
        <div className="flex flex-wrap gap-2">
          {stats.weakTopics.length === 0 && (
            <span className="text-xs text-slate-400">Noch keine schwachen Themen.</span>
          )}
          {stats.weakTopics.map((topic) => (
            <Badge key={topic}>{topic}</Badge>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {log.taskType.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(log.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className={log.success ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
              {log.success ? "Richtig" : "Falsch"}
            </Badge>
          </Card>
        ))}
      </div>
    </ScreenContainer>
  );
};

export default HistoryPage;
