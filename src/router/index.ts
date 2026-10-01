import { createRouter, createWebHistory } from 'vue-router'
export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/HomeView.vue') },
    { path: '/workspace', component: () => import('../views/WorkspaceView.vue') },
    { path: '/login', component: () => import('../views/AuthView.vue') },
    { path: '/register', component: () => import('../views/AuthView.vue') },
    { path: '/invite/:token', component: () => import('../views/InviteView.vue') },
  ],
  scrollBehavior(to) {
    return to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }
  },
})
