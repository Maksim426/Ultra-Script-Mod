Events.on(ClientLoadEvent, function(e) {
    var handler = Vars.control.menu;
    
    function showHelp() {
        Log.info("\n--- ULTRASCRIPT HELP ---");
        Log.info("god   - Бессмертие");
        Log.info("fly   - Полет");
        Log.info("heal  - Лечение построек");
        Log.info("ammo  - Зарядка турелей");
        if(!Vars.net.active()) {
            Log.info("wave  - Пропустить волну");
            Log.info("kill  - Убить врагов");
        }
        Log.info("------------------------");
    }

    var cmds = {
        god: function() { 
            var u = Vars.player.unit(); 
            if(u) u.health = (u.health >= 999999 ? u.maxHealth : 999999);
            return "God: " + (u && u.health == 999999 ? "ON" : "OFF");
        },
        fly: function() { 
            var u = Vars.player.unit();
            if(u) { u.type.flying = !u.type.flying; }
            return "Fly: " + (u && u.type.flying ? "ON" : "OFF");
        },
        heal: function() {
            Groups.build.each(function(b) { if(b.team == Vars.player.team()) b.health = b.maxHealth; });
            return "Healed";
        },
        ammo: function() {
            Groups.build.each(function(b) { 
                if(b.team == Vars.player.team() && b instanceof Turret.TurretBuild) { 
                    b.ammo.clear(); 
                    Vars.content.items().each(function(i) { if(b.type.ammoTypes.containsKey(i)) b.ammo.add(i, 999); }); 
                } 
            });
            return "Ammo full";
        },
        help: function() { showHelp(); return "Список команд выше"; }
    };

    if(!Vars.net.active()) {
        cmds.wave = function() { Vars.logic.skipWave(); return "Wave skipped"; };
        cmds.kill = function() { Groups.unit.each(function(u) { if(u.team != Vars.player.team()) u.kill(); }); return "Enemies killed"; };
    }

    // Привязка к консоли
    for (var name in cmds) {
        var func = cmds[name];
        // Регистрация в консоль игры
        Vars.mods.getScripts().scope[name] = func;
    }

    Events.on(WorldLoadEvent, function() {
        Log.info("UltraScript загружен. Введите help для списка.");
        showHelp();
    });
});
