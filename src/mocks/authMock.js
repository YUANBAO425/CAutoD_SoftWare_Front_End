import Mock from "mockjs";

Mock.mock("/auth/login", "post", (options) => {
  const { email, password } = JSON.parse(options.body);

  if (email === "test@example.com" && password === "password123") {
    return {
      code: 200,
      message: "登录成功",
      data: {
        token: Mock.Random.guid(),
        user: {
          id: Mock.Random.id(),
          name: Mock.Random.cname(),
          email: email,
          avatar: Mock.Random.image("100x100"),
        },
      },
    };
  } else {
    return {
      code: 401,
      message: "邮箱或密码错误",
    };
  }
});

Mock.mock("/auth/google", "post", (options) => {
  return {
    code: 200,
    message: "登录成功",
    data: {
      token: Mock.Random.guid(),
      user: {
        id: Mock.Random.id(),
        name: Mock.Random.cname(),
        email: Mock.Random.email(),
        avatar: Mock.Random.image("100x100"),
      },
    },
  };
});
