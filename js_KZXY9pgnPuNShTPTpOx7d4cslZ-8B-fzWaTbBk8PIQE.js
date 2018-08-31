/**
 * @file
 * A JavaScript file for the cart.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - https://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, window, document, undefined) {

  var confirmDownloadMsg = Drupal.t("You're about to download files from the cart.");
  var confirmDeleteMsg = Drupal.t("You're about to delete a file from the cart.");
  var confirmClearMsg = Drupal.t("You're about to delete all files from the cart.");
  var confirmChoiceMsg = Drupal.t("Are you sure you want to continue?");
  var yesDownload = Drupal.t("Yes, download");
  var yesDelete = Drupal.t("Yes, delete");
  var noCancel = Drupal.t("No, cancel");
  // "templates"
  var confirmDownloadHtml = "<p>"+confirmDownloadMsg+"</p><p>"+confirmChoiceMsg+"</p><a href='#' class='confirm-btn' id='confirm-yes'>"+ yesDownload +"</a><a href='#' class='confirm-btn' id='confirm-no'>"+ noCancel +"</a>";
  var confirmDeleteHtml = "<p>"+confirmDeleteMsg+"</p><p>"+confirmChoiceMsg+"</p><a href='#' class='confirm-btn' id='confirm-yes'>"+ yesDelete +"</a><a href='#' class='confirm-btn' id='confirm-no'>"+ noCancel +"</a>";
  var confirmClearHtml = "<p>"+confirmClearMsg+"</p><p>"+confirmChoiceMsg+"</p><a href='#' class='confirm-btn' id='confirm-yes'>"+ yesDelete +"</a><a href='#' class='confirm-btn' id='confirm-no'>"+ noCancel +"</a>";

  var cartCreated = false;

  // To understand behaviors, see https://drupal.org/node/756722#behaviors
  Drupal.behaviors.tdsCart = {

    attach: function(context, settings) {

      defaultCartItemTemplate = settings.cartItemTemplate;
      this.createCart(context);
      this.attachedListener(context);
      this.countCartItem();
    },

    attachedListener: function (context) {
      $("a[data-cart]", context).on('click', function(event) {
        event.preventDefault();
        var action = $(this).data('cart');
        switch(action) {
          case 'add':
            Drupal.behaviors.tdsCart.addToCart($(this));
            cartDocsInfo = JSON.parse(localStorage.getItem("cartDocsInfo"));
            break;
          case 'clear':
            Drupal.behaviors.tdsCart.confirmClear(event);
            break;
          case 'remove':
            Drupal.behaviors.tdsCart.confirmDelete(event, $(this));
            break;
          case 'download':
            Drupal.behaviors.tdsCart.confirmDownload(event);
            break;
          default:
            return;
        }
        Drupal.behaviors.tdsCart.saveCart();
      });
    },

    countCartItem: function() {

      var itemsCount = Drupal.t('The cart is empty');
      var count = Object.keys(cart).length;
      var $downloadLink = $("a[data-cart='download']");
      $downloadLink.hide();
      $("li.tool-button.tool-cart a > .item-count").remove();
      if(count != 0) {
        itemsCount =  Drupal.t(Drupal.formatPlural(count, '1 item', '@count items'));
        $downloadLink.show();
        $("li.tool-button.tool-cart a").append('<span class="item-count"><span>'+ count +'</span></span>');

      }
      $('#cart-items-count').text(itemsCount);
    },

    addToCart: function($item) {
      var item = { // cart item definition
        type : $item.data('type'),
        id : $item.data('id'),
        title: $item.data('title'),
        size: $item.data('size'),
        uniqId: $item.data('type') + '-' + $item.data('id'),
        docType: $item.data('doc_type'),
        docName: $item.data('doc_name'),
      };
      if($.isEmptyObject(cart[item.uniqId])) { // not added before? add it.
        cart[item.uniqId] = item;
        this.addItemToList(item);
      }
    },

    addItemToList: function(item) {
      var $item = $(defaultCartItemTemplate);
      $item.attr('id', item.uniqId);
      $item.attr('data-type', item.type);
      $item.attr('data-doc_type', item.docType);
      $item.attr('data-doc_name', item.docName);
      $item.find('.item-title').html(item.title);
      $item.find('.item-size').html(item.size);
      $item.find("a[data-cart]").attr('data-uniqid', item.uniqId);
      $('#cart-list').append($item);
      this.attachedListener($item);
    },

    removeFromCart: function($item) {
      var uniqId = $item.data('uniqid');
      $('li#' + uniqId).remove();
      delete cart[uniqId];
      delete cartDocsInfo[uniqId];
    },

    createCart: function() {
      if(cartCreated == false) {
        cart = JSON.parse(localStorage.getItem("cart"));

        if(cart !== null) {
          $.each(cart, function(index, value) {
            Drupal.behaviors.tdsCart.addItemToList(value);
          });
        }
        else {
          cart = {};
        }
      }
      cartCreated = true;
    },

    clearCart: function() {
      cart = {};
      cartDocsInfo = {};
      $('.cart-item').remove();
    },

    saveCart: function(saveCartDocsInfo) {
      this.countCartItem();
      var cartValue = JSON.stringify(cart);
      localStorage.setItem("cart", cartValue);
      if (saveCartDocsInfo === true) {
        localStorage.setItem("cartDocsInfo", JSON.stringify(cartDocsInfo));
      }
    },

    downloadCart: function() {
      // console.log(cart);
      $.ajax({
        type: "POST",
        url: '/ajax/download-cart',
        data: cart,
        success: function(result) {
          var time = result;
          window.location.assign('/download-cart-zip?time=' + time);
        },
        dataType: 'html'
      });
    },

    confirmDownload: function(event) {
      event.preventDefault();
      $.colorbox({
        html: confirmDownloadHtml,
        initialHeight: 200,
        maxWidth: "80%",
        className: 'colorbox-cart',
        onComplete: function(){
          $("#confirm-yes").click(function(){
            $.colorbox.close();
            Drupal.behaviors.tdsCart.downloadCart();
            Drupal.behaviors.Tracking.cartDownload();
          });
          $("#confirm-no").click(function(){
            $.colorbox.close();
          });
      }});
    },

    confirmDelete: function(event, item) {
      event.preventDefault();
      $.colorbox({
        html: confirmDeleteHtml,
        className: 'colorbox-cart',
        initialHeight: 200,
        maxWidth: "80%",
        onComplete: function(){
          $("#confirm-yes").click(function(){
            $.colorbox.close();
            Drupal.behaviors.tdsCart.removeFromCart(item);
            Drupal.behaviors.tdsCart.saveCart(true);
          });
          $("#confirm-no").click(function(){
            $.colorbox.close();
          });
      }});
    },

    confirmClear: function(event, item) {
      event.preventDefault();
      $.colorbox({
        html: confirmClearHtml,
        initialHeight: 200,
        maxWidth: "80%",
        className: 'colorbox-cart',
        onComplete: function(){
          $("#confirm-yes").click(function(){
            $.colorbox.close();
            Drupal.behaviors.tdsCart.clearCart();
            Drupal.behaviors.tdsCart.saveCart(true);
          });
          $("#confirm-no").click(function(){
            $.colorbox.close();
          });
      }});
    },

  };

})(jQuery, Drupal, this, this.document);
;
