'use strict';
/*
fis3-hook-module
fis3-hook-relative
fis3-postpackager-loader
*/
// 开启模块化包装amd，cmd
fis.hook('module', {mode: 'auto'});

// 使用相对路径。
fis.hook('relative');
fis.match('**', {relative: true});

fis
    .match('*.js', {
        isMod: false,
        isES6: false,
        isComponent: false,
        useHash: false,
        // 设置js文件为babel解析，支持es6的写法。
        // parser: fis.plugin('babel2')
    })

    .match('/js/page/*.js', {
        isMod: true,
        isES6: true,
        isComponent: true
    })
    .match(/\.vue$/i, {
        rExt: '.js',
        isMod: true,
        isJsLike: true,
        isComponent: true,
        parser: [fis.plugin('vue-component'), fis.plugin('babel-5.x')]
    })

    .match('::package', {
        // npm install [-g] fis3-postpackager-loader
        // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
        // allInOne: true, //js&css打包成一个文件
        sourceMap: true, //是否生成依赖map文件
        // useInlineMap: true //是否将sourcemap作为内嵌脚本输出
        postpackager: fis.plugin('loader', {})
    })