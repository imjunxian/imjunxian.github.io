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
    if (window.scrollY > 0) {
        nav.classList.add("shadow-sm");
    } else {
        nav.classList.remove("shadow-sm");
    }
});

//Resume padding issue in responsive view
$(window).on('resize load', function () {
    if ($(window).width() <= 998) {
        $("#resumeDiv").removeClass("p-3");
        $("#resumeDiv").addClass("pr-3");
    } else {
        $("#resumeDiv").removeClass("pr-3");
        $("#resumeDiv").addClass("p-3");
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

        // Default filter
        var defaultFilter = ".coding";
        $grid.isotope({
            filter: defaultFilter,
        });
    };
    $('.filters ul li').click(function () {
        $('.filters ul li').removeClass('active');
        $(this).addClass('active');

        var data = $(this).attr('data-filter');
        $grid.isotope({
            filter: data,
        });
    });
};
$(window).on('load', function () {
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

// Helper function to parse dates in "MMM YYYY" format
function parseDate(dateText) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let parts = dateText.split(" ");
    
    if (parts.length < 2) return null; // Invalid format
    let monthIndex = months.indexOf(parts[0]); // Convert month name to index
    let year = parseInt(parts[1], 10);

    if (monthIndex === -1 || isNaN(year)) return null; // Invalid month/year
    return new Date(year, monthIndex, 1); // Return first day of the month
}

var dateElements = document.querySelectorAll('.dateText');

dateElements.forEach(function(dateElement) {
    var dateRange = dateElement.textContent.split('-');
    var startDateText = dateRange[0].trim();
    var endDateText = dateRange[1] ? dateRange[1].trim() : 'Present';
    
    var startDate = parseDate(startDateText);
    var endDate = endDateText === 'Present' ? new Date() : parseDate(endDateText);

    if (!startDate || !endDate) {
        console.warn("Invalid date format:", dateElement.textContent);
        return;
    }

    // LinkedIn-style duration calculation
    var durationInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 
                           + (endDate.getMonth() - startDate.getMonth()) 
                           + 1; // Add 1 to include both start & end month

    if (durationInMonths <= 12) {
        dateElement.textContent = `${startDateText} - ${endDateText} (${durationInMonths} mo${durationInMonths === 1 ? '' : 's'})`;
    } else {
        var years = Math.floor(durationInMonths / 12);
        var months = durationInMonths % 12;
        dateElement.textContent = `${startDateText} - ${endDateText} (${years} yr${years === 1 ? '' : 's'}`;
        if (months > 0) {
            dateElement.textContent += ` ${months} mo${months === 1 ? '' : 's'}`;
        }
        dateElement.textContent += ')';
    }
});



//Copyright Year
document.querySelector('#copyright-year').innerText = new Date().getFullYear();
