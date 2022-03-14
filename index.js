const rimraf = require('rimraf')
rimraf(".git", ()=>{
    console.log("结束了")
})