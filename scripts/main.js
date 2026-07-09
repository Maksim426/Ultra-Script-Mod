Events.on(ClientLoadEvent, function(e) {
    Vars.mods.getScripts().scope.c = {
        help: function() {
            Log.info("\n=== ULTRASCRIPT: СЕРВЕРНАЯ СИНХРОНИЗАЦИЯ ===");
            Log.info("c.creative    : Ресурсы и песочница для всего сервера");
            Log.info("c.editor      : Режим редактора для хоста");
            Log.info("c.god         : Бессмертие твоего юнита");
            Log.info("c.speed       : Суперскорость движения робота");
            Log.info("c.instant     : Мгновенная стройка для всех игроков");
            Log.info("c.fly         : Полет сквозь стены и преграды");
            Log.info("c.shield      : Бесконечный щит юнита");
            Log.info("c.fog         : ВКЛ/ВЫКЛ Туман войны для всех");
            Log.info("c.boost       : ВКЛ/ВЫКЛ Разгон заводов и буров на сервере");
            Log.info("c.wreck       : Уничтожить здания врага (синхронно)");
            Log.info("c.time        : Ускорение времени в 3 раза");
            Log.info("c.immortal    : Бессмертные постройки вашей команды");
            Log.info("c.ammo        : Зарядить ВСЕ турели до предела (999 патронов)");
            Log.info("c.wave        : Пропустить текущую волну для всех");
            Log.info("c.win         : Мгновенный захват сектора");
            Log.info("c.lose        : Взорвать ядро команды");
            Log.info("c.kill        : Уничтожить всех вражеских юнитов на сервере");
            Log.info("c.fill        : Полностью заполнить ядро ресурсами");
            Log.info("c.heal        : Полностью исцелить все свои здания");
            Log.info("c.spawn       : Создать 5 юнитов поддержки");
            Log.info("c.dump        : Полностью очистить ядро");
            Log.info("c.research    : Открыть все технологии");
            Log.info("c.team        : Сменить команду (за врагов/союзников)");
            Log.info("c.off         : Полный сброс всех читов и синхронизация");
            Log.info("=====================================================");
            return "";
        },
        states: {},
        toggle: function(name, on, off) {
            this.states[name] = !this.states[name];
            this.states[name] ? on() : off();
            Log.info(">>> " + name + " : " + (this.states[name] ? "ВКЛ" : "ВЫКЛ"));
            // Если мы хостим сервер, отправляем обновленные правила всем игрокам
            if(Vars.net.server()) {
                Call.setRules(Vars.state.rules);
            }
        }
    };

    var c = Vars.mods.getScripts().scope.c;

    // Глобальные правила игры (Rules) с синхронизацией по сети
    Object.defineProperty(c, 'creative', { get: function() { c.toggle('creative', function() { Vars.state.rules.infiniteResources = true; Vars.state.rules.modeName = "sandbox"; }, function() { Vars.state.rules.infiniteResources = false; Vars.state.rules.modeName = "survival"; }); } });
    Object.defineProperty(c, 'editor',   { get: function() { c.toggle('editor', function() { Vars.state.rules.editor = true; }, function() { Vars.state.rules.editor = false; }); } });
    Object.defineProperty(c, 'instant',  { get: function() { c.toggle('instant', function() { Vars.state.rules.buildSpeedMultiplier = 9999; }, function() { Vars.state.rules.buildSpeedMultiplier = 1; }); } });
    Object.defineProperty(c, 'immortal', { get: function() { c.toggle('immortal', function() { Vars.state.rules.blockHealthMultiplier = 99999; }, function() { Vars.state.rules.blockHealthMultiplier = 1; }); } });
    Object.defineProperty(c, 'fog',      { get: function() { c.toggle('fog', function() { Vars.state.rules.fog = false; }, function() { Vars.state.rules.fog = true; }); } });
    Object.defineProperty(c, 'boost',    { get: function() { c.toggle('boost', function() { Vars.state.rules.productionSpeedMultiplier = 100; }, function() { Vars.state.rules.productionSpeedMultiplier = 1; }); } });

    // Модификации только твоего локального юнита
    Object.defineProperty(c, 'god',      { get: function() { c.toggle('god', function() { if(Vars.player.unit()) Vars.player.unit().health = 999999; }, function() { if(Vars.player.unit()) Vars.player.unit().health = Vars.player.unit().maxHealth; }); } });
    Object.defineProperty(c, 'fly',      { get: function() { c.toggle('fly', function() { if(Vars.player.unit()) { Vars.player.unit().type.flying = true; Vars.player.unit().type.canClip = true; } }, function() { if(Vars.player.unit()) { Vars.player.unit().type.flying = Vars.player.unit().type.defaultController === null; Vars.player.unit().type.canClip = false; } }); } });
    Object.defineProperty(c, 'shield',   { get: function() { c.toggle('shield', function() { if(Vars.player.unit()) Vars.player.unit().shield = 9999; }, function() { if(Vars.player.unit()) Vars.player.unit().shield = 0; }); } });
    Object.defineProperty(c, 'speed',    { get: function() { c.toggle('speed', function() { if(Vars.player.unit()) Vars.player.unit().type.speed = Vars.player.unit().type.speed * 5; }, function() { if(Vars.player.unit()) Vars.player.unit().type.speed = Vars.player.unit().type.speed / 5; }); } });

    // Управление временем и волнами (Сетевые вызовы)
    Object.defineProperty(c, 'time',     { get: function() { c.toggle('time', function() { Time.setDeltaProvider(function() { return Core.graphics.getDeltaTime() * 60 * 3; }); }, function() { Time.setDeltaProvider(null); }); } });
    Object.defineProperty(c, 'wave',     { get: function() { if(Vars.net.server()) { Call.skipWave(); } else { Vars.logic.skipWave(); } return ">>> Волна пропущена"; } });

    // Взаимодействие с объектами на сервере
    Object.defineProperty(c, 'kill',   { get: function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); return ">>> Враги уничтожены"; } });
    Object.defineProperty(c, 'wreck',  { get: function() { Groups.build.each(function(b) { if (b.team != Vars.player.team()) b.kill(); }); return ">>> Все вражеские постройки уничтожены"; } });
    Object.defineProperty(c, 'heal',   { get: function() { Groups.build.each(function(b) { if (b.team == Vars.player.team()) b.health = b.maxHealth; }); return ">>> Все постройки исцелены"; } });
    
    // ИСПРАВЛЕННАЯ ЗАРЯДКА: Напрямую забивает магазин до предела
    Object.defineProperty(c, 'ammo',   { get: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team() && b instanceof Turret.TurretBuild) { b.ammo.clear(); Vars.content.items().each(function(i) { if(b.type.ammoTypes.containsKey(i)) { b.ammo.add(i, 999); } }); } }); return ">>> Все турели полностью заряжены патронами!"; } });

    // Глобальная работа с Ядром (Синхронизируется базой данных ресурсов)
    Object.defineProperty(c, 'fill',   { get: function() { var core = Vars.player.unit().core(); if(core) { Vars.content.items().each(function(i) { if(i.unlockedNow()) core.items.set(i, core.storageCapacity); }); return ">>> Ядро заполнено"; } return ">>> Нет ядра"; } });
    Object.defineProperty(c, 'dump',   { get: function() { var core = Vars.player.unit().core(); if(core) { core.items.clear(); return ">>> Ядро очищено"; } return ">>> Нет ядра"; } });

    // Разное
    Object.defineProperty(c, 'spawn',  { get: function() { for(var i=0; i<5; i++) { var u = Vars.player.unit().type.create(Vars.player.team()); u.set(Vars.player.x, Vars.player.y); u.add(); } return ">>> 5 юнитов создано"; } });
    Object.defineProperty(c, 'win',    { get: function() { Events.fire(new SectorCaptureEvent(Vars.state.getSector())); if(Vars.net.server()) Call.sendMessage("[green]Сектор Захвачен Хостом![]"); else Vars.ui.hudfrag.showToast("Сектор Захвачен!"); return ">>> ПОБЕДА"; } });
    Object.defineProperty(c, 'lose',   { get: function() { var core = Vars.player.unit().core(); if(core) { core.kill(); } else { Groups.build.each(function(b) { if(b instanceof CoreBlock.CoreBuild && b.team == Vars.player.team()) b.kill(); }); } return ">>> ПОТЕРЯ СЕКТОРА"; } });
    Object.defineProperty(c, 'research', { get: function() { Vars.content.each(function(content) { if (content instanceof UnlockableContent) content.quietUnlock(); }); return ">>> Все технологии открыты!"; } });
    Object.defineProperty(c, 'team',     { get: function() { var u = Vars.player.unit(); if(u) { u.team(u.team() == Team.sharded ? Team.crux : Team.sharded); return ">>> Команда изменена"; } return ">>> Юнит не найден"; } });

    // Сброс и синхронизация отката изменений для всех
    Object.defineProperty(c, 'off', { get: function() {
        for(var key in c.states) { c.states[key] = false; }
        Vars.state.rules.infiniteResources = false;
        Vars.state.rules.editor = false;
        Vars.state.rules.modeName = "survival";
        Vars.state.rules.buildSpeedMultiplier = 1;
        Vars.state.rules.blockHealthMultiplier = 1;
        Vars.state.rules.fog = true;
        Vars.state.rules.productionSpeedMultiplier = 1;
        Time.setDeltaProvider(null);
        if(Vars.player.unit()) { 
            Vars.player.unit().shield = 0; 
            Vars.player.unit().type.flying = false; 
            Vars.player.unit().type.canClip = false; 
            Vars.player.unit().health = Vars.player.unit().maxHealth; 
            Vars.player.unit().team(Team.sharded); 
        }
        if(Vars.net.server()) {
            Call.setRules(Vars.state.rules);
        }
        return ">>> СБРОС СИСТЕМ НА СЕРВЕРЕ";
    } });

    Log.info("\n[cyan]Ultra Script Mod успешно загружен![]");
    c.help();
});
        
