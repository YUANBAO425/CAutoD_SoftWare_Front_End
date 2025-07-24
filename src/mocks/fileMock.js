import Mock from "mockjs";

// 模拟文件上传接口
Mock.mock(/\/file\/upload/, "post", (options) => {
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
