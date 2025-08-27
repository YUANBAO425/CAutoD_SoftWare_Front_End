import Mock from "mockjs";

// 模拟文件上传接口
Mock.mock(/\/upload_file/, "post", (options) => {
  // options.body 是一个 FormData 对象字符串，我们无法直接解析
  // 在实际 mock 中，我们通常只验证请求并返回一个预设的成功响应
  console.log("Mocked file upload request received:", options);

  return Mock.mock({
    code: 200,
    message: "上传成功",
    data: {
      fileId: "@guid",
      // 模拟一个文件URL
      url:
        Mock.Random.url("http", "example.com") +
        "/" +
        Mock.Random.word(8) +
        "." +
        Mock.Random.pick(["jpg", "png", "pdf", "zip"]),
    },
  });
});

// 模拟文件下载接口
Mock.mock(/\/download_file/, "post", (options) => {
  console.log("Mocked file download request received:", options);
  const body = JSON.parse(options.body);
  const { task_id, conversation_id, file_name } = body;

  if (!task_id || !conversation_id || !file_name) {
    return {
      code: 400,
      message: "请求参数缺失",
      detail: "task_id, conversation_id, file_name 均为必填项",
    };
  }

  // 模拟文件内容
  const mockFileContent = `This is a mock file content for ${file_name} related to task ${task_id} and conversation ${conversation_id}.`;
  const blob = new Blob([mockFileContent], { type: "text/csv" }); // 假设是 CSV 文件

  // 返回一个模拟的 Blob 对象，模拟文件流
  return blob;
});
