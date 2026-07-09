// UltraScript.js — Полноценный скрипт для управления игровым процессом Mindustry
Events.on(ClientLoadEvent, function(event) {
    const scope = Vars.mods.getScripts().scope;

    // Хранилище состояний для всех чит-функций
    const GameStates = {
        godMode: false,
        flightMode: false,
        personalShield: false,
        infiniteResources: false,
        editorMode: false,
        fastBuild: false
    };

    // Функция отрисовки основного диалогового окна
    const createUltraScriptMenu = function() {
        const dialog = new BaseDialog("UltraScript Control Panel");
        
        dialog.cont.pane(function(table) {
            table.margin(20);
            
            const refreshMenu = function() {
                table.clear();
                
                // Функция для создания переключателя
                const addToggle = function(label, stateKey, actionCallback) {
                    table.add(label).padRight(50).left();
                    table.button(function() {
                        return (GameStates[stateKey] ? "[#00ff00]ENABLED" : "[#ff0000]DISABLED");
                    }, function() {
                        GameStates[stateKey] = !GameStates[stateKey];
                        actionCallback(GameStates[stateKey]);
                        refreshMenu();
                    }).size(160, 50).right().row();
                };

                // Блок: Игрок
                table.add("[#ffff00]--- PLAYER CONFIGURATION ---").pad(15).colspan(2).row();
                addToggle("God Mode", "godMode", function(enabled) {
                    const unit = Vars.player.unit();
                    if (unit) unit.health = enabled ? 999999 : unit.maxHealth;
                });
                addToggle("Flight Mode", "flightMode", function(enabled) {
                    const unit = Vars.player.unit();
                    if (unit) {
                        unit.type.flying = enabled;
                        unit.type.canOverdrive = enabled;
                    }
                });
                addToggle("Personal Shield", "personalShield", function(enabled) {
                    const unit = Vars.player.unit();
                    if (unit) unit.shield = enabled ? 9999 : 0;
                });

                // Блок: Мир
                table.add("[#ffff00]--- WORLD CONFIGURATION ---").pad(15).colspan(2).row();
                addToggle("Infinite Resources", "infiniteResources", function(enabled) {
                    Vars.state.rules.infiniteResources = enabled;
                });
                addToggle("Fast Building", "fastBuild", function(enabled) {
                    Vars.state.rules.buildSpeedMultiplier = enabled ? 9999 : 1;
                });

                // Блок: Действия
                table.add("[#ffff00]--- INSTANT ACTIONS ---").pad(15).colspan(2).row();
                table.button("Heal All Friendly Buildings", function() {
                    Groups.build.each(function(building) {
                        if (building.team === Vars.player.team()) building.health = building.maxHealth;
                    });
                }).size(320, 50).row();
                
                table.button("Fill Core With Resources", function() {
                    const core = Vars.player.unit().core();
                    if (core) {
                        Vars.content.items().each(function(item) {
                            core.items.set(item, core.storageCapacity);
                        });
                    }
                }).size(320, 50).row();
                
                table.button("Kill All Hostile Units", function() {
                    Groups.unit.each(function(unit) {
                        if (unit.team !== Vars.player.team()) unit.kill();
                    });
                }).size(320, 50).row();

                // Системный сброс
                table.add("[#ffff00]--- SYSTEM ---").pad(15).colspan(2).row();
                table.button("Reset All States", function() {
                    for (let key in GameStates) GameStates[key] = false;
                    Vars.state.rules.infiniteResources = false;
                    Vars.state.rules.buildSpeedMultiplier = 1;
                    refreshMenu();
                }).size(320, 60).padTop(10).row();
            };

            refreshMenu();
        }).row();

        dialog.addCloseButton();
        dialog.show();
    };

    // Кнопка вызова меню на основном экране
    const hudTable = new Table();
    hudTable.setFillParent(true);
    hudTable.top().right().margin(30);
    hudTable.button("UltraScript", function() {
        createUltraScriptMenu();
    }).size(120, 60);
    
    Vars.ui.hudGroup.addChild(hudTable);
});
