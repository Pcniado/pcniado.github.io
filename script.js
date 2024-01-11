document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('nav a');
    const contentContainer = document.getElementById('content');
  
    navLinks.forEach(link => {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        loadTabContent(link.href);
      });
    });
  
    function loadTabContent(url) {
      fetch(url)
        .then(response => response.text())
        .then(html => {
          contentContainer.innerHTML = html;
        })
        .catch(error => console.error('Error loading content:', error));
    }
  });
  