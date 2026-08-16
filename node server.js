const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 3000;

// =====================================
// MIDDLEWARE
// =====================================

app.use(cors());
app.use(express.json());

// =====================================
// HOME ROUTE
// =====================================

app.get("/", (req, res) => {
    res.send("Smart Food Planner Backend is Running");
});

// =====================================
// GET ALL MENUS
// =====================================

app.get("/api/menus", (req, res) => {

    const menuQuery = `
        SELECT id, name, meal
        FROM menus
        ORDER BY id DESC
    `;

    db.query(menuQuery, (error, menus) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Failed to get menus"
            });
        }

        if (menus.length === 0) {
            return res.json({
                success: true,
                count: 0,
                menus: []
            });
        }

        const menuIds = menus.map(menu => menu.id);

        const ingredientQuery = `
            SELECT
                id,
                menu_id,
                name,
                quantity_per_person,
                unit
            FROM ingredients
            WHERE menu_id IN (?)
            ORDER BY id
        `;

        db.query(
            ingredientQuery,
            [menuIds],
            (ingredientError, ingredients) => {

                if (ingredientError) {
                    console.error(ingredientError);

                    return res.status(500).json({
                        success: false,
                        message: "Failed to get ingredients"
                    });
                }

                const result = menus.map(menu => {

                    const menuIngredients = ingredients
                        .filter(ingredient =>
                            ingredient.menu_id === menu.id
                        )
                        .map(ingredient => ({
                            name: ingredient.name,
                            quantityPerPerson:
                                Number(ingredient.quantity_per_person),
                            unit: ingredient.unit
                        }));

                    return {
                        id: menu.id,
                        name: menu.name,
                        meal: menu.meal,
                        ingredients: menuIngredients
                    };
                });

                res.json({
                    success: true,
                    count: result.length,
                    menus: result
                });
            }
        );
    });
});

// =====================================
// GET MENU BY ID
// =====================================

app.get("/api/menus/:id", (req, res) => {

    const menuId = Number(req.params.id);

    if (!Number.isInteger(menuId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid menu ID"
        });
    }

    const menuQuery = `
        SELECT id, name, meal
        FROM menus
        WHERE id = ?
    `;

    db.query(
        menuQuery,
        [menuId],
        (error, menus) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    success: false,
                    message: "Failed to get menu"
                });
            }

            if (menus.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Menu not found"
                });
            }

            const ingredientQuery = `
                SELECT
                    id,
                    menu_id,
                    name,
                    quantity_per_person,
                    unit
                FROM ingredients
                WHERE menu_id = ?
                ORDER BY id
            `;

            db.query(
                ingredientQuery,
                [menuId],
                (ingredientError, ingredients) => {

                    if (ingredientError) {
                        console.error(ingredientError);

                        return res.status(500).json({
                            success: false,
                            message: "Failed to get ingredients"
                        });
                    }

                    const menu = {
                        id: menus[0].id,
                        name: menus[0].name,
                        meal: menus[0].meal,

                        ingredients: ingredients.map(
                            ingredient => ({
                                name: ingredient.name,
                                quantityPerPerson:
                                    Number(
                                        ingredient.quantity_per_person
                                    ),
                                unit: ingredient.unit
                            })
                        )
                    };

                    res.json({
                        success: true,
                        menu: menu
                    });
                }
            );
        }
    );
});

// =====================================
// CREATE MENU
// =====================================

