export default [
  {
    path: "/login/:type",
    redirect: (to) => {
      const type = to.params.type.toLowerCase();
      const validTypes = ["admin", "vols", "alumn", "funvols"];
      if (validTypes.includes(type)) {
        // 将匹配到的类型转换为大写 hash，例如 /login/admin -> /login#ADMIN
        return { path: "/login", hash: `#${type.toUpperCase()}` };
      }
      // 如果不匹配任何已知类型，则回退到普通登录页
      return "/login";
    },
  },
];
