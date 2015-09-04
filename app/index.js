var generators = require('yeoman-generator');

module.exports = generators.Base.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);
    },

    _copy: function(from, to) {
        this.fs.copy(
            this.templatePath(from),
            this.destinationPath(to)
        );
    },

    prepareBasicFiles: function() {
        this._copy('.gitignore', '.gitignore');
        this._copy('.bowerrc', '.bowerrc');
        this._copy('bower.json', 'bower.json');
        this._copy('package.json', 'package.json');
        this._copy('gulpfile.js', 'gulpfile.js');
        this._copy('src/assets/js/app.js', 'src/assets/js/app.js');
        this._copy('src/assets/js/vendor.js', 'src/assets/js/vendor.js');
        this._copy('src/assets/less/main.less', 'src/assets/less/main.less');
        this._copy('src/index.html', 'src/index.html');
        this.fs.write(this.destinationPath('src/assets/images/.empty'), '');
    },

    installingGulpDependencies: function() {
        this.npmInstall([
            'gulp',
            'bower-resolve',
            'gulp-plumber',
            'gulp-rename',
            'gulp-autoprefixer',
            'gulp-jshint',
            'gulp-uglify',
            'gulp-imagemin',
            'gulp-cache',
            'gulp-minify-css',
            'gulp-less',
            'browser-sync',
            'stringify',
            'vinyl-source-stream',
            'browserify'
        ], {
            saveDev: true
        });
    },

    installFrontendDependencies: function() {
        this.bowerInstall([
            'ractive'
        ], {
            save: true
        });
    }
});
