import React, { useEffect, useState } from "react";
import { ScreenContainer } from "../components/layout/ScreenContainer";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "../hooks/useTelegram";
import { api } from "../api/client";

const HomePage: React.FC = () => {
  const { user, vip, monetization, refresh } = useApp();
  const navigate = useNavigate();
  const { webApp, initData } = useTelegram();
  const [loading, setLoading] = useState(false);

  const dailyLimit = monetization?.freeDailyLimit ?? 5;
  const progress = user ? Math.min((user.dailyTaskCount / dailyLimit) * 100, 100) : 0;

  const handleStart = () => navigate("/training");

  const handlePay = async () => {
    setLoading(true);
    const response = await api.createPayment(
      { provider: "TELEGRAM_STARS", plan: "monthly" },
      initData
    );
    if (response.redirectUrl) {
      window.open(response.redirectUrl as string, "_blank");
    }
    await refresh();
    setLoading(false);
  };

  useEffect(() => {
    if (!webApp) return;
    const clickHandler = () => void handlePay();
    if (!vip) {
      webApp.MainButton.setText("VIP kaufen");
      webApp.MainButton.show();
      webApp.MainButton.onClick(clickHandler);
    } else {
      webApp.MainButton.hide();
    }
    return () => {
      webApp.MainButton.offClick(clickHandler);
    };
  }, [vip, webApp]);

  return (
    <ScreenContainer
      title="Dein Deutsch-Training"
      subtitle="Tägliche Mini-Lektionen in Telegram"
    >
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Tagesziel</p>
            <p className="text-lg font-semibold">{dailyLimit} Aufgaben</p>
          </div>
          <Badge>{vip ? "VIP" : "FREE"}</Badge>
        </div>
        <Progress value={progress} />
        <p className="text-xs text-slate-500">
          {user?.dailyTaskCount ?? 0} von {dailyLimit} erledigt
        </p>
      </Card>

      <Card className="space-y-2">
        <h3 className="text-lg font-semibold">Dein Streak</h3>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-semibold">{user?.streak ?? 0}</span>
          <p className="text-sm text-slate-500">Tage in Folge</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-semibold">{user?.points ?? 0}</span>
          <p className="text-sm text-slate-500">Punkte</p>
        </div>
      </Card>

      <Button onClick={handleStart}>Neues Training</Button>

      {!vip && (
        <Card className="space-y-3 border border-brand-200 bg-brand-50">
          <h3 className="text-lg font-semibold text-brand-700">VIP freischalten</h3>
          <p className="text-sm text-brand-600">
            Unbegrenzte Aufgaben, keine Werbung, detaillierte Erklärungen und Fokus-Themen.
          </p>
          <Button onClick={handlePay} disabled={loading}>
            VIP kaufen (ab 7 €)
          </Button>
        </Card>
      )}
    </ScreenContainer>
  );
};

export default HomePage;
