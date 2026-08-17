const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

const PORT = process.env.PORT || 3000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
    res.send("Smart Food Planner Backend is Running");
});


// =====================================================
// TEST
// =====================================================

app.get("/api/message", (req, res) => {

    res.json({
        success: true,
        message: "Backend connected successfully!"
    });

});


// =====================================================
// MENUS
// =====================================================

// GET ALL MENUS

app.get("/api/menus", (req, res) => {

    const query = `
        SELECT
            id,
            name,
            meal
        FROM menus
        ORDER BY id DESC
    `;

    db.query(
        query,
        (error, menus) => {

            if (error) {

                console.error(
                    "Menus error:",
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to get menus",
                    error: error.message
                });

            }

            res.json({
                success: true,
                count: menus.length,
                menus: menus
            });

        }
    );

});


// CREATE MENU

app.post("/api/menus", (req, res) => {

    const {
        name,
        meal
    } = req.body;

    if (!name || !meal) {

        return res.status(400).json({
            success: false,
            message: "name and meal are required"
        });

    }

    const query = `
        INSERT INTO menus
        (
            name,
            meal
        )
        VALUES (?, ?)
    `;

    db.query(
        query,
        [
            name,
            meal
        ],
        (error, result) => {

            if (error) {

                console.error(
                    "Create menu error:",
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to create menu",
                    error: error.message
                });

            }

            res.status(201).json({
                success: true,
                message: "Menu created successfully",
                menu: {
                    id: result.insertId,
                    name: name,
                    meal: meal
                }
            });

        }
    );

});


// GET MENU BY ID

app.get("/api/menus/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid menu ID"
        });

    }

    const menuQuery = `
        SELECT
            id,
            name,
            meal
        FROM menus
        WHERE id = ?
    `;

    db.query(
        menuQuery,
        [id],
        (menuError, menuResults) => {

            if (menuError) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to get menu",
                    error: menuError.message
                });

            }

            if (menuResults.length === 0) {

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
                [id],
                (ingredientError, ingredients) => {

                    if (ingredientError) {

                        return res.status(500).json({
                            success: false,
                            message: "Failed to get ingredients",
                            error: ingredientError.message
                        });

                    }

                    res.json({
                        success: true,

                        menu: {
                            id: menuResults[0].id,
                            name: menuResults[0].name,
                            meal: menuResults[0].meal,

                            ingredients:
                                ingredients.map(
                                    ingredient => ({
                                        id: ingredient.id,

                                        name:
                                            ingredient.name,

                                        quantityPerPerson:
                                            Number(
                                                ingredient.quantity_per_person
                                            ),

                                        unit:
                                            ingredient.unit
                                    })
                                )
                        }
                    });

                }
            );

        }
    );

});


// UPDATE MENU

app.put("/api/menus/:id", (req, res) => {

    const id = Number(req.params.id);

    const {
        name,
        meal
    } = req.body;

    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid menu ID"
        });

    }

    if (!name || !meal) {

        return res.status(400).json({
            success: false,
            message: "name and meal are required"
        });

    }

    const query = `
        UPDATE menus
        SET
            name = ?,
            meal = ?
        WHERE id = ?
    `;

    db.query(
        query,
        [
            name,
            meal,
            id
        ],
        (error, result) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to update menu",
                    error: error.message
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
                message: "Menu updated successfully"
            });

        }
    );

});


// DELETE MENU

app.delete("/api/menus/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid menu ID"
        });

    }

    db.query(
        `
        DELETE FROM menus
        WHERE id = ?
        `,
        [id],
        (error, result) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete menu",
                    error: error.message
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


// =====================================================
// INVENTORY
// =====================================================

// GET INVENTORY

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
        ORDER BY id DESC
    `;

    db.query(
        query,
        (error, inventory) => {

            if (error) {

                console.error(
                    "Inventory error:",
                    error.message
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to get inventory",
                    error: error.message
                });

            }

            res.json({
                success: true,
                count: inventory.length,
                inventory: inventory
            });

        }
    );

});


// CREATE INVENTORY ITEM

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
        !unit ||
        minimumStock === undefined
    ) {

        return res.status(400).json({
            success: false,
            message:
                "itemName, quantity, unit and minimumStock are required"
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
            Number(minimumStock)
        ],
        (error, result) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to create inventory item",
                    error: error.message
                });

            }

            res.status(201).json({
                success: true,
                message:
                    "Inventory item created successfully",
                inventoryId:
                    result.insertId
            });

        }
    );

});


// UPDATE INVENTORY

app.put("/api/inventory/:id", (req, res) => {

    const id = Number(req.params.id);

    const {
        itemName,
        quantity,
        unit,
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
            item_name = ?,
            quantity = ?,
            unit = ?,
            minimum_stock = ?
        WHERE id = ?
    `;

    db.query(
        query,
        [
            itemName,
            Number(quantity),
            unit,
            Number(minimumStock),
            id
        ],
        (error, result) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to update inventory item",
                    error: error.message
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
                    "Inventory item updated successfully"
            });

        }
    );

});


