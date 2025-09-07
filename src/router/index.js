import { createRouter, createWebHashHistory } from 'vue-router'
import GameView from '../views/GameView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'game',
      component: GameView
    }
  ]
})

export default router