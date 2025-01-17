        // JavaScript to hide icon names initially
        document.addEventListener('DOMContentLoaded', function() {
            var icons = document.querySelectorAll('.material-symbols-outlined');
            icons.forEach(function(icon) {
                icon.style.visibility = 'hidden';
            });
        });

        // JavaScript to show icons after they have loaded
        window.addEventListener('load', function() {
            var icons = document.querySelectorAll('.material-symbols-outlined');
            icons.forEach(function(icon) {
                icon.style.visibility = 'visible';
            });
        });


