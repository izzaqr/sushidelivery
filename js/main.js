document.addEventListener("DOMContentLoaded", () => {
    // HEADER LOAD
    fetch("/html/header.html")
        .then((response) => response.text())
        .then((html) => {
            document.getElementById("header-container").innerHTML = html;

            if (window.location.pathname.includes("cart.html")) {
                const cartIcon = document.getElementById("header-cart");
                if (cartIcon) {
                    cartIcon.style.visibility = "hidden";
                    cartIcon.style.pointerEvents = "none";
                }
            }

            // BURGER MENU
            const burger = document.getElementById("burger");
            const nav = document.getElementById("header__nav");
            if (burger && nav) {
                burger.addEventListener("click", () => {
                    nav.classList.toggle("active");
                });
            }
        })
        .catch((err) => console.error("Ошибка загрузки header:", err));

    // PAGINATION
    const items = document.querySelectorAll(".menu__col");
    const pagination = document.getElementById("pagination");
    if (items.length && pagination) {
        const itemsPerPage = 6;
        const totalPages = Math.ceil(items.length / itemsPerPage);

        function showPage(page) {
            items.forEach((item, index) => {
                item.style.display =
                    index >= (page - 1) * itemsPerPage &&
                    index < page * itemsPerPage
                        ? ""
                        : "none";
            });
        }

        function createPagination() {
            pagination.innerHTML = "";

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement("button");
                btn.textContent = i;
                btn.classList.add("pagination-btn");
                if (i === 1) btn.classList.add("active");

                btn.addEventListener("click", function () {
                    document
                        .querySelectorAll(".pagination-btn")
                        .forEach((b) => b.classList.remove("active"));
                    this.classList.add("active");
                    showPage(i);
                });

                pagination.appendChild(btn);
            }
        }

        createPagination();
        showPage(1);
    }

    // SEARCH FUNCTIONALITY
    const searchInput = document.getElementById("search");
    const menuCols = document.querySelectorAll(".menu__col");
    if (searchInput && menuCols.length) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.trim().toLowerCase();

            menuCols.forEach((col) => {
                const title = col
                    .querySelector(".menu__col-title")
                    .textContent.toLowerCase();
                col.style.display = title.includes(query) ? "" : "none";
            });
        });
    }

    // CART
    // Получение текущей корзины из localStorage
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Сохранение корзины в localStorage
    const saveCart = () => {
        localStorage.setItem("cart", JSON.stringify(cart));
    };

    // Обновление пользовательского интерфейса корзины
    const updateCartUI = () => {
        const cartContainer =
            document.getElementById("cart") ||
            document.getElementById("cartContainer");
        const cartCount = document.getElementById("cart-count");

        if (!cartContainer) return;

        // Очистка содержимого контейнера
        cartContainer.innerHTML = "";

        // Обновление счётчика количества товаров
        if (cartCount) {
            const totalCount = cart.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
            cartCount.textContent = totalCount;
        }

        // Если корзина пуста — выводим сообщение
        if (cart.length === 0) {
            cartContainer.innerHTML = "<p>Корзина пуста</p>";
            return;
        }

        // Заполнение корзины товарами
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const itemDiv = document.createElement("div");
            itemDiv.className = "cart__item";
            itemDiv.innerHTML = `
            <span>${item.title} — ${item.quantity} шт = ${itemTotal}₽</span>
            <button class="cart__remove" data-index="${index}">Удалить</button>
        `;
            cartContainer.appendChild(itemDiv);
        });

        // Блок "Итого"
        const totalBlock = document.createElement("div");
        totalBlock.className = "cart__total";
        totalBlock.textContent = `Итого: ${total}₽`;
        cartContainer.appendChild(totalBlock);

        // Установка обработчиков кнопок "Удалить"
        const removeButtons = cartContainer.querySelectorAll(".cart__remove");
        removeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const index = parseInt(button.dataset.index);
                if (!isNaN(index)) {
                    cart.splice(index, 1);
                    saveCart();
                    updateCartUI();
                }
            });
        });
    };

    // Обработчики кнопок "Добавить в корзину"
    const addToCartButtons = document.querySelectorAll(".menu__col-btn a");

    addToCartButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const itemEl = button.closest(".menu__col");
            if (!itemEl) return;

            const title = itemEl
                .querySelector(".menu__col-title")
                ?.textContent.trim();
            const priceText = itemEl
                .querySelector(".menu__col-price")
                ?.textContent.trim();
            const price = parseInt(
                priceText.replace("₽", "").replace(/\s/g, "")
            );

            if (!title || isNaN(price)) return;

            const existingItem = cart.find((item) => item.title === title);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ title, price, quantity: 1 });
            }

            saveCart();
            updateCartUI();
        });
    });

    // Первоначальный рендер корзины при загрузке страницы
    updateCartUI();
});
