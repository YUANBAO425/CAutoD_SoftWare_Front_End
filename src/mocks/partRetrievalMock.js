import Mock from "mockjs";

Mock.mock("http://localhost:3000/api/parts/retrieval", "post", () => {
  const partsCount = Mock.Random.integer(1, 5);
  const parts = Array.from({ length: partsCount }).map((_, index) => ({
    id: Mock.Random.guid(),
    name: `零件${index + 1}.${Mock.Random.pick(["step", "stl", "iges"])}`,
    imageUrl: `https://placehold.co/400x300/e2e8f0/e2e8f0?text=Part+${
      index + 1
    }`,
  }));

  return {
    code: 200,
    message: "success",
    data: {
      parts: parts,
    },
  };
});
