// static/admin/shared/navbar/navbar.js
// 🧠 ChartFly NavBar Script | Highlights current section

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".nav-links a");
  links.forEach((link) => {
    if (window.location.hash && link.href.includes(window.location.hash)) {
      link.classList.add("active");
    }
  });
});
