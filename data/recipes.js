// Пока хардкод. Потом сюда придёт JSON от парсера.
const RECIPES = [
  {
    id: "pasta-chicken",
    title: "Паста с курицей и сливками",
    time: 30,
    servings: 2,
    ingredients: [
      { name: "паста", amount: 200, unit: "г" },
      { name: "курица", amount: 300, unit: "г" },
      { name: "сливки", amount: 150, unit: "мл" },
      { name: "лук", amount: 1, unit: "шт" },
      { name: "чеснок", amount: 2, unit: "зуб" }
    ],
    steps: [
      "Отварить пасту до аль денте.",
      "Обжарить курицу кусочками.",
      "Добавить лук и чеснок, обжарить.",
      "Влить сливки, потушить 5 минут.",
      "Смешать с пастой."
    ]
  },
  {
    id: "omelette",
    title: "Омлет с сыром",
    time: 10,
    servings: 1,
    ingredients: [
      { name: "яйца", amount: 3, unit: "шт" },
      { name: "молоко", amount: 50, unit: "мл" },
      { name: "сыр", amount: 50, unit: "г" },
      { name: "масло", amount: 10, unit: "г" }
    ],
    steps: [
      "Взбить яйца с молоком.",
      "Вылить на разогретую сковороду.",
      "Посыпать сыром, сложить пополам."
    ]
  },
  {
    id: "greek-salad",
    title: "Греческий салат",
    time: 15,
    servings: 2,
    ingredients: [
      { name: "помидор", amount: 3, unit: "шт" },
      { name: "огурец", amount: 2, unit: "шт" },
      { name: "сыр", amount: 100, unit: "г" },
      { name: "оливки", amount: 50, unit: "г" },
      { name: "масло", amount: 20, unit: "мл" }
    ],
    steps: [
      "Нарезать овощи крупно.",
      "Добавить сыр кубиками и оливки.",
      "Заправить маслом."
    ]
  },
  {
    id: "buckwheat-mushrooms",
    title: "Гречка с грибами",
    time: 25,
    servings: 2,
    ingredients: [
      { name: "гречка", amount: 150, unit: "г" },
      { name: "грибы", amount: 200, unit: "г" },
      { name: "лук", amount: 1, unit: "шт" },
      { name: "масло", amount: 20, unit: "г" }
    ],
    steps: [
      "Отварить гречку.",
      "Обжарить лук с грибами.",
      "Смешать."
    ]
  },
  {
    id: "chicken-rice",
    title: "Курица с рисом",
    time: 40,
    servings: 3,
    ingredients: [
      { name: "курица", amount: 500, unit: "г" },
      { name: "рис", amount: 200, unit: "г" },
      { name: "морковь", amount: 1, unit: "шт" },
      { name: "лук", amount: 1, unit: "шт" },
      { name: "чеснок", amount: 2, unit: "зуб" }
    ],
    steps: [
      "Обжарить курицу.",
      "Добавить овощи.",
      "Всыпать рис, залить водой 1:2.",
      "Тушить 20 минут."
    ]
  },
  {
    id: "pancakes",
    title: "Блины",
    time: 30,
    servings: 4,
    ingredients: [
      { name: "мука", amount: 250, unit: "г" },
      { name: "молоко", amount: 500, unit: "мл" },
      { name: "яйца", amount: 2, unit: "шт" },
      { name: "сахар", amount: 2, unit: "ст.л" },
      { name: "масло", amount: 30, unit: "г" }
    ],
    steps: [
      "Смешать все ингредиенты.",
      "Жарить тонкие блины.",
      "Подавать с начинкой."
    ]
  },
  {
    id: "soup-chicken",
    title: "Куриный суп",
    time: 60,
    servings: 4,
    ingredients: [
      { name: "курица", amount: 500, unit: "г" },
      { name: "картофель", amount: 3, unit: "шт" },
      { name: "морковь", amount: 1, unit: "шт" },
      { name: "лук", amount: 1, unit: "шт" },
      { name: "вермишель", amount: 50, unit: "г" }
    ],
    steps: [
      "Сварить бульон.",
      "Добавить картофель.",
      "Добавить зажарку и вермишель.",
      "Варить 10 минут."
    ]
  },
  {
    id: "tuna-sandwich",
    title: "Сэндвич с тунцом",
    time: 5,
    servings: 1,
    ingredients: [
      { name: "хлеб", amount: 2, unit: "ломт" },
      { name: "тунец", amount: 100, unit: "г" },
      { name: "майонез", amount: 20, unit: "г" },
      { name: "огурец", amount: 1, unit: "шт" }
    ],
    steps: [
      "Смешать тунец с майонезом.",
      "Намазать на хлеб.",
      "Добавить огурец."
    ]
  },
  {
    id: "cottage-pancakes",
    title: "Сырники",
    time: 20,
    servings: 2,
    ingredients: [
      { name: "творог", amount: 400, unit: "г" },
      { name: "яйца", amount: 2, unit: "шт" },
      { name: "мука", amount: 100, unit: "г" },
      { name: "сахар", amount: 2, unit: "ст.л" }
    ],
    steps: [
      "Смешать творог, яйца, муку, сахар.",
      "Слепить сырники.",
      "Обжарить с двух сторон."
    ]
  },
  {
    id: "veg-stew",
    title: "Овощное рагу",
    time: 45,
    servings: 3,
    ingredients: [
      { name: "картофель", amount: 4, unit: "шт" },
      { name: "морковь", amount: 2, unit: "шт" },
      { name: "лук", amount: 1, unit: "шт" },
      { name: "капуста", amount: 300, unit: "г" },
      { name: "помидор", amount: 2, unit: "шт" }
    ],
    steps: [
      "Нарезать овощи.",
      "Тушить всё 30 минут.",
      "Посолить, поперчить."
    ]
  }
];