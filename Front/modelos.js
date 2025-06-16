document.addEventListener("DOMContentLoaded", () => {
  // Initialize the app
  const app = new App()
  app.init()
})

class App {
  constructor() {
    // DOM Elements
    this.mainContent = document.getElementById("mainContent")
    this.navLinks = document.querySelectorAll("nav ul li a") // Modificado para coincidir con el menú de navegación en modelos.html
    this.categoryItems = document.querySelectorAll(".menusidebar .productos") // Modificado para coincidir con la sidebar en modelos.html
    this.mobileMenuToggle = document.querySelector(".mobile-menu-toggle") // Modificado para coincidir con el botón móvil si existe
    this.sidebar = document.getElementById("menusidebar")
    this.closeSidebar = document.getElementById("cerrarsidebar")

    // State
    this.currentSection = "tienda"
    this.currentCategory = "todos"
    this.currentProductId = null

    // Templates
    this.templates = {
      inicio: document.getElementById("inicio-template"),
      servicios: document.getElementById("servicios-template"),
      personalizacion: document.getElementById("personalizacion-template"),
      tienda: document.getElementById("ventanas-template"), // Modificado para coincidir con el id en modelos.html
      contacto: document.getElementById("contacto-template"),
      productoDetalle: document.getElementById("producto-detalle-template"),
    }

    // Local Storage Keys
    this.STORAGE_SECTION_KEY = "la-cosita-current-section"
    this.STORAGE_CATEGORY_KEY = "la-cosita-current-category"

    // Productos (simulando una base de datos)
    this.productos = [
      {
        id: 1,
        nombre: "Cristal Cuadrado con Base",
        categoria: "cristales",
        precio: 20400,
        precioMin: 16900,
        precioMax: 23900,
        imagen: "/placeholder.svg?height=400&width=400",
        oferta: false,
        descripcion:
          "Elegante cristal cuadrado con base de madera, perfecto para decoración de interiores. Disponible en varios tamaños y acabados.",
        sku: "CR-001",
        especificaciones: {
          dimensiones: "10 × 10 × 15 cm",
          material: "Cristal / Madera",
          color: "Transparente",
          peso: "0.8 kg",
        },
        opiniones: [
          { nombre: "Carlos Rodríguez", estrellas: 5, comentario: "Excelente calidad, muy elegante." },
          { nombre: "Ana Martínez", estrellas: 4, comentario: "Bonito diseño, aunque un poco frágil." },
        ],
      },
      {
        id: 2,
        nombre: "Hello Kitty",
        categoria: "juguetes",
        precio: 9600,
        precioOriginal: 12000,
        imagen: "/placeholder.svg?height=400&width=400",
        oferta: true,
        descripcion:
          "Figura coleccionable de Hello Kitty en traje tradicional. Edición limitada con detalles de alta calidad.",
        sku: "JG-002",
        especificaciones: {
          dimensiones: "15 × 8 × 5 cm",
          material: "Plástico",
          color: "Rojo / Blanco",
          peso: "0.3 kg",
        },
        opiniones: [
          { nombre: "Laura Sánchez", estrellas: 5, comentario: "A mi hija le encantó, muy bonito." },
          { nombre: "Pedro Gómez", estrellas: 5, comentario: "Excelente calidad, los detalles son perfectos." },
        ],
      },
      {
        id: 3,
        nombre: "Lego",
        categoria: "juguetes",
        precio: 14990,
        precioOriginal: 19990,
        imagen: "/placeholder.svg?height=400&width=400",
        oferta: true,
        descripcion:
          "Set de Lego con más de 500 piezas para construir una ciudad medieval. Incluye 5 minifiguras y accesorios.",
        sku: "JG-003",
        especificaciones: {
          dimensiones: "38 × 26 × 8 cm (caja)",
          material: "Plástico ABS",
          color: "Multicolor",
          peso: "1.2 kg",
        },
        opiniones: [
          {
            nombre: "Miguel Torres",
            estrellas: 4,
            comentario: "Muy entretenido, aunque faltan algunas instrucciones.",
          },
          { nombre: "Sofía Vargas", estrellas: 5, comentario: "Excelente set, mi hijo pasó horas armándolo." },
        ],
      },
    ]
  }

  init() {
    // Load saved state from localStorage
    this.loadSavedState()

    // Load initial content
    if (this.currentProductId) {
      this.loadProductDetail(this.currentProductId)
    } else {
      this.loadContent(this.currentSection)
    }

    // Set up event listeners
    this.setupEventListeners()
  }

