/**
 * 09-27-2017
 * Buildfile.
 * ~~ Scott Johnson
 */
/** List jshint ignore directives here. **/
/* jshint undef: true, unused: true */
/* jslint node: true */
/* jshint esversion: 6 */
/* eslint-env es6 */

var os = require( 'os' );
var path = require( 'path' );
var Q = require( 'q' );
var copy = require( 'promise-file-copy' );
var concat = require( 'promise-file-concat' );
var empty = require( 'promise-empty-dir' );
//var jsify = require( 'promise-file-jsify' );
//var write = require( 'promise-file-write' );
var replace = require( 'promise-file-replace' );
var resolve = require( 'promise-resolve-path' );
var NETROOT = process.env.HOME+'/mnt';

if( os.platform() == 'win32' ) {
    console.log( 'This builder is NOT configured to run on Windows.' );
    process.exit( 1 );
}

var build = module.exports = function( bob ){ // jshint ignore:line
    /**
     * Set the current working directory for this bob for bob.resolve().
     */
    bob.cwd( __dirname );
    
    // Create the 'build' job.
    var oJobBuild = bob.createJob( 'build' );

    // Create the "build" job for modules.
    var buildJobMods = bob.createJob( 'modules' );
    
    // Add the dependencies from the modules.
    buildJobMods.addDependencies( 'build', [
        bob.resolve( './bower_components/bower-foundation-6' )
    ], {} );
    
    // Create the 'deploy' job.
    var oJobDeploy = bob.createJob( 'deploy' );
    
    var onBuildFail = function( /*err*/ ){
        console.log( 'Failed to build browser-input-file-list!' );
        console.log( '\n\n' );
    };// /onBuildFail()

    var buildModules = function(){
        return buildJobMods.run();
    };// /buildModules()

    var concatToTemp = function(){
        return Q.all([
            copy( [
            './src/browser-input-file-list.html',
            './src/browser-input-file-list.css'
            ], './temp' ),

            concat([
            './src/browser-input-file-list.js'
            ],
            './temp/browser-input-file-list.js', {
                prependSourcePath: true,
                prependDatetime: true,
                header: '(function( $, undefined ){\n',
                footer: '\n}( App.$ ));'
            })

        ]);
    };// /concatToTemp()
    
    // Clean the build directories.
    oJobBuild.addTask( 'empty', function(){
        return empty([
            './build',
            './temp'
        ], true );
    });
    oJobDeploy.addTask( 'empty', function(){
        return empty([
            './dist',
            './temp'
        ], true );
    });

    // Add module build task.
    oJobBuild.addTask( 'build-modules', buildModules );
    oJobDeploy.addTask( 'build-modules', buildModules );
    
    // Concatenate the main js files for this app.
    oJobBuild.addTask( 'concat', concatToTemp );
    oJobDeploy.addTask( 'concat', concatToTemp );
    
    // Make replacements.
    oJobBuild.addTask( 'replace-build', function(){
        return replace( './temp/browser-input-file-list.html', 
        [{ 
            search: /\{%= build-dist-folder %\}/g,replace:'build' 
        },{ 
            search: /\{%= random %\}/g,replace: generateRandomString()
        }] );
    });
    oJobDeploy.addTask( 'replace-dist', function(){
        return replace( './temp/browser-input-file-list.html', 
        [{ 
            search: /\{%= build-dist-folder %\}/g,replace:'dist' 
        },{ 
            search: /\{%= random %\}/g,replace: generateRandomString()
        }] );
    });

    // Copy temp to output folder.
    oJobBuild.addTask( 'copy-build', function(){
        return copy( './temp', './build' )
        .then(function(){
            return 'build';
        });
    });
    oJobDeploy.addTask( 'copy-deploy', function(){
        return copy( './temp', './dist' )
        .then(function(){
            return 'dist';
        });
    });

    // Copy build over network.
    oJobBuild.addTask( 'copy-network', function( cBuildType ){
        return copyOverNetwork( cBuildType );
    });
    oJobDeploy.addTask( 'copy-network', function( cBuildType ){
        return copyOverNetwork( cBuildType );
    });

    var copyOverNetwork = function( cBuildType ){
        if( !cBuildType || 'dist build'.indexOf( cBuildType ) < 0 ){
            console.log( 'Build type is missing or invalid.' );
            process.exit();
        }
        
        // Determines the path that MUST exist before any copying is done.
        var cPathShare = path.join( NETROOT, '/path/to/test/or/deploy' );
        
        
        
        
        console.log( '\n\nMust set "***SET_PATH_HERE***" in bobfile for network copy.\n\n' );
        process.exit( 1 );

        // Determines the path that will exist AFTER copying is done.
        var cPathDest = path.join( cPathShare, '/apps/***SET_PATH_HERE***/browser-input-file-list/', cBuildType );

        
        
        
        console.log( 'Copy to', cPathDest );

        // Resolve, verify, and copy/deploy build.
        return resolve( cPathShare, true )
        .then(function(){
            return copy( './temp', cPathDest );
        });
    };// /copyOverNetwork()
    oJobBuild.fail( onBuildFail );
    oJobDeploy.fail( onBuildFail );

    
    var oJobWatch = bob.createJob( 'watch' );
    oJobWatch.addTask( 'watch', function(){
        // Run the main build job.
        return oJobBuild.run()

        .then(function(){
            
            // Add an event listener on this bob for changes.
            bob.on( 'change', function( /*bob, cPathChanged*/ ){
                oJobBuild.run();
            });
            // Setup the watcher for the main source.
            return bob.watch( './src' );
        });
    });

    // Always return bob. :)
    return bob;
};// /build()

// Generate a random string.
var generateRandomString = function(){
    var cRandom = ''.concat(
        // Time stamp.
        new Date().getTime(),

        '-',

        // Eight character random integer.
        Math.round( Math.random() * 100000000 )
    );

    return cRandom;
};// /generateRandomString()