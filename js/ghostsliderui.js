/**
 * @author Benjamin Kleiner
 */

(function() {
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
		
	$(function() {
		$('.slideshow-ui.slide-left').click(function(evt) {
			$($(this).attr('data-slider')).ghostslider('left');
		});
		
		$('.slideshow-ui.slide-right').click(function(evt) {
			$($(this).attr('data-slider')).ghostslider('right');
		});
		
		$('.slideshow-ui.autoslide-toggle').click(function(evt) {
			var $this = $(this);
			var interval = $this.attr('data-interval');
			if (interval)
				interval = parseInt(data-interval);
			else
				interval = undefined;
			var slider = $($this.attr('data-slider'));
			if (slider.ghostslider('isAutosliding')) {
				slider.ghostslider('stop');
			} else {
				slider.ghostslider('start', interval);
			}
			$this.html(slider.ghostslider('isAutosliding') ? $this.attr('data-stop') : $this.attr('data-start'));
		}).each(function() {
			var $this = $(this);
			var slider = $($this.attr('data-slider'));
			$this.html(slider.ghostslider('isAutosliding') ? $this.attr('data-stop') : $this.attr('data-start'));
		});
		
		$('.slideshow-ui.slidelist').each(function() {
			var widget = $(this);
			var slider = $(widget.attr('data-slider'));
			var slides = slider.children();
			var generator = false;
			var generatorStr = widget.attr('data-generator');
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
			})
		});
		
	});
})(jQuery);