// DELETE INVENTORY

app.delete("/api/inventory/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid inventory ID"
        });

    }

    db.query(
        `
        DELETE FROM inventory
        WHERE id = ?
        `,
        [id],
        (error, result) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to delete inventory item",
                    error: error.message
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


// =====================================================
// MEAL SCHEDULES
// =====================================================

// GET ALL MEAL SCHEDULES

app.get("/api/meal-schedules", (req, res) => {

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
        LEFT JOIN menus m
            ON ms.menu_id = m.id
        ORDER BY
            ms.schedule_date DESC,
            ms.meal_time ASC
    `;

    db.query(
        query,
        (error, schedules) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to get meal schedules",
                    error: error.message
                });

            }

            res.json({
                success: true,
                count: schedules.length,
                schedules: schedules
            });

        }
    );

});


// CREATE MEAL SCHEDULE

app.post("/api/meal-schedules", (req, res) => {

    const {
        scheduleDate,
        mealType,
        mealTime,
        menuId,
        people,
        status
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
                "scheduleDate, mealType, mealTime, menuId and people are required"
        });

    }

    const query = `
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
        query,
        [
            scheduleDate,
            mealType,
            mealTime,
            Number(menuId),
            Number(people),
            status || "Planned"
        ],
        (error, result) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to create meal schedule",
                    error: error.message
                });

            }

            res.status(201).json({
                success: true,
                message:
                    "Meal schedule created successfully",
                scheduleId:
                    result.insertId
            });

        }
    );

});


// UPDATE MEAL SCHEDULE

app.put("/api/meal-schedules/:id", (req, res) => {

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

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to update meal schedule",
                    error: error.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Meal schedule not found"
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


// DELETE MEAL SCHEDULE

app.delete("/api/meal-schedules/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {

        return res.status(400).json({
            success: false,
            message: "Invalid schedule ID"
        });

    }

    db.query(
        `
        DELETE FROM meal_schedules
        WHERE id = ?
        `,
        [id],
        (error, result) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to delete meal schedule",
                    error: error.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Meal schedule not found"
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


// UPDATE SCHEDULE STATUS

app.patch(
    "/api/meal-schedules/:id/status",
    (req, res) => {

        const id = Number(req.params.id);

        const {
            status
        } = req.body;

        const validStatuses = [
            "Planned",
            "Cooking",
            "Preparing",
            "Completed",
            "Cancelled"
        ];

        if (!validStatuses.includes(status)) {

            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });

        }

        db.query(
            `
            UPDATE meal_schedules
            SET status = ?
            WHERE id = ?
            `,
            [
                status,
                id
            ],
            (error, result) => {

                if (error) {

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to update status",
                        error: error.message
                    });

                }

                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "Meal schedule not found"
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

    }
);


// =====================================================
// FOOD CALCULATOR
// =====================================================

app.post("/api/calculator", (req, res) => {

    const {
        menu_id,
        people,
        safety_buffer = 0
    } = req.body;

    if (!menu_id) {

        return res.status(400).json({
            success: false,
            message: "menu_id is required"
        });

    }

    if (
        !people ||
        Number(people) <= 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "people must be greater than 0"
        });

    }

    if (
        Number(safety_buffer) < 0 ||
        Number(safety_buffer) > 100
    ) {

        return res.status(400).json({
            success: false,
            message:
                "safety_buffer must be between 0 and 100"
        });

    }

    const numberOfPeople =
        Number(people);

    const buffer =
        Number(safety_buffer);

    const effectivePeople =
        Math.ceil(
            numberOfPeople *
            (1 + buffer / 100)
        );

    db.query(
        `
        SELECT
            id,
            name,
            meal
        FROM menus
        WHERE id = ?
        `,
        [
            Number(menu_id)
        ],
        (
            menuError,
            menuResults
        ) => {

            if (menuError) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to get menu",
                    error:
                        menuError.message
                });

            }

            if (menuResults.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Menu not found"
                });

            }

            const menu =
                menuResults[0];

            db.query(
                `
                SELECT
                    id,
                    menu_id,
                    name,
                    quantity_per_person,
                    unit
                FROM ingredients
                WHERE menu_id = ?
                ORDER BY id
                `,
                [
                    Number(menu_id)
                ],
                (
                    ingredientError,
                    ingredients
                ) => {

                    if (ingredientError) {

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to get ingredients",
                            error:
                                ingredientError.message
                        });

                    }

                    if (
                        ingredients.length === 0
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "No ingredients found for this menu"
                        });

                    }

                    const calculatedIngredients =
                        ingredients.map(
                            ingredient => {

                                const quantityPerPerson =
                                    Number(
                                        ingredient.quantity_per_person
                                    );

                                const totalQuantity =
                                    quantityPerPerson *
                                    effectivePeople;

                                return {

                                    id:
                                        ingredient.id,

                                    name:
                                        ingredient.name,

                                    quantityPerPerson:
                                        quantityPerPerson,

                                    unit:
                                        ingredient.unit,

                                    totalQuantity:
                                        Number(
                                            totalQuantity.toFixed(3)
                                        )

                                };

                            }
                        );

                    res.json({

                        success: true,

                        message:
                            "Food calculated successfully",

                        menu:
                            menu,

                        people:
                            numberOfPeople,

                        safety_buffer:
                            buffer,

                        effective_people:
                            effectivePeople,

                        ingredients:
                            calculatedIngredients

                    });

                }
            );

        }
    );

});