  loadSavedState() {
    // Load saved section
    const savedSection = localStorage.getItem(this.STORAGE_SECTION_KEY)
    if (savedSection) {
      this.currentSection = savedSection
    }

    // Load saved category
    const savedCategory = localStorage.getItem(this.STORAGE_CATEGORY_KEY)
    if (savedCategory) {
      this.currentCategory = savedCategory
    }

    // Load saved product ID
    const savedProductId = localStorage.getItem("la-cosita-current-product")
    if (savedProductId) {
      this.currentProductId = Number.parseInt(savedProductId)
    }

    // Update UI to reflect saved state
    this.navLinks.forEach((link) => {
      if (link.getAttribute("href") && link.getAttribute("href").includes(this.currentSection)) {
        link.classList.add("active")
      } else {
        link.classList.remove("active")
      }
    })

    this.categoryItems.forEach((item) => {
      if (item.dataset.category === this.currentCategory) {
        item.classList.add("active")
      } else {
        item.classList.remove("active")
      }
    })
  }

  setupEventListeners() {
    // Navigation menu links
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const section = link.dataset.section
        this.handleNavigation(section)
      })
    })

    // Category items
    this.categoryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const category = item.dataset.category
        this.handleCategoryChange(category)
      })
    })

    // Mobile menu toggle
    this.mobileMenuToggle.addEventListener("click", () => {
      this.navMenu.classList.toggle("show")

      // Toggle hamburger animation
      const bars = this.mobileMenuToggle.querySelectorAll(".bar")
      bars[0].style.transform =
        bars[0].style.transform === "rotate(-45deg) translate(-5px, 6px)" ? "" : "rotate(-45deg) translate(-5px, 6px)"
      bars[1].style.opacity = bars[1].style.opacity === "0" ? "1" : "0"
      bars[2].style.transform =
        bars[2].style.transform === "rotate(45deg) translate(-5px, -6px)" ? "" : "rotate(45deg) translate(-5px, -6px)"
    })

    // Sidebar toggle for mobile
    document.addEventListener("click", (e) => {
      if (e.target.closest(".category-item") || window.innerWidth > 768) return

      if (e.target.closest(".sidebar")) {
        // Clicked inside sidebar, do nothing
      } else {
        // Clicked outside sidebar, close it on mobile
        if (window.innerWidth <= 768) {
          this.sidebar.classList.remove("show")
        }
      }
    })

    // Close sidebar button
    this.closeSidebar.addEventListener("click", () => {
      this.sidebar.classList.remove("show")
    })

    // Toggle sidebar on mobile
    const sidebarToggle = document.createElement("button")
    sidebarToggle.className = "sidebar-toggle"
    sidebarToggle.innerHTML = "☰ Categorías"
    sidebarToggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #805ad5;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 20px;
            font-weight: 600;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            z-index: 100;
            display: none;
        `

    document.body.appendChild(sidebarToggle)

    sidebarToggle.addEventListener("click", () => {
      this.sidebar.classList.add("show")
    })

    // Show/hide sidebar toggle based on screen size
    const updateSidebarToggleVisibility = () => {
      if (window.innerWidth <= 768) {
        sidebarToggle.style.display = "block"
      } else {
        sidebarToggle.style.display = "none"
        this.sidebar.classList.remove("show")
      }
    }

    window.addEventListener("resize", updateSidebarToggleVisibility)
    updateSidebarToggleVisibility()
  }

  handleNavigation(section) {
    // Update active link
    this.navLinks.forEach((link) => {
      if (link.dataset.section === section) {
        link.classList.add("active")
      } else {
        link.classList.remove("active")
      }
    })

    // Close mobile menu if open
    this.navMenu.classList.remove("show")

    // Reset hamburger icon
    const bars = this.mobileMenuToggle.querySelectorAll(".bar")
    bars[0].style.transform = ""
    bars[1].style.opacity = "1"
    bars[2].style.transform = ""

    // Update current section
    this.currentSection = section

    // Clear current product
    this.currentProductId = null
    localStorage.removeItem("la-cosita-current-product")

    // Save to localStorage
    localStorage.setItem(this.STORAGE_SECTION_KEY, section)

    // Load content
    this.loadContent(section)
  }

  handleCategoryChange(category) {
    // Update active category
    this.categoryItems.forEach((item) => {
      if (item.dataset.category === category) {
        item.classList.add("active")
      } else {
        item.classList.remove("active")
      }
    })

    // Update current category
    this.currentCategory = category

    // Save to localStorage
    localStorage.setItem(this.STORAGE_CATEGORY_KEY, category)

    // If we're not in the tienda section, navigate there
    if (this.currentSection !== "tienda") {
      this.handleNavigation("tienda")
    } else {
      // Filter products based on category
      this.filterProducts()
    }

    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      this.sidebar.classList.remove("show")
    }
  }

  loadContent(section) {
    // Clear current content with fade out effect
    this.mainContent.style.opacity = "0"

    setTimeout(() => {
      // Get template content
      const template = this.templates[section]
      if (!template) return

      // Clone template content
      const content = template.content.cloneNode(true)

      // Clear and append new content
      this.mainContent.innerHTML = ""
      this.mainContent.appendChild(content)

      // Apply fade in effect
      this.mainContent.classList.add("fade-in")
      this.mainContent.style.opacity = "1"

      // If tienda section, filter products
      if (section === "tienda") {
        this.filterProducts()
        this.setupProductSearch()
        this.setupProductClickHandlers()
      }

      // Add event listeners to dynamic content
      this.setupDynamicEventListeners()
    }, 200) // Short delay for fade out effect
  }

  loadProductDetail(productId) {
    // Find the product
    const producto = this.productos.find((p) => p.id === Number.parseInt(productId))
    if (!producto) {
      this.handleNavigation("tienda")
      return
    }

    // Update current product ID
    this.currentProductId = producto.id
    localStorage.setItem("la-cosita-current-product", producto.id)

    // Clear current content with fade out effect
    this.mainContent.style.opacity = "0"

    setTimeout(() => {
      // Get template content
      const template = this.templates.productoDetalle
      if (!template) return

      // Clone template content
      const content = template.content.cloneNode(true)

      // Update content with product details
      content.querySelector(".producto-titulo").textContent = producto.nombre
      content.querySelector(".producto-titulo-detalle").textContent = producto.nombre

      const imgPrincipal = content.querySelector(".producto-img-principal")
      imgPrincipal.src = producto.imagen
      imgPrincipal.alt = producto.nombre

      const ofertaBadge = content.querySelector(".oferta-badge")
      if (!producto.oferta) {
        ofertaBadge.style.display = "none"
      }

      const precioOriginal = content.querySelector(".precio-original")
      const precioActual = content.querySelector(".precio-actual")

      if (producto.precioOriginal) {
        precioOriginal.textContent = `$${producto.precioOriginal.toLocaleString()}`
        precioActual.textContent = `$${producto.precio.toLocaleString()}`
      } else if (producto.precioMin && producto.precioMax) {
        precioOriginal.style.display = "none"
        precioActual.textContent = `$${producto.precioMin.toLocaleString()} – $${producto.precioMax.toLocaleString()}`
      } else {
        precioOriginal.style.display = "none"
        precioActual.textContent = `$${producto.precio.toLocaleString()}`
      }

      content.querySelector(".producto-descripcion p").textContent = producto.descripcion
      content.querySelector(".producto-categoria span").textContent = this.getCategoryName(producto.categoria)
      content.querySelector(".producto-sku span").textContent = producto.sku

      // Update tab content if we have specific product data
      if (producto.especificaciones) {
        const especificacionesTab = content.querySelector('.tab-panel[data-tab="especificaciones"]')
        const table = especificacionesTab.querySelector(".specs-table")
        table.innerHTML = ""

        for (const [key, value] of Object.entries(producto.especificaciones)) {
          const row = document.createElement("tr")
          const th = document.createElement("th")
          th.textContent = this.capitalizeFirstLetter(key)
          const td = document.createElement("td")
          td.textContent = value
          row.appendChild(th)
          row.appendChild(td)
          table.appendChild(row)
        }
      }

      if (producto.opiniones) {
        const opinionesTab = content.querySelector('.tab-panel[data-tab="opiniones"]')
        opinionesTab.innerHTML = ""

        producto.opiniones.forEach((opinion) => {
          const opinionDiv = document.createElement("div")
          opinionDiv.className = "opinion"

          const header = document.createElement("div")
          header.className = "opinion-header"

          const nombre = document.createElement("strong")
          nombre.textContent = opinion.nombre

          const estrellas = document.createElement("div")
          estrellas.className = "estrellas"
          estrellas.textContent = "★".repeat(opinion.estrellas) + "☆".repeat(5 - opinion.estrellas)

          header.appendChild(nombre)
          header.appendChild(estrellas)

          const comentario = document.createElement("p")
          comentario.textContent = opinion.comentario

          opinionDiv.appendChild(header)
          opinionDiv.appendChild(comentario)

          opinionesTab.appendChild(opinionDiv)
        })
      }

      // Load related products
      const relacionadosGrid = content.querySelector(".relacionados-grid")
      const productosRelacionados = this.getRelatedProducts(producto.id, producto.categoria)

      productosRelacionados.forEach((prod) => {
        const card = document.createElement("div")
        card.className = "product-card"
        card.dataset.id = prod.id

        let priceHTML = ""
        if (prod.precioOriginal) {
          priceHTML = `
            <span class="original-price">$${prod.precioOriginal.toLocaleString()}</span>
            <span class="sale-price">$${prod.precio.toLocaleString()}</span>
          `
        } else if (prod.precioMin && prod.precioMax) {
          priceHTML = `<span class="price-range">$${prod.precioMin.toLocaleString()} – $${prod.precioMax.toLocaleString()}</span>`
        } else {
          priceHTML = `<span class="price-range">$${prod.precio.toLocaleString()}</span>`
        }

        card.innerHTML = `
          <div class="product-image">
            ${prod.oferta ? '<span class="sale-badge">¡Oferta!</span>' : ""}
            <img src="${prod.imagen}" alt="${prod.nombre}" class="product-img">
          </div>
          <div class="product-info">
            <h3 class="product-title">${prod.nombre}</h3>
            <div class="product-price">
              ${priceHTML}
            </div>
          </div>
        `

        relacionadosGrid.appendChild(card)

        // Add click handler
        card.addEventListener("click", () => {
          this.loadProductDetail(prod.id)
        })
      })

      // Clear and append new content
      this.mainContent.innerHTML = ""
      this.mainContent.appendChild(content)

      // Apply fade in effect
      this.mainContent.classList.add("fade-in")
      this.mainContent.style.opacity = "1"

      // Setup event listeners for the product detail page
      this.setupProductDetailEventListeners()
    }, 200) // Short delay for fade out effect
  }

  setupProductDetailEventListeners() {
    // Back button
    const volverButton = this.mainContent.querySelector(".volver-button")
    if (volverButton) {
      volverButton.addEventListener("click", () => {
        this.currentProductId = null
        localStorage.removeItem("la-cosita-current-product")
        this.loadContent("tienda")
      })
    }

    // Tienda link in breadcrumb
    const tiendaLink = this.mainContent.querySelector(".tienda-link")
    if (tiendaLink) {
      tiendaLink.addEventListener("click", (e) => {
        e.preventDefault()
        this.currentProductId = null
        localStorage.removeItem("la-cosita-current-product")
        this.loadContent("tienda")
      })
    }

    // Tab buttons
    const tabButtons = this.mainContent.querySelectorAll(".tab-button")
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.dataset.tab

        // Update active tab button
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        // Update active tab panel
        const tabPanels = this.mainContent.querySelectorAll(".tab-panel")
        tabPanels.forEach((panel) => {
          if (panel.dataset.tab === tab) {
            panel.classList.add("active")
          } else {
            panel.classList.remove("active")
          }
        })
      })
    })

    // Quantity controls
    const minusButton = this.mainContent.querySelector(".cantidad-menos")
    const plusButton = this.mainContent.querySelector(".cantidad-mas")
    const quantityInput = this.mainContent.querySelector("#cantidad")

    if (minusButton && plusButton && quantityInput) {
      minusButton.addEventListener("click", () => {
        const currentValue = Number.parseInt(quantityInput.value)
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1
        }
      })

      plusButton.addEventListener("click", () => {
        const currentValue = Number.parseInt(quantityInput.value)
        if (currentValue < 10) {
          quantityInput.value = currentValue + 1
        }
      })

      quantityInput.addEventListener("change", () => {
        let value = Number.parseInt(quantityInput.value)
        if (isNaN(value) || value < 1) {
          value = 1
        } else if (value > 10) {
          value = 10
        }
        quantityInput.value = value
      })
    }

    // Add to cart button
    const addToCartButton = this.mainContent.querySelector(".agregar-carrito")
    if (addToCartButton) {
      addToCartButton.addEventListener("click", () => {
        const quantity = Number.parseInt(this.mainContent.querySelector("#cantidad").value)
        const producto = this.productos.find((p) => p.id === this.currentProductId)

        alert(`Se han añadido ${quantity} unidades de "${producto.nombre}" al carrito.`)
      })
    }
  }

  filterProducts() {
    // Only run if we're in the tienda section
    if (this.currentSection !== "tienda") return

    const productCards = document.querySelectorAll(".product-card")
    if (!productCards.length) return

    let visibleCount = 0

    productCards.forEach((card) => {
      if (this.currentCategory === "todos" || card.dataset.category === this.currentCategory) {
        card.style.display = "block"
        visibleCount++
      } else {
        card.style.display = "none"
      }
    })

    // Update results count
    const resultsCount = document.querySelector(".results-count")
    if (resultsCount) {
      resultsCount.textContent = `Mostrando ${visibleCount} resultados`
    }
  }

  setupProductSearch() {
    const searchInput = document.getElementById("productSearch")
    if (!searchInput) return

    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase().trim()
      const productCards = document.querySelectorAll(".product-card")
      let visibleCount = 0

      productCards.forEach((card) => {
        const productName = card.querySelector(".product-title").textContent.toLowerCase()
        const isVisible =
          productName.includes(searchTerm) &&
          (this.currentCategory === "todos" || card.dataset.category === this.currentCategory)

        if (isVisible) {
          card.style.display = "block"
          visibleCount++
        } else {
          card.style.display = "none"
        }
      })

      // Update results count
      const resultsCount = document.querySelector(".results-count")
      if (resultsCount) {
        resultsCount.textContent = `Mostrando ${visibleCount} resultados`
      }

      // Show no results message if needed
      this.showNoSearchResults(visibleCount === 0, searchTerm)
    })
  }

  showNoSearchResults(show, searchTerm) {
    let noResultsElement = document.querySelector(".no-search-results")
    const productsGrid = document.querySelector(".products-grid")

    if (show && !noResultsElement) {
      noResultsElement = document.createElement("div")
      noResultsElement.className = "no-search-results"
      noResultsElement.innerHTML = `
        <h3>No se encontraron productos</h3>
        <p>No hay resultados para "${searchTerm}"</p>
        <button class="clear-search">Limpiar búsqueda</button>
      `

      const clearButton = noResultsElement.querySelector(".clear-search")
      clearButton.addEventListener("click", () => {
        const searchInput = document.getElementById("productSearch")
        searchInput.value = ""
        searchInput.dispatchEvent(new Event("input"))
      })

      productsGrid.appendChild(noResultsElement)
    } else if (!show && noResultsElement) {
      noResultsElement.remove()
    }
  }

  setupProductClickHandlers() {
    const productCards = document.querySelectorAll(".product-card")
    productCards.forEach((card) => {
      card.addEventListener("click", () => {
        const productId = card.dataset.id
        if (productId) {
          this.loadProductDetail(productId)
        }
      })
    })
  }

  setupDynamicEventListeners() {
    // Add event listeners to elements that are dynamically added

    // Example: View product buttons
    const viewButtons = document.querySelectorAll(".view-button")
    viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Navigate to tienda section
        this.handleNavigation("tienda")
      })
    })

    // Example: Contact form submission
    const contactForm = document.querySelector(".contact-form")
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault()
        alert("Formulario enviado correctamente. Te contactaremos pronto.")
        contactForm.reset()
      })
    }
  }

  // Helper methods
  getCategoryName(categoryId) {
    const categoryMap = {
      camaras: "Cámaras y DVR",
      cristales: "Cristales",
      juguetes: "Juguetes",
      ofertas: "Ofertas",
      relojes: "Relojes",
      tazas: "Tazas",
    }

    return categoryMap[categoryId] || categoryId
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  getRelatedProducts(currentProductId, category) {
    // Get products in the same category, excluding the current one
    const related = this.productos.filter((p) => p.id !== currentProductId && p.categoria === category)

    // If we don't have enough related products, add some from other categories
    if (related.length < 2) {
      const others = this.productos.filter((p) => p.id !== currentProductId && p.categoria !== category)
      return [...related, ...others].slice(0, 2)
    }

    return related.slice(0, 2)
  }
}

class ProductFilter {
  constructor() {
    this.products = document.querySelectorAll(".product-card")
    this.categoryItems = document.querySelectorAll(".menusidebar .productos")
    this.searchInput = document.getElementById("searchInput")
    this.filterToggle = document.getElementById("filterToggle")
    this.filtersPanel = document.getElementById("filtersPanel")
    this.minPriceInput = document.getElementById("minPrice")
    this.maxPriceInput = document.getElementById("maxPrice")
    this.sortSelect = document.getElementById("sortBy")
    this.clearFiltersBtn = document.getElementById("clearFilters")
    this.applyFiltersBtn = document.getElementById("applyFilters")
    this.resultsCount = document.getElementById("resultsCount")
    this.activeFiltersContainer = document.getElementById("activeFilters")
    this.productsGrid = document.querySelector(".products-grid")

    this.currentFilters = {
      search: "",
      category: "todos",
      minPrice: null,
      maxPrice: null,
      sortBy: "default",
    }

    this.init()
  }

  init() {
    this.bindEvents()
    this.updateResults()
  }

  bindEvents() {
    // Search input
    this.searchInput.addEventListener("input", (e) => {
      this.currentFilters.search = e.target.value.toLowerCase()
      this.updateResults()
    })

    // Filter toggle
    this.filterToggle.addEventListener("click", () => {
      this.toggleFiltersPanel()
    })

    // Category sidebar
    this.categoryItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        this.selectCategory(e.currentTarget)
      })
    })

    // Price inputs
    this.minPriceInput.addEventListener("input", () => {
      this.currentFilters.minPrice = this.minPriceInput.value ? Number.parseInt(this.minPriceInput.value) : null
      this.updateResults()
    })

    this.maxPriceInput.addEventListener("input", () => {
      this.currentFilters.maxPrice = this.maxPriceInput.value ? Number.parseInt(this.maxPriceInput.value) : null
      this.updateResults()
    })

    // Sort select
    this.sortSelect.addEventListener("change", (e) => {
      this.currentFilters.sortBy = e.target.value
      this.updateResults()
    })

    // Filter actions
    this.clearFiltersBtn.addEventListener("click", () => {
      this.clearAllFilters()
    })

    this.applyFiltersBtn.addEventListener("click", () => {
      this.toggleFiltersPanel()
    })
  }

  toggleFiltersPanel() {
    this.filtersPanel.classList.toggle("show")
    this.filterToggle.classList.toggle("active")
  }

  selectCategory(categoryElement) {
    // Remove active class from all categories
    this.categoryItems.forEach((item) => item.classList.remove("active"))

    // Add active class to selected category
    categoryElement.classList.add("active")

    // Update current filter
    this.currentFilters.category = categoryElement.dataset.category
    this.updateResults()
  }

  clearAllFilters() {
    this.currentFilters = {
      search: "",
      category: "todos",
      minPrice: null,
      maxPrice: null,
      sortBy: "default",
    }

    // Reset UI
    this.searchInput.value = ""
    this.minPriceInput.value = ""
    this.maxPriceInput.value = ""
    this.sortSelect.value = "default"

    // Reset category selection
    this.categoryItems.forEach((item) => item.classList.remove("active"))
    document.querySelector('[data-category="todos"]').classList.add("active")

    this.updateResults()
  }

  updateResults() {
    const visibleProducts = this.filterProducts()
    this.sortProducts(visibleProducts)
    this.updateResultsCount(visibleProducts.length)
    this.updateActiveFilters()
    this.updateCategoryCounts()
  }

  filterProducts() {
    const visibleProducts = []

    this.products.forEach((product) => {
      let isVisible = true

      // Text search filter
      if (this.currentFilters.search) {
        const productName = product.dataset.name.toLowerCase()
        if (!productName.includes(this.currentFilters.search)) {
          isVisible = false
        }
      }

      // Category filter
      if (this.currentFilters.category !== "todos") {
        if (this.currentFilters.category === "ofertas") {
          if (!product.dataset.sale) {
            isVisible = false
          }
        } else if (product.dataset.category !== this.currentFilters.category) {
          isVisible = false
        }
      }

      // Price filter
      const productPrice = Number.parseInt(product.dataset.price)
      if (this.currentFilters.minPrice && productPrice < this.currentFilters.minPrice) {
        isVisible = false
      }
      if (this.currentFilters.maxPrice && productPrice > this.currentFilters.maxPrice) {
        isVisible = false
      }

      // Show/hide product
      if (isVisible) {
        product.classList.remove("hidden")
        visibleProducts.push(product)
      } else {
        product.classList.add("hidden")
      }
    })

    // Show no results message if needed
    this.showNoResultsMessage(visibleProducts.length === 0)

    return visibleProducts
  }

  sortProducts(products) {
    if (this.currentFilters.sortBy === "default") return

    const sortedProducts = [...products].sort((a, b) => {
      switch (this.currentFilters.sortBy) {
        case "price-low":
          return Number.parseInt(a.dataset.price) - Number.parseInt(b.dataset.price)
        case "price-high":
          return Number.parseInt(b.dataset.price) - Number.parseInt(a.dataset.price)
        case "name":
          return a.dataset.name.localeCompare(b.dataset.name)
        case "name-desc":
          return b.dataset.name.localeCompare(a.dataset.name)
        default:
          return 0
      }
    })

    // Reorder DOM elements
    sortedProducts.forEach((product) => {
      this.productsGrid.appendChild(product)
    })
  }

  updateResultsCount(count) {
    const total = this.products.length
    this.resultsCount.textContent = `Mostrando ${count} de ${total} resultados`
  }

  updateActiveFilters() {
    this.activeFiltersContainer.innerHTML = ""

    // Search filter
    if (this.currentFilters.search) {
      this.addFilterTag("Búsqueda", `"${this.currentFilters.search}"`, () => {
        this.searchInput.value = ""
        this.currentFilters.search = ""
        this.updateResults()
      })
    }

    // Category filter
    if (this.currentFilters.category !== "todos") {
      const categoryName = document.querySelector(`[data-category="${this.currentFilters.category}"] span`).textContent
      this.addFilterTag("Categoría", categoryName, () => {
        this.selectCategory(document.querySelector('[data-category="todos"]'))
      })
    }

    // Price filter
    if (this.currentFilters.minPrice || this.currentFilters.maxPrice) {
      const min = this.currentFilters.minPrice || 0
      const max = this.currentFilters.maxPrice || "∞"
      this.addFilterTag("Precio", `$${min} - $${max}`, () => {
        this.minPriceInput.value = ""
        this.maxPriceInput.value = ""
        this.currentFilters.minPrice = null
        this.currentFilters.maxPrice = null
        this.updateResults()
      })
    }

    // Sort filter
    if (this.currentFilters.sortBy !== "default") {
      const sortName = this.sortSelect.options[this.sortSelect.selectedIndex].text
      this.addFilterTag("Orden", sortName, () => {
        this.sortSelect.value = "default"
        this.currentFilters.sortBy = "default"
        this.updateResults()
      })
    }
  }

  addFilterTag(label, value, removeCallback) {
    const tag = document.createElement("div")
    tag.className = "filter-tag"
    tag.innerHTML = `
            <span>${label}: ${value}</span>
            <span class="remove">×</span>
        `

    tag.querySelector(".remove").addEventListener("click", removeCallback)
    this.activeFiltersContainer.appendChild(tag)
  }

  updateCategoryCounts() {
    // This would typically be done with real data from a backend
    // For demo purposes, we'll update counts based on visible products
    const categoryCounts = {}

    this.products.forEach((product) => {
      if (!product.classList.contains("hidden")) {
        const category = product.dataset.category
        categoryCounts[category] = (categoryCounts[category] || 0) + 1

        // Count offers
        if (product.dataset.sale) {
          categoryCounts["ofertas"] = (categoryCounts["ofertas"] || 0) + 1
        }
      }
    })

    // Update sidebar counts
    this.categoryItems.forEach((item) => {
      const category = item.dataset.category
      const countElement = item.querySelector(".count")
      if (category === "todos") {
        const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)
        countElement.textContent = `(${total})`
      } else {
        const count = categoryCounts[category] || 0
        countElement.textContent = `(${count})`
      }
    })
  }

  showNoResultsMessage(show) {
    let noResultsElement = document.querySelector(".no-results")

    if (show && !noResultsElement) {
      noResultsElement = document.createElement("div")
      noResultsElement.className = "no-results"
      noResultsElement.innerHTML = `
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar tus filtros de búsqueda</p>
                <button onclick="productFilter.clearAllFilters()">Limpiar todos los filtros</button>
            `
      this.productsGrid.appendChild(noResultsElement)
    } else if (!show && noResultsElement) {
      noResultsElement.remove()
    }
  }
}

// Initialize the filter system when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.productFilter = new ProductFilter()
})
