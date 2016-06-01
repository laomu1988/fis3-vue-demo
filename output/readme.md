# 使用fis3打包单文件vue组件
> 在项目开发过程中，我们常把页面拆分成一个个小组件，每个组件由css、模板、js组成。
  一般情况下，三个部分我们分别写在不同的文件中，但是假如页面有很多小组件，每个组件都拆分成三个文件，最终就会产生大量的小文件，不便于管理。
  这时我们通过将组件的三个部门写在同一个文件来避免多个小文件，并且每个组件一个文件也更加直观。
  参考[webpack和browserify打包单文件组件](http://vuejs.org.cn/guide/application.html)和[fis3-parser-vue](https://github.com/okoala/fis3-parser-vue)

## 详细说明
1. 首先新建一个项目文件夹，创建vue文件
 ```html
// weight/app.vue
<style>
h1 {
   color: #f00;
}
</style>

<template>
<h1>{{msg}}</h1>
</template>

<script>
export default {
data () {
  return {
    msg: 'Hello world!'
  }
}
}
</script>
 ```
 2. 安装打包工具
 ```
 # 全局安装fis3
 npm install fis3 -g -d
 npm install fis3-hook-module -g -d
 npm install fis3-hook-relative -g -d
 npm install fis3-postpackager-loader -g -d

 # es6相关模块(根据需要选择安装)
 npm install babel-plugin-transform-runtime
 npm install babel-preset-es2015
 npm install fis-parser-babel2

 # vue
 npm install fis3-parser-vue

 ```
 3. 编写fis-conf.js
 ```js
// 开启模块化包装amd，cmd
fis.hook('module', {mode: 'auto'});

// 使用相对路径。
fis.hook('relative');
fis.match('**', {relative: true});

fis
    // 打包vue文件
    .match(/\.vue$/i, {
        rExt: '.js',
        isMod: true,
        isJsLike: true,
        isComponent: true,
        parser: fis.plugin('vue')
    })
    // 普通js不增加module名称
    .match("*.js", {
        isMod: false,
        isES6: false,
        isComponent: false,
        useHash: false,
        // 设置js文件为babel解析，支持es6的写法。
        parser: fis.plugin('babel2')
    })
    // js/page页面内js增加module模块名称
    .match("/js/page/*.js", {
        isMod: true,
        isES6: true,
        isComponent: true
    })

    .match('::package', {
        // npm install [-g] fis3-postpackager-loader
        // 分析 {
    "res": {
        "js/base/mod.js": {
            "uri": "/js/base/mod.js",
            "type": "js"
        },
        "js/base/vueify-insert-css.js": {
            "uri": "/js/base/vueify-insert-css.js",
            "type": "js"
        },
        "js/base/vue.js": {
            "uri": "/js/base/vue.js",
            "type": "js"
        },
        "weight/app.vue": {
            "uri": "/weight/app.js",
            "type": "js",
            "deps": [
                "vueify-insert-css"
            ]
        },
        "js/page/main.js": {
            "uri": "/js/page/main.js",
            "type": "js",
            "extras": {
                "moduleId": "js/page/main"
            },
            "deps": [
                "weight/app.vue"
            ]
        }
    },
    "pkg": {}
} 结构，来解决资源加载问题
        // allInOne: true, //js&css打包成一个文件
        sourceMap: true, //是否生成依赖map文件
        // useInlineMap: true //是否将sourcemap作为内嵌脚本输出
        postpackager: fis.plugin('loader', {})
    })
 ```
 4. 编译
 > 执行 <em>fis3 release -d output</em>,即可看到文件output/weight/app.js
 ```
 // weight/app.js
 define('weight/app.vue', function(require, exports, module) {

 var __vueify_style__ = require("vueify-insert-css").insert("\nh1 {\n   color: #f00;\n}\n")
 'use strict';

 Object.defineProperty(exports, "__esModule", {
   value: true
 });
 exports.default = {
   data: function data() {
     return {
       msg: 'Hello world!'
     };
   }
 };
 if (module.exports.__esModule) module.exports = module.exports.default
 ;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\n<h1>{{msg}}</h1>\n"

 });
 ```
 但是"vueify-insert-css"是什么鬼？
 在js/base目录下放上vue.js和mod.js,创建index.html
 ```
 <app></app>
 <script src="js/base/mod.js"></script>
 <script src="js/base/vueify-insert-css.js"></script>
 <script src="js/base/vue.js"></script>
 <script>
     require('js/page/main.js');
 </script>
```