// =====================================================
// SAVE FOOD PLAN
// =====================================================

app.post("/api/food-plans", (req, res) => {

    const {
        plan_date,
        people,
        meal,
        menu,
        menu_id,
        safety_buffer = 0,
        ingredients
    } = req.body;

    if (
        !plan_date ||
        !people ||
        !meal ||
        !menu ||
        !menu_id ||
        !ingredients ||
        !Array.isArray(ingredients) ||
        ingredients.length === 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "plan_date, people, meal, menu, menu_id and ingredients are required"
        });

    }

    const numberOfPeople =
        Number(people);

    const buffer =
        Number(safety_buffer);

    if (numberOfPeople <= 0) {

        return res.status(400).json({
            success: false,
            message:
                "people must be greater than 0"
        });

    }

    if (
        buffer < 0 ||
        buffer > 100
    ) {

        return res.status(400).json({
            success: false,
            message:
                "safety_buffer must be between 0 and 100"
        });

    }

    const effectivePeople =
        Math.ceil(
            numberOfPeople *
            (1 + buffer / 100)
        );

    db.beginTransaction(
        transactionError => {

            if (transactionError) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to start transaction",
                    error:
                        transactionError.message
                });

            }

            const foodPlanQuery = `
                INSERT INTO food_plans
                (
                    plan_date,
                    people,
                    meal,
                    menu,
                    safety_buffer,
                    effective_people
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                foodPlanQuery,
                [
                    plan_date,
                    numberOfPeople,
                    meal,
                    menu,
                    buffer,
                    effectivePeople
                ],
                (
                    foodPlanError,
                    foodPlanResult
                ) => {

                    if (foodPlanError) {

                        return db.rollback(
                            () => {

                                res.status(500).json({
                                    success: false,
                                    message:
                                        "Failed to save food plan",
                                    error:
                                        foodPlanError.message
                                });

                            }
                        );

                    }

                    const foodPlanId =
                        foodPlanResult.insertId;

                    const ingredientQuery = `
                        INSERT INTO food_plan_ingredients
                        (
                            food_plan_id,
                            name,
                            total_quantity,
                            unit
                        )
                        VALUES ?
                    `;

                    const ingredientValues =
                        ingredients.map(
                            ingredient => [

                                foodPlanId,

                                ingredient.name,

                                Number(
                                    ingredient.totalQuantity
                                ),

                                ingredient.unit

                            ]
                        );

                    db.query(
                        ingredientQuery,
                        [
                            ingredientValues
                        ],
                        ingredientError => {

                            if (ingredientError) {

                                return db.rollback(
                                    () => {

                                        res.status(500).json({
                                            success: false,
                                            message:
                                                "Failed to save food plan ingredients",
                                            error:
                                                ingredientError.message
                                        });

                                    }
                                );

                            }

                            db.commit(
                                commitError => {

                                    if (commitError) {

                                        return db.rollback(
                                            () => {

                                                res.status(500).json({
                                                    success: false,
                                                    message:
                                                        "Failed to save food plan",
                                                    error:
                                                        commitError.message
                                                });

                                            }
                                        );

                                    }

                                    res.status(201).json({

                                        success:
                                            true,

                                        message:
                                            "Food plan saved successfully",

                                        foodPlanId:
                                            foodPlanId,

                                        people:
                                            numberOfPeople,

                                        safety_buffer:
                                            buffer,

                                        effective_people:
                                            effectivePeople,

                                        ingredients:
                                            ingredients

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


// =====================================================
// FOOD PLAN HISTORY
// =====================================================

app.get("/api/food-plans", (req, res) => {

    const query = `
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
        query,
        (error, plans) => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to get food plans",
                    error:
                        error.message
                });

            }

            res.json({
                success: true,
                count:
                    plans.length,
                plans:
                    plans
            });

        }
    );

});


