module.exports = function (ctx) {
  return {
    css: [
      'src/quasar-variables.sass'
    ],
    build: {
      vueCompiler: true
    }
  }
}