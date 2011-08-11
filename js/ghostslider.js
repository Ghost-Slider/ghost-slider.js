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
	
	function normalize(evt) {
		if (evt && evt.originalEvent && evt.originalEvent.touches && evt.originalEvent.touches.length) {
			evt.pageX = evt.originalEvent.touches[0].pageX;
			evt.pageY = evt.originalEvent.touches[0].pageY;
			evt.touchCount = evt.originalEvent.touches.length;
		} else if (evt && evt.originalEvent && evt.originalEvent.changedTouches && evt.originalEvent.changedTouches.length) {
			evt.pageX = evt.originalEvent.changedTouches[0].pageX;
			evt.pageY = evt.originalEvent.changedTouches[0].pageY;
			evt.touchCount = evt.originalEvent.changedTouches.length;
		}
		return evt;
	};

	function MeAndMyNeighbors(elem) {
		var index = elem.data('slider.position');
		var m = elem.siblings().andSelf().filter(function() {
			i = $(this).data('slider.position');
			return (i == index - 1) || (i == index + 1) || (i == index);
		});
		return m;
	};
	
	function slice(parray, from, to) {
		if (to === undefined)
			to = parray.length;
		result = [];
		for (var i = from; i < to; i++)
			result.push(parray[i]);
		return result;
	}
	
	
	
	
	
	function Slider() { this._init.apply(this, arguments); };
	Slider.indexAttr = 'data-ui-index';
	Slider.prototype = {
		timer: undefined,
		
		_init: function(elem) {
			this.slider = elem;
			var all = elem.children().length;
			var bounce = (all < 3) || (elem.attr('data-slider-carousel') == 'false');
			var max = Math.floor(all / 2);
			var min = max - all;
			elem
				.data('slider', this)
				.click($.proxy(this, 'click'))
				.bind('touchstart touchend touchmove', this.touchBreak)
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
					.bind('touchstart touchend touchmove', $.proxy(this, 'touchHandler'));
					
			var intervall = elem.attr('data-slider-autoslide-intervall');
			if (intervall) {
				var self = this;
				var dir = elem.attr('data-slider-autoslide-direction');
				if (!dir)
					dir = 'right';
				this.timer = window.setInterval(function() { self[dir](); }, parseInt(intervall));
			}
		},
		
		touchBreak: function(evt) {
			evt = normalize(evt);
			if (evt.touchCount > 1)
				return;
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		},
		
		touchHandler: function(evt) {
			evt = normalize(evt);
			if ((evt.touchCount > 1) || this.slider.children(':animated').length)
				return;
			return this[evt.type](evt);
		},
		
		touchstart: function (evt) {
			this.p0 = {left: evt.pageX, top: evt.pageY};
			this.time = evt.timeStamp;
			this.slider.children().stop(true, true).each(function() {
				$(this).data('slider.left', $(this).position().left);
			});
		},
		
		touchmove: function (evt) {
			if (!this.p0)
				this.p0 = $(evt.currentTarget).position();
			this.dx = dx = evt.pageX - this.p0.left;
			MeAndMyNeighbors($(evt.currentTarget))
				.each(function() {
					var left = $(this).data('slider.left');
					$(this).css({left: left + dx});
				});
		},
		
		touchend: function (evt) {
			
			var data = {};
			
			data.currentSlide = $(evt.currentTarget);
			data.activeSlides = MeAndMyNeighbors(data.currentSlide);
			
			data.dx = this.dx;
			data.curX = evt.pageX;
			data.time = this.time;
			data.oldLeft = data.currentSlide.data('slider.left');
			data.factor = false;
			data.way = 0;
			data.stay = false;
			data.tapping = false;
			
			data.all = this.slider.children().length;
			data.max = Math.floor(data.all / 2);
			data.min = -data.max + (data.all % 2 ? 0 : 1);
			data.slidingOffset = false;
			
			data.dir = 0;
			data.bounce = (data.all < 3) || (
				(this.slider.attr('data-slider-carousel') == 'false') &&
				(data.activeSlides.length == 2)
			);
			data.easing = this.slider.attr('data-slider-easing') || 'easeInOutCubic';
			data.now = evt.timeStamp;
			
			if (data.bounce)
				data.dir = -Math.sign(data.activeSlides.not(data.currentSlide).data('slider.position'));
			if (data.all == 1)
				data.dir = 2;
				
			
			if (data.time)
				data.factor = (data.now - data.time) / 200 * 0.1;
			if(data.factor > 0.5)
				data.factor = 0.5;
			if (data.factor < 0.1)
				data.factor = 0.1;
			
			this.slider.children().each(function() {
				$(this)
					.removeData('slider.left');
			});
			
			$.fn.ghostslider.animations.slide.finish.call(this, data);
		},
		
		completion: function(slide, data) {
			if (data.stay)
				return;
		
			slide = $(slide);
			
			var txt = '';
			if ( !slide.siblings(':animated').length ) {
				txt += data.all + '/' + data.max + '/' + data.min + ' ';
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
					txt += $(this).attr(Slider.indexAttr) + ') | ';
				});
				//console.log(txt);
			}
		},
		
		click: function(evt) {
			evt.stopPropagation();
			if (this.slider.children(':animated').length)
				return;
			if (evt.pageX > 0.5 * this.slider.outerWidth())
				this.left();
			else
				this.right();
		},
		
		left: function() {
			this.moveTo(
				this.slider.children().filter(function() { return $(this).data('slider.position') == 1; })
			);
		},
		
		right: function() {
			this.moveTo(
				this.slider.children().filter(function() { return $(this).data('slider.position') == -1; })
			);
		},
		
		moveTo: function(slide) {
			if (typeof slide != 'object')
				slide = this.slider.children('[' + Slider.indexAttr + '=' + slide + ']');
			
			var data = {};
			
			data.currentSlide = this.slider.children().filter(function() { return $(this).data('slider.position') == 0; });
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
			data.tapping = false;
			
			data.all = this.slider.children().length;
			data.max = Math.floor(data.all / 2);
			data.min = -data.max + (data.all % 2 ? 0 : 1);
			
			data.dir = 0;
			data.bounce = (data.all < 3) || (
				(this.slider.attr('data-slider-carousel') == 'false') &&
				(data.activeSlides.length == 2)
			);
			data.easing = this.slider.attr('data-slider-easing') || 'easeInOutCubic';
			data.now = 0;
			
			if (data.bounce)
				data.dir = -Math.sign(data.activeSlides.not(data.currentSlide).data('slider.position'));
			if (data.all == 1)
				data.dir = 2;
			
			$.fn.ghostslider.animations.slide.finish.call(this, data);
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
		finish: function(data) {
			if(
				(Math.abs(data.dx) > data.currentSlide.width() * data.factor) &&
				(data.dir ? (Math.sign(data.dx) == data.dir) : true)
			) {
				data.way = Math.sign(data.dx) * data.currentSlide.outerWidth()- data.currentSlide.position().left;
			} else {
				data.way = data.oldLeft - data.currentSlide.position().left;
				data.stay = true;
			}
// 			
			if (!data.way) {
				if ((data.curX < data.currentSlide.outerWidth() * 0.5) && (data.dir > -1))
					data.dx = 1;
				else if ((data.curX > data.currentSlide.outerWidth() * 0.5) && (data.dir < 1))
					data.dx = -1;
				else return;
				data.way = data.dx * (data.currentSlide.outerWidth() - data.currentSlide.position().left);
				data.stay = false;
				// return;
			}
			
			if (!data.slidingOffset)
				data.slidingOffset = Math.sign(data.way);
			
			self = this;
			
			data.activeSlides
					.animate(
						{
							left : '+=' + data.way
						}, {
						easing : data.easing,
						complete : function() { self.completion(this, data); }
						}
					);
		}
	};
	
	if (!window.OhGodPleaseNoAutoload)
		$(function() { $('.slideshow').ghostslider(); });
})(jQuery);
