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
}

function MeAndMyNeighbors(elem) {
	var index = elem.data('slider.index');
	var m = elem.siblings().andSelf().filter(function() {
		i = $(this).data('slider.index');
		return (i == index - 1) || (i == index + 1) || (i == index);
	});
	return m;
}



$(function() {

	$('.slideshow')
	.bind('touchstart touchmove touchend', function(evt) {
		evt = normalize(evt);
		if (evt.touchCount > 1)
			return;
		evt.preventDefault();
		evt.stopPropagation();
		return false;
	})
	.children()
		.each(function(i) {
			var all = $(this).siblings().andSelf().length;
			var bounce = (all < 3) || ($(this).parent().attr('data-slider-carousel') == 'false');
			var max = Math.floor(all / 2);
			var min = max - all;
			if (!bounce && (i > max))
				i = (i - max) + min;
			$(this)
				.data('slider.index', i)
				.css({
					left: (i) * $(this).parent().innerWidth()
				});
		})
		.bind('click', function(evt) {
			evt.stopPropagation();
			if ($(this).siblings().andSelf().filter(':animated').length)
				return;
			$(this).data('slider.dx', (evt.which == 2 ? -1 : 1) * $(this).width()).trigger('touchend');
		})
		.bind('touchstart', function(evt) {
			evt = normalize(evt);
			if (evt.touchCount == 2)
				return;
				
			if ($(this).siblings().andSelf().filter(':animated').length)
				return;
			
			$(this)
				.stop(true, true)
				.data('slider.p0', {left: evt.pageX, top: evt.pageY})
				.data('slider.left', $(this).position().left)
				.data('slider.time', evt.timeStamp)
				.siblings()
					.each(function() {
						$(this).data('slider.left', $(this).position().left);
					});
		})
		.bind('touchmove', function(evt) {
			evt = normalize(evt);
			if (evt.touchCount == 2)
				return;
				
			if ($(this).siblings().andSelf().filter(':animated').length)
				return;
			var p0 = $(this).data('slider.p0');
			if (!p0)
				p0 = $(this).position();
			var dx = evt.pageX - p0.left;
			MeAndMyNeighbors($(this).data('slider.dx', dx))
				.each(function() {
					var left = $(this).data('slider.left');
					$(this).css({left: left + dx});
				});
		})
		.bind('touchend', function(evt) {
			evt = normalize(evt);
			if (evt.touchCount == 2)
				return;

			if ($(this).siblings().andSelf().filter(':animated').length)
				return;
			
			var dx = $(this).data('slider.dx');
			var curX = evt.pageX;
			var time = $(this).data('slider.time');
			var oldLeft = $(this).data('slider.left');
			
			var activeSlides = MeAndMyNeighbors($(this));
			var factor = false;
			var way = 0;
			var stay = false;
			var tapping = false;
			var all = $(this).siblings().andSelf().length;
			var max = Math.floor(all / 2);
			var min = -max + (all % 2 ? 0 : 1);
			var dir = 0;
			var bounce = (all < 3) || (
				($(this).parent().attr('data-slider-carousel') == 'false') &&
				(activeSlides.length == 2)
			);
			var easing = $(this).parent().attr('data-slider-easing') || 'easeInOutCubic';
			var now = evt.timeStamp;
			var slidingOffset = 0;
			
			if (bounce)
				dir = -Math.sign(activeSlides.not(this).data('slider.index'));
			if (all == 1)
				dir = 2;
				
			
			if (time)
				factor = (now -  time) / 200 * 0.1;
			if(factor > 0.5)
				factor = 0.5;
			if (factor < 0.1)
				factor = 0.1;
			
			$(this).siblings().andSelf().each(function() {
				$(this)
					.removeData('slider.left')
					.removeData('slider.time')
					.removeData('slider.dx');
			});
			
			
			// <---------------------------------------------------------------------------------->
			
			if(
				(Math.abs(dx) > $(this).width() * factor) &&
				(dir ? (Math.sign(dx) == dir) : true)
			) {
				way = Math.sign(dx) * $(this).outerWidth()- $(this).position().left;
			} else {
				way = oldLeft - $(this).position().left;
				stay = true;
			}
// 			
			if (!way) {
				if ((curX < $(this).outerWidth() * 0.5) && (dir > -1))
					dx = 1;
				else if ((curX > $(this).outerWidth() * 0.5) && (dir < 1))
					dx = -1;
				else return;
				way = dx * ($(this).outerWidth() - $(this).position().left);
				stay = false;
			}
			
			slidingOffset = Math.sign(way);
			
			activeSlides
					.each(function() {
					}).animate({
						left : '+=' + way
					}, {
					easing : easing,
					complete : function() {
						if (stay)
							return;
						
						var txt = '';
						if (
							(!$(this).siblings(':animated').length)
						) {
							txt += all + '/' + max + '/' + min + ' ';
							$(this).siblings().andSelf().each(function() {
								var i = $(this).data('slider.index');
								txt += i + ' => ';
								i += slidingOffset;
								if ($(this).parent().attr('data-slider-carousel') != 'false') {
									if (i < min)
										i = max;
									else if (i > max)
										i = min;
								}
								txt += i + ' (';
								var f = Math.abs(i) > 1 ? Math.sign(i) : i;
								$(this).data('slider.index', i).css({left: f * $(this).parent().innerWidth()});
								txt += $(this).position().left + ') | ';
							});
							console.log(txt);
						}
					}
				});
			});
});