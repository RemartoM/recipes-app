const Matcher = {
  // Продукты, которые считаем "базовыми" — обычно есть дома.
  // Не требуем их наличия, но и не помечаем как "есть".
  PANTRY: new Set([
    'соль', 'перец', 'масло', 'вода', 'сахар', 'мука', 'специи'
  ]),

  // Приводим строку к нормальному виду: "Яйца" -> "яйца"
  normalize(str) {
    return String(str).trim().toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[.,!?]/g, '');
  },

  // Простейшая нормализация единственного/множественного
  singular(word) {
    word = this.normalize(word);
    if (word.endsWith('ы') || word.endsWith('и')) return word.slice(0, -1);
    if (word.endsWith('а')) return word.slice(0, -1);
    if (word.endsWith('я')) return word.slice(0, -1);
    return word;
  },

  // Совпадают ли два названия ингредиента
  isSameIngredient(a, b) {
    return this.singular(a) === this.singular(b);
  },

  // Основной метод: для каждого рецепта считаем, сколько ингредиентов есть
  match(recipes, userProducts) {
    const user = userProducts
      .map(p => this.normalize(p))
      .filter(Boolean);

    return recipes.map(recipe => {
      // Обязательные к наличию (не PANTRY)
      const required = recipe.ingredients.filter(
        ing => !this.PANTRY.has(this.normalize(ing.name))
      );

      const have = [];
      const missing = [];
      const pantry = [];

      for (const ing of recipe.ingredients) {
        const isPantry = this.PANTRY.has(this.normalize(ing.name));
        const found = user.some(p => this.isSameIngredient(p, ing.name));

        if (isPantry) {
          pantry.push(ing);
        } else if (found) {
          have.push(ing);
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
    // Отбрасываем рецепты, где ни один ингредиент не совпал
    .filter(m => m.isRelevant)
    // Сортировка: сначала меньше недостающих, потом больше совпадений
    .sort((a, b) => {
      if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
      return b.haveCount - a.haveCount;
    });
  }
};