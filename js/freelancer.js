/*
 * Start Bootstrap - Freelancer Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * Adaptación de la navegación de la plantilla docente.
 */
$(function () {
    $('body').on('click', '.page-scroll a, .navbar-brand', function (event) {
        var destino = document.getElementById(this.hash.slice(1));
        if (!destino) return;
        var menu = $('.navbar-collapse');
        if (menu.hasClass('in')) menu.collapse('hide');
        var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var altura = $('.navbar-fixed-top').outerHeight() || 0;
        $('html, body').stop().animate({
            scrollTop: Math.max(0, $(destino).offset().top - altura)
        }, reducir ? 0 : 350, 'swing');
        event.preventDefault();
    });

    $('body').on('input focusin focusout', '.floating-label-form-group input', function () {
        var grupo = $(this).closest('.floating-label-form-group');
        grupo.toggleClass('floating-label-form-group-with-value', !!$(this).val());
        grupo.toggleClass('floating-label-form-group-with-focus', $(this).is(':focus'));
    });

    $('body').scrollspy({ target: '.navbar-fixed-top' });
});
