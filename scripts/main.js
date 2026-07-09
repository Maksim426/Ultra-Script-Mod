(function() {
    var scope = (typeof vars !== 'undefined') ? this : (function() { return this; })();
    var states = { god: false };
    var savedResearch = [];
    
    var printHelp = function() {
        Log.info("\n=== ULTRASCRIPT V21.0 ===");
        Log.info("creative : Ресурсы + Все исследования");
        Log.info("editor : Редактор");
        Log.info("god : Бессмертие");
        Log.info("instant : Мгновенная стройка");
        Log.info("win : Захватить сектор");
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
        if (u && states.god) {
            u.health = u.maxHealth;
            u.shield = 999999;
        }
    });

    Object.defineProperty(scope, 'help', { get: function() { printHelp(); return ""; }, configurable: true });

    Object.defineProperty(scope, 'creative', { get: function() { 
        Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources; 
        
        if (Vars.state.rules.infiniteResources) {
            savedResearch = [];
            Vars.content.each(function(c) {
                if (c instanceof Packages.mindustry.type.UnlockableContent) {
                    if (c.unlocked()) {
                        savedResearch.push(c);
                    }
                    c.unlock();
                    if (c.techNode) {
                        c.techNode.unlocked = true;
                    }
                }
            });
            return "Creative: ON (Абсолютно все исследования разблокированы!)";
        } else {
            Vars.content.each(function(c) {
                if (c instanceof Packages.mindustry.type.UnlockableContent) {
                    if (c.techNode) {
                        c.techNode.unlocked = false;
                    }
                }
            });
            
            if (Vars.state.isCampaign()) {
                Vars.universe.clearResearch();
                for (var i = 0; i < savedResearch.length; i++) {
                    savedResearch[i].unlock();
                }
            }
            return "Creative: OFF (Исследования возвращены к исходному состоянию)";
        }
    }, configurable: true });

    Object.defineProperty(scope, 'editor', { get: function() { Vars.state.rules.editor = !Vars.state.rules.editor; return "Editor: " + (Vars.state.rules.editor ? "ON" : "OFF"); }, configurable: true });
    
    Object.defineProperty(scope, 'god', { get: function() { 
        states.god = !states.god; 
        var u = Vars.player.unit();
        if (u) {
            if (states.god) {
                u.health = u.maxHealth;
                u.shield = 999999;
            } else {
                u.shield = 0;
            }
        }
        return "God Mode: " + (states.god ? "ON" : "OFF"); 
    }, configurable: true });
    
    Object.defineProperty(scope, 'instant', { get: function() { Vars.state.rules.buildSpeedMultiplier = (Vars.state.rules.buildSpeedMultiplier == 1 ? 9999 : 1); return "Instant Build: " + (Vars.state.rules.buildSpeedMultiplier > 1 ? "ON" : "OFF"); }, configurable: true });
    
    // Исправленный и стабильный захват сектора для версии 159.2
    Object.defineProperty(scope, 'win', { get: function() { 
        if (Vars.state.isCampaign() && Vars.state.rules.sector) {
            var sector = Vars.state.rules.sector;
            
            // Заставляем игру думать, что все вражеские базы уничтожены, и вызываем триггер победы
            sector.createBase(); 
            Vars.state.gameOver = true;
            sector.unlocked = true;
            
            // Если на карте есть вражеские ядра — уничтожаем их, чтобы сработал стандартный финал карты
            Groups.build.each(function(b) {
                if (b.team != Vars.player.team() && b instanceof Packages.mindustry.world.blocks.storage.CoreBlock.CoreBuild) {
                    b.kill();
                }
            });
            
            return "Сектор переведен в состояние победы! Уничтожьте оставшихся врагов или подождите секунду.";
        }
        return "Ошибка: Вы должны находиться в режиме Кампании!";
    }, configurable: true });

    Object.defineProperty(scope, 'kill', { get: function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); return "Враги уничтожены"; }, configurable: true });
    
    // Исправлено: строго маленькая буква fill
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
    
    Object.defineProperty(scope, 'off', { get: function() { 
        states.god = false; 
        Vars.state.rules.infiniteResources = false; 
        Vars.state.rules.editor = false; 
        Vars.state.rules.buildSpeedMultiplier = 1; 
        if(Vars.player.unit()) Vars.player.unit().shield = 0; 
        if (Vars.state.isCampaign()) {
            Vars.universe.clearResearch();
            for (var i = 0; i < savedResearch.length; i++) {
                savedResearch[i].unlock();
            }
        }
        return "Системы сброшены"; 
    }, configurable: true });

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
                    
