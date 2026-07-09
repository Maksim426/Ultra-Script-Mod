Events.on(ClientLoadEvent, function(e) {
    var scope = Vars.mods.getScripts().scope;
    var states = {};

    var toggle = function(name, actionOn, actionOff) {
        states[name] = !states[name];
        states[name] ? actionOn() : actionOff();
        Log.info(">>> " + name + " : " + (states[name] ? "ВКЛ" : "ВЫКЛ"));
    };

    scope.help = function() {
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
    };

    scope.creative = function() { toggle('creative', function() { Vars.state.rules.infiniteResources = true; Vars.state.rules.modeName = "sandbox"; }, function() { Vars.state.rules.infiniteResources = false; Vars.state.rules.modeName = "survival"; }); };
    scope.editor = function() { toggle('editor', function() { Vars.state.rules.editor = true; }, function() { Vars.state.rules.editor = false; }); };
    scope.instantbuild = function() { toggle('instantbuild', function() { Vars.state.rules.buildSpeedMultiplier = 9999; }, function() { Vars.state.rules.buildSpeedMultiplier = 1; }); };
    scope.god = function() { toggle('god', function() { Vars.player.unit().health = 999999; }, function() { Vars.player.unit().health = 100; }); };
    scope.fly = function() { toggle('fly', function() { Vars.player.unit().type.flying = true; }, function() { Vars.player.unit().type.flying = false; }); };
    scope.shield = function() { toggle('shield', function() { Vars.player.unit().shield = 9999; }, function() { Vars.player.unit().shield = 0; }); };
    
    scope.win = function() { Vars.logic.skipWave(); return ">>> Победа"; };
    scope.kill = function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); return ">>> Враги уничтожены"; };
    scope.fill = function() { var c = Vars.player.unit().core(); if(c) { Vars.content.items().each(function(i) { c.items.set(i, c.storageCapacity); }); return ">>> Ядро заполнено"; } return ">>> Нет ядра"; };
    scope.heal = function() { Groups.build.each(function(b) { if (b.team == Vars.player.team()) b.health = b.maxHealth; }); return ">>> Исцелено"; };
    scope.spawn = function() { for(var i=0; i<5; i++) { var u = Vars.player.unit().type.create(Vars.player.team()); u.set(Vars.player.x, Vars.player.y); u.add(); } return ">>> Юниты созданы"; };
    scope.dump = function() { var c = Vars.player.unit().core(); if(c) { c.items.clear(); return ">>> Ядро очищено"; } return ">>> Нет ядра"; };
    
    scope.off = function() {
        for(var key in states) { states[key] = false; }
        Vars.state.rules.infiniteResources = false;
        Vars.state.rules.editor = false;
        Vars.state.rules.modeName = "survival";
        Vars.state.rules.buildSpeedMultiplier = 1;
        if(Vars.player.unit()) { Vars.player.unit().shield = 0; Vars.player.unit().type.flying = false; Vars.player.unit().health = 100; }
        Log.info(">>> СИСТЕМЫ СБРОШЕНЫ");
    };
    
    Log.info("ULTRASCRIPT MOD ЗАГРУЖЕН. Введите help()");
});
          
