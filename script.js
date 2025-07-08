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
function typeWriterHeroTitle(element, text, speed = 100) {
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

// Scroll progress indicator
const scrollProgress = document.getElementById("scroll-progress")

function updateScrollProgress() {
  const scrollTop = window.pageYOffset
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const scrollPercent = (scrollTop / docHeight) * 100
  scrollProgress.style.width = scrollPercent + "%"
}

window.addEventListener("scroll", updateScrollProgress)

// Typing effect for hero name
function typeWriterHeroName(element, text, speed = 150) {
  element.classList.remove("typing-cursor")
  element.innerHTML = ""
  let i = 0

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i)
      i++
      setTimeout(type, speed)
    } else {
      element.classList.add("typing-cursor")
    }
  }

  type()
}

// Initialize typing effect
window.addEventListener("load", () => {
  const typingElement = document.getElementById("typing-name")
  if (typingElement) {
    setTimeout(() => {
      typeWriterHeroName(typingElement, "Matthew Shang", 100)
    }, 1000)
  }
})

// Enhanced intersection observer for stagger animations
const staggerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate")
      }
    })
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  },
)

// Observe stagger elements
document.addEventListener("DOMContentLoaded", () => {
  const staggerElements = document.querySelectorAll(".stagger-animation")
  staggerElements.forEach((el) => staggerObserver.observe(el))
})

// Section title animation observer
const titleObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate")
      }
    })
  },
  {
    threshold: 0.5,
  },
)

document.querySelectorAll(".section-title").forEach((title) => {
  titleObserver.observe(title)
})

// Enhanced project card interactions
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-10px) rotateX(5deg) scale(1.02)"
  })

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0) rotateX(0) scale(1)"
  })
})

// Parallax effect for hero section
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset
  const hero = document.querySelector(".hero")
  const particles = document.querySelectorAll(".particle")

  if (hero) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`
  }

  particles.forEach((particle, index) => {
    const speed = (index + 1) * 0.1
    particle.style.transform = `translateY(${scrolled * speed}px)`
  })
})

// Dynamic skill tag animations
document.querySelectorAll(".skill-tag").forEach((tag, index) => {
  tag.addEventListener("mouseenter", () => {
    // Add ripple effect
    const ripple = document.createElement("span")
    ripple.style.position = "absolute"
    ripple.style.borderRadius = "50%"
    ripple.style.background = "rgba(59, 130, 246, 0.6)"
    ripple.style.transform = "scale(0)"
    ripple.style.animation = "ripple 0.6s linear"
    ripple.style.left = "50%"
    ripple.style.top = "50%"
    ripple.style.width = "20px"
    ripple.style.height = "20px"
    ripple.style.marginLeft = "-10px"
    ripple.style.marginTop = "-10px"

    tag.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  })
})

// Add ripple animation CSS
const rippleStyle = document.createElement("style")
rippleStyle.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`
document.head.appendChild(rippleStyle)

// Enhanced contact method interactions
document.querySelectorAll(".contact-method").forEach((method) => {
  method.addEventListener("mouseenter", (e) => {
    const rect = method.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = method.querySelector("::before")
    method.style.setProperty("--x", x + "px")
    method.style.setProperty("--y", y + "px")
  })
})

// Smooth reveal animations for timeline items
const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateX(0)"
        }, index * 200)
      }
    })
  },
  { threshold: 0.3 },
)

document.querySelectorAll(".timeline-item").forEach((item, index) => {
  item.style.opacity = "0"
  item.style.transform = index % 2 === 0 ? "translateX(-50px)" : "translateX(50px)"
  item.style.transition = "all 0.6s ease"
  timelineObserver.observe(item)
})

// Dynamic navbar background based on scroll position
let lastScrollY = window.scrollY
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY
  const navbar = document.getElementById("navbar")

  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    navbar.style.transform = "translateY(-100%)"
  } else {
    navbar.style.transform = "translateY(0)"
  }

  lastScrollY = currentScrollY
})

// Add floating animation to achievement badges
document.querySelectorAll(".achievement-badge").forEach((badge, index) => {
  badge.style.animation = `float 3s ease-in-out infinite ${index * 0.5}s`
})

// Enhanced mobile menu with slide animation
const mobileMenuToggle = () => {
  const navMenu = document.getElementById("nav-menu")
  const hamburger = document.getElementById("hamburger")

  navMenu.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"

  if (navMenu.classList.contains("active")) {
    navMenu.style.transform = "translateX(0)"
  } else {
    navMenu.style.transform = "translateX(-100%)"
  }
}

// Performance optimized scroll handler
let scrollTimeout
window.addEventListener("scroll", () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  scrollTimeout = setTimeout(() => {
    updateScrollProgress()
    updateActiveNavLink()
  }, 10)
})

// Add loading animation
window.addEventListener("load", () => {
  document.body.style.opacity = "0"
  document.body.style.transition = "opacity 0.5s ease"

  setTimeout(() => {
    document.body.style.opacity = "1"
  }, 100)
})
