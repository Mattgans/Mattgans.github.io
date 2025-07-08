// Mobile Navigation Toggle
const hamburger = document.getElementById("hamburger")
const navMenu = document.getElementById("nav-menu")

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active")
  navMenu.classList.toggle("active")
})

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
  })
})

// Navbar scroll effect
const navbar = document.getElementById("navbar")
let lastScrollTop = 0

window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  if (scrollTop > 100) {
    navbar.classList.add("scrolled")
  } else {
    navbar.classList.remove("scrolled")
  }

  lastScrollTop = scrollTop
})

// Active navigation link highlighting
const sections = document.querySelectorAll("section")
const navLinks = document.querySelectorAll(".nav-link")

function updateActiveNavLink() {
  let current = ""

  sections.forEach((section) => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.clientHeight

    if (window.pageYOffset >= sectionTop - 200) {
      current = section.getAttribute("id")
    }
  })

  navLinks.forEach((link) => {
    link.classList.remove("active")
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active")
    }
  })
}

window.addEventListener("scroll", updateActiveNavLink)
window.addEventListener("load", updateActiveNavLink)

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))

    if (target) {
      const offsetTop = target.offsetTop - 80 // Account for fixed navbar

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
  })
})

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in-up")
    }
  })
}, observerOptions)

// Observe elements for animation
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(".project-card, .skill-category, .timeline-item, .education-card")

  animatedElements.forEach((el) => {
    observer.observe(el)
  })
})

// Typing effect for hero title (optional enhancement)
function typeWriter(element, text, speed = 100) {
  let i = 0
  element.innerHTML = ""

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i)
      i++
      setTimeout(type, speed)
    }
  }

  type()
}

// Enhanced scroll performance
let ticking = false

function updateScrollEffects() {
  updateActiveNavLink()
  ticking = false
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollEffects)
    ticking = true
  }
})

// Keyboard navigation support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navMenu.classList.contains("active")) {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
  }
})

// Contact method click tracking (for analytics if needed)
document.querySelectorAll(".contact-method").forEach((method) => {
  method.addEventListener("click", (e) => {
    const contactType = e.currentTarget.querySelector("h4").textContent
    console.log(`Contact method clicked: ${contactType}`)
    // Add analytics tracking here if needed
  })
})

// Preload critical resources
function preloadResources() {
  const criticalImages = [
    // Add any critical images here
  ]

  criticalImages.forEach((src) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "image"
    link.href = src
    document.head.appendChild(link)
  })
}

// Initialize on DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  preloadResources()

  // Add loading class removal after page load
  window.addEventListener("load", () => {
    document.body.classList.add("loaded")
  })
})

// Error handling for external links
document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    try {
      // Add any external link tracking here
      console.log(`External link clicked: ${link.href}`)
    } catch (error) {
      console.error("Error tracking external link:", error)
    }
  })
})

// Performance monitoring
if ("performance" in window) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType("navigation")[0]
      console.log("Page load time:", perfData.loadEventEnd - perfData.loadEventStart, "ms")
    }, 0)
  })
}
