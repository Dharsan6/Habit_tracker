import { FiActivity, FiAward, FiTrendingUp } from "react-icons/fi";
import Card from "./Card.jsx";

const iconMap = {
  momentum: FiTrendingUp,
  champion: FiAward,
  focus: FiActivity,
};

export default function InsightCards({ insights }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {insights.map((insight) => {
        const Icon = iconMap[insight.icon] ?? FiTrendingUp;

        return (
          <Card
            key={insight.title}
            className="rounded-[2rem] border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  {insight.title}
                </h3>
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {insight.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
