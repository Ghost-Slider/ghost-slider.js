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

function log() {
	for(var i in arguments) {
		console.log(arguments[i]);
		$('#log').append($('<div/>').text(arguments[i]));
	}
}

$(function() {

	$('.slideshow > div')
		.each(function(i) {
			$(this)
				.attr('data-ui-index', i)
				.css({
					left: i * $(this).outerWidth()
				});
		})
		.bind('touchstart', function(evt) {
			evt = normalize(evt);
			evt.preventDefault();
			$(this)
				.data('slider.p0', {left: evt.pageX, top: evt.pageY})
				.data('slider.left', $(this).position().left)
				.data('slider.time', evt.timeStamp)
				.text(0)
				.siblings()
					.each(function() {
						$(this).data('slider.left', $(this).position().left);
					});
		})
		.bind('touchmove', function(evt, dx) {
			evt = normalize(evt);
			evt.preventDefault();
			if (dx == undefined) {
				var p0 = $(this).data('slider.p0');
				var dx = evt.pageX - p0.left;
				$(this).siblings().trigger('touchmove', dx);
			}
			var left = $(this).data('slider.left');
			$(this).css({left: left + dx}).text(dx).data('slider.dx', dx);
		})
		.bind('touchend', function(evt) {
			evt = normalize(evt);
			evt.preventDefault();
			var p0 = $(this).data('slider.p0');
			var dx = $(this).data('slider.dx');
			//evt.pageX - p0.left;
			var factor = (evt.timeStamp -  $(this).data('slider.time')) / 150 * 0.1;
			if(factor > 0.5)
				factor = 0.5;
	
			var way = 0;
			if(Math.abs(dx) > $(this).width() * factor) {
				way = Math.sign(dx) * $(this).outerWidth();
			} else {
				way = $(this).data('slider.left');
			}
			$(this).siblings().andSelf().animate({
				left : '+=' + (way - $(this).position().left)
			});
		});
});
// ----

( function(scriptSrc, config) {
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