app.post("/api/menus", (req, res) => {

    const {
        name,
        meal,
        ingredients
    } = req.body;

    if (!name || !meal) {
        return res.status(400).json({
            success: false,
            message: "Menu name and meal are required"
        });
    }

    const menuQuery = `
        INSERT INTO menus
        (
            name,
            meal
        )
        VALUES (?, ?)
    `;

    db.query(
        menuQuery,
        [name, meal],
        (menuError, menuResult) => {

            if (menuError) {
                console.error(menuError);

                return res.status(500).json({
                    success: false,
                    message: "Failed to create menu"
                });
            }

            const menuId = menuResult.insertId;

            if (
                !Array.isArray(ingredients) ||
                ingredients.length === 0
            ) {
                return res.status(201).json({
                    success: true,
                    message: "Menu created successfully",

                    menu: {
                        id: menuId,
                        name: name,
                        meal: meal,
                        ingredients: []
                    }
                });
            }

            const ingredientValues = ingredients
                .filter(
                    ingredient =>
                        ingredient &&
                        ingredient.name &&
                        ingredient.quantityPerPerson !== "" &&
                        ingredient.quantityPerPerson !== null
                )
                .map(
                    ingredient => [
                        menuId,
                        ingredient.name,
                        Number(ingredient.quantityPerPerson),
                        ingredient.unit
                    ]
                );

            if (ingredientValues.length === 0) {
                return res.status(201).json({
                    success: true,
                    message: "Menu created successfully",

                    menu: {
                        id: menuId,
                        name: name,
                        meal: meal,
                        ingredients: []
                    }
                });
            }

            const ingredientQuery = `
                INSERT INTO ingredients
                (
                    menu_id,
                    name,
                    quantity_per_person,
                    unit
                )
                VALUES ?
            `;

            db.query(
                ingredientQuery,
                [ingredientValues],
                (ingredientError) => {

                    if (ingredientError) {
                        console.error(ingredientError);

                        return res.status(500).json({
                            success: false,
                            message:
                                "Menu created but ingredients could not be saved"
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Menu created successfully",

                        menu: {
                            id: menuId,
                            name: name,
                            meal: meal,
                            ingredients: ingredients
                        }
                    });
                }
            );
        }
    );
});

// =====================================
// UPDATE MENU
// =====================================

app.put("/api/menus/:id", (req, res) => {

    const menuId = Number(req.params.id);

    const {
        name,
        meal,
        ingredients
    } = req.body;

    if (!Number.isInteger(menuId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid menu ID"
        });
    }

    if (!name || !meal) {
        return res.status(400).json({
            success: false,
            message: "Menu name and meal are required"
        });
    }

    const updateMenuQuery = `
        UPDATE menus
        SET
            name = ?,
            meal = ?
        WHERE id = ?
    `;

    db.query(
        updateMenuQuery,
        [name, meal, menuId],
        (updateError, updateResult) => {

            if (updateError) {
                console.error(updateError);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update menu"
                });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Menu not found"
                });
            }

            const deleteIngredientsQuery = `
                DELETE FROM ingredients
                WHERE menu_id = ?
            `;

            db.query(
                deleteIngredientsQuery,
                [menuId],
                (deleteError) => {

                    if (deleteError) {
                        console.error(deleteError);

                        return res.status(500).json({
                            success: false,
                            message: "Failed to update ingredients"
                        });
                    }

                    if (
                        !Array.isArray(ingredients) ||
                        ingredients.length === 0
                    ) {
                        return res.json({
                            success: true,
                            message: "Menu updated successfully",

                            menu: {
                                id: menuId,
                                name: name,
                                meal: meal,
                                ingredients: []
                            }
                        });
                    }

                    const ingredientValues = ingredients
                        .filter(
                            ingredient =>
                                ingredient &&
                                ingredient.name &&
                                ingredient.quantityPerPerson !== "" &&
                                ingredient.quantityPerPerson !== null
                        )
                        .map(
                            ingredient => [
                                menuId,
                                ingredient.name,
                                Number(ingredient.quantityPerPerson),
                                ingredient.unit
                            ]
                        );

                    if (ingredientValues.length === 0) {
                        return res.json({
                            success: true,
                            message: "Menu updated successfully",

                            menu: {
                                id: menuId,
                                name: name,
                                meal: meal,
                                ingredients: []
                            }
                        });
                    }

                    const insertIngredientsQuery = `
                        INSERT INTO ingredients
                        (
                            menu_id,
                            name,
                            quantity_per_person,
                            unit
                        )
                        VALUES ?
                    `;

                    db.query(
                        insertIngredientsQuery,
                        [ingredientValues],
                        (insertError) => {

                            if (insertError) {
                                console.error(insertError);

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Menu updated but ingredients could not be saved"
                                });
                            }

                            res.json({
                                success: true,
                                message: "Menu updated successfully",

                                menu: {
                                    id: menuId,
                                    name: name,
                                    meal: meal,
                                    ingredients: ingredients
                                }
                            });
                        }
                    );
                }
            );
        }
    );
});