// =====================================================
// GET FOOD PLAN BY ID
// =====================================================

app.get("/api/food-plans/:id", (req, res) => {

    const foodPlanId =
        Number(req.params.id);

    if (
        !Number.isInteger(foodPlanId) ||
        foodPlanId <= 0
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid food plan ID"
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
        [
            foodPlanId
        ],
        (
            planError,
            plans
        ) => {

            if (planError) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to get food plan",
                    error:
                        planError.message
                });

            }

            if (plans.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Food plan not found"
                });

            }

            const ingredientQuery = `
                SELECT
                    id,
                    food_plan_id,
                    name,
                    total_quantity,
                    unit
                FROM food_plan_ingredients
                WHERE food_plan_id = ?
                ORDER BY id
            `;

            db.query(
                ingredientQuery,
                [
                    foodPlanId
                ],
                (
                    ingredientError,
                    ingredients
                ) => {

                    if (ingredientError) {

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to get food plan ingredients",
                            error:
                                ingredientError.message
                        });

                    }

                    res.json({

                        success:
                            true,

                        foodPlan: {

                            ...plans[0],

                            ingredients:
                                ingredients.map(
                                    ingredient => ({

                                        id:
                                            ingredient.id,

                                        name:
                                            ingredient.name,

                                        totalQuantity:
                                            Number(
                                                ingredient.total_quantity
                                            ),

                                        unit:
                                            ingredient.unit

                                    })
                                )

                        }

                    });

                }
            );

        }
    );

});


// =====================================================
// DEDUCT FOOD PLAN FROM INVENTORY
// =====================================================

