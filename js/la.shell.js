
/* shell-namespace js */

/*jslint browser: true, continue: true,
  devel: true, indent: 2, maxerr: 50,
  newcap: true, nomen: true, plusplus: true,
  regexp: true, sloppy: true, vars: false,
  white: true
*/

/*global $, la:true */

la.shell = ( function(){
  var configMap = {
    main_html: String()
    + '<div class="la-shell-head">'
      + '<div class="la-shell-head-logo"></div>'
      + '<div class="la-shell-head-tab"></div>'
      + '<div class="la-shell-head-options"></div>'
    + '</div>'

    + '<div class="la-shell-main">'
      + '<div class="la-shell-main-status"></div>'
      + '<div class="la-shell-main-game"></div>'
      + '<div class="la-shell-main-roadmap"></div>'
      + '<div class="la-shell-main-code"></div>'
      + '<div class="la-shell-main-logs"></div>'
    + '</div>'

    + '<div class="la-shell-foot"></div>'
    + '<div class="la-shell-chat"></div>'
    + '<div class="la-shell-modal"></div>'

    , chat_extend_time : 250
    , chat_retract_time : 300
    , chat_extend_height : 450
    , chat_retract_height: 15
    , chat_extent_title : 'Click to retract'
    , chat_rectact_title : 'Click to extend'
  }

  , stateMap = {
    $container : null
    , is_chat_rectacted : true
  }
  , jqueryMap = { }
  , setJqueryMap
  , toggleChat
  , onClickChat
  , initModule;

  setJqueryMap = function(){
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container
      , $chat : $container.find('.la-shell-chat')
    };
  };

  toggleChat = function( do_extend, callback ){
    var px_chat_ht = jqueryMap.$chat.height()
    , is_open = px_chat_ht === configMap.chat_extend_height
    , is_closed = px_chat_ht === configMap.chat_retract_height
    , is_sliding = (!is_open) && (!is_closed);

    // 競合状態を避ける
    if( is_sliding ){ return false; }

    // 拡大開始
    if( do_extend ){
      jqueryMap.$chat.animate(
        { height : configMap.chat_extend_height }
        , configMap.chat_extend_time
        , function(){
          jqueryMap.$chat.attr( 'title', configMap.chat_extent_title );
          stateMap.is_chat_rectacted = false;
          if( callback ){ callback( jqueryMap.$chat ); }
        }
      );
      return true;
    }

    // 格納開始
    jqueryMap.$chat.animate(
      { height: configMap.chat_retract_height }
      , configMap.chat_retract_time
      , function(){
        jqueryMap.$chat.attr( 'title', configMap.chat_rectact_title );
        stateMap.is_chat_rectacted = true;
        if( callback ){ callback( jqueryMap.$chat ); }
      }
    );

    return true;
  };

  onClickChat = function( event ){
    if( toggleChat( stateMap.is_chat_rectacted ) ){
      $.uriAnchor.setAnchor( { chat: ( stateMap.is_chat_rectacted ? 'open' : 'close' ) } );
    }
    console.log(event);
    return false;
  };

  initModule = function( $container ){
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    // 切り替えテスト
    stateMap.is_chat_rectacted = true;
    jqueryMap.$chat
      .attr( 'title', configMap.chat_rectact_title )
      .click( onClickChat );
  };

  return { initModule : initModule };
}());
