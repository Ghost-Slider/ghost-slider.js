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
	var index = parseInt(elem.data('slider.index'));
	var m = elem.siblings().andSelf().filter(function() {
		i = parseInt($(this).data('slider.index'));
		//console.log($(this).data('slider.index') + ', ' + index + ', ' + i + ', ' + ((i == index - 1) || (i == index + 1) || (i == index)));
		return (i == index - 1) || (i == index + 1) || (i == index);
	});
	return m;
}

$(function() {

	$('.slideshow')
	.bind('touchstart touchmove touchend', function(evt) {
		evt.preventDefault();
		return false;
	})
	.children()
		.each(function(i) {
			var all = $(this).siblings().andSelf().length;
			var max = all / 2;
			var min = max - all;
			if (i > max)
				i = (i - max) + min;
			$(this)
				.data('slider.index', i)
				.css({
					left: (i) * $(this).parent().innerWidth()
				});
		})
		.bind('touchstart', function(evt) {
			evt.preventDefault();
			if ($(this).siblings().andSelf().filter(':animated').length)
				return;
			evt = normalize(evt);
			
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
		.bind('touchmove', function(evt, dx) {
			evt.preventDefault();
			if ($(this).siblings().andSelf().filter(':animated').length)
				return;
			evt = normalize(evt);
			var p0 = $(this).data('slider.p0');
			if (!p0)
				p0 = $(this).position();
			var dx = evt.pageX - p0.left;
			$(this).data('slider.dx', dx)
				.siblings().andSelf().each(function() {
					var left = $(this).data('slider.left');
					$(this).css({left: left + dx});
				});
		})
		.bind('click', function(evt) {
			evt.preventDefault();
			if ($(this).siblings().andSelf().filter(':animated').length)
				return;
			$(this).data('slider.dx', (evt.which == 2 ? -1 : 1) * $(this).width()).trigger('touchend');
		})
		.bind('touchend', function(evt) {
			evt.preventDefault();
			if ($(this).siblings().andSelf().filter(':animated').length)
				return;
			evt = normalize(evt);
			
			var dx = $(this).data('slider.dx');
			var time = $(this).data('slider.time');
			var oldLeft = $(this).data('slider.left');
			$(this).siblings().andSelf().each(function() {
				$(this).removeData('slider.left').removeData('slider.time').removeData('slider.dx');
			});
			var factor = false;
			if (time)
				factor = (evt.timeStamp -  time) / 300 * 0.1;
			if(factor > 0.5)
				factor = 0.5;
			if (factor < 0.1)
				factor = 0.1;
			
	
			var way = 0;
			var stay = false;
			if(Math.abs(dx) > $(this).width() * factor) {
				way = Math.sign(dx) * $(this).outerWidth();
			} else {
				way = oldLeft;
				stay = true;
			}
			way = way - $(this).position().left;
			
			if (!way) {
				console.log(way);
				if (evt.pageX < $(this).outerWidth() * 0.05)
					dx = 1;
				else if (evt.pageX > $(this).outerWidth() * 0.95)
					dx = -1;
				else return;
				way = dx * ($(this).outerWidth() - $(this).position().left);
				stay = false;/**/
				/*return;/**/
			}
			
			var easing = $(this).parent().attr('data-slider-easing') || 'easeInOutCubic';
			MeAndMyNeighbors($(this))
					.each(function() {
					}).animate({
						left : '+=' + way
					}, {
					easing : easing,
					complete : function() {
						if (stay)
							return;
						
						if (!$(this).siblings(':animated').length) {
							txt = '';
							$(this).siblings().andSelf().each(function() {
								var i = parseInt($(this).data('slider.index'));
								
								i += Math.sign(dx)
								var all = $(this).siblings().andSelf().length;
								var max = all / 2;
								var min = max - all;
								if (i <= min)
									i = max;
								else if (i > max)
									i = min + 1;
								$(this).data('slider.index', i).css({left: i * $(this).parent().innerWidth()});
								/*if (i <= min) {
									var l = max * $(this).parent().innerWidth();
									$(this).attr('data-ui-index', max).css({left: l});
								} else if (i > max) {
									var l = (min + 1) * $(this).parent().innerWidth();
									$(this).attr('data-ui-index', (min + 1)).css({left: l});
								} else
									$(this).attr('data-ui-index', i);
								*/
							});
						}
					}
				});
			});
});
// ----

/*( function(scriptSrc, config) {
	var script = document.createElement('script');
	script.src = scriptSrc;
	script.type = 'text/javascript';
	script.addEventListener('load', function() {
		if('phantomLimb' in window) {
			phantomLimb.init(config)
		} else {
			console.error('Phantom Limb could not be loaded')
		}
	}, false);
	document.head.appendChild(script)
}('js/phantomLimb.js', {
	src : '',
	lefty : false
}));
*/