app.post(
    "/api/food-plans/:id/deduct-inventory",
    (req, res) => {

        const foodPlanId =
            Number(req.params.id);

        if (
            !Number.isInteger(foodPlanId) ||
            foodPlanId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid food plan ID"
            });

        }

        const ingredientQuery = `
            SELECT
                name,
                total_quantity,
                unit
            FROM food_plan_ingredients
            WHERE food_plan_id = ?
        `;

        db.query(
            ingredientQuery,
            [
                foodPlanId
            ],
            (
                ingredientError,
                ingredients
            ) => {

                if (ingredientError) {

                    return res.status(500).json({
                        success: false,
                        message:
                            "Failed to get food plan ingredients",
                        error:
                            ingredientError.message
                    });

                }

                if (ingredients.length === 0) {

                    return res.status(404).json({
                        success: false,
                        message:
                            "No ingredients found"
                    });

                }

                db.beginTransaction(
                    transactionError => {

                        if (transactionError) {

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Failed to start transaction",
                                error:
                                    transactionError.message
                            });

                        }

                        const updatedItems = [];

                        const processIngredient =
                            index => {

                                if (
                                    index >=
                                    ingredients.length
                                ) {

                                    return db.commit(
                                        commitError => {

                                            if (
                                                commitError
                                            ) {

                                                return db.rollback(
                                                    () => {

                                                        res.status(500).json({
                                                            success:
                                                                false,

                                                            message:
                                                                "Failed to commit inventory changes",

                                                            error:
                                                                commitError.message
                                                        });

                                                    }
                                                );

                                            }

                                            res.json({

                                                success:
                                                    true,

                                                message:
                                                    "Inventory deducted successfully",

                                                updatedItems:
                                                    updatedItems

                                            });

                                        }
                                    );

                                }

                                const ingredient =
                                    ingredients[index];

                                const inventoryQuery = `
                                    SELECT
                                        id,
                                        item_name,
                                        quantity,
                                        unit
                                    FROM inventory
                                    WHERE LOWER(
                                        TRIM(item_name)
                                    )
                                    =
                                    LOWER(
                                        TRIM(?)
                                    )
                                    LIMIT 1
                                    FOR UPDATE
                                `;

                                db.query(
                                    inventoryQuery,
                                    [
                                        ingredient.name
                                    ],
                                    (
                                        inventoryError,
                                        rows
                                    ) => {

                                        if (
                                            inventoryError
                                        ) {

                                            return db.rollback(
                                                () => {

                                                    res.status(500).json({
                                                        success:
                                                            false,

                                                        message:
                                                            "Failed to check inventory",

                                                        error:
                                                            inventoryError.message
                                                    });

                                                }
                                            );

                                        }

                                        if (
                                            rows.length === 0
                                        ) {

                                            return db.rollback(
                                                () => {

                                                    res.status(400).json({

                                                        success:
                                                            false,

                                                        message:
                                                            `Inventory item not found: ${ingredient.name}`

                                                    });

                                                }
                                            );

                                        }

                                        const inventory =
                                            rows[0];

                                        const required =
                                            Number(
                                                ingredient.total_quantity
                                            );

                                        const available =
                                            Number(
                                                inventory.quantity
                                            );

                                        if (
                                            inventory.unit
                                                .trim()
                                                .toLowerCase() !==
                                            ingredient.unit
                                                .trim()
                                                .toLowerCase()
                                        ) {

                                            return db.rollback(
                                                () => {

                                                    res.status(400).json({

                                                        success:
                                                            false,

                                                        message:
                                                            `Unit mismatch for ${ingredient.name}`,

                                                        inventoryUnit:
                                                            inventory.unit,

                                                        requiredUnit:
                                                            ingredient.unit

                                                    });

                                                }
                                            );

                                        }

                                        if (
                                            available <
                                            required
                                        ) {

                                            return db.rollback(
                                                () => {

                                                    res.status(400).json({

                                                        success:
                                                            false,

                                                        message:
                                                            `Insufficient stock for ${ingredient.name}`,

                                                        required:
                                                            required,

                                                        available:
                                                            available,

                                                        unit:
                                                            inventory.unit

                                                    });

                                                }
                                            );

                                        }

                                        const newQuantity =
                                            available -
                                            required;

                                        db.query(
                                            `
                                            UPDATE inventory
                                            SET quantity = ?
                                            WHERE id = ?
                                            `,
                                            [
                                                newQuantity,
                                                inventory.id
                                            ],
                                            updateError => {

                                                if (
                                                    updateError
                                                ) {

                                                    return db.rollback(
                                                        () => {

                                                            res.status(500).json({
                                                                success:
                                                                    false,

                                                                message:
                                                                    "Failed to update inventory",

                                                                error:
                                                                    updateError.message
                                                            });

                                                        }
                                                    );

                                                }

                                                updatedItems.push({

                                                    itemName:
                                                        inventory.item_name,

                                                    before:
                                                        available,

                                                    deducted:
                                                        required,

                                                    after:
                                                        newQuantity,

                                                    unit:
                                                        inventory.unit

                                                });

                                                processIngredient(
                                                    index + 1
                                                );

                                            }
                                        );

                                    }
                                );

                            };

                        processIngredient(0);

                    }
                );

            }
        );

    }
);


// =====================================================
// TODAY'S SCHEDULES
// =====================================================

