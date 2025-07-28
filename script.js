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

// Optimized scroll handler with throttling
let isScrolling = false
let lastScrollTop = 0

function handleScroll() {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const navbar = document.getElementById("navbar")
      
      // Navbar scroll effect
      if (scrollTop > 100) {
        navbar.classList.add("scrolled")
      } else {
        navbar.classList.remove("scrolled")
      }

      // Update scroll progress
      updateScrollProgress()
      
      // Update active nav link
      updateActiveNavLink()
      
      lastScrollTop = scrollTop
      isScrolling = false
    })
    isScrolling = true
  }
}

window.addEventListener("scroll", handleScroll, { passive: true })

// Active navigation link highlighting - Fixed offset calculation
const sections = document.querySelectorAll("section")
const navLinks = document.querySelectorAll(".nav-link")

function updateActiveNavLink() {
  let current = ""
  const navbarHeight = document.getElementById("navbar").offsetHeight

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - navbarHeight - 100 // Increased offset
    const sectionBottom = sectionTop + section.offsetHeight

    if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
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

// Fixed smooth scrolling for navigation links - MAIN FIX HERE
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const targetId = this.getAttribute("href").substring(1)
    const target = document.getElementById(targetId)

    if (target) {
      const navbarHeight = document.getElementById("navbar").offsetHeight
      // Increased offset to ensure content is not hidden behind navbar
      const offsetTop = target.offsetTop - navbarHeight - 50 // Increased from 20 to 50

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      })
    }
  })
})

// Intersection Observer for animations - Optimized
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in-up")
      // Stop observing once animated to improve performance
      observer.unobserve(entry.target)
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

// Keyboard navigation support
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navMenu.classList.contains("active")) {
    hamburger.classList.remove("active")
    navMenu.classList.remove("active")
  }
})

// Contact method click tracking
document.querySelectorAll(".contact-method").forEach((method) => {
  method.addEventListener("click", (e) => {
    const contactType = e.currentTarget.querySelector("h4").textContent
    console.log(`Contact method clicked: ${contactType}`)
  })
})

// Scroll progress indicator - Fixed calculation
function updateScrollProgress() {
  const scrollProgress = document.getElementById("scroll-progress")
  if (scrollProgress) {
    const scrollTop = window.pageYOffset
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100)
    scrollProgress.style.width = scrollPercent + "%"
  }
}

// Typing effect for hero name - Improved
function typeWriterHeroName(element, text, speed = 150) {
  if (!element) return
  
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
        staggerObserver.unobserve(entry.target)
      }
    })
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  },
)

// Section title animation observer
const titleObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate")
        titleObserver.unobserve(entry.target)
      }
    })
  },
  {
    threshold: 0.5,
  },
)

// Initialize observers on DOM load
document.addEventListener("DOMContentLoaded", () => {
  // Observe stagger elements
  const staggerElements = document.querySelectorAll(".stagger-animation")
  staggerElements.forEach((el) => staggerObserver.observe(el))

  // Observe section titles
  document.querySelectorAll(".section-title").forEach((title) => {
    titleObserver.observe(title)
  })
})

// Enhanced project card interactions - Throttled
let cardAnimationFrame
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    if (cardAnimationFrame) cancelAnimationFrame(cardAnimationFrame)
    cardAnimationFrame = requestAnimationFrame(() => {
      card.style.transform = "translateY(-10px) rotateX(5deg) scale(1.02)"
    })
  })

  card.addEventListener("mouseleave", () => {
    if (cardAnimationFrame) cancelAnimationFrame(cardAnimationFrame)
    cardAnimationFrame = requestAnimationFrame(() => {
      card.style.transform = "translateY(0) rotateX(0) scale(1)"
    })
  })
})

// Optimized parallax effect - Throttled
let parallaxFrame
function handleParallax() {
  if (!parallaxFrame) {
    parallaxFrame = requestAnimationFrame(() => {
      const scrolled = window.pageYOffset
      const hero = document.querySelector(".hero")
      const particles = document.querySelectorAll(".particle")

      if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`
      }

      particles.forEach((particle, index) => {
        if (scrolled < window.innerHeight) {
          const speed = (index + 1) * 0.05
          particle.style.transform = `translateY(${scrolled * speed}px)`
        }
      })

      parallaxFrame = null
    })
  }
}

window.addEventListener("scroll", handleParallax, { passive: true })

// Dynamic skill tag animations with ripple effect
document.querySelectorAll(".skill-tag").forEach((tag) => {
  tag.addEventListener("mouseenter", (e) => {
    // Remove existing ripples
    const existingRipples = tag.querySelectorAll(".ripple")
    existingRipples.forEach(ripple => ripple.remove())

    // Add ripple effect
    const ripple = document.createElement("span")
    ripple.className = "ripple"
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
    ripple.style.pointerEvents = "none"

    tag.style.position = "relative"
    tag.appendChild(ripple)

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.remove()
      }
    }, 600)
  })
})

// Add ripple animation CSS if not exists
if (!document.querySelector("#ripple-styles")) {
  const rippleStyle = document.createElement("style")
  rippleStyle.id = "ripple-styles"
  rippleStyle.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(rippleStyle)
}

// Smooth reveal animations for timeline items - Fixed
const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const items = Array.from(document.querySelectorAll(".timeline-item"))
        const index = items.indexOf(entry.target)
        
        setTimeout(() => {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateX(0)"
        }, index * 150)
        
        timelineObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.2 }
)

// Initialize timeline animations
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".timeline-item").forEach((item, index) => {
    item.style.opacity = "0"
    item.style.transform = index % 2 === 0 ? "translateX(-30px)" : "translateX(30px)"
    item.style.transition = "all 0.6s ease"
    timelineObserver.observe(item)
  })
})

// Performance monitoring
if ("performance" in window) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType("navigation")[0]
      if (perfData) {
        console.log("Page load time:", perfData.loadEventEnd - perfData.loadEventStart, "ms")
      }
    }, 0)
  })
}

// Enhanced loading animation
window.addEventListener("load", () => {
  document.body.style.opacity = "1"
  document.body.classList.add("loaded")
})

// Error handling for external links
document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    try {
      console.log(`External link clicked: ${link.href}`)
    } catch (error) {
      console.error("Error tracking external link:", error)
    }
  })
})

// Cleanup function for better memory management
window.addEventListener("beforeunload", () => {
  // Cancel any pending animation frames
  if (cardAnimationFrame) cancelAnimationFrame(cardAnimationFrame)
  if (parallaxFrame) cancelAnimationFrame(parallaxFrame)
})