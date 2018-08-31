/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

;(function( $ ){

  'use strict';

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null,
      ignore: null
    };

    if(!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement("div");
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        'iframe[src*="player.vimeo.com"]',
        'iframe[src*="youtube.com"]',
        'iframe[src*="youtube-nocookie.com"]',
        'iframe[src*="kickstarter.com"][src*="video.html"]',
        'object',
        'embed'
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var ignoreList = '.fitvidsignore';

      if(settings.ignore) {
        ignoreList = ignoreList + ', ' + settings.ignore;
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not('object object'); // SwfObj conflict patch
      $allVideos = $allVideos.not(ignoreList); // Disable FitVids on this video.

      $allVideos.each(function(){
        var $this = $(this);
        if($this.parents(ignoreList).length > 0) {
          return; // Disable FitVids on this video.
        }
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        if ((!$this.css('height') && !$this.css('width')) && (isNaN($this.attr('height')) || isNaN($this.attr('width'))))
        {
          $this.attr('height', 9);
          $this.attr('width', 16);
        }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('name')){
          var videoName = 'fitvid' + $.fn.fitVids._count;
          $this.attr('name', videoName);
          $.fn.fitVids._count++;
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+'%');
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
  
  // Internal counter for unique video names.
  $.fn.fitVids._count = 0;
  
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );
;
/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - https://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, window, document, undefined) {

  // Do not place in attach function from behaviors
  window.onload = function() {

    $('body').removeClass('no-js').addClass('js');

    if(window.location.hash == "#results") {

      var element = $('.block-result-list, .search-info-wrapper');
      if(element != undefined) {
        $('html, body').animate({
          scrollTop:element.offset().top
        }, 'slow');
      }
    }

    $('a.colorbox-load').attr('href', function(i, h) {
     return h + (h.indexOf('?') != -1 ? "&autoplay=1" : "?autoplay=1");
    });

    $('a.colorbox-youtube').on('click', function(event) {
      event.preventDefault();
      href = $(this).attr("href");
      if(href.indexOf("embed") == -1) {
        href = $(this).attr("href").replace('watch?v=', 'embed/') 
      }
      else {
        href = $(this).attr("href").replace('watch?v=', 'v/')
      }
      // Add autoplay
      href = href + (href.indexOf('?') != -1 ? "&autoplay=1&enablejsapi=1" : "?autoplay=1&enablejsapi=1");

      $.colorbox({
        href: href,
        width: '768px',
        maxWidth: '100%',
        height: '576px',
        iframe: true
      });
    });
  }

// To understand behaviors, see https://drupal.org/node/756722#behaviors
  Drupal.behaviors.customer = {

    eurolandirApi: 'https://tools.eurolandir.com/tools/PriceFeed/RequestStockDataBundleJSON_Listings.aspx?companyid=1421',

    attach: function(context, settings) {
      var self = this;

      this.tabletMaxWidth = 1025;
      this.mobileMaxWidth = 767;
      this.kingSizeWidth = 1280;

      this.menuBehaviors(context, settings);
      this.addSubmitResultsHash(context);

      this.initScorWidget.bind(this)();

      this.initZone4(context);

      this.initTable(context);
      this.initGraphicMobile(context);

      $(window, context).load(function() {
        self.homeSlider(context);
      });

      this.animateScroll(context);

      this.backToTop(context);

      this.videoRwd(context);

      this.initColorboxInline(context);

      $twitterLink = $("a[data-xiti='twitter']", context);
      twitterHref = $twitterLink.attr("href");
      $twitterLink.attr("href", twitterHref + " @via @SCOR_SE");

      //---------- Page contenu zone 4 : Graphiques ----------
      var $visus = $('.paragraphs-item-zone-4 .visus-list');
      bodyHeight = $visus.parents('body').height();

      // if( bodyHeight < $(window).height() ) {
      //   $visus.addClass('small-page');
      // }

      // Apparition en fondu au scroll - désactivé à la demande du client
      // $(window).scroll( function(){
      //   if($visus.length >= 1) {
      //     var bottom_of_object = $visus.offset().top + $visus.outerHeight();
      //     var bottom_of_window = $(window).scrollTop() + $(window).height();

      //     if(bottom_of_window > bottom_of_object){
      //       $visus.animate({'opacity':'1'}, 500);
      //     }
      //   }
      // });

      // TIMELINE titre header sur deux lignes avec premier mot en gras
      var timeline_title = $('.page-node-296, .page-node-297').find('#content h1 a');
      timeline_title.html(timeline_title.text().replace(/(^\w+)/,'<strong>$1</strong>') );


      // Node news width CTA button
      if($(window).width() > 768) {

        var btn_width = 0;

        $('.node-type-news .field-name-field-attached-docs > .field-items > .field-item').each(function() {
          if(btn_width < $(this).find('.btn a').width()) {
            btn_width = $(this).find('.btn a').width();
          }
        });

        $('.node-type-news .field-name-field-attached-docs > .field-items > .field-item').each(function() {
          $(this).find('.btn a').width(btn_width + 10);
        });
      }

      // Page contenu image interview centrée verticalement
      if($(window).width() > 768 && $(window).width() < 1025) {

        $('.node-type-content-page .paragraphs-item-zone-5').each(function() {
          var container_height = $(this).find('.group-interview').height();
          var image_height = $(this).find('.field-name-field-visual').height();

          if(container_height > image_height) {
            var margin_img = (container_height - image_height) / 2;
          }

          $(this).find('.field-name-field-visual').css('margin-top', margin_img);
        });
      }

      // validation email / confirmation email avant envoie formulaire
      var $email = $('.webform-component-email input'),
          $emailConfirm = $('.webform-component--email-confirmation input');

      $emailConfirm.focusin(function() {
        Drupal.behaviors.customer.verifEmail($email, $emailConfirm, context);
      });
      $emailConfirm.focusout(function() {
        Drupal.behaviors.customer.verifEmail($email, $emailConfirm, context);
      });
    },

    initScorWidget: function() {
      var self = this;
      var $scorWidget = $('#scor-widget');

      var loadWidget = function(scorMarket) {
        var date = moment.utc(scorMarket.data[0].timestamp);
        $scorWidget.find('.date').text(date.format('DD/MM/YYYY HH:mm'));
        $scorWidget.find('.last').text(scorMarket.data[0].last + " " + scorMarket.data[0].currency);
        $scorWidget.find('.changePer').text(scorMarket.data[0].changePercent+"%");

        if(scorMarket.data[0].changePercent > 0) {
          $scorWidget.find('.changePer').removeClass('negative');
          $scorWidget.find('.changePer').addClass('positive');
        }
        else {
          $scorWidget.find('.changePer').addClass('negative');
          $scorWidget.find('.changePer').removeClass('positive');
        }

        setTimeout(function(){$.get(self.eurolandirApi, loadWidget)}, 60000);
      };

      $.get(self.eurolandirApi, loadWidget);
    },

    diamondCenter: function(context) {
      var $diamond = $('#block-diamond-expanded', context);
      if($diamond.length > 0) {
        var $bigDiam = $diamond.find('.main-diamond .diamond');
        var $minDiam = $diamond.find('.other-diamonds .diamond');
        var $lastMinDiam = $minDiam.last();
        var diamSize = $lastMinDiam.offset().left + $lastMinDiam.width() - $bigDiam.offset().left;

        if($minDiam.length < 9) {

          if($diamond.width() > diamSize) {
            var marginLeft = ($diamond.width() - diamSize) / 2;
            $diamond.css('margin-left', marginLeft);
          }

        } else {

          $diamond.css({
            'margin-left': 0,
            'margin-right': 0
          })
        }
      }
    },

    addSubmitResultsHash: function(context) {
      var forms = $('#tds-specifics-news-filter-form, #tds-specifics-jobs-filter-form');
      forms.each(function(index, element) {
        var formAction = $(element).attr("action");
        if(formAction.indexOf("#results") == -1) {
          $(element).attr("action", formAction + "#results");
        }
      });
    },

    /**
     * vérifier que 2 champs email sont identiques
     */
    verifEmail: function(email, emailConfirm, context) {
      var $email = email,
          $emailConfirm = emailConfirm;

      if( $email.val() != $emailConfirm.val() ){
        $email.addClass('error');
        $emailConfirm.addClass('error');
      } else {
        $email.removeClass('error');
        $emailConfirm.removeClass('error');
      }
    },

    /**
     * Click events for paragraphs "zone 4"
     *
     * @param context
     */
    initZone4: function(context) {
      $('.visu-item.element-invisible')
        .css('display', 'none')
        .toggleClass('element-invisible');

      $('.paragraphs-item-zone-4', context).on('click', '.cta-item',function(e){

        var fcid = this.dataset.fcid;
        var $visuItem = $('.visu-item[data-fcid="'+fcid+'"]', e.delegateTarget);
        var $visuOthers = $('.visu-item[data-fcid!="'+fcid+'"]', e.delegateTarget);

        // Modif Pierre
        if(!$(this).hasClass('active')) {
          $('.cta-item.active', e.delegateTarget).removeClass('active');
          $(this).addClass('active');
          $visuOthers.hide();
          $visuItem.fadeIn();
        }
      });
    },

    /**
     * primary & secondary menu (header)
     */
    menuBehaviors: function(context, settings) {
      // on tablet
      if ($(window).width() > this.mobileMaxWidth && $(window).width() <= this.kingSizeWidth) {
        // scrim behavior (div permettant de fermer les menus lorsqu'on clique n'importe ou en dehors)
        var $scrim = $('.scrim', context);
        $scrim.on('tap', function(e) {
          e.preventDefault();
          $('.region-header .block-secondary-menu, .region-header .block-primary-menu', context).find('.menu__link, .menu').removeClass('active');
          $scrim.removeClass('opened');
          return false;
        });

        // tap & double tap
        $('.region-header .block-primary-menu, .region-header .block-secondary-menu', context).on('tap', '.menu__link', function(e) {
          // e.preventDefault();
          // var url = $(this, context).attr('href');
          // if (url) {
          //   window.location.href = Drupal.absoluteUrl(url);
          // }
          // return false;
          var $link = $(this);
          var $parent = $link.parent();
          var $parentMenu = $parent.parent();
          var $subMenu = $parent.find('> .menu');
          var hasSubMenu = $subMenu.length > 0;
          // open scrim
          $scrim.addClass('opened');
          // handle tap if the link can open a submenu
          if (hasSubMenu) {
            e.preventDefault();
            if ($subMenu.hasClass('active')) {
              $parent.removeClass('active');
              $subMenu.removeClass('active');
              if ($parentMenu.parent().is('nav.menu-block-wrapper')) {
                $scrim.removeClass('opened');
              }
            }
            else {
              if ($('.region-header .block-primary-menu').has(this).length > 0) {
                $('.region-header .block-secondary-menu').find('.menu__link, .menu').removeClass('active');
              }
              else {
                $('.region-header .block-primary-menu').find('.menu__link, .menu').removeClass('active');
              }
              $parentMenu.find('.menu__item').removeClass('active');
              $parentMenu.find('.menu').removeClass('active');
              $parent.addClass('active');
              $subMenu.addClass('active');
            }
            return false;
          }
        }).on('doubletap', '.menu__link', function(e) {
          e.preventDefault();
          var url = $(this, context).attr('href');
          if (url) {
            window.location.href = Drupal.absoluteUrl(url);
          }
          return false;
        });
      }

      // menu behavior on mobile
      if ($(window).width() <= this.mobileMaxWidth) {
        // close menu on scor-live btn tap
        $('.scor-live-btn').on('tap', function(e) {
          $('#menu-mobile-wrapper', context).removeClass('open');
        });
        // move header-region
        $('#header .region-header', context).appendTo('#menu-mobile-wrapper');
        $('#header .block-language', context).insertBefore('#menu-mobile-wrapper .menu-close');
        // handle menu burger and menu close touch event
        $('#header .menu-burger, #menu-mobile-wrapper .menu-close', context).on('tap', function(e) {
          e.preventDefault();
          $('#header .region-header', context).toggleClass('open');
          $('#menu-mobile-wrapper', context).toggleClass('open');
          // close tds_live if needed
          Drupal.behaviors.tdsLiveHeader.toggleSlideScorLive($('.scor-live-slideshow', context), $('.scor-live-btn', context), 'close');
          return false;
        });
        // handle prev/next action
        $('#header .menu__item', context).on('tap', '.next, .prev', function(e) {
          e.preventDefault();
          var isNext = $(this).hasClass('next'); // action next si true, prev si false.
          var $parent = $(this).parent();
          var $parentMenu = $parent.parent();
          var $parentBlock = $parentMenu.parents('.block-primary-menu, .block-secondary-menu');

          $('.block-primary-menu, .block-secondary-menu').css('z-index', 0);
          $parentBlock.css('z-index', 1);

          $(this).parents("#menu-mobile-wrapper").addClass('open-lvl'); // pour anciens navigateur

          var isFirst = $parentMenu.parent().hasClass('menu-level-1');

          if (isNext) {
            $parent.addClass('open');
            $parent.find('> .menu').addClass('open');
            $parentMenu.addClass('open');
            $('.block-primary-menu, .block-secondary-menu').css('position', 'relative');
            $parentBlock.css('position', 'absolute');
            if (!isFirst) { // permet de remonter le niveau 2 visuellement
              $parentMenu.addClass('lvl2-open');
            }
          }
          else {
            $parent.removeClass('open');
            $parent.find('> .menu').removeClass('open');
            if (isFirst) {
              $parentMenu.removeClass('open');
              $parentBlock.css('position', 'relative');
            }
            else {
              $parentMenu.removeClass('lvl2-open');
            }
          }
          return false;
        });
      }

      // new behavior on tablet and desktop (update 7/10/2016)
      if ($(window).width() > this.mobileMaxWidth) {
        $('.region-header .block-secondary-menu', context).on('tap', '.next', function(e) {
          e.preventDefault();
          $(this).toggleClass('active');
          $(this).next('.menu').toggleClass('active');
          return false;
        });
      }
    },

    initColorboxInline: function(context) {
      $('[data-href][colorbox]', context).each(function() {
        $(this).colorbox({
          href: this.dataset.href,
          width: '768px',
          maxWidth: '100%',
          height: '576px',
          iframe: true})
        ;
      });
    },

    /**
     * tableau avec scroll horizontal // en version mobile
     */
    initTable: function(context) {

      if ($(window).width() <= this.mobileMaxWidth) {
        var $tables = $('.node table', context);

        $tables.each(function(index, el) {
          $(this).wrap('<div class="table-container"></div>');
        });

        $('.table-container table').stacktable();
      }
    },
    /**
     * graphique avec scroll horizontal // en version mobile
     */
    initGraphicMobile: function(context) {

      if ($(window).width() <= this.mobileMaxWidth) {
        var $graphic = $('.paragraphs-item-zone-4 .visu-item img', context);

        $graphic.each(function(index, el) {
          $(this).wrap('<div class="graph-container"></div>');
        });
      }
    },

    /**
     * home - slider image déco sur toute la largeur
     */
    homeSlider: function(context) {
      if ($(window).width() > this.kingSizeWidth) {

        var $slideshow = $('#slideshow-wrapper .wrapper', context),
          windowHeight = $(window).height() - $('#header').height(),
          newHeight = $slideshow.find('.slideshow-item img').height();

        if ( windowHeight < newHeight ) {
          newHeight = windowHeight;
        }

        $slideshow.parents('.content-top-wrapper').height(newHeight);
      }
    },

    /**
     * Bouton/ancre "aller en bas de page" / animation scroll
     */
    animateScroll: function(context) {
      // go-to-bottom
      $('.go-to-bottom').click(function(){
        var idLink = $(this).attr("href");

        $('html, body').animate({
          scrollTop:$(idLink).offset().top
        }, 'slow');
        return false;
      });
    },

    backToTop: function(context) {
      var backToTopArrow = $('#back-to-top');
      backToTopArrow.hide();
      $(document).scroll(function(){
        var windowHeight = $(window).height();
        var scrollHeight = $(window).scrollTop();
        backToTopArrow.hide();
        if(windowHeight < scrollHeight) {
          backToTopArrow.show();
        } else {
          backToTopArrow.hide();
        }
      })
      backToTopArrow.click(function(){
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
      })
    },

    videoRwd: function(context) {
      if ($(window).width() <= this.mobileMaxWidth) {
        $("#content", context).fitVids();
      }
    }

  };

})(jQuery, Drupal, this, this.document);
;
jQuery( document ).ready(function() {
  
  // Enable custom audio player
  jQuery('audio').audioPlayer();
});


/*
	AUTHOR: Osvaldas Valutis, www.osvaldas.info
*/

(function(e,t,n,r){var i="ontouchstart"in t,s=i?"touchstart":"mousedown",o=i?"touchmove":"mousemove",u=i?"touchend":"mouseup",a=i?"touchcancel":"mouseup",f=function(e){var t=Math.floor(e/3600),n=Math.floor(e%3600/60),r=Math.ceil(e%3600%60);return(t==0?"":t>0&&t.toString().length<2?"0"+t+":":t+":")+(n.toString().length<2?"0"+n:n)+":"+(r.toString().length<2?"0"+r:r)},l=function(e){var t=n.createElement("audio");return!!(t.canPlayType&&t.canPlayType("audio/"+e.split(".").pop().toLowerCase()+";").replace(/no/,""))};e.fn.audioPlayer=function(t){var t=e.extend({classPrefix:"audioplayer",strPlay:"Play",strPause:"Pause",strVolume:"Volume"},t),n={},r={playPause:"playpause",playing:"playing",time:"time",timeCurrent:"time-current",timeDuration:"time-duration",bar:"bar",barLoaded:"bar-loaded",barPlayed:"bar-played",volume:"volume",volumeButton:"volume-button",volumeAdjust:"volume-adjust",noVolume:"novolume",mute:"mute",mini:"mini"};for(var u in r)n[u]=t.classPrefix+"-"+r[u];this.each(function(){if(e(this).prop("tagName").toLowerCase()!="audio")return false;var r=e(this),u=r.attr("src"),c=r.get(0).getAttribute("autoplay"),c=c===""||c==="autoplay"?true:false,h=r.get(0).getAttribute("loop"),h=h===""||h==="loop"?true:false,p=false;if(typeof u==="undefined"){r.find("source").each(function(){u=e(this).attr("src");if(typeof u!=="undefined"&&l(u)){p=true;return false}})}else if(l(u))p=true;var d=e('<div class="'+t.classPrefix+'">'+(p?e("<div>").append(r.eq(0).clone()).html():'<embed src="'+u+'" width="0" height="0" volume="100" autostart="'+c.toString()+'" loop="'+h.toString()+'" />')+'<div class="'+n.playPause+'" title="'+t.strPlay+'"><a href="#">'+t.strPlay+"</a></div></div>"),v=p?d.find("audio"):d.find("embed"),v=v.get(0);if(p){d.find("audio").css({width:0,height:0,visibility:"hidden"});d.append('<div class="'+n.time+" "+n.timeCurrent+'"></div><div class="'+n.bar+'"><div class="'+n.barLoaded+'"></div><div class="'+n.barPlayed+'"></div></div><div class="'+n.time+" "+n.timeDuration+'"></div><div class="'+n.volume+'"><div class="'+n.volumeButton+'" title="'+t.strVolume+'"><a href="#">'+t.strVolume+'</a></div><div class="'+n.volumeAdjust+'"><div><div></div></div></div></div>');var m=d.find("."+n.bar),g=d.find("."+n.barPlayed),y=d.find("."+n.barLoaded),b=d.find("."+n.timeCurrent),w=d.find("."+n.timeDuration),E=d.find("."+n.volumeButton),S=d.find("."+n.volumeAdjust+" > div"),x=0,T=function(e){theRealEvent=i?e.originalEvent.touches[0]:e;v.currentTime=Math.round(v.duration*(theRealEvent.pageX-m.offset().left)/m.width())},N=function(e){theRealEvent=i?e.originalEvent.touches[0]:e;v.volume=Math.abs((theRealEvent.pageY-(S.offset().top+S.height()))/S.height())},C=setInterval(function(){y.width(v.buffered.end(0)/v.duration*100+"%");if(v.buffered.end(0)>=v.duration)clearInterval(C)},100);var k=v.volume,L=v.volume=.111;if(Math.round(v.volume*1e3)/1e3==L)v.volume=k;else d.addClass(n.noVolume);w.html("…");b.text(f(0));v.addEventListener("loadeddata",function(){w.text(f(v.duration));S.find("div").height(v.volume*100+"%");x=v.volume});v.addEventListener("timeupdate",function(){b.text(f(v.currentTime));g.width(v.currentTime/v.duration*100+"%")});v.addEventListener("volumechange",function(){S.find("div").height(v.volume*100+"%");if(v.volume>0&&d.hasClass(n.mute))d.removeClass(n.mute);if(v.volume<=0&&!d.hasClass(n.mute))d.addClass(n.mute)});v.addEventListener("ended",function(){d.removeClass(n.playing)});m.on(s,function(e){T(e);m.on(o,function(e){T(e)})}).on(a,function(){m.unbind(o)});E.on("click",function(){if(d.hasClass(n.mute)){d.removeClass(n.mute);v.volume=x}else{d.addClass(n.mute);x=v.volume;v.volume=0}return false});S.on(s,function(e){N(e);S.on(o,function(e){N(e)})}).on(a,function(){S.unbind(o)})}else d.addClass(n.mini);if(c)d.addClass(n.playing);d.find("."+n.playPause).on("click",function(){if(d.hasClass(n.playing)){e(this).attr("title",t.strPlay).find("a").html(t.strPlay);d.removeClass(n.playing);p?v.pause():v.Stop()}else{e(this).attr("title",t.strPause).find("a").html(t.strPause);d.addClass(n.playing);p?v.play():v.Play()}return false});r.replaceWith(d)});return this}})(jQuery,window,document);
/**
 * stacktable.js
 * Author & copyright (c) 2012: John Polacek
 * CardTable by: Justin McNally (2015)
 * Dual MIT & GPL license
 *
 * Page: http://johnpolacek.github.com/stacktable.js
 * Repo: https://github.com/johnpolacek/stacktable.js/
 *
 * jQuery plugin for stacking tables on small screens
 * Requires jQuery version 1.7 or above
 *
 */
;(function($) {
  $.fn.cardtable = function(options) {
    var $tables = this,
        defaults = {headIndex:0},
        settings = $.extend({}, defaults, options),
        headIndex;

    // checking the "headIndex" option presence... or defaults it to 0
    if(options && options.headIndex)
      headIndex = options.headIndex;
    else
      headIndex = 0;

    return $tables.each(function() {
      var $table = $(this);
      if ($table.hasClass('stacktable')) {
        return;
      }
      var table_css = $(this).prop('class');
      var $stacktable = $('<div></div>');
      if (typeof settings.myClass !== 'undefined') $stacktable.addClass(settings.myClass);
      var markup = '';
      var $caption, $topRow, headMarkup, bodyMarkup, tr_class;

      $table.addClass('stacktable large-only');

      $caption = $table.find(">caption").clone();
      $topRow = $table.find('>thead>tr,>tbody>tr,>tfoot>tr,>tr').eq(0);

      // avoid duplication when paginating
      $table.siblings().filter('.small-only').remove();

      // using rowIndex and cellIndex in order to reduce ambiguity
      $table.find('>tbody>tr').each(function() {

        // declaring headMarkup and bodyMarkup, to be used for separately head and body of single records
        headMarkup = '';
        bodyMarkup = '';
        tr_class = $(this).prop('class');
        // for the first row, "headIndex" cell is the head of the table
        // for the other rows, put the "headIndex" cell as the head for that row
        // then iterate through the key/values
        $(this).find('>td,>th').each(function(cellIndex) {
          if ($(this).html() !== ''){
            bodyMarkup += '<tr class="' + tr_class +'">';
            if ($topRow.find('>td,>th').eq(cellIndex).html()){
              bodyMarkup += '<td class="st-key">'+$topRow.find('>td,>th').eq(cellIndex).html()+'</td>';
            } else {
              bodyMarkup += '<td class="st-key"></td>';
            }
            bodyMarkup += '<td class="st-val '+$(this).prop('class')  +'">'+$(this).html()+'</td>';
            bodyMarkup += '</tr>';
          }
        });

        markup += '<table class=" '+ table_css +' stacktable small-only"><tbody>' + headMarkup + bodyMarkup + '</tbody></table>';
      });

      $table.find('>tfoot>tr>td').each(function(rowIndex,value) {
        if ($.trim($(value).text()) !== '') {
          markup += '<table class="'+ table_css + ' stacktable small-only"><tbody><tr><td>' + $(value).html() + '</td></tr></tbody></table>';
        }
      });

      $stacktable.prepend($caption);
      $stacktable.append($(markup));
      $table.before($stacktable);
    });
  };

  $.fn.stacktable = function(options) {
    var $tables = this,
        defaults = {headIndex:0,displayHeader:true},
        settings = $.extend({}, defaults, options),
        headIndex;

    // checking the "headIndex" option presence... or defaults it to 0
    if(options && options.headIndex)
      headIndex = options.headIndex;
    else
      headIndex = 0;

    return $tables.each(function() {
      var table_css = $(this).prop('class');
      var $stacktable = $('<table class="'+ table_css +' stacktable small-only"><tbody></tbody></table>');
      if (typeof settings.myClass !== 'undefined') $stacktable.addClass(settings.myClass);
      var markup = '';
      var $table, $caption, $topRow, headMarkup, bodyMarkup, tr_class, displayHeader;

      $table = $(this);
      $table.addClass('stacktable large-only');
      $caption = $table.find(">caption").clone();
      $topRow = $table.find('>thead>tr,>tbody>tr,>tfoot>tr').eq(0);

      displayHeader = $table.data('display-header') === undefined ? settings.displayHeader : $table.data('display-header');

      // using rowIndex and cellIndex in order to reduce ambiguity
      $table.find('>tbody>tr, >thead>tr').each(function(rowIndex) {

        // declaring headMarkup and bodyMarkup, to be used for separately head and body of single records
        headMarkup = '';
        bodyMarkup = '';
        tr_class = $(this).prop('class');

        // for the first row, "headIndex" cell is the head of the table
        if (rowIndex === 0) {
          // the main heading goes into the markup variable
          if (displayHeader) {
            markup += '<tr class=" '+tr_class +' "><th class="st-head-row st-head-row-main" colspan="2">'+$(this).find('>th,>td').eq(headIndex).html()+'</th></tr>';
          }
        } else {
          // for the other rows, put the "headIndex" cell as the head for that row
          // then iterate through the key/values
          $(this).find('>td,>th').each(function(cellIndex) {
            if (cellIndex === headIndex) {
              headMarkup = '<tr class="'+ tr_class+'"><th class="st-head-row" colspan="2">'+$(this).html()+'</th></tr>';
            } else {
              if ($(this).html() !== ''){
                bodyMarkup += '<tr class="' + tr_class +'">';
                if ($topRow.find('>td,>th').eq(cellIndex).html()){
                  bodyMarkup += '<td class="st-key">'+$topRow.find('>td,>th').eq(cellIndex).html()+'</td>';
                } else {
                  bodyMarkup += '<td class="st-key"></td>';
                }
                bodyMarkup += '<td class="st-val '+$(this).prop('class')  +'">'+$(this).html()+'</td>';
                bodyMarkup += '</tr>';
              }
            }
          });

          markup += headMarkup + bodyMarkup;
        }
      });

      $stacktable.prepend($caption);
      $stacktable.append($(markup));
      $table.before($stacktable);
    });
  };

 $.fn.stackcolumns = function(options) {
    var $tables = this,
        defaults = {},
        settings = $.extend({}, defaults, options);

    return $tables.each(function() {
      var $table = $(this);
      var $caption = $table.find(">caption").clone();
      var num_cols = $table.find('>thead>tr,>tbody>tr,>tfoot>tr').eq(0).find('>td,>th').length; //first table <tr> must not contain colspans, or add sum(colspan-1) here.
      if(num_cols<3) //stackcolumns has no effect on tables with less than 3 columns
        return;

      var $stackcolumns = $('<table class="stacktable small-only"></table>');
      if (typeof settings.myClass !== 'undefined') $stackcolumns.addClass(settings.myClass);
      $table.addClass('stacktable large-only');
      var tb = $('<tbody></tbody>');
      var col_i = 1; //col index starts at 0 -> start copy at second column.

      while (col_i < num_cols) {
        $table.find('>thead>tr,>tbody>tr,>tfoot>tr').each(function(index) {
          var tem = $('<tr></tr>'); // todo opt. copy styles of $this; todo check if parent is thead or tfoot to handle accordingly
          if(index === 0) tem.addClass("st-head-row st-head-row-main");
          var first = $(this).find('>td,>th').eq(0).clone().addClass("st-key");
          var target = col_i;
          // if colspan apply, recompute target for second cell.
          if ($(this).find("*[colspan]").length) {
            var i =0;
            $(this).find('>td,>th').each(function() {
                var cs = $(this).attr("colspan");
                if (cs) {
                  cs = parseInt(cs, 10);
                  target -= cs-1;
                  if ((i+cs) > (col_i)) //out of current bounds
                    target += i + cs - col_i -1;
                  i += cs;
                } else {
                  i++;
                }

                if (i > col_i)
                  return false; //target is set; break.
            });
          }
          var second = $(this).find('>td,>th').eq(target).clone().addClass("st-val").removeAttr("colspan");
          tem.append(first, second);
          tb.append(tem);
        });
        ++col_i;
      }

      $stackcolumns.append($(tb));
      $stackcolumns.prepend($caption);
      $table.before($stackcolumns);
    });
  };

}(jQuery));
;

      

/*!
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
!function(a){function f(a,b){if(!(a.originalEvent.touches.length>1)){a.preventDefault();var c=a.originalEvent.changedTouches[0],d=document.createEvent("MouseEvents");d.initMouseEvent(b,!0,!0,window,1,c.screenX,c.screenY,c.clientX,c.clientY,!1,!1,!1,!1,0,null),a.target.dispatchEvent(d)}}if(a.support.touch="ontouchend"in document,a.support.touch){var e,b=a.ui.mouse.prototype,c=b._mouseInit,d=b._mouseDestroy;b._touchStart=function(a){var b=this;!e&&b._mouseCapture(a.originalEvent.changedTouches[0])&&(e=!0,b._touchMoved=!1,f(a,"mouseover"),f(a,"mousemove"),f(a,"mousedown"))},b._touchMove=function(a){e&&(this._touchMoved=!0,f(a,"mousemove"))},b._touchEnd=function(a){e&&(f(a,"mouseup"),f(a,"mouseout"),this._touchMoved||f(a,"click"),e=!1)},b._mouseInit=function(){var b=this;b.element.bind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),c.call(b)},b._mouseDestroy=function(){var b=this;b.element.unbind({touchstart:a.proxy(b,"_touchStart"),touchmove:a.proxy(b,"_touchMove"),touchend:a.proxy(b,"_touchEnd")}),d.call(b)}}}(jQuery);;