// =====================================
// DELETE MENU
// =====================================

app.delete("/api/menus/:id", (req, res) => {

    const menuId = Number(req.params.id);

    if (!Number.isInteger(menuId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid menu ID"
        });
    }

    const deleteQuery = `
        DELETE FROM menus
        WHERE id = ?
    `;

    db.query(
        deleteQuery,
        [menuId],
        (error, result) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete menu"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Menu not found"
                });
            }

            res.json({
                success: true,
                message: "Menu deleted successfully"
            });
        }
    );
});

// =====================================
// CALCULATE FOOD PLAN
// =====================================

app.post("/api/food/calculate", (req, res) => {

    const {
        people,
        meal,
        menu,
        buffer,
        ingredients
    } = req.body;

    if (!people || Number(people) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Number of people must be greater than 0"
        });
    }

    if (!meal || !menu) {
        return res.status(400).json({
            success: false,
            message: "Meal and menu are required"
        });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide ingredients"
        });
    }

    const safetyBuffer = Number(buffer) || 0;

    if (safetyBuffer < 0 || safetyBuffer > 100) {
        return res.status(400).json({
            success: false,
            message: "Safety buffer must be between 0 and 100"
        });
    }

    const effectivePeople =
        Number(people) * (1 + safetyBuffer / 100);

    const foodItems = ingredients
        .filter(
            item =>
                item &&
                item.name &&
                item.quantityPerPerson !== null &&
                item.quantityPerPerson !== undefined &&
                item.quantityPerPerson !== ""
        )
        .map(item => {

            const quantity =
                effectivePeople *
                Number(item.quantityPerPerson);

            let totalQuantity;

            if (item.unit === "grams") {
                totalQuantity = quantity / 1000;
            } else if (item.unit === "ml") {
                totalQuantity = quantity / 1000;
            } else {
                totalQuantity = quantity;
            }

            return {
                name: item.name,

                quantityPerPerson:
                    Number(item.quantityPerPerson),

                unit: item.unit,

                totalQuantity:
                    Number(totalQuantity.toFixed(2))
            };
        });

    if (foodItems.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No valid ingredients provided"
        });
    }

    const planQuery = `
        INSERT INTO food_plans
        (
            people,
            meal,
            menu,
            safety_buffer,
            effective_people
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        planQuery,
        [
            Number(people),
            meal,
            menu,
            safetyBuffer,
            Math.ceil(effectivePeople)
        ],
        (planError, planResult) => {

            if (planError) {
                console.error(planError);

                return res.status(500).json({
                    success: false,
                    message: "Failed to save food plan"
                });
            }

            const foodPlanId = planResult.insertId;

            const ingredientValues = foodItems.map(item => [
                foodPlanId,
                item.name,
                item.quantityPerPerson,
                item.unit,
                item.totalQuantity
            ]);

            const ingredientQuery = `
                INSERT INTO food_plan_ingredients
                (
                    food_plan_id,
                    name,
                    quantity_per_person,
                    unit,
                    total_quantity
                )
                VALUES ?
            `;

            db.query(
                ingredientQuery,
                [ingredientValues],
                (ingredientError) => {

                    if (ingredientError) {
                        console.error(ingredientError);

                        db.query(
                            `
                            DELETE FROM food_plans
                            WHERE id = ?
                            `,
                            [foodPlanId],
                            () => {}
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Food plan saved but ingredients could not be saved"
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message:
                            "Food plan calculated and saved successfully",

                        plan: {
                            id: foodPlanId,
                            people: Number(people),
                            meal: meal,
                            menu: menu,
                            safetyBuffer: safetyBuffer,
                            effectivePeople:
                                Math.ceil(effectivePeople),
                            ingredients: foodItems
                        }
                    });
                }
            );
        }
    );
});

// =====================================
// GET FOOD PLAN HISTORY
// =====================================

app.get("/api/food-plans", (req, res) => {

    const planQuery = `
        SELECT
            id,
            plan_date,
            people,
            meal,
            menu,
            safety_buffer,
            effective_people
        FROM food_plans
        ORDER BY id DESC
    `;

    db.query(
        planQuery,
        (planError, plans) => {

            if (planError) {
                console.error(planError);

                return res.status(500).json({
                    success: false,
                    message: "Failed to get food plans"
                });
            }

            if (plans.length === 0) {
                return res.json({
                    success: true,
                    count: 0,
                    plans: []
                });
            }

            const planIds =
                plans.map(plan => plan.id);

            const ingredientQuery = `
                SELECT
                    id,
                    food_plan_id,
                    name,
                    quantity_per_person,
                    unit,
                    total_quantity
                FROM food_plan_ingredients
                WHERE food_plan_id IN (?)
                ORDER BY id
            `;

            db.query(
                ingredientQuery,
                [planIds],
                (ingredientError, ingredients) => {

                    if (ingredientError) {
                        console.error(ingredientError);

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to get food plan ingredients"
                        });
                    }

                    const result =
                        plans.map(plan => {

                            const planIngredients =
                                ingredients
                                    .filter(
                                        ingredient =>
                                            ingredient.food_plan_id ===
                                            plan.id
                                    )
                                    .map(
                                        ingredient => ({
                                            name: ingredient.name,
                                            quantityPerPerson:
                                                Number(
                                                    ingredient.quantity_per_person
                                                ),
                                            unit: ingredient.unit,
                                            totalQuantity:
                                                Number(
                                                    ingredient.total_quantity
                                                )
                                        })
                                    );

                            return {
                                id: plan.id,
                                date: plan.plan_date,
                                people: plan.people,
                                meal: plan.meal,
                                menu: plan.menu,
                                safetyBuffer:
                                    Number(plan.safety_buffer),
                                effectivePeople:
                                    plan.effective_people,
                                ingredients:
                                    planIngredients
                            };
                        });

                    res.json({
                        success: true,
                        count: result.length,
                        plans: result
                    });
                }
            );
        }
    );
});

// =====================================
// GET FOOD PLAN BY ID
// =====================================

app.get("/api/food-plans/:id", (req, res) => {

    const planId = Number(req.params.id);

    if (!Number.isInteger(planId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid food plan ID"
        });
    }

    const planQuery = `
        SELECT
            id,
            plan_date,
            people,
            meal,
            menu,
            safety_buffer,
            effective_people
        FROM food_plans
        WHERE id = ?
    `;

    db.query(
        planQuery,
        [planId],
        (planError, plans) => {

            if (planError) {
                console.error(planError);

                return res.status(500).json({
                    success: false,
                    message: "Failed to get food plan"
                });
            }

            if (plans.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Food plan not found"
                });
            }

            const ingredientQuery = `
                SELECT
                    name,
                    quantity_per_person,
                    unit,
                    total_quantity
                FROM food_plan_ingredients
                WHERE food_plan_id = ?
                ORDER BY id
            `;

            db.query(
                ingredientQuery,
                [planId],
                (ingredientError, ingredients) => {

                    if (ingredientError) {
                        console.error(ingredientError);

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to get food plan ingredients"
                        });
                    }

                    const plan = {
                        id: plans[0].id,
                        date: plans[0].plan_date,
                        people: plans[0].people,
                        meal: plans[0].meal,
                        menu: plans[0].menu,
                        safetyBuffer:
                            Number(plans[0].safety_buffer),
                        effectivePeople:
                            plans[0].effective_people,

                        ingredients:
                            ingredients.map(
                                ingredient => ({
                                    name: ingredient.name,
                                    quantityPerPerson:
                                        Number(
                                            ingredient.quantity_per_person
                                        ),
                                    unit: ingredient.unit,
                                    totalQuantity:
                                        Number(
                                            ingredient.total_quantity
                                        )
                                })
                            )
                    };

                    res.json({
                        success: true,
                        plan: plan
                    });
                }
            );
        }
    );
});

// =====================================
// DASHBOARD API
// =====================================

app.get("/api/dashboard", (req, res) => {

    const menuQuery = `
        SELECT COUNT(*) AS totalMenus
        FROM menus
    `;

    const planQuery = `
        SELECT COUNT(*) AS totalPlans
        FROM food_plans
    `;

    const todayPeopleQuery = `
        SELECT
            COALESCE(SUM(people), 0) AS todayPeople
        FROM food_plans
        WHERE DATE(plan_date) = CURDATE()
    `;

    const todayMealsQuery = `
        SELECT COUNT(*) AS todayMeals
        FROM food_plans
        WHERE DATE(plan_date) = CURDATE()
    `;

    db.query(
        menuQuery,
        (menuError, menuResult) => {

            if (menuError) {
                console.error(menuError);

                return res.status(500).json({
                    success: false,
                    message: "Failed to get menu count"
                });
            }

            db.query(
                planQuery,
                (planError, planResult) => {

                    if (planError) {
                        console.error(planError);

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to get food plan count"
                        });
                    }

                    db.query(
                        todayPeopleQuery,
                        (peopleError, peopleResult) => {

                            if (peopleError) {
                                console.error(peopleError);

                                return res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to get today's people count"
                                });
                            }

                            db.query(
                                todayMealsQuery,
                                (mealError, mealResult) => {

                                    if (mealError) {
                                        console.error(mealError);

                                        return res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to get today's meal count"
                                        });
                                    }

                                    res.json({
                                        success: true,

                                        dashboard: {
                                            totalMenus:
                                                menuResult[0].totalMenus,

                                            totalPlans:
                                                planResult[0].totalPlans,

                                            todayPeople:
                                                peopleResult[0].todayPeople,

                                            todayMeals:
                                                mealResult[0].todayMeals
                                        }
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

// =====================================
// CREATE MEAL SCHEDULE
// =====================================

app.post("/api/schedules", (req, res) => {

    const {
        scheduleDate,
        mealType,
        mealTime,
        menuId,
        people
    } = req.body;

    if (
        !scheduleDate ||
        !mealType ||
        !mealTime ||
        !menuId ||
        !people
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Date, meal type, time, menu and people are required"
        });
    }

    if (Number(people) <= 0) {
        return res.status(400).json({
            success: false,
            message:
                "Number of people must be greater than 0"
        });
    }

    const checkMenuQuery = `
        SELECT id, name, meal
        FROM menus
        WHERE id = ?
    `;

    db.query(
        checkMenuQuery,
        [Number(menuId)],
        (menuError, menus) => {

            if (menuError) {
                console.error(menuError);

                return res.status(500).json({
                    success: false,
                    message: "Failed to check menu"
                });
            }

            if (menus.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Selected menu not found"
                });
            }

            const insertQuery = `
                INSERT INTO meal_schedules
                (
                    schedule_date,
                    meal_type,
                    meal_time,
                    menu_id,
                    people,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertQuery,
                [
                    scheduleDate,
                    mealType,
                    mealTime,
                    Number(menuId),
                    Number(people),
                    "Planned"
                ],
                (insertError, result) => {

                    if (insertError) {
                        console.error(insertError);

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to create meal schedule"
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message:
                            "Meal schedule created successfully",

                        schedule: {
                            id: result.insertId,
                            scheduleDate: scheduleDate,
                            mealType: mealType,
                            mealTime: mealTime,
                            menuId: Number(menuId),
                            menuName: menus[0].name,
                            people: Number(people),
                            status: "Planned"
                        }
                    });
                }
            );
        }
    );
});

