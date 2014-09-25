
/* root-namespace js */

/*jslint browser: true, continue: true,
  devel: true, indent: 2, maxerr: 50,
  newcap: true, nomen: true, plusplus: true,
  regexp: true, sloppy: true, vars: false,
  white: true
*/

/*global $, la:true */

var la = (function(){
  var initModule = function( $container ){
    la.shell.initModule( $container );
  };

  return { initModule: initModule };
}());
