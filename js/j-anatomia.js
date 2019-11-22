//
//  Anatomia JS
//

(function() {
  'use strict';

  var debug = false;

  if ( ( location.hostname === '' ) || ( location.hostname === 'localhost' ) || ( location.hostname === 'grenaten.local' ) ) {
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


  //  Init
  window.addEventListener(
    'load',
    function() {
      init();
    },
    false
  );

  //
  //  Init
  //
  function init() {
    showDebugMsg('init');
    //  after refresh order would be wrong
    updateOrderCountFromField();
    addEventListeners();
    updateUtm();
    updateOrderString();
    listenToOrderCount();
    initGumShoe();
    anCoverAnimate();
  }

  //
  //  Update UTM from tracker
  //
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

    Velocity(slide, 'scroll', {
        duration: 600,
        container: slides,
        axis: 'x',
        easing: 'easeOutCubic',
        queue: false,
        begin: function() {
          //  remove snapping to allow animation
          slides.classList.add('anatomia-slides--animating');
        },
        complete: function() {
          slides.classList.remove('anatomia-slides--animating');
        },
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
    var spy = new Gumshoe('#navMain a', {
      navClass: 'js-active',
      events: true,

      offset: function () {
        return document.getElementById('navMain').getBoundingClientRect().height;
      },
    });
  }


  // Listen for activate events
  document.addEventListener('gumshoeActivate', function (event) {
    //  Add class
    event.detail.link.classList.add('btn-black--active', 'navbar__btn--active');

    scrollNavToActiveEl('navMain');

  }, false);

  // Listen for activate events
  document.addEventListener('gumshoeDeactivate', function (event) {

    //  remove class
    event.detail.link.classList.remove('btn-black--active', 'navbar__btn--active');

  }, false);






  function anCoverAnimate() {

    var svg = document.getElementById('an-website-cover');
    var maskEl = svg.getElementById('mask-chick');
    var revealEl = svg.getElementById('an-reveal');

    var circle1 = svg.getElementById('circle-1');

    var firstAnimation = true;

    //  coordinates
    //  Created once for document
    var pt = svg.createSVGPoint();

    var animationNo = 0;

    //  'head' || 'body'
    var circleSide = 'head';

    //  instantiate the scrollama
    var scroller = scrollama();

    // setup the instance, pass callback functions
    scroller
      .setup({
        step: '.step', // required - class name of trigger steps
        offset: 0.4,
      })
      .onStepEnter(function() {
        startOnScrollAnimation();
      });

    showDebugMsg(svg.clientWidth);

    //  animate
    function animateMask( c ) {
      showDebugMsg('animation no: ' + animationNo);

      Velocity(c, {opacity: [1, 0]}, {duration: 150, easing: 'easeInCubic'});
      Velocity(c, {opacity: 0}, {duration: 7000, easing: 'easeOutSine',
        complete: function() {
          maskEl.removeChild(c);
        },
      });
    }

    function reveal(event) {
      Velocity(revealEl, 'stop');
      Velocity(revealEl, {opacity: [1, 0]}, {duration: 450, easing: 'easeInCubic'});
      Velocity(revealEl, {opacity: 0}, {duration: 7000, delay: 450, easing: 'easeOutSine'});

      if (event !== undefined) {
        try {
          gtag('event', 'Anatomy Click', {
            'event_category': 'Cover',
            'event_label': 'Reveal'
          });
        } catch (err) {}
      }
    }


    //
    //  return new circle
    //  example circle
    //  <circle id="circle-1" cx="653" cy="522" r="147" opacity="0" fill="url(#radialGradient)"></circle>
    //
    function createNewCircle( coords ) {

      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', 150);
      circle.setAttribute('cx', coords.x);
      circle.setAttribute('cy', coords.y);
      circle.setAttribute('opacity', 0);
      circle.setAttribute('fill', 'url(#radialGradient)');

      maskEl.appendChild(circle);

      return circle;

    }

    //
    //  Single circle animation
    //  @event is optional
    //
    function createSingleAnimation(event) {
      var coords;
      var circle;
      var label;
      var randomCoords;

      //  if it comes from click
      if (event !== undefined) {
        showDebugMsg('createSingleAnimation has event');
        showDebugMsg('event.clientX: ' + event.clientX);
        showDebugMsg('event.clientY: ' + event.clientY);
        coords = convertCoords({
          x: event.clientX,
          y: event.clientY,
        });

        //  Event is sent only for clicks
        label = 'X: ' + Math.floor(coords.x) + '; Y: ' + Math.floor(coords.y);

        try {
          gtag('event', 'Anatomy Click', {
            'event_category': 'Cover',
            'event_label': label
          });
        } catch (err) {}

      }
      else {
        showDebugMsg('createSingleAnimation no event');
        coords = convertCoords(getRandomCoords());
      }

      //testRandomCoords(coords);
      circle = createNewCircle( coords );

      animateMask(circle);

      if (animationNo > 10 ) {
        reveal(event);
        animationNo = 0;
      }
    }


    function getRandomNum(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //  return obj
    function convertCoords(coords) {
        pt.x = coords.x;
        pt.y = coords.y;

        showDebugMsg('convertCoords, cursorpt');

        // The cursor point, translated into svg coordinates
        var cursorpt =  pt.matrixTransform(svg.getScreenCTM().inverse());

        showDebugMsg('x: ' + cursorpt.x + ' | y: ' + cursorpt.y);

        return {
          x: cursorpt.x,
          y: cursorpt.y,
        };
    }

    //
    //  return obj with random coordinates
    //  coordinates are always on other side than previously
    //
    function getRandomCoords() {
      //  get first the position of svg
      var x = svg.getBoundingClientRect().left;
      var y = svg.getBoundingClientRect().top;
      var randX;
      var randY;
      var xRange;
      var yRange;
      var svgWidth = svg.clientWidth;
      var svgHeight = svg.clientHeight;

      showDebugMsg(circleSide);

      //  these come from proportions of image
      //  measurements are in sketch file
      if (circleSide === 'head') {
        xRange = {
          min: svgWidth * 0.40,
          max: svgWidth - (svgWidth * 0.38),
        };
        yRange = {
          min: svgHeight * 0.15,
          max: svgHeight * 0.68,
        }
        //  change side
        circleSide = 'body';
      }
      else {
        //  body
        xRange = {
          min: svgWidth * 0.15,
          max: svgWidth - (svgWidth * 0.15),
        };
        yRange = {
          min: svgHeight * 0.75,
          max: svgHeight - (svgHeight * 0.05),
        }

        //  change side
        circleSide = 'head';
      }

      // showDebugMsg('xRange: ' + xRange.min + ' – ' + xRange.max);
      // showDebugMsg('yRange: ' + yRange.min + ' – ' + yRange.max);

      randX = getRandomNum(xRange.min, xRange.max);
      randY = getRandomNum(yRange.min, yRange.max);

      showDebugMsg('randX: ' + randX);
      showDebugMsg('randY: ' + randY);

      return {
        x: x + randX,
        y: y + randY,
      };

    }

    // test
    function testRandomCoords(coords) {

      if (coords === undefined) {
        coords = convertCoords(getRandomCoords());
      }
      showDebugMsg(coords);

      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', 20);
      circle.setAttribute('cx', coords.x);
      circle.setAttribute('cy', coords.y);
      circle.setAttribute('opacity', 0.75);



      if (circleSide === 'head') {
        circle.setAttribute('fill', '#900');
      } else {
        circle.setAttribute('fill', '#090');
      }

      svg.appendChild(circle);

    }
    // testRandomCoords();
    // testRandomCoords();
    // testRandomCoords();
    // testRandomCoords();
    // testRandomCoords();
    // testRandomCoords();
    // testRandomCoords();
    // testRandomCoords();
    // testRandomCoords();
    // testRandomCoords();
    // testRandomCoords();


    function easing(p) {
      var m=p-1;
      return 1-m*m*m*m;
    }

    //  @return []
    function generateIntervals(duration, no) {

      var i;
      var times = [];
      var linearInteval = duration / (no - 1);
      var currentFraction;
      var interpolation;
      var testSum = 0;

      for (i = 0; i <= (no - 1); i++) {

        currentFraction = (linearInteval * i) / duration;
        // showDebugMsg('currentFraction: ' + currentFraction);

        interpolation = easing(currentFraction);

        // showDebugMsg('interpolation: ' + interpolation);

        times[i] = interpolation * duration;

      }

      showDebugMsg(times);
      showDebugMsg(testSum);

      return times;

    }

    //
    //  Intro animations
    //
    function startOnScrollAnimation() {

      if (!firstAnimation) {
        return;
      }
      firstAnimation = false;

      var i;
      var maxCircles = 16;
      var last = false;
      var num;
      var timeSum = 0;
      var duration = 3200;
      var intervals = generateIntervals(duration, maxCircles);

      function startTimer(time, last) {

        if (last) {
          setTimeout(function() {
            reveal();
          }, time + 50);
        } else {
          setTimeout(function() {
            createSingleAnimation();
          }, time);
        }
      }

      //  first circle is always the same
      animateMask(circle1);

      // //  trigger 9 more random animations
      for (i = 1; i <= maxCircles; i++) {

        if (intervals[i] !== undefined) {
          timeSum = intervals[i];
        }
        showDebugMsg(timeSum);

        if (i === maxCircles) {
          last = true;
        }

        startTimer(timeSum, last);


      }

      try {
        gtag('event', 'Anatomy Click', {
          'event_category': 'Cover',
          'event_label': 'On Scroll Animation'
        });
      } catch (err) {}

    }


    function handleClicks(event) {

      showDebugMsg(event);
      animationNo += 1;
      createSingleAnimation(event);

    }

    //  add event listener
    svg.addEventListener('click', function(event) {
      handleClicks(event);
      event.stopPropagation();
    });




  //  End anCoverAnimate()
  }





//  End Anatomia JS
})();