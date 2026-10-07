const App = {
  products: [],

  els: {},

  init() {
    this.els = {
      input: document.getElementById('productInput'),
      addBtn: document.getElementById('addBtn'),
      clearBtn: document.getElementById('clearBtn'),
      productsList: document.getElementById('productsList'),
      results: document.getElementById('results')
    };

    this.products = Storage.get('products', []);

    this.els.addBtn.addEventListener('click', () => this.addProduct());
    this.els.input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.addProduct();
    });
    this.els.clearBtn.addEventListener('click', () => this.clearAll());

    this.render();
  },

  addProduct() {
    const value = this.els.input.value.trim();
    if (!value) return;

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

  render() {
    this.renderProducts();
    this.renderResults();
  },

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

    el.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', e => {
        this.removeProduct(e.target.dataset.name);
      });
    });
  },

  renderResults() {
    const el = this.els.results;

    if (!this.products.length) {
      el.innerHTML = '<div class="empty">Добавь хотя бы один продукт — покажу, что можно приготовить</div>';
      return;
    }

    const matches = Matcher.match(RECIPES, this.products);

    // Показываем: всё есть (0 missing), не хватает 1,
    // или не хватает 2 но совпадений много
    const useful = matches.filter(m =>
      m.missingCount <= 1 ||
      (m.missingCount === 2 && m.haveCount >= 2)
    );

    if (!useful.length) {
      el.innerHTML = '<div class="empty">Ничего подходящего. Попробуй добавить ещё продуктов.</div>';
      return;
    }

    el.innerHTML = useful.map(m => this.renderRecipe(m)).join('');
  },

  renderRecipe(m) {
    const { recipe, have, missingCount } = m;

    let cls = 'ready';
    let status = '✅ Все ингредиенты есть';
    if (missingCount === 1) {
      cls = 'almost';
      status = '⚠️ Не хватает 1 ингредиента';
    } else if (missingCount > 1) {
      cls = 'missing';
      status = `⚠️ Не хватает ${missingCount} ингредиентов`;
    }

    const ingHtml = recipe.ingredients.map(ing => {
      const norm = Matcher.normalize(ing.name);
      const isPantry = Matcher.PANTRY.has(norm);
      const hasIt = have.some(h => Matcher.isSameIngredient(h.name, ing.name));

      let ingCls, mark;
      if (hasIt) {
        ingCls = 'have'; mark = '✓';
      } else if (isPantry) {
        ingCls = 'pantry'; mark = '·';
      } else {
        ingCls = 'miss'; mark = '✗';
      }

      const amount = ing.amount ? ` — ${ing.amount} ${ing.unit}` : '';
      return `<div class="${ingCls}">${mark} ${this.escape(ing.name)}${amount}</div>`;
    }).join('');

    const stepsHtml = recipe.steps.map(s => `<li>${this.escape(s)}</li>`).join('');

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

  escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());