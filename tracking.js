/**
 * @file
 *
 * All specific tracking must be set in this file in order to centralized data and to not add templates only for tracking purpose
 * GTM Tracking behavior.
 */


(function ($, Drupal) {

  $.urlParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURIComponent(results[1]) || 0;
    }
  };

  Drupal.behaviors.Tracking = {

    isHome: false,

    attach: function (context, settings) {
      tracking = this;

      if ($('body', context).hasClass('front')) {
        tracking.isHome = true;
      }
      if (!$('body', context).hasClass('page-search-site-list')) {
        $.cookie('siteSearchOrigin', 'search_engine', { path: '/'});
        $.cookie('siteSearchPerformed', 0, { path: '/'});
      }
      window.dataLayer = window.dataLayer || [];

      tracking.navZone(context, settings);
      tracking.quickLinksButton(context, settings);
      tracking.virtualContactExperts(context, settings);
      tracking.genericContact(context, settings);
      tracking.pressCenter(context, settings);
      tracking.blogScorLive(context, settings);
      tracking.sourceScorLive(context, settings);
      tracking.scorLiveMlt(context, settings);
      tracking.scorLive(context, settings);
      tracking.footerSocialNetwork(context, settings);
      tracking.quickLinksSocialNetworkShare(context, settings);
      tracking.siteSearchOrigin(context, settings);
      tracking.siteSearchResults(context, settings);
      tracking.addCart(context, settings);
      tracking.pressReleaseOpenPdf(context, settings);
      tracking.fieldsAccordion(context, settings);
      //tracking.cartDownload(context, settings); // called in sites/all/modules/custom/tds_cart/js/tds-cart.js
      //tracking.accordeon(context, settings); // called in sites/all/modules/custom/tds_experts/js/tds_experts_list.js
    },

    pressReleaseOpenPdf: function (context, settings) {
      if (settings.dataLayer.newsType == 'Press release') {
        $('div.field-name-field-attached-docs a', context).click(function(e) {
          // KPI 20
          window.dataLayer.push({
            "event": "ouverturePdf",
            "pageName": settings.dataLayer.pageName,
            "siteSection": settings.dataLayer.siteSection
          });
        });
      }
    },

    //PDF Document  Slideshow  Expert publication  News  Press release  SCOR Live : blog  Video  Image
    addCart: function (context, settings) {
      $('a[data-cart="add"]', context).click(function(e) {
        var documentName = $(this).data('doc_name');
        var documentType = $(this).data('doc_type');
        // KPI 19
        window.dataLayer.push({
          "event": "ajoutPanier",
          "documentType": documentType,
          "documentName": documentName,
          "siteSection": settings.dataLayer.siteSection
        });
      });
    },

    cartDownload: function (context, settings) {
      $('div#cart-wrapper li.cart-item').each(function() {
        var documentName = $(this).data('doc_name');
        var documentType = $(this).data('doc_type');
        var documentSubject = '';
        var siteSection = '';
        var cartDocsInfo = JSON.parse(localStorage.getItem("cartDocsInfo"));
        if (cartDocsInfo !== null) {
          if ($(this).attr('id') in cartDocsInfo) {
            siteSection = cartDocsInfo[$(this).attr('id')].siteSection;
            if ('documentSubject' in cartDocsInfo[$(this).attr('id')]) {
              documentSubject = cartDocsInfo[$(this).attr('id')].documentSubject;
            }
          }
        }
        // KPI 21
        window.dataLayer.push({
          "event": "documentDownload",
          "typeTelechargement": "cart download",
          "documentType": documentType,
          "siteSection": siteSection,
          "documentName": documentName,
          "documentSubject": documentSubject
        });
      });
    },

    siteSearchResults: function (context, settings) {
      if ($('body.page-search-site-list', context).length) {
        var siteSearchPerformed = $.cookie('siteSearchPerformed', { path: '/'}) || 0;
        var siteSearchOrigin = $.cookie('siteSearchOrigin', { path: '/'}) || 'search_engine';
        var checkedVals = $('#edit-col-left input[type="checkbox"]:checked', context).map(function() {
          return $(this).data('gtm');
        }).get();
        var siteSearchCategory = '';
        if (checkedVals.length) {
          siteSearchCategory = checkedVals.join('|');
        }

        if (siteSearchPerformed == 1) {
          if (window.history.pushState) {
            var newUrl = window.location.href;
            if (newUrl.indexOf('?') >= 0) {
              newUrl= newUrl.replace('?', '?searchTool=' + siteSearchOrigin + '&');
            } else {
              if (newUrl.indexOf('#') >= 0) {
                newUrl = newUrl.replace('#', '?searchTool=' + siteSearchOrigin + '#');
              } else {
                newUrl += '?searchTool=' + siteSearchOrigin;
              }
            }
            window.history.pushState({},'Results from "' + siteSearchOrigin + '"', newUrl);
          }
        }

        if ($('#search-form', context).length) {
          $('a.reset').click(function(e) {
            $.cookie('siteSearchPerformed', 0, { path: '/'});
          });
          $('#search-form', context).submit(function( event ) {
            $.cookie('siteSearchPerformed', 1, { path: '/'});
          });
        }

        var selectorMap = new Map();
        selectorMap.set('ul.search-results article h3 > a', 'title');
        selectorMap.set('ul.search-results article div.cart a', 'action');
        selectorMap.forEach(function(value, selector) {
          $(selector, context).click(function(e) {
            var resultsButton = value;
            var documentDownloadEvent = false;
            var documentType = $(this).closest('div.left-block').find('a[data-cart="add"]').data('doc_type');
            var documentName = $(this).closest('div.left-block').find('a[data-cart="add"]').data('doc_name');
            var documentSubject = $(this).closest('div.left-block').find('a[data-cart="add"]').data('doc_theme');
            if (value == 'action') {
              if ($(this).hasClass('btn')) {
                resultsButton = 'download PDF';
                documentDownloadEvent = true;
              } else if ($(this).hasClass('colorbox-youtube')) {
                resultsButton = 'watch video';
              } else if ($(this).hasClass('cart-link')) {
                resultsButton = 'add cart';
                var uniqId = $(this).data('type') + '-' + $(this).data('id');
                var cartDocsInfo = JSON.parse(localStorage.getItem("cartDocsInfo"));
                if (cartDocsInfo !== null) {
                  cartDocsInfo[uniqId] = {
                    "siteSection": settings.dataLayer.siteSection
                  };
                } else {
                  cartDocsInfo = {[uniqId]: {
                    "siteSection": settings.dataLayer.siteSection
                  }};
                }
                if ($(this).closest('div.left-block').find('a.btn').length) {
                  cartDocsInfo[uniqId] = {
                    "documentSubject": documentSubject,
                    "siteSection": settings.dataLayer.siteSection
                  };
                }
                localStorage.setItem("cartDocsInfo", JSON.stringify(cartDocsInfo));
              } else {
                resultsButton = 'view news';
              }
            } else {
              if ($(this).closest('div.left-block').find('a.btn').length) {
                documentDownloadEvent = true;
              }
            }
            // KPI 16
            window.dataLayer.push({
              "event": "clicResultats",
              "resultsButton": resultsButton,
              "siteSection": settings.dataLayer.siteSection,
              "siteSearchOrigin": siteSearchOrigin
            });
            if (documentDownloadEvent) {
              // KPI 21
              window.dataLayer.push({
                "event": "documentDownload",
                "typeTelechargement": "direct download",
                "documentType": documentType,
                "siteSection": settings.dataLayer.siteSection,
                "documentName": documentName,
                "documentSubject": documentSubject
              });
            }
          });
        });
      }
    },

    siteSearchOrigin: function (context, settings) {
      $('div.block-tds-toolbar li.tool-publication > a', context).click(function(e) {
        $.cookie('siteSearchOrigin', 'search_engine', { path: '/'});
        $.cookie('siteSearchPerformed', 0, { path: '/'});
      });
      if ($('#search-block-form', context).length) {
        $('#search-block-form', context).submit(function( event ) {
          $.cookie('siteSearchOrigin', 'quick_find', { path: '/'});
          $.cookie('siteSearchPerformed', 1, { path: '/'});
        });
      }
    },

    quickLinksSocialNetworkShare: function (context, settings) {
      if ($('#block-tds-toolbar-tds-toolbar', context).length) {
        var selectorMap = new Map();
        selectorMap.set('#block-tds-toolbar-tds-toolbar a[data-xiti="facebook"]', 'Facebook');
        selectorMap.set('#block-tds-toolbar-tds-toolbar a[data-xiti="twitter"]', 'Twitter');
        selectorMap.set('#block-tds-toolbar-tds-toolbar a[data-xiti="linkedin"]', 'Linkedin');
        selectorMap.set('#block-tds-toolbar-tds-toolbar a[data-xiti="forward"]', 'Forward');
        selectorMap.forEach(function(value, selector) {
          $(selector, context).click(function(e) {
            // KPI 18
            window.dataLayer.push({
              "event": "shareSocial",
              "siteSection": settings.dataLayer.siteSection,
              "socialNetwork": value,
              "pageName": settings.dataLayer.pageName
            });
          });
        });
      }
    },

    footerSocialNetwork: function (context, settings) {
      if ($('#footer div.block-social', context).length) {
        var selectorMap = new Map();
        selectorMap.set('#footer div.block-social a.social-fb', 'Facebook');
        selectorMap.set('#footer div.block-social a.social-tw', 'Twitter');
        selectorMap.set('#footer div.block-social a.social-ld', 'Linkedin');
        selectorMap.set('#footer div.block-social a.social-yt', 'YouTube');
        selectorMap.forEach(function(value, selector) {
          $(selector, context).click(function(e) {
            // KPI 17
            window.dataLayer.push({
              "event": "clicSocialNetwork",
              "siteSection": settings.dataLayer.siteSection,
              "socialNetwork": value
            });
          });
        });
      }
    },

    scorLive: function (context, settings) {
      if ($('#block-tds-live-header-tds-live-header', context).length) {
        var selectorMap = new Map();
        selectorMap.set('#block-tds-live-header-tds-live-header button', 'arrow');
        selectorMap.set('#block-tds-live-header-tds-live-btn a.scor-live-btn', 'View all');
        selectorMap.set('#block-tds-live-header-tds-live-header article a', 'article');
        selectorMap.forEach(function(value, selector) {
          $(selector, context).click(function(e) {
            var articleName = '';
            if (value == 'article') {
              articleName = $(this).closest('article').data('title');
            }
            // KPI 12
            window.dataLayer.push({
              "event": "scorLive",
              "zoneScorLive": value,
              "siteSection": settings.dataLayer.siteSection,
              "pageName": settings.dataLayer.pageName,
              "articleName": articleName
            });
          });
        });
      }
    },

    scorLiveMlt: function (context, settings) {
      if (settings.dataLayer.newsType == 'SCOR Live Blog') {
        if ($('body.node-type-news div.block-apachesolr-search', context).length) {
          $('body.node-type-news div.block-apachesolr-search a', context).each(function() {
            $(this).click(function(e) {
              // KPI 13
              window.dataLayer.push({
                "event": "clicLearnMore",
                "siteSection": settings.dataLayer.siteSection,
                "pageName": settings.dataLayer.pageName
              });
            });
          });
        }
      }
    },

    sourceScorLive: function (context, settings) {
      var selectorMap = new Map();
      selectorMap.set('#block-tds-live-header-tds-live-btn a.scor-live-btn', 'bandeau');
      selectorMap.set('div.block-tds-toolbar li.tool-scor_live_blog > a', 'quick_links');
      selectorMap.set('.menu-media-scor-live', 'menu_media');
      if (tracking.isHome) {
        selectorMap.set('.diamond-scor-live', 'losange_HP');
      }
      selectorMap.forEach(function(value, selector) {
        $(selector, context).attr('href', $(selector, context).attr('href') + '?source=' + value);
      });
    },

    blogScorLive: function (context, settings) {
      if ($('article.view-mode-live', context).length) {
        $('article.view-mode-live a', context).each(function() {
          $(this).off('click').click(function(e) {
            var articleName = $(this).closest('article').data('title');
            // KPI 10
            window.dataLayer.push({
              "event": "clicConsultationArticle",
              "articleName": articleName,
              "siteSection": settings.dataLayer.siteSection
            });
          });
        });
      }
    },

    pressCenter: function (context, settings) {
      if ($('body.node-type-business-unit', context).length) {
        $('article.node-business-unit .btn a', context).each(function() {
          $(this).click(function(e) {
            var buttonName = $(this).html();
            if (settings.dataLayer.pressCenter) {
              buttonName = settings.dataLayer.pressCenter[buttonName];
            }
            // KPI 9
            window.dataLayer.push({
              "event": "clickPressCenter",
              "buttonName": buttonName,
              "siteSection": settings.dataLayer.siteSection
            });
          });
        });
      }
    },

    fieldsAccordion: function (context, settings) {
      if ($('div.field-group-accordion-wrapper', context).length) {
        $('div.field-group-accordion-wrapper', context).accordion({
          activate: function( event, ui ) {
            // KPI 6
            window.dataLayer.push({
              "event": "clicAccordeon",
              "pageName": settings.dataLayer.pageName,
              "siteSection": settings.dataLayer.siteSection
            });
          }
        });
      }
    },

    contactExpertsAccordion: function (context, settings) {
      $(settings.dataLayer.accordionSelector).accordion({
        activate: function( event, ui ) {
          // KPI 6
          window.dataLayer.push({
            "event": "clicAccordeon",
            "pageName": settings.dataLayer.pageName,
            "siteSection": settings.dataLayer.siteSection
          });
        }
      });
    },

    genericContact: function (context, settings) {
      if ($('div.generic-contact-form', context).length) {
        $('div.generic-contact-form form').submit(function( event ) {
          var domaine = $('#edit-submitted-subject', context).val();
          // KPI 4
          window.dataLayer.push({
            "event": "submitContactForm",
            "domaine": domaine,
            "siteSection": settings.dataLayer.siteSection
          });
        });
      }
    },

    submitContactFormExpert: function (context, settings) {
      $('form.contact-our-experts-form', context).submit(function( event ) {
        var dataLayerExpertise = $.cookie('dataLayerExpertise', { path: '/'}) || '';
        var dataLayerSousExpertise = $.cookie('dataLayerSousExpertise', { path: '/'}) || '';
        var dataLayerSiteSection = $.cookie('dataLayerSiteSection', { path: '/'}) || '';
        // KPI 3
        window.dataLayer.push({
          "event": "submitContactFormExpert",
          "expertise": dataLayerExpertise,
          "siteSection": dataLayerSiteSection,
          "sousExpertise": dataLayerSousExpertise
        });
      });
    },

    virtualContactExperts: function (context, settings) {
      if ($('#search-an-expert-list div.experts-list', context).length) {
        var uri = window.location.pathname;
        $('#search-an-expert-list div.experts-list', context).find('a').each(function() {
          $(this).click(function(e) {
            var expertise = $('#search-experts-form input[name="expertises"]:checked').val();
            var expertsListId = $(this).closest('div.experts-list').attr('id');
            var sousExpertise = $('p[aria-controls="' + expertsListId + '"]', context).find('span.field-item').data('gtm');
            $.cookie('dataLayerExpertise', expertise, { path: '/'});
            $.cookie('dataLayerSousExpertise', sousExpertise, { path: '/'});
            $.cookie('dataLayerSiteSection', settings.dataLayer.siteSection, { path: '/'});
            // KPI 2
            window.dataLayer.push({
              "event": "VirtualPageview",
              "page": uri + "/formulaire/" + expertise + "/" + sousExpertise
            });
          });
        });
      }
    },

    quickLinksButton: function (context, settings) {
      var selectorMap = new Map();
      selectorMap.set('div.block-tds-toolbar li.tool-search > a', 'Search');
      selectorMap.set('div.block-tds-toolbar li.tool-share > a', 'Share');
      selectorMap.set('div.block-tds-toolbar li.tool-agenda > a', 'Agenda');
      selectorMap.set('div.block-tds-toolbar li.tool-search_an_expert > a', 'Contact Our Experts');
      selectorMap.set('div.block-tds-toolbar li.tool-publication > a', 'Resource Library');
      selectorMap.set('div.block-tds-toolbar li.tool-cart > a', 'Cart');
      selectorMap.set('div.block-tds-toolbar li.tool-scor_live_blog > a', 'SCOR Live Blog');
      selectorMap.forEach(function(value, selector) {
        $(selector, context).click(function(e) {
          // KPI 7
          window.dataLayer.push({
            "event": "clicQuickLinks",
            "quickLinksButton": value,
            "siteSection": settings.dataLayer.siteSection,
          });
        });
      });
    },

    navZone: function (context, settings) {
      var selectorMap = new Map();
      selectorMap.set('div.block-primary-menu', 'Header menu principal');
      selectorMap.set('div.block-secondary-menu', 'Header menu secondaire');
      selectorMap.set('div.block-tds-toolbar', 'Quick links');
      selectorMap.set('div.block-tds-live-header', 'Scor Live');
      selectorMap.set('#footer', 'Footer');
      if ($('#block-tds-specifics-diamond-menu').length) {
        selectorMap.set('#block-tds-specifics-diamond-menu', 'Losange');
      }
      selectorMap.forEach(function(value, selector) {
        $(selector, context).find('a').each(function() {
          $(this).click(function(e) {
            // KPI 5
            window.dataLayer.push({
              "event": "clicZoneNav",
              "zoneNav": value,
              "pageName": settings.dataLayer.pageName,
              "siteSection": settings.dataLayer.siteSection,
            });
          });
        });
      });
    }

  };

})(jQuery, Drupal);
