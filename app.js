const App = {
  // Продукты, которые ввёл пользователь.
  // Загружаются из Storage при init, сохраняются при изменении.
  products: [],

  // Ссылки на DOM-элементы. Заполняются в init.
  els: {},

  // ──────────────────────────────────────────────────────────
  // ИНИЦИАЛИЗАЦИЯ
  // ──────────────────────────────────────────────────────────

  init() {
    this.els = {
      input: document.getElementById('productInput'),
      addBtn: document.getElementById('addBtn'),
      clearBtn: document.getElementById('clearBtn'),
      productsList: document.getElementById('productsList'),
      results: document.getElementById('results')
    };

    // Загружаем ранее сохранённые продукты.
    // Если ничего нет — вернётся пустой массив.
    this.products = Storage.get('products', []);

    this.els.addBtn.addEventListener('click', () => this.addProduct());

    this.els.input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.addProduct();
    });

    this.els.clearBtn.addEventListener('click', () => this.clearAll());

    this.render();
  },

  // ──────────────────────────────────────────────────────────
  // РАБОТА С ПРОДУКТАМИ
  // ──────────────────────────────────────────────────────────

  addProduct() {
    const value = this.els.input.value.trim();
    if (!value) return;

    // Проверяем дубликат через normalize —
    // чтобы "Курица" и "курица" считались одним продуктом.
    const exists = this.products.some(
      p => Matcher.normalize(p) === Matcher.normalize(value)
    );

    if (!exists) {
      this.products.push(value);
      Storage.set('products', this.products);
    }

    this.els.input.value = '';
    this.els.input.focus();
    this.render();
  },

  removeProduct(name) {
    this.products = this.products.filter(p => p !== name);
    Storage.set('products', this.products);
    this.render();
  },

  clearAll() {
    if (!confirm('Удалить все продукты?')) return;

    this.products = [];
    Storage.set('products', this.products);
    this.render();
  },

  // ──────────────────────────────────────────────────────────
  // РЕНДЕР
  // ──────────────────────────────────────────────────────────

  render() {
    this.renderProducts();
    this.renderResults();
  },

  // Отрисовка "чипов" с продуктами под полем ввода
  renderProducts() {
    const el = this.els.productsList;

    if (!this.products.length) {
      el.innerHTML = '';
      return;
    }

    el.innerHTML = this.products.map(p => `
      <span class="product-chip">
        ${this.escape(p)}
        <span class="remove" data-name="${this.escape(p)}">×</span>
      </span>
    `).join('');

    // Обработчики навешиваем ПОСЛЕ вставки HTML — иначе элементов ещё нет
    el.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', e => {
        this.removeProduct(e.target.dataset.name);
      });
    });
  },

  // Отрисовка списка рецептов
  renderResults() {
    const el = this.els.results;

    if (!this.products.length) {
      el.innerHTML = '<div class="empty">Добавь хотя бы один продукт — покажу, что можно приготовить</div>';
      return;
    }

    const matches = Matcher.match(RECIPES, this.products);

    // Показываем рецепты:
    // - где всё есть (missingCount === 0), ИЛИ
    // - где совпало минимум 2 ингредиента
    //
    // Так при небольшом наборе продуктов видим больше кандидатов,
    // но отсекаем мусор, где совпал только 1 продукт.
    const useful = matches.filter(m =>
      m.missingCount === 0 || m.haveCount >= 2
    );

    if (!useful.length) {
      el.innerHTML = '<div class="empty">Мало совпадений. Попробуй добавить ещё продуктов.</div>';
      return;
    }

    el.innerHTML = useful.map(m => this.renderRecipe(m)).join('');
  },

  // Рендер одной карточки рецепта.
  // m — объект из Matcher.match: { recipe, have, missing, pantry, missingCount, haveCount, ... }
  renderRecipe(m) {
    const { recipe, have, missingCount } = m;

    // ── Класс и текст статуса ─────────────────────────────
    let cls = 'ready';
    let status = '✅ Все ингредиенты есть';

    if (missingCount === 1) {
      cls = 'almost';
      status = '⚠️ Не хватает 1 ингредиента';
    } else if (missingCount > 1) {
      cls = 'missing';
      status = `⚠️ Не хватает ${missingCount} ингредиентов`;
    }

    // ── Ингредиенты ──────────────────────────────────────
    // Для каждого ингредиента определяем: есть / базовый / нет
    const ingHtml = recipe.ingredients.map(ing => {
      const norm = Matcher.normalize(ing.name);
      const isPantry = Matcher.PANTRY.has(norm);

      // Ищем в have. Там лежат объекты с полем matchedWith —
      // то, ЧЕМ пользователь закрыл ингредиент.
      const matched = have.find(h => Matcher.isSameIngredient(h.name, ing.name));

      let ingCls, mark, suffix = '';

      if (matched) {
        ingCls = 'have';
        mark = '✓';

        // Если пользователь ввёл синоним, отличающийся от имени в рецепте —
        // показываем подсказку "(у тебя: макароны)".
        if (Matcher.normalize(matched.matchedWith) !== norm) {
          suffix = ` <span class="matched-with">(у тебя: ${this.escape(matched.matchedWith)})</span>`;
        }
      } else if (isPantry) {
        ingCls = 'pantry';
        mark = '·';
      } else {
        ingCls = 'miss';
        mark = '✗';
      }

      const amount = ing.amount ? ` — ${ing.amount} ${ing.unit}` : '';
      return `<div class="${ingCls}">${mark} ${this.escape(ing.name)}${amount}${suffix}</div>`;
    }).join('');

    // ── Шаги приготовления ──────────────────────────────
    const stepsHtml = recipe.steps.map(s => `<li>${this.escape(s)}</li>`).join('');

    // ── Финальная разметка карточки ─────────────────────
    return `
      <div class="recipe-card ${cls}">
        <h3>${this.escape(recipe.title)}</h3>
        <div class="recipe-meta">⏱ ${recipe.time} мин · 🍽 ${recipe.servings} порц.</div>
        <div class="recipe-status ${cls === 'ready' ? 'ok' : cls === 'almost' ? 'warn' : 'no'}">
          ${status}
        </div>
        <div class="ingredients-list">${ingHtml}</div>
        <ol class="steps">${stepsHtml}</ol>
      </div>
    `;
  },

  // ──────────────────────────────────────────────────────────
  // УТИЛИТЫ
  // ──────────────────────────────────────────────────────────

  // Защита от XSS: экранируем опасные символы перед вставкой в HTML
  escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());