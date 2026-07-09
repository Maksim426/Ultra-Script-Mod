(function() {
    var scope = (typeof vars !== 'undefined') ? this : (function() { return this; })();
    var states = {};
    
    var isOnline = Vars.net.active();
    var modeName = isOnline ? "СЕТЕВОЙ" : "ОДИНОЧНЫЙ";

    Log.info("\n=== ULTRASCRIPT V21.0 ===");
    Log.info("РЕЖИМ: " + modeName);
    Log.info("Команды: creative | editor | god | instantbuild | fly | shield | win | kill | fill | heal | spawn | dump | off");
    Log.info("Для справки введите: help");

    var toggle = function(name, actionOn, actionOff) {
        states[name] = !states[name];
        states[name] ? actionOn() : actionOff();
        Log.info(">>> " + name + " : " + (states[name] ? "ВКЛ" : "ВЫКЛ"));
    };

    Object.defineProperty(scope, 'help', { get: function() {
        Log.info("\n--- СПРАВКА ---");
        Log.info("creative:       Ресурсы и песочница");
        Log.info("editor:         Режим редактора");
        Log.info("god:            Бессмертие");
        Log.info("instantbuild:   Мгновенная стройка");
        Log.info("fly:            Полет");
        Log.info("shield:         Бесконечный щит");
        Log.info("win:            Победа в волне");
        Log.info("kill:           Убить врагов");
        Log.info("fill:           Заполнить ядро");
        Log.info("heal:           Исцеление построек");
        Log.info("spawn:          Создать 5 юнитов");
        Log.info("dump:           Очистить ядро");
        Log.info("off:            Сброс настроек");
        return "";
    }, configurable: true });

    Object.defineProperty(scope, 'creative', { get: function() { toggle('creative', function() { Vars.state.rules.infiniteResources = true; Vars.state.rules.modeName = "sandbox"; }, function() { Vars.state.rules.infiniteResources = false; Vars.state.rules.modeName = "survival"; }); return ""; }, configurable: true });
    Object.defineProperty(scope, 'editor', { get: function() { toggle('editor', function() { Vars.state.rules.editor = true; }, function() { Vars.state.rules.editor = false; }); return ""; }, configurable: true });
    Object.defineProperty(scope, 'instantbuild', { get: function() { toggle('instantbuild', function() { Vars.state.rules.buildSpeedMultiplier = 9999; }, function() { Vars.state.rules.buildSpeedMultiplier = 1; }); return ""; }, configurable: true });
    Object.defineProperty(scope, 'god', { get: function() { toggle('god', function() { Vars.player.unit().health = 999999; }, function() { Vars.player.unit().health = 100; }); return ""; }, configurable: true });
    Object.defineProperty(scope, 'fly', { get: function() { toggle('fly', function() { Vars.player.unit().type.flying = true; }, function() { Vars.player.unit().type.flying = false; }); return ""; }, configurable: true });
    Object.defineProperty(scope, 'shield', { get: function() { toggle('shield', function() { Vars.player.unit().shield = 9999; }, function() { Vars.player.unit().shield = 0; }); return ""; }, configurable: true });

    Object.defineProperty(scope, 'win', { get: function() { Vars.logic.skipWave(); return ">>> Победа"; }, configurable: true });
    Object.defineProperty(scope, 'kill', { get: function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); return ">>> Враги уничтожены"; }, configurable: true });
    Object.defineProperty(scope, 'fill', { get: function() { var c = Vars.player.unit().core(); if(c) { Vars.content.items().each(function(i) { c.items.set(i, c.storageCapacity); }); return ">>> Ядро заполнено"; } return ">>> Нет ядра"; }, configurable: true });
    Object.defineProperty(scope, 'heal', { get: function() { Groups.build.each(function(b) { if (b.team == Vars.player.team()) b.health = b.maxHealth; }); return ">>> Исцелено"; }, configurable: true });
    Object.defineProperty(scope, 'spawn', { get: function() { for(var i=0; i<5; i++) { var u = Vars.player.unit().type.create(Vars.player.team()); u.set(Vars.player.x, Vars.player.y); u.add(); } return ">>> Юниты созданы"; }, configurable: true });
    Object.defineProperty(scope, 'dump', { get: function() { var c = Vars.player.unit().core(); if(c) { c.items.clear(); return ">>> Ядро очищено"; } return ">>> Нет ядра"; }, configurable: true });

    Object.defineProperty(scope, 'off', { get: function() {
        for(var key in states) { states[key] = false; }
        Vars.state.rules.infiniteResources = false;
        Vars.state.rules.editor = false;
        Vars.state.rules.modeName = "survival";
        Vars.state.rules.buildSpeedMultiplier = 1;
        if(Vars.player.unit()) { Vars.player.unit().shield = 0; Vars.player.unit().type.flying = false; Vars.player.unit().health = 100; }
        Log.info(">>> СИСТЕМЫ СБРОШЕНЫ"); return "";
    }, configurable: true });
})(); void 0;
