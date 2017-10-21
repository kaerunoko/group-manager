var gulp = require('gulp');
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
// var concat = require("gulp-concat");
var babel  = require('gulp-babel');


var config = {
    ts : {
        src: [
            './**/*.ts',       // プロジェクトのルート以下すべてのディレクトリの.tsファイルを対象とする
            '!./node_modules/**/*.ts' // node_modulesは対象外
        ],
        dst: 'build',
        options: { target: 'ES6', module: 'commonjs' }
    },
    min: {
        src: 'build/**/*.js',
        dst: 'deploy'
    }
};

gulp.task('build', function () {
    return gulp.src(config.ts.src)
               .pipe(sourcemaps.init())
               .pipe(typescript(config.ts.options))
               .js
               .pipe(sourcemaps.write('./'))
               .pipe(gulp.dest(config.ts.dst));
});

// なんかエラーになる
gulp.task('deploy', ['build'], function () {
    return gulp.src(config.min.src)
               .pipe(uglify())
               .pipe(gulp.dest(config.min.dst));
});


//JS圧縮 uglifyがES6に対応していないため一旦変換をかます
gulp.task('minify-js', function() {
    return gulp.src("build/bundle/*.js")
        .pipe(babel())
        .pipe(uglify())
        .on('error', function(e){
            console.log(e);
        })
        .pipe(gulp.dest('build/minify/'));
        //.pipe(gulp.dest('js')); 上書きする場合
});