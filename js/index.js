if(!Math.sign) {
	Math.sign = function(_in) {
		return _in < 0 ? -1 : 1;
	};
}

function normalize(evt) {
	if(evt && evt.originalEvent && evt.originalEvent.touches && evt.originalEvent.touches.length) {
		evt.pageX = evt.originalEvent.touches[0].pageX;
		evt.pageY = evt.originalEvent.touches[0].pageY;
	}
	return evt;
}

$(function() {

	$('.slideshow').bind('touchstart touchmove touchend', function(evt) {
		evt.preventDefault();
		return false;
	})//;
	//$('.slideshow > div')
	.children()
		.each(function(i) {
			var all = $(this).siblings().andSelf().length;
			var max = all / 2;
			var min = max - all;
			if (i > max)
				i = (i - max) + min;
			$(this)
				.attr('data-ui-index', i)
				.css({
					left: (i) * $(this).outerWidth()
				});
		})
		.bind('touchstart', function(evt) {
			if ($(this).data('slider.isanimating'))
				return;
			evt = normalize(evt);
			evt.preventDefault();
			
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
		/*.bind('dragleave mouseleave', function(evt) {
			if ($(this).data('slider.isanimating'))
				return;
			$(this).trigger('touchend');
		})*/
		.bind('touchmove', function(evt, dx) {
			if ($(this).data('slider.isanimating'))
				return;
			evt = normalize(evt);
			evt.preventDefault();
			// TODO Move from event to relative motion
			if (dx == undefined) {
				var p0 = $(this).data('slider.p0');
				var dx = evt.pageX - p0.left;
				$(this).siblings().trigger('touchmove', dx);
			}
			var left = $(this).data('slider.left');
			$(this).css({left: left + dx}).data('slider.dx', dx);
		})
		.bind('click', function(evt) {
			if ($(this).data('slider.isanimating'))
				return;
			$(this).data('slider.dx', 1 * $(this).width()).trigger('touchend');
		})
		.bind('touchend', function(evt) {
			if ($(this).data('slider.isanimating'))
				return;
			evt = normalize(evt);
			evt.preventDefault();
			
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
			if(Math.abs(dx) > $(this).width() * factor) {
				way = Math.sign(dx) * $(this).outerWidth();
			} else {
				way = oldLeft;
			}
			way = way - $(this).position().left;
			
			if (!way)
				return;
			
			$(this)
				.siblings().andSelf()
					.each(function() {
						$(this).data('slider.isanimating', true);
					}).animate({
						left : '+=' + way
					}, {
					complete : function() {
						$(this).data('slider.isanimating', false);
						var i = parseInt($(this).attr('data-ui-index')) + Math.sign(dx);
						var all = $(this).siblings().andSelf().length;
						var max = all / 2;
						var min = max - all;
						if (i <= min) {
							var l = max * $(this).parent().innerWidth();
							$(this).attr('data-ui-index', max).css({left: l});
						} else if (i > max) {
							var l = (min + 1) * $(this).parent().innerWidth();
							$(this).attr('data-ui-index', (min + 1)).css({left: l});
						} else
							$(this).attr('data-ui-index', i);
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