//
//  Anatomia JS
//
(function() {
  'use strict';

  var debug = false;

  var kassaUrl = 'https://nocnasowa.pl/kassa/';

  //  Elements
  var elements = {
    sectionBag: document.getElementById('section-bag'),
    bagItems: document.getElementById('bag-items'),
    bagSum: document.getElementById('bag-sum'),
    bagLink: document.getElementById('bag-link'),
  };

  var bundleCountSum = 0;
  var orderSum = 0;
  var bagString = '';

  var products = {};

  products['AN-1'] = {
    productId: 'AN-1',
    title: 'Anatomia norweskiego',
    bundle: 'książka',
    bundleCount: 1,
    // price: 299,
    price: 399,
  };

  products['AN-5'] = {
    productId: 'AN-5',
    title: 'Anatomia norweskiego',
    bundle: '5 książek + 1 sztuka gratis',
    bundleCount: 6,
    // price: 1495,
    price: 1995,
  };

  products['AN-12'] = {
    productId: 'AN-12',
    title: 'Anatomia norweskiego',
    bundle: '12 książek + 3 sztuki gratis',
    bundleCount: 15,
    // price: 3585,
    price: 4785,
  };

  var bag = [];
  var bagElements = [];

  //  init
  function init() {
    showDebugMsg('init');

    addEventListeners();
  }

  //  add listeners
  function addEventListeners() {
    window.addEventListener('click', clickHandler, false);
  }

  //  Click handler
  function clickHandler(event) {
    var target;

    //  get js-order button click
    target = getClosest(event.target, '.js-order');

    //  if target is not a js-order, try remove-item button
    if (target === null) {
      target = getClosest(event.target, '.js-remove-item');
    }

    //  if target is not a js-remove-item, try js-close-bag
    if (target === null) {
      target = getClosest(event.target, '.js-close-bag');
    }

    //  if it is still null, ignore
    if (target === null) {
      return;
    }

    showDebugMsg(target);

    //  Add item to bag
    if (target.classList.contains('js-order')) {
      addItemToBag(target);
      return;
    }

    //  remove item from bag
    if (target.classList.contains('js-remove-item')) {
      removeItemFromBag(target);
      return;
    }

    //  close bag
    //  dunno if needed
    if (target.classList.contains('js-close-bag')) {
      return;
    }
  }

  //  add item to bag
  function addItemToBag(target) {
    showDebugMsg('add item to bag');

    //  get product id
    var productId = target.getAttribute('data-ns-product-id');

    //  no id
    if (!productId) {
      showDebugMsg('product has no id');
      return;
    }

    //  get product info
    var product = products[productId];
    var newBagElement = createBagItem(product);

    //  add item to bag
    bag.push(product);

    //  add element referance to bagElements
    bagElements.push(newBagElement);

    showDebugMsg('Bag:');
    showDebugMsg(bag);

    updateBag();

    //  first item in the bag
    if (bag.length === 1) {
      appendElement(newBagElement, elements.bagItems, true);
      showBag();
    }
    else {
      appendElement(newBagElement, elements.bagItems, false);
    }
  }


  //  create bag item
  //  @return created element
  function createBagItem(product) {
    var productEl = document.createElement('div');
    var titleEl = document.createElement('span');
    var titleCiteEl = document.createElement('cite');
    var br = document.createElement('br');
    var bundleEl = document.createElement('span');
    var priceEl = document.createElement('i');

    productEl.className = 'bag-item js-remove-item';
    titleEl.className = 'bag-item__title';
    priceEl.className = 'bag-item__price';

    titleCiteEl.innerHTML = product.title;
    bundleEl.innerHTML = product.bundle;
    priceEl.innerHTML = product.price + ' kr';

    titleEl.appendChild(titleCiteEl);
    titleEl.appendChild(br);
    titleEl.appendChild(bundleEl);

    productEl.appendChild(titleEl);
    productEl.appendChild(priceEl);

    return productEl;
  }

  //  Remove
  function removeItemFromBag(target) {
    showDebugMsg('Remove item from bag');
    showDebugMsg(target);

    bag.forEach(function(product, index) {
      if (bagElements[index] === target) {
        //  remove element from bagElements
        bagElements.splice(index, 1);

        //  remove product from bag
        bag.splice(index, 1);

        //  remove from html
        removeElement(target);

        showDebugMsg('product index: ' + index);
      }
    });

    updateBag();

    //  nothing in the bag
    if (bag.length === 0) {
      hideBag();
    }

    showDebugMsg(bag);
  }



  function updateBag() {
    updateBundleCountSum();
    updateOrderSum();
    updateBagString();
  }

  //  update bundleCountSum
  function updateBundleCountSum() {
    var newBundleCountSum = 0;

    bag.forEach(function(product) {
      newBundleCountSum += product.bundleCount;
    });

    bundleCountSum = newBundleCountSum;

    showDebugMsg('bundleCountSum: ' + bundleCountSum);
  }

  //  update order sum
  function updateOrderSum() {
    var newSum = 0;

    bag.forEach(function(product) {
      newSum += product.price;
    });

    orderSum = newSum;

    //  show new sum
    elements.bagSum.innerHTML = orderSum;

    showDebugMsg('orderSum: ' + orderSum);
  }

  //  update bag string
  function updateBagString() {
    var newBagString = '';

    bag.forEach(function(product) {
      newBagString += product.productId + '|';
    });

    bagString = newBagString;

    showDebugMsg('newBagString: ' + newBagString);

    //  update link
    elements.bagLink.href = kassaUrl + '?bag=' + bagString;
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

  //  show bag
  function showBag() {
    showDebugMsg('show bag');

    Velocity(
      elements.sectionBag,
      { opacity: [1, 0], translateY: [0, '-2rem'] },
      { duration: 400, easing: 'easeInOut', display: 'block' }
    );
  }

  //  hide bag
  function hideBag() {
    showDebugMsg('hide bag');

    Velocity(
      elements.sectionBag,
      { opacity: 0, translateY: '-2rem' },
      { duration: 400, easing: 'easeInOut', display: 'none' }
    );
  }

  //  add element by slide down
  function appendElement(el, parent, now) {

    var duration;

    if ( now ) {
      duration = 0;
    }
    else {
      duration = 400
    }

    Velocity(el, 'slideDown', {
      duration: duration,
      easing: 'easeInOut',
      begin: function() {
        parent.appendChild(el);
      },
    });

  }

  //  remove element by slide up
  function removeElement(el) {
    Velocity(el, 'slideUp', {
      duration: 400,
      easing: 'easeInOut',
      complete: function() {
        //  remove child from HTML
        el.parentNode.removeChild(el);
      },
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
      Velocity(c, {opacity: 1}, {duration: 150, easing: "easeInCubic"});
      Velocity(c, {opacity: 0}, {duration: 7000, easing: "easeOutSine",
        complete: function() {
          maskEl.removeChild(c);
        },
      });
    }

    function reveal() {
      Velocity(revealEl, 'stop');
      Velocity(revealEl, {opacity: 1}, {duration: 450, easing: "easeInCubic"});
      Velocity(revealEl, {opacity: 0}, {duration: 7000, delay: 450, easing: "easeOutSine"});
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
          ga('send', 'event', 'Cover', 'Anatomy Click', 'Reveal');
        } catch (err) {}
      }

      var label = 'X: ' + Math.floor(coords.x) + '; Y: ' + Math.floor(coords.y);

      try {
        ga('send', 'event', 'Cover', 'Anatomy Click', label);
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


})();