(function ($) {
	"use strict";


/*===========================================
	=            Windows Load          =
=============================================*/
$(window).on('load', function () {
    preloader();
    sal({
    threshold: 0.1,
    once: true,
    disable: function() {
        return window.innerWidth < 768; // disable under 768px (mobile)
    }
    });
});


/*===========================================
	=            Preloader          =
=============================================*/
function preloader() {
	$('#preloader').delay(0).fadeOut();
};


/*===========================================
	=    		Mobile Menu			      =
=============================================*/
//SubMenu Dropdown Toggle
if ($('.tgmenu__wrap li.menu-item-has-children ul').length) {
	$('.tgmenu__wrap .navigation li.menu-item-has-children').append('<div class="dropdown-btn"><span class="plus-line"></span></div>');
}

//Mobile Nav Hide Show
if ($('.tgmobile__menu').length) {

	var mobileMenuContent = $('.tgmenu__wrap .tgmenu__main-menu').html();
	$('.tgmobile__menu .tgmobile__menu-box .tgmobile__menu-outer').append(mobileMenuContent);

	//Dropdown Button
    $('.tgmobile__menu').on('click', 'li.menu-item-has-children > .dropdown-btn', function (e) {
		e.preventDefault();
            const $btn = $(this);
            const $submenu = $btn.prev('ul');

            // close sibling menus at the same level
            const $parentLi = $btn.closest('li.menu-item-has-children');
            $parentLi.siblings('.menu-item-has-children').each(function () {
                $(this).children('.dropdown-btn').removeClass('open');
                $(this).children('ul.sub-menu').slideUp(300);
            });

            // toggle current submenu
            $btn.toggleClass('open');
            $submenu.slideToggle(300);
	});
	//Menu Toggle Btn
	$('.mobile-nav-toggler').on('click', function () {
		$('body').addClass('mobile-menu-visible');
	});

	//Menu Toggle Btn
	$('.tgmobile__menu-backdrop, .tgmobile__menu .close-btn').on('click', function () {
		$('body').removeClass('mobile-menu-visible');
	});
};


/*===========================================
	=     Menu sticky & Scroll to top      =
=============================================*/
$(window).on('scroll', function () {
	var scroll = $(window).scrollTop();
	if (scroll < 245) {
		$("#sticky-header").removeClass("sticky-menu");
		$('.scroll-to-target').removeClass('open');
        $("#header-fixed-height").removeClass("active-height");

	} else {
		$("#sticky-header").addClass("sticky-menu");
		$('.scroll-to-target').addClass('open');
        $("#header-fixed-height").addClass("active-height");
	}
});


/*===========================================
	=           Scroll Up  	         =
=============================================*/
if ($('.scroll-to-target').length) {
  $(".scroll-to-target").on('click', function () {
    var target = $(this).attr('data-target');
    // animate
    $('html, body').animate({
      scrollTop: $(target).offset().top
    }, 0);

  });
}


/*===========================================
	=          Data Background    =
=============================================*/
$("[data-background]").each(function () {
	$(this).css("background-image", "url(" + $(this).attr("data-background") + ")")
});

$("[data-bg-color]").each(function () {
	$(this).css("background-color", $(this).attr("data-bg-color"));
});


/*=============================================
	=            Header Search            =
=============================================*/
$(".search-open-btn").on("click", function () {
    $(".search__popup").addClass("search-opened");
    $(".search-popup-overlay").addClass("search-popup-overlay-open");
});
$(".search-close-btn").on("click", function () {
    $(".search__popup").removeClass("search-opened");
    $(".search-popup-overlay").removeClass("search-popup-overlay-open");
});

/*=============================================
=     Offcanvas Menu      =
=============================================*/
$(".menu-tigger").on("click", function () {
	$(".offCanvas__info, .offCanvas__overly").addClass("active");
	return false;
});
$(".menu-close, .offCanvas__overly").on("click", function () {
	$(".offCanvas__info, .offCanvas__overly").removeClass("active");
});



/*=============================================
    =          Swiper active              =
=============================================*/
$('.brand__active, .slider__active, .slider__active-two, .project-active, .testimonial-active , .testimonial-active-two, .brand__active-two, .services__active, .career__active, .shop-active').each(function () {
    var thSlider = $(this);
    var settings = $(this).data('swiper-options') || {};

    var prevArrow = thSlider.find('.slider-prev');
    var nextArrow = thSlider.find('.slider-next');
    var paginationEl1 = thSlider.find('.slider-pagination, .project-pagination, .services-pagination').get(0);
    var paginationEl2 = thSlider.find('.project-pagination2');
    var progressBarEl = thSlider.find('.slider-pagination-progressbar2 .slider-progressbar-fill');

    var sliderDefault = {
        slidesPerView: 1,
        spaceBetween: settings.spaceBetween || 24,
        loop: settings.loop !== false,
        speed: settings.speed || 1000,
        autoplay: settings.autoplay || { delay: 6000, disableOnInteraction: false },
        navigation: {
            prevEl: prevArrow.get(0),
            nextEl: nextArrow.get(0),
        },
        pagination: {
            el: paginationEl1,
            type: settings.paginationType || 'bullets',
            clickable: true,
            renderBullet: function (index, className) {
                var number = index + 1;
                var formattedNumber = number < 10 ? '0' + number : number;
                return '<span class="' + className + '" aria-label="Go to Slide ' + formattedNumber + '"></span>';
            },
        },
        on: {
            init: function () {
                updatePagination(this);
                updateProgressBar(this);
            },
            slideChange: function () {
                updatePagination(this);
                updateProgressBar(this);
            },
        },
    };

    var options = $.extend({}, sliderDefault, settings);
    var swiperInstance = new Swiper(thSlider.get(0), options);

    function updatePagination(swiper) {
        if (paginationEl2.length) {
            var activeIndex = swiper.realIndex + 1;
            var totalSlides = swiper.slides.length;
            paginationEl2.html(
                '<span class="current-slide">' +
                (activeIndex < 10 ? '0' + activeIndex : activeIndex) +
                '</span> <span class="divider">/</span> <span class="total-slides">' +
                (totalSlides < 10 ? '0' + totalSlides : totalSlides) +
                '</span>'
            );
        }
    }

    function updateProgressBar(swiper) {
        if (progressBarEl.length) {
            var progress = ((swiper.realIndex + 1) / swiper.slides.length) * 100;
            progressBarEl.css('height', progress + '%');
        }
    }

    if ($('.slider-area').length > 0) {
        $('.slider-area').closest(".container").parent().addClass("arrow-wrap");
    }
});

function animationProperties() {
    $('[data-ani]').each(function () {
        var animationName = $(this).data('ani');
        $(this).addClass(animationName);
    });

    $('[data-ani-delay]').each(function () {
        var delayTime = $(this).data('ani-delay');
        $(this).css('animation-delay', delayTime);
    });
}
animationProperties();

$('[data-slider-prev], [data-slider-next]').on('click', function () {
    var sliderSelector = $(this).data('slider-prev') || $(this).data('slider-next');
    var targetSlider = $(sliderSelector);

    if (targetSlider.length) {
        var swiper = targetSlider[0].swiper;

        if (swiper) {
            if ($(this).data('slider-prev')) {
                swiper.slidePrev();
            } else {
                swiper.slideNext();
            }
        }
    }
});


/*===========================================
      =       Coupon Active    =
=============================================*/
$('#coupon-element').on('click', function () {
    $('.coupon__code-form').slideToggle(500);
    return false
});

/*=============================================
	=          Active Class               =
=============================================*/
$('.team__item').on('mouseenter', function () {
	$(this).addClass('active').parent().siblings().find('.team__item').removeClass('active');
})



/*=============================================
	=        Counter Up 	       =
=============================================*/
$(".counter-number").counterUp({
    delay: 10,
    time: 2000,
});

/*===========================================
	=         Marquee Active         =
=============================================*/
if ($(".marquee_mode").length) {
    $('.marquee_mode').marquee({
        speed: 50,
        gap: 0,
        delayBeforeStart: 0,
        direction: 'left',
        duplicated: true,
        pauseOnHover: true,
        startVisible:true,
    });
}


/*=============================================
	=        parallaxMouse Active          =
=============================================*/
function parallaxMouse() {
	if ($('.parallax').length) {
		var scene = document.querySelectorAll('.parallax');
		for (var i = 0; i < scene.length; i++) {
			var parallaxInstance = new Parallax(scene[i], {
				relativeInput: true,
				hoverOnly: true,
				selector: '.layer',
				pointerEvents: true,
			});
		}
	};
};
parallaxMouse();


/*===========================================
	=    		 Cart Active  	         =
=============================================*/
$(".cart-plus-minus").append('<div class="dec qtybutton">-</div><div class="inc qtybutton">+</div>');
$(".qtybutton").on("click", function () {
	var $button = $(this);
	var oldValue = $button.parent().find("input").val();
	if ($button.text() == "+") {
		var newVal = parseFloat(oldValue) + 1;
	} else {
		// Don't allow decrementing below zero
		if (oldValue > 0) {
			var newVal = parseFloat(oldValue) - 1;
		} else {
			newVal = 0;
		}
	}
	$button.parent().find("input").val(newVal);
});

/*===========================================
	=        Magnific Popup    =
=============================================*/
$('.popup-image').magnificPopup({
	type: 'image',
	gallery: {
		enabled: true
	}
});

/* magnificPopup video view */
$('.popup-video').magnificPopup({
	type: 'iframe'
});


})(jQuery);