//
//  Anatomia JS
//
(function() {
  'use strict';

  var debug = false;

  if ( ( location.hostname === '' ) || ( location.hostname === 'localhost' ) ) {
    debug = true;
    showDebugMsg('Debug mode on');
  }

  var kassaUrl = 'https://nocnasowa.pl/kassa/';

  //  Elements
  var elements = {
    orderCount: document.getElementById('order-count'),
    orderMinus: document.getElementById('order-minus'),
    orderPlus: document.getElementById('order-plus'),
    orderLink: document.getElementById('order-link'),
  };

  var orderCount = 1;
  var orderSum = 399;

  var utm = {
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
  };

  //  init
  function init() {
    showDebugMsg('init');
    //  after refresh order would be wrong
    updateOrderCountFromField();
    addEventListeners();
    updateUtm();
    updateOrderString();
    listenToOrderCount();
  }

  function updateUtm() {
    if (window.ga === undefined) {
      return;
    }

    ga(function(tracker) {

      if (tracker.get('campaignSource') !== undefined) {
        utm.utmSource = tracker.get('campaignSource');
      }

      if (tracker.get('campaignName') !== undefined) {
        utm.utmCampaign = tracker.get('campaignName');
      }

      if (tracker.get('campaignMedium') !== undefined) {
        utm.utmMedium = tracker.get('campaignMedium');
      }

    });
  }

  //  add listeners
  function addEventListeners() {
    window.addEventListener('click', clickHandler, false);
  }

  //  Click handler
  function clickHandler(event) {
    var target;

    //  get remove-item button
    target = getClosest(event.target, '.js-plus');

    //  if target is not a js-plus, try remove-item button
    if (target === null) {
      target = getClosest(event.target, '.js-minus');
    }

    //  if target is not a js-minus, try js-slider
    if (target === null) {
      target = getClosest(event.target, '.js-slider');
    }

    //  if target is not a js-slider, try .js-opinie
    if (target === null) {
      target = getClosest(event.target, '.js-opinie');
    }

    //  if it is still null, ignore
    if (target === null) {
      return;
    }

    showDebugMsg(target);

    //  add one
    if (target.classList.contains('js-plus')) {
      addOrderCount(target);
      return;
    }

    //  substract one
    if (target.classList.contains('js-minus')) {
      substractOrderCount(target);
      return;
    }


    //  Slider
    if (target.classList.contains('js-slider')) {
      //  prevent jerk
      event.preventDefault();
      event.stopPropagation();
      sliderMove(target, event);
      return;
    }

    //  Opinie
    if (target.classList.contains('js-opinie')) {
      //  prevent jerk
      event.preventDefault();
      event.stopPropagation();
      openOpinie(target, event);
      return;
    }
  }


  function addOrderCount() {
    orderCount = parseInt(orderCount) + 1;
    updateOrder();
  }

  function substractOrderCount() {
    orderCount = parseInt(orderCount) - 1;
    updateOrder();

  }



  //  Update order
  function updateOrder() {
    checkOrderCount();
    updateOrderSum();
    updateOrderString();
    updateOrderCount();
  }


  //  check if order is not below 1
  function checkOrderCount() {
    showDebugMsg("check order count");
    if (orderCount < 1) {
      showDebugMsg("order count corrected");
      orderCount = 1;
    }
  }

  /// TODO
  /// if field is NaN, send 1 order count anyway
  function updateOrderCountFromField() {

    if ( isNaN(parseInt(elements.orderCount.value)) && (elements.orderCount.value !== '')) {
      showDebugMsg('field value was NaN');
      orderCount = 1;
      updateOrder();
    }
    else if (!isNaN(parseInt(elements.orderCount.value)) && parseInt(elements.orderCount.value) !== orderCount) {
      showDebugMsg('update order count from field');
      orderCount = elements.orderCount.value;
      updateOrder();
    }

  }



  //  update order count
  function updateOrderCount() {
    showDebugMsg("check order count field");
    elements.orderCount.value = orderCount;
  }

  //  update order sum
  function updateOrderSum() {
    var newSum = 0;

    if (orderCount < 6) {
      newSum = orderCount * 399;
    }
    else if (orderCount < 11) {
      newSum = orderCount * 349;
    }
    else if (orderCount < 31) {
      newSum = orderCount * 319;
    }
    else if (orderCount > 30) {
      newSum = orderCount * 299;
    }

    orderSum = newSum;

    showDebugMsg('orderSum: ' + orderSum);
  }

  //  update order string
  function updateOrderString() {

    var utmUrl = '';

    showDebugMsg('newOrderString: ' + orderCount);

    if (utm.utmSource.length > 0) {
      utmUrl += '&utm_source=' + utm.utmSource;
    }
    if (utm.utmMedium.length >0) {
      utmUrl += '&utm_medium=' + utm.utmMedium;
    }
    if (utm.utmCampaign.length > 0) {
      utmUrl += '&utm_campaign=' + utm.utmCampaign;
    }

    var bagx = 'bagx=' + orderCount;

    //  update link
    elements.orderLink.href = kassaUrl + '?' + bagx + utmUrl;

    //  update ga label
    elements.orderLink.setAttribute('data-ga-label', bagx);
  }

  //
  //  Observe Order count field
  //
  function listenToOrderCount() {

    elements.orderCount.addEventListener(
      'input',
      function(event) {
        updateOrderCountFromField();
      },
      false
    );

  }



  //  Move slider to next or prev slide
  function sliderMove(target) {

    //  get href and remove #
    var targetSlideId = target.getAttribute('href').slice(1);
    var slide = document.getElementById(targetSlideId);

    var sliderId = target.getAttribute('data-ns-slider');
    var slides = document.getElementById(sliderId);

    showDebugMsg(slide);
    showDebugMsg(slides);

    Velocity(
      slide,
      'scroll',
      { duration: 500,
        container: slides,
        axis: 'x',
        easing: 'easeOutQuart',
        queue: false,
       }
    );

  }

  //  Open opinie
  function openOpinie( target, event ) {

    var href = target.getAttribute('href').slice(1);
    var opinia = document.getElementById(href);
    var opiniaParagraphs = opinia.childNodes;

    showDebugMsg(opiniaParagraphs);

    //  start with 1, because 0 is visible
    var i = 1;
    var l = opiniaParagraphs.length;

    Velocity(
      target,
      'fadeOut',
      {
        duration: 500,
        easing: 'easeInOut',
        complete: function() {
          target.parentNode.removeChild(target);
        }
      }
    );

    for (i; i < l; i++) {
      if (opiniaParagraphs[i].tagName && ( opiniaParagraphs[i].className !== 'anatomia-opinie__open-q') ) {
        openP( opiniaParagraphs[i] );
      }
    }

    function openP(p) {
      Velocity(
        p,
        'slideDown',
        {
          duration: 500,
          easing: 'easeInOut',
          display: 'block',
        }
      );
    }



  }


  //  Helpers
  function showDebugMsg(msg) {
    if (debug) {
      window.console.log(msg);
    }
  }

  //  Gum shoe
  function initGumShoe() {
    // Gumshoe
    // track sections so user knows where he is
    //
    window.gumshoe.init({
      activeClass: 'btn-black--active',
      selector: '#header-anatomia a',
      offset: 200,
    });
  }


  //  Init
  window.addEventListener(
    'load',
    function() {
      init();
    },
    false
  );






  function anCoverAnimate() {

    var svg = document.getElementById('an-website-cover');
    var maskEl = svg.getElementById('mask-chick');
    var revealEl = svg.getElementById('an-reveal');

    var circle1 = svg.getElementById('circle-1');

    var clickNo = 0;


    //  animate
    function animateMask( c ) {
      Velocity(c, {opacity: 1}, {duration: 150, easing: 'easeInCubic'});
      Velocity(c, {opacity: 0}, {duration: 7000, easing: 'easeOutSine',
        complete: function() {
          maskEl.removeChild(c);
        },
      });
    }

    function reveal() {
      Velocity(revealEl, 'stop');
      Velocity(revealEl, {opacity: 1}, {duration: 450, easing: 'easeInCubic'});
      Velocity(revealEl, {opacity: 0}, {duration: 7000, delay: 450, easing: 'easeOutSine'});
    }


    //  return new circle
    function createNewCircle( coords ) {

      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', 150);
      circle.setAttribute('cx', coords.x);
      circle.setAttribute('cy', coords.y);
      circle.setAttribute('opacity', 0);
      circle.setAttribute('fill', 'url(#radialGradient)');


      //  <circle id="circle-1" cx="653" cy="522" r="147" opacity="0" fill="url(#radialGradient)"></circle>

      maskEl.appendChild(circle);

      return circle;

    }


    function handleClicks(event) {

      showDebugMsg(event);

      var coords = getCoords(event);

      var circle = createNewCircle( coords );

      animateMask(circle);

      clickNo += 1;

      if (clickNo > 10 ) {
        reveal();
        clickNo = 0;

        try {
          gtag('event', 'Anatomy Click', {
            'event_category': 'Cover',
            'event_label': 'Reveal'
          });
        } catch (err) {}
      }

      var label = 'X: ' + Math.floor(coords.x) + '; Y: ' + Math.floor(coords.y);

      try {
        gtag('event', 'Anatomy Click', {
          'event_category': 'Cover',
          'event_label': label
        });
      } catch (err) {}
    }

    //  add event listener
    svg.addEventListener('click', function(event) {
      handleClicks(event);
      event.stopPropagation();
    });


    //  coordinates
    var pt = svg.createSVGPoint();  // Created once for document

    //  return obj
    function getCoords(event) {
        pt.x = event.clientX;
        pt.y = event.clientY;

        // The cursor point, translated into svg coordinates
        var cursorpt =  pt.matrixTransform(svg.getScreenCTM().inverse());

        return {
          x: cursorpt.x,
          y: cursorpt.y,
        };
    }




    //  instantiate the scrollama
    var scroller = scrollama();

    // setup the instance, pass callback functions
    scroller
      .setup({
        step: '.step', // required - class name of trigger steps
        offset: 0.5,
      })
      .onStepEnter(function() { animateMask(circle1); });

  }


  window.addEventListener('load', function() {

    // Gumshoe
    // track sections so user knows where he is
    //
    gumshoe.init({
      activeClass: 'btn-black--active',
      selector: '#header-anatomia a',
      offset: 200
    });


    anCoverAnimate();


  }, false);

//
// Open Nav when on small screen
//
function menuHandler(event) {
  var eventTarget = event.target;

  // jeśli to nie jest naszy przycisk, to koniec funkcji
  if (!hasClass(eventTarget, 'js-open-nav')) {
    return;
  }

  var openTarget = eventTarget.getAttribute('data-open-target'),
    nav = document.getElementById(openTarget),
    state = eventTarget.getAttribute('data-open-state');

  if (!state) {
    eventTarget.setAttribute('data-open-state', 'closed');
    state = 'closed';
  }

  function closeMenu() {
    // usuń event, który zamyka menu
    document.removeEventListener('click', closeMenu, false);

    eventTarget.setAttribute('data-open-state', 'closed');

    // Animate
    Velocity(nav, 'reverse', { display: 'none' });
  }

  function openMenu() {
    // Dodaj event, który zamyka menu
    document.addEventListener('click', closeMenu, false);

    eventTarget.setAttribute('data-open-state', 'open');

    // Animate
    Velocity(
      nav,
      { translateY: [0, '-150%'] },
      { duration: 400, easing: 'ease', display: 'block' }
    );
  }

  // check if the menu is open
  if (state === 'closed') {
    openMenu();
  }
}
document.addEventListener('click', menuHandler, false);


//  End Anatomia JS
})();