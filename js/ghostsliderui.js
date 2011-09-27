/**
 * @author Benjamin Kleiner
 */

(function($) {
	if (window.OhGodPleaseNoAutoload)
		return;
		
	$.fn.ghostslider.ui = {generators: {}};
	$.fn.ghostslider.ui.generators.numberedSquares = function(i, slide) {
 		var r = $('<span>').text(i + 1).addClass('square');
 		if (i == 0)
 			r.addClass('current');
 		return r;
 	};
 	
	$.fn.ghostslider.ui.generators.circles = function(i, slide) {
 		var r = $('<span>').html('&nbsp;').addClass('circle');
 		if (i == 0)
 			r.addClass('current');
 		return r;
 	};
 	
 	$.fn.ghostslider.ui.leftRightHandler = function(evt, hasLeft, hasRight, slides, animate) {
 		var widget = $(this);
 		if (animate === undefined)
	 		var animate = widget.attr('data-ui-animate');
		var hlr = widget.hasClass('slide-left') ? hasLeft : hasRight;
		if (!hlr) {
			if (animate && widget.css('opacity') > 0)
				widget.animate({opacity: 0}, animate);
			else
				widget.css({opacity: 0});
		} else {
			if (animate && widget.css('opacity') < 1)
				widget.animate({opacity: 1}, animate);
			else
				widget.css({opacity: 1});
		}
	};
		
	$(function() {
		$('.slideshow-ui.slide-left').click(function(evt) {
			$($(this).attr('data-slider')).ghostslider('left');
		}).each(function() {
			var p = $.proxy($.fn.ghostslider.ui.leftRightHandler, this);
			var slider = $($(this).attr('data-slider'));
			slider.bind('slidecomplete', p);
			p(null, slider.ghostslider('hasLeft'), slider.ghostslider('hasRight'), null, false);
		});
		
		$('.slideshow-ui.slide-right').click(function(evt) {
			$($(this).attr('data-slider')).ghostslider('right');
		}).each(function() {
			var p = $.proxy($.fn.ghostslider.ui.leftRightHandler, this);
			var slider = $($(this).attr('data-slider'));
			slider.bind('slidecomplete', p);
			p(null, slider.ghostslider('hasLeft'), slider.ghostslider('hasRight'), null, false);
		});
		
		$('.slideshow-ui.autoslide-toggle').click(function(evt) {
			var widget = $(this);
			var interval = widget.attr('data-sliderui-interval');
			if (interval)
				interval = parseInt(interval);
			else
				interval = undefined;
			var slider = $(widget.attr('data-slider'));
			if (slider.ghostslider('isAutosliding')) {
				slider.ghostslider('stop');
			} else {
				slider.ghostslider('start', interval);
			}
			widget.fadeOut(function() {
				widget.html(slider.ghostslider('isAutosliding') ? widget.attr('data-sliderui-stopicon') : widget.attr('data-sliderui-starticon'));
			}).fadeIn();
		}).each(function() {
			var widget = $(this);
			var slider = $(widget.attr('data-slider'));
			widget.html(slider.ghostslider('isAutosliding') ? widget.attr('data-sliderui-stopicon') : widget.attr('data-sliderui-starticon'));
		});
		
		$('.slideshow-ui.slidelist').each(function() {
			var widget = $(this);
			var slider = $(widget.attr('data-slider'));
			var slides = slider.children();
			var generatorStr = widget.attr('data-sliderui-listgenerator');
			var generator = false;
			if (generatorStr[0] == '$') {
				generator = $.fn.ghostslider.ui.generators;
				generatorStr = generatorStr.substr(1);
			}
			if (generatorStr.search('.') > -1) {
				$.each(generatorStr.split('.'), function() {
					if (!generator) {
						if (this == 'window')
							generator = window;
						else
							generator = window[this];
					} else if (generator[this])
						generator = generator[this];
					else
						throw 'FAIL';
				});
			} else {
				generator = window[generatorStr];
			}
			slides.each(function(i) {
				generator(i, slides.length, this).attr('data-slide', $(this).attr('data-slider-index')).click(function(evt) {
					slider.ghostslider('moveTo', $(this).attr('data-slide'));
					$(this).addClass('current').siblings().removeClass('current');
				}).appendTo(widget);
			});
			slider.bind('slidecomplete', function(evt, hasLeft, hasRight, slides) {
				widget.children().removeClass('current');
				cur = slides.filter(function() { return $(this).position().left == 0; }).attr('data-slider-index');
				widget.children('[data-slide=' + cur + ']').addClass('current');
				evt.stopPropagation();
			})
		});
		
	});
})(jQuery);