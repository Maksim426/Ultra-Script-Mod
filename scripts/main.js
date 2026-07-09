Events.on(ClientLoadEvent, function(e) {
    Vars.mods.getScripts().scope.c = {
        help: function() {
            Log.info("\n=== СПРАВКА ПО КОМАНДАМ ===");
            Log.info("c.creative    : Ресурсы и песочница");
            Log.info("c.editor      : Режим редактора");
            Log.info("c.god         : Бессмертие");
            Log.info("c.instant     : Мгновенная стройка");
            Log.info("c.fly         : Полет");
            Log.info("c.shield      : Бесконечный щит");
            Log.info("c.win         : Победить в волне");
            Log.info("c.kill        : Убить всех врагов");
            Log.info("c.fill        : Заполнить ядро");
            Log.info("c.heal        : Исцелить постройки");
            Log.info("c.spawn       : Создать 5 юнитов");
            Log.info("c.dump        : Очистить ядро");
            Log.info("c.off         : Отключить всё");
            Log.info("===========================");
            return "";
        },
        states: {},
        toggle: function(name, on, off) {
            this.states[name] = !this.states[name];
            this.states[name] ? on() : off();
            Log.info(">>> " + name + " : " + (this.states[name] ? "ВКЛ" : "ВЫКЛ"));
        }
    };

    var c = Vars.mods.getScripts().scope.c;

    Object.defineProperty(c, 'creative', { get: function() { c.toggle('creative', function() { Vars.state.rules.infiniteResources = true; Vars.state.rules.modeName = "sandbox"; }, function() { Vars.state.rules.infiniteResources = false; Vars.state.rules.modeName = "survival"; }); } });
    Object.defineProperty(c, 'editor',   { get: function() { c.toggle('editor', function() { Vars.state.rules.editor = true; }, function() { Vars.state.rules.editor = false; }); } });
    Object.defineProperty(c, 'instant',  { get: function() { c.toggle('instant', function() { Vars.state.rules.buildSpeedMultiplier = 9999; }, function() { Vars.state.rules.buildSpeedMultiplier = 1; }); } });
    Object.defineProperty(c, 'god',      { get: function() { c.toggle('god', function() { Vars.player.unit().health = 999999; }, function() { Vars.player.unit().health = 100; }); } });
    Object.defineProperty(c, 'fly',      { get: function() { c.toggle('fly', function() { Vars.player.unit().type.flying = true; }, function() { Vars.player.unit().type.flying = false; }); } });
    Object.defineProperty(c, 'shield',   { get: function() { c.toggle('shield', function() { Vars.player.unit().shield = 9999; }, function() { Vars.player.unit().shield = 0; }); } });
    
    Object.defineProperty(c, 'win',   { get: function() { Vars.logic.skipWave(); return ">>> Вперед на одну волну"; } });
    Object.defineProperty(c, 'kill',  { get: function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); return ">>> Враги уничтожены"; } });
    Object.defineProperty(c, 'fill',  { get: function() { var core = Vars.player.unit().core(); if(core) { Vars.content.items().each(function(i) { core.items.set(i, core.storageCapacity); }); return ">>> Ядро заполнено"; } return ">>> Нет ядра"; } });
    Object.defineProperty(c, 'heal',  { get: function() { Groups.build.each(function(b) { if (b.team == Vars.player.team()) b.health = b.maxHealth; }); return ">>> Все постройки исцелены"; } });
    Object.defineProperty(c, 'spawn', { get: function() { for(var i=0; i<5; i++) { var u = Vars.player.unit().type.create(Vars.player.team()); u.set(Vars.player.x, Vars.player.y); u.add(); } return ">>> 5 юнитов создано"; } });
    Object.defineProperty(c, 'dump',  { get: function() { var core = Vars.player.unit().core(); if(core) { core.items.clear(); return ">>> Ядро полностью очищено"; } return ">>> Нет ядра"; } });
    
    Object.defineProperty(c, 'off', { get: function() {
        for(var key in c.states) { c.states[key] = false; }
        Vars.state.rules.infiniteResources = false;
        Vars.state.rules.editor = false;
        Vars.state.rules.modeName = "survival";
        Vars.state.rules.buildSpeedMultiplier = 1;
        if(Vars.player.unit()) { Vars.player.unit().shield = 0; Vars.player.unit().type.flying = false; Vars.player.unit().health = 100; }
        return ">>> ВСЕ СИСТЕМЫ СБРОШЕНЫ";
    } });

    Log.info("\n[cyan]Ultra Script Mod успешно загружен![]");
    c.help();
});
