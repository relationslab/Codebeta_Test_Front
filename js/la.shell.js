
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
    anchor_schema_map : {
      chat : { open : true, closed : true }
    }

    , main_html: String()
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
    , anchor_map : {}
    , is_chat_rectacted : true
  }
  , jqueryMap = { }

  , copyAnchorMap
  , setJqueryMap
  , toggleChat
  , changeAnchorPart
  , onHashchange
  , onClickChat
  , initModule;

  copyAnchorMap = function(){
    return $.extend( true, {}, stateMap.anchor_map );
  };

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

  changeAnchorPart = function( arg_map ){
    console.log('changeAnchorPart');
    console.log(arg_map);
    var
      anchor_map_revise = copyAnchorMap()
      , bool_return = true
      , key_name
      , key_name_dep;

    // アンカーマップへ変更を統合開始
    KEYVAL:
    for( key_name in arg_map ){
      if( arg_map.hasOwnProperty( key_name ) ){
        // 反復中に従属キーを飛ばす
        if( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }

        // 独立キー値を更新
        anchor_map_revise[key_name] = arg_map[key_name];

        // 合致する独立キーを更新
        key_name_dep = '_' + key_name;
        if( arg_map[key_name_dep] ){
          anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
        } else {
          delete anchor_map_revise[key_name_dep];
          delete anchor_map_revise['_s' + key_name_dep];
        }
      }
    }

    // URI更新開始
    try{
      $.uriAnchor.setAnchor( anchor_map_revise );
    }
    catch( error ){
      // URIを元に戻す
      $.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
      bool_return = false;
    }

    return bool_return;
  };

  onHashchange = function( event ){
    console.log('onHashchange');
    console.log(event);
    var
      anchor_map_previous = copyAnchorMap()
      , anchor_map_proposed
      , _s_chat_previous
      , _s_chat_proposed
      , s_chat_proposed;

    // アンカーの解析を試みる
    try{
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    }
    catch( error ){
      $.uriAnchor.setAnchor( anchor_map_previous, null, true );
      return false;
    }
    stateMap.anchor_map = anchor_map_proposed;

    // 便利な変数？
    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    // 変更されている場合、チャットコンポーネントの調整
    if( !anchor_map_previous || _s_chat_previous !== _s_chat_proposed ){
      s_chat_proposed = anchor_map_proposed.chat;
      switch( s_chat_proposed ){
        case 'open':
          toggleChat( true );
          break;
        case 'closed':
          toggleChat( false );
          break;
        default:
          toggleChat( false );
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }

    return false;
  };

  onClickChat = function( event ){
    console.log('onClickChat');
    console.log(event);
    changeAnchorPart({
      chat : ( stateMap.is_chat_rectacted ? 'open' : 'closed' )
    });
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

    // uriAnchorをセット
    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });

    // uriAnchor変更イベントを処理する
    // すべての機能モジュールを設定してから初期化する
    $(window)
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );
  };

  return { initModule : initModule };
}());
