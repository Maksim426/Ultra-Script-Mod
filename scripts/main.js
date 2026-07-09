(function() {
    var scope = (typeof vars !== 'undefined') ? this : (function() { return this; })();
    var states = { god: false, shield: false };
    
    var printHelp = function() {
        Log.info("\n[blue]==========================================");
        Log.info("[blue]||  [white]ULTRASCRIPT V21.1 - ПАНЕЛЬ УПРАВЛЕНИЯ[/white]  [blue]||");
        Log.info("[blue]==========================================[/blue]");
        Log.info("[blue] creative [/white]: Ресурсы (песочница)");
        Log.info("[blue] editor   [/white]: Режим редактора");
        Log.info("[blue] god      [/white]: Бессмертие");
        Log.info("[blue] instant  [/white]: Мгновенная стройка");
        Log.info("[blue] shield   [/white]: Бесконечный щит");
        Log.info("[blue] win      [/white]: Завершить волну");
        Log.info("[blue] kill     [/white]: Уничтожить врагов");
        Log.info("[blue] fill     [/white]: Заполнить ядро");
        Log.info("[blue] dump     [/white]: Очистить ядро");
        Log.info("[blue] heal     [/white]: Исцелить постройки");
        Log.info("[blue] spawn(n) [/white]: Спавн юнита (напр. spawn('dagger'))");
        Log.info("[blue] off      [/white]: Сброс всех систем");
        Log.info("[blue]==========================================");
        Log.info("[white] Используй [blue]help[/blue] или [blue]help_spawn[/blue] для помощи.[/white]");
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
    
    Object.defineProperty(scope, 'help_spawn', { get: function() { 
        Log.info("\n[blue]-- ИНСТРУКЦИЯ ПО СПАВНУ --");
        Log.info("[white]Для спавна введите: [blue]spawn('имя_юнита')[/blue]");
        Log.info("[white]Пример: [blue]spawn('dagger')[/blue]");
        return ""; 
    }, configurable: true });

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

    Object.defineProperty(scope, 'win', { get: function() { 
        Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); });
        if (typeof Vars.spawner !== 'undefined' && Vars.spawner !== null && Vars.spawner.waves !== null) {
            Vars.spawner.waves.clear();
        }
        return ">>> Волна принудительно завершена!"; 
    }, configurable: true });
    
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

    scope.spawn = function(name) {
        if (!name) { Log.info("[red]Ошибка: Введите имя юнита в скобках, напр: spawn('dagger')"); return ""; }
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
        
