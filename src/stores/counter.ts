import { ref, computed } from 'vue'
import { createPinia, defineStore } from 'pinia'

const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

const counterStore = useCounterStore(createPinia())

// 订阅缓存的修改
counterStore.$subscribe((_mutation, state) => {
  // 将缓存的修改放入本地缓存中
  localStorage.setItem(counterStore.$id, JSON.stringify({ ...state }))
})

// 获取历史缓存
const counterStoreOld = localStorage.getItem(counterStore.$id)
if (counterStoreOld) {
  // 返回已存在的缓存
  counterStore.$state = JSON.parse(counterStoreOld)
}

// 注意，在使用时，不用构造方法，直接调用即可
export { counterStore }
