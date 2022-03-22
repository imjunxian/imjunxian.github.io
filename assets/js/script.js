//Scrolling Nav auto hover
$("body").scrollspy({
    target: "#navBar-main",
    offset: 85,
});
$(".js-scroll-trigger").click(function () {
    $(".navbar-collapse").collapse("hide");
});

//scroll and navbar shadow appear
window.addEventListener('scroll', (e) => {
    const nav = document.querySelector('#navBar-main');
    if (window.pageYOffset > 0) {
        nav.classList.add("shadow-sm");
    } else {
        nav.classList.remove("shadow-sm");
    }
});

//Resume padding issue in responsive view
$(window).on('resize load', function () {
    if ($(window).width() <= 998) {
        $("#resumeDiv").removeClass("p-4");
        $("#resumeDiv").addClass("pr-4");
    } else {
        $("#resumeDiv").removeClass("pr-4");
        $("#resumeDiv").addClass("p-4");
    }
});

//Hamburger (responsive navbar)
const hamburgerBtn = document.querySelector(".hamburger-button")
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".navbar-nav");
hamburgerBtn.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});
//Click on dropdown navigation
document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));
//Click on logo
document.querySelectorAll(".navbar-brand").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));

//Scroll Top Button
var scrollbutton = document.getElementById("scrollBtn");
window.onscroll = function () {
    scrollFunction();
};
function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollbutton.style.display = "block";
    } else {
        scrollbutton.style.display = "none";
    }
}
function topFunction() {
    $('html, body').animate({ scrollTop: 0 }, 150);
}


//Filter Portfolio Category
var portfolioFilter = function () {
    if (document.getElementById("portfolio")) {
        var $grid = $(".grid").isotope({
            itemSelector: ".portfolio-card",
            layoutMode: 'fitRows',
            percentPosition: false,
            masonry: {
                columnWidth: ".portfolio-card",
            },
        });
    };
    $('.filters ul li').click(function () {
        $('.filters ul li').removeClass('active');
        $(this).addClass('active');

        var data = $(this).attr('data-filter');
        $grid.isotope({
            filter: data,
        });
        setTimeout(function () { grid.isotope('layout') }, 300);
    });
};
$(function () {
    portfolioFilter();
});

//Auto fade-in while on scrolling
AOS.init();
//Additional right space issue fixed on mobile view
$('[data-aos]').parent().addClass('hideOverflowOnMobile');

//Carousel (Portfolio)
$('.carousel').carousel({
    interval: 5000,
    cycle: true
});

//Prevent Content Move while Modal Pop Up
$(document).ready(function () {
    $('.modal').on('show.bs.modal', function () {
        if ($(document).height() > $(window).height()) {
            // no-scroll
            $('body').addClass("modal-open-noscroll");
        }
        else {
            $('body').removeClass("modal-open-noscroll");
        }
    });
    $('.modal').on('hide.bs.modal', function () {
        $('body').removeClass("modal-open-noscroll");
    });
});

//Copyright Year
document.querySelector('#copyright-year').innerText = new Date().getFullYear();
