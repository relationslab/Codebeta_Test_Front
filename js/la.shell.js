
/* shell-namespace js */

/*jslint browser: true, continue: true,
  devel: true, indent: 2, maxerr: 50,
  newcap: true, nomen: true, plusplus: true,
  regexp: true, sloppy: true, vars: false,
  white: true
*/

/*global $, la */

la.shell = ( function(){
  var
    // private変数
    configMap = {
      anchor_schema_map : {
        chat : { opened : true, closed : true }
      }
      , resize_interval : 200
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
      + '<div class="la-shell-modal"></div>'
    }
    , stateMap = {
      $container : undefined
      , anchor_map : {}
      , resize_idto : undefined
    }
    , jqueryMap = { }

    // private関数
    , copyAnchorMap     // 現在のURIAnchorのコピーを返す
    , setJqueryMap      // jQueryエレメントを予め獲得しておく
    , changeAnchorPart  // アンカー処理

    // イベントハンドラ
    , onHashchange // uriAnchor変更イベント
    , onResize     // windowリサイズ

    // public関数
    , initModule     // 初期化処理
    , setChatAnchor; // チャット向けのアンカー処理（open/closeの処理）

  copyAnchorMap = function(){
    return $.extend( true, {}, stateMap.anchor_map );
  };

  setJqueryMap = function(){
    var $container = stateMap.$container;
    jqueryMap = {
      $container : $container
    };
  };

  changeAnchorPart = function( arg_map ){
    var
      anchor_map_revise = copyAnchorMap()
      , bool_return = true
      , key_name
      , key_name_dep;

    // アンカーマップへ変更を統合開始
    for( key_name in arg_map ){
      if( arg_map.hasOwnProperty( key_name ) ){
        // 反復中に従属キーを飛ばす
        if( key_name.indexOf( '_' ) === 0 ) { continue; }

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
    console.log('onHashchange');console.log(event);
    var
      anchor_map_previous = copyAnchorMap()
      , anchor_map_proposed
      , _s_chat_previous
      , _s_chat_proposed
      , s_chat_proposed
      , is_ok = true;

    // アンカーの解析を試みる
    try{
      anchor_map_proposed = $.uriAnchor.makeAnchorMap();
    }
    catch( error ){
      console.log(error);
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
        case 'opened':
          is_ok = la.chat.setSliderPosition( 'opened' );
          break;
        case 'closed':
          is_ok = la.chat.setSliderPosition( 'closed' );
          break;
        default:
          la.chat.setSliderPosition( 'closed' );
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }

    // スライダーの変更が拒否された場合、アンカーを元に戻す
    if( !is_ok ){
      if( anchor_map_previous ){
        $.uriAnchor.setAnchor( anchor_map_previous, null, true );
        stateMap.anchor_map = anchor_map_previous;
      } else {
        delete anchor_map_proposed.chat;
        $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
      }
    }

    return false;
  };

  onResize = function(){
    if( stateMap.resize_idto ){ return true; }

    la.chat.handleResize();
    stateMap.resize_idto = setTimeout(
      function(){ stateMap.resize_idto = undefined; }
      , configMap.resize_interval
    );

    return true;
  };

  initModule = function( $container ){
    stateMap.$container = $container;
    $container.html( configMap.main_html );
    setJqueryMap();

    // uriAnchorをセット
    $.uriAnchor.configModule({
      schema_map : configMap.anchor_schema_map
    });

    // 機能モジュールを構成して初期化
    la.chat.configModule({
      set_chat_anchor : setChatAnchor
      , chat_model : la.model.chat
      , people_model : la.model.people
    });
    la.chat.initModule( jqueryMap.$container );

    // uriAnchor変更イベントを処理する
    // すべての機能モジュールを設定してから初期化する
    $(window)
      .bind( 'resize', onResize )
      .bind( 'hashchange', onHashchange )
      .trigger( 'hashchange' );
  };

  setChatAnchor = function( position_type ){
    return changeAnchorPart({ chat: position_type });
  };

  return { initModule : initModule };
}());
