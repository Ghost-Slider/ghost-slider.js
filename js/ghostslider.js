/**
 * @author Benjamin Kleiner
 * @author Christoph Fritsch
 */

(function($) {
	
	if (!Math.sign) {
		Math.sign = function(_in) {
			return _in < 0 ? -1 : 1;
		};
	}
	
	/**
	 * Normalizes touch events
	 */
	function normalize(evt) {
		if (evt && evt.originalEvent && evt.originalEvent.touches && evt.originalEvent.touches.length) {
			evt.pageX = evt.originalEvent.touches[0].pageX;
			evt.pageY = evt.originalEvent.touches[0].pageY;
			evt.touchCount = evt.originalEvent.touches.length;
		} else if (evt && evt.originalEvent && evt.originalEvent.changedTouches && evt.originalEvent.changedTouches.length) {
			evt.pageX = evt.originalEvent.changedTouches[0].pageX;
			evt.pageY = evt.originalEvent.changedTouches[0].pageY;
			evt.touchCount = evt.originalEvent.changedTouches.length;
		} else
			evt.touchCount = 0;
		return evt;
	};

	/**
	 * Selects a slide and both it's neighbors
	 */
	function MeAndMyNeighbors(elem) {
		var index = elem.data('slider.position');
		var m = elem.siblings().andSelf().filter(function() {
			i = $(this).data('slider.position');
			return (i == index - 1) || (i == index + 1) || (i == index);
		});
		return m;
	};
	
	/**
	 * Array.slice for pseudo arrays.
	 */
	function slice(parray, from, to) {
		if (to === undefined)
			to = parray.length;
		result = [];
		for (var i = from; i < to; i++)
			result.push(parray[i]);
		return result;
	}
	
	/**
	 * Slider Class
	 */
	function Slider() { this._init.apply(this, arguments); };
	Slider.indexAttr = 'data-slider-index';
	Slider.prototype = {
		timer: undefined,
		reverse: [],
		animation: undefined,
		
		/**
		 * Initialize the slider.
		 */
		_init: function(elem) {
			this.slider = elem;
			var all = elem.children().length;
			var bounce = (all < 3) || (elem.attr('data-slider-carousel') == 'false');
			var max = Math.floor(all / 2);
			var min = max - all;
			elem
				.data('slider', this)
				.bind('touchstart touchmove mousedown mouseup', $.proxy(this, '_touchBreak'))
				.resize(function(evt) {
					$(this).children().each(function() {
						var i = $(this).data('slider.index');
						if (i == undefined)
							return;
						i = Math.abs(i) > 1 ? Math.sign(i) : i;
						$(this).css({left: i * $(this).parent().width()});
					});
				})
				.find('a').bind('touchstart touchend', $.proxy(this, '_clickHandler')).end()
				.children()
					.each(function(n) {
						var i = n;
						if (!bounce && (i > max))
							i = (i - max) + min;
						var f = Math.abs(i) > 1 ? Math.sign(i) : i;
						$(this)
							.data('slider.position', i)
							.attr(Slider.indexAttr, n)
							.css({left: f * $(this).parent().width()});
					})
					.bind('touchstart touchend touchmove mousedown mousemove mouseup', $.proxy(this, '_touchHandler'));
					
			var intervall = elem.attr('data-slider-autoslide-intervall');
			if (intervall) {
				var self = this;
				var dir = elem.attr('data-slider-autoslide-direction');
				if (!dir)
					dir = 'right';
				this.timer = window.setInterval(function() { self[dir](); }, parseInt(intervall));
			}
			
			this.animation = $.fn.ghostslider.animations.slide;
		},
		
		/**
		 * Handles clicks on hyperlinks.
		 */
		_clickHandler: function(evt) {
			if (this.dx)
				return;
			evt.stopPropagation();
		},
		
		/**
		 * Breaks touch propagation.
		 */
		_touchBreak: function(evt) {
			evt = normalize(evt);
			if ((evt.touchCount > 1) || this.breakSlide)
				return;
			if (Math.abs(this.dy) < Math.abs(this.dx)) {
				evt.preventDefault();
				evt.stopPropagation();
				return false;
			} else if (Math.abs(this.dy) > 15) {
				this.breakSlide = true;
				return true;
			}
		},
		
		/**
		 * Prehandler for slide events.
		 */
		_touchHandler: function(evt) {
			evt = normalize(evt);
			if ((evt.touchCount > 1) || this.slider.children(':animated').length)
				return;
			return this['_' + evt.type](evt);
		},
		
		/**
		 * Mouse support.
		 */
		_mousedown: function(evt) { return this._touchstart(evt); },
		
		/**
		 * Mouse support.
		 */
		_mouseup: function(evt) { return this._touchend(evt); },
		
		/**
		 * Mouse support.
		 */
		_mousemove: function(evt) { return evt.which ? this._touchmove(evt) : false; },
		
		/**
		 * Prepares for sliding.
		 */
		_touchstart: function(evt) {
			this.p0 = {left: evt.pageX, top: evt.pageY};
			this.time = evt.timeStamp;
			this.dx = 0;
			this.dy = 0;
			this.breakSlide = false;
			this.forceSlide = false;
			this.slider.children().stop(true, true).each(function() {
				$(this).data('slider.left', $(this).position().left);
			});
		},
		
		/**
		 * Finger chasing movement.
		 */
		_touchmove: function(evt) {
			if (this.breakSlide)
				return;
			if (!this.p0)
				this.p0 = $(evt.currentTarget).position();
			dx = evt.pageX - this.p0.left;
			dy = evt.pageY - this.p0.top;
			if (this.reverse.length || (this.dx > dx))
				this.reverse.push(this.dx);
			this.dx = dx;
			this.dy = this.forceSlide ? 0 : dy;
			if (Math.abs(this.dy) > Math.abs(this.dx))
				return;
			this.forceSlide = true;
			this.animation.slide.call(this, MeAndMyNeighbors($(evt.currentTarget)), this);
			this.slider.trigger('sliding', this.dx);
		},
		
		_touchend: function(evt) {
			
			var data = {};
			
			data.currentSlide = $(evt.currentTarget);
			data.activeSlides = MeAndMyNeighbors(data.currentSlide);
			
			
			data.dx = this.dx;
			data.curX = evt.pageX;
			data.time = this.time;
			data.oldLeft = data.currentSlide.data('slider.left');
			data.factor = false;
			data.way = 0;
			data.stay = this.breakSlide ? true : false;
			
			data.all = this.slider.children().length;
			data.max = Math.floor(data.all / 2);
			data.min = -data.max + (data.all % 2 ? 0 : 1);
			data.slidingOffset = false;
			
			data.dir = 0;
			data.bounce = (data.all < 3) || (
				(this.slider.attr('data-slider-carousel') == 'false') &&
				(data.activeSlides.length == 2)
			);
			data.easing = this.slider.attr('data-slider-easing') || 'easeOutExpo';
			data.now = evt.timeStamp;
			
			if (data.bounce)
				data.dir = -Math.sign(data.activeSlides.not(data.currentSlide).data('slider.position'));
			if (data.all == 1)
				data.dir = 2;
				
			
			if (data.time)
				data.factor = (data.now - data.time) / 2000 * 0.1;
			if(data.factor > 0.5)
				data.factor = 0.5;
				
			this._cleanUp();
			this.animation.finish.call(this, data);
		},
		
		_cleanUp: function() {
			this.slider.children().each(function() {
				$(this).removeData('slider.left');
			});
		},
		
		_complete: function(slide, data) {
			if (data.stay || this.breakSlide)
				return;
		
			slide = $(slide);
			
			var txt = '';
			if ( !slide.siblings(':animated').length) {
				slide.siblings().andSelf().each(function() {
					var i = $(this).data('slider.position');
					txt += i + ' => ';
					i += data.slidingOffset;
					if (
						($(this).parent().attr('data-slider-carousel') != 'false') &&
						(data.activeSlides.length > 2)
					) {
						if (i < data.min)
							i = data.max;
						else if (i > data.max)
							i = data.min;
					}
					txt += i + ' (';
					var f = Math.abs(i) > 1 ? Math.sign(i) : i;
					$(this).data('slider.position', i).css({left: f * $(this).parent().innerWidth()});
				});
			}
			this.slider.trigger('slidecomplete', [this.hasLeft(), this.hasRight(), slide]);
		},
		
		getCurrentSlide: function() {
			return this.slider.children().filter(function() { return $(this).data('slider.position') == 0; });
		},
		
		_has: function(dir) {
			all = this.slider.children().length;
			if (all == 1)
				return false;
			
			currentSlide = this.getCurrentSlide();
			activeSlides = MeAndMyNeighbors(currentSlide);
			if (
				(all < 3) || (
					(this.slider.attr('data-slider-carousel') == 'false') &&
					(activeSlides.length == 2)
				)
			) {
				var x = -Math.sign(activeSlides.not(currentSlide).data('slider.position'));
				return (dir == x);
			}
			return true;
		},
		
		hasLeft: function() {
			return this._has(1);
		},
		
		hasRight: function() {
			return this._has(-1);
		},
		
		left: function() {
			this.moveTo(
				this.slider.children().filter(function() { return $(this).data('slider.position') == -1; })
			);
		},
		
		right: function() {
			this.moveTo(
				this.slider.children().filter(function() { return $(this).data('slider.position') == 1; })
			);
		},
		
		moveTo: function(slide) {
			if (typeof slide != 'object')
				slide = this.slider.children('[' + Slider.indexAttr + '=' + slide + ']');
			
			var data = {};
			
			data.currentSlide = this.getCurrentSlide();
			s1 = slide.data('slider.position');
			s2 = data.currentSlide.data('slider.position');
			data.activeSlides = MeAndMyNeighbors(data.currentSlide).filter(function() {
				n = $(this).data('slider.position');
				return (s1 > s2) ? n < 1 : n > -1;
			}).add(slide);
			
			data.slidingOffset = -s1;
			
			data.dx = -s1;
			data.curX = 0;
			data.time = 0;
			data.oldLeft = data.currentSlide.data('slider.left');
			data.factor = 0;
			data.way = 0;
			data.stay = false;
			
			data.all = this.slider.children().length;
			data.max = Math.floor(data.all / 2);
			data.min = -data.max + (data.all % 2 ? 0 : 1);
			
			data.dir = 0;
			data.bounce = (data.all < 3) || (
				(this.slider.attr('data-slider-carousel') == 'false') &&
				(data.activeSlides.length == 2)
			);
			data.easing = this.slider.attr('data-slider-easing') || 'easeOutExpo';
			data.now = 0;
			
			if (data.bounce)
				data.dir = -Math.sign(data.activeSlides.not(data.currentSlide).data('slider.position'));
			if (data.all == 1)
				data.dir = 2;
			
			this._cleanUp();
			this.animation.finish.call(this, data);
		},
	};
	
	$.fn.ghostslider = function(method) {
		// Is Method Call
		if (typeof method === 'string') {
			var args = slice(arguments, 1);
			var slider = this.eq(0).data('slider');
			return slider[method].apply(slider, args);
		} else {
			this.each(function() {
				var slider = new Slider($(this));
			})
		}
		return this;
	};
	
	$.fn.ghostslider.animations = {};
	$.fn.ghostslider.animations.slide = {
		slide: function(slides, data) {
			slides
				.each(function() {
					var left = $(this).data('slider.left');
					$(this).css({left: left + data.dx});
				});
		},
		finish: function(data) {
			if(
				(Math.abs(data.dx) > data.currentSlide.width() * data.factor) &&
				(data.dir ? (Math.sign(data.dx) == data.dir) : true) &&
				(!data.stay)
			) {
				data.way = Math.sign(data.dx) * data.currentSlide.outerWidth()- data.currentSlide.position().left;
			} else {
				data.way = data.oldLeft - data.currentSlide.position().left;
				data.stay = true;
			}
// 			
			if (!data.way)
				return;
			
			if (!data.slidingOffset)
				data.slidingOffset = Math.sign(data.way);
			
			self = this;
			
			data.activeSlides
					.animate(
						{
							left : '+=' + data.way
						}, {
						easing : data.easing,
						complete : function() { self._complete(this, data); }
						}
					);
		}
	};
	
	$.fn.ghostslider.animations.fade = {
		slide: function(slides, data) {
			slides
				.each(function() {
					var left = $(this).data('slider.position') != Math.sign(data.dx) ? 0 : $(this).position().left;
					var zIndex = $(this).data('slider.position') ? 0 : 100;
					var opacity = $(this).data('slider.position') ? 1 : 1 - Math.abs(data.dx) / $(this).width();
					$(this).css({left: left, opacity: opacity, zIndex: zIndex});
				});
		},
		finish: function(data) {
			if(
				(Math.abs(data.dx) > data.currentSlide.width() * data.factor) &&
				(data.dir ? (Math.sign(data.dx) == data.dir) : true) &&
				(!data.stay)
			) {
				data.way = 0;
			} else {
				data.way = 1;
				data.stay = true;
			}
// 			
			if (!data.dx)
				return;
			
			if (!data.slidingOffset)
				data.slidingOffset = Math.sign(data.dx);
			
			self = this;
			
			data.activeSlides.not(data.currentSlide).each(function() {
				var left = $(this).data('slider.position') != Math.sign(data.dx) ? 0 : $(this).position().left;
				var zIndex = $(this).data('slider.position') ? 0 : 100;
				$(this).css({left: left, zIndex: zIndex});
			});
			
			console.log(data.way);
			data.currentSlide.animate({
				opacity: data.way
			}, {
				duration: 30000,
				easing : data.easing,
				complete : function() {
					$(this).css({left: Math.sign(data.dx) * self.slider.width(), opacity: 1});
					self._complete(this, data);
				}
			});
		}
	};
	
	if (!window.OhGodPleaseNoAutoload)
		$(function() { $('.slideshow').ghostslider(); });
})(jQuery);
