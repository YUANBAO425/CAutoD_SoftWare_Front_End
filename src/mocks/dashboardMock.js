import Mock from "mockjs";

Mock.mock("/dashboard/history", "get", {
  code: 200,
  message: "成功",
  "data|3": [
    {
      "id|+1": 1,
      title: "@ctitle(5, 10)",
      time: '@datetime("yyyy-MM-dd HH:mm:ss")',
    },
  ],
});
