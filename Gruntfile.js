var package_json = require(__dirname+"/package.json");
var bundleFiles=[
    "openNote.bundle.*",
    "webpack_files/**/*.*",
    "openNote/**/*.html"
];

// Helper function
var serverConfig = function(keepalive){
    if(keepalive==undefined)
        keepalive = true;
    return {
        options: {
            port: 8080,
            hostname: '0.0.0.0',
            base: ".",
            keepalive: keepalive,
            livereload: true,
            useAvailablePort: true
        }
    };
};

module.exports = function(grunt) {
    //Initializing the configuration object
    grunt.initConfig({
        connect: {
            server: serverConfig(),
            serverNoAlive: serverConfig(false)
        },
        compress: {
            main: {
                options: {
                    archive: "dist/"+package_json.version+".zip"
                },
                files: [{
                    src: [
                        "openNote.appcache",
                        "index.html",
                    ].concat(bundleFiles),
                    expand: true
                }]
            }
        },
        jshint: {
            options: {
                "esversion":6,
            },
            all: ["openNote/**/*.js*", //Order matters
                "!node_modules/**",
                "!OpenNote/node_moduless/**"
            ]
        },
        //Style
        less: {
            devDark: {
                options: {
                    paths: ["assets/css"],
                    modifyVars: {
                        offset: "#000000"
                    }
                },
                files: {
                    "openNote/style/invert/dark/style.css": "openNote/style/invert/style.less",
                    "openNote/style/invert/dark/alertify.css": "openNote/style/invert/alertify.less"
                }
            },
            devLight: {
                options: {
                    paths: ["assets/css"],
                    modifyVars: {
                        offset: "#FFFFFF"
                    }
                },
                files: {
                    "openNote/style/invert/light/style.css": "openNote/style/invert/style.less",
                    "openNote/style/invert/light/alertify.css": "openNote/style/invert/alertify.less"
                }
            },
            prodDark: {
                options: {
                    paths: ["assets/css"],
                    cleancss: true,
                    modifyVars: {
                        offset: "#000000"
                    }
                },
                files: {
                    "openNote/style/invert/dark/style.css": "openNote/style/invert/style.less",
                    "openNote/style/invert/dark/alertify.css": "openNote/style/invert/alertify.less"
                }
            },
            prodLight: {
                options: {
                    paths: ["assets/css"],
                    cleancss: true,
                    modifyVars: {
                        offset: "#FFFFFF"
                    }
                },
                files: {
                    "openNote/style/invert/light/style.css": "openNote/style/invert/style.less",
                    "openNote/style/invert/light/alertify.css": "openNote/style/invert/alertify.less"
                }
            }
        },
        shell: {

            clean: {
                command: ["rm -rf dist webpack_files",
                    "cd openNote/style/invert/",
                    "rm -rf dark light",
                ].join("&&")
            },
            test: {
                command: ["npm run test"].join("&&")
            },
            dev: {
                command: ["npm run dev"].join("&&")
            },
            build: {
                command: ["npm run build"].join("&&")
            }
        },
        //HTML 5
        manifest: {
            generate: {
                options: {
                    basePath: ".",
                    exclude: ["openNote.appcache"],
                    verbose: true,
                    timestamp: true,
                    hash: true,
                    master: ["index.html"]
                },
                src: bundleFiles,
                dest: "openNote.appcache"
            }
        }
    });

    //Plugin loading
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-manifest");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-connect");

    //Task definition
    //css
    grunt.registerTask("buildDevCSS", ["less:devDark", "less:devLight"]);
    grunt.registerTask("buildProdCSS", ["less:prodDark", "less:prodLight"]);

    //deployment
    // you can run individual command using  the plug-in command syntax suck as manifest:generate or shell:clean
    grunt.registerTask("build", ["buildDevCSS", "shell:build", "manifest:generate"]);
    grunt.registerTask("buildProd", ["buildProdCSS", "shell:build", "manifest:generate"]);
    grunt.registerTask("default", ["build", "shell:dev"]);
    grunt.registerTask("deploy", ["shell:clean", "buildProd", "compress"]);
    grunt.registerTask("testDeploy", ["shell:clean", "buildProd", "connect:server"]);

    //testing
    grunt.registerTask("ci", "Build the app and runs tests on it", ["jshint:all", "buildProd", "connect:serverNoAlive", "shell:test" ]);
};
