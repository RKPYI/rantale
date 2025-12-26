import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/novel-utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  color: "blue" | "green" | "purple" | "yellow" | "red";
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color,
}: MetricCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-100 dark:bg-green-900/20",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
    yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
    red: "text-red-600 bg-red-100 dark:bg-red-900/20",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">
              {typeof value === "number" ? formatNumber(value) : value}
            </p>
            {subtitle && (
              <p className="text-muted-foreground text-xs">{subtitle}</p>
            )}
          </div>
          <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
