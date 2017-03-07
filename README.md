
# 使用fis3打包单文件vue组件
> 在项目开发过程中，我们常把页面拆分成一个个小组件，每个组件由css、模板、js组成。
  一般情况下，三个部分我们分别写在不同的文件中，但是假如页面有很多小组件，每个组件都拆分成三个文件，最终就会产生大量的小文件，不便于管理。
  这时我们通过将组件的三个部门写在同一个文件来避免多个小文件，并且每个组件一个文件也更加直观。
  参考[webpack和browserify打包单文件组件](http://vuejs.org.cn/guide/application.html)和[fis3-parser-vue](https://github.com/okoala/fis3-parser-vue)

## 详细说明
### 1.首先新建一个项目，文件目录如下
  ```
    +-- index.html
    +-- weight
        |-- app.vue
    +-- js
        |-- base
            |-- vue.js
            |-- mod.js
  ```

  文件weight/app.vue
  ```
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

  文件index.html
  ```
    <app></app>
    <script src="js/base/mod.js"></script>
    <script src="js/base/vue.js"></script>
    <script>
        var App = require('weight/app.vue');
        new Vue({
            el: 'body',
            components: {
                app: App
            }
     });
    </script>
   ```

### 2.安装打包工具
 
 ```
 ### 全局安装fis3
 npm install fis3 -g -d
 npm install fis3-hook-module -g -d
 npm install fis3-hook-relative -g -d
 npm install fis3-postpackager-loader -g -d

 ### es6 vue相关模块
 npm install fis-parser-babel-5.x
 npm install fis3-parser-vue-component

 ```

### 3.编写fis-conf.js

 ```js
    // fis-conf.js

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
            parser: [fis.plugin('vue-component'), fis.plugin('babel-5.x')]
        })
        // 普通js不增加module名称
        .match("*.js", {
            isMod: false,
            isES6: false,
            isComponent: false,
            useHash: false,
            // 设置js文件为babel解析，支持es6的写法。
            // parser: fis.plugin('babel-5.x')
        })

        .match('::package', {
            // npm install [-g] fis3-postpackager-loader
            // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
            // allInOne: true, //js&css打包成一个文件
            sourceMap: true, //是否生成依赖map文件
            // useInlineMap: true //是否将sourcemap作为内嵌脚本输出
            postpackager: fis.plugin('loader', {})
        })
   ```
### 4.编译
 执行 <em>fis3 release -d output</em>,即可看到文件output/weight/app.js
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
 通过浏览器打开查看，会提示"mod.js:65 Uncaught Error: Cannot find module `vueify-insert-css`"

### 5.修复
  在项目中搜索 vueify-insert-css，会发现fis3-parser-vue中使用了模块vueify-insert-css,打开项目，就一个文件
  ```
     var inserted = exports.cache = {}
    
     exports.insert = function (css) {
       if (inserted[css]) return
       inserted[css] = true
    
       var elem = document.createElement('style')
       elem.setAttribute('type', 'text/css')
    
       if ('textContent' in elem) {
         elem.textContent = css
       } else {
         elem.styleSheet.cssText = css
       }
    
       document.getElementsByTagName('head')[0].appendChild(elem)
       return elem
     }
  ```
  稍微改造一下就可以了
  ```
    // js/base/vueify-insert-css.js
    define('vueify-insert-css', function (require, exports, module) {
        var inserted = exports.cache = {}
    
        exports.insert = function (css) {
            if (inserted[css]) return
            inserted[css] = true
    
            var elem = document.createElement('style')
            elem.setAttribute('type', 'text/css')
    
            if ('textContent' in elem) {
                elem.textContent = css
            } else {
                elem.styleSheet.cssText = css
            }
    
            document.getElementsByTagName('head')[0].appendChild(elem)
            return elem
        }
    });
  ```
   放在js/base目录，html中直接引入，重新打包，ok

### 6.存在问题
* fis3-parser-vue组件对less的支持有问题，单文件中暂时无法使用less语法。sass没有试过，感兴趣的同学可以动手试试看
* 部分编辑器可能不支持单文件vue语法高亮，使用html格式即可