// =====================================
// GET ALL MEAL SCHEDULES
// =====================================

app.get("/api/schedules", (req, res) => {

    const query = `
        SELECT
            ms.id,
            ms.schedule_date,
            ms.meal_type,
            ms.meal_time,
            ms.menu_id,
            ms.people,
            ms.status,
            ms.created_at,
            m.name AS menu_name,
            m.meal AS menu_meal
        FROM meal_schedules ms
        INNER JOIN menus m
            ON ms.menu_id = m.id
        ORDER BY
            ms.schedule_date DESC,
            ms.meal_time ASC,
            ms.id DESC
    `;

    db.query(
        query,
        (error, schedules) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to get meal schedules"
                });
            }

            const result =
                schedules.map(schedule => ({
                    id: schedule.id,
                    scheduleDate:
                        schedule.schedule_date,
                    mealType:
                        schedule.meal_type,
                    mealTime:
                        schedule.meal_time,
                    menuId:
                        schedule.menu_id,
                    menuName:
                        schedule.menu_name,
                    menuMeal:
                        schedule.menu_meal,
                    people:
                        schedule.people,
                    status:
                        schedule.status,
                    createdAt:
                        schedule.created_at
                }));

            res.json({
                success: true,
                count: result.length,
                schedules: result
            });
        }
    );
});

