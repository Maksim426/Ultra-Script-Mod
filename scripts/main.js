Events.on(ClientLoadEvent, function(event) {
    // Безопасная функция создания меню
    const openUltraScriptMenu = function() {
        // Проверяем, не открыто ли уже окно, чтобы избежать краша
        if (Vars.ui.hudGroup.find("ultraScriptDialog") != null) return;

        const dialog = new BaseDialog("UltraScript Control Panel");
        dialog.name = "ultraScriptDialog";
        
        dialog.cont.pane(function(table) {
            table.margin(20);
            
            const refreshMenu = function() {
                table.clear();
                
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

                table.add("[#ffff00]--- PLAYER ---").pad(10).colspan(2).row();
                addToggle("God Mode", "godMode", function(en) { 
                    let u = Vars.player.unit(); 
                    if(u) u.health = en ? 999999 : u.maxHealth; 
                });
                addToggle("Flight", "flightMode", function(en) { 
                    let u = Vars.player.unit(); 
                    if(u) { u.type.flying = en; u.type.canOverdrive = en; } 
                });

                table.add("[#ffff00]--- WORLD ---").pad(10).colspan(2).row();
                addToggle("Resources", "infiniteResources", function(en) { Vars.state.rules.infiniteResources = en; });
                addToggle("Fast Build", "fastBuild", function(en) { Vars.state.rules.buildSpeedMultiplier = en ? 9999 : 1; });

                table.button("Heal & Refill", function() {
                    Groups.build.each(function(b) { if(b.team == Vars.player.team()) { b.health = b.maxHealth; if(b.ammo != null) b.ammo = 999; }});
                }).size(320, 50).padTop(10).row();
            };

            refreshMenu();
        }).row();

        dialog.addCloseButton();
        dialog.show();
    };

    // Создаем кнопку в более стабильном контейнере
    const hudTable = new Table();
    hudTable.bottom().left().pad(10); // Переместил в нижний левый угол для стабильности
    hudTable.button("US", function() {
        openUltraScriptMenu();
    }).size(50, 50);
    
    Vars.ui.hudGroup.addChild(hudTable);
});

// Глобальный объект состояний должен быть доступен
const GameStates = {
    godMode: false,
    flightMode: false,
    infiniteResources: false,
    fastBuild: false
};
