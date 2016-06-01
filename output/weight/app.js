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