// =====================================
// GET SCHEDULE BY ID
// =====================================

app.get("/api/schedules/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid schedule ID"
        });
    }

    const query = `
        SELECT
            ms.id,
            ms.schedule_date,
            ms.meal_type,
            ms.meal_time,
            ms.menu_id,
            ms.people,
            ms.status,
            ms.created_at,
            m.name AS menu_name,
            m.meal AS menu_meal
        FROM meal_schedules ms
        INNER JOIN menus m
            ON ms.menu_id = m.id
        WHERE ms.id = ?
    `;

    db.query(
        query,
        [id],
        (error, schedules) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    success: false,
                    message: "Failed to get schedule"
                });
            }

            if (schedules.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Schedule not found"
                });
            }

            const schedule = schedules[0];

            res.json({
                success: true,

                schedule: {
                    id: schedule.id,
                    scheduleDate:
                        schedule.schedule_date,
                    mealType:
                        schedule.meal_type,
                    mealTime:
                        schedule.meal_time,
                    menuId:
                        schedule.menu_id,
                    menuName:
                        schedule.menu_name,
                    menuMeal:
                        schedule.menu_meal,
                    people:
                        schedule.people,
                    status:
                        schedule.status,
                    createdAt:
                        schedule.created_at
                }
            });
        }
    );
});

