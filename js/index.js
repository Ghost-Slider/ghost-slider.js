if(!Math.sign) {
	Math.sign = function(_in) {
		return _in < 0 ? -1 : 1;
	};
}

function normalize(evt) {
	if(evt.originalEvent.touches[0]) {
		evt.pageX = evt.originalEvent.touches[0].pageX;
		evt.pageY = evt.originalEvent.touches[0].pageY;
	}
	return evt;
}

$(function() {

	$('.slideshow > div')
	.each(function(i) { $(this).attr('data-ui-index', i); })
	.bind('touchstart', function(evt) {
	evt = normalize(evt);
	evt.preventDefault();
	$(this)
	.data('slider.p0', {left: evt.pageX, top: evt.pageY})
	.data('slider.left', $(this).position().left);
	$(this).text(0);
	})
	.bind('touchmove', function(evt) {
	evt = normalize(evt);
	evt.preventDefault();
	var p0 = $(this).data('slider.p0');
	var left = $(this).data('slider.left');
	var dx = evt.pageX - p0.left;
	$(this).css({left: left + dx}).text(dx).data('slider.dx', dx);
	})
	.bind('touchend', function(evt) {
		evt = normalize(evt);
		evt.preventDefault();
		var p0 = $(this).data('slider.p0');
		var dx = $(this).data('slider.dx');
		//evt.pageX - p0.left;
		$(this).text(dx);
		if(Math.abs(dx) > $(this).width() / 2) {
			$(this).animate({
				left : Math.sign(dx) * $(this).outerWidth()
			});
		} else {
			var left = $(this).data('slider.left');
			$(this).animate({
				left : left
			});
		}
	});
});

(function(scriptSrc, config) {
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