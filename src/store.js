// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 1,
      symbols: [],
    }
  },
  mutations: {
    increment(state) {
      state.count++
    },
   setSymbols(state, symbols) {
      console.log('setSymbols', symbols)
      state.symbols = symbols
    }

  },
  actions: {
    increment({ commit }) {
      commit('increment')
    },
    setSymbols({ commit }, symbols) {
      commit('setSymbols', symbols)
    },
  },
  getters: {
    
    count: state => state.count,
    symbols: state => state.symbols,
  }
})

export default store
