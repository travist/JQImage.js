/**
 * @constructor
 * @class A class to easily handle images.
 * @param {object} context The jQuery context.
 * @param {object} options This components options.
 */
JQImage = function(context, options) {

  // Determine if the image is loaded.
  this.loaded = false;

  // The image loader.
  this.loader = null;

  // The ratio of the image.
  this.ratio = 0;

  // The image element.
  this.img = null;

  // Construct if we have a context.
  if (context && context.length > 0) {
    options = jQuery.extend({
      src: '',
      attr: {},
      onload: null,
      loadstart: null
    }, options);
    this.options = options;
    this.context = this.create(context);
    this.init(options);
  }
};

/**
 * Create the image object.
 */
JQImage.prototype.create = function(context) {

  // Create the image tag and append to the context.
  this.img = jQuery(document.createElement('img')).attr(this.options.attr);
  return context.append(this.img);
};

/**
 * @see JQImage.init
 */
JQImage.prototype.init = function(options) {

  // Set the container to not show any overflow...
  this.context.css('overflow', 'hidden');

  /** The loader for the image. */
  this.loader = new Image();

  /** Register for when the image is loaded within the loader. */
  this.loader.onload = (function(image) {
    return function() {
      image.loaded = true;
      image.ratio = (image.loader.width / image.loader.height);
      image.resize();
      if (image.options.onload) {
        image.options.onload.call(image);
      }
    };
  })(this);

  // Load the image if they provide one.
  if (this.options.src) {
    this.load(this.options.src);
  }
};

/**
 * Loads an image.
 *
 * @param {string} src The source of the image to load.
 */
JQImage.prototype.load = function(src) {

  // First clear the previous image.
  this.clear(function() {

    // Create the new image, and append to the context.
    this.img.attr({src: ''}).hide();
    if (src) {
      this.loader.src = src;
      this.img.attr('src', src);
      if (this.options.loadstart) {
        this.options.loadstart.call(this);
      }
    }
  });
};

/**
 * Clears an image.
 *
 * @param {function} callback Called when the image is done clearing.
 */
JQImage.prototype.clear = function(callback) {
  this.loaded = false;
  if (this.img) {
    this.img.fadeOut((function(image) {
      return function() {
        image.img.attr('src', '');
        image.loader.src = '';
        callback.call(image);
      };
    })(this));
  }
  else {
    callback.call(this);
  }
};

/**
 * Resize the image provided a width and height or nothing.
 *
 * @param {integer} width (optional) The width of the container.
 * @param {integer} height (optional) The height of the container.
 */
JQImage.prototype.resize = function(width, height) {
  width = width || this.context.width();
  height = height || this.context.height();
  if (width && height && this.loaded) {

    // Get the scaled rectangle.
    var rect = this.getScaledRect(this.ratio, {
      width: width,
      height: height
    });

    // Now set this image to the new size.
    if (this.img) {
      this.img.attr('src', this.loader.src).css({
        marginLeft: rect.x,
        marginTop: rect.y,
        width: rect.width,
        height: rect.height
      });
    }

    // Show the container.
    this.img.fadeIn();
  }
};

/**
 * Returns a scaled rectangle provided a ratio and the container rect.
 *
 * @param {number} ratio The width/height ratio of what is being scaled.
 * @param {object} rect The bounding rectangle for scaling.
 * @return {object} The Rectangle object of the scaled rectangle.
 */
JQImage.prototype.getScaledRect = function(ratio, rect) {
  var scaledRect = {};
  scaledRect.x = rect.x ? rect.x : 0;
  scaledRect.y = rect.y ? rect.y : 0;
  scaledRect.width = rect.width ? rect.width : 0;
  scaledRect.height = rect.height ? rect.height : 0;
  if (ratio) {
    if ((rect.width / rect.height) > ratio) {
      scaledRect.height = rect.height;
      scaledRect.width = Math.floor(rect.height * ratio);
    }
    else {
      scaledRect.height = Math.floor(rect.width / ratio);
      scaledRect.width = rect.width;
    }
    scaledRect.x = Math.floor((rect.width - scaledRect.width) / 2);
    scaledRect.y = Math.floor((rect.height - scaledRect.height) / 2);
  }
  return scaledRect;
};

// Add to the jQuery prototype.
jQuery.fn.jqimage = function(options) {
  return jQuery(this).each(function() {
    if ('jqimage' in this) {
      this.jqimage.init(options);
    }
    else {
      this.jqimage = new JQImage(jQuery(this), options);
    }
  });
};
