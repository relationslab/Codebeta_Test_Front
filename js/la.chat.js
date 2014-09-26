
/* chat js */

/*jslint browser: true, continue: true,
  devel: true, indent: 2, maxerr: 50,
  newcap: true, nomen: true, plusplus: true,
  regexp: true, sloppy: true, vars: false,
  white: true
*/

/*global $, la, getComputedStyle */

la.chat = ( function() {
  var
    configMap = {
      main_html : String()
        + '<div class="la-chat">'
          + '<div class="la-chat-head">'
            + '<div class="la-chat-head-toggle">+</div>'
            + '<div class="la-chat-head-title">Chat</div>'
          + '</div>'
          + '<div class="la-chat-closer">x</div>'
          + '<div class="la-chat-sizer">'
            + '<div class="la-chat-messages"></div>'
            + '<div class="la-chat-box">'
              + '<input type="text" />'
              + '<div>send</div>'
            + '</div>'
          + '</div>'
        + '</div>'

      , settable_map : {
        slider_open_time : true
        , slider_close_time : true
        , slider_opened_em : true
        , slider_closed_em : true
        , slider_opened_title : true
        , slider_closed_title : true

        , chat_model : true
        , people_model : true
        , set_chat_anchor : true
      }

      , slider_open_time : 250
      , slider_close_time : 250
      , slider_opened_em : 18
      , slider_closed_em : 2
      , slider_opened_min_em : 10
      , window_height_min_em : 20
      , slider_opened_title : 'Click to close'
      , slider_closed_title : 'Click to open'

      , chat_model : null
      , people_model : null
      , set_chat_anchor : null
    }

    , stateMap = {
      $append_target : null
      , position_type : 'closed'
      , px_per_em : 0
      , slider_hidden_px : 0
      , slider_closed_px : 0
      , slider_opened_px : 0
    }
    , jqueryMap = {}

    // private関数
    , setJqueryMap      // jQueryエレメントを初期化時にまとめて取得
    , getEmSize         // px→em
    , setPxSizes        // スライダのサイズを設定
    , setSliderPosition // チャットスライダーの位置を決定

    // イベントハンドラ
    , onClickToggle // open/closeトグル

    // public関数
    , initModule    // 初期化
    , configModule  // 初期化時の設定情報を渡す
    , removeSlider  // スライダの削除
    , handleResize; // windowリサイズ処理

  setJqueryMap = function() {
    var
      $append_target = stateMap.$append_target
    , $slider = $append_target.find( '.la-chat' );

    jqueryMap = {
        $slider : $slider
      , $head : $slider.find('.la-chat-head')
      , $toggle : $slider.find('.la-chat-head-toggle')
      , $title : $slider.find('.la-chat-head-title')
      , $sizer : $slider.find('.la-chat-sizer')
      , $messages : $slider.find('.la-chat-messages')
      , $box : $slider.find('.la-chat-box')
      , $input : $slider.find('.la-chat-input [type=text]')
    };
  };

  getEmSize = function( elem ){
    return Number( getComputedStyle( elem, '' ).fontSize.match(/(\d*(\.\d*)?)px/)[1]);
  };

  setPxSizes = function(){
    var px_per_em, window_height_em, opened_height_em;
    px_per_em = getEmSize( jqueryMap.$slider.get(0) );
    window_height_em = Math.floor( ($(window).height() / px_per_em )+0.5 );
    opened_height_em = window_height_em > configMap.window_height_min_em
      ? configMap.slider_opened_em
      : configMap.slider_opened_min_em;

    stateMap.px_per_em = px_per_em;
    stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
    stateMap.slider_opened_px = opened_height_em * px_per_em;
    jqueryMap.$sizer.css({ height: (opened_height_em-2)*px_per_em });
  };

  setSliderPosition = function( position_type, callback ){
    var height_px, animate_time, slider_title, toggle_text;

    // スライダが既に要求された市にある場合はtrueを返して終了
    if( stateMap.position_type === position_type ) { return true; }

    // アニメーションパラメータを用意
    switch( position_type ){
      case 'opened':
        height_px = stateMap.slider_opened_px;
        animate_time = configMap.slider_open_time;
        slider_title = configMap.slider_opened_title;
        toggle_text = '=';
        break;
      case 'hidden':
        height_px = 0;
        animate_time = configMap.slider_open_time;
        slider_title = '';
        toggle_text = '+';
        break;
      case 'closed':
        height_px = stateMap.slider_closed_px;
        animate_time = configMap.slider_close_time;
        slider_title = configMap.slider_closed_title;
        toggle_text = '+';
        break;
      default:
        return false;
    }

    // スライダー位置をアニメーションで変更
    stateMap.position_type = '';
    jqueryMap.$slider.animate(
      { height: height_px }
      , animate_time
      , function(){
        jqueryMap.$toggle.prop( 'title', slider_title );
        jqueryMap.$toggle.text( toggle_text );
        stateMap.position_type = position_type;
        if( callback ){ callback( jqueryMap.$slider ); }
      }
    );

    return true;
  };

  onClickToggle = function( event ){
    console.log('onClickToggle'); console.log(event);

    var set_chat_anchor = configMap.set_chat_anchor;
    if( stateMap.position_type === 'opened' ){
      set_chat_anchor( 'closed' );
    } else if( stateMap.position_type === 'closed' ){
      set_chat_anchor( 'opened' );
    }

    return false;
  };

  initModule = function( $append_target ){
    $append_target.append( configMap.main_html );
    stateMap.$append_target = $append_target;
    setJqueryMap();
    setPxSizes();

    // チャットスライダーをデフォルトに設定
    jqueryMap.$toggle.prop( 'title', configMap.slider_closed_title );
    jqueryMap.$head.click( onClickToggle );
    stateMap.position_type = 'closed';
    return true;
  };

  configModule = function( input_map ) {
    la.util.setConfigMap({
      input_map : input_map
      , settable_map : configMap.settable_map
      , config_map : configMap
    });

    return true;
  };

  removeSlider = function(){
    // DOMObjectとイベントバインディングを削除
    if( jqueryMap.$slider ){
      jqueryMap.$slider.remove();
      jqueryMap = {};
    }
    stateMap.$append_target = null;
    stateMap.position_type = 'closed';

    // 主な構成を解除
    configMap.chat_model = null;
    configMap.people_model = null;
    configMap.set_chat_anchor = null;
    return true;
  };

  handleResize = function(){
    // スライダーがなければ何もしない
    if( !jqueryMap.$slider ){ return false; }

    setPxSizes();
    if( stateMap.position_type === 'opened' ){
      jqueryMap.$slider.css({ height: stateMap.slider_opened_px });
    }
    return true;
  };

  return {
    setSliderPosition: setSliderPosition
    , configModule : configModule
    , initModule : initModule
    , removeSlider : removeSlider
    , handleResize : handleResize
  };

}());
