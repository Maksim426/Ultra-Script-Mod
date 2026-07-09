(function() {
    var scope = (typeof vars !== 'undefined') ? this : (function() { return this; })();
    var states = { god: false, shield: false };
    
    // Функция вывода полного меню
    var printHelp = function() {
        Log.info("\n[yellow]=== ULTRASCRIPT V27.0 - АКТИВИРОВАН ===");
        Log.info("[yellow]creative[/yellow]     : Ресурсы (песочница)");
        Log.info("[yellow]editor[/yellow]       : Режим редактора");
        Log.info("[yellow]god[/yellow]          : Бессмертие");
        Log.info("[yellow]instant[/yellow]      : Мгновенная стройка");
        Log.info("[yellow]shield[/yellow]       : Бесконечный щит");
        Log.info("[yellow]win[/yellow]          : Победа в волне");
        Log.info("[yellow]kill[/yellow]         : Убить врагов");
        Log.info("[yellow]fill[/yellow]         : Заполнить ядро");
        Log.info("[yellow]dump[/yellow]         : Очистить ядро");
        Log.info("[yellow]heal[/yellow]         : Исцелить постройки");
        Log.info("[yellow]spawn[/yellow]        : Спавн юнитов");
        Log.info("[yellow]off[/yellow]          : Сброс настроек");
        Log.info("[lightgray]Используй [yellow]help[/yellow] для повторного вывода меню.[/lightgray]");
    };

    // Авто-вывод при загрузке мира
    Events.on(WorldLoadEvent, printHelp);

    Events.on(UpdateEvent, function() {
        var u = Vars.player.unit();
        if (u) {
            if (states.god) u.health = u.maxHealth;
            if (states.shield) u.shield = 9999;
        }
    });

    // Команда вызова меню
    Object.defineProperty(scope, 'help', { get: function() { printHelp(); return ""; }, configurable: true });

    // Переключатели
    Object.defineProperty(scope, 'creative', { get: function() { Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources; Log.info(">>> Creative: " + (Vars.state.rules.infiniteResources ? "[green]ВКЛ" : "[red]ВЫКЛ")); return ""; }, configurable: true });
    Object.defineProperty(scope, 'editor', { get: function() { Vars.state.rules.editor = !Vars.state.rules.editor; Log.info(">>> Editor: " + (Vars.state.rules.editor ? "[green]ВКЛ" : "[red]ВЫКЛ")); return ""; }, configurable: true });
    Object.defineProperty(scope, 'god', { get: function() { states.god = !states.god; Log.info(">>> God Mode: " + (states.god ? "[green]ВКЛ" : "[red]ВЫКЛ")); return ""; }, configurable: true });
    Object.defineProperty(scope, 'instant', { get: function() { Vars.state.rules.buildSpeedMultiplier = (Vars.state.rules.buildSpeedMultiplier == 1 ? 9999 : 1); Log.info(">>> Instant Build: " + (Vars.state.rules.buildSpeedMultiplier > 1 ? "[green]ВКЛ" : "[red]ВЫКЛ")); return ""; }, configurable: true });
    Object.defineProperty(scope, 'shield', { get: function() { states.shield = !states.shield; Log.info(">>> Shield: " + (states.shield ? "[green]ВКЛ" : "[red]ВЫКЛ")); return ""; }, configurable: true });

    // Команды
    Object.defineProperty(scope, 'win', { get: function() { Vars.logic.skipWave(); return ">>> Победа!"; }, configurable: true });
    Object.defineProperty(scope, 'kill', { get: function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); return ">>> Враги уничтожены"; }, configurable: true });
    Object.defineProperty(scope, 'fill', { get: function() { var c = Vars.player.unit() ? Vars.player.unit().core() : null; if(c) { Vars.content.items().each(function(i) { c.items.set(i, c.storageCapacity); }); return ">>> Ядро заполнено"; } return ">>> Нет ядра"; }, configurable: true });
    Object.defineProperty(scope, 'dump', { get: function() { var c = Vars.player.unit() ? Vars.player.unit().core() : null; if(c) { c.items.clear(); return ">>> Ядро очищено"; } return ">>> Нет ядра"; }, configurable: true });
    Object.defineProperty(scope, 'heal', { get: function() { Groups.build.each(function(b) { if (b.team == Vars.player.team()) b.health = b.maxHealth; }); return ">>> Постройки исцелены"; }, configurable: true });
    Object.defineProperty(scope, 'off', { get: function() { states.god = false; states.shield = false; Vars.state.rules.infiniteResources = false; Vars.state.rules.editor = false; Vars.state.rules.buildSpeedMultiplier = 1; if(Vars.player.unit()) Vars.player.unit().shield = 0; return ">>> Системы сброшены"; }, configurable: true });

    // Спавн
    Object.defineProperty(scope, 'spawn', { get: function() { 
        Log.info("[yellow]Для спавна введите: spawn_unit('имя')[/yellow]");
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
 
