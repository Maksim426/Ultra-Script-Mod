Events.on(ClientLoadEvent, function(e) {
    var scope = Vars.mods.getScripts().scope;
    var states = {};

    var cmdList = {
        god: { desc: "Бессмертие", act: function() { states.god = !states.god; var u = Vars.player.unit(); if(u) u.health = states.god ? 999999 : u.maxHealth; return "God: " + (states.god ? "ВКЛ" : "ВЫКЛ"); }},
        fly: { desc: "Полет", act: function() { states.fly = !states.fly; var u = Vars.player.unit(); if(u) { u.type.flying = states.fly; u.type.canClip = states.fly; } return "Fly: " + (states.fly ? "ВКЛ" : "ВЫКЛ"); }},
        shield: { desc: "Щит", act: function() { states.shield = !states.shield; var u = Vars.player.unit(); if(u) u.shield = states.shield ? 9999 : 0; return "Shield: " + (states.shield ? "ВКЛ" : "ВЫКЛ"); }},
        heal: { desc: "Починить всё", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team()) b.health = b.maxHealth; }); return "Здания восстановлены"; }},
        unwreck: { desc: "Восстановить разрушенное", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team() && b.health <= 0) b.heal(); }); return "Восстановлено"; }},
        ammo: { desc: "Зарядить турели", act: function() { Groups.build.each(function(b) { if(b.team == Vars.player.team() && b instanceof Turret.TurretBuild) { b.ammo.clear(); Vars.content.items().each(function(i) { if(b.type.ammoTypes.containsKey(i)) b.ammo.add(i, 999); }); } }); return "Турели заряжены"; }},
        fill: { desc: "Заполнить ядро ресурсами планеты", act: function() { 
            var core = Vars.player.unit().core();
            if(!core) return "Ядро не найдено";
            var planet = Vars.state.rules.sector.planet;
            Vars.content.items().each(function(i) {
                // Проверяем, доступны ли ресурсы на текущей планете
                if(i.unlockedNow() && (i.planet == planet || i.flammability > 0 || i.hardness >= 0)) {
                    core.items.set(i, core.storageCapacity);
                }
            });
            return "Ядро заполнено ресурсами " + planet.localizedName;
        }},
        speed: { desc: "Скорость бега", act: function() { states.sp = !states.sp; var u = Vars.player.unit(); if(u) u.type.speed = states.sp ? 5 : 1; return "Speed: " + (states.sp ? "x5" : "x1"); }},
        creative: { desc: "Бесконечные ресурсы", act: function() { states.res = !states.res; Vars.state.rules.infiniteResources = states.res; return "Creative: " + (states.res ? "ВКЛ" : "ВЫКЛ"); }},
        editor: { desc: "Режим редактора", act: function() { states.ed = !states.ed; Vars.state.rules.editor = states.ed; return "Editor: " + (states.ed ? "ВКЛ" : "ВЫКЛ"); }},
        instant: { desc: "Мгновенная постройка", act: function() { states.inst = !states.inst; Vars.state.rules.buildSpeedMultiplier = states.inst ? 9999 : 1; return "Instant: " + (states.inst ? "ВКЛ" : "ВЫКЛ"); }},
        immortal: { desc: "Бессмертные здания", act: function() { states.imm = !states.imm; Vars.state.rules.blockHealthMultiplier = states.imm ? 99999 : 1; return "Immortal: " + (states.imm ? "ВКЛ" : "ВЫКЛ"); }},
        fog: { desc: "Убрать туман войны", act: function() { states.fog = !states.fog; Vars.state.rules.fog = !states.fog; return "Fog: " + (states.fog ? "ВЫКЛ" : "ВКЛ"); }},
        boost: { desc: "Ускорить производство", act: function() { states.bst = !states.bst; Vars.state.rules.productionSpeedMultiplier = states.bst ? 100 : 1; return "Boost: " + (states.bst ? "x100" : "x1"); }},
        time: { desc: "Ускорить время", act: function() { states.tm = !states.tm; Time.setDeltaProvider(states.tm ? function() { return Core.graphics.getDeltaTime() * 60 * 3; } : null); return "Time: " + (states.tm ? "x3" : "x1"); }},
        wave: { desc: "Пропустить волну", act: function() { Vars.logic.skipWave(); return "Волна пропущена"; }},
        kill: { desc: "Убить врагов", act: function() { Groups.unit.each(function(u) { if(u.team != Vars.player.team()) u.kill(); }); return "Враги уничтожены"; }},
        wreck: { desc: "Удалить вражеские здания", act: function() { Groups.build.each(function(b) { if(b.team != Vars.player.team()) b.kill(); }); return "Здания разрушены"; }},
        neutral: { desc: "Нейтрализовать врагов", act: function() { Groups.unit.each(function(u) { if(u.team != Vars.player.team()) u.team(Team.derelict); }); return "Враги нейтральны"; }},
        dump: { desc: "Очистить ядро", act: function() { var c = Vars.player.unit().core(); if(c) c.items.clear(); return "Ядро очищено"; }},
        spawn: { desc: "Создать 5 юнитов", act: function() { for(var i=0; i<5; i++) { var u = Vars.player.unit().type.create(Vars.player.team()); u.set(Vars.player.x, Vars.player.y); u.add(); } return "Юниты созданы"; }},
        win: { desc: "Победа", act: function() { Events.fire(new SectorCaptureEvent(Vars.state.getSector())); return "Победа!"; }},
        lose: { desc: "Сброс волн", act: function() { Vars.state.wave = 1; Vars.logic.reset(); return "Сектор сброшен"; }}
    };

    // Регистрируем команды
    for (var name in cmdList) {
        (function(n) {
            Object.defineProperty(scope, n, {
                get: function() {
                    var res = cmdList[n].act();
                    Log.info("[#00ffff]>> " + res + "[]");
                    return ""; // Пустота, чтобы не дублировалось в консоли Rhino
                }
            });
        })(name);
    }

    // Команда help
    Object.defineProperty(scope, "help", {
        get: function() {
            Log.info("\n[#00ff00]=== UltraScript: Список команд ===[]");
            for (var name in cmdList) Log.info("[#ffff00]" + name + "[] - " + cmdList[name].desc);
            return "[#00ff00]Список выведен выше.[]";
        }
    });
});
