const routes = [
  {
    path: "/",
    name: "home",
    // redirect: "home.main",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        redirect: { name: "home.main" },
      },
      {
        path: "home",
        name: "home.main",
        component: () => import("pages/Index.vue"),
      },
      {
        path: "controller",
        name: "home.controller",
        component: () => import("pages/Controller.vue"),
      },
      {
        path: "experiment",
        name: "home.experiment",
        component: () => import("pages/ExperimentPanel.vue"),
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