// =====================================
// UPDATE MEAL SCHEDULE
// =====================================

app.put("/api/schedules/:id", (req, res) => {

    const id = Number(req.params.id);

    const {
        scheduleDate,
        mealType,
        mealTime,
        menuId,
        people,
        status
    } = req.body;

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid schedule ID"
        });
    }

    if (
        !scheduleDate ||
        !mealType ||
        !mealTime ||
        !menuId ||
        !people
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Date, meal type, time, menu and people are required"
        });
    }

    const query = `
        UPDATE meal_schedules
        SET
            schedule_date = ?,
            meal_type = ?,
            meal_time = ?,
            menu_id = ?,
            people = ?,
            status = ?
        WHERE id = ?
    `;

    db.query(
        query,
        [
            scheduleDate,
            mealType,
            mealTime,
            Number(menuId),
            Number(people),
            status || "Planned",
            id
        ],
        (error, result) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to update meal schedule"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Schedule not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Meal schedule updated successfully"
            });
        }
    );
});

// =====================================
// UPDATE SCHEDULE STATUS
// =====================================

app.patch("/api/schedules/:id/status", (req, res) => {

    const id = Number(req.params.id);

    const { status } = req.body;

    const validStatuses = [
        "Planned",
        "Cooking",
        "Completed",
        "Cancelled"
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status"
        });
    }

    const query = `
        UPDATE meal_schedules
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        query,
        [status, id],
        (error, result) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to update status"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Schedule not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Schedule status updated successfully",
                status: status
            });
        }
    );
});

// =====================================
// DELETE MEAL SCHEDULE
// =====================================

app.delete("/api/schedules/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid schedule ID"
        });
    }

    const query = `
        DELETE FROM meal_schedules
        WHERE id = ?
    `;

    db.query(
        query,
        [id],
        (error, result) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to delete schedule"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Schedule not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Meal schedule deleted successfully"
            });
        }
    );
});

// =====================================
// TODAY'S KITCHEN SCHEDULE
// =====================================

app.get("/api/today-schedules", (req, res) => {

    const query = `
        SELECT
            ms.id,
            ms.schedule_date,
            ms.meal_type,
            ms.meal_time,
            ms.menu_id,
            ms.people,
            ms.status,
            m.name AS menu_name
        FROM meal_schedules ms
        INNER JOIN menus m
            ON ms.menu_id = m.id
        WHERE ms.schedule_date = CURDATE()
        ORDER BY
            FIELD(
                ms.meal_type,
                'Breakfast',
                'Lunch',
                'Dinner'
            ),
            ms.meal_time ASC
    `;

    db.query(query, (error, schedules) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to get today's schedules"
            });
        }

        const result = schedules.map(schedule => ({
            id: schedule.id,
            scheduleDate:
                schedule.schedule_date,
            mealType:
                schedule.meal_type,
            mealTime:
                schedule.meal_time,
            menuId:
                schedule.menu_id,
            menuName:
                schedule.menu_name,
            people:
                schedule.people,
            status:
                schedule.status
        }));

        res.json({
            success: true,
            count: result.length,
            schedules: result
        });
    });
});

// =====================================
// GET INVENTORY
// =====================================

app.get("/api/inventory", (req, res) => {

    const query = `
        SELECT
            id,
            item_name,
            quantity,
            unit,
            minimum_stock,
            created_at,
            updated_at
        FROM inventory
        ORDER BY item_name ASC
    `;

    db.query(query, (error, items) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Failed to get inventory"
            });
        }

        res.json({
            success: true,
            count: items.length,
            inventory: items
        });
    });
});

// =====================================
// ADD INVENTORY ITEM
// =====================================

app.post("/api/inventory", (req, res) => {

    const {
        itemName,
        quantity,
        unit,
        minimumStock
    } = req.body;

    if (
        !itemName ||
        quantity === undefined ||
        !unit
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Item name, quantity and unit are required"
        });
    }

    const query = `
        INSERT INTO inventory
        (
            item_name,
            quantity,
            unit,
            minimum_stock
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        query,
        [
            itemName,
            Number(quantity),
            unit,
            Number(minimumStock) || 0
        ],
        (error, result) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to add inventory item"
                });
            }

            res.status(201).json({
                success: true,
                message:
                    "Inventory item added successfully",

                item: {
                    id: result.insertId,
                    itemName: itemName,
                    quantity: Number(quantity),
                    unit: unit,
                    minimumStock:
                        Number(minimumStock) || 0
                }
            });
        }
    );
});

// =====================================
// UPDATE INVENTORY
// =====================================

app.put("/api/inventory/:id", (req, res) => {

    const id = Number(req.params.id);

    const {
        quantity,
        minimumStock
    } = req.body;

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid inventory ID"
        });
    }

    const query = `
        UPDATE inventory
        SET
            quantity = ?,
            minimum_stock = ?
        WHERE id = ?
    `;

    db.query(
        query,
        [
            Number(quantity),
            Number(minimumStock) || 0,
            id
        ],
        (error, result) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to update inventory"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Inventory item not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Inventory updated successfully"
            });
        }
    );
});

// =====================================
// DELETE INVENTORY
// =====================================

app.delete("/api/inventory/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid inventory ID"
        });
    }

    const query = `
        DELETE FROM inventory
        WHERE id = ?
    `;

    db.query(
        query,
        [id],
        (error, result) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to delete inventory item"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Inventory item not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Inventory item deleted successfully"
            });
        }
    );
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});