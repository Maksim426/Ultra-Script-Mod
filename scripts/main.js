(function() {
    var scope = (typeof vars !== 'undefined') ? this : (function() { return this; })();
    var states = { god: false, shield: false };
    
    var printHelp = function() {
        Log.info("\n[blue]=== ULTRASCRIPT V27.4 - АКТИВИРОВАН ===");
        Log.info("[blue]creative[/blue]     : Ресурсы (песочница)");
        Log.info("[blue]editor[/blue]       : Режим редактора");
        Log.info("[blue]god[/blue]          : Бессмертие");
        Log.info("[blue]instant[/blue]      : Мгновенная стройка");
        Log.info("[blue]shield[/blue]       : Бесконечный щит");
        Log.info("[blue]win[/blue]          : Победа в волне");
        Log.info("[blue]kill[/blue]         : Убить врагов");
        Log.info("[blue]fill[/blue]         : Заполнить ядро");
        Log.info("[blue]dump[/blue]         : Очистить ядро");
        Log.info("[blue]heal[/blue]         : Исцелить постройки");
        Log.info("[blue]spawn[/blue]        : Инструкция по спавну");
        Log.info("[blue]off[/blue]          : Сброс настроек");
        Log.info("[white]Используй [blue]help[/blue] для повторного вывода меню.[/white]");
    };

    Events.on("worldLoad", printHelp);

    Events.on("update", function() {
        var u = Vars.player.unit();
        if (u) {
            if (states.god) u.health = u.maxHealth;
            if (states.shield) u.shield = 9999;
        }
    });

    Object.defineProperty(scope, 'help', { get: function() { printHelp(); return ""; }, configurable: true });

    Object.defineProperty(scope, 'creative', { get: function() { Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources; Log.info(">>> Creative: " + (Vars.state.rules.infiniteResources ? "[green]ВКЛ" : "[red]ВЫКЛ")); return ""; }, configurable: true });
    Object.defineProperty(scope, 'editor', { get: function() { Vars.state.rules.editor = !Vars.state.rules.editor; Log.info(">>> Editor: " + (Vars.state.rules.editor ? "[green]ВКЛ" : "[red]ВЫКЛ")); return ""; }, configurable: true });
    Object.defineProperty(scope, 'god', { get: function() { states.god = !states.god; Log.info(">>> God Mode: " + (states.god ? "[green]ВКЛ" : "[red]ВЫКЛ")); return ""; }, configurable: true });
    Object.defineProperty(scope, 'instant', { get: function() { Vars.state.rules.buildSpeedMultiplier = (Vars.state.rules.buildSpeedMultiplier == 1 ? 9999 : 1); Log.info(">>> Instant Build: " + (Vars.state.rules.buildSpeedMultiplier > 1 ? "[green]ВКЛ" : "[red]ВЫКЛ")); return ""; }, configurable: true });
    
    Object.defineProperty(scope, 'shield', { get: function() { 
        states.shield = !states.shield; 
        if(states.shield && Vars.player.unit()) Vars.player.unit().shield = 9999;
        Log.info(">>> Shield: " + (states.shield ? "[green]ВКЛ" : "[red]ВЫКЛ")); 
        return ""; 
    }, configurable: true });

    Object.defineProperty(scope, 'win', { get: function() { Vars.logic.skipWave(); return ">>> Победа!"; }, configurable: true });
    Object.defineProperty(scope, 'kill', { get: function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); return ">>> Враги уничтожены"; }, configurable: true });
    
    Object.defineProperty(scope, 'fill', { get: function() { 
        var unit = Vars.player.unit();
        if(unit && unit.core()) {
            var core = unit.core();
            var planetItems = Vars.state.rules.sector.planet.items;
            Vars.content.items().each(function(i) { 
                if (planetItems.contains(i)) {
                    core.items.set(i, core.storageCapacity); 
                }
            });
            return ">>> Ядро заполнено ресурсами планеты"; 
        }
        return ">>> Нет ядра"; 
    }, configurable: true });

    Object.defineProperty(scope, 'dump', { get: function() { var c = Vars.player.unit() ? Vars.player.unit().core() : null; if(c) { c.items.clear(); return ">>> Ядро очищено"; } return ">>> Нет ядра"; }, configurable: true });
    Object.defineProperty(scope, 'heal', { get: function() { Groups.build.each(function(b) { if (b.team == Vars.player.team()) b.health = b.maxHealth; }); return ">>> Постройки исцелены"; }, configurable: true });
    Object.defineProperty(scope, 'off', { get: function() { states.god = false; states.shield = false; Vars.state.rules.infiniteResources = false; Vars.state.rules.editor = false; Vars.state.rules.buildSpeedMultiplier = 1; if(Vars.player.unit()) Vars.player.unit().shield = 0; return ">>> Системы сброшены"; }, configurable: true });

    Object.defineProperty(scope, 'spawn', { get: function() { 
        Log.info("[blue]Для спавна введите: spawn_unit('имя')[/blue]");
        return ""; 
    }, configurable: true });

    scope.spawn_unit = function(name) {
        var type = Vars.content.units().find(function(u) { return u.name.includes(name); });
        if (type) {
            var u = type.create(Vars.player.team());
            u.set(Vars.player.x, Vars.player.y);
            u.add();
            return ">>> Юнит " + type.name + " заспавнен!";
        }
        return "[red]Ошибка: Юнит не найден.";
    };
})();
                
