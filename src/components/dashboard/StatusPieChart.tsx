import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface StatusItem {
  name: string;
  value: number;
  color: string;
}

interface StatusPieChartProps {
  data: StatusItem[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold border-b border-slate-200 pb-2">
          <span>Status</span>
          <span>Orders</span>
          <span>Share</span>
        </div>
        <div className="space-y-3">
          {data.map((item) => {
            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-3d-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-900 font-bold">{item.value}</span>
                    <span className="text-slate-400 w-8 text-right font-medium">{percent}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-3d-inset border border-slate-200/50">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-3d-sm"
                    style={{ width: `${percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
