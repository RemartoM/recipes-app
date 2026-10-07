const Matcher = {
  // Продукты, которые считаем "базовыми" — обычно есть дома.
  // Не требуем их наличия, но и не помечаем как "есть".
  PANTRY: new Set([
    'соль', 'перец', 'масло', 'вода', 'сахар', 'мука', 'специи'
  ]),

  // Кэш для обратного индекса синонимов.
  // null означает "ещё не построен". Строим при первом обращении.
  _canonicalCache: null,

  // ──────────────────────────────────────────────────────────
  // НОРМАЛИЗАЦИЯ СТРОК
  // ──────────────────────────────────────────────────────────

  // Приводим строку к нормальному виду:
  // "Яйца " → "яйца"
  // "Помидор!" → "помидор"
  normalize(str) {
    return String(str).trim().toLowerCase()
      .replace(/ё/g, 'е')       // ё → е (упрощает сравнение)
      .replace(/[.,!?]/g, '');  // убираем знаки препинания
  },

  // Приведение к единственному числу / базовой форме.
  // Режет падежные окончания: "курицу" → "куриц", "яйца" → "яйц",
  // "помидорами" → "помидор".
  //
  // Порядок окончаний важен: длинные проверяем раньше коротких,
  // иначе "курицей" отрежется по "й" и получится "курице".
  singular(word) {
    word = this.normalize(word);

    const endings = [
      'ами', 'ями', 'ах', 'ях', 'ов', 'ев', 'ей', 'ой', 'ий',
      'ам', 'ям', 'ом', 'ем', 'у', 'ю', 'ы', 'и', 'а', 'я', 'е', 'о'
    ];

    for (const end of endings) {
      // Режем только если останется хотя бы 3 символа.
      // Защита от коротких слов: "я" не превратится в пустую строку.
      if (word.length > end.length + 2 && word.endsWith(end)) {
        return word.slice(0, -end.length);
      }
    }

    return word;
  },

  // ──────────────────────────────────────────────────────────
  // СИНОНИМЫ: построение индекса и канонизация
  // ──────────────────────────────────────────────────────────

  // Строим обратный индекс: "любое_слово" → "канон".
  // "макароны" → "паста"
  // "спагетти" → "паста"
  // "паста"    → "паста"
  //
  // Результат кэшируется, чтобы не перестраивать при каждом сравнении.
  _buildCanonicalIndex() {
    if (this._canonicalCache) return this._canonicalCache;

    const index = {};

    // Object.entries превращает {a: 1, b: 2} в [['a', 1], ['b', 2]]
    for (const [canonical, list] of Object.entries(SYNONYMS)) {
      // Сам канон указывает на себя
      index[this.singular(canonical)] = canonical;

      // Каждый синоним указывает на канон
      for (const syn of list) {
        index[this.singular(syn)] = canonical;
      }
    }

    this._canonicalCache = index;
    return index;
  },

  // Превращает любое слово в его каноническую форму.
  // Если слово не из словаря — возвращает его же (fallback).
  canonicalize(word) {
    const index = this._buildCanonicalIndex();
    const key = this.singular(word);
    return index[key] || key;
  },

  // Проверяет, что два названия — это один и тот же продукт.
  // Учитывает синонимы и падежи.
  isSameIngredient(a, b) {
    return this.canonicalize(a) === this.canonicalize(b);
  },

  // ──────────────────────────────────────────────────────────
  // ГЛАВНЫЙ МЕТОД ПОДБОРА
  // ──────────────────────────────────────────────────────────

  match(recipes, userProducts) {
    const user = userProducts
      .map(p => this.normalize(p))
      .filter(Boolean);

    return recipes.map(recipe => {
      const required = recipe.ingredients.filter(
        ing => !this.PANTRY.has(this.normalize(ing.name))
      );

      const have = [];
      const missing = [];
      const pantry = [];

      for (const ing of recipe.ingredients) {
        const isPantry = this.PANTRY.has(this.normalize(ing.name));

        // find вместо some: возвращает НАЙДЕННЫЙ продукт, а не true/false.
        // Это позволяет потом показать "паста (у тебя: макароны)".
        const matched = user.find(p => this.isSameIngredient(p, ing.name));

        if (isPantry) {
          pantry.push(ing);
        } else if (matched) {
          // Копируем ing через spread и добавляем поле matchedWith
          have.push({ ...ing, matchedWith: matched });
        } else {
          missing.push(ing);
        }
      }

      const total = required.length || 1;
      const score = have.length / total;

      return {
        recipe,
        have,
        missing,
        pantry,
        score,
        missingCount: missing.length,
        haveCount: have.length,
        isRelevant: have.length > 0
      };
    })
    .filter(m => m.isRelevant)
    .sort((a, b) => {
      if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
      return b.haveCount - a.haveCount;
    });
  }
};