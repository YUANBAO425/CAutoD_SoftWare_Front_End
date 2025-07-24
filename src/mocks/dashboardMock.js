import Mock from "mockjs";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

Mock.mock("http://localhost:3000/api/dashboard/history", "get", () => {
  const data = Mock.mock({
    "data|10-15": [
      {
        "id|+1": 1,
        title: "@ctitle(5, 15)",
        time: '@datetime("yyyy-MM-dd HH:mm:ss")',
      },
    ],
  }).data;

  // Add a relative time for display
  data.forEach((item) => {
    const date = new Date(item.time);
    // Make dates more varied
    date.setDate(date.getDate() - Mock.Random.integer(0, 30));
    item.relativeTime = formatDistanceToNow(date, {
      addSuffix: true,
      locale: zhCN,
    });
    item.time = date.toISOString(); // Keep a standard format
  });

  return {
    code: 200,
    message: "成功",
    data: data.sort((a, b) => new Date(b.time) - new Date(a.time)), // Sort by most recent
  };
});
