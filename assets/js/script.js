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

// Helper function to parse dates reliably
function parseDate(dateText) {
    const months = {
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
        "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };

    let parts = dateText.trim().split(/\s+/); // Split by space (handles extra spaces)
    
    if (parts.length !== 2) return null; // Ensure "MMM YYYY" format

    let monthIndex = months[parts[0]];
    let year = parseInt(parts[1], 10);

    if (monthIndex === undefined || isNaN(year)) return null; // Invalid date

    return new Date(year, monthIndex, 1); // Return the first day of the month
}

// Process all date elements
document.querySelectorAll('.dateText').forEach(function(dateElement) {
    let dateRange = dateElement.textContent.split('-').map(d => d.trim());
    let startDateText = dateRange[0];
    let endDateText = dateRange[1] || 'Present';

    let startDate = parseDate(startDateText);
    let endDate = endDateText === 'Present' ? new Date() : parseDate(endDateText);

    if (!startDate || !endDate) {
        console.warn("Invalid date format detected:", dateElement.textContent);
        return;
    }

    // Linkedin style duration calculation
    let durationInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12
                         + (endDate.getMonth() - startDate.getMonth())
                         + 1; // Include both start & end months

    // Format the duration text
    let durationText = durationInMonths <= 12 
        ? `${durationInMonths} mo${durationInMonths === 1 ? '' : 's'}`
        : `${Math.floor(durationInMonths / 12)} yr${Math.floor(durationInMonths / 12) === 1 ? '' : 's'}`
            + (durationInMonths % 12 > 0 ? ` ${durationInMonths % 12} mo` : '');

    // Update the element with the LinkedIn-style duration
    dateElement.textContent = `${startDateText} - ${endDateText} (${durationText})`;
});



//Copyright Year
document.querySelector('#copyright-year').innerText = new Date().getFullYear();