app.get(
    "/api/today-schedules",
    (req, res) => {

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
            LEFT JOIN menus m
                ON ms.menu_id = m.id
            WHERE ms.schedule_date =
                CURDATE()
            ORDER BY
                FIELD(
                    ms.meal_type,
                    'Breakfast',
                    'Lunch',
                    'Snacks',
                    'Dinner'
                ),
                ms.meal_time ASC
        `;

        db.query(
            query,
            (
                error,
                schedules
            ) => {

                if (error) {

                    return res.status(500).json({
                        success:
                            false,

                        message:
                            "Failed to get today's schedules",

                        error:
                            error.message
                    });

                }

                res.json({
                    success:
                        true,

                    count:
                        schedules.length,

                    schedules:
                        schedules
                });

            }
        );

    }
);


// =====================================================
// DASHBOARD
// =====================================================

app.get(
    "/api/dashboard",
    (req, res) => {

        const queries = {

            foodPlans: `
                SELECT COUNT(*) AS count
                FROM food_plans
            `,

            menus: `
                SELECT COUNT(*) AS count
                FROM menus
            `,

            inventory: `
                SELECT COUNT(*) AS count
                FROM inventory
            `,

            lowStock: `
                SELECT COUNT(*) AS count
                FROM inventory
                WHERE quantity <= minimum_stock
            `,

            lowStockItems: `
                SELECT
                    id,
                    item_name,
                    quantity,
                    unit,
                    minimum_stock
                FROM inventory
                WHERE quantity <= minimum_stock
                ORDER BY quantity ASC
            `,

            todaySchedules: `
                SELECT
                    ms.id,
                    ms.schedule_date,
                    ms.meal_type,
                    ms.meal_time,
                    ms.people,
                    ms.status,
                    m.name AS menu_name
                FROM meal_schedules ms
                LEFT JOIN menus m
                    ON ms.menu_id = m.id
                WHERE DATE(ms.schedule_date) = CURDATE()
                ORDER BY ms.meal_time ASC
            `

        };

        db.query(
            queries.foodPlans,
            (
                foodPlanError,
                foodPlanRows
            ) => {

                if (foodPlanError) {

                    return dashboardError(
                        res,
                        foodPlanError
                    );

                }

                db.query(
                    queries.menus,
                    (
                        menuError,
                        menuRows
                    ) => {

                        if (menuError) {

                            return dashboardError(
                                res,
                                menuError
                            );

                        }

                        db.query(
                            queries.inventory,
                            (
                                inventoryError,
                                inventoryRows
                            ) => {

                                if (inventoryError) {

                                    return dashboardError(
                                        res,
                                        inventoryError
                                    );

                                }

                                db.query(
                                    queries.lowStock,
                                    (
                                        lowStockError,
                                        lowStockRows
                                    ) => {

                                        if (
                                            lowStockError
                                        ) {

                                            return dashboardError(
                                                res,
                                                lowStockError
                                            );

                                        }

                                        db.query(
                                            queries.lowStockItems,
                                            (
                                                lowStockItemsError,
                                                lowStockItems
                                            ) => {

                                                if (
                                                    lowStockItemsError
                                                ) {

                                                    return dashboardError(
                                                        res,
                                                        lowStockItemsError
                                                    );

                                                }

                                                db.query(
                                                    queries.todaySchedules,
                                                    (
                                                        todayScheduleError,
                                                        todaySchedules
                                                    ) => {

                                                        if (
                                                            todayScheduleError
                                                        ) {

                                                            return dashboardError(
                                                                res,
                                                                todayScheduleError
                                                            );

                                                        }

                                                        res.json({

                                                            success:
                                                                true,

                                                            summary: {

                                                                foodPlans:
                                                                    foodPlanRows[0].count,

                                                                menus:
                                                                    menuRows[0].count,

                                                                inventory:
                                                                    inventoryRows[0].count,

                                                                lowStock:
                                                                    lowStockRows[0].count

                                                            },

                                                            lowStockItems:
                                                                lowStockItems,

                                                            todaySchedules:
                                                                todaySchedules

                                                        });

                                                    }
                                                );

                                            }
                                        );

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);


// =====================================================
// DASHBOARD ERROR
// =====================================================

function dashboardError(
    res,
    error
) {

    console.error(
        "Dashboard error:",
        error.message
    );

    return res.status(500).json({

        success:
            false,

        message:
            "Failed to load dashboard",

        error:
            error.message

    });

}


// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success:
                false,

            message:
                `Cannot ${req.method} ${req.originalUrl}`

        });

    }
);


// =====================================================
// START SERVER
// =====================================================

const server = app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "================================="
        );

        console.log(
            "Smart Food Planner Backend"
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            "================================="
        );

    }
);


server.on(
    "error",
    error => {

        console.error(
            "SERVER ERROR:",
            error.message
        );

    }
);