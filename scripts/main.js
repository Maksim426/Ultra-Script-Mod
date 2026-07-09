(function() {
    var scope = (typeof vars !== 'undefined') ? this : (function() { return this; })();
    var states = { god: false, shield: false };
    
    var printHelp = function() {
        Log.info("\n=== ULTRASCRIPT V21.0 ===");
        Log.info("creative : Ресурсы");
        Log.info("editor : Редактор");
        Log.info("god : Бессмертие");
        Log.info("instant : Мгновенная стройка");
        Log.info("shield : Бесконечный щит");
        Log.info("kill : Убить врагов");
        Log.info("fill : Заполнить ядро");
        Log.info("ammo : Заполнить все турели патронами");
        Log.info("dump : Очистить ядро");
        Log.info("heal : Исцелить постройки");
        Log.info("spawn : Спавн юнита");
        Log.info("off : Сброс настроек");
        Log.info("=========================");
    };

    Events.on(EventType.WorldLoadEvent, printHelp);

    Events.on(EventType.UnitControlEvent, function() {
        var u = Vars.player.unit();
        if (u) {
            if (states.god) u.health = u.maxHealth;
            if (states.shield) u.shield = 9999;
        }
    });

    Object.defineProperty(scope, 'help', { get: function() { printHelp(); return ""; }, configurable: true });

    Object.defineProperty(scope, 'creative', { get: function() { Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources; return "Creative: " + (Vars.state.rules.infiniteResources ? "ON" : "OFF"); }, configurable: true });
    Object.defineProperty(scope, 'editor', { get: function() { Vars.state.rules.editor = !Vars.state.rules.editor; return "Editor: " + (Vars.state.rules.editor ? "ON" : "OFF"); }, configurable: true });
    Object.defineProperty(scope, 'god', { get: function() { states.god = !states.god; return "God Mode: " + (states.god ? "ON" : "OFF"); }, configurable: true });
    Object.defineProperty(scope, 'instant', { get: function() { Vars.state.rules.buildSpeedMultiplier = (Vars.state.rules.buildSpeedMultiplier == 1 ? 9999 : 1); return "Instant Build: " + (Vars.state.rules.buildSpeedMultiplier > 1 ? "ON" : "OFF"); }, configurable: true });
    
    Object.defineProperty(scope, 'shield', { get: function() { 
        states.shield = !states.shield; 
        if(states.shield && Vars.player.unit()) Vars.player.unit().shield = 9999;
        return "Shield: " + (states.shield ? "ON" : "OFF"); 
    }, configurable: true });
    
    Object.defineProperty(scope, 'kill', { get: function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); return "Враги уничтожены"; }, configurable: true });
    
    Object.defineProperty(scope, 'fill', { get: function() { 
        var unit = Vars.player.unit();
        if(unit && unit.core()) {
            Vars.content.items().each(function(i) { unit.core().items.set(i, unit.core().storageCapacity); });
            return "Ядро заполнено!"; 
        }
        return "Нет ядра"; 
    }, configurable: true });

    Object.defineProperty(scope, 'ammo', { get: function() { 
        var count = 0;
        Groups.build.each(function(b) { 
            if (b.team == Vars.player.team() && b instanceof Packages.mindustry.world.blocks.defense.turrets.Turret.TurretBuild) {
                var block = b.block;
                
                if (block.ammoTypes) {
                    Vars.content.items().each(function(i) {
                        if (block.ammoTypes.containsKey(i)) {
                            for (var c = 0; c < block.maxAmmo; c++) {
                                b.handleItem(null, i);
                            }
                            b.items.set(i, block.itemCapacity);
                        }
                    });
                }

                if (b.liquids) {
                    Vars.content.liquids().each(function(l) {
                        b.liquids.set(l, block.liquidCapacity);
                    });
                }

                if (b.cons && b.cons.power) {
                    b.power.status = 1;
                }
                
                count++;
            }
        });
        return "Все турели полностью заряжены! Всего: " + count; 
    }, configurable: true });

    Object.defineProperty(scope, 'dump', { get: function() { var c = Vars.player.unit() ? Vars.player.unit().core() : null; if(c) { c.items.clear(); return "Ядро очищено"; } return "Нет ядра"; }, configurable: true });
    Object.defineProperty(scope, 'heal', { get: function() { Groups.build.each(function(b) { if (b.team == Vars.player.team()) b.health = b.maxHealth; }); return "Постройки исцелены"; }, configurable: true });
    Object.defineProperty(scope, 'off', { get: function() { states.god = false; states.shield = false; Vars.state.rules.infiniteResources = false; Vars.state.rules.editor = false; Vars.state.rules.buildSpeedMultiplier = 1; if(Vars.player.unit()) Vars.player.unit().shield = 0; return "Системы сброшены"; }, configurable: true });

    scope.spawn = function(name) {
        var type = Vars.content.units().find(function(u) { return u.name.includes(name); });
        if (type) {
            var u = type.create(Vars.player.team());
            u.set(Vars.player.x, Vars.player.y);
            u.add();
            return type.name + " заспавнен!";
        }
        return "Ошибка: юнит не найден.";
    };
})();
